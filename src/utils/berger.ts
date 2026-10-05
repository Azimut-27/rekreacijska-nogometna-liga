import { Match } from '../types';

export interface BergerOptions {
  leagueId: string;
  seasonId: string;
  isDoubleRound: boolean;
  startDate: string; // YYYY-MM-DD
  daysBetweenRounds?: number; // default 7 (weekly)
  matchTimes?: string[]; // e.g. ["17:00", "18:00", "19:00", "20:00"]
  venues?: string[]; // default venues pool
}

export interface GeneratedRoundInfo {
  round: number;
  matches: Omit<Match, 'id'>[];
  byeTeamId?: string; // Ekipa s prostim terminom
}

/**
 * Berger Round-Robin schedule generator (Enokrožni in dvokrožni Bergerjev sistem)
 * Handles odd numbers of teams with a BYE / "Prosta ekipa" slot.
 */
export function generateBergerSchedule(
  teamIds: string[],
  options: BergerOptions
): { matches: Omit<Match, 'id'>[]; byeTeamsByRound: Record<number, string> } {
  const {
    leagueId,
    seasonId,
    isDoubleRound,
    startDate,
    daysBetweenRounds = 7,
    matchTimes = ['17:00', '18:15', '19:30', '20:45'],
    venues = ['Športni park Kodeljevo', 'Dvorana Tivoli', 'ŠRC Stožice', 'Baza Črnuče']
  } = options;

  let teams = [...teamIds];
  const isOdd = teams.length % 2 !== 0;
  const BYE_ID = '__BYE__';

  if (isOdd) {
    teams.push(BYE_ID);
  }

  const numTeams = teams.length;
  const numRoundsSingle = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const rounds: GeneratedRoundInfo[] = [];
  const byeTeamsByRound: Record<number, string> = {};

  const baseDate = new Date(startDate);

  // Standard round-robin circle algorithm
  for (let r = 0; r < numRoundsSingle; r++) {
    const roundNumber = r + 1;
    const roundMatches: Omit<Match, 'id'>[] = [];
    let byeTeamId: string | undefined = undefined;

    const roundDate = new Date(baseDate);
    roundDate.setDate(roundDate.getDate() + r * daysBetweenRounds);
    const dateStr = roundDate.toISOString().split('T')[0];

    for (let m = 0; m < matchesPerRound; m++) {
      let home = (r + m) % (numTeams - 1);
      let away = (numTeams - 1 - m + r) % (numTeams - 1);

      if (m === 0) {
        away = numTeams - 1;
      }

      let homeTeamId = teams[home];
      let awayTeamId = teams[away];

      // Alternate home/away for the fixed team
      if (m === 0 && r % 2 === 1) {
        const temp = homeTeamId;
        homeTeamId = awayTeamId;
        awayTeamId = temp;
      }

      // Check for BYE
      if (homeTeamId === BYE_ID) {
        byeTeamId = awayTeamId;
        continue;
      }
      if (awayTeamId === BYE_ID) {
        byeTeamId = homeTeamId;
        continue;
      }

      const time = matchTimes[roundMatches.length % matchTimes.length];
      const venue = venues[roundMatches.length % venues.length];

      roundMatches.push({
        seasonId,
        leagueId,
        round: roundNumber,
        homeTeamId,
        awayTeamId,
        date: dateStr,
        time,
        venue,
        status: 'scheduled',
        events: []
      });
    }

    if (byeTeamId) {
      byeTeamsByRound[roundNumber] = byeTeamId;
    }

    rounds.push({
      round: roundNumber,
      matches: roundMatches,
      byeTeamId
    });
  }

  // If double round, duplicate with inverted home/away
  if (isDoubleRound) {
    for (let r = 0; r < numRoundsSingle; r++) {
      const secondRoundNum = numRoundsSingle + r + 1;
      const firstRound = rounds[r];
      const roundMatches: Omit<Match, 'id'>[] = [];

      const roundDate = new Date(baseDate);
      roundDate.setDate(roundDate.getDate() + (numRoundsSingle + r) * daysBetweenRounds);
      const dateStr = roundDate.toISOString().split('T')[0];

      firstRound.matches.forEach((m, idx) => {
        roundMatches.push({
          ...m,
          round: secondRoundNum,
          homeTeamId: m.awayTeamId, // reversed
          awayTeamId: m.homeTeamId, // reversed
          date: dateStr,
          time: matchTimes[idx % matchTimes.length],
          venue: venues[(idx + 2) % venues.length],
          status: 'scheduled',
          events: []
        });
      });

      if (firstRound.byeTeamId) {
        byeTeamsByRound[secondRoundNum] = firstRound.byeTeamId;
      }

      rounds.push({
        round: secondRoundNum,
        matches: roundMatches,
        byeTeamId: firstRound.byeTeamId
      });
    }
  }

  const allMatches = rounds.flatMap(r => r.matches);
  return { matches: allMatches, byeTeamsByRound };
}
