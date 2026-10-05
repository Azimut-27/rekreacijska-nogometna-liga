import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm mt-16 pb-20 lg:pb-8 no-print">
      {/* Sponsors & Partners Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Uradni pokrovitelji in partnerji tekmovanja
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 font-bold text-slate-300 text-base">
              <span className="text-xl">🏆</span> SPORT-LINE SLOVENIJA
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-300 text-base">
              <span className="text-xl">⚡</span> ENERGIJA PLUS
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-300 text-base">
              <span className="text-xl">⚽</span> NOGOMETNA ZVEZA REKREACIJE
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-300 text-base">
              <span className="text-xl">💧</span> VODA TRIGLAV
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-300 text-base">
              <span className="text-xl">🏥</span> MEDICO ŠPORTNA KLINIKA
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-lg">
                ⚽
              </div>
              <span className="font-extrabold text-white text-lg font-score tracking-wider">
                MRL LIGA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uradna spletna aplikacija za vodenje medobčinske rekreacijske nogometne lige v Sloveniji.
              Razporedi, rezultati v živo, statistika strelcev in avtomatizirane lestvice.
            </p>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4" /> Uradno potrjeno tekmovanje
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Tekmovanje</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/razpored" className="hover:text-emerald-400 transition-colors">Razpored tekem</Link></li>
              <li><Link to="/rezultati" className="hover:text-emerald-400 transition-colors">Rezultati tekem</Link></li>
              <li><Link to="/lestvice" className="hover:text-emerald-400 transition-colors">Prvenstvene lestvice</Link></li>
              <li><Link to="/strelci" className="hover:text-emerald-400 transition-colors">Lestvica strelcev</Link></li>
              <li><Link to="/ekipe" className="hover:text-emerald-400 transition-colors">Katalog ekip</Link></li>
            </ul>
          </div>

          {/* Rules & Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Informacije</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/obvestila" className="hover:text-emerald-400 transition-colors">Obvestila & novice</Link></li>
              <li><Link to="/pravila" className="hover:text-emerald-400 transition-colors">Pravila in disciplinski pravilnik</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Administratorski dostop</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Kontakt vodstva</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                Športni park Kodeljevo, Ljubljana
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                info@rekreacija-liga.si
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                041 234 567 (Komisar lige)
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} MRL Rekreacijska nogometna liga. Vse pravice pridržane.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            Pripravljeno za objavo na <span className="text-white font-semibold">Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
