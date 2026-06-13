"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/gameContext";

const ROOMS = [
  { id: 1, name: "Bedroom",     unlocked: true  },
  { id: 2, name: "Living Room", unlocked: true  },
  { id: 3, name: "Garden",      unlocked: false },
  { id: 4, name: "Treehouse",   unlocked: false },
];

export default function Home() {
  const router = useRouter();
  const [name, setName]         = useState("Player");
  const [avatarId, setAvatarId] = useState(1);
  const { coins, gems, streak } = useGame();

  const avatarColors: Record<number, { bg: string; border: string }> = {
    1: { bg: "#FF6B9D", border: "#CC4477" },
    2: { bg: "#9B7FE8", border: "#6A4FC4" },
    3: { bg: "#FFD700", border: "#C9A800" },
    4: { bg: "#4CAF50", border: "#2E7D32" },
  };
  const avatar = avatarColors[avatarId] || avatarColors[1];

  useEffect(() => {
    const savedName   = localStorage.getItem("levelup_name");
    const savedAvatar = localStorage.getItem("levelup_avatar");
    if (savedName)   setName(savedName);
    if (savedAvatar) setAvatarId(Number(savedAvatar));
  }, []);

  return (
    <main
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #5BB8F5 0%, #C9EEFF 55%)" }}
    >
      {/* ── CLOUDS ── */}
      <div className="absolute top-[4%] left-[3%] opacity-80"><Cloud size="lg" /></div>
      <div className="absolute top-[8%] right-[5%] opacity-70"><Cloud size="md" /></div>
      <div className="absolute top-[3%] left-[45%] opacity-60"><Cloud size="sm" /></div>

      {/* ── MAIN CONTENT ── */}
      <div
        className="relative flex flex-col"
        style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px", zIndex: 10 }}
      >

        {/* ── TOP BAR ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>

          {/* Avatar and name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: "50%",
                background: avatar.bg, border: `3px solid ${avatar.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", overflow: "hidden",
              }}
            >
              <AvatarIcon id={avatarId} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-ui)" }}>
                welcome back
              </div>
              <div style={{ fontSize: 20, color: "#ffffff", fontFamily: "var(--font-game)", letterSpacing: "0.5px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {name}
              </div>
            </div>
          </div>

          {/* Coins and gems */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 999, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <CoinIcon size={18} />
              <span style={{ fontSize: 14, color: "#C47A10", fontFamily: "var(--font-game)" }}>{coins}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 999, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <GemIcon size={16} />
              <span style={{ fontSize: 14, color: "#6A4FC4", fontFamily: "var(--font-game)" }}>{gems}</span>
            </div>
          </div>
        </div>

        {/* ── STREAK CARD ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.95)", borderRadius: 20,
            padding: "14px 18px", display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FlameIcon />
            <div>
              <div style={{ fontSize: 11, color: "#5A5A7A", fontFamily: "var(--font-ui)" }}>daily streak</div>
              <div style={{ fontSize: 22, color: "#FF6B35", fontFamily: "var(--font-game)" }}>{streak} days</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#9898B8", fontFamily: "var(--font-ui)" }}>next reward</div>
            <div style={{ fontSize: 13, color: "#F5A623", fontFamily: "var(--font-game)" }}>at 20 days</div>
          </div>
        </div>

        {/* ── CHOOSE MODE LABEL ── */}
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-game)", marginBottom: 10, letterSpacing: "0.5px" }}>
          choose your mode
        </div>

        {/* ── SOLO MODE BUTTON ── */}
        <button
          onClick={() => router.push("/solo")}
          style={{
            background: "linear-gradient(135deg, #7B6FE8, #5A50C8)",
            borderRadius: 24, padding: "20px 20px", marginBottom: 12,
            border: "none", cursor: "pointer", position: "relative",
            overflow: "hidden", boxShadow: "0 6px 0 #3A30A8, 0 10px 24px rgba(90,80,200,0.4)",
            textAlign: "left", width: "100%", transition: "transform 150ms ease, box-shadow 150ms ease",
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = "0 3px 0 #3A30A8"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 0 #3A30A8, 0 10px 24px rgba(90,80,200,0.4)"; }}
        >
          {/* Background lightning bolt */}
          <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: 0.15 }}>
            <LightningIcon size={64} color="white" />
          </div>
          <div style={{ fontSize: 22, color: "#ffffff", fontFamily: "var(--font-game)", letterSpacing: "0.5px", marginBottom: 4 }}>
            Solo Mode
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-ui)", marginBottom: 12 }}>
            Run, collect answers and level up alone
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <LightningIcon size={14} color="white" />
            <span style={{ fontSize: 13, color: "#ffffff", fontFamily: "var(--font-game)" }}>Play Now</span>
          </div>
        </button>

        {/* ── VS AI MODE BUTTON ── */}
        <button
          onClick={() => router.push("/vs-ai")}
          style={{
            background: "linear-gradient(135deg, #E85454, #C03030)",
            borderRadius: 24, padding: "20px 20px", marginBottom: 20,
            border: "none", cursor: "pointer", position: "relative",
            overflow: "hidden", boxShadow: "0 6px 0 #A02020, 0 10px 24px rgba(200,48,48,0.4)",
            textAlign: "left", width: "100%", transition: "transform 150ms ease, box-shadow 150ms ease",
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = "0 3px 0 #A02020"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 0 #A02020, 0 10px 24px rgba(200,48,48,0.4)"; }}
        >
          {/* Background Zeta star character */}
          <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.2 }}>
            <ZetaIcon size={72} />
          </div>
          <div style={{ fontSize: 22, color: "#ffffff", fontFamily: "var(--font-game)", letterSpacing: "0.5px", marginBottom: 4 }}>
            VS AI Mode
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-ui)", marginBottom: 12 }}>
            Race against Zeta the star rival
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ZetaIcon size={16} />
            <span style={{ fontSize: 13, color: "#ffffff", fontFamily: "var(--font-game)" }}>Battle Now</span>
          </div>
        </button>

        {/* ── MY ROOMS ── */}
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-game)", marginBottom: 10, letterSpacing: "0.5px" }}>
          my rooms
        </div>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => room.unlocked && router.push(`/room?id=${room.id}`)}
              style={{
                background: room.unlocked ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.2)",
                borderRadius: 16, padding: "10px 14px", textAlign: "center",
                minWidth: 76, border: room.unlocked ? "2px solid rgba(255,255,255,0.8)" : "2px dashed rgba(255,255,255,0.3)",
                cursor: room.unlocked ? "pointer" : "not-allowed",
                opacity: room.unlocked ? 1 : 0.5,
                transition: "transform 150ms ease", flexShrink: 0,
              }}
              onMouseDown={(e) => { if (room.unlocked) e.currentTarget.style.transform = "scale(0.95)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>
                <RoomIcon id={room.id} unlocked={room.unlocked} />
              </div>
              <div style={{ fontSize: 9, color: room.unlocked ? "#1A1A2E" : "rgba(255,255,255,0.8)", fontFamily: "var(--font-game)", whiteSpace: "nowrap" }}>
                {room.name}
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* ── GROUND ── */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, width: "100%",
          background: "linear-gradient(to bottom, #6AC94F, #4DAF35 30%, #C8874A 30%, #A0612A)",
          height: 80, zIndex: 1,
        }}
      />
      <div className="absolute w-full flex justify-around" style={{ bottom: 72, zIndex: 2 }}>
        <Bush /><Bush /><Bush /><Bush /><Bush /><Bush />
      </div>

    </main>
  );
}

