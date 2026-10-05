import { Season, League, Team, Player, Match, MatchEvent, Announcement, RuleChapter } from '../types';
import { generateBergerSchedule } from '../utils/berger';

export const INITIAL_SEASON: Season = {
  id: 'season-2025-2026',
  name: '2025/2026',
  isActive: true,
  isArchived: false,
  startDate: '2025-09-06',
  endDate: '2026-06-14'
};

export const INITIAL_LEAGUES: League[] = [
  {
    id: '1',
    name: '1. liga',
    shortName: '1. LIGA',
    description: 'Elitna rekreacijska liga z 9 najboljšimi ekipami regije.',
    targetTeams: 9,
    seasonId: 'season-2025-2026',
    level: 1
  },
  {
    id: '2',
    name: '2. liga',
    shortName: '2. LIGA',
    description: 'Napeta druga liga z 8 izenačenimi ekipami v boju za napredovanje.',
    targetTeams: 8,
    seasonId: 'season-2025-2026',
    level: 2
  },
  {
    id: '3',
    name: '3. liga',
    shortName: '3. LIGA',
    description: 'Tretja liga z 9 mladimi in ambicioznimi rekreacijskimi klubi.',
    targetTeams: 9,
    seasonId: 'season-2025-2026',
    level: 3
  }
];

