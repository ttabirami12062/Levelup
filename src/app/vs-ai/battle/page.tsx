"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/lib/gameContext";
import { Suspense } from "react";

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
}

function generateEquation(level: number): Equation {
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  if (level <= 3) {
    const a = rand(1, level * 4 + 2);
    const b = rand(1, level * 4 + 2);
    return { question: `${a} + ${b} = ?`, answer: a + b };
  }
  if (level <= 6) {
    const a = rand(10, level * 5);
    const b = rand(1, a);
    return { question: `${a} − ${b} = ?`, answer: a - b };
  }
  const a = rand(2, 12);
  const b = rand(2, 12);
  return { question: `${a} × ${b} = ?`, answer: a * b };
}

function generateDecoys(answer: number, count: number): number[] {
  const decoys = new Set<number>();
  const offsets = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  let attempts = 0;
  while (decoys.size < count && attempts < 40) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const decoy = Math.max(0, answer + offset);
    if (decoy !== answer) decoys.add(decoy);
    attempts++;
  }
  return Array.from(decoys);
}

const LANE_COUNT    = 4;
const STONE_SIZE    = 64;
const STONE_SPEED   = 1.0;
const WIN_SCORE     = 5;
const AVATAR_BOTTOM = 150;

const HINT_FACTS = [
  { fact: "Zero was invented in ancient India around 500 AD!", hint: "Break the problem into smaller steps." },
  { fact: "The equals sign = was invented in 1557!", hint: "Try counting up from the smaller number." },
  { fact: "Multiplication is just fast addition!", hint: "Think of it as groups of numbers." },
  { fact: "Ancient Egyptians used math to build pyramids!", hint: "Work backwards from the answer choices." },
];