// ============================================
// SVG ICON COMPONENTS
// All illustrations — no emojis anywhere
// ============================================

// ── COIN ──
function CoinIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="11" ry="11" fill="#F5C842" stroke="#C49A1A" strokeWidth="1.5"/>
      <ellipse cx="12" cy="12" rx="8" ry="8" fill="#FFE066" stroke="#C49A1A" strokeWidth="1"/>
      <ellipse cx="10" cy="10" rx="3" ry="3" fill="#FFE899" opacity="0.7"/>
      <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#C47A10" fontFamily="serif">$</text>
    </svg>
  );
}

// ── GEM ──
function GemIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="#9B7FE8" stroke="#6A4FC4" strokeWidth="1.5"/>
      <polygon points="12,2 22,8 12,10 2,8" fill="#C4AEFF" stroke="#6A4FC4" strokeWidth="1"/>
      <polygon points="12,10 22,8 22,16 12,22" fill="#7B5FD8" stroke="#6A4FC4" strokeWidth="1"/>
      <polygon points="12,10 2,8 2,16 12,22" fill="#8B6FE8" stroke="#6A4FC4" strokeWidth="1"/>
      <ellipse cx="10" cy="7" rx="2" ry="1.5" fill="white" opacity="0.4" transform="rotate(-20 10 7)"/>
    </svg>
  );
}

