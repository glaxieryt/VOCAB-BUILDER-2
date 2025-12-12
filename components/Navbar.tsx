import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useStore();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 h-16 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-xl">🎓</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">VocabMaster</span>
          </Link>

          {/* Dashboard Button - Visible to all, logic handles redirect */}
          <Link 
            to={user ? "/dashboard" : "/auth"} 
            className="text-sm font-bold text-white hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 bg-surface/50 px-4 py-1.5 rounded-full border border-white/5">
               <div className="flex items-center gap-1" title="Daily Streak">
                 <span className="text-lg">🔥</span>
                 <span className="text-warning font-bold">{user.current_streak}</span>
               </div>
               <div className="w-px h-4 bg-white/10"></div>
               <div className="flex items-center gap-1" title="Total XP">
                 <span className="text-lg">💎</span>
                 <span className="text-secondary font-bold">{user.total_xp}</span>
               </div>
             </div>
             
             <div className="relative group cursor-pointer">
                <img 
                  src={user.avatar_url} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full border-2 border-primary/20 hover:border-primary transition-colors"
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2">
                    <button 
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <Link to="/auth" className="text-sm font-medium hover:text-white text-text-secondary transition-colors">Login</Link>
             <Link 
              to="/auth?mode=signup" 
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}