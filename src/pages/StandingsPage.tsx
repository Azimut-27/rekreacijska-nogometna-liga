import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { calculateStandings } from '../utils/standings';
import { exportStandingsToExcel } from '../utils/exportImport';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Download,
  Printer,
  Sparkles,
  Info,
  HelpCircle,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export const StandingsPage: React.FC = () => {
  const { teams, matches } = useData();
  const { activeLeagueId, activeLeague } = useLeague();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  // Standings
  const standings = useMemo(() => {
    return calculateStandings(teams, matches, activeLeagueId);
  }, [teams, matches, activeLeagueId]);

  const handleExport = () => {
    exportStandingsToExcel(standings, activeLeague.name);
  };

  const handleCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Prvenstvena lestvica
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeLeague.name} • {standings.length} aktivnih ekip • Samodejni izračun po uradnih pravilih
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          {/* Mobile view switcher */}
          <div className="sm:hidden flex rounded-xl bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              title="Tabela"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              title="Kartice"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCelebration}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
            title="Praznuj vodilno ekipo!"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Praznuj prvaka</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Natisni</span>
          </button>
        </div>
      </div>

      {/* Criteria Info Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Točkovanje:</strong> Zmaga (3), Neodločeno (1), Poraz (0). Ob enakih točkah: 1. Medsebojne tekme, 2. Gol razlika, 3. Dani goli, 4. Manj kartonov.
          </span>
        </div>
        <Link
          to="/pravila#pravilo-3"
          className="text-emerald-400 hover:text-emerald-300 font-semibold shrink-0"
        >
          Podrobna merila →
        </Link>
      </div>

      {/* Standings Table (Desktop / Mobile responsive) */}
      <div className={`${viewMode === 'cards' ? 'hidden sm:block' : 'block'}`}>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 pl-4 pr-2 text-center w-12">Mesto</th>
                  <th className="py-3.5 px-3">Ekipa</th>
                  <th className="py-3.5 px-3 text-center" title="Odigrane tekme">OT</th>
                  <th className="py-3.5 px-3 text-center" title="Zmage">Z</th>
                  <th className="py-3.5 px-3 text-center" title="Neodločeni izidi">N</th>
                  <th className="py-3.5 px-3 text-center" title="Porazi">P</th>
                  <th className="py-3.5 px-3 text-center" title="Dani zadetki">DG</th>
                  <th className="py-3.5 px-3 text-center" title="Prejeti zadetki">PG</th>
                  <th className="py-3.5 px-3 text-center" title="Razlika v zadetkih">GR</th>
                  <th className="py-3.5 px-4 text-center font-black text-emerald-400" title="Točke">TOČ</th>
                  <th className="py-3.5 pr-4 pl-3 text-center">Forma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {standings.map((row) => {
                  const isFirst = row.rank === 1;
                  const isTopPromotion = row.rank <= 2 && activeLeagueId !== '1';
                  const isRelegation = row.rank >= standings.length - 1 && activeLeagueId === '1';

                  let rowBg = 'hover:bg-slate-800/50';
                  if (isFirst) rowBg = 'bg-amber-500/5 hover:bg-amber-500/10';

                  return (
                    <tr key={row.teamId} className={`transition-colors ${rowBg}`}>
                      {/* Rank */}
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <span
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs font-score ${
                            isFirst
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : isTopPromotion
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isRelegation
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          {row.rank}
                        </span>
                      </td>

                      {/* Team name & badge */}
                      <td className="py-3.5 px-3">
                        <Link
                          to={`/ekipe/${row.teamId}`}
                          className="flex items-center gap-3 group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold shadow shrink-0 border border-white/10"
                            style={{ backgroundColor: row.team.primaryColor }}
                          >
                            {row.team.logo}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {row.team.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {row.team.venue}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-3 text-center text-slate-300 font-score">{row.played}</td>
                      <td className="py-3.5 px-3 text-center text-slate-300 font-score">{row.won}</td>
                      <td className="py-3.5 px-3 text-center text-slate-300 font-score">{row.drawn}</td>
                      <td className="py-3.5 px-3 text-center text-slate-300 font-score">{row.lost}</td>
                      <td className="py-3.5 px-3 text-center text-slate-300 font-score">{row.goalsFor}</td>
                      <td className="py-3.5 px-3 text-center text-slate-300 font-score">{row.goalsAgainst}</td>
                      <td className={`py-3.5 px-3 text-center font-bold font-score ${row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-black text-base sm:text-lg text-white font-score px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 inline-block min-w-10">
                          {row.points}
                        </span>
                      </td>

                      {/* Form */}
                      <td className="py-3.5 pr-4 pl-3 text-center">
                        {row.form.length > 0 ? (
                          <div className="inline-flex gap-1">
                            {row.form.map((f, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                  f === 'W'
                                    ? 'bg-emerald-600 text-white'
                                    : f === 'D'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-rose-600 text-white'
                                }`}
                                title={f === 'W' ? 'Zmaga' : f === 'D' ? 'Neodločeno' : 'Poraz'}
                              >
                                {f === 'W' ? 'Z' : f === 'D' ? 'N' : 'P'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">/</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View (shown when cards mode is active on phone) */}
      <div className={`space-y-3 sm:hidden ${viewMode === 'table' ? 'hidden' : 'block'}`}>
        {standings.map((row) => (
          <Link
            key={row.teamId}
            to={`/ekipe/${row.teamId}`}
            className="block p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs font-score ${row.rank === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                  {row.rank}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold shadow"
                  style={{ backgroundColor: row.team.primaryColor }}
                >
                  {row.team.logo}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{row.team.name}</div>
                  <div className="text-[10px] text-slate-400">{row.team.venue}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-emerald-400 font-score">
                  {row.points} <span className="text-[10px] text-slate-400">TOČ</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center text-xs">
              <div>
                <div className="text-[10px] text-slate-500">OT</div>
                <div className="font-bold text-white font-score">{row.played}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Z-N-P</div>
                <div className="font-bold text-white font-score">{row.won}-{row.drawn}-{row.lost}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Goli</div>
                <div className="font-bold text-white font-score">{row.goalsFor}:{row.goalsAgainst}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">GR</div>
                <div className={`font-bold font-score ${row.goalDifference > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Legend / Info bar */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 space-y-1.5">
        <div className="font-semibold text-white mb-1">Legenda:</div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
            <span>Prvak lige / 1. mesto</span>
          </div>
          {activeLeagueId !== '1' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span>Mesta za napredovanje v višjo ligo</span>
            </div>
          )}
          {activeLeagueId === '1' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
              <span>Izpad v nižjo ligo</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">Z</span>
            <span>Zmaga (3 točke)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-600 text-white font-bold text-[9px] flex items-center justify-center">N</span>
            <span>Neodločeno (1 točka)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">P</span>
            <span>Poraz (0 točk)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
