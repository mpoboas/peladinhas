import type { SessionType } from "./types";

export type SessionStoryStandingRow = {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type SessionStoryGameRow = {
  order: number;
  teamA: string;
  teamB: string;
  goalsA: number;
  goalsB: number;
};

export type SessionStoryData = {
  title: string;
  location: string;
  date: string;
  type: SessionType;
  attendanceCount: number;
  gamesCount: number;
  standings: SessionStoryStandingRow[];
  games: SessionStoryGameRow[];
};

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

/** Altura base estimada do bloco superior (sem escala). */
export const STORY_TOP_BLOCK_HEIGHT = 52 + 24 + 112 + 36 + 28 * 2 + 46 + 16 + 26 + 6 + 24 + 18 + 32;
