import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';
import Learn from './pages/Learn';
import Flashcards from './pages/Flashcards';
import Auth from './pages/Auth';
import ComingSoon from './pages/ComingSoon';
import Navbar from './components/Navbar';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a092d]">
        <div className="animate-spin text-4xl mb-4 text-primary">⏳</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

export default function App() {
  const { initialize, syncUserData } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // SYNC FUNCTION: Run this when 'user' session is detected to prevent 0 progress on reload
  useEffect(() => {
    const syncUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("Session detected, syncing user data...");
        await syncUserData();
      }
    };
    syncUser();
  }, [syncUserData]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans bg-background text-text-primary overflow-x-hidden">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/flashcards" element={
              <PrivateRoute>
                <Flashcards />
              </PrivateRoute>
            } />
            <Route path="/learning-path" element={
              <PrivateRoute>
                <LearningPath />
              </PrivateRoute>
            } />
            <Route path="/learn/:lessonId" element={
              <PrivateRoute>
                <Learn />
              </PrivateRoute>
            } />
            <Route path="/coming-soon" element={
              <PrivateRoute>
                <ComingSoon />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}