"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ── TYPES ──
// This defines the shape of all our game data
// TypeScript needs to know what fields exist and what type they are
interface GameState {
  coins:     number;
  gems:      number;
  streak:    number;
  lastPlayed: string; // date string — used to track daily streak
}

interface GameContextType {
  coins:     number;
  gems:      number;
  streak:    number;
  addCoins:  (amount: number) => void;
  addGems:   (amount: number) => void;
  spendCoins:(amount: number) => boolean; // returns false if not enough coins
  spendGems: (amount: number) => boolean;
  updateStreak: () => void;
}

// ── CREATE CONTEXT ──
// This is the actual shared backpack
const GameContext = createContext<GameContextType | null>(null);

// ── DEFAULT STATE ──
// What every new player starts with
const DEFAULT_STATE: GameState = {
  coins:      0,
  gems:       0,
  streak:     0,
  lastPlayed: "",
};

// ── STORAGE KEY ──
// The key we use to save/load from localStorage
const STORAGE_KEY = "levelup_gamestate";

// ── PROVIDER ──
// This wraps the entire app and makes the backpack available everywhere
// Any screen inside this provider can access coins, gems, streak
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);

  // ── LOAD FROM LOCALSTORAGE ON STARTUP ──
  // When the app first loads read saved data from the browser
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
      } catch {
        // If saved data is corrupted start fresh
        setGameState(DEFAULT_STATE);
      }
    }
  }, []);

  // ── SAVE TO LOCALSTORAGE WHENEVER STATE CHANGES ──
  // Every time coins, gems or streak changes save it automatically
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // ── ADD COINS ──
  const addCoins = (amount: number) => {
    setGameState((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  // ── ADD GEMS ──
  const addGems = (amount: number) => {
    setGameState((prev) => ({ ...prev, gems: prev.gems + amount }));
  };

  // ── SPEND COINS ──
  // Returns true if successful, false if not enough coins
  const spendCoins = (amount: number): boolean => {
    if (gameState.coins < amount) return false;
    setGameState((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  };

  // ── SPEND GEMS ──
  const spendGems = (amount: number): boolean => {
    if (gameState.gems < amount) return false;
    setGameState((prev) => ({ ...prev, gems: prev.gems - amount }));
    return true;
  };

  // ── UPDATE STREAK ──
  // Called when a kid completes a game session
  // Checks if they played yesterday — if yes streak goes up
  // If they missed a day streak resets to 1
  const updateStreak = () => {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    setGameState((prev) => {
      if (prev.lastPlayed === today) {
        // Already played today — no change
        return prev;
      } else if (prev.lastPlayed === yesterday) {
        // Played yesterday — streak continues
        const newStreak = prev.streak + 1;
        // Every 10 days give 2 bonus coins
        const bonusCoins = newStreak % 10 === 0 ? 2 : 0;
        return {
          ...prev,
          streak:     newStreak,
          coins:      prev.coins + bonusCoins,
          lastPlayed: today,
        };
      } else {
        // Missed a day or first time — reset streak to 1
        return {
          ...prev,
          streak:     1,
          lastPlayed: today,
        };
      }
    });
  };

  return (
    <GameContext.Provider
      value={{
        coins:    gameState.coins,
        gems:     gameState.gems,
        streak:   gameState.streak,
        addCoins,
        addGems,
        spendCoins,
        spendGems,
        updateStreak,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ── CUSTOM HOOK ──
// This is how any screen accesses the backpack
// Instead of writing useContext(GameContext) everywhere
// we just write useGame() — cleaner and simpler
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }
  return context;
}