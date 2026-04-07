import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Winner, Settings } from '../types';

interface GiveawayState {
  settings: Settings;
  isGiveawayActive: boolean;
  currentPrize: string;
  entrants: string[];
  winners: Winner[];

  updateSettings: (s: Partial<Settings>) => void;
  startGiveaway: (prize: string) => void;
  stopGiveaway: () => void;
  addEntrant: (username: string) => void;
  drawWinner: () => Winner | null;
  removeWinner: (username: string) => void;
  resetCooldown: (username: string) => void;
}

export const useGiveawayStore = create<GiveawayState>()(
  persist(
    (set, get) => ({
      settings: {
        twitchChannel: '',
        twitchOAuthToken: '',
        fourthwallApiKey: '',
        cooldownDays: 30,
        entryKeyword: '!enter',
      },
      isGiveawayActive: false,
      currentPrize: '',
      entrants: [],
      winners: [],

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      startGiveaway: (prize) =>
        set({ isGiveawayActive: true, currentPrize: prize, entrants: [] }),

      stopGiveaway: () =>
        set({ isGiveawayActive: false, entrants: [] }),

      addEntrant: (username) => {
        const { isGiveawayActive, entrants, winners } = get();
        if (!isGiveawayActive) return;
        const lc = username.toLowerCase();
        if (entrants.includes(lc)) return;

        const winner = winners.find((w) => w.username.toLowerCase() === lc);
        if (winner && Date.now() < winner.eligibleAt) return;

        set({ entrants: [...entrants, lc] });
      },

      drawWinner: () => {
        const { entrants, currentPrize, settings } = get();
        if (entrants.length === 0) return null;

        const idx = Math.floor(Math.random() * entrants.length);
        const username = entrants[idx];
        const now = Date.now();
        const winner: Winner = {
          username,
          wonAt: now,
          prize: currentPrize,
          eligibleAt: now + settings.cooldownDays * 24 * 60 * 60 * 1000,
        };

        set((state) => ({
          winners: [
            winner,
            ...state.winners.filter(
              (w) => w.username.toLowerCase() !== username.toLowerCase()
            ),
          ],
          entrants: state.entrants.filter((e) => e !== username),
          isGiveawayActive: false,
        }));

        return winner;
      },

      removeWinner: (username) =>
        set((state) => ({
          winners: state.winners.filter(
            (w) => w.username.toLowerCase() !== username.toLowerCase()
          ),
        })),

      resetCooldown: (username) =>
        set((state) => ({
          winners: state.winners.map((w) =>
            w.username.toLowerCase() === username.toLowerCase()
              ? { ...w, eligibleAt: Date.now() }
              : w
          ),
        })),
    }),
    {
      name: 'giveaway-tool-storage',
      partialize: (state) => ({
        settings: state.settings,
        winners: state.winners,
      }),
    }
  )
);