// ── FLAME ──
function FlameIcon() {
  return (
    <svg width="36" height="42" viewBox="0 0 36 42" xmlns="http://www.w3.org/2000/svg">
      {/* Outer flame */}
      <path d="M18 2 C18 2 28 12 28 22 C28 32 22 38 18 40 C14 38 8 32 8 22 C8 12 18 2 18 2 Z" fill="#FF6B35" stroke="#C03010" strokeWidth="1.5"/>
      {/* Mid flame */}
      <path d="M18 10 C18 10 25 18 25 25 C25 31 22 36 18 38 C14 36 11 31 11 25 C11 18 18 10 18 10 Z" fill="#FFB347"/>
      {/* Inner flame */}
      <path d="M18 18 C18 18 22 23 22 27 C22 31 20 34 18 35 C16 34 14 31 14 27 C14 23 18 18 18 18 Z" fill="#FFE066"/>
      {/* Shine */}
      <ellipse cx="15" cy="22" rx="2" ry="4" fill="white" opacity="0.3" transform="rotate(-15 15 22)"/>
    </svg>
  );
}

// ── LIGHTNING BOLT ──
function LightningIcon({ size = 32, color = "#FFD700" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,2 6,22 16,22 14,38 26,18 16,18" fill={color} stroke={color === "white" ? "rgba(255,255,255,0.5)" : "#C49A00"} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// ── ZETA STAR CHARACTER ──
function ZetaIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      {/* Star body */}
      <polygon
        points="30,4 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22"
        fill="#FFD700"
        stroke="#C49A00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Star shine */}
      <polygon
        points="30,4 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22"
        fill="#FFE566"
        stroke="none"
        clipPath="url(#topHalf)"
        opacity="0.5"
      />
      {/* Crown */}
      <polygon points="22,16 26,10 30,14 34,10 38,16" fill="#FF6B35" stroke="#C03010" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Eyes */}
      <ellipse cx="24" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
      <ellipse cx="36" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
      <ellipse cx="24.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="36.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
      {/* Eye shine */}
      <ellipse cx="25.5" cy="27" rx="1" ry="1.2" fill="white"/>
      <ellipse cx="37.5" cy="27" rx="1" ry="1.2" fill="white"/>
      {/* Confident smile */}
      <path d="M24 34 Q30 40 36 34" stroke="#C49A00" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Cheeks */}
      <ellipse cx="19" cy="32" rx="4" ry="3" fill="#FF6B35" opacity="0.3"/>
      <ellipse cx="41" cy="32" rx="4" ry="3" fill="#FF6B35" opacity="0.3"/>
    </svg>
  );
}

