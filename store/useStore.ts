import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Unit, LessonNode, FlashcardItem, FlashcardState } from '../types';
import { seedDatabase } from '../lib/seeder';
import { generateUnits, SEED_VOCABULARY } from '../lib/mockData';

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
    
    // --- MOCK MODE INITIALIZATION ---
    if (!isSupabaseConfigured) {
      console.log("⚠️ App running in Mock Mode (No DB Connection)");
      set({ units: generateUnits(), isLoading: false });
      return;
    }
    // --------------------------------

    try {
      // 1. Check if DB needs seeding
      const { count, error: countError } = await supabase.from('units').select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;

      if (count === 0) {
         await seedDatabase();
      }

      // 2. Get User Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        // 3. Fetch User Profile
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
        }
      }

      // 4. Load Course Data
      await get().fetchCourseData();

      // 5. Auth Listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
          get().initialize();
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false, units: [] });
        }
      });

    } catch (error) {
      console.error("Initialization error (falling back to mock data):", error);
      set({ units: generateUnits(), authError: "Offline Mode: Using mock data" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourseData: async () => {
    const user = get().user;
    
    // --- MOCK MODE FETCH ---
    if (!isSupabaseConfigured) {
       if (get().units.length === 0) {
         set({ units: generateUnits() });
       }
       return;
    }
    // ----------------------

    try {
      // A. Fetch Static Content
      const { data: unitsDb, error: unitsError } = await supabase
        .from('units')
        .select('*, lessons(*)')
        .order('sequence_number', { ascending: true });

      if (unitsError) throw unitsError;
      if (!unitsDb) return;

      // B. Fetch User Progress (if logged in)
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

      // C. Merge and Construct State
      const mergedUnits: Unit[] = unitsDb.map((u: any) => {
         const sortedLessons = (u.lessons || []).sort((a: any, b: any) => a.lesson_number - b.lesson_number);
         
         let previousLessonCompleted = true; 

         const mappedLessons: LessonNode[] = sortedLessons.map((l: any, index: number) => {
            const progress = lessonProgressMap[l.id];
            // Check 'is_completed' from DB column, default to false
            const isCompleted = !!progress?.is_completed;
            
            let isLocked = true;
            
            if (u.sequence_number === 1 && l.lesson_number === 1) {
               isLocked = false;
            } else if (isCompleted) {
               isLocked = false;
            } else if (previousLessonCompleted) {
               isLocked = false;
            }

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
    } catch (err) {
      console.error("Error fetching course data:", err);
    }
  },

  login: async (username, password) => {
    // --- MOCK LOGIN ---
    if (!isSupabaseConfigured) {
      console.log("Simulating Login (Mock Mode)");
      set({ 
        isAuthenticated: true, 
        user: {
           id: 'mock-user-123',
           email: `${username}@example.com`,
           username: username,
           full_name: username,
           current_streak: 1,
           total_xp: 0,
           current_level: 1,
           avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        },
        authError: null
      });
      return;
    }
    // ------------------

    const email = username.includes('@') ? username : `${username}@example.com`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      let msg = error.message;
      if (msg.includes("Invalid login credentials")) {
        msg = "No user found with these details. Please Sign Up first.";
      }
      set({ authError: msg });
    } else {
      set({ authError: null });
    }
  },

  signup: async (username, password) => {
     // --- MOCK SIGNUP ---
     if (!isSupabaseConfigured) {
      set({ authError: "Signup simulated! Please log in with the same credentials." });
      return;
    }
    // -------------------

    const email = `${username}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        }
      }
    });

    if (error) {
      set({ authError: error.message });
    } else {
      set({ authError: null });
      if (!data.session) {
         set({ authError: "Please check your email to confirm signup." });
      }
    }
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, isAuthenticated: false, units: [] });
    // Reload defaults for landing page
    get().initialize();
  },

  completeLesson: async (lessonIdString, score, stars) => {
    const { user, units } = get();
    if (!user) return;

    const parts = lessonIdString.split('-');
    const unitSeq = parseInt(parts[1]);
    const lessonNum = parseInt(parts[3]);

    // --- OPTIMISTIC / MOCK UPDATE ---
    let nextUnitUnlocked = false;

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
           
           if (lessonNum === 11 && score >= 75) {
               nextUnitUnlocked = true;
           }

           return { ...u, lessons: updatedLessons };
       }
       return u;
    });

    if (nextUnitUnlocked) {
        const nextUnitIndex = updatedUnits.findIndex(u => u.id === unitSeq + 1);
        if (nextUnitIndex !== -1) {
            updatedUnits[nextUnitIndex].isLocked = false;
            if (updatedUnits[nextUnitIndex].lessons.length > 0) {
                updatedUnits[nextUnitIndex].lessons[0].isLocked = false;
            }
        }
    }

    set({ units: updatedUnits });
    await get().addXP(10 + (stars * 5));

    // --- REAL DB UPDATE ---
    if (!isSupabaseConfigured) return;

    const unit = units.find(u => u.id === unitSeq);
    const lesson = unit?.lessons.find(l => l.lessonNumber === lessonNum);

    if (!lesson || !(lesson as any).dbId) return;

    const dbLessonId = (lesson as any).dbId;
    const dbUnitId = (unit as any).dbId;

    // Use 'is_completed' column as requested
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: dbLessonId,
        is_completed: true, 
        score,
        stars
      }, { onConflict: 'user_id, lesson_id' });

    if (error) console.error("Error saving progress:", error);

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

    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({ total_xp: newXP })
        .eq('id', user.id);
    }
  },

  // --- FLASHCARD ACTIONS ---
  
  loadFlashcardSession: async () => {
    const { user } = get();
    if (!user) return;

    // Mock Mode
    if (!isSupabaseConfigured) {
      const mockSession = SEED_VOCABULARY.map(word => ({
        id: `card-${word.id}`,
        word_id: word.id,
        word: word,
        session_state: 'pending' as FlashcardState
      }));
      set({ flashcards: mockSession });
      return;
    }

    try {
      // 1. Check current size of the deck
      const { count, error: countError } = await supabase
        .from('user_flashcard_session_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      // 2. Fix the "20 Words Bug": If the deck is small (incomplete), force populate via RPC
      // The requirement is 1161 words. If significantly less, we reset.
      if (count === null || count < 100) {
        console.log("Deck incomplete. Initializing full vocabulary via RPC...");
        const { error: rpcError } = await supabase.rpc('reset_flashcard_session');
        if (rpcError) throw rpcError;
      }

      // 3. Fetch ALL items with Pagination (Supabase defaults to 1000 rows max)
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

    } catch (e) {
      console.error("Error loading flashcards:", e);
    }
  },

  markFlashcard: async (itemId, state) => {
    // Optimistic Update
    set(prev => ({
      flashcards: prev.flashcards.map(item => 
        item.id === itemId ? { ...item, session_state: state } : item
      )
    }));

    if (isSupabaseConfigured) {
      await supabase
        .from('user_flashcard_session_items')
        .update({ session_state: state })
        .eq('id', itemId);
    }
  },

  resetFlashcards: async () => {
     const { user } = get();
     if (!user) return;

     // 1. Optimistic Update: INSTANTLY set all to pending
     set(prev => ({
       flashcards: prev.flashcards.map(item => ({ ...item, session_state: 'pending' }))
     }));

    if (isSupabaseConfigured) {
       // 2. Call RPC to reset backend state
       const { error } = await supabase.rpc('reset_flashcard_session');
       
       if (error) {
           console.error("Failed to reset via RPC", error);
       } else {
           // 3. Reload session to ensure exact sync
           await get().loadFlashcardSession();
       }
    }
  }

}));