import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Search, X, Users, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { formatDateSl } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { teams, players, matches, leagues } = useData();

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q || q.length < 2) return { teams: [], players: [], matches: [] };

    const matchingTeams = teams.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.venue.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchingPlayers = players.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchingMatches = matches.filter(m => {
      const homeTeam = teams.find(t => t.id === m.homeTeamId)?.name.toLowerCase() || '';
      const awayTeam = teams.find(t => t.id === m.awayTeamId)?.name.toLowerCase() || '';
      return homeTeam.includes(q) || awayTeam.includes(q) || m.venue.toLowerCase().includes(q);
    }).slice(0, 5);

    return {
      teams: matchingTeams,
      players: matchingPlayers,
      matches: matchingMatches
    };
  }, [q, teams, players, matches]);

  if (!isOpen) return null;

  const handleSelectTeam = (teamId: string) => {
    onClose();
    navigate(`/ekipe/${teamId}`);
  };

  const handleSelectPlayer = (teamId: string) => {
    onClose();
    navigate(`/ekipe/${teamId}`);
  };

  const handleSelectMatch = (matchId: string) => {
    onClose();
    navigate(`/tekme/${matchId}`);
  };

  const hasAnyResults = results.teams.length > 0 || results.players.length > 0 || results.matches.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search input bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Išči ekipe, igralce, tekme..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Zapri (ESC)
          </button>
        </div>

        {/* Results area */}
        <div className="overflow-y-auto p-4 space-y-6">
          {!q || q.length < 2 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Vnesite vsaj 2 znaka za iskanje po vseh ligah, ekipah, igralcih in tekmah.
            </div>
          ) : !hasAnyResults ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Ni najdenih zadetkov za »<span className="text-white font-medium">{query}</span>«.
            </div>
          ) : (
            <>
              {/* Teams */}
              {results.teams.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                    Ekipe ({results.teams.length})
                  </h4>
                  <div className="space-y-1">
                    {results.teams.map(team => {
                      const league = leagues.find(l => l.id === team.leagueId);
                      return (
                        <button
                          key={team.id}
                          onClick={() => handleSelectTeam(team.id)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base border border-slate-700">
                              {team.logo}
                            </span>
                            <div>
                              <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm">
                                {team.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {league?.name} • {team.venue}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Players */}
              {results.players.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    Igralci ({results.players.length})
                  </h4>
                  <div className="space-y-1">
                    {results.players.map(player => {
                      const team = teams.find(t => t.id === player.teamId);
                      return (
                        <button
                          key={player.id}
                          onClick={() => handleSelectPlayer(player.teamId)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-sky-950/50 text-sky-400 font-bold flex items-center justify-center text-xs border border-sky-800/50">
                              #{player.jerseyNumber}
                            </span>
                            <div>
                              <div className="font-semibold text-white group-hover:text-sky-400 transition-colors text-sm">
                                {player.firstName} {player.lastName}
                              </div>
                              <div className="text-xs text-slate-400">
                                {team?.name} • {player.position}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matches */}
              {results.matches.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Tekme ({results.matches.length})
                  </h4>
                  <div className="space-y-1">
                    {results.matches.map(m => {
                      const homeTeam = teams.find(t => t.id === m.homeTeamId);
                      const awayTeam = teams.find(t => t.id === m.awayTeamId);
                      const isFinished = m.status === 'finished';
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMatch(m.id)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                        >
                          <div>
                            <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                              {homeTeam?.name} {isFinished ? `${m.homeScore} : ${m.awayScore}` : 'vs'} {awayTeam?.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {m.round}. krog • {formatDateSl(m.date)} ob {m.time} • {m.venue}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
