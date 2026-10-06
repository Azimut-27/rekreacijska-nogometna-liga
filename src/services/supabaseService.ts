import { supabase } from '../lib/supabase';
import { Season, League, Team, Player, Match, MatchEvent, Announcement, RuleChapter } from '../types';

export const supabaseService = {
  // Check if tables are ready
  async isConnected(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('teams').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  // Fetch all data from Supabase
  async loadAllData() {
    try {
      const [
        seasonsRes,
        leaguesRes,
        teamsRes,
        playersRes,
        matchesRes,
        eventsRes,
        announcementsRes,
        rulesRes
      ] = await Promise.all([
        supabase.from('seasons').select('*'),
        supabase.from('leagues').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('matches').select('*'),
        supabase.from('match_events').select('*'),
        supabase.from('announcements').select('*'),
        supabase.from('rules').select('*')
      ]);

      if (teamsRes.error || !teamsRes.data || teamsRes.data.length === 0) {
        return null;
      }

      // Map snake_case to camelCase
      const seasons: Season[] = (seasonsRes.data || []).map(s => ({
        id: s.id,
        name: s.name,
        isActive: s.is_active,
        isArchived: s.is_archived,
        startDate: s.start_date,
        endDate: s.end_date
      }));

      const leagues: League[] = (leaguesRes.data || []).map(l => ({
        id: l.id,
        name: l.name,
        shortName: l.short_name,
        description: l.description,
        targetTeams: l.target_teams,
        seasonId: l.season_id,
        level: l.level
      }));

      const teams: Team[] = (teamsRes.data || []).map(t => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        logo: t.logo || '⚽',
        leagueId: t.league_id,
        contactName: t.contact_name,
        contactPhone: t.contact_phone,
        contactEmail: t.contact_email,
        venue: t.venue,
        primaryColor: t.primary_color,
        secondaryColor: t.secondary_color,
        isActive: t.is_active,
        foundedYear: t.founded_year,
        description: t.description
      }));

      const players: Player[] = (playersRes.data || []).map(p => ({
        id: p.id,
        teamId: p.team_id,
        firstName: p.first_name,
        lastName: p.last_name,
        jerseyNumber: p.jersey_number,
        position: p.position,
        birthYear: p.birth_year,
        isActive: p.is_active,
        registrationNumber: p.registration_number
      }));

      const events: MatchEvent[] = (eventsRes.data || []).map(e => ({
        id: e.id,
        matchId: e.match_id,
        teamId: e.team_id,
        playerId: e.player_id,
        minute: e.minute,
        type: e.type,
        note: e.note
      }));

      const eventsByMatch: Record<string, MatchEvent[]> = {};
      events.forEach(ev => {
        if (!eventsByMatch[ev.matchId]) eventsByMatch[ev.matchId] = [];
        eventsByMatch[ev.matchId].push(ev);
      });

      const matches: Match[] = (matchesRes.data || []).map(m => ({
        id: m.id,
        seasonId: m.season_id,
        leagueId: m.league_id,
        round: m.round,
        homeTeamId: m.home_team_id,
        awayTeamId: m.away_team_id,
        date: m.date,
        time: m.time,
        venue: m.venue,
        status: m.status,
        homeScore: m.home_score,
        awayScore: m.away_score,
        homeHalftimeScore: m.home_halftime_score,
        awayHalftimeScore: m.away_halftime_score,
        organizerNotes: m.organizer_notes,
        referee: m.referee,
        events: eventsByMatch[m.id] || []
      }));

      const announcements: Announcement[] = (announcementsRes.data || []).map(a => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        content: a.content,
        coverImage: a.cover_image,
        date: a.date,
        isPinned: a.is_pinned,
        status: a.status,
        author: a.author
      }));

      const rules: RuleChapter[] = (rulesRes.data || []).map(r => ({
        id: r.id,
        title: r.title,
        order: r.order_num,
        content: r.content
      }));

      return {
        season: seasons[0],
        leagues,
        teams,
        players,
        matches,
        announcements,
        rules
      };
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      return null;
    }
  },

  // Seed or sync full database to Supabase
  async syncAllToSupabase(data: {
    season: Season;
    leagues: League[];
    teams: Team[];
    players: Player[];
    matches: Match[];
    announcements: Announcement[];
    rules: RuleChapter[];
  }): Promise<boolean> {
    try {
      // 1. Seasons
      await supabase.from('seasons').upsert([{
        id: data.season.id,
        name: data.season.name,
        is_active: data.season.isActive,
        is_archived: data.season.isArchived,
        start_date: data.season.startDate,
        end_date: data.season.endDate
      }]);

      // 2. Leagues
      await supabase.from('leagues').upsert(data.leagues.map(l => ({
        id: l.id,
        name: l.name,
        short_name: l.shortName,
        description: l.description,
        target_teams: l.targetTeams,
        season_id: l.seasonId,
        level: l.level
      })));

      // 3. Teams
      await supabase.from('teams').upsert(data.teams.map(t => ({
        id: t.id,
        name: t.name,
        short_name: t.shortName,
        logo: t.logo,
        league_id: t.leagueId,
        contact_name: t.contactName,
        contact_phone: t.contactPhone,
        contact_email: t.contactEmail,
        venue: t.venue,
        primary_color: t.primaryColor,
        secondary_color: t.secondaryColor,
        is_active: t.isActive,
        founded_year: t.foundedYear,
        description: t.description
      })));

      // 4. Players
      await supabase.from('players').upsert(data.players.map(p => ({
        id: p.id,
        team_id: p.teamId,
        first_name: p.firstName,
        last_name: p.lastName,
        jersey_number: p.jerseyNumber,
        position: p.position,
        birth_year: p.birthYear,
        is_active: p.isActive,
        registration_number: p.registrationNumber
      })));

      // 5. Matches
      await supabase.from('matches').upsert(data.matches.map(m => ({
        id: m.id,
        season_id: m.seasonId,
        league_id: m.leagueId,
        round: m.round,
        home_team_id: m.homeTeamId,
        away_team_id: m.awayTeamId,
        date: m.date,
        time: m.time,
        venue: m.venue,
        status: m.status,
        home_score: m.homeScore,
        away_score: m.awayScore,
        home_halftime_score: m.homeHalftimeScore,
        away_halftime_score: m.awayHalftimeScore,
        organizer_notes: m.organizerNotes,
        referee: m.referee
      })));

      // 6. Events
      const allEvents = data.matches.flatMap(m => m.events || []);
      if (allEvents.length > 0) {
        await supabase.from('match_events').upsert(allEvents.map(e => ({
          id: e.id,
          match_id: e.matchId,
          team_id: e.teamId,
          player_id: e.playerId,
          minute: e.minute,
          type: e.type,
          note: e.note
        })));
      }

      // 7. Announcements
      await supabase.from('announcements').upsert(data.announcements.map(a => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        content: a.content,
        cover_image: a.coverImage,
        date: a.date,
        is_pinned: a.isPinned,
        status: a.status,
        author: a.author
      })));

      // 8. Rules
      await supabase.from('rules').upsert(data.rules.map(r => ({
        id: r.id,
        title: r.title,
        order_num: r.order,
        content: r.content
      })));

      return true;
    } catch (err) {
      console.error('Error syncing data to Supabase:', err);
      return false;
    }
  },

  // Update match score in Supabase
  async saveMatchScore(matchId: string, homeScore: number, awayScore: number, homeHalf?: number | null, awayHalf?: number | null, status = 'finished', notes?: string) {
    try {
      await supabase.from('matches').update({
        home_score: homeScore,
        away_score: awayScore,
        home_halftime_score: homeHalf,
        away_halftime_score: awayHalf,
        status,
        organizer_notes: notes
      }).eq('id', matchId);
    } catch (err) {
      console.error('Error saving score to Supabase:', err);
    }
  },

  // Add event to Supabase
  async addEvent(event: MatchEvent) {
    try {
      await supabase.from('match_events').insert([{
        id: event.id,
        match_id: event.matchId,
        team_id: event.teamId,
        player_id: event.playerId,
        minute: event.minute,
        type: event.type,
        note: event.note
      }]);
    } catch (err) {
      console.error('Error adding event to Supabase:', err);
    }
  },

  // Delete event from Supabase
  async deleteEvent(eventId: string) {
    try {
      await supabase.from('match_events').delete().eq('id', eventId);
    } catch (err) {
      console.error('Error deleting event from Supabase:', err);
    }
  }
};
