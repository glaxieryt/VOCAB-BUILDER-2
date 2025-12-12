import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Unit, LessonNode, FlashcardItem, FlashcardState } from '../types';
import { seedDatabase } from '../lib/seeder';

interface AppState {
  user: User | null;
  units: Unit[];
  flashcards: FlashcardItem[];
  isAuthenticated: boolean;
  authError: string | null;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthError: (error: string) => void;
  clearAuthError: () => void;
  completeLesson: (lessonId: string, score: number, stars: number) => Promise<void>;
  initialize: () => Promise<void>;
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
    
    // STRICT MODE: No keys = Error, no mock fallback.
    if (!isSupabaseConfigured) {
       set({ 
         isLoading: false, 
         authError: "Database connection missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." 
       });
       return;
    }

    try {
      // 1. Check connection & Seed if necessary (Auto-seed real DB if empty)
      const { count, error: countError } = await supabase.from('units').select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Database check failed:", countError.message);
        throw countError; 
      } else if (count === 0) {
         console.log("Database empty, seeding...");
         await seedDatabase();
      }

      // 2. Get User Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session?.user) {
        // 3. Fetch User Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Profile fetch error:", profileError.message);
        }

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
        }
      }

      // 4. Load Course Data (Real DB)
      await get().fetchCourseData();

      // 5. Setup Auth Listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          get().initialize();
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false, units: [] });
        }
      });

    } catch (error: any) {
      const msg = error.message || "Unknown error occurred";
      console.error("Initialization error:", msg);
      
      if (msg.includes('relation') && msg.includes('does not exist')) {
        set({ authError: "Database setup incomplete. Tables missing." });
      } else {
        set({ authError: `Connection Error: ${msg}` });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourseData: async () => {
    const user = get().user;
    
    try {
      // Fetch Units and Nested Lessons
      const { data: unitsDb, error: unitsError } = await supabase
        .from('units')
        .select('*, lessons(*)')
        .order('sequence_number', { ascending: true });

      if (unitsError) throw unitsError;
      if (!unitsDb) return;

      let lessonProgressMap: Record<number, any> = {};
      let unitProgressMap: Record<number, any> = {};

      if (user) {
        // Fetch User Progress
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

      // Merge DB Data with User Progress
      const mergedUnits: Unit[] = unitsDb.map((u: any) => {
         const sortedLessons = (u.lessons || []).sort((a: any, b: any) => a.lesson_number - b.lesson_number);
         let previousLessonCompleted = true; 
         
         const mappedLessons: LessonNode[] = sortedLessons.map((l: any) => {
            const progress = lessonProgressMap[l.id];
            const isCompleted = !!progress?.is_completed;
            let isLocked = true;
            
            // Logic: Unlock if it's Lesson 1.1 OR if completed OR if previous is completed
            if (u.sequence_number === 1 && l.lesson_number === 1) isLocked = false;
            else if (isCompleted) isLocked = false;
            else if (previousLessonCompleted) isLocked = false;
            
            previousLessonCompleted = isCompleted;
            
            return {
               id: `unit-${u.sequence_number}-lesson-${l.lesson_number}`,
               dbId: l.id, // CRITICAL: Database ID for linking to questions
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
         // Logic: Unlock unit if it's Unit 1 OR if unlocked in DB
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

  login: async (username, password) => {
     // REAL AUTH ONLY
     const email = username.includes('@') ? username : `${username}@example.com`;
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     if (error) throw error;
  },

  signup: async (username, password) => {
     // REAL AUTH ONLY is handled in Auth.tsx via supabase.auth.signUp
     // This method is a placeholder if needed, but we mostly use Auth.tsx logic
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, units: [] });
    set({ isLoading: false });
  },

  completeLesson: async (lessonIdString, score, stars) => {
    const { user, units } = get();
    if (!user) return;

    const parts = lessonIdString.split('-');
    const unitSeq = parseInt(parts[1]);
    const lessonNum = parseInt(parts[3]);

    // 1. Calculate XP and Streak Update
    const xpEarned = 10 + (stars * 5);
    const newXP = user.total_xp + xpEarned;
    const newStreak = user.current_streak + 1; // Simplified streak logic for now

    // 2. Optimistic Update
    const updatedUnits = units.map(u => {
       if (u.id === unitSeq) {
           const updatedLessons = u.lessons.map(l => {
              if (l.lessonNumber === lessonNum) {
                 return { ...l, completed: true, score, stars };
              }
              if (l.lessonNumber === lessonNum + 1) {
                  return { ...l, isLocked: false };
              }
              return l;
           });
           return { ...u, lessons: updatedLessons };
       }
       return u;
    });

    set({ 
        units: updatedUnits,
        user: { ...user, total_xp: newXP, current_streak: newStreak }
    });

    // 3. Database Updates (Critical)
    const unit = units.find(u => u.id === unitSeq);
    const lesson = unit?.lessons.find(l => l.lessonNumber === lessonNum);

    if (!lesson || !(lesson as any).dbId) {
        console.error("Lesson DB ID not found, cannot save progress.");
        return;
    }

    const dbLessonId = (lesson as any).dbId;
    const dbUnitId = (unit as any).dbId;

    // Update Profile
    await supabase.from('profiles').update({
        total_xp: newXP,
        current_streak: newStreak
    }).eq('id', user.id);

    // Update Lesson Progress
    const { error: lessonError } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: dbLessonId,
        is_completed: true, 
        score,
        stars
      }, { onConflict: 'user_id, lesson_id' });

    if (lessonError) console.error("Error saving lesson progress:", lessonError.message);

    // If Test Passed, Unlock Next Unit
    if (lesson.type === 'test' && score >= 75) {
       const nextUnitSeq = unitSeq + 1;
       const { data: nextUnitData } = await supabase
         .from('units')
         .select('id')
         .eq('sequence_number', nextUnitSeq)
         .single();
       
       if (nextUnitData) {
         await supabase
           .from('user_unit_progress')
           .upsert({
             user_id: user.id,
             unit_id: nextUnitData.id,
             is_unlocked: true
           }, { onConflict: 'user_id, unit_id' });
       }
       
       await supabase
         .from('user_unit_progress')
         .upsert({
             user_id: user.id,
             unit_id: dbUnitId,
             is_completed: true
         }, { onConflict: 'user_id, unit_id' });
    }
  },

  addXP: async (amount) => {
    const { user } = get();
    if (!user) return;
    const newXP = user.total_xp + amount;
    set({ user: { ...user, total_xp: newXP } });
    await supabase.from('profiles').update({ total_xp: newXP }).eq('id', user.id);
  },

  loadFlashcardSession: async () => {
    const { user } = get();
    if (!user) return; 

    try {
      // 1. Check if we need to initialize/reset the session
      // If the user has NO items in the session table, call the RPC to load from vocabulary_words
      const { count, error: countError } = await supabase
        .from('user_flashcard_session_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      if (count === 0) {
        console.log("Initializing Flashcard Session...");
        const { error: rpcError } = await supabase.rpc('reset_flashcard_session');
        if (rpcError) throw rpcError;
      }

      // 2. Fetch Flashcards
      let allItems: FlashcardItem[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
         const { data, error } = await supabase
           .from('user_flashcard_session_items')
           .select(`
              id,
              word_id,
              session_state,
              word:vocabulary_words(*)
            `)
           .eq('user_id', user.id)
           .range(page * pageSize, (page + 1) * pageSize - 1);

         if (error) throw error;

         if (data && data.length > 0) {
            allItems = [...allItems, ...data] as FlashcardItem[];
            if (data.length < pageSize) {
               hasMore = false;
            } else {
               page++;
            }
         } else {
            hasMore = false;
         }
      }

      set({ flashcards: allItems });

    } catch (e: any) {
      console.error("Error loading flashcards:", e.message);
    }
  },

  markFlashcard: async (itemId, state) => {
    // Optimistic Update
    set(prev => ({
      flashcards: prev.flashcards.map(item => 
        item.id === itemId ? { ...item, session_state: state } : item
      )
    }));

    // DB Update
    const { error } = await supabase
      .from('user_flashcard_session_items')
      .update({ session_state: state })
      .eq('id', itemId);
      
    if (error) {
        console.error("Failed to update flashcard state in DB:", error.message);
    }
  },

  resetFlashcards: async () => {
     // Call Database Reset
     const { error } = await supabase.rpc('reset_flashcard_session');
     
     if (error) {
         console.error("Failed to reset via RPC", error.message);
     } else {
         // Reload fresh state
         await get().loadFlashcardSession();
     }
  }

}));