import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Icons components
const FlashcardsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
    <rect x="4" y="6" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 6V4H16V6" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LearnIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
    <path d="M15 12L10 15V9L15 12Z" fill="currentColor"/>
  </svg>
);

const TestIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuButton = ({ 
  icon, 
  title, 
  to, 
  isLocked = false,
  isComingSoon = false 
}: { 
  icon: React.ReactNode, 
  title: string, 
  to: string, 
  isLocked?: boolean,
  isComingSoon?: boolean
}) => (
  <Link 
    to={to}
    className={`
      flex items-center gap-6 p-6 rounded-2xl border transition-all duration-300 group
      ${isLocked 
        ? 'bg-surface/50 border-white/5 opacity-60 cursor-not-allowed' 
        : 'bg-[#151336] border-white/5 hover:border-primary/50 hover:translate-x-1 hover:shadow-lg hover:shadow-primary/10'
      }
    `}
  >
    <div className={`
      w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
      ${isLocked ? 'bg-white/5' : 'bg-white/5 group-hover:bg-white/10'}
    `}>
      {icon}
    </div>
    <div className="flex-1 flex items-center justify-between">
      <span className="text-xl font-bold font-display tracking-wide">{title}</span>
      {isComingSoon && !isLocked && (
        <span className="text-xs bg-white/10 px-2 py-1 rounded text-text-secondary">Coming Soon</span>
      )}
      {isLocked && (
        <span className="text-xl">🔒</span>
      )}
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useStore();
  const navigate = useNavigate();

  // Dashboard Protection: Double check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-display mb-4 text-center">Dashboard</h1>
      
      {/* Flashcards - Now Active */}
      <MenuButton 
        icon={<FlashcardsIcon />} 
        title="Flashcards" 
        to="/flashcards" 
      />

      {/* Learn - Points to the actual Learning Path */}
      <MenuButton 
        icon={<LearnIcon />} 
        title="Learn" 
        to="/learning-path" 
      />

      {/* Test */}
      <MenuButton 
        icon={<TestIcon />} 
        title="Test" 
        to="/coming-soon?feature=Unit Tests" 
        isComingSoon={true}
      />
    </div>
  );
}