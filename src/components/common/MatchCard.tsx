import React from 'react';
import { Link } from 'react-router-dom';
import { Match, Team } from '../../types';
import { formatDateSl, formatTimeSl, getMatchStatusBadgeClasses, getMatchStatusLabel } from '../../utils/formatters';
import { MapPin, Calendar, Clock, ChevronRight, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MatchCardProps {
  match: Match;
  teams: Team[];
  onQuickScore?: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, teams, onQuickScore }) => {
  const { canEditScores } = useAuth();
  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  const isFinished = match.status === 'finished';
  const isLive = match.status === 'in_progress';

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg transition-all hover:shadow-emerald-950/20 group relative overflow-hidden">
      {/* Decorative top accent colored line based on home team primary color */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-80"
        style={{
          background: `linear-gradient(90deg, ${homeTeam?.primaryColor || '#10b981'}, ${awayTeam?.primaryColor || '#0284c7'})`
        }}
      />

      {/* Top info header: Round, Date, Status */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
            {match.round}. krog
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {formatDateSl(match.date)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getMatchStatusBadgeClasses(match.status)}`}>
            {getMatchStatusLabel(match.status)}
          </span>

          {canEditScores && onQuickScore && (
            <button
              onClick={() => onQuickScore(match)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-300 transition-colors border border-slate-700"
              title="Hitri vnos rezultata"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Matchup row */}
      <Link to={`/tekme/${match.id}`} className="block">
        <div className="grid grid-cols-12 items-center gap-2 py-2">
          {/* Home team */}
          <div className="col-span-5 flex items-center gap-2.5 sm:gap-3">
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-md border border-white/10 shrink-0"
              style={{ backgroundColor: homeTeam?.primaryColor || '#1e293b' }}
            >
              {homeTeam?.logo || '⚽'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm sm:text-base leading-snug truncate group-hover:text-emerald-400 transition-colors">
                {homeTeam?.name || 'Domača ekipa'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {homeTeam?.shortName}
              </div>
            </div>
          </div>

          {/* Score or Time in middle */}
          <div className="col-span-2 flex flex-col items-center justify-center text-center">
            {isFinished || isLive ? (
              <div>
                <div className={`text-xl sm:text-2xl font-black font-score tracking-wider ${isLive ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
                  {match.homeScore} : {match.awayScore}
                </div>
                {match.homeHalftimeScore !== null && match.homeHalftimeScore !== undefined && (
                  <div className="text-[10px] text-slate-400 font-medium">
                    ({match.homeHalftimeScore}:{match.awayHalftimeScore})
                  </div>
                )}
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-center">
                <span className="text-xs font-bold text-white flex items-center gap-1 font-score">
                  <Clock className="w-3 h-3 text-emerald-400 inline" />
                  {formatTimeSl(match.time)}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="col-span-5 flex items-center justify-end gap-2.5 sm:gap-3 text-right">
            <div className="min-w-0">
              <div className="font-bold text-white text-sm sm:text-base leading-snug truncate group-hover:text-emerald-400 transition-colors">
                {awayTeam?.name || 'Gostujoča ekipa'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {awayTeam?.shortName}
              </div>
            </div>
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-md border border-white/10 shrink-0"
              style={{ backgroundColor: awayTeam?.primaryColor || '#1e293b' }}
            >
              {awayTeam?.logo || '⚽'}
            </div>
          </div>
        </div>
      </Link>

      {/* Bottom meta row: Venue & Details Link */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate pr-2">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>

        <Link
          to={`/tekme/${match.id}`}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold shrink-0 group-hover:translate-x-0.5 transition-all text-[11px]"
        >
          Podrobnosti <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
