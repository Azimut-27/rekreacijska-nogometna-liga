import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/common/MatchCard';
import { QuickScoreModal } from '../components/common/QuickScoreModal';
import { Match } from '../types';
import { exportScheduleToExcel } from '../utils/exportImport';
import {
  Calendar,
  Filter,
  Download,
  Printer,
  Sparkles,
  Coffee,
  Search,
  Plus
} from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const { matches, teams, leagues } = useData();
  const { activeLeagueId, activeLeague } = useLeague();
  const { canManageAll, canEditScores } = useAuth();

  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedQuickMatch, setSelectedQuickMatch] = useState<Match | null>(null);

  // Teams in current league
  const leagueTeams = useMemo(() => {
    return teams.filter(t => t.leagueId === activeLeagueId);
  }, [teams, activeLeagueId]);

  // Matches in active league
  const leagueMatches = useMemo(() => {
    return matches.filter(m => m.leagueId === activeLeagueId);
  }, [matches, activeLeagueId]);

  // Available rounds
  const availableRounds = useMemo(() => {
    const roundsSet = new Set(leagueMatches.map(m => m.round));
    return Array.from(roundsSet).sort((a, b) => a - b);
  }, [leagueMatches]);

  // Available venues
  const availableVenues = useMemo(() => {
    const venueSet = new Set(leagueMatches.map(m => m.venue).filter(Boolean));
    return Array.from(venueSet);
  }, [leagueMatches]);

  // Determine Bye (Prosta ekipa) for selected round in odd-numbered leagues
  const byeTeamInfo = useMemo(() => {
    if (selectedRound === 'all') return null;
    if (leagueTeams.length % 2 === 0) return null; // Even number of teams, no bye

    const roundMatches = leagueMatches.filter(m => m.round === selectedRound);
    const playingTeamIds = new Set<string>();
    roundMatches.forEach(m => {
      playingTeamIds.add(m.homeTeamId);
      playingTeamIds.add(m.awayTeamId);
    });

    const freeTeam = leagueTeams.find(t => !playingTeamIds.has(t.id));
    return freeTeam || null;
  }, [selectedRound, leagueTeams, leagueMatches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return leagueMatches.filter(m => {
      if (selectedRound !== 'all' && m.round !== selectedRound) return false;
      if (selectedTeamId !== 'all' && m.homeTeamId !== selectedTeamId && m.awayTeamId !== selectedTeamId) {
        return false;
      }
      if (selectedVenue !== 'all' && m.venue !== selectedVenue) return false;
      if (selectedDate && m.date !== selectedDate) return false;
      return true;
    }).sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  }, [leagueMatches, selectedRound, selectedTeamId, selectedVenue, selectedDate]);

  // Group matches by round for display
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    filteredMatches.forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return grouped;
  }, [filteredMatches]);

  const handleExportExcel = () => {
    exportScheduleToExcel(filteredMatches, teams, activeLeague.name);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Razpored tekem
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeLeague.name} • {leagueTeams.length} ekip • {leagueMatches.length} vseh tekem
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
            title="Izvozi v Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
            title="Natisni ali shrani kot PDF"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Natisni / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 no-print">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          Filtri razporeda
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Round selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Krog tekmovanja</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">Vsi krogi ({availableRounds.length})</option>
              {availableRounds.map(r => (
                <option key={r} value={r}>{r}. krog</option>
              ))}
            </select>
          </div>

          {/* Team filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Ekipa</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">Vse ekipe ({leagueTeams.length})</option>
              {leagueTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Venue filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Prizorišče</label>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">Vsa prizorišča</option>
              {availableVenues.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Datum tekme</label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Počisti
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Free Team / Bye Banner (Pri 9 ekipah v vsakem krogu) */}
      {byeTeamInfo && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-200 animate-fade-in shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>Prosta ekipa v {selectedRound}. krogu:</span>
              <span className="text-amber-400 underline">{byeTeamInfo.name}</span>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Liga šteje 9 ekip, zato v tem krogu ekipa počiva in nima tekmovalne obveznosti.
            </p>
          </div>
        </div>
      )}

      {/* Matches List Grouped by Round */}
      {Object.keys(matchesByRound).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(matchesByRound).map(([roundStr, roundMatches]) => {
            const rNum = Number(roundStr);

            // Find bye team for this specific round if not already selected
            let roundByeTeam = null;
            if (leagueTeams.length % 2 !== 0) {
              const played = new Set<string>();
              roundMatches.forEach(m => {
                played.add(m.homeTeamId);
                played.add(m.awayTeamId);
              });
              roundByeTeam = leagueTeams.find(t => !played.has(t.id));
            }

            return (
              <div key={rNum} className="space-y-3 print-card">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-score tracking-wider">
                      {rNum}. KROG
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({roundMatches.length} tekem)
                    </span>
                  </div>

                  {roundByeTeam && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Prosta ekipa: <strong className="text-white">{roundByeTeam.name}</strong></span>
                    </div>
                  )}
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
          <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-bold text-white text-base">Ni najdenih tekem</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Za izbrane filtre ni bilo najdenih tekem. Poskusite ponastaviti filtre ali izbrati drug krog.
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
