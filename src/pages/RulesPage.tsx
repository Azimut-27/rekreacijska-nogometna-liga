import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, Edit3, ChevronDown, ChevronUp, ShieldCheck, Search, CheckCircle2 } from 'lucide-react';

export const RulesPage: React.FC = () => {
  const { rules, updateRuleChapter } = useData();
  const { canManageAll } = useAuth();
  const [activeChapterId, setActiveChapterId] = useState<string | null>(rules[0]?.id || null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [search, setSearch] = useState('');

  const sortedRules = [...rules].sort((a, b) => a.order - b.order);

  const filteredRules = sortedRules.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartEdit = (rule: any) => {
    setEditingId(rule.id);
    setEditTitle(rule.title);
    setEditContent(rule.content);
  };

  const handleSaveEdit = (id: string) => {
    updateRuleChapter(id, editContent, editTitle);
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pravila tekmovanja
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Uradni pravilnik in propozicije medobčinske rekreacijske nogometne lige
          </p>
        </div>

        {canManageAll && (
          <Link
            to="/admin?tab=rules"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>Uredi pravilnik</span>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Išči po pravilih tekmovanja (npr. kartoni, pritožbe, točkovanje)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Chapters list */}
      <div className="space-y-4">
        {filteredRules.map((chapter) => {
          const isOpen = activeChapterId === chapter.id || !!search;
          const isEditing = editingId === chapter.id;

          return (
            <div
              key={chapter.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all"
            >
              <div
                onClick={() => setActiveChapterId(isOpen ? null : chapter.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs font-score shrink-0">
                    {chapter.order}
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight">
                    {chapter.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {canManageAll && !isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(chapter);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Hitro uredi poglavje"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 whitespace-pre-line">
                  {isEditing ? (
                    <div className="space-y-3 pt-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Naslov poglavja</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Vsebina pravila</label>
                        <textarea
                          rows={6}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-sans"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          Prekliči
                        </button>
                        <button
                          onClick={() => handleSaveEdit(chapter.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                        >
                          Shrani
                        </button>
                      </div>
                    </div>
                  ) : (
                    chapter.content
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
