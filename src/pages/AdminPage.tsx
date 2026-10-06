import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLeague } from '../context/LeagueContext';
import { MatchCard } from '../components/common/MatchCard';
import { QuickScoreModal } from '../components/common/QuickScoreModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Match, Team, Player, MatchStatus, Announcement, RuleChapter } from '../types';
import { formatDateSl, formatTimeSl, getRoleLabel, getMatchStatusBadgeClasses, getMatchStatusLabel } from '../utils/formatters';
import { readExcelOrCsvFile, exportBackupToJson, exportStandingsToExcel, exportScheduleToExcel, FullBackupData } from '../utils/exportImport';
import { calculateStandings } from '../utils/standings';
import {
  Settings,
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  Trophy,
  Bell,
  BookOpen,
  ArrowRightLeft,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Database,
  Shield,
  Clock,
  MapPin,
  Lock,
  Archive,
  Save,
  Coffee,
  X
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const {
    season,
    leagues,
    teams,
    players,
    matches,
    announcements,
    rules,
    toasts,
    isSupabaseConnected,
    showToast,
    syncToSupabase,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
    transferPlayer,
    generateScheduleForLeague,
    addMatch,
    updateMatch,
    deleteMatch,
    updateMatchScore,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateRuleChapter,
    archiveSeason,
    createSeason,
    resetToDemoData,
    importBackup,
    importTeamsFromList,
    importPlayersFromList,
    importMatchesFromList
  } = useData();

  const { currentUser, role, canManageAll, canEditScores, canEditTeam, switchRole } = useAuth();
  const { activeLeagueId, setActiveLeagueId } = useLeague();

  // Dialog & Selection states
  const [selectedQuickMatch, setSelectedQuickMatch] = useState<Match | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Schedule generator state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genLeagueId, setGenLeagueId] = useState(activeLeagueId);
  const [genIsDouble, setGenIsDouble] = useState(false);
  const [genStartDate, setGenStartDate] = useState('2025-09-12');

  // Match edit/create modal state
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Partial<Match> | null>(null);

  // Team edit/create modal state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Partial<Team> | null>(null);

  // Player edit/create modal state
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);

  // Player transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPlayerObj, setTransferPlayerObj] = useState<Player | null>(null);
  const [transferTargetTeamId, setTransferTargetTeamId] = useState('');

  // Announcement edit/create state
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<Announcement> | null>(null);

  // Rules chapter edit state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleContent, setRuleContent] = useState('');

  // Filtering in tabs
  const [matchLeagueFilter, setMatchLeagueFilter] = useState(activeLeagueId);
  const [matchRoundFilter, setMatchRoundFilter] = useState<string>('all');
  const [playerTeamFilter, setPlayerTeamFilter] = useState<string>('all');

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Unfinished matches without score
  const pendingMatches = useMemo(() => {
    return matches.filter(m => m.status === 'scheduled' || m.status === 'in_progress');
  }, [matches]);

  // Finished matches count
  const finishedMatchesCount = useMemo(() => {
    return matches.filter(m => m.status === 'finished').length;
  }, [matches]);

  // If public visitor: prompt login
  if (role === 'public') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Zaščiten administratorski del</h2>
          <p className="text-xs text-slate-400 mt-2">
            Za dostop do urejanja lig, rezultatov, ekip in igralcev se prijavite s pooblaščenim računom.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Hitra prijava za preizkus:
          </div>
          <button
            onClick={() => switchRole('admin')}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <Shield className="w-4 h-4" />
            Prijava kot Glavni Administrator
          </button>
          <button
            onClick={() => switchRole('editor')}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Prijava kot Urednik rezultatov
          </button>
          <button
            onClick={() => switchRole('representative', 't-1-1')}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <Users className="w-4 h-4 text-amber-400" />
            Prijava kot Predstavnik ekipe (ŠD Meteor)
          </button>
        </div>
      </div>
    );
  }

  // Handle Berger Schedule Generation
  const handleGenerateBerger = (e: React.FormEvent) => {
    e.preventDefault();
    generateScheduleForLeague(genLeagueId, genIsDouble, genStartDate);
    setShowGenModal(false);
  };

  // Handle Team Save
  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    if (editingTeam.id) {
      updateTeam(editingTeam.id, editingTeam);
    } else {
      addTeam({
        name: editingTeam.name || 'Nova ekipa',
        shortName: editingTeam.shortName || 'NEK',
        logo: editingTeam.logo || '⚽',
        leagueId: editingTeam.leagueId || activeLeagueId,
        contactName: editingTeam.contactName || 'Vodja ekipe',
        contactPhone: editingTeam.contactPhone || '041 000 000',
        contactEmail: editingTeam.contactEmail || 'ekipa@liga.si',
        venue: editingTeam.venue || 'Športni park Kodeljevo',
        primaryColor: editingTeam.primaryColor || '#10b981',
        secondaryColor: editingTeam.secondaryColor || '#ffffff',
        isActive: editingTeam.isActive !== false,
        foundedYear: editingTeam.foundedYear || 2025
      });
    }
    setShowTeamModal(false);
  };

  // Handle Player Save
  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    if (editingPlayer.id) {
      updatePlayer(editingPlayer.id, editingPlayer);
    } else {
      addPlayer({
        teamId: editingPlayer.teamId || teams[0]?.id,
        firstName: editingPlayer.firstName || 'Janez',
        lastName: editingPlayer.lastName || 'Novak',
        jerseyNumber: editingPlayer.jerseyNumber || 10,
        position: editingPlayer.position || 'Vezist',
        birthYear: editingPlayer.birthYear || 1995,
        isActive: true
      });
    }
    setShowPlayerModal(false);
  };

  // Handle Player Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferPlayerObj || !transferTargetTeamId) return;
    transferPlayer(transferPlayerObj.id, transferTargetTeamId);
    setShowTransferModal(false);
  };

  // Handle Match Save
  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    if (editingMatch.id) {
      updateMatch(editingMatch.id, editingMatch);
    } else {
      addMatch({
        seasonId: season.id,
        leagueId: editingMatch.leagueId || activeLeagueId,
        round: editingMatch.round || 1,
        homeTeamId: editingMatch.homeTeamId || teams[0]?.id,
        awayTeamId: editingMatch.awayTeamId || teams[1]?.id,
        date: editingMatch.date || '2025-10-15',
        time: editingMatch.time || '18:00',
        venue: editingMatch.venue || 'Športni park Kodeljevo',
        status: editingMatch.status || 'scheduled',
        events: []
      });
    }
    setShowMatchModal(false);
  };

  // Handle Announcement Save
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    if (editingNews.id) {
      updateAnnouncement(editingNews.id, editingNews);
    } else {
      addAnnouncement({
        title: editingNews.title || 'Novo obvestilo',
        summary: editingNews.summary || '',
        content: editingNews.content || '',
        date: editingNews.date || new Date().toISOString().split('T')[0],
        isPinned: !!editingNews.isPinned,
        status: editingNews.status || 'published',
        author: editingNews.author || 'Vodstvo tekmovanja'
      });
    }
    setShowNewsModal(false);
  };

  // Handle Excel Imports
  const handleExcelImport = async (type: 'teams' | 'players' | 'matches', file: File) => {
    try {
      const data = await readExcelOrCsvFile(file);
      if (type === 'teams') importTeamsFromList(data);
      else if (type === 'players') importPlayersFromList(data);
      else if (type === 'matches') importMatchesFromList(data);
    } catch {
      showToast('Napaka pri branju datoteke!', 'error');
    }
  };

  // Handle Backup JSON Restore
  const handleRestoreJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        importBackup(parsed);
      } catch {
        showToast('Neveljavna varnostna kopija JSON!', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Nadzorna plošča administracije
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                {getRoleLabel(role)}
              </span>
              {isSupabaseConnected ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  ⚡ Supabase: Povezano
                </span>
              ) : (
                <button
                  onClick={() => syncToSupabase()}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
                  title="Kliknite za začetno sinhronizacijo v Supabase"
                >
                  ⚡ Sinhroniziraj v Supabase
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prijavljeni kot: <strong className="text-white">{currentUser?.fullName}</strong> ({currentUser?.username})
            </p>
          </div>
        </div>

        {/* Quick Role Tester Pills */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-500 text-[11px] px-2 font-semibold">Testiraj vlogo:</span>
          <button
            onClick={() => switchRole('admin')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              role === 'admin' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => switchRole('editor')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              role === 'editor' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Urednik
          </button>
          <button
            onClick={() => switchRole('representative', 't-1-1')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              role === 'representative' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Predstavnik
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold whitespace-nowrap">
        <button
          onClick={() => setTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
            currentTab === 'dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Pregled
        </button>

        {canEditScores && (
          <button
            onClick={() => setTab('matches')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === 'matches' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Tekme in razpored
          </button>
        )}

        {(canManageAll || role === 'representative') && (
          <button
            onClick={() => setTab('teams')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === 'teams' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Ekipe
          </button>
        )}

        {(canManageAll || role === 'representative') && (
          <button
            onClick={() => setTab('players')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === 'players' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Igralci in prestopi
          </button>
        )}

        {canManageAll && (
          <button
            onClick={() => setTab('news')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === 'news' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" /> Obvestila
          </button>
        )}

        {canManageAll && (
          <button
            onClick={() => setTab('rules')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === 'rules' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Pravila
          </button>
        )}

        {canManageAll && (
          <button
            onClick={() => setTab('import_export')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === 'import_export' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Uvoz, izvoz & varnostna kopija
          </button>
        )}

        {canManageAll && (
          <button
            onClick={() => setTab('seasons')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === 'seasons' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Archive className="w-4 h-4" /> Sezone in arhiv
          </button>
        )}
      </div>

      {/* TAB 1: DASHBOARD */}
      {currentTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Key Metrics Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 font-medium">Število lig</div>
              <div className="text-3xl font-black text-white font-score mt-1">3</div>
              <div className="text-[10px] text-emerald-400 mt-1">1., 2. in 3. liga</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 font-medium">Vseh ekip</div>
              <div className="text-3xl font-black text-white font-score mt-1">{teams.length}</div>
              <div className="text-[10px] text-slate-400 mt-1">9 + 8 + 9 ekip</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 font-medium">Registrirani igralci</div>
              <div className="text-3xl font-black text-white font-score mt-1">{players.length}</div>
              <div className="text-[10px] text-slate-400 mt-1">v vseh 26 ekipah</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 font-medium">Odigrane tekme</div>
              <div className="text-3xl font-black text-emerald-400 font-score mt-1">
                {finishedMatchesCount} <span className="text-slate-500 text-lg">/ {matches.length}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {pendingMatches.length} tekem še čaka
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Bližnjice za hitro upravljanje
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {canEditScores && (
                <button
                  onClick={() => setTab('matches')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-emerald-400 mb-1" />
                  <div className="text-xs font-bold text-white">Vnos rezultata</div>
                  <div className="text-[10px] text-slate-400">Tekme in rezultati</div>
                </button>
              )}

              {canManageAll && (
                <button
                  onClick={() => setShowGenModal(true)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-sky-400 mb-1" />
                  <div className="text-xs font-bold text-white">Bergerjev razpored</div>
                  <div className="text-[10px] text-slate-400">Generiraj kolesje</div>
                </button>
              )}

              {canManageAll && (
                <button
                  onClick={() => {
                    setEditingNews({ title: '', content: '', status: 'published', isPinned: false });
                    setShowNewsModal(true);
                  }}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition-colors"
                >
                  <Bell className="w-5 h-5 text-amber-400 mb-1" />
                  <div className="text-xs font-bold text-white">Objavi obvestilo</div>
                  <div className="text-[10px] text-slate-400">Uradne novice lige</div>
                </button>
              )}

              {canManageAll && (
                <button
                  onClick={() => setTab('import_export')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition-colors"
                >
                  <Database className="w-5 h-5 text-indigo-400 mb-1" />
                  <div className="text-xs font-bold text-white">Varnostna kopija</div>
                  <div className="text-[10px] text-slate-400">Uvoz in izvoz</div>
                </button>
              )}
            </div>
          </div>

          {/* Pending Matches without entered score (Tekme brez vnesenega rezultata) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Tekme brez vnesenega rezultata</h3>
                <p className="text-xs text-slate-400">Naslednje napovedane ali tekme v teku ({pendingMatches.length})</p>
              </div>
              <button
                onClick={() => setTab('matches')}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                Poglej vse tekme →
              </button>
            </div>

            <div className="space-y-3">
              {pendingMatches.slice(0, 5).map(m => {
                const home = teams.find(t => t.id === m.homeTeamId);
                const away = teams.find(t => t.id === m.awayTeamId);
                const league = leagues.find(l => l.id === m.leagueId);

                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 font-score">
                        {league?.shortName} • {m.round}. krog
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {home?.name} vs {away?.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatDateSl(m.date)} ob {m.time} • {m.venue}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getMatchStatusBadgeClasses(m.status)}`}>
                        {getMatchStatusLabel(m.status)}
                      </span>
                      {canEditScores && (
                        <button
                          onClick={() => setSelectedQuickMatch(m)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
                        >
                          Vnesi rezultat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATCHES & SCHEDULING */}
      {currentTab === 'matches' && canEditScores && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Upravljanje tekem in rezultatov</h2>
              <p className="text-xs text-slate-400">Vnos rezultatov, prestavljanje, odpovedi in Bergerjev razpored</p>
            </div>

            <div className="flex items-center gap-2">
              {canManageAll && (
                <button
                  onClick={() => setShowGenModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow"
                >
                  <RefreshCw className="w-4 h-4" />
                  Bergerjev generator
                </button>
              )}
              {canManageAll && (
                <button
                  onClick={() => {
                    setEditingMatch({
                      seasonId: season.id,
                      leagueId: matchLeagueFilter,
                      round: 1,
                      date: new Date().toISOString().split('T')[0],
                      time: '18:00',
                      venue: 'Športni park Kodeljevo',
                      status: 'scheduled'
                    });
                    setShowMatchModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj tekmo
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Liga</label>
              <select
                value={matchLeagueFilter}
                onChange={(e) => setMatchLeagueFilter(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                {leagues.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.targetTeams} ekip)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Krog</label>
              <select
                value={matchRoundFilter}
                onChange={(e) => setMatchRoundFilter(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="all">Vsi krogi</option>
                {Array.from(new Set(matches.filter(m => m.leagueId === matchLeagueFilter).map(m => m.round)))
                  .sort((a, b) => a - b)
                  .map(r => (
                    <option key={r} value={r}>{r}. krog</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-3">
            {matches
              .filter(m => m.leagueId === matchLeagueFilter)
              .filter(m => matchRoundFilter === 'all' || m.round === Number(matchRoundFilter))
              .sort((a, b) => a.round - b.round || a.date.localeCompare(b.date))
              .map(m => {
                const home = teams.find(t => t.id === m.homeTeamId);
                const away = teams.find(t => t.id === m.awayTeamId);

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-800 font-bold text-xs text-emerald-400 flex items-center justify-center font-score">
                        {m.round}.
                      </span>
                      <div>
                        <div className="font-bold text-white text-base">
                          {home?.name} {m.status === 'finished' ? `${m.homeScore} : ${m.awayScore}` : 'vs'} {away?.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatDateSl(m.date)} ob {m.time} • {m.venue}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase ${getMatchStatusBadgeClasses(m.status)}`}>
                        {getMatchStatusLabel(m.status)}
                      </span>

                      <button
                        onClick={() => setSelectedQuickMatch(m)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        Vnos rezultata
                      </button>

                      <Link
                        to={`/tekme/${m.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                      >
                        Dogodki & zapisnik
                      </Link>

                      {canManageAll && (
                        <button
                          onClick={() => {
                            setEditingMatch(m);
                            setShowMatchModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Uredi tekmo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {canManageAll && (
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Izbris tekme',
                              message: `Ali res želite izbrisati tekmo med ${home?.name} in ${away?.name}?`,
                              onConfirm: () => {
                                deleteMatch(m.id);
                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Izbriši tekmo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: TEAMS MANAGEMENT */}
      {currentTab === 'teams' && (canManageAll || role === 'representative') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Upravljanje ekip</h2>
              <p className="text-xs text-slate-400">Dodajanje, urejanje podatkov, prizorišč in barv dresov</p>
            </div>
            {canManageAll && (
              <button
                onClick={() => {
                  setEditingTeam({
                    leagueId: activeLeagueId,
                    isActive: true,
                    venue: 'Športni park Kodeljevo',
                    primaryColor: '#10b981',
                    secondaryColor: '#ffffff'
                  });
                  setShowTeamModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                Dodaj novo ekipo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams
              .filter(t => canManageAll || t.id === currentUser?.teamId)
              .map(team => {
                const league = leagues.find(l => l.id === team.leagueId);
                const squad = players.filter(p => p.teamId === team.id);

                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow"
                            style={{ backgroundColor: team.primaryColor }}
                          >
                            {team.logo}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{team.name}</div>
                            <div className="text-xs text-slate-400">{league?.name} • {team.shortName}</div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${team.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {team.isActive ? 'AKTIVNA' : 'NEAKTIVNA'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1 my-3 py-2 border-y border-slate-800">
                        <div>Igrišče: <strong className="text-white">{team.venue}</strong></div>
                        <div>Kontakt: <strong className="text-white">{team.contactName}</strong> ({team.contactPhone})</div>
                        <div>Igralcev: <strong className="text-emerald-400">{squad.length}</strong></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingTeam(team);
                          setShowTeamModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Uredi
                      </button>

                      {canManageAll && (
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Izbris ekipe',
                              message: `Ali res želite izbrisati ekipo "${team.name}" in njene igralce?`,
                              onConfirm: () => {
                                deleteTeam(team.id);
                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700"
                          title="Izbriši ekipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: PLAYERS & TRANSFERS */}
      {currentTab === 'players' && (canManageAll || role === 'representative') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Upravljanje igralcev in prestopi</h2>
              <p className="text-xs text-slate-400">Registracije igralcev in prestopi v drugo ekipo</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingPlayer({
                    teamId: playerTeamFilter !== 'all' ? playerTeamFilter : teams[0]?.id,
                    jerseyNumber: 10,
                    position: 'Vezist',
                    birthYear: 1996,
                    isActive: true
                  });
                  setShowPlayerModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                Dodaj novega igralca
              </button>
            </div>
          </div>

          {/* Filter by team */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <label className="block text-xs text-slate-400 mb-1">Filtriraj po ekipi</label>
            <select
              value={playerTeamFilter}
              onChange={(e) => setPlayerTeamFilter(e.target.value)}
              className="w-full sm:w-72 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            >
              <option value="all">Vse ekipe ({teams.length})</option>
              {teams
                .filter(t => canManageAll || t.id === currentUser?.teamId)
                .map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({leagues.find(l => l.id === t.leagueId)?.name})</option>
                ))}
            </select>
          </div>

          {/* Players Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="py-3.5 pl-4 pr-2 text-center w-12">Št.</th>
                    <th className="py-3.5 px-4">Ime in priimek</th>
                    <th className="py-3.5 px-4">Ekipa</th>
                    <th className="py-3.5 px-4">Položaj</th>
                    <th className="py-3.5 px-4 text-center">Rojstvo</th>
                    <th className="py-3.5 pr-4 pl-3 text-right">Dejanja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {players
                    .filter(p => playerTeamFilter === 'all' || p.teamId === playerTeamFilter)
                    .filter(p => canManageAll || p.teamId === currentUser?.teamId)
                    .map(player => {
                      const team = teams.find(t => t.id === player.teamId);

                      return (
                        <tr key={player.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 pl-4 pr-2 text-center">
                            <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs font-score bg-slate-800 text-slate-200">
                              #{player.jerseyNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {player.firstName} {player.lastName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {team?.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {player.position}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-400 font-score">
                            {player.birthYear || '/'}
                          </td>
                          <td className="py-3.5 pr-4 pl-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Transfer button */}
                              {canManageAll && (
                                <button
                                  onClick={() => {
                                    setTransferPlayerObj(player);
                                    setTransferTargetTeamId(teams.find(t => t.id !== player.teamId)?.id || '');
                                    setShowTransferModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 text-xs font-medium border border-sky-500/30 flex items-center gap-1"
                                  title="Prestop v drugo ekipo"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                  <span>Prestop</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setEditingPlayer(player);
                                  setShowPlayerModal(true);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                                title="Uredi"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Izbris igralca',
                                    message: `Ali res želite izbrisati igralca ${player.firstName} ${player.lastName}?`,
                                    onConfirm: () => {
                                      deletePlayer(player.id);
                                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 bg-slate-800"
                                title="Izbriši"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NEWS / ANNOUNCEMENTS */}
      {currentTab === 'news' && canManageAll && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Objave in novice</h2>
              <p className="text-xs text-slate-400">Upravljanje obvestil, označevanje pomembnih in osnutkov</p>
            </div>
            <button
              onClick={() => {
                setEditingNews({
                  title: '',
                  summary: '',
                  content: '',
                  date: new Date().toISOString().split('T')[0],
                  isPinned: false,
                  status: 'published',
                  author: 'Vodstvo tekmovanja'
                });
                setShowNewsModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
            >
              <Plus className="w-4 h-4" />
              Novo obvestilo
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{formatDateSl(ann.date)}</span>
                    {ann.isPinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        POMEMBNO
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ann.status === 'published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {ann.status === 'published' ? 'OBJAVLJENO' : 'OSNUTEK'}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base">{ann.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{ann.summary || ann.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingNews(ann);
                      setShowNewsModal(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Uredi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Izbris obvestila',
                        message: `Ali res želite izbrisati obvestilo "${ann.title}"?`,
                        onConfirm: () => {
                          deleteAnnouncement(ann.id);
                          setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        }
                      });
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-rose-400"
                    title="Izbriši"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RULES */}
      {currentTab === 'rules' && canManageAll && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Urejanje uradnega pravilnika</h2>
            <p className="text-xs text-slate-400">Poglavja propozicij, točkovanja, kartonov in pritožb</p>
          </div>

          <div className="space-y-4">
            {rules.map(rule => (
              <div key={rule.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                      {rule.order}
                    </span>
                    {rule.title}
                  </div>
                </div>

                {editingRuleId === rule.id ? (
                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      value={ruleTitle}
                      onChange={(e) => setRuleTitle(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                    />
                    <textarea
                      rows={5}
                      value={ruleContent}
                      onChange={(e) => setRuleContent(e.target.value)}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-sans"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingRuleId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Prekliči
                      </button>
                      <button
                        onClick={() => {
                          updateRuleChapter(rule.id, ruleContent, ruleTitle);
                          setEditingRuleId(null);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                      >
                        Shrani
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {rule.content}
                    </p>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setEditingRuleId(rule.id);
                          setRuleTitle(rule.title);
                          setRuleContent(rule.content);
                        }}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Uredi vsebino
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: IMPORT / EXPORT & BACKUP */}
      {currentTab === 'import_export' && canManageAll && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-black text-white">Uvoz, izvoz in varnostne kopije</h2>
            <p className="text-xs text-slate-400">Podpora za Excel (.xlsx), CSV ter celovito JSON varnostno kopijo</p>
          </div>

          {/* Backup & Restore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Celotna varnostna kopija</h3>
                  <p className="text-xs text-slate-400">Prenesite vse podatke (sezone, lige, ekipe, igralce, tekme) v eni JSON datoteki.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  exportBackupToJson({
                    version: '2.0',
                    timestamp: new Date().toISOString(),
                    season,
                    leagues,
                    teams,
                    players,
                    matches,
                    announcements,
                    rules
                  });
                  showToast('Varnostna kopija je bila uspešno prenesena.');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                Prenesi varnostno kopijo (JSON)
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Obnovitev iz varnostne kopije</h3>
                  <p className="text-xs text-slate-400">Naložite JSON datoteko in povrnite celotno stanje sistema.</p>
                </div>
              </div>

              <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Naloži JSON datoteko</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleRestoreJson(f);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Excel / CSV Imports */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Uvoz iz Excel (.xlsx) ali CSV
            </h3>
            <p className="text-xs text-slate-400">
              Hitro uvozite sezname ekip, igralcev ali razpored iz obstoječih preglednic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Teams import */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="font-bold text-white text-sm">Uvoz ekip</div>
                <div className="text-[11px] text-slate-400">
                  Stolpci: <code>Naziv, Kratica, Liga, Igrišče, Kontakt, Telefon</code>
                </div>
                <label className="block mt-2 py-2 px-3 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer">
                  Izberi datoteko
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleExcelImport('teams', f);
                    }}
                  />
                </label>
              </div>

              {/* Players import */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="font-bold text-white text-sm">Uvoz igralcev</div>
                <div className="text-[11px] text-slate-400">
                  Stolpci: <code>Ime, Priimek, Ekipa, Številka, Položaj</code>
                </div>
                <label className="block mt-2 py-2 px-3 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer">
                  Izberi datoteko
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleExcelImport('players', f);
                    }}
                  />
                </label>
              </div>

              {/* Matches import */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="font-bold text-white text-sm">Uvoz razporeda tekem</div>
                <div className="text-[11px] text-slate-400">
                  Stolpci: <code>Domači, Gostje, Krog, Datum, Ura, Prizorišče</code>
                </div>
                <label className="block mt-2 py-2 px-3 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer">
                  Izberi datoteko
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleExcelImport('matches', f);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Reset to Demo Data */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-rose-300 text-base">Ponastavitev na začetne demonstracijske podatke</h3>
              <p className="text-xs text-rose-300/70 mt-1">
                Če želite začeti znova, lahko kadarkoli ponastavite vse 3 lige z 26 ekipami in vzorčnimi rezultati.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Ponastavitev podatkov',
                  message: 'Ali ste prepričani, da želite ponastaviti vse podatke na začetne demonstracijske vrednosti?',
                  onConfirm: () => {
                    resetToDemoData();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shrink-0 shadow"
            >
              Ponastavi na začetne podatke
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: SEASONS & ARCHIVE */}
      {currentTab === 'seasons' && canManageAll && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-white">Upravljanje sezone tekmovanja</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Aktualna sezona:</span>
                <div className="text-lg font-black text-white font-score">{season.name}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Obdobje tekmovanja:</span>
                <div className="text-sm font-semibold text-slate-200">
                  {formatDateSl(season.startDate)} - {formatDateSl(season.endDate)}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Status:</span>
                <div className="text-sm font-bold text-emerald-400">
                  {season.isActive ? 'AKTIVNA SEZONA' : 'ARHIVIRANA'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Arhiviranje sezone',
                    message: `Ali res želite arhivirati sezono ${season.name}? Tekme in lestvice bodo zaklenjene za nadaljnje spremembe.`,
                    onConfirm: () => {
                      archiveSeason();
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
              >
                Arhiviraj končano sezono
              </button>

              <button
                onClick={() => {
                  const newName = prompt('Vnesite naziv nove sezone (npr. 2026/2027):', '2026/2027');
                  if (newName) {
                    createSeason(newName, '2026-09-01', '2027-06-15');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                Ustvari novo sezono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BERGER GENERATOR MODAL */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-sky-400" />
                Bergerjev razpored (kolesje)
              </h3>
              <button onClick={() => setShowGenModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBerger} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Algoritem samodejno ustvari uradni razpored tekem vsak z vsakim. Pri ligah z 9 ekipami v vsakem krogu določi prosto ekipo (pavzo).
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Izberi ligo</label>
                <select
                  value={genLeagueId}
                  onChange={(e) => setGenLeagueId(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  {leagues.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.targetTeams} ekip)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sistem tekmovanja</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenIsDouble(false)}
                    className={`p-2.5 rounded-xl border text-center font-bold ${!genIsDouble ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Enokrožni sistem
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenIsDouble(true)}
                    className={`p-2.5 rounded-xl border text-center font-bold ${genIsDouble ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Dvokrožni sistem
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Datum 1. kroga</label>
                <input
                  type="date"
                  value={genStartDate}
                  onChange={(e) => setGenStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                >
                  Ustvari razpored
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM EDIT / CREATE MODAL */}
      {showTeamModal && editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingTeam.id ? 'Uredi podatke ekipe' : 'Dodaj novo ekipo'}
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Naziv ekipe *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.name || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kratica (3-4 črke) *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={editingTeam.shortName || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, shortName: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase font-score font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Liga *</label>
                  <select
                    value={editingTeam.leagueId || activeLeagueId}
                    onChange={(e) => setEditingTeam({ ...editingTeam, leagueId: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {leagues.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ikona / logotip (emoji ali znak)</label>
                  <input
                    type="text"
                    value={editingTeam.logo || '⚽'}
                    onChange={(e) => setEditingTeam({ ...editingTeam, logo: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Domače igrišče / prizorišče *</label>
                <input
                  type="text"
                  required
                  value={editingTeam.venue || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, venue: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kontaktna oseba</label>
                  <input
                    type="text"
                    value={editingTeam.contactName || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, contactName: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={editingTeam.contactPhone || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, contactPhone: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Glavna barva dresa</label>
                  <input
                    type="color"
                    value={editingTeam.primaryColor || '#10b981'}
                    onChange={(e) => setEditingTeam({ ...editingTeam, primaryColor: e.target.value })}
                    className="w-full h-9 p-1 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sekundarna barva dresa</label>
                  <input
                    type="color"
                    value={editingTeam.secondaryColor || '#ffffff'}
                    onChange={(e) => setEditingTeam({ ...editingTeam, secondaryColor: e.target.value })}
                    className="w-full h-9 p-1 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={editingTeam.isActive !== false}
                  onChange={(e) => setEditingTeam({ ...editingTeam, isActive: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                />
                <label htmlFor="isActiveCheck" className="text-white">Ekipa je aktivna v tekmovanju</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow"
                >
                  Shrani ekipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAYER EDIT / CREATE MODAL */}
      {showPlayerModal && editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingPlayer.id ? 'Uredi igralca' : 'Dodaj novega igralca'}
              </h3>
              <button onClick={() => setShowPlayerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ime *</label>
                  <input
                    type="text"
                    required
                    value={editingPlayer.firstName || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, firstName: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priimek *</label>
                  <input
                    type="text"
                    required
                    value={editingPlayer.lastName || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, lastName: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ekipa *</label>
                <select
                  value={editingPlayer.teamId || teams[0]?.id}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, teamId: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Številka dresa *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={editingPlayer.jerseyNumber || 10}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, jerseyNumber: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-score text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Položaj</label>
                  <select
                    value={editingPlayer.position || 'Vezist'}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value as any })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Vratar">Vratar</option>
                    <option value="Branilec">Branilec</option>
                    <option value="Vezist">Vezist</option>
                    <option value="Napadalec">Napadalec</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Letnica rojstva</label>
                  <input
                    type="number"
                    min="1950"
                    max="2015"
                    value={editingPlayer.birthYear || 1996}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, birthYear: parseInt(e.target.value) || 1996 })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-center font-score"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlayerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow"
                >
                  Shrani igralca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAYER TRANSFER MODAL */}
      {showTransferModal && transferPlayerObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-sky-400" />
                Prestop igralca v drugo ekipo
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Igralec:</span>
                <div className="font-bold text-white text-base">
                  {transferPlayerObj.firstName} {transferPlayerObj.lastName}
                </div>
                <div className="text-slate-400 mt-1">
                  Trenutna ekipa: <strong className="text-white">{teams.find(t => t.id === transferPlayerObj.teamId)?.name}</strong> (#{transferPlayerObj.jerseyNumber})
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Izberi novo ciljno ekipo *</label>
                <select
                  value={transferTargetTeamId}
                  onChange={(e) => setTransferTargetTeamId(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  {teams
                    .filter(t => t.id !== transferPlayerObj.teamId)
                    .map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({leagues.find(l => l.id === t.leagueId)?.name})</option>
                    ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Opomba: Če je številka dresa #{transferPlayerObj.jerseyNumber} v ciljni ekipi že zasedena, bo igralcu samodejno dodeljena prva prosta številka dresa.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow"
                >
                  Potrdi prestop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT EDIT / CREATE MODAL */}
      {showNewsModal && editingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingNews.id ? 'Uredi obvestilo' : 'Novo obvestilo'}
              </h3>
              <button onClick={() => setShowNewsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Naslov obvestila *</label>
                <input
                  type="text"
                  required
                  value={editingNews.title || ''}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kratek povzetek (za predogled)</label>
                <input
                  type="text"
                  value={editingNews.summary || ''}
                  onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Celotna vsebina obvestila *</label>
                <textarea
                  rows={5}
                  required
                  value={editingNews.content || ''}
                  onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Status objave</label>
                  <select
                    value={editingNews.status || 'published'}
                    onChange={(e) => setEditingNews({ ...editingNews, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="published">Objavljeno (javno vidno)</option>
                    <option value="draft">Osnutek (skrito)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Datum objave</label>
                  <input
                    type="date"
                    value={editingNews.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditingNews({ ...editingNews, date: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={!!editingNews.isPinned}
                  onChange={(e) => setEditingNews({ ...editingNews, isPinned: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-rose-500"
                />
                <label htmlFor="isPinnedCheck" className="text-white">Označi kot POMEMBNO obvestilo (rdeča značka)</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow"
                >
                  Shrani obvestilo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATCH EDIT / CREATE MODAL */}
      {showMatchModal && editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingMatch.id ? 'Uredi tekmo' : 'Dodaj novo tekmo'}
              </h3>
              <button onClick={() => setShowMatchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Liga *</label>
                  <select
                    value={editingMatch.leagueId || activeLeagueId}
                    onChange={(e) => setEditingMatch({ ...editingMatch, leagueId: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {leagues.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Krog *</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editingMatch.round || 1}
                    onChange={(e) => setEditingMatch({ ...editingMatch, round: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-score text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Domača ekipa *</label>
                  <select
                    value={editingMatch.homeTeamId || teams[0]?.id}
                    onChange={(e) => setEditingMatch({ ...editingMatch, homeTeamId: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {teams.filter(t => t.leagueId === (editingMatch.leagueId || activeLeagueId)).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gostujoča ekipa *</label>
                  <select
                    value={editingMatch.awayTeamId || teams[1]?.id}
                    onChange={(e) => setEditingMatch({ ...editingMatch, awayTeamId: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {teams.filter(t => t.leagueId === (editingMatch.leagueId || activeLeagueId)).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Datum *</label>
                  <input
                    type="date"
                    required
                    value={editingMatch.date || '2025-10-15'}
                    onChange={(e) => setEditingMatch({ ...editingMatch, date: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ura *</label>
                  <input
                    type="time"
                    required
                    value={editingMatch.time || '18:00'}
                    onChange={(e) => setEditingMatch({ ...editingMatch, time: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Prizorišče *</label>
                <input
                  type="text"
                  required
                  value={editingMatch.venue || ''}
                  onChange={(e) => setEditingMatch({ ...editingMatch, venue: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Status tekme</label>
                <select
                  value={editingMatch.status || 'scheduled'}
                  onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value as MatchStatus })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="scheduled">Napovedana</option>
                  <option value="in_progress">V teku (V ŽIVO)</option>
                  <option value="finished">Zaključena</option>
                  <option value="postponed">Prestavljena</option>
                  <option value="cancelled">Odpovedana</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow"
                >
                  Shrani tekmo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SCORE MODAL */}
      <QuickScoreModal
        match={selectedQuickMatch}
        teams={teams}
        isOpen={!!selectedQuickMatch}
        onClose={() => setSelectedQuickMatch(null)}
      />

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
