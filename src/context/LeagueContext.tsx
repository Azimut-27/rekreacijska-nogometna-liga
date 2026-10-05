import React, { createContext, useContext, useState, useEffect } from 'react';
import { League } from '../types';
import { INITIAL_LEAGUES } from '../data/initialData';

interface LeagueContextType {
  activeLeagueId: string;
  setActiveLeagueId: (id: string) => void;
  activeLeague: League;
  leagues: League[];
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export const LeagueProvider: React.FC<{ children: React.ReactNode; leagues?: League[] }> = ({
  children,
  leagues = INITIAL_LEAGUES
}) => {
  const [activeLeagueId, setActiveLeagueIdState] = useState<string>(() => {
    return localStorage.getItem('mrl_active_league') || '1';
  });

  const setActiveLeagueId = (id: string) => {
    setActiveLeagueIdState(id);
    localStorage.setItem('mrl_active_league', id);
  };

  const activeLeague = leagues.find(l => l.id === activeLeagueId) || leagues[0] || INITIAL_LEAGUES[0];

  return (
    <LeagueContext.Provider value={{ activeLeagueId, setActiveLeagueId, activeLeague, leagues }}>
      {children}
    </LeagueContext.Provider>
  );
};

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
