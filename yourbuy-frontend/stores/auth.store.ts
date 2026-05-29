import { create } from 'zustand';

type User = { id: string; email: string; username: string; role: string } | null;

export const useAuthStore = create<{ user: User; setUser: (user: User) => void }>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