function BattleScreen() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { addCoins, addGems, updateStreak } = useGame();

  const difficulty = searchParams.get("difficulty") || "medium";
  const zetaSpeed  = Number(searchParams.get("zetaSpeed")) || 5000;
  const reward     = Number(searchParams.get("reward")) || 3;

  const [equation, setEquation]         = useState<Equation>({ question: "Get ready!", answer: 0 });
  const [stones, setStones]             = useState<Stone[]>([]);
  const [avatarLane, setAvatarLane]     = useState(1);
  const [zetaLane, setZetaLane]         = useState(2);
  const [playerScore, setPlayerScore]   = useState(0);
  const [zetaScore, setZetaScore]       = useState(0);
  const [gamePhase, setGamePhase]       = useState<"countdown" | "playing" | "finished">("countdown");
  const [countdown, setCountdown]       = useState(3);
  const [timerWidth, setTimerWidth]     = useState(100);
  const [showHint, setShowHint]         = useState(false);
  const [hintIndex, setHintIndex]       = useState(0);
  const [zetaReaction, setZetaReaction] = useState<"normal" | "winning" | "losing" | "correct">("normal");
  const [rewardPops, setRewardPops]     = useState<{ id: number; text: string; x: number; isZeta: boolean }[]>([]);
  const [winner, setWinner]             = useState<"player" | "zeta" | null>(null);
  const [level, setLevel]               = useState(1);

  const stonesRef      = useRef<Stone[]>([]);
  const equationRef    = useRef<Equation>(equation);
  const avatarLaneRef  = useRef(avatarLane);
  const gamePhaseRef   = useRef(gamePhase);
  const stoneIdRef     = useRef(0);
  const lastTimeRef    = useRef(0);
  const animFrameRef   = useRef<number>(0);
  const timerRef       = useRef(100);
  const playerScoreRef = useRef(0);
  const zetaScoreRef   = useRef(0);
  const zetaTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelRef       = useRef(1);
  const worldHRef      = useRef(0);
  // Tracks stones already handled so the same stone can't be counted twice.
  const processedRef   = useRef<Set<number>>(new Set());

  useEffect(() => { equationRef.current   = equation;  }, [equation]);
  useEffect(() => { avatarLaneRef.current = avatarLane; }, [avatarLane]);
  useEffect(() => { gamePhaseRef.current  = gamePhase; }, [gamePhase]);
  useEffect(() => { stonesRef.current     = stones;    }, [stones]);

  useEffect(() => {
    const measure = () => {
      const el = document.getElementById("battleWorld");
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

  const checkWin = useCallback((pScore: number, zScore: number) => {
    if (pScore >= WIN_SCORE) {
      setWinner("player");
      setGamePhase("finished");
      gamePhaseRef.current = "finished";
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (zetaTimerRef.current) clearTimeout(zetaTimerRef.current);
      addCoins(reward);
      addGems(difficulty === "hard" ? 1 : 0);
    } else if (zScore >= WIN_SCORE) {
      setWinner("zeta");
      setGamePhase("finished");
      gamePhaseRef.current = "finished";
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (zetaTimerRef.current) clearTimeout(zetaTimerRef.current);
    }
  }, [addCoins, addGems, reward, difficulty]);

  const spawnWave = useCallback(() => {
    const eq     = equationRef.current;
    const decoys = generateDecoys(eq.answer, 3);
    const lanes  = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    const answerLane = lanes[Math.floor(Math.random() * lanes.length)];

    const newStones: Stone[] = lanes.map((lane, index) => ({
      id:        stoneIdRef.current++,
      lane,
      y:         -STONE_SIZE - 20,
      value:     lane === answerLane ? eq.answer : decoys[index < decoys.length ? index : 0],
      isAnswer:  lane === answerLane,
      collected: false,
      status:    "normal" as const,
    }));

    setStones(prev => [...prev, ...newStones]);
    stonesRef.current = [...stonesRef.current, ...newStones];
  }, []);

  // ── SCHEDULE ZETA ──
  // Zeta visually moves to the answer stone lane and collects it
  const scheduleZeta = useCallback(() => {
    if (gamePhaseRef.current !== "playing") return;
    zetaTimerRef.current = setTimeout(() => {
      if (gamePhaseRef.current !== "playing") return;

      // Find the answer stone currently on screen
      const answerStone = stonesRef.current.find(s => s.isAnswer && !s.collected);

      if (answerStone) {
        // Move Zeta visually to the answer stone lane
        setZetaLane(answerStone.lane);

        // Short delay then Zeta collects it
        setTimeout(() => {
          if (gamePhaseRef.current !== "playing") return;

          zetaScoreRef.current++;
          setZetaScore(zetaScoreRef.current);
          setZetaReaction("correct");

          // Mark Zeta's stone correct and freeze the rest of the wave so the
          // player can't hit a stone during Zeta's reset window.
          setStones(prev => prev.map(s =>
            s.id === answerStone.id
              ? { ...s, status: "correct" as const, collected: true }
              : { ...s, collected: true }
          ));
          stonesRef.current = stonesRef.current.map(s =>
            s.id === answerStone.id
              ? { ...s, status: "correct" as const, collected: true }
              : { ...s, collected: true }
          );
          stonesRef.current.forEach(s => processedRef.current.add(s.id));

          // Zeta reaction after collecting
          setTimeout(() => {
            const zScore = zetaScoreRef.current;
            const pScore = playerScoreRef.current;
            setZetaReaction(zScore > pScore ? "winning" : "losing");
          }, 500);

          // Pop animation
          const popId = Date.now();
          setRewardPops(prev => [...prev, {
            id: popId,
            text: "Zeta got it!",
            x: getLaneX(answerStone.lane),
            isZeta: true,
          }]);
          setTimeout(() => setRewardPops(prev => prev.filter(p => p.id !== popId)), 800);

          checkWin(playerScoreRef.current, zetaScoreRef.current);

          // Clear stones and load next equation after Zeta collects
          setTimeout(() => {
            if (gamePhaseRef.current !== "playing") return;
            const newEq = generateEquation(levelRef.current);
            equationRef.current = newEq;
            setEquation(newEq);
            timerRef.current = 100;
            setTimerWidth(100);
            setStones([]);
            stonesRef.current = [];
            processedRef.current.clear();
          }, 450);

          if (gamePhaseRef.current === "playing") scheduleZeta();
        }, 500);

      } else {
        // No answer stone on screen yet — try again shortly
        if (gamePhaseRef.current === "playing") scheduleZeta();
      }
    }, zetaSpeed + (Math.random() * 800 - 400));
  }, [zetaSpeed, checkWin, getLaneX]);

  const handleCollect = useCallback((stone: Stone) => {
    // Guard: never process the same stone twice (fixes double-count).
    if (processedRef.current.has(stone.id)) return;
    processedRef.current.add(stone.id);

    if (stone.value !== equationRef.current.answer) {
      setStones(prev => prev.map(s =>
        s.id === stone.id ? { ...s, status: "wrong" as const, collected: true } : s
      ));
      stonesRef.current = stonesRef.current.map(s =>
        s.id === stone.id ? { ...s, status: "wrong" as const, collected: true } : s
      );
      setTimeout(() => {
        setStones(prev => prev.filter(s => s.id !== stone.id));
        stonesRef.current = stonesRef.current.filter(s => s.id !== stone.id);
      }, 350);
      return;
    }

    playerScoreRef.current++;
    setPlayerScore(playerScoreRef.current);
    setZetaReaction(playerScoreRef.current > zetaScoreRef.current ? "losing" : "winning");

    const popId = Date.now();
    setRewardPops(prev => [...prev, {
      id: popId,
      text: "+1 you!",
      x: getLaneX(stone.lane),
      isZeta: false,
    }]);
    setTimeout(() => setRewardPops(prev => prev.filter(p => p.id !== popId)), 800);

    // Mark the chosen stone correct and freeze the rest of the wave so the
    // avatar can't trigger a wrong hit during the 450ms reset window.
    setStones(prev => prev.map(s =>
      s.id === stone.id
        ? { ...s, status: "correct" as const, collected: true }
        : { ...s, collected: true }
    ));
    stonesRef.current = stonesRef.current.map(s =>
      s.id === stone.id
        ? { ...s, status: "correct" as const, collected: true }
        : { ...s, collected: true }
    );
    stonesRef.current.forEach(s => processedRef.current.add(s.id));

    if (playerScoreRef.current % 3 === 0) {
      levelRef.current = Math.min(levelRef.current + 1, 10);
      setLevel(levelRef.current);
    }

    setTimeout(() => {
      const newEq = generateEquation(levelRef.current);
      equationRef.current = newEq;
      setEquation(newEq);
      timerRef.current = 100;
      setTimerWidth(100);
      setStones([]);
      stonesRef.current = [];
      processedRef.current.clear();
    }, 450);

    checkWin(playerScoreRef.current, zetaScoreRef.current);
  }, [getLaneX, checkWin]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gamePhaseRef.current !== "playing") return;

    const delta = Math.min(timestamp - lastTimeRef.current, 50);
    lastTimeRef.current = timestamp;

    const worldH    = worldHRef.current || window.innerHeight * 0.6;
    const avatarTop = worldH - AVATAR_BOTTOM - 70;
    const avatarBot = worldH - AVATAR_BOTTOM;

    const activeStones = stonesRef.current.filter(s => !s.collected && s.y < worldH);
    if (activeStones.length === 0) spawnWave();

    setStones(prev => {
      const updated = prev.map(stone => {
        if (stone.collected) return stone;
        const newY = stone.y + STONE_SPEED;
        const stoneCenterY  = newY + STONE_SIZE / 2;
        const avatarCenterY = (avatarTop + avatarBot) / 2;
        const vertHit  = Math.abs(stoneCenterY - avatarCenterY) < 30;
        const horizHit = stone.lane === avatarLaneRef.current;
        if (vertHit && horizHit && !stone.collected && !processedRef.current.has(stone.id)) {
          setTimeout(() => handleCollect({ ...stone, y: newY }), 0);
          return { ...stone, y: newY, collected: true };
        }
        return { ...stone, y: newY };
      }).filter(s => s.y < worldH + 20);
      stonesRef.current = updated;
      return updated;
    });

    timerRef.current = Math.max(0, timerRef.current - (delta / 200));
    setTimerWidth(timerRef.current);

    if (timerRef.current <= 0) {
      timerRef.current = 100;
      setTimerWidth(100);
      const newEq = generateEquation(levelRef.current);
      equationRef.current = newEq;
      setEquation(newEq);
      setStones([]);
      stonesRef.current = [];
      processedRef.current.clear();
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [spawnWave, handleCollect]);

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
      scheduleZeta();
      // Update streak when kid starts playing
      updateStreak();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, gamePhase, gameLoop, scheduleZeta]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (zetaTimerRef.current) clearTimeout(zetaTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gamePhaseRef.current !== "playing") return;
      if (e.key === "ArrowLeft")  setAvatarLane(l => { const n = Math.max(0, l - 1); avatarLaneRef.current = n; return n; });
      if (e.key === "ArrowRight") setAvatarLane(l => { const n = Math.min(3, l + 1); avatarLaneRef.current = n; return n; });
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
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setShowHint(true);
    setHintIndex(Math.floor(Math.random() * HINT_FACTS.length));
  };

  const closeHint = () => {
    setShowHint(false);
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(gameLoop);
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

  const zetaSmile = zetaReaction === "winning" || zetaReaction === "correct"
    ? "M22 36 Q28 43 34 36"
    : "M24 38 Q28 34 32 38";

  return (
    <main
      className="w-full h-screen overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #5BB8F5 0%, #C9EEFF 55%, #6AC94F 55%, #4DAF35 60%, #C8874A 60%, #A0612A 100%)",
      }}
    >
      <div className="absolute top-[3%] left-[3%] opacity-70 pointer-events-none z-10"><Cloud size="md" /></div>
      <div className="absolute top-[5%] right-[4%] opacity-60 pointer-events-none z-10"><Cloud size="sm" /></div>

      {/* TOP BAR */}
      <div style={{ background: "rgba(26,26,46,0.9)", padding: "10px 16px 8px", zIndex: 20, flexShrink: 0 }}>
        <div style={{ background: "#333", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${timerWidth}%`, height: "100%", borderRadius: 99, background: timerColor, transition: "background 0.5s" }} />
        </div>
        <div style={{ fontFamily: "var(--font-game)", fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)", color: "#F5A623", textAlign: "center", marginBottom: 8 }}>
          {equation.question}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 600, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-game)", fontSize: 11, color: "#A89FF5", width: 28 }}>You</span>
            <div style={{ flex: 1, background: "#333", borderRadius: 99, height: 12, overflow: "hidden" }}>
              <div style={{ width: `${(playerScore / WIN_SCORE) * 100}%`, height: "100%", background: "linear-gradient(to right, #7B6FE8, #A89FF5)", borderRadius: 99, transition: "width 0.3s ease" }} />
            </div>
            <span style={{ fontFamily: "var(--font-game)", fontSize: 11, color: "#A89FF5", width: 32, textAlign: "right" }}>{playerScore}/{WIN_SCORE}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-game)", fontSize: 11, color: "#FFD700", width: 28 }}>Zeta</span>
            <div style={{ flex: 1, background: "#333", borderRadius: 99, height: 12, overflow: "hidden" }}>
              <div style={{ width: `${(zetaScore / WIN_SCORE) * 100}%`, height: "100%", background: "linear-gradient(to right, #FFD700, #F5A623)", borderRadius: 99, transition: "width 0.3s ease" }} />
            </div>
            <span style={{ fontFamily: "var(--font-game)", fontSize: 11, color: "#FFD700", width: 32, textAlign: "right" }}>{zetaScore}/{WIN_SCORE}</span>
          </div>
        </div>
      </div>

      {/* BATTLE WORLD */}
      <div
        id="battleWorld"
        style={{ position: "relative", flex: 1, overflow: "hidden" }}
        onTouchStart={(e) => {
          const x = e.touches[0].clientX;
          if (x < window.innerWidth / 2) moveLeft(); else moveRight();
        }}
      >
        <div className="absolute w-full flex justify-around pointer-events-none" style={{ bottom: 8, zIndex: 4 }}>
          <Bush /><Bush /><Bush /><Bush /><Bush /><Bush /><Bush /><Bush />
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
                boxShadow: `0 6px 0 ${s.border}`,
                zIndex: 5,
                transition: "background 0.15s",
              }}
            >
              {stone.value}
            </div>
          );
        })}

        {/* Reward pops */}
        {rewardPops.map(pop => (
          <div
            key={pop.id}
            style={{
              position: "absolute",
              left: pop.x,
              top: "40%",
              fontFamily: "var(--font-game)",
              fontSize: 16,
              color: pop.isZeta ? "#FFD700" : "#5DBE4A",
              pointerEvents: "none",
              zIndex: 30,
              animation: "floatUp 0.8s ease forwards",
              whiteSpace: "nowrap",
            }}
          >
            {pop.text}
          </div>
        ))}

        {/* Player avatar */}
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
          <div style={{ background: "#7B6FE8", borderRadius: 6, padding: "2px 6px", textAlign: "center", marginTop: 2 }}>
            <span style={{ fontFamily: "var(--font-game)", fontSize: 9, color: "white" }}>You</span>
          </div>
        </div>

        {/* Zeta avatar — now moves between lanes */}
        <div
          style={{
            position: "absolute",
            bottom: AVATAR_BOTTOM,
            left: getLaneX(zetaLane),
            width: STONE_SIZE,
            zIndex: 10,
            transition: "left 0.4s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.3s ease",
            transform: zetaReaction === "correct" ? "scale(1.2)" : "scale(1)",
          }}
        >
          <svg width="64" height="72" viewBox="0 0 60 68">
            <polygon points="30,4 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/>
            <polygon points="22,16 26,10 30,14 34,10 38,16" fill="#FF6B35" stroke="#C03010" strokeWidth="1.5"/>
            <ellipse cx="23" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
            <ellipse cx="37" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
            <ellipse cx="23.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
            <ellipse cx="37.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
            <ellipse cx="24.5" cy="27" rx="1" ry="1.2" fill="white"/>
            <ellipse cx="38.5" cy="27" rx="1" ry="1.2" fill="white"/>
            <path d={zetaSmile} stroke="#C49A00" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <rect x="22" y="52" width="7" height="10" rx="3" fill="#C49A00" stroke="#9A7000" strokeWidth="1"/>
            <rect x="31" y="52" width="7" height="10" rx="3" fill="#C49A00" stroke="#9A7000" strokeWidth="1"/>
          </svg>
          <div style={{ background: "#FFD700", borderRadius: 6, padding: "2px 6px", textAlign: "center", marginTop: 2 }}>
            <span style={{ fontFamily: "var(--font-game)", fontSize: 9, color: "#8B6000" }}>Zeta</span>
          </div>
        </div>

        {/* Countdown overlay */}
        {gamePhase === "countdown" && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div style={{ fontFamily: "var(--font-game)", fontSize: "clamp(4rem, 18vw, 7rem)", color: "#F5A623", textShadow: "0 6px 0 #C47A10" }}>
              {countdown > 0 ? countdown : "GO!"}
            </div>
            <div style={{ fontFamily: "var(--font-game)", fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)", color: "rgba(255,255,255,0.8)", marginTop: 12, textAlign: "center", padding: "0 20px" }}>
              first to {WIN_SCORE} correct answers wins!
            </div>
          </div>
        )}

        {/* Hint overlay */}
        {showHint && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "24px 20px" }}>
            <div style={{ background: "rgba(123,111,232,0.2)", border: "2px solid #7B6FE8", borderRadius: 20, padding: "16px 20px", marginBottom: 16, maxWidth: 480, width: "100%", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-game)", fontSize: 13, color: "#A89FF5", marginBottom: 8 }}>did you know?</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "white", lineHeight: 1.6 }}>{HINT_FACTS[hintIndex].fact}</div>
            </div>
            <div style={{ background: "rgba(93,190,74,0.15)", border: "2px solid #5DBE4A", borderRadius: 20, padding: "14px 20px", marginBottom: 24, maxWidth: 480, width: "100%", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-game)", fontSize: 13, color: "#5DBE4A", marginBottom: 6 }}>hint for {equation.question}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "white", lineHeight: 1.6 }}>{HINT_FACTS[hintIndex].hint}</div>
            </div>
            <button onClick={closeHint} style={{ background: "linear-gradient(to bottom, #FFD700, #F5A623)", border: "none", borderRadius: 99, padding: "12px 36px", fontFamily: "var(--font-game)", fontSize: 15, color: "white", cursor: "pointer", boxShadow: "0 4px 0 #C47A10" }}>
              got it — back to battle!
            </button>
          </div>
        )}

        {/* Result overlay */}
        {gamePhase === "finished" && winner && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 28, padding: "24px 20px", width: "90%", maxWidth: 360, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "inline-block", background: winner === "player" ? "linear-gradient(to bottom, #FFD700, #F5A623)" : "#E85454", borderRadius: 99, padding: "4px 20px", marginBottom: 12, boxShadow: winner === "player" ? "0 3px 0 #C47A10" : "0 3px 0 #A02020" }}>
                <span style={{ fontFamily: "var(--font-game)", fontSize: 13, color: "white" }}>
                  {winner === "player" ? "you won!" : "zeta wins!"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginBottom: 16 }}>
                <div style={{ textAlign: "center", opacity: winner === "player" ? 1 : 0.6 }}>
                  <AvatarSVG />
                  <div style={{ fontFamily: "var(--font-game)", fontSize: 14, color: "#7B6FE8", marginTop: 4 }}>You {playerScore}</div>
                </div>
                <div style={{ fontFamily: "var(--font-game)", fontSize: 16, color: "#9898B8" }}>vs</div>
                <div style={{ textAlign: "center", opacity: winner === "zeta" ? 1 : 0.6 }}>
                  <ZetaSVG size={60} />
                  <div style={{ fontFamily: "var(--font-game)", fontSize: 14, color: "#F5A623", marginTop: 4 }}>Zeta {zetaScore}</div>
                </div>
              </div>
              {winner === "player" && (
                <div style={{ background: "#FFF8E6", borderRadius: 14, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "#9898B8", marginBottom: 6 }}>rewards earned</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <CoinSVG size={16} />
                      <span style={{ fontFamily: "var(--font-game)", fontSize: 15, color: "#C47A10" }}>+{reward} coins</span>
                    </div>
                    {difficulty === "hard" && (
                      <>
                        <div style={{ width: 1, height: 16, background: "#E0E0E0" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <GemSVG size={14} />
                          <span style={{ fontFamily: "var(--font-game)", fontSize: 15, color: "#7B6FE8" }}>+1 gem</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "#5A5A7A", marginBottom: 16, fontStyle: "italic" }}>
                {winner === "player"
                  ? "Zeta: \"You got lucky this time...!\""
                  : "Zeta: \"Better luck next time, try again!\""}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={() => {
                    window.location.href = `/vs-ai/battle?difficulty=${difficulty}&zetaSpeed=${zetaSpeed}&reward=${reward}`;
                  }}
                  style={{ background: "linear-gradient(to bottom, #FFD700, #F5A623)", border: "none", borderRadius: 99, padding: "12px", fontFamily: "var(--font-game)", fontSize: 15, color: "white", cursor: "pointer", boxShadow: "0 4px 0 #C47A10" }}
                >
                  rematch Zeta
                </button>
                <button
                  onClick={() => router.push("/home")}
                  style={{ background: "#F0F0F8", border: "none", borderRadius: 99, padding: "11px", fontFamily: "var(--font-game)", fontSize: 14, color: "#7B6FE8", cursor: "pointer" }}
                >
                  back to home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div style={{ display: "flex", height: 72, background: "rgba(26,26,46,0.9)", flexShrink: 0, zIndex: 20 }}>
        <button
          onPointerDown={moveLeft}
          style={{ flex: 1, background: "transparent", border: "none", borderRight: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseDown={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseUp={e => { e.currentTarget.style.background = "transparent"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32"><polygon points="24,4 8,16 24,28" fill="rgba(255,255,255,0.7)" /></svg>
        </button>
        <button
          onClick={handleHint}
          style={{ width: 88, background: "rgba(123,111,232,0.15)", border: "none", borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#9B7FE8,#7B6FE8)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-game)", fontSize: 18, color: "white", boxShadow: "0 3px 0 #5A40B0" }}>?</div>
          <span style={{ fontFamily: "var(--font-game)", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>hint</span>
        </button>
        <button
          onPointerDown={moveRight}
          style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseDown={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseUp={e => { e.currentTarget.style.background = "transparent"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32"><polygon points="8,4 24,16 8,28" fill="rgba(255,255,255,0.7)" /></svg>
        </button>
      </div>

      <div style={{ background: "rgba(26,26,46,0.95)", padding: "6px 20px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, zIndex: 20 }}>
        <button
          onClick={() => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (zetaTimerRef.current) clearTimeout(zetaTimerRef.current);
            router.push("/home");
          }}
          style={{ background: "rgba(232,84,84,0.15)", border: "1.5px solid #E85454", borderRadius: 99, padding: "6px 28px", fontFamily: "var(--font-game)", fontSize: 13, color: "#E85454", cursor: "pointer" }}
        >
          quit
        </button>
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.2); }
        }
      `}</style>
    </main>
  );
}

