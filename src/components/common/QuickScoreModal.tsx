import React, { useState, useEffect } from 'react';
import { Match, Team, MatchStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { X, Save, Trophy } from 'lucide-react';

interface QuickScoreModalProps {
  match: Match | null;
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
}

export const QuickScoreModal: React.FC<QuickScoreModalProps> = ({
  match,
  teams,
  isOpen,
  onClose
}) => {
  const { updateMatchScore } = useData();

  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homeHalf, setHomeHalf] = useState<number | ''>('');
  const [awayHalf, setAwayHalf] = useState<number | ''>('');
  const [status, setStatus] = useState<MatchStatus>('finished');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setHomeHalf(match.homeHalftimeScore ?? '');
      setAwayHalf(match.awayHalftimeScore ?? '');
      setStatus(match.status === 'scheduled' ? 'finished' : match.status);
      setNotes(match.organizerNotes ?? '');
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMatchScore(
      match.id,
      homeScore,
      awayScore,
      homeHalf === '' ? null : Number(homeHalf),
      awayHalf === '' ? null : Number(awayHalf),
      status,
      notes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Vnos / Popravek rezultata</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Teams Header Banner */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 grid grid-cols-5 items-center gap-2 text-center">
            <div className="col-span-2">
              <div className="text-xl mb-1">{homeTeam?.logo || '⚽'}</div>
              <div className="font-bold text-white text-sm truncate">{homeTeam?.name}</div>
            </div>
            <div className="col-span-1 text-slate-400 font-bold text-xs uppercase tracking-wider">
              VS
            </div>
            <div className="col-span-2">
              <div className="text-xl mb-1">{awayTeam?.logo || '⚽'}</div>
              <div className="font-bold text-white text-sm truncate">{awayTeam?.name}</div>
            </div>
          </div>

          {/* Full-time score inputs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 text-center">
              Končni rezultat
            </label>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 h-16 text-center text-3xl font-black bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white outline-none font-score"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Domači</span>
              </div>
              <span className="text-2xl font-bold text-slate-500">:</span>
              <div className="text-center">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 h-16 text-center text-3xl font-black bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white outline-none font-score"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Gostje</span>
              </div>
            </div>
          </div>

          {/* Half-time score (optional) */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 text-center">
              Rezultat ob polčasu (neobvezno)
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="0"
                max="99"
                placeholder="0"
                value={homeHalf}
                onChange={(e) => setHomeHalf(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-12 h-10 text-center text-sm font-bold bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
              <span className="text-slate-500">:</span>
              <input
                type="number"
                min="0"
                max="99"
                placeholder="0"
                value={awayHalf}
                onChange={(e) => setAwayHalf(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-12 h-10 text-center text-sm font-bold bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Status tekme</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MatchStatus)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
            >
              <option value="finished">Zaključena (Upoštevaj za lestvico)</option>
              <option value="in_progress">V teku (V ŽIVO)</option>
              <option value="scheduled">Napovedana</option>
              <option value="postponed">Prestavljena</option>
              <option value="cancelled">Odpovedana</option>
            </select>
          </div>

          {/* Organizer Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Opombe organizatorja</label>
            <input
              type="text"
              placeholder="npr. Tekma brez incidentov, poškodba igralca v 30. min..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium"
            >
              Prekliči
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Shrani rezultat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
