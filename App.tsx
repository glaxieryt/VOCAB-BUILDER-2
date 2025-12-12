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
  const { initialize, setHydratedData } = useStore();

  // 1. Initial Auth Check
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 2. FIX: The "Sync on Load" Logic (User Request)
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("⚡ Restoring User Progress...");

      // A. Load Lesson Progress (So green nodes stay green)
      const { data: progress } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, is_completed, score, stars')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      // B. Load Flashcard State
      const { data: cards } = await supabase
        .from('user_flashcard_session_items')
        .select(`
            id,
            word_id,
            session_state,
            word:vocabulary_words(*)
          `)
        .eq('user_id', user.id);

      // C. Update the Store
      if (progress || cards) {
          setHydratedData(progress || [], cards || []);
          // Ensure structure is up to date
          useStore.getState().fetchCourseData(); 
      }
    };

    loadUserData();
  }, [setHydratedData]);

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