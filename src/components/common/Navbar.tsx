import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useLeague } from '../../context/LeagueContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Trophy,
  Calendar,
  Award,
  Users,
  Bell,
  BookOpen,
  Settings,
  Search,
  Menu,
  X,
  Shield,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { LoginModal } from './LoginModal';
import { getRoleLabel } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const { activeLeagueId, setActiveLeagueId, leagues } = useLeague();
  const { role, currentUser } = useAuth();
  const { season } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Domov', icon: Trophy, end: true },
    { to: '/razpored', label: 'Razpored', icon: Calendar },
    { to: '/rezultati', label: 'Rezultati', icon: Award },
    { to: '/lestvice', label: 'Lestvice', icon: Trophy },
    { to: '/strelci', label: 'Strelci', icon: Award },
    { to: '/ekipe', label: 'Ekipe', icon: Users },
    { to: '/obvestila', label: 'Obvestila', icon: Bell },
    { to: '/pravila', label: 'Pravila', icon: BookOpen },
    { to: '/admin', label: 'Administracija', icon: Settings, highlight: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl transition-all">
        {/* League Selector Top Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline mr-1">
                Izbira lige:
              </span>
              {leagues.map((l) => {
                const isActive = l.id === activeLeagueId;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveLeagueId(l.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {l.targetTeams} ekip
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick role / login trigger & Season indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400/90 font-medium hidden md:inline px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                Sezona {season.name}
              </span>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              >
                {role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                ) : role === 'editor' ? (
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                ) : role === 'representative' ? (
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden sm:inline">{getRoleLabel(role)}</span>
                <span className="sm:hidden">{role === 'public' ? 'Prijava' : 'Vloga'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Header / Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform flex items-center justify-center">
                <span className="text-2xl leading-none">⚽</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors font-score">
                    MRL
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SLOVENIJA
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 tracking-tight font-medium -mt-1 hidden sm:block">
                  Medobčinska rekreacijska liga
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? item.highlight
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                            : 'bg-slate-800 text-emerald-400 shadow-inner'
                          : item.highlight
                          ? 'text-emerald-400 hover:bg-slate-800/80'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Actions: Search & Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all"
                title="Iskanje (ekipe, igralci, tekme)"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Iskanje</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Meni"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-1 animate-fade-in shadow-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
              Glavni meni
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-800 text-emerald-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ADMIN
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Search and Login Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};
