import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { FlashcardItem } from '../types';

export default function Flashcards() {
  const navigate = useNavigate();
  const { flashcards, loadFlashcardSession, markFlashcard, resetFlashcards } = useStore();
  
  // Display Queue for the current round
  const [queue, setQueue] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Card Interaction State
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Swipe Logic Refs
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Global Counters derived from Main Store
  const countLearning = flashcards.filter(f => f.session_state === 'still_learning').length;
  const countKnow = flashcards.filter(f => f.session_state === 'know').length;

  useEffect(() => {
    loadFlashcardSession();
  }, []);

  // Initialize Queue when flashcards are loaded or reset
  useEffect(() => {
    if (flashcards.length > 0 && queue.length === 0 && !isFinished) {
      // Logic: Start with all pending + still_learning
      const activeItems = flashcards.filter(f => f.session_state !== 'know');
      if (activeItems.length > 0) {
        setQueue(activeItems);
        setCurrentIndex(0);
      } else if (countKnow === flashcards.length) {
         setIsFinished(true);
      }
    }
  }, [flashcards]);

  // Handle Touch/Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    // @ts-ignore
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    // @ts-ignore
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX.current;
    setDragX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Swipe Thresholds
    if (dragX > 100) {
      handleSwipe('right');
    } else if (dragX < -100) {
      handleSwipe('left');
    } else {
      setDragX(0); // Reset position if not swiped far enough
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentCard = queue[currentIndex];
    
    // 1. Update DB/Store
    const newState = direction === 'right' ? 'know' : 'still_learning';
    await markFlashcard(currentCard.id, newState);

    // 2. Animate and move to next
    setDragX(direction === 'right' ? 500 : -500); // Fly off screen
    
    setTimeout(() => {
      setDragX(0);
      setIsFlipped(false);
      
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // End of Queue reached - Check for Loop
        handleEndOfRound();
      }
    }, 200);
  };

  const handleEndOfRound = () => {
    // Re-calculate based on the *store* (which has updated states)
    // We need to wait a tick for store to update, or filter the 'flashcards' dependency
    // Since we updated store optimistically, get() inside store works, but here we depend on prop.
    // Let's filter the fresh 'flashcards' from store in the next render cycle or force check
    
    // Simple approach: Set a temporary "check" state or rely on useEffect
    // But we need immediate feedback.
    
    // Filter items that are STILL 'still_learning' or 'pending' (if any skipped)
    // Note: We just marked the current one.
    
    // We'll defer the queue update to a useEffect that watches 'currentIndex' vs 'queue.length'
    // But for now, let's manually trigger a re-sync logic
    
    // Find items that still need review
    // We access the global flashcards store directly via import or assume the prop updates fast enough
    // For safety, let's check the local queue + the last action.
    
    // Better: Set a flag to trigger queue refresh
    setQueue([]); // This triggers the useEffect above to refill the queue with remaining items
  };

  const handleReset = async () => {
    await resetFlashcards();
    setQueue([]); 
    setIsFinished(false);
    setCurrentIndex(0);
    setDragX(0);
    setIsFlipped(false);
  };

  // --- RENDER ---

  const currentCard = queue[currentIndex];
  
  // Calculate Rotation and Opacity based on Drag
  const rotate = dragX * 0.05;
  const opacityGreen = Math.max(0, dragX / 200);
  const opacityOrange = Math.max(0, -dragX / 200);

  if (!currentCard && !isFinished) return <div className="flex h-full items-center justify-center"><div className="animate-spin text-4xl">⏳</div></div>;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative bg-[#0a092d]">
      
      {/* 1. Header Counters */}
      <div className="flex justify-between items-center p-4 pt-6 max-w-md mx-auto w-full relative z-10">
        {/* Still Learning Counter */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border-2 border-warning flex items-center justify-center text-warning font-bold bg-warning/10">
            {countLearning}
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-text-secondary font-bold text-lg">
           {isFinished ? 'All Done!' : `${currentIndex + 1} / ${queue.length}`}
        </div>

        {/* Known Counter */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border-2 border-success flex items-center justify-center text-success font-bold bg-success/10">
            {countKnow}
          </div>
        </div>
      </div>

      {/* 2. Card Area */}
      <div className="flex-1 flex items-center justify-center relative w-full perspective-1000">
        
        {isFinished ? (
           <div className="text-center p-8 animate-pulse">
             <div className="text-6xl mb-4">🎉</div>
             <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
             <p className="text-text-secondary">You've reviewed all cards.</p>
           </div>
        ) : (
          <div 
            ref={cardRef}
            className="relative w-full max-w-sm aspect-[3/4] cursor-grab active:cursor-grabbing"
            style={{ 
              transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onClick={() => { if(Math.abs(dragX) < 5) setIsFlipped(!isFlipped); }}
          >
            {/* Background Card (Visual Stack Effect) */}
            {currentIndex < queue.length - 1 && (
              <div className="absolute top-2 left-2 right-[-8px] bottom-[-8px] bg-surface/50 border border-white/5 rounded-3xl -z-10 scale-95" />
            )}

            {/* Main Card Container */}
            <div className={`w-full h-full relative preserve-3d transition-transform duration-500 rounded-3xl shadow-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* FRONT (WORD) */}
              <div className="absolute inset-0 backface-hidden bg-surface border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center select-none">
                 {/* Swipe Overlays */}
                 <div className="absolute inset-0 bg-success/20 rounded-3xl z-10 pointer-events-none transition-opacity" style={{ opacity: opacityGreen }}>
                    <div className="absolute top-8 left-8 border-4 border-success text-success font-bold text-2xl px-4 py-2 rounded-xl -rotate-12">KNOW</div>
                 </div>
                 <div className="absolute inset-0 bg-warning/20 rounded-3xl z-10 pointer-events-none transition-opacity" style={{ opacity: opacityOrange }}>
                    <div className="absolute top-8 right-8 border-4 border-warning text-warning font-bold text-2xl px-4 py-2 rounded-xl rotate-12">LEARNING</div>
                 </div>

                 <div className="text-sm uppercase tracking-widest text-text-secondary mb-8 font-bold">Word</div>
                 <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{currentCard.word.word}</h2>
                 <p className="text-text-secondary italic">{currentCard.word.part_of_speech}</p>
                 
                 <div className="absolute bottom-8 text-sm text-text-disabled animate-bounce">
                   Tap to flip
                 </div>
              </div>

              {/* BACK (DEFINITION) */}
              <div className="absolute inset-0 backface-hidden bg-[#151336] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center rotate-y-180 select-none">
                 <div className="text-sm uppercase tracking-widest text-text-secondary mb-6 font-bold">Definition</div>
                 <p className="text-xl leading-relaxed text-white mb-6">{currentCard.word.definition}</p>
                 <div className="w-full h-px bg-white/10 mb-6"></div>
                 <p className="text-text-secondary italic">"{currentCard.word.example_sentence}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer Controls */}
      <div className="p-6 w-full flex justify-center pb-12">
        <button 
          onClick={handleReset}
          className="text-text-secondary hover:text-white transition-colors text-sm font-medium border border-white/10 px-6 py-2 rounded-full hover:bg-white/5"
        >
          Reset Cards
        </button>
      </div>

      {/* Global CSS for 3D Flip */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}