export const INITIAL_TEAMS: Team[] = [
  // 1. LIGA (9 teams)
  {
    id: 't-1-1',
    name: 'ŠD Meteor',
    shortName: 'MET',
    logo: '⚡',
    leagueId: '1',
    contactName: 'Janez Novak',
    contactPhone: '041 234 567',
    contactEmail: 'meteor@rekreacija.si',
    venue: 'Športni park Kodeljevo',
    primaryColor: '#0284c7', // Sky blue
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2012,
    description: 'Večkratni prvaki lige z hitro in napadalno igro.'
  },
  {
    id: 't-1-2',
    name: 'FC Ljubljana Zmaji',
    shortName: 'LJU',
    logo: '🐉',
    leagueId: '1',
    contactName: 'Luka Kovač',
    contactPhone: '031 345 678',
    contactEmail: 'zmaji@fcljubljana.si',
    venue: 'ŠRC Stožice igrišče 2',
    primaryColor: '#10b981', // Emerald
    secondaryColor: '#0f172a',
    isActive: true,
    foundedYear: 2015,
    description: 'Mestna ekipa s poudarkom na taktični disciplini.'
  },
  {
    id: 't-1-3',
    name: 'KMN Dobovec Stars',
    shortName: 'DOB',
    logo: '⭐',
    leagueId: '1',
    contactName: 'Matej Horvat',
    contactPhone: '040 456 789',
    contactEmail: 'dobovec@kmn.si',
    venue: 'Dvorana Tivoli',
    primaryColor: '#f59e0b', // Amber
    secondaryColor: '#000000',
    isActive: true,
    foundedYear: 2010,
    description: 'Izkušeni futsal igralci na zunanjem travnatem igrišču.'
  },
  {
    id: 't-1-4',
    name: 'NK Rožnik Tigers',
    shortName: 'ROŽ',
    logo: '🐅',
    leagueId: '1',
    contactName: 'Boštjan Krajnc',
    contactPhone: '051 567 890',
    contactEmail: 'roznik@sport.si',
    venue: 'Športni park Kodeljevo',
    primaryColor: '#ea580c', // Orange
    secondaryColor: '#1e293b',
    isActive: true,
    foundedYear: 2017,
    description: 'Borbena ekipa z zanesljivo obrambo.'
  },
  {
    id: 't-1-5',
    name: 'FK Trnovo Vipers',
    shortName: 'TRN',
    logo: '🐍',
    leagueId: '1',
    contactName: 'Rok Zupan',
    contactPhone: '041 678 901',
    contactEmail: 'trnovo@vipers.si',
    venue: 'ŠD Trnovo igrišče',
    primaryColor: '#8b5cf6', // Purple
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2018,
    description: 'Mlada zasedba z odličnimi tehničnimi veščinami.'
  },
  {
    id: 't-1-6',
    name: 'ŠD Vič Gladiators',
    shortName: 'VIČ',
    logo: '⚔️',
    leagueId: '1',
    contactName: 'Aleš Vidmar',
    contactPhone: '031 789 012',
    contactEmail: 'vic@gladiators.si',
    venue: 'Baza Črnuče',
    primaryColor: '#dc2626', // Red
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2014,
    description: 'Trpežna in nepopustljiva ekipa z močnim kolektivom.'
  },
  {
    id: 't-1-7',
    name: 'KMN Barje United',
    shortName: 'BAR',
    logo: '🦅',
    leagueId: '1',
    contactName: 'Tomaž Golob',
    contactPhone: '040 890 123',
    contactEmail: 'barje@united.si',
    venue: 'Športni center Triglav',
    primaryColor: '#059669', // Forest green
    secondaryColor: '#fbbf24',
    isActive: true,
    foundedYear: 2016,
    description: 'Uigrana ekipa z juga Ljubljanskega barja.'
  },
  {
    id: 't-1-8',
    name: 'NK Šiška Hawks',
    shortName: 'ŠIŠ',
    logo: '🦅',
    leagueId: '1',
    contactName: 'Primož Turk',
    contactPhone: '051 901 234',
    contactEmail: 'siska@hawks.si',
    venue: 'ŠRC Stožice igrišče 2',
    primaryColor: '#2563eb', // Royal blue
    secondaryColor: '#93c5fd',
    isActive: true,
    foundedYear: 2019,
    description: 'Hitri protinapadi in agresiven visok presing.'
  },
  {
    id: 't-1-9',
    name: 'ŠD Moste Titans',
    shortName: 'MOS',
    logo: '🛡️',
    leagueId: '1',
    contactName: 'Gorazd Kralj',
    contactPhone: '041 012 345',
    contactEmail: 'moste@titans.si',
    venue: 'Športni park Kodeljevo',
    primaryColor: '#4f46e5', // Indigo
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2013,
    description: 'Veterani z bogatimi izkušnjami v malem nogometu.'
  },

  // 2. LIGA (8 teams)
  {
    id: 't-2-1',
    name: 'FC Golgeter',
    shortName: 'GOL',
    logo: '⚽',
    leagueId: '2',
    contactName: 'Gregor Hribar',
    contactPhone: '041 111 222',
    contactEmail: 'golgeter@liga2.si',
    venue: 'ŠRC Stožice igrišče 3',
    primaryColor: '#e11d48', // Rose
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2020,
    description: 'Napadalno usmerjena ekipa z odličnim strelcem.'
  },
  {
    id: 't-2-2',
    name: 'NK Bežigrad Lions',
    shortName: 'BEŽ',
    logo: '🦁',
    leagueId: '2',
    contactName: 'Andrej Božič',
    contactPhone: '031 222 333',
    contactEmail: 'bezigrad@lions.si',
    venue: 'Baza Črnuče',
    primaryColor: '#d97706', // Gold/amber
    secondaryColor: '#1e293b',
    isActive: true,
    foundedYear: 2018,
    description: 'Kakovostna zasedba s ciljem uvrstitve v 1. ligo.'
  },
  {
    id: 't-2-3',
    name: 'ŠD Tabor Knights',
    shortName: 'TAB',
    logo: '🏰',
    leagueId: '2',
    contactName: 'Miha Krmelj',
    contactPhone: '040 333 444',
    contactEmail: 'tabor@knights.si',
    venue: 'Dvorana Tivoli',
    primaryColor: '#0d9488', // Teal
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2016,
    description: 'Kompaktna ekipa s tradicijo.'
  },
  {
    id: 't-2-4',
    name: 'KMN Fužine Wolves',
    shortName: 'FUŽ',
    logo: '🐺',
    leagueId: '2',
    contactName: 'Dragan Petrović',
    contactPhone: '051 444 555',
    contactEmail: 'fuzine@wolves.si',
    venue: 'Športni park Kodeljevo',
    primaryColor: '#6366f1', // Indigo
    secondaryColor: '#f1f5f9',
    isActive: true,
    foundedYear: 2015,
    description: 'Dinamična ekipa z veliko navijaško podporo.'
  },
  {
    id: 't-2-5',
    name: 'FK Jarše Express',
    shortName: 'JAR',
    logo: '🚀',
    leagueId: '2',
    contactName: 'Blaž Jenko',
    contactPhone: '041 555 666',
    contactEmail: 'jarse@express.si',
    venue: 'Baza Črnuče',
    primaryColor: '#16a34a', // Green
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2021,
    description: 'Nova mlada ekipa polna zagona.'
  },
  {
    id: 't-2-6',
    name: 'ŠD Rudnik Miners',
    shortName: 'RUD',
    logo: '⛏️',
    leagueId: '2',
    contactName: 'Dejan Oblak',
    contactPhone: '031 666 777',
    contactEmail: 'rudnik@miners.si',
    venue: 'Športni center Triglav',
    primaryColor: '#64748b', // Slate
    secondaryColor: '#fbbf24',
    isActive: true,
    foundedYear: 2017,
    description: 'Trda obramba in učinkoviti prekinitveni streli.'
  },
  {
    id: 't-2-7',
    name: 'NK Ježica Bulls',
    shortName: 'JEŽ',
    logo: '🐂',
    leagueId: '2',
    contactName: 'Simon Kos',
    contactPhone: '040 777 888',
    contactEmail: 'jezica@bulls.si',
    venue: 'ŠRC Stožice igrišče 3',
    primaryColor: '#b91c1c', // Crimson
    secondaryColor: '#000000',
    isActive: true,
    foundedYear: 2019,
    description: 'Fizično močni igralci z dobrim skokom.'
  },
  {
    id: 't-2-8',
    name: 'KMN Polje Falcons',
    shortName: 'POL',
    logo: '🦅',
    leagueId: '2',
    contactName: 'Žiga Mlakar',
    contactPhone: '051 888 999',
    contactEmail: 'polje@falcons.si',
    venue: 'Športni park Kodeljevo',
    primaryColor: '#0369a1', // Blue
    secondaryColor: '#e0f2fe',
    isActive: true,
    foundedYear: 2020,
    description: 'Kombinatorna igra po tleh in kratke podaje.'
  },

  // 3. LIGA (9 teams)
  {
    id: 't-3-1',
    name: 'FC Zmajčki',
    shortName: 'ZMA',
    logo: '🦖',
    leagueId: '3',
    contactName: 'Jernej Rozman',
    contactPhone: '041 999 001',
    contactEmail: 'zmajcki@liga3.si',
    venue: 'Baza Črnuče',
    primaryColor: '#15803d', // Green
    secondaryColor: '#ffffff',
    isActive: true,
    foundedYear: 2022,
    description: 'Mladi talenti iz ljubljanskih šol nogometa.'
  },
  {
    id: 't-3-2',
    name: 'ŠD Poljane Phoenix',
    shortName: 'PLJ',
    logo: '🔥',
    leagueId: '3',
    contactName: 'Aljaž Berce',
    contactPhone: '031 999 002',
    contactEmail: 'poljane@phoenix.si',
    venue: 'ŠD Trnovo igrišče',
    primaryColor: '#c2410c', // Orange-red
    secondaryColor: '#ffedd5',
    isActive: true,
    foundedYear: 2021,
    description: 'Ekipa prijateljev s poudarkom na fair playu.'
  },
  {
    id: 't-3-3',
    name: 'NK Črnuče Spartans',
    shortName: 'ČRN',
    logo: '🛡️',
    leagueId: '3',
    contactName: 'Matic Zore',
    contactPhone: '040 999 003',
    contactEmail: 'crnuce@spartans.si',
    venue: 'Baza Črnuče',
    primaryColor: '#831843', // Wine
    secondaryColor: '#fce7f3',
    isActive: true,
    foundedYear: 2023,
    description: 'Novinci v ligi z močno podporo s tribun.'
  },
  {
    id: 't-3-4',
    name: 'KMN Sostro Comets',
    shortName: 'SOS',
    logo: '☄️',
    leagueId: '3',
    contactName: 'Gašper Pirc',
    contactPhone: '051 999 004',
    contactEmail: 'sostro@comets.si',
    venue: 'Športni park Kodeljevo',
    primaryColor: '#0e7490', // Cyan
    secondaryColor: '#ecfeff',
    isActive: true,
    foundedYear: 2022,
    description: 'Hitra ekipa z ostrim protinapadom.'
  },
  {
    id: 't-3-5',
    name: 'FK Vevče Sharks',
    shortName: 'VEV',
    logo: '🦈',
    leagueId: '3',
    contactName: 'Denis Kastelic',
    contactPhone: '041 999 005',
    contactEmail: 'vevce@sharks.si',
    venue: 'ŠRC Stožice igrišče 3',
    primaryColor: '#1e3a8a', // Dark blue
    secondaryColor: '#93c5fd',
    isActive: true,
    foundedYear: 2020,
    description: 'Trdoživa ekipa z izjemno kondicijo.'
  },
  {
    id: 't-3-6',
    name: 'ŠD Šentvid Cobras',
    shortName: 'ŠEN',
    logo: '🐍',
    leagueId: '3',
    contactName: 'Timotej Pavlič',
    contactPhone: '031 999 006',
    contactEmail: 'sentvid@cobras.si',
    venue: 'Dvorana Tivoli',
    primaryColor: '#4338ca', // Violet
    secondaryColor: '#c7d2fe',
    isActive: true,
    foundedYear: 2021,
    description: 'Prekaljeni igralci z dobrim pregledom igre.'
  },
  {
    id: 't-3-7',
    name: 'NK Dravlje Panthers',
    shortName: 'DRA',
    logo: '🐆',
    leagueId: '3',
    contactName: 'Anže Sever',
    contactPhone: '040 999 007',
    contactEmail: 'dravlje@panthers.si',
    venue: 'Športni center Triglav',
    primaryColor: '#18181b', // Zinc black
    secondaryColor: '#f43f5e',
    isActive: true,
    foundedYear: 2023,
    description: 'Napadalni dvojec z izjemno hitrostjo.'
  },
  {
    id: 't-3-8',
    name: 'KMN Bizovik Storm',
    shortName: 'BIZ',
    logo: '🌩️',
    leagueId: '3',
    contactName: 'Martin Ribič',
    contactPhone: '051 999 008',
    contactEmail: 'bizovik@storm.si',
    venue: 'Športni park Kodeljevo',
    primaryColor: '#0284c7', // Sky
    secondaryColor: '#e0f2fe',
    isActive: true,
    foundedYear: 2022,
    description: 'Kompaktna sredina z natančnimi podajami.'
  },
  {
    id: 't-3-9',
    name: 'ŠD Štepanja vas Rovers',
    shortName: 'ŠTE',
    logo: '⚓',
    leagueId: '3',
    contactName: 'Kristjan Močnik',
    contactPhone: '041 999 009',
    contactEmail: 'stepanja@rovers.si',
    venue: 'ŠD Trnovo igrišče',
    primaryColor: '#047857', // Emerald
    secondaryColor: '#a7f3d0',
    isActive: true,
    foundedYear: 2024,
    description: 'Novoustanovljeni klub z zvestimi privrženci.'
  }
];