function AvatarSVG() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" width="64" height="80">
      <ellipse cx="32" cy="16" rx="16" ry="9" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <ellipse cx="32" cy="24" rx="15" ry="16" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <ellipse cx="25" cy="22" rx="4.5" ry="5" fill="white" stroke="#2A1A00" strokeWidth="1"/>
      <ellipse cx="39" cy="22" rx="4.5" ry="5" fill="white" stroke="#2A1A00" strokeWidth="1"/>
      <ellipse cx="25.5" cy="22.5" rx="2.8" ry="3.2" fill="#1A0A00"/>
      <ellipse cx="39.5" cy="22.5" rx="2.8" ry="3.2" fill="#1A0A00"/>
      <ellipse cx="26.5" cy="21" rx="1.1" ry="1.4" fill="white"/>
      <ellipse cx="40.5" cy="21" rx="1.1" ry="1.4" fill="white"/>
      <path d="M25 31 Q32 37 39 31" stroke="#9A6020" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <rect x="16" y="40" width="32" height="28" rx="10" fill="#FF6B9D" stroke="#CC4477" strokeWidth="1.5"/>
      <rect x="6" y="41" width="12" height="22" rx="6" fill="#FF6B9D" stroke="#CC4477" strokeWidth="1.5"/>
      <rect x="46" y="41" width="12" height="22" rx="6" fill="#FF6B9D" stroke="#CC4477" strokeWidth="1.5"/>
      <ellipse cx="12" cy="64" rx="7" ry="6" fill="#C68642" stroke="#9A6020" strokeWidth="1"/>
      <ellipse cx="52" cy="64" rx="7" ry="6" fill="#C68642" stroke="#9A6020" strokeWidth="1"/>
      <rect x="19" y="67" width="11" height="12" rx="4" fill="#4A90D9" stroke="#2A6AB0" strokeWidth="1.5"/>
      <rect x="34" y="67" width="11" height="12" rx="4" fill="#4A90D9" stroke="#2A6AB0" strokeWidth="1.5"/>
    </svg>
  );
}

