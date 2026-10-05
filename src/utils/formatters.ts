import { MatchStatus, EventType, UserRole } from '../types';

export function formatDateSl(dateStr: string, includeDayName = false): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    
    if (includeDayName) {
      const dayNames = ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'];
      const dayName = dayNames[d.getDay()];
      return `${dayName}, ${day}. ${month}. ${year}`;
    }
    return `${day}. ${month}. ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatTimeSl(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

export function getMatchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case 'scheduled':
      return 'Napovedana';
    case 'in_progress':
      return 'V teku (V ŽIVO)';
    case 'finished':
      return 'Zaključena';
    case 'postponed':
      return 'Prestavljena';
    case 'cancelled':
      return 'Odpovedana';
    default:
      return status;
  }
}

export function getMatchStatusBadgeClasses(status: MatchStatus): string {
  switch (status) {
    case 'scheduled':
      return 'bg-slate-700/60 text-slate-300 border-slate-600';
    case 'in_progress':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse';
    case 'finished':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'postponed':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'cancelled':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Glavni administrator';
    case 'editor':
      return 'Urednik rezultatov';
    case 'representative':
      return 'Predstavnik ekipe';
    case 'public':
      return 'Javni obiskovalec';
    default:
      return role;
  }
}

export function getEventLabel(type: EventType): string {
  switch (type) {
    case 'goal':
      return 'Zadetek';
    case 'penalty_goal':
      return '11m (Enajstmetrovka)';
    case 'own_goal':
      return 'Avtogol';
    case 'yellow_card':
      return 'Rumeni karton';
    case 'red_card':
      return 'Rdeči karton';
    default:
      return type;
  }
}

export function getEventIcon(type: EventType): string {
  switch (type) {
    case 'goal':
      return '⚽';
    case 'penalty_goal':
      return '⚽ (P)';
    case 'own_goal':
      return '🥅 (AG)';
    case 'yellow_card':
      return '🟨';
    case 'red_card':
      return '🟥';
    default:
      return '•';
  }
}
