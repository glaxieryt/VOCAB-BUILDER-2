import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Lesson } from '../types';
import { generateLessons } from '../lib/mockData';

interface AppState {
  user: User | null;
  lessons: Lesson[];
  isAuthenticated: boolean;
  
  // Actions
  login: (username: string) => void;
  signup: (username: string, email: string) => void;
  logout: () => void;
  completeLesson: (lessonId: string, score: number, stars: number) => void;
  initialize: () => void;
  addXP: (amount: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      lessons: [],
      isAuthenticated: false,

      initialize: () => {
        const currentLessons = get().lessons;
        if (currentLessons.length === 0) {
          set({ lessons: generateLessons() });
        }
      },

      login: (username: string) => {
        // Mock Login
        set({
          isAuthenticated: true,
          user: {
            id: 'user-1',
            email: `${username.toLowerCase()}@example.com`,
            username,
            full_name: username,
            current_streak: 5,
            total_xp: 1250,
            current_level: 3,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          }
        });
      },

      signup: (username: string, email: string) => {
        set({
          isAuthenticated: true,
          user: {
            id: 'user-new',
            email,
            username,
            full_name: username,
            current_streak: 1,
            total_xp: 0,
            current_level: 1,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          },
          lessons: generateLessons() // Reset progress for new user
        });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      addXP: (amount: number) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              total_xp: user.total_xp + amount
            }
          });
        }
      },

      completeLesson: (lessonId: string, score: number, stars: number) => {
        const { lessons, user } = get();
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        
        if (lessonIndex !== -1) {
          const updatedLessons = [...lessons];
          updatedLessons[lessonIndex] = {
            ...updatedLessons[lessonIndex],
            completed: true,
            score,
            stars
          };

          // Unlock next lesson
          if (lessonIndex + 1 < updatedLessons.length) {
            updatedLessons[lessonIndex + 1] = {
              ...updatedLessons[lessonIndex + 1],
              is_locked: false
            };
          }

          const xpGained = 50 + Math.floor(score / 2);

          set({ 
            lessons: updatedLessons,
            user: user ? {
              ...user,
              total_xp: user.total_xp + xpGained
            } : null
          });
        }
      }
    }),
    {
      name: 'vocab-master-storage',
    }
  )
);