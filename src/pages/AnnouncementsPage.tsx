import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Calendar, User, Pin, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateSl } from '../utils/formatters';

export const AnnouncementsPage: React.FC = () => {
  const { announcements } = useData();
  const { canManageAll } = useAuth();
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const published = useMemo(() => {
    return announcements
      .filter(a => a.status === 'published')
      .filter(a => !onlyPinned || a.isPinned)
      .filter(a => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.date.localeCompare(a.date));
  }, [announcements, onlyPinned, query]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Obvestila in novice
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Uradna obvestila vodstva tekmovanja in disciplinske komisije
          </p>
        </div>

        {canManageAll && (
          <Link
            to="/admin?tab=news"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Objavi novo obvestilo</span>
          </Link>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Išči po obvestilih..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={() => setOnlyPinned(!onlyPinned)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            onlyPinned
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Samo pomembna</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {published.length > 0 ? (
          published.map((ann) => {
            const isExpanded = expandedId === ann.id;

            return (
              <article
                key={ann.id}
                id={ann.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {formatDateSl(ann.date, true)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {ann.author}
                    </span>
                  </div>

                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <Pin className="w-3 h-3" /> POMEMBNO
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mb-3 leading-snug">
                  {ann.title}
                </h2>

                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {isExpanded ? ann.content : (ann.summary || ann.content.slice(0, 200) + '...')}
                </div>

                {ann.content.length > 200 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                    className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {isExpanded ? (
                      <>Prikaži manj <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Preberi celotno vsebino <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </article>
            );
          })
        ) : (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Bell className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">Ni obvestil</h3>
            <p className="text-xs text-slate-400">
              Trenutno ni objavljenih obvestil za izbrane filtre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
