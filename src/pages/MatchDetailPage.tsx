import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDateSl, formatTimeSl, getMatchStatusBadgeClasses, getMatchStatusLabel, getEventLabel, getEventIcon } from '../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  UserCheck,
  AlertCircle,
  FileText,
  User,
  Sparkles
} from 'lucide-react';
import { EventType, MatchStatus } from '../types';

export const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matches, teams, players, addMatchEvent, deleteMatchEvent, updateMatchScore, updateMatch } = useData();
  const { canEditScores } = useAuth();

  const match = matches.find(m => m.id === id);

  // Event form state
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [eventType, setEventType] = useState<EventType>('goal');
  const [eventMinute, setEventMinute] = useState<number>(1);
  const [eventNote, setEventNote] = useState<string>('');

  // Score edit state
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [tempHomeScore, setTempHomeScore] = useState(0);
  const [tempAwayScore, setTempAwayScore] = useState(0);
  const [tempHomeHalf, setTempHomeHalf] = useState<number | ''>('');
  const [tempAwayHalf, setTempAwayHalf] = useState<number | ''>('');
  const [tempStatus, setTempStatus] = useState<MatchStatus>('finished');
  const [tempNotes, setTempNotes] = useState('');
  const [tempReferee, setTempReferee] = useState('');

  if (!match) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Tekma ni bila najdena</h2>
        <p className="text-slate-400 text-sm">Morda je bila tekma izbrisana ali pa povezava ni veljavna.</p>
        <Link to="/razpored" className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Nazaj na razpored
        </Link>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  const homePlayers = players.filter(p => p.teamId === match.homeTeamId);
  const awayPlayers = players.filter(p => p.teamId === match.awayTeamId);

  // Set default team for event creation
  const effectiveTeamId = selectedTeamId || match.homeTeamId;
  const currentTeamPlayers = effectiveTeamId === match.homeTeamId ? homePlayers : awayPlayers;

  // Sorted events
  const sortedEvents = [...(match.events || [])].sort((a, b) => a.minute - b.minute);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId && currentTeamPlayers.length > 0) {
      // Pick first player if none chosen
      const defaultPlayer = currentTeamPlayers[0];
      addMatchEvent(match.id, {
        teamId: effectiveTeamId,
        playerId: defaultPlayer.id,
        minute: eventMinute,
        type: eventType,
        note: eventNote
      });
    } else {
      addMatchEvent(match.id, {
        teamId: effectiveTeamId,
        playerId: selectedPlayerId || `p-${effectiveTeamId}-unknown`,
        minute: eventMinute,
        type: eventType,
        note: eventNote
      });
    }

    setEventNote('');
    setEventMinute(prev => Math.min(90, prev + 5));
  };

  const startEditScore = () => {
    setTempHomeScore(match.homeScore ?? 0);
    setTempAwayScore(match.awayScore ?? 0);
    setTempHomeHalf(match.homeHalftimeScore ?? '');
    setTempAwayHalf(match.awayHalftimeScore ?? '');
    setTempStatus(match.status);
    setTempNotes(match.organizerNotes ?? '');
    setTempReferee(match.referee ?? '');
    setIsEditingScore(true);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    updateMatchScore(
      match.id,
      tempHomeScore,
      tempAwayScore,
      tempHomeHalf === '' ? null : Number(tempHomeHalf),
      tempAwayHalf === '' ? null : Number(tempAwayHalf),
      tempStatus,
      tempNotes
    );
    if (tempReferee !== match.referee) {
      updateMatch(match.id, { referee: tempReferee });
    }
    setIsEditingScore(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top back navigation */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Nazaj
        </button>

        {canEditScores && !isEditingScore && (
          <button
            onClick={startEditScore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Uredi rezultat in zapisnik
          </button>
        )}
      </div>

      {/* Stadium Scoreboard Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative match status pill */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
            {match.round}. krog tekmovanja
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getMatchStatusBadgeClasses(match.status)}`}>
            {getMatchStatusLabel(match.status)}
          </span>
        </div>

        {/* Big Scoreboard */}
        <div className="grid grid-cols-12 items-center gap-4 py-4">
          {/* Home team */}
          <div className="col-span-5 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl border border-white/10 shrink-0"
              style={{ backgroundColor: homeTeam?.primaryColor || '#10b981' }}
            >
              {homeTeam?.logo || '⚽'}
            </div>
            <div>
              <Link
                to={`/ekipe/${homeTeam?.id}`}
                className="font-black text-white text-base sm:text-2xl hover:text-emerald-400 transition-colors leading-tight block"
              >
                {homeTeam?.name}
              </Link>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {homeTeam?.shortName} • Domači
              </div>
            </div>
          </div>

          {/* Central score */}
          <div className="col-span-2 flex flex-col items-center justify-center text-center">
            {match.status === 'finished' || match.status === 'in_progress' ? (
              <div>
                <div className="text-3xl sm:text-6xl font-black text-white font-score tracking-wider">
                  {match.homeScore} : {match.awayScore}
                </div>
                {match.homeHalftimeScore !== null && match.homeHalftimeScore !== undefined && (
                  <div className="text-xs sm:text-sm text-slate-400 font-bold mt-1">
                    (polčas {match.homeHalftimeScore}:{match.awayHalftimeScore})
                  </div>
                )}
              </div>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
                <span className="text-sm sm:text-base font-bold text-white font-score">
                  {formatTimeSl(match.time)}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="col-span-5 flex flex-col-reverse sm:flex-row items-center sm:items-center justify-end gap-3 sm:gap-4 text-center sm:text-right">
            <div>
              <Link
                to={`/ekipe/${awayTeam?.id}`}
                className="font-black text-white text-base sm:text-2xl hover:text-emerald-400 transition-colors leading-tight block"
              >
                {awayTeam?.name}
              </Link>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {awayTeam?.shortName} • Gostje
              </div>
            </div>
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl border border-white/10 shrink-0"
              style={{ backgroundColor: awayTeam?.primaryColor || '#0284c7' }}
            >
              {awayTeam?.logo || '⚽'}
            </div>
          </div>
        </div>

        {/* Match info footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{formatDateSl(match.date, true)} ob {formatTimeSl(match.time)}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{match.venue}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sodnik: {match.referee || 'Uradni sodnik lige'}</span>
          </div>
        </div>
      </div>

      {/* Score Editing Panel (Admin/Editor) */}
      {isEditingScore && canEditScores && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-400" />
              Urejanje rezultata in podatkov tekme
            </h3>
            <button
              onClick={() => setIsEditingScore(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Prekliči
            </button>
          </div>

          <form onSubmit={handleSaveScore} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Domači goli</label>
                <input
                  type="number"
                  min="0"
                  value={tempHomeScore}
                  onChange={(e) => setTempHomeScore(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Gostujoči goli</label>
                <input
                  type="number"
                  min="0"
                  value={tempAwayScore}
                  onChange={(e) => setTempAwayScore(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Polčas (domači)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={tempHomeHalf}
                  onChange={(e) => setTempHomeHalf(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Polčas (gostje)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={tempAwayHalf}
                  onChange={(e) => setTempAwayHalf(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status tekme</label>
                <select
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value as MatchStatus)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="finished">Zaključena</option>
                  <option value="in_progress">V teku (V ŽIVO)</option>
                  <option value="scheduled">Napovedana</option>
                  <option value="postponed">Prestavljena</option>
                  <option value="cancelled">Odpovedana</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Glavni sodnik</label>
                <input
                  type="text"
                  placeholder="Ime in priimek sodnika"
                  value={tempReferee}
                  onChange={(e) => setTempReferee(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Opombe organizatorja</label>
              <textarea
                rows={2}
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Vnesite uradne opombe organizatorja ali delegata tekme..."
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingScore(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Prekliči
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30"
              >
                Shrani spremembe
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Match Events Timeline (Strelci, Kartoni, Avtogoli) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Potek tekme in dogodki</h3>
          </div>
          <span className="text-xs text-slate-400">
            {sortedEvents.length} zabeleženih dogodkov
          </span>
        </div>

        {sortedEvents.length > 0 ? (
          <div className="space-y-3">
            {sortedEvents.map((ev) => {
              const player = players.find(p => p.id === ev.playerId);
              const team = teams.find(t => t.id === ev.teamId);
              const isHomeEvent = ev.teamId === match.homeTeamId;

              return (
                <div
                  key={ev.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isHomeEvent
                      ? 'bg-slate-800/40 border-slate-700/60'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-slate-950 font-black text-sm text-emerald-400 flex items-center justify-center font-score border border-slate-800 shrink-0">
                      {ev.minute}'
                    </span>
                    <span className="text-xl shrink-0">
                      {getEventIcon(ev.type)}
                    </span>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        <span>{player ? `${player.firstName} ${player.lastName}` : 'Igralec'}</span>
                        <span className="text-xs font-normal text-slate-400">
                          ({team?.name})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="font-medium text-emerald-400/90">{getEventLabel(ev.type)}</span>
                        {ev.note && <span className="text-slate-500">• {ev.note}</span>}
                      </div>
                    </div>
                  </div>

                  {canEditScores && (
                    <button
                      onClick={() => deleteMatchEvent(match.id, ev.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Izbriši dogodek"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">
            Na tej tekmi še ni bilo zabeleženih dogodkov (zadetkov ali kartonov).
          </div>
        )}

        {/* Add Event Form (Admin/Editor) */}
        {canEditScores && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Dodaj nov dogodek na tekmi (zadetek, karton)
            </h4>

            <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Ekipa</label>
                <select
                  value={effectiveTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setSelectedPlayerId('');
                  }}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value={match.homeTeamId}>{homeTeam?.name} (Domači)</option>
                  <option value={match.awayTeamId}>{awayTeam?.name} (Gostje)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Igralec</label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="">Izberite igralca</option>
                  {currentTeamPlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      #{p.jerseyNumber} {p.firstName} {p.lastName} ({p.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Vrsta dogodka</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="goal">⚽ Zadetek</option>
                  <option value="penalty_goal">⚽ 11m (Penal)</option>
                  <option value="own_goal">🥅 Avtogol</option>
                  <option value="yellow_card">🟨 Rumeni karton</option>
                  <option value="red_card">🟥 Rdeči karton</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Minuta</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={eventMinute}
                  onChange={(e) => setEventMinute(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold text-center"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Dodaj
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Organizer Notes */}
      {match.organizerNotes && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <FileText className="w-4 h-4 text-emerald-400" />
            Opombe organizatorja / delegata
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {match.organizerNotes}
          </p>
        </div>
      )}
    </div>
  );
};
