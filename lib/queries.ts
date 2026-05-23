import { parseSessionDate } from "./dates";
import { createServerPocketBase } from "./pocketbase";
import { isCancelledSession } from "./session";
import type {
  Game,
  HomeStats,
  Member,
  MemberWithPresence,
  Session,
  SessionAttendance,
  SessionTeam,
  SessionWithDetails,
} from "./types";

function pb() {
  return createServerPocketBase();
}

export const SESSIONS_PAGE_SIZE = 20;

export type SessionsPage = {
  items: Session[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
};

export async function getSessionsPaginated(
  page: number,
  perPage = SESSIONS_PAGE_SIZE,
  options: { includeCancelled?: boolean } = {},
): Promise<SessionsPage> {
  try {
    const list = await pb()
      .collection("sessions")
      .getList<Session>(page, perPage, { sort: "-date" });
    let items = list.items;
    if (!options.includeCancelled) {
      items = items.filter((s) => !isCancelledSession(s.notes));
    }
    return {
      items,
      page: list.page,
      totalPages: list.totalPages,
      totalItems: list.totalItems,
      hasMore: list.page < list.totalPages,
    };
  } catch {
    return {
      items: [],
      page: 1,
      totalPages: 0,
      totalItems: 0,
      hasMore: false,
    };
  }
}

export async function getSessions(limit?: number): Promise<Session[]> {
  const { items } = await getSessionsPaginated(1, limit ?? 200, {
    includeCancelled: false,
  });
  return items;
}

export async function getAllSessionsIncludingCancelled(): Promise<Session[]> {
  const { items } = await getSessionsPaginated(1, 200, {
    includeCancelled: true,
  });
  return items;
}

/** Locais únicos já usados em sessões (ordenados A–Z). */
export async function getSessionLocations(): Promise<string[]> {
  try {
    const sessions = await pb()
      .collection("sessions")
      .getFullList<Session>({ fields: "location", sort: "location" });
    const seen = new Set<string>();
    const locations: string[] = [];
    for (const s of sessions) {
      const loc = s.location?.trim();
      if (loc && !seen.has(loc)) {
        seen.add(loc);
        locations.push(loc);
      }
    }
    return locations.sort((a, b) => a.localeCompare(b, "pt"));
  } catch {
    return [];
  }
}

/** Número sequencial por ordem de criação (1 = primeiro registo na coleção). */
export async function getSessionRecordNumbers(): Promise<Record<string, number>> {
  try {
    const all = await pb()
      .collection("sessions")
      .getFullList<Session>({ sort: "created" });
    const map: Record<string, number> = {};
    all.forEach((s, i) => {
      map[s.id] = i + 1;
    });
    return map;
  } catch {
    return {};
  }
}

export async function getSessionById(id: string): Promise<Session | null> {
  try {
    return await pb().collection("sessions").getOne<Session>(id);
  } catch {
    return null;
  }
}

export async function getSessionWithDetails(
  id: string,
): Promise<SessionWithDetails | null> {
  try {
    const session = await pb().collection("sessions").getOne<Session>(id);
    const [teams, attendance, games] = await Promise.all([
      pb()
        .collection("session_teams")
        .getFullList<SessionTeam>({ filter: `session = "${id}"`, sort: "name" }),
      pb()
        .collection("session_attendance")
        .getFullList<SessionAttendance>({
          filter: `session = "${id}"`,
          expand: "member,team",
        }),
      pb()
        .collection("games")
        .getFullList<Game>({
          filter: `session = "${id}"`,
          sort: "game_order,created",
          expand: "team_a,team_b",
        }),
    ]);
    return {
      session,
      teams,
      attendance,
      games,
      attendanceCount: attendance.length,
    };
  } catch {
    return null;
  }
}

export async function getAttendanceCountForSession(
  sessionId: string,
): Promise<number> {
  try {
    const list = await pb()
      .collection("session_attendance")
      .getList(1, 1, { filter: `session = "${sessionId}"` });
    return list.totalItems;
  } catch {
    return 0;
  }
}

export async function getAttendanceCountsBySession(
  sessionIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  await Promise.all(
    sessionIds.map(async (id) => {
      counts[id] = await getAttendanceCountForSession(id);
    }),
  );
  return counts;
}

export async function getMembers(): Promise<Member[]> {
  try {
    return await pb()
      .collection("members")
      .getFullList<Member>({ sort: "name" });
  } catch {
    return [];
  }
}

export async function getMembersWithPresence(): Promise<MemberWithPresence[]> {
  try {
    const [members, attendance] = await Promise.all([
      pb().collection("members").getFullList<Member>({ sort: "name" }),
      pb()
        .collection("session_attendance")
        .getFullList<SessionAttendance>({ fields: "member,session" }),
    ]);

    const sessionIdsByMember = new Map<string, Set<string>>();
    for (const row of attendance) {
      const memberId =
        typeof row.member === "string" ? row.member : row.member;
      if (!sessionIdsByMember.has(memberId)) {
        sessionIdsByMember.set(memberId, new Set());
      }
      sessionIdsByMember.get(memberId)!.add(
        typeof row.session === "string" ? row.session : row.session,
      );
    }

    return members
      .map((m) => ({
        ...m,
        sessionCount: sessionIdsByMember.get(m.id)?.size ?? 0,
      }))
      .sort((a, b) => b.sessionCount - a.sessionCount || a.name.localeCompare(b.name, "pt"));
  } catch {
    return [];
  }
}

export async function getHomeStats(): Promise<HomeStats> {
  try {
    const [sessions, members] = await Promise.all([
      getAllSessionsIncludingCancelled(),
      getMembers(),
    ]);
    const active = sessions.filter((s) => !isCancelledSession(s.notes));
    const tournaments = active.filter((s) => s.type === "torneio");
    const lastSession =
      active.find((s) => parseSessionDate(s.date) != null) ?? null;
    return {
      totalSessions: active.length,
      totalTournaments: tournaments.length,
      totalMembers: members.length,
      lastSession,
    };
  } catch {
    return {
      totalSessions: 0,
      totalTournaments: 0,
      totalMembers: 0,
      lastSession: null,
    };
  }
}
