"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/gameContext";

// ============================================
// TYPES
// ============================================

interface Stone {
  id: number;
  lane: number;
  y: number;
  value: number;
  isAnswer: boolean;
  collected: boolean;
  status: "normal" | "correct" | "wrong";
}

interface Equation {
  question: string;
  answer: number;
  type: "add" | "subtract" | "multiply";
}

interface RewardPop {
  id: number;
  text: string;
  x: number;
  y: number;
  type: "coin" | "coins" | "gem" | "wrong";
}

// ============================================
// MATH ENGINE
// ============================================

function generateEquation(level: number): Equation {
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  if (level <= 3) {
    const a = rand(1, level * 4 + 2);
    const b = rand(1, level * 4 + 2);
    return { question: `${a} + ${b} = ?`, answer: a + b, type: "add" };
  }
  if (level <= 6) {
    const useAdd = Math.random() > 0.5;
    if (useAdd) {
      const a = rand(5, level * 4);
      const b = rand(5, level * 4);
      return { question: `${a} + ${b} = ?`, answer: a + b, type: "add" };
    }
    const a = rand(10, level * 5);
    const b = rand(1, a);
    return { question: `${a} − ${b} = ?`, answer: a - b, type: "subtract" };
  }
  const a = rand(2, 12);
  const b = rand(2, 12);
  return { question: `${a} × ${b} = ?`, answer: a * b, type: "multiply" };
}

function generateDecoys(answer: number, count: number): number[] {
  const decoys = new Set<number>();
  const offsets = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7];
  let attempts = 0;
  while (decoys.size < count && attempts < 40) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const decoy = Math.max(0, answer + offset);
    if (decoy !== answer) decoys.add(decoy);
    attempts++;
  }
  return Array.from(decoys);
}

// ============================================
// CONSTANTS
// ============================================

const LANE_COUNT     = 4;
const STONE_SIZE     = 64;
const STONE_SPEED    = 1.0;
const SPAWN_INTERVAL = 2800;
const AVATAR_BOTTOM  = 150;