function ZetaSVG({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <polygon points="30,4 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22" fill="#FFD700" stroke="#C49A00" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="22,16 26,10 30,14 34,10 38,16" fill="#FF6B35" stroke="#C03010" strokeWidth="1.5"/>
      <ellipse cx="24" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
      <ellipse cx="36" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
      <ellipse cx="24.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="36.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="25.5" cy="27" rx="1" ry="1.2" fill="white"/>
      <ellipse cx="37.5" cy="27" rx="1" ry="1.2" fill="white"/>
      <path d="M24 35 Q30 41 36 35" stroke="#C49A00" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function CoinSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" rx="11" ry="11" fill="#F5C842" stroke="#C49A1A" strokeWidth="1.5"/>
      <ellipse cx="12" cy="12" rx="8" ry="8" fill="#FFE066" stroke="#C49A1A" strokeWidth="1"/>
      <ellipse cx="10" cy="10" rx="3" ry="3" fill="#FFE899" opacity="0.7"/>
    </svg>
  );
}

function GemSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="#9B7FE8" stroke="#6A4FC4" strokeWidth="1.5"/>
      <polygon points="12,2 22,8 12,10 2,8" fill="#C4AEFF" stroke="#6A4FC4" strokeWidth="1"/>
      <polygon points="12,10 22,8 22,16 12,22" fill="#7B5FD8" stroke="#6A4FC4" strokeWidth="1"/>
      <polygon points="12,10 2,8 2,16 12,22" fill="#8B6FE8" stroke="#6A4FC4" strokeWidth="1"/>
    </svg>
  );
}

