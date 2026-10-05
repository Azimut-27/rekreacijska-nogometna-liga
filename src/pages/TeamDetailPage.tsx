import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { calculateStandings } from '../utils/standings';
import { MatchCard } from '../components/common/MatchCard';
import { QuickScoreModal } from '../components/common/QuickScoreModal';
import { Match, Player } from '../types';
import {
  Users,
  MapPin,
  Phone,
  Mail,
  Trophy,
  Calendar,
  Award,
  ArrowLeft,
  Flame,
  Shield,
  Edit3
} from 'lucide-react';

export const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teams, players, matches, leagues } = useData();
  const { canEditTeam } = useAuth();

  const [activeTab, setActiveTab] = useState<'squad' | 'matches' | 'scorers'>('squad');
  const [selectedQuickMatch, setSelectedQuickMatch] = useState<Match | null>(null);

  const team = teams.find(t => t.id === id);

  if (!team) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Ekipa ni bila najdena</h2>
        <p className="text-slate-400 text-sm">Preverite veljavnost povezave ali poiščite ekipo v katalogu.</p>
        <Link to="/ekipe" className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Nazaj na seznam ekip
        </Link>
      </div>
    );
  }

  const league = leagues.find(l => l.id === team.leagueId);
  const squad = players.filter(p => p.teamId === team.id);

  // Standings rank for this team
  const standings = calculateStandings(teams, matches, team.leagueId);
  const teamRow = standings.find(r => r.teamId === team.id);

  // Team matches
  const teamMatches = matches
    .filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id)
    .sort((a, b) => a.round - b.round || a.date.localeCompare(b.date));

  // Team goals from events
  const teamGoalsCount: Record<string, number> = {};
  matches.forEach(m => {
    if (m.events) {
      m.events.forEach(ev => {
        if (ev.teamId === team.id && (ev.type === 'goal' || ev.type === 'penalty_goal')) {
          teamGoalsCount[ev.playerId] = (teamGoalsCount[ev.playerId] || 0) + 1;
        }
      });
    }
  });

  // Top scorers of this team
  const teamScorers = squad
    .map(p => ({
      player: p,
      goals: teamGoalsCount[p.id] || 0
    }))
    .filter(s => s.goals > 0)
    .sort((a, b) => b.goals - a.goals);

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Nazaj na ekipe
        </button>
      </div>

      {/* Team Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Kit color top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: team.primaryColor || '#10b981' }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-xl border border-white/10 shrink-0"
              style={{ backgroundColor: team.primaryColor || '#1e293b' }}
            >
              {team.logo || '⚽'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {league?.name}
                </span>
                <span className="text-xs font-bold text-slate-400 font-score">
                  {team.shortName}
                </span>
                {team.foundedYear && (
                  <span className="text-xs text-slate-500">
                    Ustanovljeno {team.foundedYear}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {team.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{team.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vodja: {team.contactName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{team.contactPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standings Summary Box */}
          {teamRow && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-6 sm:shrink-0">
              <div className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Mesto
                </div>
                <div className="text-3xl font-black text-amber-400 font-score">
                  {teamRow.rank}.
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Točke
                </div>
                <div className="text-3xl font-black text-white font-score">
                  {teamRow.points}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Z-N-P
                </div>
                <div className="text-base font-bold text-slate-300 font-score">
                  {teamRow.won}-{teamRow.drawn}-{teamRow.lost}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('squad')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'squad'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Seznam igralcev ({squad.length})
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'matches'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Tekme in rezultati ({teamMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('scorers')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'scorers'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          Strelci ekipe ({teamScorers.length})
        </button>
      </div>

      {/* Tab 1: Squad List */}
      {activeTab === 'squad' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 pl-4 pr-2 text-center w-12">Št.</th>
                  <th className="py-3.5 px-4">Ime in priimek</th>
                  <th className="py-3.5 px-4">Položaj</th>
                  <th className="py-3.5 px-4 text-center">Rojstvo</th>
                  <th className="py-3.5 px-4 text-center">Goli</th>
                  <th className="py-3.5 pr-4 pl-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {squad.map((player) => {
                  const goals = teamGoalsCount[player.id] || 0;
                  return (
                    <tr key={player.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs font-score bg-slate-800 text-slate-200">
                          #{player.jerseyNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {player.firstName} {player.lastName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          player.position === 'Vratar'
                            ? 'bg-amber-500/20 text-amber-300'
                            : player.position === 'Napadalec'
                            ? 'bg-rose-500/20 text-rose-300'
                            : player.position === 'Branilec'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-score">
                        {player.birthYear || '/'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-score text-emerald-400">
                        {goals > 0 ? goals : '-'}
                      </td>
                      <td className="py-3.5 pr-4 pl-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          REGISTRIRAN
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Team Matches */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMatches.map(m => (
            <MatchCard
              key={m.id}
              match={m}
              teams={teams}
              onQuickScore={(match) => setSelectedQuickMatch(match)}
            />
          ))}
        </div>
      )}

      {/* Tab 3: Team Scorers */}
      {activeTab === 'scorers' && (
        <div className="space-y-3">
          {teamScorers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamScorers.map(({ player, goals }) => (
                <div
                  key={player.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center font-score">
                      #{player.jerseyNumber}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {player.position}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-400 font-score">
                      {goals}
                    </div>
                    <div className="text-[10px] text-slate-400">golov</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-sm">
              Ekipa v tej sezoni še ni dosegla zadetka.
            </div>
          )}
        </div>
      )}

      {/* Quick Score Modal */}
      <QuickScoreModal
        match={selectedQuickMatch}
        teams={teams}
        isOpen={!!selectedQuickMatch}
        onClose={() => setSelectedQuickMatch(null)}
      />
    </div>
  );
};
