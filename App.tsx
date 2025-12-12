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

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

export default function App() {
  const { initialize } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans bg-background text-text-primary overflow-x-hidden">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/flashcards" 
              element={
                <PrivateRoute>
                  <Flashcards />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/learning-path" 
              element={
                <PrivateRoute>
                  <LearningPath />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/learn/:lessonId" 
              element={
                <PrivateRoute>
                  <Learn />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/coming-soon" 
              element={
                <PrivateRoute>
                  <ComingSoon />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}