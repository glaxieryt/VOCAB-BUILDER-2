import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Unit, LessonNode, FlashcardItem, FlashcardState } from '../types';
import { seedDatabase } from '../lib/seeder';
import { generateUnits, SEED_VOCABULARY } from '../lib/mockData';

// Concurrency lock for seeding
let isSeedingInProgress = false;

interface AppState {
  user: User | null;
  units: Unit[];
  flashcards: FlashcardItem[];
  isAuthenticated: boolean;
  authError: string | null;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthError: (error: string) => void;
  clearAuthError: () => void;
  completeLesson: (lessonId: string, score: number, stars: number) => Promise<void>;
  initialize: () => Promise<void>;
  syncUserData: () => Promise<void>;
  setHydratedData: (lessonProgress: any[], flashcards: any[]) => void;
  addXP: (amount: number) => Promise<void>;
  fetchCourseData: () => Promise<void>;

  // Flashcard Actions
  loadFlashcardSession: () => Promise<void>;
  markFlashcard: (itemId: string, state: FlashcardState) => Promise<void>;
  resetFlashcards: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  units: [],
  flashcards: [],
  isAuthenticated: false,
  authError: null,
  isLoading: true,

  setAuthError: (error: string) => set({ authError: error }),
  clearAuthError: () => set({ authError: null }),