// Helper to generate realistic players for each team
function generateInitialPlayers(): Player[] {
  const players: Player[] = [];
  const firstNames = ['Jan', 'Luka', 'Marko', 'Matej', 'Rok', 'Nejc', 'Žiga', 'Anže', 'Aljaž', 'Tomaž', 'Blaž', 'Matic', 'Aleš', 'Jure', 'Tilen', 'Miha', 'Vid', 'Filip', 'Nik', 'Tim'];
  const lastNames = ['Novak', 'Horvat', 'Kovačič', 'Krajnc', 'Zupan', 'Potočnik', 'Kovač', 'Mlakar', 'Kos', 'Vidmar', 'Golob', 'Turk', 'Kralj', 'Božič', 'Zore', 'Rozman', 'Pavlič', 'Sever', 'Ribič', 'Močnik'];
  const positions: Player['position'][] = ['Vratar', 'Branilec', 'Branilec', 'Vezist', 'Vezist', 'Vezist', 'Napadalec', 'Napadalec'];

  INITIAL_TEAMS.forEach((team, teamIdx) => {
    // 8 players per team
    positions.forEach((pos, pIdx) => {
      const fName = firstNames[(teamIdx * 3 + pIdx) % firstNames.length];
      const lName = lastNames[(teamIdx * 4 + pIdx) % lastNames.length];
      players.push({
        id: `p-${team.id}-${pIdx + 1}`,
        teamId: team.id,
        firstName: fName,
        lastName: lName,
        jerseyNumber: pos === 'Vratar' ? 1 : (pIdx === 6 ? 9 : (pIdx === 7 ? 10 : (pIdx + 2))),
        position: pos,
        birthYear: 1992 + ((teamIdx + pIdx) % 12),
        isActive: true,
        registrationNumber: `REG-${team.shortName}-${pIdx + 100}`
      });
    });
  });

  return players;
}

