import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { calculateTopScorers } from '../utils/standings';
import { exportTopScorersToExcel } from '../utils/exportImport';
import { Award, Flame, Download, Printer, User, Filter, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopScorersPage: React.FC = () => {
  const { teams, players, matches } = useData();
  const { activeLeagueId, activeLeague } = useLeague();
  const [showOnlyTop5, setShowOnlyTop5] = useState(false);

  // Scorers list for active league
  const allScorers = useMemo(() => {
    return calculateTopScorers(teams, players, matches, activeLeagueId);
  }, [teams, players, matches, activeLeagueId]);

  const displayedScorers = useMemo(() => {
    return showOnlyTop5 ? allScorers.slice(0, 5) : allScorers;
  }, [allScorers, showOnlyTop5]);

  const top3 = allScorers.slice(0, 3);

  const handleExport = () => {
    exportTopScorersToExcel(allScorers, activeLeague.name);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Lestvica strelcev
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeLeague.name} • {allScorers.length} igralcev z doseženim zadetkom
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          {/* Top 5 toggle */}
          <div className="flex rounded-xl bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setShowOnlyTop5(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !showOnlyTop5 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vsi strelci
            </button>
            <button
              onClick={() => setShowOnlyTop5(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showOnlyTop5 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 5
            </button>
          </div>

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

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="sm:order-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between text-center relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow">
                2
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {top3[1].playerName}
                </h3>
                <Link
                  to={`/ekipe/${top3[1].teamId}`}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-block mt-1 font-medium"
                >
                  {top3[1].teamName}
                </Link>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-2xl font-black text-white font-score">
                  {top3[1].goals} <span className="text-xs text-slate-400 font-sans font-normal">golov</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {top3[1].matchesPlayed} tekem • povprečje {top3[1].averagePerMatch} / tekmo
                </div>
              </div>
            </div>
          )}

          {/* 1st Place (Gold / Center) */}
          {top3[0] && (
            <div className="sm:order-2 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between text-center relative overflow-hidden scale-100 sm:-translate-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
                <Star className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                  ZLATA KOPAČKA LIGE
                </div>
                <h3 className="font-black text-white text-lg sm:text-xl leading-tight">
                  {top3[0].playerName}
                </h3>
                <Link
                  to={`/ekipe/${top3[0].teamId}`}
                  className="text-xs text-amber-300/80 hover:text-amber-300 transition-colors inline-block mt-1 font-medium"
                >
                  {top3[0].teamName}
                </Link>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="text-3xl font-black text-amber-400 font-score">
                  {top3[0].goals} <span className="text-xs text-slate-400 font-sans font-normal">golov</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {top3[0].matchesPlayed} tekem • povprečje {top3[0].averagePerMatch} / tekmo
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="sm:order-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between text-center relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-3 shadow">
                3
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {top3[2].playerName}
                </h3>
                <Link
                  to={`/ekipe/${top3[2].teamId}`}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-block mt-1 font-medium"
                >
                  {top3[2].teamName}
                </Link>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-2xl font-black text-white font-score">
                  {top3[2].goals} <span className="text-xs text-slate-400 font-sans font-normal">golov</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {top3[2].matchesPlayed} tekem • povprečje {top3[2].averagePerMatch} / tekmo
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scorers Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-3.5 pl-4 pr-2 text-center w-12">Mesto</th>
                <th className="py-3.5 px-4">Igralec</th>
                <th className="py-3.5 px-4">Ekipa</th>
                <th className="py-3.5 px-4 text-center">Zadetki</th>
                <th className="py-3.5 px-4 text-center">Z 11m</th>
                <th className="py-3.5 px-4 text-center">Odigrane tekme</th>
                <th className="py-3.5 pr-4 pl-3 text-center">Povprečje / tekmo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {displayedScorers.length > 0 ? (
                displayedScorers.map((scorer) => {
                  const isTop = scorer.rank === 1;

                  return (
                    <tr
                      key={scorer.playerId}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isTop ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <span
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs font-score ${
                            scorer.rank === 1
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : scorer.rank === 2
                              ? 'bg-slate-400 text-slate-950'
                              : scorer.rank === 3
                              ? 'bg-amber-800 text-white'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          {scorer.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {scorer.playerName}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          to={`/ekipe/${scorer.teamId}`}
                          className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: scorer.teamColor }}
                          />
                          <span>{scorer.teamName}</span>
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-emerald-400 font-score text-base">
                        {scorer.goals}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-400 font-score">
                        {scorer.penaltyGoals > 0 ? scorer.penaltyGoals : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-300 font-score">
                        {scorer.matchesPlayed}
                      </td>

                      <td className="py-3.5 pr-4 pl-3 text-center text-slate-300 font-score font-semibold">
                        {scorer.averagePerMatch}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    V tej ligi še ni zabeleženih zadetkov.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
