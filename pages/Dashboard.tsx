import React from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Lesson } from '../types';

const LessonCard: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const isLocked = lesson.is_locked;
  const isCompleted = lesson.completed;
  const isCurrent = !isLocked && !isCompleted;

  return (
    <Link 
      to={isLocked ? '#' : `/learn/${lesson.id}`}
      className={`
        relative group rounded-2xl p-6 border transition-all duration-300
        ${isLocked ? 'bg-surface/30 border-white/5 cursor-not-allowed grayscale opacity-60' : ''}
        ${isCompleted ? 'bg-surface/50 border-success/30 hover:border-success/50' : ''}
        ${isCurrent ? 'bg-surface border-primary hover:border-primary hover:shadow-[0_0_20px_rgba(91,79,255,0.2)] hover:-translate-y-1' : ''}
        ${!isLocked && !isCompleted && !isCurrent ? 'bg-surface border-white/10 hover:border-white/30' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-background/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-text-secondary">
          Lesson {lesson.unit}
        </div>
        {isCompleted && <div className="text-success text-xl">✅</div>}
        {isLocked && <div className="text-text-disabled text-xl">🔒</div>}
        {isCurrent && <div className="animate-bounce text-xl">⭐</div>}
      </div>

      <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
      <p className="text-sm text-text-secondary mb-6">{lesson.word_count} words • ~10 mins</p>

      {isCompleted ? (
        <div className="flex items-center gap-1">
           {Array.from({ length: 5 }).map((_, i) => (
             <span key={i} className={`text-sm ${i < (lesson.stars || 0) ? 'text-warning' : 'text-gray-700'}`}>★</span>
           ))}
           <span className="ml-2 text-xs font-medium text-success">Completed</span>
        </div>
      ) : (
        <div className={`
          w-full py-2 rounded-lg text-center text-sm font-bold transition-colors
          ${isCurrent ? 'bg-primary text-white' : 'bg-white/5 text-text-disabled'}
        `}>
          {isLocked ? `Unlock: ${lesson.required_xp} XP` : (isCurrent ? 'Start Lesson' : 'Start')}
        </div>
      )}
    </Link>
  );
};

export default function Dashboard() {
  const { user, lessons } = useStore();

  if (!user) return null;

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => l.completed).length;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Progress Banner */}
          <div className="bg-surface rounded-2xl p-6 border border-white/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex-1 w-full">
                <h2 className="text-2xl font-bold font-display mb-2">Current Progress</h2>
                <div className="flex justify-between text-sm text-text-secondary mb-2">
                  <span>Unit 1: Foundations</span>
                  <span>{progressPercentage}% Complete</span>
                </div>
                <div className="h-3 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
             </div>
             <div className="bg-background/50 px-6 py-3 rounded-xl border border-white/5 text-center min-w-[150px]">
                <div className="text-sm text-text-secondary mb-1">Daily Goal</div>
                <div className="text-xl font-bold text-primary">35 / 50 XP</div>
             </div>
          </div>

          {/* Learning Path */}
          <div className="grid md:grid-cols-2 gap-4">
            {lessons.map(lesson => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-surface rounded-2xl p-6 border border-white/10 sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>📊</span> Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-text-secondary text-sm">Words Learned</span>
                <span className="font-bold">{completedLessons * 5}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-text-secondary text-sm">Accuracy</span>
                <span className="font-bold text-success">87%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Current Level</span>
                <span className="font-bold text-secondary">Lvl {user.current_level}</span>
              </div>
            </div>

            <div className="mt-8">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>🏆</span> Achievements
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-xl border ${i <= 3 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/5 grayscale opacity-50'}`}>
                    {['🔥', '⚡', '📚', '🎓', '⭐', '🎯', '👑', '💎'][i-1]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}