export const INITIAL_PLAYERS = generateInitialPlayers();

// Generate fixtures using Berger Algorithm and populate completed matches
function generateInitialMatches(players: Player[]): Match[] {
  const allMatches: Match[] = [];

  // 1. LIGA (9 teams) - Single round-robin (9 rounds)
  const l1Teams = INITIAL_TEAMS.filter(t => t.leagueId === '1').map(t => t.id);
  const l1Berger = generateBergerSchedule(l1Teams, {
    leagueId: '1',
    seasonId: 'season-2025-2026',
    isDoubleRound: false,
    startDate: '2025-09-12',
    daysBetweenRounds: 7,
    matchTimes: ['17:30', '18:45', '20:00', '21:15'],
    venues: ['Športni park Kodeljevo', 'Dvorana Tivoli', 'ŠRC Stožice igrišče 2', 'Baza Črnuče']
  });

  // 2. LIGA (8 teams) - Single round-robin (7 rounds)
  const l2Teams = INITIAL_TEAMS.filter(t => t.leagueId === '2').map(t => t.id);
  const l2Berger = generateBergerSchedule(l2Teams, {
    leagueId: '2',
    seasonId: 'season-2025-2026',
    isDoubleRound: false,
    startDate: '2025-09-13',
    daysBetweenRounds: 7,
    matchTimes: ['17:00', '18:15', '19:30', '20:45'],
    venues: ['ŠRC Stožice igrišče 3', 'Baza Črnuče', 'Športni center Triglav', 'Športni park Kodeljevo']
  });

  // 3. LIGA (9 teams) - Single round-robin (9 rounds)
  const l3Teams = INITIAL_TEAMS.filter(t => t.leagueId === '3').map(t => t.id);
  const l3Berger = generateBergerSchedule(l3Teams, {
    leagueId: '3',
    seasonId: 'season-2025-2026',
    isDoubleRound: false,
    startDate: '2025-09-14',
    daysBetweenRounds: 7,
    matchTimes: ['16:00', '17:15', '18:30', '19:45'],
    venues: ['Baza Črnuče', 'ŠD Trnovo igrišče', 'Dvorana Tivoli', 'Športni park Kodeljevo']
  });

  const rawMatches = [
    ...l1Berger.matches.map((m, i) => ({ ...m, id: `m-l1-${i + 1}` })),
    ...l2Berger.matches.map((m, i) => ({ ...m, id: `m-l2-${i + 1}` })),
    ...l3Berger.matches.map((m, i) => ({ ...m, id: `m-l3-${i + 1}` })),
  ];

  // Helper to find player for scoring
  const getPlayer = (teamId: string, offset: number) => {
    const teamPlayers = players.filter(p => p.teamId === teamId);
    return teamPlayers[offset % teamPlayers.length];
  };

  rawMatches.forEach((m, idx) => {
    const matchObj: Match = {
      ...m,
      homeScore: null,
      awayScore: null,
      homeHalftimeScore: null,
      awayHalftimeScore: null,
      events: []
    };

    // Mark rounds 1, 2, 3 as finished
    if (m.round <= 3) {
      matchObj.status = 'finished';
      // Deterministic realistic scores based on index
      const scores = [
        [3, 1, 1, 0],
        [2, 2, 1, 1],
        [4, 0, 2, 0],
        [1, 2, 0, 1],
        [3, 2, 2, 1],
        [0, 1, 0, 0],
        [2, 0, 1, 0],
        [1, 3, 1, 2]
      ];
      const sc = scores[idx % scores.length];
      matchObj.homeScore = sc[0];
      matchObj.awayScore = sc[1];
      matchObj.homeHalftimeScore = sc[2];
      matchObj.awayHalftimeScore = sc[3];

      // Add realistic events for the goals
      let evId = 1;
      // Home goals
      for (let g = 0; g < sc[0]; g++) {
        const scorer = getPlayer(m.homeTeamId, g + 6); // strikers usually offset 6, 7
        matchObj.events.push({
          id: `ev-${matchObj.id}-${evId++}`,
          matchId: matchObj.id,
          teamId: m.homeTeamId,
          playerId: scorer ? scorer.id : `p-${m.homeTeamId}-7`,
          minute: 12 + g * 22,
          type: g === 1 && idx % 3 === 0 ? 'penalty_goal' : 'goal'
        });
      }
      // Away goals
      for (let g = 0; g < sc[1]; g++) {
        const scorer = getPlayer(m.awayTeamId, g + 6);
        matchObj.events.push({
          id: `ev-${matchObj.id}-${evId++}`,
          matchId: matchObj.id,
          teamId: m.awayTeamId,
          playerId: scorer ? scorer.id : `p-${m.awayTeamId}-7`,
          minute: 18 + g * 25,
          type: 'goal'
        });
      }
      // Cards
      if (idx % 2 === 0) {
        const defender = getPlayer(m.awayTeamId, 1);
        if (defender) {
          matchObj.events.push({
            id: `ev-${matchObj.id}-${evId++}`,
            matchId: matchObj.id,
            teamId: m.awayTeamId,
            playerId: defender.id,
            minute: 34,
            type: 'yellow_card',
            note: 'Prekršek v nevarni coni'
          });
        }
      }
      if (idx % 5 === 0) {
        const homeMid = getPlayer(m.homeTeamId, 3);
        if (homeMid) {
          matchObj.events.push({
            id: `ev-${matchObj.id}-${evId++}`,
            matchId: matchObj.id,
            teamId: m.homeTeamId,
            playerId: homeMid.id,
            minute: 42,
            type: 'yellow_card',
            note: 'Ugovarjanje sodniku'
          });
        }
      }

      matchObj.organizerNotes = 'Tekma je bila odigrana v odličnih pogojih in v duhu fair-playa.';
      matchObj.referee = 'Igor Veselko';
    } else if (m.round === 4 && idx % 4 === 0) {
      // 1 match in progress (Live!)
      matchObj.status = 'in_progress';
      matchObj.homeScore = 2;
      matchObj.awayScore = 1;
      matchObj.homeHalftimeScore = 1;
      matchObj.awayHalftimeScore = 0;
      matchObj.referee = 'Marko Kotnik';
      const p1 = getPlayer(m.homeTeamId, 6);
      const p2 = getPlayer(m.awayTeamId, 7);
      matchObj.events = [
        {
          id: `ev-${matchObj.id}-live-1`,
          matchId: matchObj.id,
          teamId: m.homeTeamId,
          playerId: p1 ? p1.id : `p-${m.homeTeamId}-7`,
          minute: 14,
          type: 'goal'
        },
        {
          id: `ev-${matchObj.id}-live-2`,
          matchId: matchObj.id,
          teamId: m.awayTeamId,
          playerId: p2 ? p2.id : `p-${m.awayTeamId}-7`,
          minute: 38,
          type: 'goal'
        },
        {
          id: `ev-${matchObj.id}-live-3`,
          matchId: matchObj.id,
          teamId: m.homeTeamId,
          playerId: p1 ? p1.id : `p-${m.homeTeamId}-7`,
          minute: 44,
          type: 'goal'
        }
      ];
    } else {
      matchObj.status = 'scheduled';
    }

    allMatches.push(matchObj);
  });

  return allMatches;
}