  initialize: async () => {
    set({ isLoading: true });
    
    if (!isSupabaseConfigured) {
       set({ isLoading: false });
       return;
    }

    try {
      const { count, error: countError } = await supabase.from('units').select('*', { count: 'exact', head: true });
      
      if (countError) {
         console.warn("DB Connection check failed:", countError.message);
      } else if (count === 0) {
         if (!isSeedingInProgress) {
             isSeedingInProgress = true;
             console.log("Database empty, initiating seed...");
             try {
                await seedDatabase();
             } catch (seedErr) {
                console.error("Seeding warning:", seedErr);
             } finally {
                isSeedingInProgress = false;
             }
         }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({
            isAuthenticated: true,
            user: {
              id: profile.id,
              email: session.user.email!,
              username: profile.username,
              full_name: profile.full_name,
              current_streak: profile.current_streak,
              total_xp: profile.total_xp,
              current_level: profile.current_level,
              avatar_url: profile.avatar_url
            }
          });
          
          await get().syncUserData();
        } else {
           await get().fetchCourseData();
        }
      } else {
        await get().fetchCourseData();
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          get().initialize();
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false, units: [], flashcards: [] });
        }
      });

    } catch (error: any) {
      console.error("Initialization error:", error.message);
      set({ authError: `Connection Error: ${error.message}` });
    } finally {
      set({ isLoading: false });
    }
  },

  syncUserData: async () => {
    const { user } = get();
    if (!user) return;
    
    console.log("🔄 Syncing User Data...");
    try {
      await Promise.all([
        get().fetchCourseData(),
        get().loadFlashcardSession()
      ]);
    } catch (err) {
      console.error("Sync failed:", err);
    }
  },

  setHydratedData: (lessonProgress, flashcardsData) => {
      // Direct store update action
      if (flashcardsData && flashcardsData.length > 0) {
          set({ flashcards: flashcardsData as FlashcardItem[] });
      }
      
      // We also update the completed lessons in the current units state
      if (lessonProgress && lessonProgress.length > 0) {
          const completedLessonIds = new Set(lessonProgress.map(p => p.lesson_id));
          set(state => ({
              units: state.units.map(u => ({
                  ...u,
                  lessons: u.lessons.map(l => ({
                      ...l,
                      // If the lesson's DB ID is in the set, mark it complete.
                      // Note: We need dbId to be populated on lessons for this to work perfectly.
                      // If units were just loaded from mock, dbId might be missing until fetchCourseData runs.
                      completed: (l as any).dbId && completedLessonIds.has((l as any).dbId) ? true : l.completed
                  }))
              }))
          }));
      }
  },

  fetchCourseData: async () => {
    const user = get().user;
    if (!isSupabaseConfigured) return;
    
    try {
      const { data: unitsDb, error: unitsError } = await supabase
        .from('units')
        .select('*, lessons(*)')
        .order('sequence_number', { ascending: true });

      if (unitsError || !unitsDb || unitsDb.length === 0) {
        console.warn("⚠️ Fetching units failed. Switching to LOCAL MOCK DATA.");
        const mockUnits = generateUnits();
        set({ units: mockUnits });
        return;
      }

      let lessonProgressMap: Record<number, any> = {};
      let unitProgressMap: Record<number, any> = {};

      if (user) {
        const { data: lessonProgress } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id);
        
        const { data: unitProgress } = await supabase
          .from('user_unit_progress')
          .select('*')
          .eq('user_id', user.id);

        lessonProgress?.forEach(p => { lessonProgressMap[p.lesson_id] = p; });
        unitProgress?.forEach(p => { unitProgressMap[p.unit_id] = p; });
      }

      const mergedUnits: Unit[] = unitsDb.map((u: any) => {
         const sortedLessons = (u.lessons || []).sort((a: any, b: any) => a.lesson_number - b.lesson_number);
         let previousLessonCompleted = true; 
         
         const mappedLessons: LessonNode[] = sortedLessons.map((l: any) => {
            const progress = lessonProgressMap[l.id];
            const isCompleted = !!progress?.is_completed;
            let isLocked = true;
            
            if (u.sequence_number === 1 && l.lesson_number === 1) isLocked = false;
            else if (isCompleted) isLocked = false;
            else if (previousLessonCompleted) isLocked = false;
            
            previousLessonCompleted = isCompleted;
            
            return {
               id: `unit-${u.sequence_number}-lesson-${l.lesson_number}`,
               dbId: l.id,
               unitId: u.sequence_number,
               lessonNumber: l.lesson_number,
               type: l.type,
               isLocked: isLocked,
               completed: isCompleted,
               score: progress?.score,
               stars: progress?.stars
            };
         });

         const uProgress = unitProgressMap[u.id];
         const isLocked = u.sequence_number !== 1 && !uProgress?.is_unlocked; 
         
         return {
           id: u.sequence_number,
           dbId: u.id,
           title: u.title,
           lessons: mappedLessons,
           isLocked: u.sequence_number === 1 ? false : isLocked
         };
      });

      set({ units: mergedUnits });
    } catch (err: any) {
      console.error("Error fetching course data:", err.message);
    }
  },

  login: async (email, password) => {
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     if (error) throw error;
  },

  signup: async (username, password) => {
     // Handled in Auth.tsx
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, units: [], flashcards: [] });
    set({ isLoading: false });
  },

  completeLesson: async (lessonIdString, score, stars) => {
    const { user, units } = get();
    if (!user) return;

    // 1. Identify DB IDs needed for saving
    const parts = lessonIdString.split('-');
    const unitSeq = parseInt(parts[1]);
    const lessonNum = parseInt(parts[3]);

    const unit = units.find(u => u.id === unitSeq);
    const lesson = unit?.lessons.find(l => l.lessonNumber === lessonNum);
    
    // We try to get the DB ID from the store logic first
    let dbLessonId = (lesson as any)?.dbId;

    // Fallback: If store doesn't have it (rare, but safety), query it
    if (!dbLessonId) {
        try {
            const { data: realUnit } = await supabase.from('units').select('id').eq('sequence_number', unitSeq).maybeSingle();
            if (realUnit) {
                const { data: realLesson } = await supabase.from('lessons')
                    .select('id')
                    .eq('unit_id', realUnit.id)
                    .eq('lesson_number', lessonNum)
                    .maybeSingle();
                if (realLesson) dbLessonId = realLesson.id;
            }
        } catch (e) {
            console.warn("DB ID Lookup failed during completion", e);
        }
    }

    // 2. Update UI instantly (Optimistic)
    const xpEarned = 10;
    const updatedUnits = units.map(u => {
       if (u.id === unitSeq) {
           return { 
               ...u, 
               lessons: u.lessons.map(l => {
                  if (l.lessonNumber === lessonNum) return { ...l, completed: true, score, stars };
                  if (l.lessonNumber === lessonNum + 1) return { ...l, isLocked: false };
                  return l;
               }) 
           };
       }
       return u;
    });

    set({ 
        units: updatedUnits,
        user: { ...user, total_xp: user.total_xp + xpEarned } 
    });

    // Handle Mock Mode gracefully
    if (!dbLessonId) {
        console.warn("⚠️ Progress saved locally only (Lesson ID not found in DB). This is expected if running in mock/offline mode.");
        return;
    }

    // 3. FORCE SAVE TO DATABASE
    try {
        console.log(`💾 Persisting lesson ${dbLessonId} for user ${user.id}...`);
        
        const { error } = await supabase
          .from('user_lesson_progress')
          .upsert({ 
            user_id: user.id, 
            lesson_id: dbLessonId, 
            is_completed: true,
            score: score,
            stars: stars,
            completed_at: new Date().toISOString()
          }, { onConflict: 'user_id, lesson_id' });

        if (error) throw error;

        // 4. Save XP via RPC (or fallback)
        try {
            await supabase.rpc('increment_xp', { x: xpEarned, user_id: user.id });
        } catch (rpcError) {
             console.warn("RPC increment_xp failed, falling back to manual update", rpcError);
             await supabase.from('profiles').update({ total_xp: user.total_xp + xpEarned }).eq('id', user.id);
        }
        
        console.log("✅ Progress Saved Successfully.");
        
    } catch (err) {
        console.error("Failed to save lesson progress:", err);
    }
  },

  addXP: async (amount) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, total_xp: user.total_xp + amount } });
    await supabase.rpc('increment_xp', { x: amount, user_id: user.id });
  },

  loadFlashcardSession: async () => {
    const { user } = get();
    if (!user) return; 

    try {
      if (!isSupabaseConfigured) throw new Error("Supabase not configured");

      const { count } = await supabase.from('user_flashcard_session_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if (count === 0) await supabase.rpc('reset_flashcard_session');

      let allItems: FlashcardItem[] = [];
      let page = 0;
      let hasMore = true;
      while (hasMore) {
         const { data, error } = await supabase.from('user_flashcard_session_items').select(`id, word_id, session_state, word:vocabulary_words(*)`).eq('user_id', user.id).range(page * 1000, (page + 1) * 1000 - 1);
         if (error) throw error;
         if (data && data.length > 0) {
            allItems = [...allItems, ...data] as FlashcardItem[];
            if (data.length < 1000) hasMore = false; else page++;
         } else hasMore = false;
      }

      if (allItems.length > 0) set({ flashcards: allItems });
      else {
          // Fallback
          const mockItems: FlashcardItem[] = SEED_VOCABULARY.map((w, i) => ({
              id: `mock-flashcard-${i}`,
              word_id: w.id,
              word: w,
              session_state: 'pending' as FlashcardState
          }));
          set({ flashcards: mockItems });
      }

    } catch (e: any) {
      console.warn("Flashcard load error:", e.message);
    }
  },

  markFlashcard: async (itemId, state) => {
    set(prev => ({
      flashcards: prev.flashcards.map(item => item.id === itemId ? { ...item, session_state: state } : item)
    }));
    if (!itemId.startsWith('mock-')) {
        await supabase.from('user_flashcard_session_items').update({ session_state: state }).eq('id', itemId);
    }
  },

  resetFlashcards: async () => {
     await supabase.rpc('reset_flashcard_session');
     await get().loadFlashcardSession();
  }

}));