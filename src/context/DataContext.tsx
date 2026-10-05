import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Season,
  League,
  Team,
  Player,
  Match,
  MatchEvent,
  Announcement,
  RuleChapter,
  MatchStatus
} from '../types';
import {
  INITIAL_SEASON,
  INITIAL_LEAGUES,
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_RULES
} from '../data/initialData';
import { generateBergerSchedule } from '../utils/berger';
import { FullBackupData } from '../utils/exportImport';

export interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DataContextType {
  season: Season;
  leagues: League[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  announcements: Announcement[];
  rules: RuleChapter[];
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Leagues
  addLeague: (league: Omit<League, 'id'>) => boolean;
  updateLeague: (id: string, updates: Partial<League>) => boolean;
  deleteLeague: (id: string) => boolean;

  // Teams
  addTeam: (team: Omit<Team, 'id'>) => boolean;
  updateTeam: (id: string, updates: Partial<Team>) => boolean;
  deleteTeam: (id: string) => boolean;

  // Players
  addPlayer: (player: Omit<Player, 'id'>) => boolean;
  updatePlayer: (id: string, updates: Partial<Player>) => boolean;
  deletePlayer: (id: string) => boolean;
  transferPlayer: (playerId: string, targetTeamId: string) => boolean;

  // Matches & Scheduling
  generateScheduleForLeague: (leagueId: string, isDoubleRound: boolean, startDate: string) => boolean;
  addMatch: (match: Omit<Match, 'id'>) => boolean;
  updateMatch: (id: string, updates: Partial<Match>) => boolean;
  deleteMatch: (id: string) => boolean;
  updateMatchScore: (
    matchId: string,
    homeScore: number,
    awayScore: number,
    homeHalftime?: number | null,
    awayHalftime?: number | null,
    status?: MatchStatus,
    notes?: string
  ) => boolean;
  addMatchEvent: (matchId: string, event: Omit<MatchEvent, 'id' | 'matchId'>) => boolean;
  deleteMatchEvent: (matchId: string, eventId: string) => boolean;

  // Announcements
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => boolean;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => boolean;
  deleteAnnouncement: (id: string) => boolean;

  // Rules
  updateRuleChapter: (id: string, content: string, title?: string) => boolean;

  // Season & Backup
  archiveSeason: () => void;
  createSeason: (name: string, startDate: string, endDate: string) => void;
  resetToDemoData: () => void;
  importBackup: (backup: FullBackupData) => boolean;
  importTeamsFromList: (newTeams: any[]) => number;
  importPlayersFromList: (newPlayers: any[]) => number;
  importMatchesFromList: (newMatches: any[]) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SEASON: 'mrl_season_v2',
  LEAGUES: 'mrl_leagues_v2',
  TEAMS: 'mrl_teams_v2',
  PLAYERS: 'mrl_players_v2',
  MATCHES: 'mrl_matches_v2',
  ANNOUNCEMENTS: 'mrl_announcements_v2',
  RULES: 'mrl_rules_v2',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to load or fallback
  const loadState = <T,>(key: string, fallback: T): T => {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const [season, setSeason] = useState<Season>(() => loadState(STORAGE_KEYS.SEASON, INITIAL_SEASON));
  const [leagues, setLeagues] = useState<League[]>(() => loadState(STORAGE_KEYS.LEAGUES, INITIAL_LEAGUES));
  const [teams, setTeams] = useState<Team[]>(() => loadState(STORAGE_KEYS.TEAMS, INITIAL_TEAMS));
  const [players, setPlayers] = useState<Player[]>(() => loadState(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS));
  const [matches, setMatches] = useState<Match[]>(() => loadState(STORAGE_KEYS.MATCHES, INITIAL_MATCHES));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadState(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  );
  const [rules, setRules] = useState<RuleChapter[]>(() => loadState(STORAGE_KEYS.RULES, INITIAL_RULES));

  // Persistence effects
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season)); }, [season]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LEAGUES, JSON.stringify(leagues)); }, [leagues]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players)); }, [players]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches)); }, [matches]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules)); }, [rules]);

  // LEAGUES
  const addLeague = (league: Omit<League, 'id'>): boolean => {
    const id = `league-${Date.now()}`;
    const newLeague: League = { ...league, id };
    setLeagues(prev => [...prev, newLeague]);
    showToast(`Liga "${league.name}" uspešno dodana.`);
    return true;
  };

  const updateLeague = (id: string, updates: Partial<League>): boolean => {
    setLeagues(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    showToast('Podatki o ligi so posodobljeni.');
    return true;
  };

  const deleteLeague = (id: string): boolean => {
    // Check if league has teams
    const hasTeams = teams.some(t => t.leagueId === id);
    if (hasTeams) {
      showToast('Lige ni mogoče izbrisati, ker vsebuje ekipe!', 'error');
      return false;
    }
    setLeagues(prev => prev.filter(l => l.id !== id));
    showToast('Liga je bila izbrisana.');
    return true;
  };

  // TEAMS
  const addTeam = (teamData: Omit<Team, 'id'>): boolean => {
    // Validate duplicate team name in same league
    const duplicate = teams.some(
      t => t.leagueId === teamData.leagueId &&
           t.name.trim().toLowerCase() === teamData.name.trim().toLowerCase()
    );
    if (duplicate) {
      showToast(`Ekipa z imenom "${teamData.name}" že obstaja v tej ligi!`, 'error');
      return false;
    }

    const id = `team-${Date.now()}`;
    const newTeam: Team = { ...teamData, id };
    setTeams(prev => [...prev, newTeam]);
    showToast(`Ekipa "${teamData.name}" uspešno dodana.`);
    return true;
  };

  const updateTeam = (id: string, updates: Partial<Team>): boolean => {
    if (updates.name) {
      const existing = teams.find(t => t.id === id);
      const targetLeague = updates.leagueId || existing?.leagueId;
      const duplicate = teams.some(
        t => t.id !== id &&
             t.leagueId === targetLeague &&
             t.name.trim().toLowerCase() === updates.name!.trim().toLowerCase()
      );
      if (duplicate) {
        showToast(`Ekipa z imenom "${updates.name}" že obstaja v tej ligi!`, 'error');
        return false;
      }
    }

    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showToast('Podatki o ekipi so bili uspešno posodobljeni.');
    return true;
  };

  const deleteTeam = (id: string): boolean => {
    // Delete team and its players, remove from matches or block if finished matches exist
    const hasFinishedMatches = matches.some(
      m => (m.homeTeamId === id || m.awayTeamId === id) && m.status === 'finished'
    );
    if (hasFinishedMatches) {
      showToast('Ekipe ni mogoče izbrisati, ker ima že zaključene tekme v tekmovanju. Lahko jo označite kot neaktivno.', 'error');
      return false;
    }

    setTeams(prev => prev.filter(t => t.id !== id));
    setPlayers(prev => prev.filter(p => p.teamId !== id));
    setMatches(prev => prev.filter(m => m.homeTeamId !== id && m.awayTeamId !== id));
    showToast('Ekipa in njeni igralci so bili uspešno izbrisani.');
    return true;
  };

  // PLAYERS
  const addPlayer = (playerData: Omit<Player, 'id'>): boolean => {
    // Validate duplicate jersey number in same team
    const dupNumber = players.some(
      p => p.teamId === playerData.teamId && p.jerseyNumber === playerData.jerseyNumber
    );
    if (dupNumber) {
      showToast(`Številka dresa ${playerData.jerseyNumber} je v tej ekipi že zasedena!`, 'error');
      return false;
    }

    const id = `player-${Date.now()}`;
    const newPlayer: Player = { ...playerData, id };
    setPlayers(prev => [...prev, newPlayer]);
    showToast(`Igralec ${playerData.firstName} ${playerData.lastName} je bil dodan.`);
    return true;
  };

  const updatePlayer = (id: string, updates: Partial<Player>): boolean => {
    const existing = players.find(p => p.id === id);
    if (!existing) return false;

    if (updates.jerseyNumber !== undefined) {
      const targetTeam = updates.teamId || existing.teamId;
      const dup = players.some(
        p => p.id !== id && p.teamId === targetTeam && p.jerseyNumber === updates.jerseyNumber
      );
      if (dup) {
        showToast(`Številka dresa ${updates.jerseyNumber} je že zasedena!`, 'error');
        return false;
      }
    }

    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Podatki o igralcu so bili posodobljeni.');
    return true;
  };

  const deletePlayer = (id: string): boolean => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    // Remove player events or keep them marked
    showToast('Igralec je bil izbrisan.');
    return true;
  };

  const transferPlayer = (playerId: string, targetTeamId: string): boolean => {
    const player = players.find(p => p.id === playerId);
    const targetTeam = teams.find(t => t.id === targetTeamId);
    if (!player || !targetTeam) {
      showToast('Napaka pri prestopu: neveljaven igralec ali ekipa.', 'error');
      return false;
    }

    // Check jersey number collision in target team
    let newNumber = player.jerseyNumber;
    const numberTaken = players.some(p => p.teamId === targetTeamId && p.jerseyNumber === newNumber);
    if (numberTaken) {
      // Pick first available number between 2 and 99
      const usedNumbers = new Set(players.filter(p => p.teamId === targetTeamId).map(p => p.jerseyNumber));
      for (let n = 2; n < 100; n++) {
        if (!usedNumbers.has(n)) {
          newNumber = n;
          break;
        }
      }
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, teamId: targetTeamId, jerseyNumber: newNumber };
      }
      return p;
    }));

    showToast(`Igralec ${player.firstName} ${player.lastName} je uspešno prestopil v ekipo ${targetTeam.name} (št. dresa: ${newNumber}).`);
    return true;
  };

  // MATCHES & SCHEDULING
  const generateScheduleForLeague = (
    leagueId: string,
    isDoubleRound: boolean,
    startDate: string
  ): boolean => {
    const leagueTeams = teams.filter(t => t.leagueId === leagueId && t.isActive);
    if (leagueTeams.length < 2) {
      showToast('Za generiranje razporeda potrebujete najmanj 2 aktivni ekipi!', 'error');
      return false;
    }

    const { matches: newGenMatches } = generateBergerSchedule(
      leagueTeams.map(t => t.id),
      {
        leagueId,
        seasonId: season.id,
        isDoubleRound,
        startDate
      }
    );

    const matchesWithIds: Match[] = newGenMatches.map((m, idx) => ({
      ...m,
      id: `m-gen-${leagueId}-${Date.now()}-${idx}`
    }));

    // Replace all non-finished matches in this league
    setMatches(prev => {
      const otherMatches = prev.filter(m => m.leagueId !== leagueId);
      return [...otherMatches, ...matchesWithIds];
    });

    showToast(`Razpored po Bergerjevem sistemu (${isDoubleRound ? 'dvokrožni' : 'enokrožni'}) za ligo je bil uspešno ustvarjen (${matchesWithIds.length} tekem).`);
    return true;
  };

  const addMatch = (matchData: Omit<Match, 'id'>): boolean => {
    if (matchData.homeTeamId === matchData.awayTeamId) {
      showToast('Domača in gostujoča ekipa ne moreta biti enaki!', 'error');
      return false;
    }

    const id = `match-${Date.now()}`;
    const newMatch: Match = { ...matchData, id, events: matchData.events || [] };
    setMatches(prev => [...prev, newMatch]);
    showToast('Tekma je bila uspešno dodana v razpored.');
    return true;
  };

  const updateMatch = (id: string, updates: Partial<Match>): boolean => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    showToast('Tekma je bila uspešno posodobljena.');
    return true;
  };

  const deleteMatch = (id: string): boolean => {
    setMatches(prev => prev.filter(m => m.id !== id));
    showToast('Tekma je bila izbrisana.');
    return true;
  };

  const updateMatchScore = (
    matchId: string,
    homeScore: number,
    awayScore: number,
    homeHalftime?: number | null,
    awayHalftime?: number | null,
    status: MatchStatus = 'finished',
    notes?: string
  ): boolean => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          homeScore,
          awayScore,
          homeHalftimeScore: homeHalftime !== undefined ? homeHalftime : m.homeHalftimeScore,
          awayHalftimeScore: awayHalftime !== undefined ? awayHalftime : m.awayHalftimeScore,
          status,
          organizerNotes: notes !== undefined ? notes : m.organizerNotes
        };
      }
      return m;
    }));
    showToast(`Rezultat ${homeScore} : ${awayScore} je bil uspešno shranjen. Lestvica je bila samodejno posodobljena!`);
    return true;
  };

  const addMatchEvent = (
    matchId: string,
    eventData: Omit<MatchEvent, 'id' | 'matchId'>
  ): boolean => {
    const id = `ev-${Date.now()}`;
    const newEvent: MatchEvent = { ...eventData, id, matchId };

    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const events = [...(m.events || []), newEvent];
        // If event is a goal, update score accordingly
        let hScore = m.homeScore ?? 0;
        let aScore = m.awayScore ?? 0;
        if (eventData.type === 'goal' || eventData.type === 'penalty_goal') {
          if (eventData.teamId === m.homeTeamId) hScore += 1;
          else if (eventData.teamId === m.awayTeamId) aScore += 1;
        } else if (eventData.type === 'own_goal') {
          // Own goal gives point to the other team
          if (eventData.teamId === m.homeTeamId) aScore += 1;
          else hScore += 1;
        }

        return {
          ...m,
          events,
          homeScore: hScore,
          awayScore: aScore
        };
      }
      return m;
    }));

    showToast('Dogodek na tekmi je bil zabeležen.');
    return true;
  };

  const deleteMatchEvent = (matchId: string, eventId: string): boolean => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const removed = m.events.find(e => e.id === eventId);
        const events = m.events.filter(e => e.id !== eventId);
        let hScore = m.homeScore ?? 0;
        let aScore = m.awayScore ?? 0;

        if (removed) {
          if (removed.type === 'goal' || removed.type === 'penalty_goal') {
            if (removed.teamId === m.homeTeamId) hScore = Math.max(0, hScore - 1);
            else if (removed.teamId === m.awayTeamId) aScore = Math.max(0, aScore - 1);
          } else if (removed.type === 'own_goal') {
            if (removed.teamId === m.homeTeamId) aScore = Math.max(0, aScore - 1);
            else hScore = Math.max(0, hScore - 1);
          }
        }

        return {
          ...m,
          events,
          homeScore: hScore,
          awayScore: aScore
        };
      }
      return m;
    }));

    showToast('Dogodek je bil odstranjen.');
    return true;
  };

  // ANNOUNCEMENTS
  const addAnnouncement = (data: Omit<Announcement, 'id'>): boolean => {
    const id = `ann-${Date.now()}`;
    const newAnn: Announcement = { ...data, id };
    setAnnouncements(prev => [newAnn, ...prev]);
    showToast('Obvestilo je bilo uspešno objavljeno.');
    return true;
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>): boolean => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    showToast('Obvestilo je bilo posodobljeno.');
    return true;
  };

  const deleteAnnouncement = (id: string): boolean => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    showToast('Obvestilo je bilo izbrisano.');
    return true;
  };

  // RULES
  const updateRuleChapter = (id: string, content: string, title?: string): boolean => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, content, title: title || r.title } : r));
    showToast('Pravila tekmovanja so bila posodobljena.');
    return true;
  };

  // SEASONS & BACKUP
  const archiveSeason = () => {
    setSeason(prev => ({ ...prev, isArchived: true, isActive: false }));
    showToast('Sezona je bila arhivirana.');
  };

  const createSeason = (name: string, startDate: string, endDate: string) => {
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      name,
      startDate,
      endDate,
      isActive: true,
      isArchived: false
    };
    setSeason(newSeason);
    showToast(`Nova sezona "${name}" je bila aktivirana.`);
  };

  const resetToDemoData = () => {
    setSeason(INITIAL_SEASON);
    setLeagues(INITIAL_LEAGUES);
    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setRules(INITIAL_RULES);
    localStorage.clear();
    showToast('Vsi podatki so bili ponastavljeni na začetne demonstracijske podatke.');
  };

  const importBackup = (backup: FullBackupData): boolean => {
    try {
      if (backup.season) setSeason(backup.season);
      if (backup.leagues) setLeagues(backup.leagues);
      if (backup.teams) setTeams(backup.teams);
      if (backup.players) setPlayers(backup.players);
      if (backup.matches) setMatches(backup.matches);
      if (backup.announcements) setAnnouncements(backup.announcements);
      if (backup.rules) setRules(backup.rules);
      showToast('Varnostna kopija je bila uspešno obnovljena!');
      return true;
    } catch {
      showToast('Napaka pri uvozu varnostne kopije!', 'error');
      return false;
    }
  };

  const importTeamsFromList = (newTeams: any[]): number => {
    let imported = 0;
    const addedTeams: Team[] = [];

    for (const item of newTeams) {
      const name = item['Naziv'] || item['naziv'] || item['Name'] || item['name'];
      if (!name) continue;

      const shortName = item['Kratica'] || item['kratica'] || name.substring(0, 3).toUpperCase();
      const leagueId = String(item['Liga'] || item['liga'] || '1');
      const venue = item['Igrišče'] || item['igrisce'] || item['Venue'] || 'Športni park Kodeljevo';
      const contact = item['Kontakt'] || item['kontakt'] || 'Vodja ekipe';
      const phone = item['Telefon'] || item['telefon'] || '041 000 000';
      const email = item['Email'] || item['email'] || 'ekipa@liga.si';
      const primaryColor = item['Barva'] || '#10b981';

      addedTeams.push({
        id: `t-imp-${Date.now()}-${imported}`,
        name,
        shortName,
        logo: '⚽',
        leagueId,
        contactName: contact,
        contactPhone: phone,
        contactEmail: email,
        venue,
        primaryColor,
        secondaryColor: '#ffffff',
        isActive: true,
        foundedYear: 2024
      });
      imported++;
    }

    if (imported > 0) {
      setTeams(prev => [...prev, ...addedTeams]);
      showToast(`Uspešno uvoženih ${imported} ekip.`);
    } else {
      showToast('Nobena ekipa ni bila uvožena. Preverite stolpce v datoteki (Naziv, Kratica, Liga, Igrišče).', 'error');
    }

    return imported;
  };

  const importPlayersFromList = (newPlayers: any[]): number => {
    let imported = 0;
    const addedPlayers: Player[] = [];
    const teamMap = new Map(teams.map(t => [t.name.toLowerCase().trim(), t.id]));

    for (const item of newPlayers) {
      const firstName = item['Ime'] || item['ime'] || item['First Name'];
      const lastName = item['Priimek'] || item['priimek'] || item['Last Name'];
      if (!firstName || !lastName) continue;

      const teamName = (item['Ekipa'] || item['ekipa'] || '').toLowerCase().trim();
      const teamId = teamMap.get(teamName) || teams[0]?.id;
      if (!teamId) continue;

      const jerseyNumber = Number(item['Številka'] || item['stevilka'] || item['Number'] || 10);
      const position = item['Položaj'] || item['polozaj'] || 'Vezist';

      addedPlayers.push({
        id: `p-imp-${Date.now()}-${imported}`,
        teamId,
        firstName,
        lastName,
        jerseyNumber,
        position: position as any,
        isActive: true
      });
      imported++;
    }

    if (imported > 0) {
      setPlayers(prev => [...prev, ...addedPlayers]);
      showToast(`Uspešno uvoženih ${imported} igralcev.`);
    } else {
      showToast('Noben igralec ni bil uvožen. Preverite stolpce (Ime, Priimek, Ekipa, Številka).', 'error');
    }

    return imported;
  };

  const importMatchesFromList = (newMatches: any[]): number => {
    let imported = 0;
    const addedMatches: Match[] = [];
    const teamMap = new Map(teams.map(t => [t.name.toLowerCase().trim(), t.id]));

    for (const item of newMatches) {
      const homeName = (item['Domači'] || item['domaci'] || item['Home'] || '').toLowerCase().trim();
      const awayName = (item['Gostje'] || item['gostje'] || item['Away'] || '').toLowerCase().trim();
      const homeTeamId = teamMap.get(homeName);
      const awayTeamId = teamMap.get(awayName);

      if (!homeTeamId || !awayTeamId) continue;

      const round = Number(item['Krog'] || item['krog'] || 1);
      const date = item['Datum'] || item['datum'] || '2025-10-01';
      const time = item['Ura'] || item['ura'] || '18:00';
      const venue = item['Prizorišče'] || item['prizorisce'] || 'Športni park Kodeljevo';
      const leagueId = teams.find(t => t.id === homeTeamId)?.leagueId || '1';

      addedMatches.push({
        id: `m-imp-${Date.now()}-${imported}`,
        seasonId: season.id,
        leagueId,
        round,
        homeTeamId,
        awayTeamId,
        date,
        time,
        venue,
        status: 'scheduled',
        events: []
      });
      imported++;
    }

    if (imported > 0) {
      setMatches(prev => [...prev, ...addedMatches]);
      showToast(`Uspešno uvoženih ${imported} tekem.`);
    } else {
      showToast('Nobena tekma ni bila uvožena. Preverite stolpce (Domači, Gostje, Krog, Datum, Ura).', 'error');
    }

    return imported;
  };

  return (
    <DataContext.Provider
      value={{
        season,
        leagues,
        teams,
        players,
        matches,
        announcements,
        rules,
        toasts,
        showToast,
        removeToast,
        addLeague,
        updateLeague,
        deleteLeague,
        addTeam,
        updateTeam,
        deleteTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        transferPlayer,
        generateScheduleForLeague,
        addMatch,
        updateMatch,
        deleteMatch,
        updateMatchScore,
        addMatchEvent,
        deleteMatchEvent,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        updateRuleChapter,
        archiveSeason,
        createSeason,
        resetToDemoData,
        importBackup,
        importTeamsFromList,
        importPlayersFromList,
        importMatchesFromList
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