export const INITIAL_MATCHES = generateInitialMatches(INITIAL_PLAYERS);

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Začetek nove sezone 2025/2026 - Rekreacijska nogometna liga',
    summary: 'Pozdravljeni v novi tekmovalni sezoni! V tekmovanju nastopa 26 ekip v treh ligah.',
    content: `Spoštovani vodje ekip, igralci in navijači!

Z veseljem naznanjamo uradni začetek sezone 2025/2026 Medobčinske rekreacijske lige. Letošnje prvenstvo prinaša rekordno udeležbo kar 26 ekip, razporejenih v 1., 2. in 3. ligo.

Vse ekipe naprošamo, da skrbno preverite sezname prijavljenih igralcev ter se držite določenih ur začetkov tekem. Na voljo je tudi mobilna aplikacija z rezultati v živo, razporedi ter ažurnimi lestvicami.

Želimo vam uspešno, borbeno in predvsem varno športno sezono brez poškodb!`,
    date: '2025-09-01',
    isPinned: true,
    status: 'published',
    author: 'Vodstvo tekmovanja'
  },
  {
    id: 'ann-2',
    title: 'Navodila za vnos rezultatov in poročil s tekem',
    summary: 'Predstavniki domačih ekip morajo najkasneje v 2 urah po zaključku tekme potrditi rezultat.',
    content: `Po sklepu disciplinske komisije morata po vsakem odigranem krogu obe ekipi preveriti uradni zapisnik tekme.

Za vnos rezultata in dogodkov:
1. Prijavite se v administracijo z vašim uporabniškim računom.
2. V razdelku "Upravljanje tekem" izberite odigrano tekmo.
3. Vnesite končni rezultat, strelce ter morebitne kartone.
4. Shranite spremembe - lestvica se preračuna takoj.`,
    date: '2025-09-08',
    isPinned: true,
    status: 'published',
    author: 'Tehnični odbor'
  },
  {
    id: 'ann-3',
    title: 'Obvestilo o prostih terminih v 1. in 3. ligi',
    summary: 'Zaradi lihega števila 9 ekip ima v vsakem krogu ena ekipa prost termin.',
    content: `Opozarjamo vodstva ekip 1. in 3. lige, da zaradi sistema z 9 ekipami v vsakem krogu ena ekipa počiva (prost termin). 

Prosto ekipo za vsak posamezen krog si lahko ogledate v zavihku "Razpored", kjer je v glavi kroga jasno izpostavljena ekipa s prostim terminom.`,
    date: '2025-09-15',
    isPinned: false,
    status: 'published',
    author: 'Komisar lige'
  }
];

