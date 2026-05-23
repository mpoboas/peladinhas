"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedPocketBase } from "@/lib/auth";
import {
  normalizeSessionLabel,
} from "@/lib/session";
import type { SessionType } from "@/lib/types";

async function authPb() {
  return getAuthenticatedPocketBase();
}

export async function createSession(formData: FormData) {
  const pb = await authPb();
  const record = await pb.collection("sessions").create({
    date: formData.get("date"),
    location: formData.get("location"),
    type: formData.get("type") as SessionType,
    notes: formData.get("notes") || "",
    label: normalizeSessionLabel(formData.get("label")),
    cost: formData.get("cost") ? Number(formData.get("cost")) : null,
  });
  revalidatePath("/");
  revalidatePath("/sessions");
  redirect(`/admin/sessions/${record.id}/edit`);
}

export async function updateSession(sessionId: string, formData: FormData) {
  const pb = await authPb();
  await pb.collection("sessions").update(sessionId, {
    date: formData.get("date"),
    location: formData.get("location"),
    type: formData.get("type") as SessionType,
    notes: formData.get("notes") || "",
    label: normalizeSessionLabel(formData.get("label")),
    cost: formData.get("cost") ? Number(formData.get("cost")) : null,
  });
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/sessions");
  revalidatePath("/");
}

export async function deleteSession(sessionId: string) {
  const pb = await authPb();
  const teams = await pb.collection("session_teams").getFullList({
    filter: `session = "${sessionId}"`,
  });
  const teamIds = teams.map((t) => t.id);
  if (teamIds.length) {
    const teamFilter = teamIds.map((id) => `team = "${id}"`).join(" || ");
    const attendance = await pb
      .collection("session_attendance")
      .getFullList({ filter: teamFilter });
    for (const a of attendance) {
      await pb.collection("session_attendance").delete(a.id);
    }
    const gameFilter = teamIds
      .flatMap((id) => [`team_a = "${id}"`, `team_b = "${id}"`])
      .join(" || ");
    const games = await pb
      .collection("games")
      .getFullList({ filter: gameFilter });
    for (const g of games) {
      await pb.collection("games").delete(g.id);
    }
    for (const t of teams) {
      await pb.collection("session_teams").delete(t.id);
    }
  }
  const restAttendance = await pb
    .collection("session_attendance")
    .getFullList({ filter: `session = "${sessionId}"` });
  for (const a of restAttendance) {
    await pb.collection("session_attendance").delete(a.id);
  }
  await pb.collection("sessions").delete(sessionId);
  revalidatePath("/");
  revalidatePath("/sessions");
  redirect("/admin");
}

export async function createTeam(sessionId: string, name: string) {
  const pb = await authPb();
  await pb.collection("session_teams").create({ session: sessionId, name });
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
}

export async function deleteTeam(teamId: string, sessionId: string) {
  const pb = await authPb();
  const attendance = await pb
    .collection("session_attendance")
    .getFullList({ filter: `team = "${teamId}"` });
  for (const a of attendance) {
    await pb.collection("session_attendance").update(a.id, { team: "" });
  }
  await pb.collection("session_teams").delete(teamId);
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
}

export async function addAttendance(
  sessionId: string,
  memberId: string,
  teamId?: string,
) {
  const pb = await authPb();
  await pb.collection("session_attendance").create({
    session: sessionId,
    member: memberId,
    team: teamId || "",
  });
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/members");
}

export async function updateAttendance(
  attendanceId: string,
  sessionId: string,
  teamId: string | null,
) {
  const pb = await authPb();
  await pb.collection("session_attendance").update(attendanceId, {
    team: teamId || "",
  });
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
}

export async function removeAttendance(attendanceId: string, sessionId: string) {
  const pb = await authPb();
  await pb.collection("session_attendance").delete(attendanceId);
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/members");
}

export async function createGame(sessionId: string, formData: FormData) {
  const pb = await authPb();
  const existing = await pb.collection("games").getFullList({
    filter: `session = "${sessionId}"`,
  });
  const nextOrder =
    existing.reduce(
      (max, g) => Math.max(max, (g.game_order as number | undefined) ?? 0),
      0,
    ) + 1;

  await pb.collection("games").create({
    session: sessionId,
    team_a: formData.get("team_a"),
    team_b: formData.get("team_b"),
    goals_a: Number(formData.get("goals_a")),
    goals_b: Number(formData.get("goals_b")),
    notes: formData.get("notes") || "",
    game_order: nextOrder,
  });
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
}

export async function updateGame(gameId: string, sessionId: string, formData: FormData) {
  const pb = await authPb();
  await pb.collection("games").update(gameId, {
    team_a: formData.get("team_a"),
    team_b: formData.get("team_b"),
    goals_a: Number(formData.get("goals_a")),
    goals_b: Number(formData.get("goals_b")),
    notes: formData.get("notes") || "",
    game_order: formData.get("game_order")
      ? Number(formData.get("game_order"))
      : null,
  });
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
}

export async function deleteGame(gameId: string, sessionId: string) {
  const pb = await authPb();
  await pb.collection("games").delete(gameId);
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
}

export async function reorderGames(sessionId: string, orderedGameIds: string[]) {
  const pb = await authPb();
  await Promise.all(
    orderedGameIds.map((id, index) =>
      pb.collection("games").update(id, { game_order: index + 1 }),
    ),
  );
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
}

export async function createMember(formData: FormData) {
  const pb = await authPb();
  await pb.collection("members").create({
    name: formData.get("name"),
    jersey_number: formData.get("jersey_number")
      ? Number(formData.get("jersey_number"))
      : null,
  });
  revalidatePath("/members");
  revalidatePath("/");
}

/** Cria membro e marca presença na sessão atual. */
export async function createMemberAndAttendance(
  sessionId: string,
  formData: FormData,
  teamId?: string,
) {
  const pb = await authPb();
  const member = await pb.collection("members").create({
    name: formData.get("name"),
    jersey_number: formData.get("jersey_number")
      ? Number(formData.get("jersey_number"))
      : null,
  });
  await pb.collection("session_attendance").create({
    session: sessionId,
    member: member.id,
    team: teamId || "",
  });
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/members");
  revalidatePath("/");
}

export async function updateMember(memberId: string, formData: FormData) {
  const pb = await authPb();
  await pb.collection("members").update(memberId, {
    name: formData.get("name"),
    jersey_number: formData.get("jersey_number")
      ? Number(formData.get("jersey_number"))
      : null,
  });
  revalidatePath("/members");
  revalidatePath("/");
}

export async function deleteMember(memberId: string) {
  const pb = await authPb();
  const attendance = await pb
    .collection("session_attendance")
    .getFullList({ filter: `member = "${memberId}"` });
  for (const a of attendance) {
    await pb.collection("session_attendance").delete(a.id);
  }
  await pb.collection("members").delete(memberId);
  revalidatePath("/members");
  revalidatePath("/");
}
