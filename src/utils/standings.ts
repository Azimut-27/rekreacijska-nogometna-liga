import { Match, Team, Player, StandingsRow, TopScorer } from '../types';

/**
 * Calculates standings table for a specific league
 */
export function calculateStandings(
  teams: Team[],
  matches: Match[],
  leagueId: string
): StandingsRow[] {
  const leagueTeams = teams.filter(t => t.leagueId === leagueId && t.isActive);
  const teamMap = new Map<string, Team>(leagueTeams.map(t => [t.id, t]));

  // Only consider finished matches in this league with valid scores
  const finishedMatches = matches.filter(
    m => m.leagueId === leagueId &&
         m.status === 'finished' &&
         m.homeScore !== null &&
         m.homeScore !== undefined &&
         m.awayScore !== null &&
         m.awayScore !== undefined
  );

  // Initialize stats row for each team
  const stats: Record<string, StandingsRow> = {};
  for (const team of leagueTeams) {
    stats[team.id] = {
      rank: 0,
      teamId: team.id,
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
      yellowCards: 0,
      redCards: 0,
      disciplinaryPoints: 0
    };
  }

  // Count cards from match events
  for (const match of finishedMatches) {
    if (match.events) {
      for (const ev of match.events) {
        if (stats[ev.teamId]) {
          if (ev.type === 'yellow_card') {
            stats[ev.teamId].yellowCards += 1;
            stats[ev.teamId].disciplinaryPoints += 1;
          } else if (ev.type === 'red_card') {
            stats[ev.teamId].redCards += 1;
            stats[ev.teamId].disciplinaryPoints += 3;
          }
        }
      }
    }
  }

  // Sort finished matches by round and date for chronological form calculation
  const sortedMatches = [...finishedMatches].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.date.localeCompare(b.date);
  });

  for (const match of sortedMatches) {
    const homeId = match.homeTeamId;
    const awayId = match.awayTeamId;
    const hScore = match.homeScore!;
    const aScore = match.awayScore!;

    const homeRow = stats[homeId];
    const awayRow = stats[awayId];

    if (!homeRow || !awayRow) continue;

    homeRow.played += 1;
    awayRow.played += 1;

    homeRow.goalsFor += hScore;
    homeRow.goalsAgainst += aScore;
    awayRow.goalsFor += aScore;
    awayRow.goalsAgainst += hScore;

    if (hScore > aScore) {
      // Home won
      homeRow.won += 1;
      homeRow.points += 3;
      homeRow.form.push('W');

      awayRow.lost += 1;
      awayRow.form.push('L');
    } else if (hScore === aScore) {
      // Draw
      homeRow.drawn += 1;
      homeRow.points += 1;
      homeRow.form.push('D');

      awayRow.drawn += 1;
      awayRow.points += 1;
      awayRow.form.push('D');
    } else {
      // Away won
      awayRow.won += 1;
      awayRow.points += 3;
      awayRow.form.push('W');

      homeRow.lost += 1;
      homeRow.form.push('L');
    }
  }

  // Calculate goal differences and keep last 5 form elements
  for (const row of Object.values(stats)) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
    row.form = row.form.slice(-5);
  }

  // Head-to-head comparison helper between two teams
  const getHeadToHeadScore = (teamAId: string, teamBId: string) => {
    const h2h = finishedMatches.filter(
      m => (m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
           (m.homeTeamId === teamBId && m.awayTeamId === teamAId)
    );

    let pointsA = 0;
    let pointsB = 0;
    let diffA = 0;
    let goalsA = 0;
    let goalsB = 0;

    for (const m of h2h) {
      const hScore = m.homeScore!;
      const aScore = m.awayScore!;
      const isAHome = m.homeTeamId === teamAId;

      const scoreA = isAHome ? hScore : aScore;
      const scoreB = isAHome ? aScore : hScore;

      goalsA += scoreA;
      goalsB += scoreB;
      diffA += (scoreA - scoreB);

      if (scoreA > scoreB) pointsA += 3;
      else if (scoreA === scoreB) { pointsA += 1; pointsB += 1; }
      else pointsB += 3;
    }

    return { pointsA, pointsB, diffA, goalsA, goalsB, matchesCount: h2h.length };
  };

  // Sort rows based on required criteria:
  // 1. Points
  // 2. Head-to-head matches (if tied and matches played)
  // 3. Goal difference
  // 4. Goals scored
  // 5. Fair play (fewer disciplinary points)
  const rows = Object.values(stats);

  rows.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // 2. Head-to-head
    const h2h = getHeadToHeadScore(a.teamId, b.teamId);
    if (h2h.matchesCount > 0 && h2h.pointsA !== h2h.pointsB) {
      return h2h.pointsB - h2h.pointsA;
    }
    if (h2h.matchesCount > 0 && h2h.diffA !== 0) {
      return -h2h.diffA;
    }

    // 3. Goal difference
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    // 4. Goals scored
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // 5. Fair play (fewer disciplinary points is better)
    if (a.disciplinaryPoints !== b.disciplinaryPoints) {
      return a.disciplinaryPoints - b.disciplinaryPoints;
    }

    // Alphabetical fallback
    return a.team.name.localeCompare(b.team.name);
  });

  // Assign ranks
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });

  return rows;
}

