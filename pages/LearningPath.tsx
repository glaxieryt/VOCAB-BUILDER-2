import React from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Unit, LessonNode } from '../types';

const LessonDot: React.FC<{ lesson: LessonNode }> = ({ lesson }) => {
  const isTest = lesson.type === 'test';
  
  if (isTest) {
    return (
      <Link
        to={lesson.isLocked ? '#' : `/learn/${lesson.id}`}
        className={`
          w-24 h-12 flex items-center justify-center rounded-xl font-bold border-2 transition-all transform hover:scale-105 relative
          ${lesson.isLocked 
            ? 'bg-surface border-white/10 text-text-disabled cursor-not-allowed' 
            : lesson.completed 
              ? 'bg-warning/20 border-warning text-warning shadow-[0_0_15px_rgba(255,150,0,0.3)]' 
              : 'bg-warning text-background border-warning animate-pulse-glow'}
        `}
      >
        {lesson.completed && <span className="absolute -top-2 -right-2 text-xl">🏆</span>}
        TEST
      </Link>
    );
  }

  // Standard Lesson Dot
  return (
    <Link
      to={lesson.isLocked ? '#' : `/learn/${lesson.id}`}
      className={`
        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative
        ${lesson.isLocked 
          ? 'bg-surface border-white/5 text-transparent cursor-not-allowed' 
          : lesson.completed 
            ? 'bg-success border-success text-white shadow-[0_0_10px_rgba(88,204,2,0.4)]' 
            : 'bg-primary border-primary text-white animate-pulse shadow-[0_0_10px_rgba(91,79,255,0.5)]'}
      `}
    >
      {lesson.completed ? '✓' : lesson.lessonNumber}
    </Link>
  );
};

const UnitBlock: React.FC<{ unit: Unit }> = ({ unit }) => {
  // Calculate Unit Progress
  const completedCount = unit.lessons.filter(l => l.completed).length;
  const progressPercent = Math.round((completedCount / 11) * 100);

  return (
    <div className={`mb-8 border border-white/10 rounded-3xl overflow-hidden bg-surface/30 backdrop-blur-sm ${unit.isLocked ? 'opacity-50 grayscale' : ''}`}>
      {/* Unit Header */}
      <div className={`p-6 ${unit.isLocked ? 'bg-surface' : 'bg-primary/20'} flex justify-between items-center`}>
        <div>
          <h2 className="text-2xl font-display font-bold">{unit.title}</h2>
          <p className="text-text-secondary text-sm">10 Lessons • 1 Unit Test</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{progressPercent}%</div>
          <div className="text-xs uppercase tracking-wider text-text-secondary">Mastered</div>
        </div>
      </div>

      {/* Progress Bar inside Unit */}
      <div className="h-2 bg-black/20 w-full">
        <div 
          className="h-full bg-success transition-all duration-1000" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Lesson Path */}
      <div className="p-8 relative">
         {unit.isLocked && (
           <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
             <div className="text-2xl font-bold flex items-center gap-2">
               <span>🔒</span> Locked
             </div>
           </div>
         )}

         {/* The Snake/Grid Layout */}
         <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
            {/* Lessons 1-5 */}
            {unit.lessons.slice(0, 5).map(l => (
              <LessonDot key={l.id} lesson={l} />
            ))}
            
            {/* Break for visual flow */}
            <div className="w-full h-0 md:hidden"></div>

            {/* Lessons 6-10 */}
            {unit.lessons.slice(5, 10).map(l => (
              <LessonDot key={l.id} lesson={l} />
            ))}

            {/* Arrow/Connector to Test */}
            <div className="w-8 h-0.5 bg-white/20 hidden md:block"></div>

            {/* Unit Test */}
            <LessonDot lesson={unit.lessons[10]} />
         </div>
      </div>
    </div>
  );
};

export default function LearningPath() {
  const { user, units } = useStore();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            ← Back
        </Link>
        <h1 className="text-3xl font-display font-bold">Learning Path</h1>
      </div>
      
      <div className="flex flex-col gap-6">
        {units.map((unit) => (
          <UnitBlock key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}