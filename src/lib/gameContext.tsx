"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// ── TYPES ──
// The shape of one kid's game data, matching the Supabase "progress" table.
interface GameState {
  coins:      number;
  gems:       number;
  streak:     number;
  lastPlayed: string; // stored in DB column "last_played"
}

interface GameContextType {
  coins:     number;
  gems:      number;
  streak:    number;
  loading:   boolean; // true while we fetch from Supabase — screens can wait on this
  addCoins:  (amount: number) => void;
  addGems:   (amount: number) => void;
  spendCoins:(amount: number) => boolean; // false if not enough coins
  spendGems: (amount: number) => boolean;
  updateStreak: () => void;
}

// ── CONTEXT ──
const GameContext = createContext<GameContextType | null>(null);

// ── DEFAULT STATE ──
// What a brand-new player starts with.
const DEFAULT_STATE: GameState = {
  coins:      0,
  gems:       0,
  streak:     0,
  lastPlayed: "",
};

// ── PROVIDER ──
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [loading, setLoading]     = useState(true);
  // Which kid is playing. Read from localStorage (set by the profile picker).
  const [profileId, setProfileId] = useState<string | null>(null);

  // ── LOAD THE ACTIVE PROFILE'S PROGRESS FROM SUPABASE ──
  // Runs once on startup. Reads which kid is active, then pulls their row.
  // If no row exists yet (new kid), creates one with default values.
  useEffect(() => {
    const load = async () => {
      const id = localStorage.getItem("levelup_active_profile");

      // No active profile means nobody picked a player — stay on defaults.
      if (!id) {
        setLoading(false);
        return;
      }
      setProfileId(id);

      // Try to fetch this profile's progress row.
      const { data, error } = await supabase
        .from("progress")
        .select("coins, gems, streak, last_played")
        .eq("profile_id", id)
        .single();

      if (data && !error) {
        // Row exists — load it into state.
        setGameState({
          coins:      data.coins  ?? 0,
          gems:       data.gems   ?? 0,
          streak:     data.streak ?? 0,
          lastPlayed: data.last_played ?? "",
        });
      } else {
        // No row yet — create one with defaults so this kid is set up.
        await supabase.from("progress").insert({
          profile_id:  id,
          coins:       0,
          gems:        0,
          streak:      0,
          last_played: "",
        });
        setGameState(DEFAULT_STATE);
      }

      setLoading(false);
    };

    load();
  }, []);

  // ── SAVE A NEW STATE TO SUPABASE ──
  // Helper used by every action below. Writes the given state to the DB
  // for the active profile. Reads the id straight from localStorage as a
  // fallback so the save still works even if React state hasn't caught up.
  const saveToSupabase = (next: GameState) => {
    const id = profileId ?? localStorage.getItem("levelup_active_profile");
    if (!id) return;
    supabase
      .from("progress")
      .update({
        coins:       next.coins,
        gems:        next.gems,
        streak:      next.streak,
        last_played: next.lastPlayed,
        updated_at:  new Date().toISOString(),
      })
      .eq("profile_id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to save progress:", error.message);
      });
  };

  // ── ADD COINS ──
  const addCoins = (amount: number) => {
    setGameState((prev) => {
      const next = { ...prev, coins: prev.coins + amount };
      saveToSupabase(next);
      return next;
    });
  };

  // ── ADD GEMS ──
  const addGems = (amount: number) => {
    setGameState((prev) => {
      const next = { ...prev, gems: prev.gems + amount };
      saveToSupabase(next);
      return next;
    });
  };

  // ── SPEND COINS ──
  // Returns true if successful, false if not enough coins.
  const spendCoins = (amount: number): boolean => {
    if (gameState.coins < amount) return false;
    setGameState((prev) => {
      const next = { ...prev, coins: prev.coins - amount };
      saveToSupabase(next);
      return next;
    });
    return true;
  };

  // ── SPEND GEMS ──
  const spendGems = (amount: number): boolean => {
    if (gameState.gems < amount) return false;
    setGameState((prev) => {
      const next = { ...prev, gems: prev.gems - amount };
      saveToSupabase(next);
      return next;
    });
    return true;
  };

  // ── UPDATE STREAK ──
  // Called when a kid finishes a session.
  // Same day = no change. Yesterday = streak +1. Otherwise = reset to 1.
  const updateStreak = () => {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    setGameState((prev) => {
      let next: GameState;

      if (prev.lastPlayed === today) {
        // Already played today — no change, no save needed.
        return prev;
      } else if (prev.lastPlayed === yesterday) {
        // Played yesterday — streak continues.
        const newStreak  = prev.streak + 1;
        const bonusCoins = newStreak % 10 === 0 ? 2 : 0; // every 10 days, +2 coins
        next = {
          ...prev,
          streak:     newStreak,
          coins:      prev.coins + bonusCoins,
          lastPlayed: today,
        };
      } else {
        // Missed a day or first time — reset streak to 1.
        next = { ...prev, streak: 1, lastPlayed: today };
      }

      saveToSupabase(next);
      return next;
    });
  };

  return (
    <GameContext.Provider
      value={{
        coins:    gameState.coins,
        gems:     gameState.gems,
        streak:   gameState.streak,
        loading,
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
// How any screen accesses the game data: const { coins } = useGame();
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }
  return context;
}