/**
 * Calculates top scorers for a specific league from match events
 */
export function calculateTopScorers(
  teams: Team[],
  players: Player[],
  matches: Match[],
  leagueId: string
): TopScorer[] {
  const leagueTeams = teams.filter(t => t.leagueId === leagueId);
  const teamIds = new Set(leagueTeams.map(t => t.id));
  const teamMap = new Map(leagueTeams.map(t => [t.id, t]));
  const playerMap = new Map(players.map(p => [p.id, p]));

  // Track goals per player
  const playerStats: Record<string, {
    playerId: string;
    goals: number;
    penaltyGoals: number;
    teamId: string;
  }> = {};

  const leagueMatches = matches.filter(m => m.leagueId === leagueId && m.status === 'finished');

  for (const match of leagueMatches) {
    if (!match.events) continue;
    for (const ev of match.events) {
      if ((ev.type === 'goal' || ev.type === 'penalty_goal') && teamIds.has(ev.teamId)) {
        if (!playerStats[ev.playerId]) {
          playerStats[ev.playerId] = {
            playerId: ev.playerId,
            goals: 0,
            penaltyGoals: 0,
            teamId: ev.teamId
          };
        }
        playerStats[ev.playerId].goals += 1;
        if (ev.type === 'penalty_goal') {
          playerStats[ev.playerId].penaltyGoals += 1;
        }
      }
    }
  }

  // Count finished matches per team to estimate matches played
  const teamMatchesCount: Record<string, number> = {};
  for (const m of leagueMatches) {
    teamMatchesCount[m.homeTeamId] = (teamMatchesCount[m.homeTeamId] || 0) + 1;
    teamMatchesCount[m.awayTeamId] = (teamMatchesCount[m.awayTeamId] || 0) + 1;
  }

  const scorers: TopScorer[] = Object.values(playerStats).map(stat => {
    const player = playerMap.get(stat.playerId);
    const team = teamMap.get(stat.teamId);
    const matchesPlayed = team ? (teamMatchesCount[team.id] || 1) : 1;
    const avg = matchesPlayed > 0 ? stat.goals / matchesPlayed : stat.goals;

    return {
      rank: 0,
      playerId: stat.playerId,
      playerName: player ? `${player.firstName} ${player.lastName}` : 'Neznani igralec',
      teamId: stat.teamId,
      teamName: team?.name || 'Ekipa',
      teamShort: team?.shortName || 'EKP',
      teamColor: team?.primaryColor || '#10b981',
      goals: stat.goals,
      penaltyGoals: stat.penaltyGoals,
      matchesPlayed,
      averagePerMatch: parseFloat(avg.toFixed(2))
    };
  });

  // Sort scorers:
  // 1. Most goals
  // 2. Fewer penalty goals (more open play goals)
  // 3. Higher average (fewer matches played for same goals)
  // 4. Alphabetical
  scorers.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (a.penaltyGoals !== b.penaltyGoals) return a.penaltyGoals - b.penaltyGoals;
    if (b.averagePerMatch !== a.averagePerMatch) return b.averagePerMatch - a.averagePerMatch;
    return a.playerName.localeCompare(b.playerName);
  });

  // Set rank (handle ties gracefully)
  let currentRank = 1;
  scorers.forEach((scorer, idx) => {
    if (idx > 0 && scorer.goals === scorers[idx - 1].goals) {
      scorer.rank = scorers[idx - 1].rank;
    } else {
      scorer.rank = currentRank;
    }
    currentRank++;
  });

  return scorers;
}
