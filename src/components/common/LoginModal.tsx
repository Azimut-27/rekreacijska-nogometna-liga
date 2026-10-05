import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LogIn, Shield, Edit3, UserCheck, Eye, X, KeyRound, User as UserIcon } from 'lucide-react';
import { getRoleLabel } from '../../utils/formatters';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, role, login, logout, switchRole } = useAuth();
  const { teams, showToast } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(username, password);
    if (success) {
      showToast(`Uspešna prijava kot ${username}!`);
      onClose();
    } else {
      setErrorMsg('Napačno uporabniško ime ali geslo. Preverite spodnje demonstracijske račune.');
    }
  };

  const handleQuickSwitch = (newRole: any, teamId?: string) => {
    switchRole(newRole, teamId);
    showToast(`Preklopljeno na vlogo: ${getRoleLabel(newRole)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Prijava & Uporabniške vloge</h3>
              <p className="text-xs text-slate-400">Dostop do administrativnega dela lige</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {currentUser && (
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{currentUser.fullName}</div>
                  <div className="text-xs text-emerald-400 font-medium">
                    {getRoleLabel(role)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  showToast('Uspešno odjavljeni.');
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
              >
                Odjava
              </button>
            </div>
          )}

          {/* Quick role test switcher */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Hitri preklop vloge (za preizkus funkcij):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickSwitch('admin')}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all flex items-center gap-2 ${
                  role === 'admin'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold">Glavni admin</div>
                  <div className="text-[10px] text-slate-400">Vse pravice</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickSwitch('editor')}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all flex items-center gap-2 ${
                  role === 'editor'
                    ? 'bg-sky-600/20 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="font-bold">Urednik rezultatov</div>
                  <div className="text-[10px] text-slate-400">Tekme & rezultati</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickSwitch('representative', 't-1-1')}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all flex items-center gap-2 ${
                  role === 'representative'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold">Predstavnik ekipe</div>
                  <div className="text-[10px] text-slate-400">ŠD Meteor</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickSwitch('public')}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all flex items-center gap-2 ${
                  role === 'public'
                    ? 'bg-slate-700/60 border-slate-500 text-white ring-1 ring-slate-500'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="font-bold">Javni obiskovalec</div>
                  <div className="text-[10px] text-slate-400">Samo vpogled</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-500 font-medium">ali klasična prijava</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Uporabniško ime</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="npr. admin, urednik, predstavnik"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Geslo</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Geslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Prijava v sistem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
