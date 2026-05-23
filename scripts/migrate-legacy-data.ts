/**
 * One-off migration from scripts/legacy-data.json into PocketBase.
 * Requires POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in .env.local
 */
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import PocketBase from "pocketbase";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { calculateStandings } from "../lib/standings";
import type { Game, SessionTeam } from "../lib/types";

function getPbUrl(): string {
  const raw =
    process.env.POCKETBASE_URL ??
    process.env.NEXT_PUBLIC_POCKETBASE_URL ??
    "http://127.0.0.1:8090";
  return raw.replace(/\/+$/, "");
}

const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;

async function assertReachable(baseUrl: string) {
  const healthUrl = `${baseUrl}/api/health`;
  try {
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const hint =
      baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")
        ? "Corre o PocketBase local: `./pocketbase serve` (porta 8090)."
        : "Confirma que o servidor está online e o DNS/domínio está correcto.";
    console.error(`
Não foi possível ligar ao PocketBase em:
  ${baseUrl}

Erro: ${msg}

${hint}

Para migração local, em .env.local:
  NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
  POCKETBASE_URL=http://127.0.0.1:8090
`);
    process.exit(1);
  }
}

async function authenticate(pb: PocketBase) {
  const identity = email!;
  const pass = password!;

  const attempts: { label: string; run: () => Promise<unknown> }[] = [
    {
      label: "_superusers",
      run: () => pb.collection("_superusers").authWithPassword(identity, pass),
    },
    {
      label: "users",
      run: () => pb.collection("users").authWithPassword(identity, pass),
    },
  ];

  const legacyAdmins = (
    pb as PocketBase & {
      admins?: { authWithPassword: (e: string, p: string) => Promise<void> };
    }
  ).admins;
  if (typeof legacyAdmins?.authWithPassword === "function") {
    attempts.splice(1, 0, {
      label: "admins (legacy)",
      run: () => legacyAdmins.authWithPassword(identity, pass),
    });
  }

  const errors: string[] = [];
  for (const { label, run } of attempts) {
    try {
      pb.authStore.clear();
      await run();
      console.log(`Autenticado via ${label}.`);
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${label}: ${message}`);
    }
  }

  console.error(
    "Falha na autenticação. Usa email/password de superuser (Admin UI) ou de um user em `users`.\n" +
      errors.map((e) => `  - ${e}`).join("\n"),
  );
  process.exit(1);
}

interface LegacyMember {
  name: string;
  jersey_number: number | null;
}

interface LegacySession {
  key: string;
  date: string;
  location: string;
  type: "livre" | "torneio";
  label?: string;
  cost?: number;
  notes?: string;
}

interface LegacyGame {
  order: number;
  team_a: string;
  team_b: string;
  goals_a: number;
  goals_b: number;
  notes?: string;
}

interface LegacyTournament {
  teams: string[];
  games: LegacyGame[];
  attendance?: { member: string; team: string }[];
}

interface LegacyData {
  members: LegacyMember[];
  sessions: LegacySession[];
  tournaments: Record<string, LegacyTournament>;
}

async function main() {
  if (!email || !password) {
    console.error(
      "Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in .env.local",
    );
    process.exit(1);
  }

  const url = getPbUrl();
  console.log(`PocketBase: ${url}`);
  await assertReachable(url);

  const pb = new PocketBase(url);
  await authenticate(pb);

  const data: LegacyData = JSON.parse(
    readFileSync(join(__dirname, "legacy-data.json"), "utf-8"),
  );

  const memberIds = new Map<string, string>();
  console.log("Migrating members…");
  for (const m of data.members) {
    const rec = await pb.collection("members").create({
      name: m.name,
      jersey_number: m.jersey_number ?? undefined,
    });
    memberIds.set(m.name, rec.id);
  }

  const sessionIds = new Map<string, string>();
  console.log("Migrating sessions…");
  for (const s of data.sessions) {
    const rec = await pb.collection("sessions").create({
      date: s.date,
      location: s.location,
      type: s.type,
      label: s.label ?? "",
      notes: s.notes ?? "",
      cost: s.cost ?? null,
    });
    sessionIds.set(s.key, rec.id);
  }

  for (const [sessionKey, tournament] of Object.entries(data.tournaments)) {
    const sessionId = sessionIds.get(sessionKey);
    if (!sessionId) {
      console.warn(`Session key not found: ${sessionKey}`);
      continue;
    }

    console.log(`Tournament data for ${sessionKey}…`);
    const teamIds = new Map<string, string>();
    for (const name of tournament.teams) {
      const t = await pb.collection("session_teams").create({
        session: sessionId,
        name,
      });
      teamIds.set(name, t.id);
    }

    if (tournament.attendance) {
      for (const row of tournament.attendance) {
        const memberId = memberIds.get(row.member);
        const teamId = teamIds.get(row.team);
        if (!memberId) {
          console.warn(`Member not found: ${row.member}`);
          continue;
        }
        await pb.collection("session_attendance").create({
          session: sessionId,
          member: memberId,
          team: teamId ?? "",
        });
      }
    }

    for (const g of tournament.games) {
      const teamA = teamIds.get(g.team_a);
      const teamB = teamIds.get(g.team_b);
      if (!teamA || !teamB) {
        console.warn(`Skipping game ${g.order}: unknown team`);
        continue;
      }
      await pb.collection("games").create({
        session: sessionId,
        team_a: teamA,
        team_b: teamB,
        goals_a: g.goals_a,
        goals_b: g.goals_b,
        notes: g.notes ?? "",
        game_order: g.order,
      });
    }
  }

  const mai26Id = sessionIds.get("mai26");
  if (mai26Id) {
    const teams = await pb
      .collection("session_teams")
      .getFullList<SessionTeam>({ filter: `session = "${mai26Id}"` });
    const games = await pb
      .collection("games")
      .getFullList<Game>({
        filter: `session = "${mai26Id}"`,
        expand: "team_a,team_b",
      });
    const standings = calculateStandings(teams, games);
    const champion = standings[0];
    console.log(
      "\nMai'26 standings check — champion:",
      champion?.team.name,
      "pts:",
      champion?.points,
    );
    if (champion?.team.name !== "024" || champion?.points !== 12) {
      console.warn("⚠ Expected 024 with 12 pts — verify data");
    } else {
      console.log("✓ Standings match HTML");
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