export const INITIAL_RULES: RuleChapter[] = [
  {
    id: 'rule-1',
    order: 1,
    title: '1. Sistem tekmovanja',
    content: `Tekmovanje poteka v treh ločenih kakovostnih razredih:
- 1. liga: 9 ekip
- 2. liga: 8 ekip
- 3. liga: 9 ekip

Igra se po enokrožnem ali dvokrožnem Bergerjevem sistemu vsak z vsakim. Pri ligah z 9 ekipami ima v vsakem krogu ena ekipa prost termin (pavza). Tekme se igrajo 2 x 25 minut z 5-minutnim odmorom.`
  },
  {
    id: 'rule-2',
    order: 2,
    title: '2. Točkovanje',
    content: `Za dosežene rezultate na posamezni tekmi se podeljujejo točke po sistemu:
- Zmaga: 3 točke
- Neodločen izid: 1 točka
- Poraz: 0 točk

Če ekipa brez opravičila ne nastopi na tekmi, izgubi z rezultatom 0:3 b.b. ter se ji odvzame 1 kazenska točka.`
  },
  {
    id: 'rule-3',
    order: 3,
    title: '3. Vrstni red in merila pri enakem številu točk',
    content: `Mesto na prvenstveni lestvici se določa na podlagi števila zbranih točk. Če imata dve ali več ekip enako število točk, odločajo naslednja merila po vrstnem redu:

1. Število točk na medsebojnih tekmah
2. Razlika v zadetkih na medsebojnih tekmah
3. Skupna razlika med danimi in prejetimi zadetki (gol razlika)
4. Večje število vseh doseženih zadetkov
5. Fair-play lestvica (manjše število kazenskih točk iz rumenih in rdečih kartonov: rumeni karton = 1 točka, rdeči karton = 3 točke)
6. Žreb.`
  },
  {
    id: 'rule-4',
    order: 4,
    title: '4. Disciplinske kazni in kartoni',
    content: `Igralec, ki prejme dva rumena kartona na isti tekmi, dobi rdeči karton in mora nemudoma zapustiti igrišče. 

- Vsak neposredni rdeči karton prinaša samodejno prepoved nastopa na najmanj 1 naslednji tekmi.
- Igralec z zbranimi tremi (3) rumenimi kartoni v sezoni mora počivati eno tekmo.
- Za težje kršitve (žaljenje sodnika, fizično nasilje) o višini kazni odloča Disciplinski sodnik lige.`
  },
  {
    id: 'rule-5',
    order: 5,
    title: '5. Registracija igralcev in pravica nastopa',
    content: `Vsaka ekipa ima lahko registriranih največ 20 igralcev. Igralec ima v posamezni sezoni pravico nastopa le za eno ekipo. 

Prestop v drugo ekipo je dovoljen le med zimskim prestopnim rokom ob pisnem soglasju obeh klubov ter plačilu administrativne takse. Vsi igralci morajo imeti veljaven osebni dokument in zdravniško potrdilo.`
  },
  {
    id: 'rule-6',
    order: 6,
    title: '6. Prestavljanje in odpoved tekem',
    content: `Prestavitev tekme je možna le v primeru višje sile (slabi vremenski pogoji, poplavljeno igrišče) ali s soglasjem obeh ekip, oddanim komisarju lige najmanj 72 ur pred prvotnim terminom. 

Odpoved tekme manj kot 24 ur pred pričetkom se šteje kot neopravičena predaja.`
  },
  {
    id: 'rule-7',
    order: 7,
    title: '7. Pritožbe in ugovori',
    content: `Pritožbo na potek ali regularnost tekme lahko vloži uradni predstavnik ekipe v roku 24 ur po zaključku tekme. 

Pritožba mora biti poslana po elektronski pošti komisarju lige ter podprta s pritožbeno takso v znesku 30 EUR, ki se v primeru ugoditve pritožbi vrne klubu. Odločitev disciplinske komisije je dokončna.`
  }
];
