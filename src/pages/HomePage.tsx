import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { calculateStandings, calculateTopScorers } from '../utils/standings';
import { MatchCard } from '../components/common/MatchCard';
import { QuickScoreModal } from '../components/common/QuickScoreModal';
import { Match } from '../types';
import { formatDateSl } from '../utils/formatters';
import {
  Trophy,
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
  Flame,
  Bell,
  ChevronRight,
  Shield,
  Zap,
  Star
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { season, leagues, teams, players, matches, announcements } = useData();
  const { activeLeagueId, setActiveLeagueId } = useLeague();
  const [selectedQuickMatch, setSelectedQuickMatch] = useState<Match | null>(null);

  // Calculate leaders for each league
  const leagueLeaders = leagues.map((league) => {
    const standings = calculateStandings(teams, matches, league.id);
    const leader = standings[0];
    return {
      league,
      leader: leader || null
    };
  });

  // Calculate top 5 scorers for each league
  const leagueScorers = leagues.map((league) => {
    const scorers = calculateTopScorers(teams, players, matches, league.id).slice(0, 5);
    return {
      league,
      scorers
    };
  });

  // Recent results in active league
  const recentResults = matches
    .filter(m => m.leagueId === activeLeagueId && m.status === 'finished')
    .sort((a, b) => b.round - a.round || b.date.localeCompare(a.date))
    .slice(0, 4);

  // Next upcoming or live matches in active league
  const upcomingMatches = matches
    .filter(m => m.leagueId === activeLeagueId && (m.status === 'scheduled' || m.status === 'in_progress'))
    .sort((a, b) => a.round - b.round || a.date.localeCompare(b.date))
    .slice(0, 4);

  // Latest announcements (published, latest first)
  const publishedAnnouncements = announcements
    .filter(a => a.status === 'published')
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Zap className="w-3.5 h-3.5" /> Uradno tekmovanje • Sezona {season.name}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-score">
            MEDOBČINSKA REKREACIJSKA <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              NOGOMETNA LIGA
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
            Dobrodošli v osrednjem spletnem portalu rekreativnega nogometa. 26 ekip, 3 tekmovalne lige,
            rezultati v živo, statistika strelcev in ažurne prvenstvene lestvice.
          </p>

          {/* Quick links buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/razpored"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4" />
              Razpored tekem
            </Link>
            <Link
              to="/rezultati"
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm transition-all border border-slate-700 flex items-center gap-2 hover:scale-[1.02]"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              Zadnji rezultati
            </Link>
            <Link
              to="/lestvice"
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm transition-all border border-slate-700 flex items-center gap-2 hover:scale-[1.02]"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Prvenstvene lestvice
            </Link>
          </div>
        </div>
      </section>

      {/* Leaders of Each League (Vodilna ekipa vsake lige) */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Vodilne ekipe po ligah
              </h2>
              <p className="text-xs text-slate-400">Trenutno 1. mesto na prvenstvenih lestvicah</p>
            </div>
          </div>
          <Link
            to="/lestvice"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Vse lestvice <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leagueLeaders.map(({ league, leader }) => {
            const isCurrentActive = league.id === activeLeagueId;
            return (
              <div
                key={league.id}
                onClick={() => setActiveLeagueId(league.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isCurrentActive
                    ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {league.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300" /> 1. MESTO
                  </span>
                </div>

                {leader ? (
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold shadow-md border border-white/10"
                        style={{ backgroundColor: leader.team.primaryColor }}
                      >
                        {leader.team.logo}
                      </div>
                      <div>
                        <Link
                          to={`/ekipe/${leader.team.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors hover:underline block leading-snug"
                        >
                          {leader.team.name}
                        </Link>
                        <div className="text-xs text-slate-400">
                          {leader.team.venue}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px]">Tekme</div>
                        <div className="font-bold text-white font-score">{leader.played}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Z-N-P</div>
                        <div className="font-bold text-white font-score">{leader.won}-{leader.drawn}-{leader.lost}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Gol razlika</div>
                        <div className="font-bold text-emerald-400 font-score">
                          {leader.goalDifference > 0 ? `+${leader.goalDifference}` : leader.goalDifference}
                        </div>
                      </div>
                      <div>
                        <div className="text-amber-400 font-semibold text-[10px]">TOČKE</div>
                        <div className="font-black text-white text-sm font-score">{leader.points}</div>
                      </div>
                    </div>

                    {leader.form.length > 0 && (
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Forma:</span>
                        <div className="flex gap-1">
                          {leader.form.map((f, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                f === 'W'
                                  ? 'bg-emerald-600 text-white'
                                  : f === 'D'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {f === 'W' ? 'Z' : f === 'D' ? 'N' : 'P'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    V tej ligi še ni zaključenih tekem.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Upcoming Matches & Recent Results */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-xl text-white">Naslednje tekme</h3>
            </div>
            <Link
              to="/razpored"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Celoten razpored <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  teams={teams}
                  onQuickScore={(match) => setSelectedQuickMatch(match)}
                />
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                V tej ligi trenutno ni napovedanih tekem.
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-xl text-white">Zadnji rezultati</h3>
            </div>
            <Link
              to="/rezultati"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Vsi rezultati <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentResults.length > 0 ? (
              recentResults.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  teams={teams}
                  onQuickScore={(match) => setSelectedQuickMatch(match)}
                />
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                Za to ligo še ni vnesenih rezultatov.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top 5 Scorers per League (Najboljših pet strelcev vsake lige) */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Najboljših 5 strelcev po ligah
              </h2>
              <p className="text-xs text-slate-400">Vodilni golgeterji vseh treh tekmovanj</p>
            </div>
          </div>
          <Link
            to="/strelci"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Celotna lestvica strelcev <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leagueScorers.map(({ league, scorers }) => (
            <div
              key={league.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="font-bold text-sm text-white">{league.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    TOP 5
                  </span>
                </div>

                {scorers.length > 0 ? (
                  <div className="space-y-2">
                    {scorers.map((scorer, idx) => (
                      <div
                        key={scorer.playerId}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center text-xs font-black ${
                              idx === 0
                                ? 'bg-amber-500 text-slate-950'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <div className="font-semibold text-xs text-white truncate">
                              {scorer.playerName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {scorer.teamName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-sm text-emerald-400 font-score">
                            {scorer.goals}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">golov</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    V tej ligi še ni zabeleženih zadetkov.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
                <Link
                  to="/strelci"
                  onClick={() => setActiveLeagueId(league.id)}
                  className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Poglej vse strelce {league.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements Section (Zadnja obvestila) */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Zadnja obvestila in novice
              </h2>
              <p className="text-xs text-slate-400">Pomembne informacije za vodstva ekip in igralce</p>
            </div>
          </div>
          <Link
            to="/obvestila"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Vsa obvestila <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedAnnouncements.map((ann) => (
            <Link
              key={ann.id}
              to={`/obvestila#${ann.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDateSl(ann.date)}
                  </span>
                  {ann.isPinned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      POMEMBNO
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {ann.summary || ann.content}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-3 border-t border-slate-800/80">
                <span>Preberi več</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

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
