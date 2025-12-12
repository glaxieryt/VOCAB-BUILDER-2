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
  const [round, setRound] = useState(1);
  
  // Card Interaction State
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Swipe Logic Refs
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Global Counters
  const countLearning = flashcards.filter(f => f.session_state === 'still_learning').length;
  const countKnow = flashcards.filter(f => f.session_state === 'know').length;
  const countPending = flashcards.filter(f => f.session_state === 'pending').length;

  useEffect(() => {
    // Initial Load
    loadFlashcardSession();
  }, []);

  // Effect to populate queue
  useEffect(() => {
    // If we have flashcards, and the queue is empty...
    if (flashcards.length > 0 && queue.length === 0) {
      if (!isFinished) {
         // Try to find active items (pending or still_learning)
         const activeItems = flashcards.filter(f => f.session_state !== 'know');
         
         if (activeItems.length > 0) {
           setQueue(activeItems);
           setCurrentIndex(0);
         } else if (countKnow === flashcards.length && countKnow > 0) {
            // Everything is known
            setIsFinished(true);
         }
      }
    }
  }, [flashcards, isFinished, queue.length, countKnow]);

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
    
    if (dragX > 100) {
      handleSwipe('right');
    } else if (dragX < -100) {
      handleSwipe('left');
    } else {
      setDragX(0);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!queue[currentIndex]) return;

    const currentCard = queue[currentIndex];
    const newState = direction === 'right' ? 'know' : 'still_learning';
    
    // 1. Trigger Animation
    setDragX(direction === 'right' ? 500 : -500); // Fly off screen

    // 2. Wait for animation
    setTimeout(async () => {
      // 3. Update DB/Store
      await markFlashcard(currentCard.id, newState);
      
      setDragX(0);
      setIsFlipped(false);
      
      // 4. Determine Next Step
      if (currentIndex < queue.length - 1) {
        // Move to next card in current queue
        setCurrentIndex(prev => prev + 1);
      } else {
        // --- END OF DECK LOGIC ---
        // We reached the end of the current queue.
        // Recalculate remaining items from the *latest* flashcards state + our current update
        // We filter for anything that is NOT 'know'
        
        // Note: 'flashcards' from the hook might be slightly stale in this closure, 
        // but 'markFlashcard' updates the store state. 
        // We can wait for the 'useEffect' to refill the queue, 
        // OR we can manually trigger the refill logic here for smoother UX.
        
        // Force queue clear to trigger useEffect refill
        setQueue([]);
        setRound(r => r + 1);
        setCurrentIndex(0);
        
        // If everything is done, the useEffect will catch it and set isFinished
      }
    }, 200);
  };

  const handleReset = async () => {
    // 1. Show Confirmation Popup
    const confirmed = window.confirm("Are you sure you want to reset your progress? This will restart the entire deck.");
    if (!confirmed) return;

    // 2. Trigger Reset
    await resetFlashcards();
    
    // 3. Reset Local State
    setQueue([]); 
    setIsFinished(false);
    setCurrentIndex(0);
    setDragX(0);
    setIsFlipped(false);
    setRound(1);
    
    // 4. Show Toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- RENDER ---
  const currentCard = queue[currentIndex];
  
  // Calculate Rotation and Opacity based on Drag
  const rotate = dragX * 0.05;
  const opacityGreen = Math.max(0, dragX / 200);
  const opacityOrange = Math.max(0, -dragX / 200);

  // Loading State
  if (!currentCard && !isFinished) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center bg-[#0a092d]">
        <div className="animate-spin text-4xl mb-4 text-primary">⏳</div>
        <p className="text-text-secondary animate-pulse">Loading your deck...</p>
        <p className="text-xs text-text-disabled mt-2">Fetching {flashcards.length || '...'} words</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative bg-[#0a092d]">
      
      {/* 1. Header Counters */}
      <div className="flex justify-between items-center p-4 pt-6 max-w-md mx-auto w-full relative z-10">
        {/* Still Learning Counter */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full border-2 border-warning flex items-center justify-center text-warning font-bold bg-warning/10 transition-all duration-300 shadow-lg shadow-warning/20">
            {countLearning + countPending}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">To Learn</span>
        </div>

        {/* Progress Text */}
        <div className="text-center">
           <div className="text-text-secondary font-bold text-lg">
             {isFinished ? 'Complete' : `Card ${currentIndex + 1} / ${queue.length}`}
           </div>
           {!isFinished && (
             <div className="text-xs text-text-disabled mt-1 uppercase tracking-widest">Round {round}</div>
           )}
        </div>

        {/* Known Counter */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full border-2 border-success flex items-center justify-center text-success font-bold bg-success/10 transition-all duration-300 shadow-lg shadow-success/20">
            {countKnow}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Mastered</span>
        </div>
      </div>

      {/* 2. Card Area */}
      <div className="flex-1 flex items-center justify-center relative w-full perspective-1000">
        
        {isFinished ? (
           <div className="text-center p-8 animate-pulse">
             <div className="text-8xl mb-6">🎉</div>
             <h2 className="text-4xl font-display font-bold text-white mb-4">Deck Mastered!</h2>
             <p className="text-xl text-text-secondary mb-8">You've learned all {flashcards.length} words.</p>
             <button 
               onClick={handleReset}
               className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-primary/30 transition-transform hover:scale-105"
             >
               Start Over
             </button>
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
            
            {/* Second Background Card for depth */}
            {currentIndex < queue.length - 2 && (
              <div className="absolute top-4 left-4 right-[-16px] bottom-[-16px] bg-surface/30 border border-white/5 rounded-3xl -z-20 scale-90" />
            )}

            {/* Main Card Container */}
            <div className={`w-full h-full relative preserve-3d transition-transform duration-500 rounded-3xl shadow-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* FRONT (WORD) */}
              <div className="absolute inset-0 backface-hidden bg-surface border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden">
                 
                 {/* Decorative background blur */}
                 <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                 <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

                 {/* Swipe Overlays */}
                 <div className="absolute inset-0 bg-success/20 rounded-3xl z-10 pointer-events-none transition-opacity flex items-center justify-center" style={{ opacity: opacityGreen }}>
                    <div className="border-4 border-success text-success font-bold text-4xl px-6 py-2 rounded-xl -rotate-12 bg-surface/80 backdrop-blur-sm">KNOW</div>
                 </div>
                 <div className="absolute inset-0 bg-warning/20 rounded-3xl z-10 pointer-events-none transition-opacity flex items-center justify-center" style={{ opacity: opacityOrange }}>
                    <div className="border-4 border-warning text-warning font-bold text-4xl px-6 py-2 rounded-xl rotate-12 bg-surface/80 backdrop-blur-sm">LEARNING</div>
                 </div>

                 <div className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-12 font-bold bg-white/5 px-3 py-1 rounded-full"> Vocabulary </div>
                 
                 <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight drop-shadow-lg">
                   {currentCard.word.word}
                 </h2>
                 
                 <p className="text-lg text-secondary font-medium italic opacity-80">{currentCard.word.part_of_speech}</p>
                 
                 <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce opacity-50">
                   <span className="text-xs text-text-disabled uppercase tracking-widest">Tap to flip</span>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                 </div>
              </div>

              {/* BACK (DEFINITION) */}
              <div className="absolute inset-0 backface-hidden bg-[#0F0D25] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center rotate-y-180 select-none overflow-y-auto custom-scrollbar">
                 <div className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-8 font-bold bg-white/5 px-3 py-1 rounded-full">Definition</div>
                 
                 <p className="text-xl md:text-2xl leading-relaxed text-white mb-8 font-medium">
                   {currentCard.word.definition}
                 </p>
                 
                 <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-8 opacity-50"></div>
                 
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5 w-full">
                   <p className="text-text-secondary italic text-sm leading-relaxed">"{currentCard.word.example_sentence}"</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer Controls */}
      <div className="p-6 w-full flex justify-center pb-8 gap-4">
        {!isFinished && (
           <button 
             onClick={handleReset}
             className="text-text-secondary hover:text-white transition-colors text-xs font-bold border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 uppercase tracking-wider"
           >
             Reset Progress
           </button>
        )}
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface border border-white/10 shadow-2xl px-6 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 z-50 pointer-events-none transform ${showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Progress Reset</h4>
          <p className="text-xs text-text-secondary">Deck restarted from the beginning.</p>
        </div>
      </div>

      {/* Global CSS for 3D Flip */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}