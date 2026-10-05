export type UserRole = 'admin' | 'editor' | 'representative' | 'public';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  teamId?: string; // If representative
}

export interface Season {
  id: string;
  name: string; // e.g. "2025/2026"
  isActive: boolean;
  isArchived: boolean;
  startDate: string;
  endDate: string;
}

export interface League {
  id: string;
  name: string; // "1. liga", "2. liga", "3. liga"
  shortName: string; // "1. LIGA"
  description: string;
  targetTeams: number; // 9, 8, 9
  seasonId: string;
  level: number; // 1, 2, 3
}

export type PlayerPosition = 'Vratar' | 'Branilec' | 'Vezist' | 'Napadalec';

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position: PlayerPosition;
  birthYear?: number;
  isActive: boolean;
  registrationNumber?: string;
}

export type MatchStatus = 'scheduled' | 'in_progress' | 'finished' | 'postponed' | 'cancelled';

export type EventType = 'goal' | 'penalty_goal' | 'own_goal' | 'yellow_card' | 'red_card';

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  minute: number;
  type: EventType;
  note?: string;
}

export interface Match {
  id: string;
  seasonId: string;
  leagueId: string;
  round: number; // Krog
  homeTeamId: string;
  awayTeamId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string;
  status: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  homeHalftimeScore?: number | null;
  awayHalftimeScore?: number | null;
  events: MatchEvent[];
  organizerNotes?: string;
  referee?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  leagueId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  venue: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  foundedYear?: number;
  description?: string;
}

export interface StandingsRow {
  rank: number;
  teamId: string;
  team: Team;
  played: number; // OT
  won: number;    // Z
  drawn: number;  // N
  lost: number;   // P
  goalsFor: number; // DG
  goalsAgainst: number; // PG
  goalDifference: number; // GR
  points: number; // TOČ
  form: ('W' | 'D' | 'L')[]; // last 5
  yellowCards: number;
  redCards: number;
  disciplinaryPoints: number; // yellow=1, red=3
}

export interface TopScorer {
  rank: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamShort: string;
  teamColor: string;
  goals: number;
  penaltyGoals: number;
  matchesPlayed: number;
  averagePerMatch: number;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  date: string; // YYYY-MM-DD
  isPinned: boolean;
  status: 'published' | 'draft';
  author: string;
}

export interface RuleChapter {
  id: string;
  title: string;
  order: number;
  content: string;
}

export type TieBreakerCriterion = 'points' | 'head_to_head' | 'goal_diff' | 'goals_for' | 'fair_play';
