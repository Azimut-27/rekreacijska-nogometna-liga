import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/common/MatchCard';
import { QuickScoreModal } from '../components/common/QuickScoreModal';
import { Match } from '../types';
import { exportResultsToExcel } from '../utils/exportImport';
import {
  Award,
  Filter,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { matches, teams, players } = useData();
  const { activeLeagueId, activeLeague } = useLeague();
  const { canEditScores } = useAuth();

  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [selectedQuickMatch, setSelectedQuickMatch] = useState<Match | null>(null);

  const leagueTeams = useMemo(() => {
    return teams.filter(t => t.leagueId === activeLeagueId);
  }, [teams, activeLeagueId]);

  // Finished matches in active league
  const finishedMatches = useMemo(() => {
    return matches.filter(m => m.leagueId === activeLeagueId && m.status === 'finished');
  }, [matches, activeLeagueId]);

  // Available completed rounds
  const availableRounds = useMemo(() => {
    const roundsSet = new Set(finishedMatches.map(m => m.round));
    return Array.from(roundsSet).sort((a, b) => b - a); // latest first
  }, [finishedMatches]);

  // Filtered results
  const filteredResults = useMemo(() => {
    return finishedMatches.filter(m => {
      if (selectedRound !== 'all' && m.round !== selectedRound) return false;
      if (selectedTeamId !== 'all' && m.homeTeamId !== selectedTeamId && m.awayTeamId !== selectedTeamId) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.round !== b.round) return b.round - a.round;
      return b.date.localeCompare(a.date);
    });
  }, [finishedMatches, selectedRound, selectedTeamId]);

  // Group by round
  const resultsByRound = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    filteredResults.forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return grouped;
  }, [filteredResults]);

  const handleExport = () => {
    exportResultsToExcel(filteredResults, teams, activeLeague.name);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rezultati tekem
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeLeague.name} • {finishedMatches.length} zaključenih tekem
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Izvozi rezultate</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Natisni</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 no-print">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          Filtri rezultatov
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Krog</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">Vsi odigrani krogi</option>
              {availableRounds.map(r => (
                <option key={r} value={r}>{r}. krog</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Ekipa</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">Vse ekipe ({leagueTeams.length})</option>
              {leagueTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {Object.keys(resultsByRound).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(resultsByRound).map(([roundStr, roundMatches]) => {
            const rNum = Number(roundStr);

            return (
              <div key={rNum} className="space-y-3 print-card">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-score tracking-wider">
                      REZULTATI {rNum}. KROGA
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({roundMatches.length} zaključenih tekem)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roundMatches.map(m => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      teams={teams}
                      onQuickScore={(match) => setSelectedQuickMatch(match)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Award className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-bold text-white text-base">Ni najdenih rezultatov</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Za izbrane filtre še ni vnesenih zaključenih rezultatov.
          </p>
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
