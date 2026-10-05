import React from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Calendar, Award, Users, Home } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const items = [
    { to: '/', label: 'Domov', icon: Home, end: true },
    { to: '/razpored', label: 'Razpored', icon: Calendar },
    { to: '/rezultati', label: 'Rezultati', icon: Award },
    { to: '/lestvice', label: 'Lestvice', icon: Trophy },
    { to: '/ekipe', label: 'Ekipe', icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl no-print">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
