"use client";

// This tells Next.js this is a Client Component
// Client Components run in the browser — they can handle
// clicks, animations, and interactivity
// Server Components just render HTML — no interactivity

import { useState } from "react";
import { useRouter } from "next/navigation";

// useRouter lets us navigate between pages
// When a kid taps Play it sends them to /onboarding

export default function Home() {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);

  // This function runs when the Play button is tapped
  const handlePlay = () => {
    setPressed(true);
    setTimeout(() => {
      router.push("/onboarding");
    }, 200);
  };

  return (
    <main
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(to bottom, #5BB8F5 0%, #C9EEFF 55%, #6AC94F 55%, #4DAF35 62%, #C8874A 62%, #A0612A 100%)",
      }}
    >

      {/* ── CLOUDS ── */}
      {/* These are purely decorative CSS clouds */}
      {/* They give the world depth and life */}
      <div className="absolute top-[8%] left-[5%] opacity-90">
        <Cloud size="lg" />
      </div>
      <div className="absolute top-[14%] right-[8%] opacity-80">
        <Cloud size="md" />
      </div>
      <div className="absolute top-[6%] left-[40%] opacity-70">
        <Cloud size="sm" />
      </div>

      {/* ── FAR BACKGROUND HILLS ── */}
      <div
        className="absolute w-full"
        style={{ bottom: "38%", zIndex: 1 }}
      >
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-24">
          <ellipse cx="200" cy="120" rx="280" ry="100" fill="#A8D8A8" />
          <ellipse cx="600" cy="120" rx="320" ry="110" fill="#9DD09D" />
          <ellipse cx="1000" cy="120" rx="260" ry="90" fill="#A8D8A8" />
          <ellipse cx="1350" cy="120" rx="200" ry="80" fill="#9DD09D" />
        </svg>
      </div>

      {/* ── LOGO AND TAGLINE ── */}
      <div
        className="relative flex flex-col items-center gap-2"
        style={{ zIndex: 10, marginBottom: "8vh" }}
      >
        {/* Game title */}
        <h1
          className="font-game text-white drop-shadow-lg"
          style={{
            fontSize: "clamp(3rem, 10vw, 6rem)",
            textShadow: "0 4px 0 #5A50C8, 0 8px 20px rgba(90,80,200,0.4)",
            letterSpacing: "2px",
          }}
        >
          Levelup
        </h1>

        {/* Tagline */}
        <p
          className="font-game text-white opacity-90"
          style={{
            fontSize: "clamp(0.9rem, 2.5vw, 1.3rem)",
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            letterSpacing: "1px",
          }}
        >
          Play smart. Rise fast. 
        </p>
      </div>

      {/* ── PLAY BUTTON ── */}
      <button
        onClick={handlePlay}
        style={{
          zIndex: 10,
          fontFamily: "var(--font-game)",
          fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
          background: pressed
            ? "linear-gradient(to bottom, #F5A623, #C47A10)"
            : "linear-gradient(to bottom, #FFD700, #F5A623)",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "999px",
          padding: "16px 56px",
          cursor: "pointer",
          boxShadow: pressed
            ? "0 2px 0 #A0612A, 0 4px 12px rgba(245,166,35,0.4)"
            : "0 6px 0 #C47A10, 0 10px 24px rgba(245,166,35,0.5)",
          transform: pressed ? "translateY(4px)" : "translateY(0)",
          transition: "all 150ms ease",
          letterSpacing: "1px",
          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        ▶ Play Now
      </button>

      {/* ── FLOATING COINS ── */}
      {/* Decorative coins that float in the world */}
      <div
        className="absolute"
        style={{ bottom: "42%", left: "15%", zIndex: 5 }}
      >
        <FloatingCoin delay="0s" />
      </div>
      <div
        className="absolute"
        style={{ bottom: "44%", right: "18%", zIndex: 5 }}
      >
        <FloatingCoin delay="0.6s" />
      </div>
      <div
        className="absolute"
        style={{ bottom: "46%", left: "55%", zIndex: 5 }}
      >
        <FloatingCoin delay="1.2s" />
      </div>

      {/* ── GROUND DECORATIONS ── */}
      {/* Small details on the ground to make the world feel alive */}
      <div
        className="absolute w-full flex justify-around items-end"
        style={{ bottom: "36%", zIndex: 4 }}
      >
        <Bush />
        <Bush />
        <Bush />
        <Bush />
      </div>

    </main>
  );
}

// ============================================
// SUB COMPONENTS
// These are small building blocks used only
// on this page — so we define them in the
// same file for now
// ============================================

// ── CLOUD COMPONENT ──
// A pure CSS 3D-looking cloud
// size prop controls how big it is
function Cloud({ size }: { size: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { width: 80,  height: 40,  ballSize: 30 },
    md: { width: 120, height: 55,  ballSize: 45 },
    lg: { width: 160, height: 70,  ballSize: 58 },
  };

  const d = dimensions[size];

  return (
    <div
      style={{
        position: "relative",
        width: d.width,
        height: d.height,
      }}
    >
      {/* Cloud base */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "60%",
          background: "white",
          borderRadius: "999px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      />
      {/* Cloud puff left */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "10%",
          width: d.ballSize * 0.8,
          height: d.ballSize * 0.8,
          background: "white",
          borderRadius: "50%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      />
      {/* Cloud puff center — tallest */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "30%",
          width: d.ballSize,
          height: d.ballSize,
          background: "white",
          borderRadius: "50%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      />
      {/* Cloud puff right */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "15%",
          width: d.ballSize * 0.75,
          height: d.ballSize * 0.75,
          background: "white",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

// ── FLOATING COIN COMPONENT ──
// A gold coin that bobs up and down
// delay prop staggers the animation so they don't all move together
function FloatingCoin({ delay }: { delay: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FFE066 0%, #F5C842 50%, #C49A1A 100%)",
        boxShadow: "0 4px 0 #C49A1A, 0 6px 12px rgba(245,200,66,0.5)",
        animation: `float 2s ease-in-out ${delay} infinite`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#A07010",
        fontFamily: "var(--font-game)",
        fontWeight: "bold",
      }}
    >
      $
    </div>
  );
}

// ── BUSH COMPONENT ──
// A simple decorative bush on the ground
function Bush() {
  return (
    <div style={{ position: "relative", width: 48, height: 32 }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 48,
          height: 24,
          background: "#3D9E2A",
          borderRadius: "50% 50% 0 0",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "20%",
          width: 28,
          height: 28,
          background: "#4DAF35",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: "15%",
          width: 24,
          height: 24,
          background: "#5DBE4A",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}