// ── ROOM ICONS ──
function RoomIcon({ id, unlocked }: { id: number; unlocked: boolean }) {
  const color = unlocked ? "#1A1A2E" : "rgba(255,255,255,0.6)";
  const size = 28;

  if (id === 1) return (
    // Bed icon
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="24" height="10" rx="3" fill={unlocked ? "#5B8CFF" : "#888"} stroke={unlocked ? "#2A5ACC" : "#666"} strokeWidth="1.5"/>
      <rect x="4" y="12" width="24" height="8" rx="2" fill={unlocked ? "#FFFFFF" : "#aaa"} stroke={unlocked ? "#ddd" : "#888"} strokeWidth="1.5"/>
      <rect x="5" y="12" width="10" height="8" rx="2" fill={unlocked ? "#FF6B9D" : "#aaa"} stroke={unlocked ? "#CC4477" : "#888"} strokeWidth="1.5"/>
      <rect x="17" y="12" width="10" height="8" rx="2" fill={unlocked ? "#FFD700" : "#aaa"} stroke={unlocked ? "#C9A800" : "#888"} strokeWidth="1.5"/>
      <rect x="4" y="8" width="4" height="12" rx="2" fill={unlocked ? "#5B8CFF" : "#888"} stroke={unlocked ? "#2A5ACC" : "#666"} strokeWidth="1.5"/>
      <rect x="24" y="8" width="4" height="12" rx="2" fill={unlocked ? "#5B8CFF" : "#888"} stroke={unlocked ? "#2A5ACC" : "#666"} strokeWidth="1.5"/>
    </svg>
  );

  if (id === 2) return (
    // Sofa icon
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="16" width="24" height="12" rx="4" fill={unlocked ? "#9B7FE8" : "#888"} stroke={unlocked ? "#6A4FC4" : "#666"} strokeWidth="1.5"/>
      <rect x="6" y="12" width="20" height="8" rx="3" fill={unlocked ? "#B09AFF" : "#aaa"} stroke={unlocked ? "#6A4FC4" : "#888"} strokeWidth="1.5"/>
      <rect x="2" y="14" width="6" height="14" rx="3" fill={unlocked ? "#7B5FD8" : "#888"} stroke={unlocked ? "#5A40B0" : "#666"} strokeWidth="1.5"/>
      <rect x="24" y="14" width="6" height="14" rx="3" fill={unlocked ? "#7B5FD8" : "#888"} stroke={unlocked ? "#5A40B0" : "#666"} strokeWidth="1.5"/>
      <rect x="4" y="26" width="6" height="4" rx="2" fill={unlocked ? "#5A40B0" : "#666"} stroke={unlocked ? "#3A2090" : "#555"} strokeWidth="1"/>
      <rect x="22" y="26" width="6" height="4" rx="2" fill={unlocked ? "#5A40B0" : "#666"} stroke={unlocked ? "#3A2090" : "#555"} strokeWidth="1"/>
    </svg>
  );

  if (id === 3) return (
    // Flower/garden icon
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="16" width="4" height="12" rx="2" fill={unlocked ? "#4DAF35" : "#888"} stroke={unlocked ? "#2E7D32" : "#666"} strokeWidth="1.5"/>
      <ellipse cx="16" cy="14" rx="5" ry="5" fill={unlocked ? "#FF6B9D" : "#aaa"} stroke={unlocked ? "#CC4477" : "#888"} strokeWidth="1.5"/>
      <ellipse cx="9" cy="10" rx="4" ry="4" fill={unlocked ? "#FFD700" : "#aaa"} stroke={unlocked ? "#C9A800" : "#888"} strokeWidth="1.5"/>
      <ellipse cx="23" cy="10" rx="4" ry="4" fill={unlocked ? "#5B8CFF" : "#aaa"} stroke={unlocked ? "#2A5ACC" : "#888"} strokeWidth="1.5"/>
      <ellipse cx="16" cy="14" rx="3" ry="3" fill={unlocked ? "#FFE066" : "#ccc"} stroke={unlocked ? "#C9A800" : "#aaa"} strokeWidth="1"/>
      <path d="M10 26 Q16 20 22 26" stroke={unlocked ? "#4DAF35" : "#888"} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );

  if (id === 4) return (
    // Tree/treehouse icon
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="13" y="22" width="6" height="8" rx="2" fill={unlocked ? "#C8874A" : "#888"} stroke={unlocked ? "#8B5200" : "#666"} strokeWidth="1.5"/>
      <polygon points="16,2 28,18 4,18" fill={unlocked ? "#4DAF35" : "#aaa"} stroke={unlocked ? "#2E7D32" : "#888"} strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="16,6 26,20 6,20" fill={unlocked ? "#5DBE4A" : "#bbb"} stroke={unlocked ? "#3D9E2A" : "#888"} strokeWidth="1" strokeLinejoin="round"/>
      <rect x="10" y="12" width="12" height="8" rx="2" fill={unlocked ? "#C8874A" : "#aaa"} stroke={unlocked ? "#8B5200" : "#888"} strokeWidth="1.5"/>
      <rect x="14" y="14" width="4" height="6" rx="1" fill={unlocked ? "#FFD700" : "#ccc"} stroke={unlocked ? "#C9A800" : "#aaa"} strokeWidth="1"/>
    </svg>
  );

  // Padlock for locked
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="16" height="14" rx="3" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <path d="M11 14 L11 10 C11 6 21 6 21 10 L21 14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="16" cy="21" rx="2.5" ry="2.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="15" y="21" width="2" height="4" rx="1" fill="rgba(255,255,255,0.6)"/>
    </svg>
  );
}

