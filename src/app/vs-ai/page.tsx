"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DIFFICULTIES = [
  {
    id: "easy",
    label: "Easy",
    description: "Zeta is slow and clumsy",
    color: "#5DBE4A",
    shadow: "#3D9E2A",
    bg: "#EAF7E6",
    reward: 1,
    zetaSpeed: 8000, // ms between Zeta correct answers
  },
  {
    id: "medium",
    label: "Medium",
    description: "Zeta fights back hard",
    color: "#7B6FE8",
    shadow: "#3A30A8",
    bg: "#7B6FE8",
    reward: 3,
    zetaSpeed: 4500,
  },
  {
    id: "hard",
    label: "Hard",
    description: "Zeta is unstoppable",
    color: "#E85454",
    shadow: "#A02020",
    bg: "#1A1A2E",
    reward: 5,
    zetaSpeed: 2600,
  },
];

export default function VsAiDifficulty() {
  const router  = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleStart = (id: string, zetaSpeed: number, reward: number) => {
    setSelected(id);
    // Pass difficulty data through URL params
    setTimeout(() => {
      router.push(`/vs-ai/battle?difficulty=${id}&zetaSpeed=${zetaSpeed}&reward=${reward}`);
    }, 200);
  };

  return (
    <main
      className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #5BB8F5 0%, #C9EEFF 55%, #6AC94F 55%, #4DAF35 60%, #C8874A 60%, #A0612A 100%)",
      }}
    >
      {/* Clouds */}
      <div className="absolute top-[4%] left-[3%] opacity-80 pointer-events-none"><Cloud size="lg" /></div>
      <div className="absolute top-[8%] right-[5%] opacity-70 pointer-events-none"><Cloud size="md" /></div>

      {/* Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: 32,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          zIndex: 10,
          position: "relative",
          margin: "0 16px",
        }}
      >
        {/* Zeta */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <ZetaSVG size={72} />
          <div
            style={{
              fontFamily: "var(--font-game)",
              fontSize: "clamp(1.6rem, 4vw, 2rem)",
              color: "#1A1A2E",
              marginTop: 8,
            }}
          >
            Battle Zeta!
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "#5A5A7A", marginTop: 4 }}>
            choose your difficulty
          </div>
        </div>

        {/* Difficulty options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => handleStart(d.id, d.zetaSpeed, d.reward)}
              style={{
                background: selected === d.id ? d.color : d.id === "medium" ? "#7B6FE8" : d.id === "hard" ? "#1A1A2E" : "#EAF7E6",
                border: `2.5px solid ${d.shadow}`,
                borderRadius: 16,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: `0 4px 0 ${d.shadow}`,
                transform: selected === d.id ? "translateY(3px)" : "translateY(0)",
                transition: "all 150ms ease",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "var(--font-game)",
                    fontSize: 16,
                    color: d.id === "easy" ? "#3D9E2A" : "white",
                  }}
                >
                  {d.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    color: d.id === "easy" ? "#5A7A5A" : "rgba(255,255,255,0.75)",
                    marginTop: 2,
                  }}
                >
                  {d.description}
                </div>
              </div>

              {/* Reward */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CoinSVG size={16} />
                <span
                  style={{
                    fontFamily: "var(--font-game)",
                    fontSize: 14,
                    color: d.id === "easy" ? "#C47A10" : "#FFE066",
                  }}
                >
                  +{d.reward}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Back button */}
        <button
          onClick={() => router.push("/home")}
          style={{
            width: "100%",
            background: "transparent",
            border: "1.5px solid #E0E0E0",
            borderRadius: 99,
            padding: "8px",
            fontFamily: "var(--font-game)",
            fontSize: 13,
            color: "#9898B8",
            cursor: "pointer",
          }}
        >
          back to home
        </button>
      </div>

      {/* Ground decorations */}
      <div className="absolute w-full flex justify-around pointer-events-none" style={{ bottom: "38%", zIndex: 4 }}>
        <Bush /><Bush /><Bush /><Bush /><Bush />
      </div>
    </main>
  );
}

// ── SVG COMPONENTS ──

function ZetaSVG({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,4 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22" fill="#FFD700" stroke="#C49A00" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="22,16 26,10 30,14 34,10 38,16" fill="#FF6B35" stroke="#C03010" strokeWidth="1.5" strokeLinejoin="round"/>
      <ellipse cx="24" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
      <ellipse cx="36" cy="28" rx="4" ry="4.5" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
      <ellipse cx="24.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="36.5" cy="28.5" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="25.5" cy="27" rx="1" ry="1.2" fill="white"/>
      <ellipse cx="37.5" cy="27" rx="1" ry="1.2" fill="white"/>
      <path d="M24 35 Q30 41 36 35" stroke="#C49A00" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="19" cy="32" rx="4" ry="3" fill="#FF6B35" opacity="0.3"/>
      <ellipse cx="41" cy="32" rx="4" ry="3" fill="#FF6B35" opacity="0.3"/>
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