const HINT_FACTS = [
  { fact: "Zero was invented in ancient India around 500 AD!", hint: "Break the problem into smaller steps." },
  { fact: "The equals sign = was invented in 1557!", hint: "Try counting up from the smaller number." },
  { fact: "Multiplication is just fast addition!", hint: "Think of it as groups of numbers." },
  { fact: "Ancient Egyptians used math to build pyramids!", hint: "Work backwards from the answer choices." },
  { fact: "The word algebra comes from Arabic!", hint: "Try each answer and see which fits." },
  { fact: "Pi has been calculated to over 100 trillion digits!", hint: "Use your fingers to count if needed." },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function SoloGame() {
  const router = useRouter();
  const { addCoins, addGems, updateStreak } = useGame();

  const [equation, setEquation]         = useState<Equation>({ question: "Get ready!", answer: 0, type: "add" });
  const [stones, setStones]             = useState<Stone[]>([]);
  const [avatarLane, setAvatarLane]     = useState(1);
  const [level, setLevel]               = useState(1);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [sessionGems, setSessionGems]   = useState(0);
  const [gamePhase, setGamePhase]       = useState<"countdown" | "playing">("countdown");
  const [countdown, setCountdown]       = useState(3);
  const [timerWidth, setTimerWidth]     = useState(100);
  const [rewardPops, setRewardPops]     = useState<RewardPop[]>([]);
  const [showHint, setShowHint]         = useState(false);
  const [hintIndex, setHintIndex]       = useState(0);
  const [coinLost, setCoinLost]         = useState(false);
  const [gemFlash, setGemFlash]         = useState(false);

  const stonesRef       = useRef<Stone[]>([]);
  const equationRef     = useRef<Equation>(equation);
  const avatarLaneRef   = useRef(avatarLane);
  const levelRef        = useRef(level);
  const gamePhaseRef    = useRef(gamePhase);
  const stoneIdRef      = useRef(0);
  const spawnTimerRef   = useRef(0);
  const lastTimeRef     = useRef(0);
  const animFrameRef    = useRef<number>(0);
  const timerRef        = useRef(100);
  const negRef          = useRef(0);
  const scoreRef        = useRef(0);
  const sessionCoinsRef = useRef(0);
  const sessionGemsRef  = useRef(0);
  const worldHRef       = useRef(0);

  useEffect(() => { equationRef.current   = equation;  }, [equation]);
  useEffect(() => { avatarLaneRef.current = avatarLane; }, [avatarLane]);
  useEffect(() => { levelRef.current      = level;     }, [level]);
  useEffect(() => { gamePhaseRef.current  = gamePhase; }, [gamePhase]);
  useEffect(() => { stonesRef.current     = stones;    }, [stones]);

  useEffect(() => {
    const measure = () => {
      const el = document.getElementById("gameWorld");
      if (el) worldHRef.current = el.clientHeight;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const getLaneX = useCallback((lane: number) => {
    const laneW = window.innerWidth / LANE_COUNT;
    return Math.floor(lane * laneW + (laneW - STONE_SIZE) / 2);
  }, []);

  // ── SPAWN WAVE ──
  // All 4 stones spawn at once in randomized lanes
  // Answer is placed in a random lane — never predictable
  const spawnWave = useCallback(() => {
    const eq     = equationRef.current;
    const decoys = generateDecoys(eq.answer, 3);

    // Shuffle all 4 lanes randomly
    const lanes = [0, 1, 2, 3].sort(() => Math.random() - 0.5);

    // Answer goes into whichever lane ends up first after shuffle
    const answerLane = lanes[Math.floor(Math.random() * lanes.length)];

    const newStones: Stone[] = lanes.map((lane, index) => {
      const isAnswer = lane === answerLane;
      const value    = isAnswer
        ? eq.answer
        : decoys[index < decoys.length ? index : decoys.length - 1];

      return {
        id:        stoneIdRef.current++,
        lane,
        y:         -STONE_SIZE - 20,
        value,
        isAnswer,
        collected: false,
        status:    "normal" as const,
      };
    });

    setStones(prev => [...prev, ...newStones]);
    stonesRef.current = [...stonesRef.current, ...newStones];
  }, []);

  // ── HANDLE COLLECT ──
  const handleCollect = useCallback((stone: Stone) => {
    const eq = equationRef.current;

    if (stone.value === eq.answer) {
      scoreRef.current++;

      // Variable reward drop — the dopamine mechanic
      const roll = Math.random();
      let popType: RewardPop["type"] = "coin";
      let coinAmount = 1;

      if (roll > 0.9) {
        // 10% chance — rare gem
        addGems(1);
        sessionGemsRef.current += 1;
        setSessionGems(sessionGemsRef.current);
        coinAmount = 0;
        popType = "gem";
        // Flash the gem badge
        setGemFlash(true);
        setTimeout(() => setGemFlash(false), 1000);
      } else if (roll > 0.65) {
        // 25% chance — coin bag
        coinAmount = 3;
        popType = "coins";
      } else {
        // 65% chance — single coin
        coinAmount = 1;
        popType = "coin";
      }

      if (coinAmount > 0) {
        addCoins(coinAmount);
        sessionCoinsRef.current += coinAmount;
        setSessionCoins(sessionCoinsRef.current);
      }

      // Reward pop animation
      const popId = Date.now() + Math.random();
      setRewardPops(prev => [...prev, {
        id:      popId,
        text:    popType === "gem" ? "+1 gem!" : popType === "coins" ? "+3 coins!" : "+1 coin",
        x:       getLaneX(stone.lane),
        y:       stone.y,
        type:    popType,
      }]);
      setTimeout(() => setRewardPops(prev => prev.filter(p => p.id !== popId)), 1000);

      setStones(prev => prev.map(s =>
        s.id === stone.id ? { ...s, status: "correct" as const, collected: true } : s
      ));
      stonesRef.current = stonesRef.current.map(s =>
        s.id === stone.id ? { ...s, status: "correct" as const, collected: true } : s
      );

      // Level up every 5 correct
      if (scoreRef.current % 5 === 0) {
        levelRef.current = Math.min(levelRef.current + 1, 10);
        setLevel(levelRef.current);
      }

      // Next equation — clear all current stones
      setTimeout(() => {
        const newEq = generateEquation(levelRef.current);
        equationRef.current = newEq;
        setEquation(newEq);
        timerRef.current = 100;
        setTimerWidth(100);
        setStones([]);
        stonesRef.current = [];
        spawnTimerRef.current = SPAWN_INTERVAL;
      }, 500);

    } else {
      // ── WRONG ──
      negRef.current++;

      // Every 5 wrong answers — lose 1 coin visibly
      if (negRef.current % 5 === 0) {
        addCoins(-1);
        sessionCoinsRef.current = Math.max(0, sessionCoinsRef.current - 1);
        setSessionCoins(sessionCoinsRef.current);
        setCoinLost(true);
        setTimeout(() => setCoinLost(false), 1200);
      }

      const popId = Date.now() + Math.random();
      setRewardPops(prev => [...prev, {
        id:   popId,
        text: "wrong!",
        x:    getLaneX(stone.lane),
        y:    stone.y,
        type: "wrong",
      }]);
      setTimeout(() => setRewardPops(prev => prev.filter(p => p.id !== popId)), 700);

      setStones(prev => prev.map(s =>
        s.id === stone.id ? { ...s, status: "wrong" as const, collected: true } : s
      ));
      stonesRef.current = stonesRef.current.map(s =>
        s.id === stone.id ? { ...s, status: "wrong" as const, collected: true } : s
      );

      setTimeout(() => {
        setStones(prev => prev.filter(s => s.id !== stone.id));
        stonesRef.current = stonesRef.current.filter(s => s.id !== stone.id);
      }, 400);
    }
  }, [addCoins, addGems, getLaneX]);

  // ── GAME LOOP ──
  const gameLoop = useCallback((timestamp: number) => {
    if (gamePhaseRef.current !== "playing") return;

    const delta = Math.min(timestamp - lastTimeRef.current, 50);
    lastTimeRef.current = timestamp;

    spawnTimerRef.current += delta;

    // Spawn new wave when screen is clear
    const activeStones = stonesRef.current.filter(
      s => !s.collected && s.y < (worldHRef.current || 600)
    );
    if (activeStones.length === 0 && spawnTimerRef.current > SPAWN_INTERVAL) {
      spawnWave();
      spawnTimerRef.current = 0;
    }

    const worldH    = worldHRef.current || window.innerHeight * 0.7;
    const avatarTop = worldH - AVATAR_BOTTOM - 70;
    const avatarBot = worldH - AVATAR_BOTTOM;

    setStones(prev => {
      const updated = prev.map(stone => {
        if (stone.collected) return stone;

        const newY = stone.y + STONE_SPEED;

        // Tight collision detection
        const stoneCenterY  = newY + STONE_SIZE / 2;
        const avatarCenterY = (avatarTop + avatarBot) / 2;
        const vertHit  = Math.abs(stoneCenterY - avatarCenterY) < 30;
        const horizHit = stone.lane === avatarLaneRef.current;

        if (vertHit && horizHit && !stone.collected) {
          setTimeout(() => handleCollect({ ...stone, y: newY }), 0);
          return { ...stone, y: newY, collected: true };
        }

        return { ...stone, y: newY };
      }).filter(s => s.y < worldH + 20);

      stonesRef.current = updated;
      return updated;
    });

    // Timer drains over 20 seconds
    timerRef.current = Math.max(0, timerRef.current - (delta / 200));
    setTimerWidth(timerRef.current);

    if (timerRef.current <= 0) {
      negRef.current++;
      timerRef.current = 100;
      setTimerWidth(100);
      const newEq = generateEquation(levelRef.current);
      equationRef.current = newEq;
      setEquation(newEq);
      setStones([]);
      stonesRef.current = [];
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [spawnWave, handleCollect]);

  // ── COUNTDOWN ──
  useEffect(() => {
    if (gamePhase !== "countdown") return;
    if (countdown <= 0) {
      const firstEq = generateEquation(1);
      setEquation(firstEq);
      equationRef.current = firstEq;
      setGamePhase("playing");
      gamePhaseRef.current = "playing";
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(gameLoop);
      // Update streak when kid starts playing
      updateStreak();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, gamePhase, gameLoop]);

  useEffect(() => {
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  // ── KEYBOARD ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gamePhaseRef.current !== "playing") return;
      if (e.key === "ArrowLeft")
        setAvatarLane(l => { const n = Math.max(0, l - 1); avatarLaneRef.current = n; return n; });
      if (e.key === "ArrowRight")
        setAvatarLane(l => { const n = Math.min(3, l + 1); avatarLaneRef.current = n; return n; });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const moveLeft = () => {
    if (gamePhase !== "playing") return;
    setAvatarLane(l => { const n = Math.max(0, l - 1); avatarLaneRef.current = n; return n; });
  };

  const moveRight = () => {
    if (gamePhase !== "playing") return;
    setAvatarLane(l => { const n = Math.min(3, l + 1); avatarLaneRef.current = n; return n; });
  };

  const handleHint = () => {
    // Pause the game loop when hint is shown
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setShowHint(true);
    setHintIndex(Math.floor(Math.random() * HINT_FACTS.length));
  };

  const getStoneStyle = (stone: Stone) => {
    if (stone.status === "correct") return { bg: "#5DBE4A", border: "#3D9E2A", color: "white" };
    if (stone.status === "wrong")   return { bg: "#E85454", border: "#C03030", color: "white" };
    return { bg: "#FFFFFF", border: "#E0E0E0", color: "#F5A623" };
  };

  const timerColor = timerWidth > 50
    ? "linear-gradient(to right, #5DBE4A, #FFD700)"
    : timerWidth > 25
      ? "linear-gradient(to right, #FFD700, #F5A623)"
      : "linear-gradient(to right, #E85454, #FF6B35)";

  // Reward pop color and icon
  const getPopStyle = (type: RewardPop["type"]) => {
    if (type === "gem")   return { color: "#C4AEFF", icon: "💎" };
    if (type === "coins") return { color: "#FFE066", icon: "💰" };
    if (type === "wrong") return { color: "#E85454", icon: "" };
    return { color: "#F5C842", icon: "🪙" };
  };

  return (
    <main
      className="w-full h-screen overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #5BB8F5 0%, #C9EEFF 55%, #6AC94F 55%, #4DAF35 60%, #C8874A 60%, #A0612A 100%)",
      }}
    >
      {/* ── CLOUDS ── */}
      <div className="absolute top-[4%] left-[3%] opacity-80 pointer-events-none z-10">
        <Cloud size="lg" />
      </div>
      <div className="absolute top-[8%] right-[5%] opacity-70 pointer-events-none z-10">
        <Cloud size="md" />
      </div>
      <div className="absolute top-[3%] left-[40%] opacity-60 pointer-events-none z-10">
        <Cloud size="sm" />
      </div>

      {/* ── TOP BAR ── */}
      <div
        style={{
          background: "rgba(26,26,46,0.88)",
          backdropFilter: "blur(8px)",
          padding: "10px 20px 8px",
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* Timer bar */}
        <div style={{ background: "#333", borderRadius: 99, height: 10, overflow: "hidden", marginBottom: 10 }}>
          <div
            style={{
              width: `${timerWidth}%`,
              height: "100%",
              borderRadius: 99,
              background: timerColor,
              transition: "background 0.5s ease",
            }}
          />
        </div>

        {/* Equation and stats row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-game)",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              color: "#F5A623",
              letterSpacing: 1,
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {equation.question}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

            {/* Coin badge */}
            <div
              style={{
                background: coinLost ? "rgba(232,84,84,0.25)" : "rgba(245,200,66,0.18)",
                borderRadius: 99,
                padding: "4px 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                border: coinLost ? "1.5px solid #E85454" : "1.5px solid transparent",
                transition: "all 0.3s ease",
              }}
            >
              <CoinSVG size={16} />
              <span
                style={{
                  fontFamily: "var(--font-game)",
                  fontSize: 14,
                  color: coinLost ? "#E85454" : "#F5C842",
                  transition: "color 0.3s ease",
                }}
              >
                {sessionCoins}
              </span>
              {coinLost && (
                <span style={{ fontFamily: "var(--font-game)", fontSize: 11, color: "#E85454" }}>
                  −1!
                </span>
              )}
            </div>

            {/* Gem badge */}
            <div
              style={{
                background: gemFlash ? "rgba(196,174,255,0.3)" : "rgba(155,127,232,0.18)",
                borderRadius: 99,
                padding: "4px 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                border: gemFlash ? "1.5px solid #C4AEFF" : "1.5px solid transparent",
                transition: "all 0.3s ease",
                boxShadow: gemFlash ? "0 0 12px rgba(196,174,255,0.6)" : "none",
              }}
            >
              <GemSVG size={14} />
              <span
                style={{
                  fontFamily: "var(--font-game)",
                  fontSize: 14,
                  color: gemFlash ? "#C4AEFF" : "#9B7FE8",
                  transition: "color 0.3s ease",
                }}
              >
                {sessionGems}
              </span>
              {gemFlash && (
                <span style={{ fontFamily: "var(--font-game)", fontSize: 11, color: "#C4AEFF" }}>
                  +gem!
                </span>
              )}
            </div>

            {/* Level badge */}
            <div style={{ background: "rgba(123,111,232,0.2)", borderRadius: 99, padding: "4px 12px" }}>
              <span style={{ fontFamily: "var(--font-game)", fontSize: 14, color: "#A89FF5" }}>
                Lv {level}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ── GAME WORLD ── */}
      <div
        id="gameWorld"
        style={{ position: "relative", flex: 1, overflow: "hidden" }}
        onTouchStart={(e) => {
          const x = e.touches[0].clientX;
          if (x < window.innerWidth / 2) moveLeft(); else moveRight();
        }}
      >
        {/* Bushes on the grass */}
        <div
          className="absolute w-full flex justify-around pointer-events-none"
          style={{ bottom: 8, zIndex: 4 }}
        >
          <Bush /><Bush /><Bush /><Bush />
          <Bush /><Bush /><Bush /><Bush />
        </div>

        {/* Stones */}
        {stones.map(stone => {
          const s = getStoneStyle(stone);
          return (
            <div
              key={stone.id}
              style={{
                position: "absolute",
                left: getLaneX(stone.lane),
                top: stone.y,
                width: STONE_SIZE,
                height: STONE_SIZE,
                borderRadius: 18,
                background: s.bg,
                border: `3px solid ${s.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-game)",
                fontSize: 24,
                color: s.color,
                boxShadow: `0 6px 0 ${s.border}, 0 8px 16px rgba(0,0,0,0.2)`,
                zIndex: 5,
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              {stone.value}
            </div>
          );
        })}

        {/* Reward pops */}
        {rewardPops.map(pop => {
          const ps = getPopStyle(pop.type);
          return (
            <div
              key={pop.id}
              style={{
                position: "absolute",
                left: pop.x,
                top: Math.max(20, pop.y - 10),
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-game)",
                fontSize: pop.type === "gem" ? 20 : 16,
                color: ps.color,
                textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                pointerEvents: "none",
                zIndex: 30,
                animation: "floatUp 1s ease forwards",
                whiteSpace: "nowrap",
              }}
            >
              {ps.icon && <span>{ps.icon}</span>}
              <span>{pop.text}</span>
            </div>
          );
        })}

        {/* Avatar */}
        <div
          style={{
            position: "absolute",
            bottom: AVATAR_BOTTOM,
            left: getLaneX(avatarLane),
            width: STONE_SIZE,
            transition: "left 0.15s cubic-bezier(0.25,0.46,0.45,0.94)",
            zIndex: 10,
          }}
        >
          <AvatarSVG />
        </div>

        {/* Countdown overlay */}
        {gamePhase === "countdown" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,26,46,0.75)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-game)",
                fontSize: "clamp(5rem, 20vw, 8rem)",
                color: "#F5A623",
                textShadow: "0 6px 0 #C47A10",
              }}
            >
              {countdown > 0 ? countdown : "GO!"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-game)",
                fontSize: "clamp(1rem, 3vw, 1.4rem)",
                color: "rgba(255,255,255,0.8)",
                marginTop: 16,
                textAlign: "center",
                padding: "0 20px",
              }}
            >
              move left and right to collect the correct answer!
            </div>
          </div>
        )}

        {/* Hint overlay */}
        {showHint && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,26,46,0.92)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "24px 20px",
            }}
          >
            {/* Fun fact */}
            <div
              style={{
                background: "rgba(123,111,232,0.2)",
                border: "2px solid #7B6FE8",
                borderRadius: 20,
                padding: "16px 20px",
                marginBottom: 16,
                maxWidth: 480,
                width: "100%",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-game)", fontSize: 14, color: "#A89FF5", marginBottom: 8 }}>
                did you know?
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "white", lineHeight: 1.6 }}>
                {HINT_FACTS[hintIndex].fact}
              </div>
            </div>

            {/* Actual hint */}
            <div
              style={{
                background: "rgba(93,190,74,0.15)",
                border: "2px solid #5DBE4A",
                borderRadius: 20,
                padding: "14px 20px",
                marginBottom: 24,
                maxWidth: 480,
                width: "100%",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-game)", fontSize: 14, color: "#5DBE4A", marginBottom: 6 }}>
                hint for {equation.question}
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "white", lineHeight: 1.6 }}>
                {HINT_FACTS[hintIndex].hint}
              </div>
            </div>

            <button
              onClick={() => {
              setShowHint(false);
              // Resume the game loop when hint is closed
              lastTimeRef.current = performance.now();
             animFrameRef.current = requestAnimationFrame(gameLoop);
             }}
              style={{
                background: "linear-gradient(to bottom, #FFD700, #F5A623)",
                border: "none",
                borderRadius: 99,
                padding: "12px 36px",
                fontFamily: "var(--font-game)",
                fontSize: 16,
                color: "white",
                cursor: "pointer",
                boxShadow: "0 4px 0 #C47A10",
              }}
            >
              got it — back to game!
            </button>
          </div>
        )}
      </div>

      {/* ── CONTROLS ── */}
      <div
        style={{
          display: "flex",
          height: 72,
          background: "rgba(26,26,46,0.9)",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Left button */}
        <button
          onPointerDown={moveLeft}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseUp={e => { e.currentTarget.style.background = "transparent"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="24,4 8,16 24,28" fill="rgba(255,255,255,0.7)" />
          </svg>
        </button>

        {/* Hint button — center */}
        <button
          onClick={handleHint}
          style={{
            width: 88,
            background: "rgba(123,111,232,0.15)",
            border: "none",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            transition: "background 0.15s",
          }}
          onMouseDown={e => { e.currentTarget.style.background = "rgba(123,111,232,0.3)"; }}
          onMouseUp={e => { e.currentTarget.style.background = "rgba(123,111,232,0.15)"; }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #9B7FE8, #7B6FE8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-game)",
              fontSize: 18,
              color: "white",
              boxShadow: "0 3px 0 #5A40B0",
            }}
          >
            ?
          </div>
          <span style={{ fontFamily: "var(--font-game)", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            hint
          </span>
        </button>

        {/* Right button */}
        <button
          onPointerDown={moveRight}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseUp={e => { e.currentTarget.style.background = "transparent"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="8,4 24,16 8,28" fill="rgba(255,255,255,0.7)" />
          </svg>
        </button>
      </div>

      {/* ── BOTTOM BAR — quit only ── */}
      <div
        style={{
          background: "rgba(26,26,46,0.95)",
          padding: "6px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <button
          onClick={() => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            router.push("/home");
          }}
          style={{
            background: "rgba(232,84,84,0.15)",
            border: "1.5px solid #E85454",
            borderRadius: 99,
            padding: "6px 28px",
            fontFamily: "var(--font-game)",
            fontSize: 13,
            color: "#E85454",
            cursor: "pointer",
          }}
        >
          quit
        </button>
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(1.3); }
        }
      `}</style>
    </main>
  );
}

// ============================================
// SVG COMPONENTS
// ============================================

function CoinSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" rx="11" ry="11" fill="#F5C842" stroke="#C49A1A" strokeWidth="1.5"/>
      <ellipse cx="12" cy="12" rx="8"  ry="8"  fill="#FFE066" stroke="#C49A1A" strokeWidth="1"/>
      <ellipse cx="10" cy="10" rx="3"  ry="3"  fill="#FFE899" opacity="0.7"/>
    </svg>
  );
}

function GemSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polygon points="12,2 22,8 22,16 12,22 2,16 2,8"
        fill="#9B7FE8" stroke="#6A4FC4" strokeWidth="1.5"/>
      <polygon points="12,2 22,8 12,10 2,8"
        fill="#C4AEFF" stroke="#6A4FC4" strokeWidth="1"/>
      <polygon points="12,10 22,8 22,16 12,22"
        fill="#7B5FD8" stroke="#6A4FC4" strokeWidth="1"/>
      <polygon points="12,10 2,8 2,16 12,22"
        fill="#8B6FE8" stroke="#6A4FC4" strokeWidth="1"/>
      <ellipse cx="10" cy="7" rx="2" ry="1.5"
        fill="white" opacity="0.4" transform="rotate(-20 10 7)"/>
    </svg>
  );
}

function AvatarSVG() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" width="64" height="80">
      <ellipse cx="32" cy="16" rx="16" ry="9"  fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <ellipse cx="32" cy="24" rx="15" ry="16" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <ellipse cx="25" cy="22" rx="4.5" ry="5" fill="white"   stroke="#2A1A00" strokeWidth="1"/>
      <ellipse cx="39" cy="22" rx="4.5" ry="5" fill="white"   stroke="#2A1A00" strokeWidth="1"/>
      <ellipse cx="25.5" cy="22.5" rx="2.8" ry="3.2" fill="#1A0A00"/>
      <ellipse cx="39.5" cy="22.5" rx="2.8" ry="3.2" fill="#1A0A00"/>
      <ellipse cx="26.5" cy="21"   rx="1.1" ry="1.4" fill="white"/>
      <ellipse cx="40.5" cy="21"   rx="1.1" ry="1.4" fill="white"/>
      <path d="M25 31 Q32 37 39 31" stroke="#9A6020" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <rect x="16" y="40" width="32" height="28" rx="10" fill="#FF6B9D" stroke="#CC4477" strokeWidth="1.5"/>
      <rect x="6"  y="41" width="12" height="22" rx="6"  fill="#FF6B9D" stroke="#CC4477" strokeWidth="1.5"/>
      <rect x="46" y="41" width="12" height="22" rx="6"  fill="#FF6B9D" stroke="#CC4477" strokeWidth="1.5"/>
      <ellipse cx="12"  cy="64" rx="7" ry="6" fill="#C68642" stroke="#9A6020" strokeWidth="1"/>
      <ellipse cx="52"  cy="64" rx="7" ry="6" fill="#C68642" stroke="#9A6020" strokeWidth="1"/>
      <rect x="19" y="67" width="11" height="12" rx="4" fill="#4A90D9" stroke="#2A6AB0" strokeWidth="1.5"/>
      <rect x="34" y="67" width="11" height="12" rx="4" fill="#4A90D9" stroke="#2A6AB0" strokeWidth="1.5"/>
    </svg>
  );
}

function Cloud({ size }: { size: "sm" | "md" | "lg" }) {
  const d = {
    sm: { width: 80,  height: 40, b: 30 },
    md: { width: 120, height: 55, b: 45 },
    lg: { width: 160, height: 70, b: 58 },
  }[size];
  return (
    <div style={{ position: "relative", width: d.width, height: d.height }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "60%", background: "white", borderRadius: 999 }} />
      <div style={{ position: "absolute", bottom: "30%", left: "10%", width: d.b * 0.8, height: d.b * 0.8, background: "white", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "30%", left: "30%", width: d.b,        height: d.b,        background: "white", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "30%", right: "15%", width: d.b * 0.75, height: d.b * 0.75, background: "white", borderRadius: "50%" }} />
    </div>
  );
}

function Bush() {
  return (
    <div style={{ position: "relative", width: 44, height: 30 }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 44, height: 22, background: "#3D9E2A", borderRadius: "50% 50% 0 0" }} />
      <div style={{ position: "absolute", bottom: 7,  left: "18%", width: 26, height: 26, background: "#4DAF35", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: 9,  right: "14%", width: 22, height: 22, background: "#5DBE4A", borderRadius: "50%" }} />
    </div>
  );
}