// ── AVATAR ICON — mini version for top bar ──
function AvatarIcon({ id }: { id: number }) {
  const colors: Record<number, { shirt: string; hair: string }> = {
    1: { shirt: "#FF6B9D", hair: "#5C3317" },
    2: { shirt: "#FFFFFF", hair: "#5C3317" },
    3: { shirt: "#FFD700", hair: "#5C3317" },
    4: { shirt: "#4CAF50", hair: "#5C3317" },
  };
  const c = colors[id] || colors[1];
  return (
    <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <ellipse cx="26" cy="20" rx="12" ry="13" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <ellipse cx="26" cy="14" rx="12" ry="6" fill={c.hair} stroke="#3B1F0A" strokeWidth="1.5"/>
      <rect x="14" y="32" width="24" height="18" rx="8" fill={c.shirt} stroke="#00000022" strokeWidth="1"/>
      <ellipse cx="26" cy="21" rx="8" ry="8" fill="#C68642"/>
      <ellipse cx="21" cy="19" rx="3" ry="3.5" fill="white" stroke="#2A1A00" strokeWidth="1"/>
      <ellipse cx="31" cy="19" rx="3" ry="3.5" fill="white" stroke="#2A1A00" strokeWidth="1"/>
      <ellipse cx="21.5" cy="19.5" rx="1.8" ry="2" fill="#1A0A00"/>
      <ellipse cx="31.5" cy="19.5" rx="1.8" ry="2" fill="#1A0A00"/>
      <path d="M21 25 Q26 30 31 25" stroke="#9A6020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── CLOUD ──
function Cloud({ size }: { size: "sm" | "md" | "lg" }) {
  const d = { sm: { width: 80, height: 40, ballSize: 30 }, md: { width: 120, height: 55, ballSize: 45 }, lg: { width: 160, height: 70, ballSize: 58 } }[size];
  return (
    <div style={{ position: "relative", width: d.width, height: d.height }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "60%", background: "white", borderRadius: "999px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
      <div style={{ position: "absolute", bottom: "30%", left: "10%", width: d.ballSize * 0.8, height: d.ballSize * 0.8, background: "white", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "30%", left: "30%", width: d.ballSize, height: d.ballSize, background: "white", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "30%", right: "15%", width: d.ballSize * 0.75, height: d.ballSize * 0.75, background: "white", borderRadius: "50%" }} />
    </div>
  );
}

// ── BUSH ──
function Bush() {
  return (
    <div style={{ position: "relative", width: 44, height: 30 }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 44, height: 22, background: "#3D9E2A", borderRadius: "50% 50% 0 0" }} />
      <div style={{ position: "absolute", bottom: 7, left: "18%", width: 26, height: 26, background: "#4DAF35", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: 9, right: "14%", width: 22, height: 22, background: "#5DBE4A", borderRadius: "50%" }} />
    </div>
  );
}