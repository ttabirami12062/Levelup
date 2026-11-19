"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
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
  lastPlayed: string;
  loading:   boolean; // true while we fetch from Supabase — screens can wait on this
  addCoins:  (amount: number) => void;
  addGems:   (amount: number) => void;
  spendCoins:(amount: number) => boolean; // false if not enough coins
  spendGems: (amount: number) => boolean;
  updateStreak: () => void;
}

// Streak days that earn a big reward and a celebration on Home.
export const STREAK_MILESTONES: Record<number, { coins: number; gems: number; message: string }> = {
  7:   { coins: 5,  gems: 0, message: "One whole week of playing! You are on fire!" },
  30:  { coins: 15, gems: 1, message: "30 days! You are a Levelup legend!" },
  100: { coins: 50, gems: 3, message: "100 DAYS! You are absolutely unstoppable!" },
};
// Every 10th day that isn't a milestone gives a small bonus.
export const STREAK_BONUS_COINS = 2;

// Coins and gems can never drop below zero, wherever the change comes from.
const clamp = (n: number) => Math.max(0, Math.floor(n || 0));
const clean = (st: GameState): GameState => ({ ...st, coins: clamp(st.coins), gems: clamp(st.gems) });

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
  // Latest state for spend checks, so two quick taps can't both pass on stale coins.
  const stateRef = useRef<GameState>(DEFAULT_STATE);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

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
        // clamp also repairs any negative totals saved by older versions
        setGameState({
          coins:      clamp(data.coins),
          gems:       clamp(data.gems),
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
    stateRef.current = next;
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

  // ── ADD COINS / GEMS ── (negative amounts are penalties, floored at 0)
  const addCoins = (amount: number) => {
    setGameState((prev) => {
      const next = clean({ ...prev, coins: prev.coins + amount });
      saveToSupabase(next);
      return next;
    });
  };

  const addGems = (amount: number) => {
    setGameState((prev) => {
      const next = clean({ ...prev, gems: prev.gems + amount });
      saveToSupabase(next);
      return next;
    });
  };

  // ── SPEND COINS / GEMS ──
  // Returns false if there isn't enough. Checks stateRef (updated synchronously
  // on every change) rather than render state, so a double tap can't overspend.
  const spendCoins = (amount: number): boolean => {
    if (stateRef.current.coins < amount) return false;
    const next = clean({ ...stateRef.current, coins: stateRef.current.coins - amount });
    saveToSupabase(next);
    setGameState(next);
    return true;
  };

  const spendGems = (amount: number): boolean => {
    if (stateRef.current.gems < amount) return false;
    const next = clean({ ...stateRef.current, gems: stateRef.current.gems - amount });
    saveToSupabase(next);
    setGameState(next);
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
        const newStreak = prev.streak + 1;
        const milestone = STREAK_MILESTONES[newStreak];
        const bonusCoins = milestone ? milestone.coins : newStreak % 10 === 0 ? STREAK_BONUS_COINS : 0;
        next = clean({
          ...prev,
          streak:     newStreak,
          coins:      prev.coins + bonusCoins,
          gems:       prev.gems + (milestone?.gems ?? 0),
          lastPlayed: today,
        });
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
        lastPlayed: gameState.lastPlayed,
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