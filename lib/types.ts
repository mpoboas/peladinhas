import type { RecordModel } from "pocketbase";

export type SessionType = "livre" | "torneio";

export interface Member extends RecordModel {
  name: string;
  jersey_number?: number;
}

export interface Session extends RecordModel {
  date: string;
  location: string;
  type: SessionType;
  notes?: string;
  label?: string;
  cost?: number;
}

export interface SessionTeam extends RecordModel {
  session: string;
  name: string;
  expand?: {
    session?: Session;
  };
}

export interface SessionAttendance extends RecordModel {
  session: string;
  member: string;
  team?: string;
  expand?: {
    session?: Session;
    member?: Member;
    team?: SessionTeam;
  };
}

export interface Game extends RecordModel {
  session: string;
  team_a: string;
  team_b: string;
  goals_a: number;
  goals_b: number;
  notes?: string;
  game_order?: number;
  expand?: {
    session?: Session;
    team_a?: SessionTeam;
    team_b?: SessionTeam;
  };
}

export interface StandingRow {
  team: SessionTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface SessionWithDetails {
  session: Session;
  teams: SessionTeam[];
  attendance: SessionAttendance[];
  games: Game[];
  attendanceCount: number;
}

export interface MemberWithPresence extends Member {
  sessionCount: number;
}

export interface HomeStats {
  totalSessions: number;
  totalTournaments: number;
  totalMembers: number;
  lastSession: Session | null;
}
