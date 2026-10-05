import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { Users, Search, MapPin, Phone, Mail, ChevronRight, Plus, Shield } from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const { teams, players, leagues } = useData();
  const { activeLeagueId, activeLeague } = useLeague();
  const { canManageAll } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const leagueTeams = useMemo(() => {
    return teams.filter(t => t.leagueId === activeLeagueId);
  }, [teams, activeLeagueId]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return leagueTeams;
    const q = searchQuery.toLowerCase().trim();
    return leagueTeams.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.venue.toLowerCase().includes(q) ||
      t.contactName.toLowerCase().includes(q)
    );
  }, [leagueTeams, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ekipe tekmovanja
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeLeague.name} • {leagueTeams.length} prijavljenih ekip
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Išči ekipo, prizorišče..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
            />
          </div>

          {canManageAll && (
            <Link
              to="/admin?tab=teams"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upravljaj ekipe</span>
            </Link>
          )}
        </div>
      </div>

      {/* Grid of Team Cards */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => {
            const squad = players.filter(p => p.teamId === team.id);

            return (
              <div
                key={team.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-emerald-950/20 group relative overflow-hidden"
              >
                {/* Top kit color accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: team.primaryColor || '#10b981' }}
                />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md border border-white/10 shrink-0"
                        style={{ backgroundColor: team.primaryColor || '#1e293b' }}
                      >
                        {team.logo || '⚽'}
                      </div>
                      <div>
                        <Link
                          to={`/ekipe/${team.id}`}
                          className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors block leading-tight"
                        >
                          {team.name}
                        </Link>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-emerald-400 font-score">{team.shortName}</span>
                          <span>•</span>
                          <span>{squad.length} igralcev</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        team.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {team.isActive ? 'AKTIVNA' : 'NEAKTIVNA'}
                    </span>
                  </div>

                  {/* Team Details */}
                  <div className="space-y-2 text-xs text-slate-400 my-4 py-3 border-y border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{team.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Vodja: {team.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{team.contactPhone}</span>
                    </div>
                  </div>

                  {/* Kit color swatch */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <span>Barva dresa:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-600 shadow"
                        style={{ backgroundColor: team.primaryColor }}
                        title="Glavna barva dresa"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-600 shadow"
                        style={{ backgroundColor: team.secondaryColor }}
                        title="Dodatna barva dresa"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/ekipe/${team.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 group-hover:bg-emerald-600 group-hover:text-white"
                  >
                    <span>Javna stran ekipe</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-bold text-white text-base">Ni najdenih ekip</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Za iskalni niz »{searchQuery}« ni bilo najdenih ustreznih ekip.
          </p>
        </div>
      )}
    </div>
  );
};
