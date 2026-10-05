import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { LeagueProvider } from './context/LeagueContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { SchedulePage } from './pages/SchedulePage';
import { ResultsPage } from './pages/ResultsPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { StandingsPage } from './pages/StandingsPage';
import { TopScorersPage } from './pages/TopScorersPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { RulesPage } from './pages/RulesPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <LeagueProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
              <Navbar />

              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/razpored" element={<SchedulePage />} />
                  <Route path="/rezultati" element={<ResultsPage />} />
                  <Route path="/tekme/:id" element={<MatchDetailPage />} />
                  <Route path="/lestvice" element={<StandingsPage />} />
                  <Route path="/strelci" element={<TopScorersPage />} />
                  <Route path="/ekipe" element={<TeamsPage />} />
                  <Route path="/ekipe/:id" element={<TeamDetailPage />} />
                  <Route path="/obvestila" element={<AnnouncementsPage />} />
                  <Route path="/pravila" element={<RulesPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
              <MobileBottomNav />
              <ToastContainer />
            </div>
          </AuthProvider>
        </LeagueProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