function Cloud({ size }: { size: "sm" | "md" | "lg" }) {
  const d = { sm: { width: 80, height: 40, b: 30 }, md: { width: 120, height: 55, b: 45 }, lg: { width: 160, height: 70, b: 58 } }[size];
  return (
    <div style={{ position: "relative", width: d.width, height: d.height }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "60%", background: "white", borderRadius: 999 }} />
      <div style={{ position: "absolute", bottom: "30%", left: "10%", width: d.b * 0.8, height: d.b * 0.8, background: "white", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "30%", left: "30%", width: d.b, height: d.b, background: "white", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "30%", right: "15%", width: d.b * 0.75, height: d.b * 0.75, background: "white", borderRadius: "50%" }} />
    </div>
  );
}

function Bush() {
  return (
    <div style={{ position: "relative", width: 44, height: 30 }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 44, height: 22, background: "#3D9E2A", borderRadius: "50% 50% 0 0" }} />
      <div style={{ position: "absolute", bottom: 7, left: "18%", width: 26, height: 26, background: "#4DAF35", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: 9, right: "14%", width: 22, height: 22, background: "#5DBE4A", borderRadius: "50%" }} />
    </div>
  );
}

export default function VsAiBattle() {
  return (
    <Suspense fallback={
      <div style={{ width: "100%", height: "100vh", background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-game)", fontSize: 24, color: "#F5A623" }}>Loading...</span>
      </div>
    }>
      <BattleScreen />
    </Suspense>
  );
}