"use client";

import { useEffect, type ReactNode } from "react";

// Kid-facing rules. Numbers here must match the game code:
// solo (REWARD_EVERY 3, PENALTY_EVERY 2), src/lib/vsAi.ts, gameContext streak bonus,
// room unlock streaks in home/page.tsx and room/page.tsx.
export default function HowToPlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* dimmed backdrop, tap to close */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(26,26,46,0.45)", zIndex: 200,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 250ms ease",
        }}
      />

      <aside
        role="dialog"
        aria-label="How to play"
        aria-hidden={!open}
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(380px, 100vw)",
          background: "#F8F9FF", zIndex: 201, display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.2)",
          transform: open ? "translateX(0)" : "translateX(105%)", transition: "transform 300ms cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        <div style={{ background: "linear-gradient(135deg, #7B6FE8, #5A50C8)", padding: "18px 18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-game)", fontSize: 24, color: "white", textShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>How to Play</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>everything you need to know</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3 L13 13 M13 3 L3 13" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Section icon={<LightningIcon />} color="#7B6FE8" title="Solo Run">
            <P>Stones with numbers drop from the sky. Slide left and right and catch the stone with the right answer before the time bar runs out!</P>
            <Tip>Move with the arrow keys, the arrow buttons, or tap the left or right side of the screen.</Tip>
            <Row label="3 right answers" value="a prize and a new level" />
            <P>Your prize is usually 1 coin. Sometimes it&apos;s 2 coins. And if you&apos;re really lucky, a shiny gem!</P>
            <Row label="2 wrong answers" value="lose 1 coin" />
            <P>Don&apos;t worry, your coins can never go below zero.</P>
            <Tip>At the top you&apos;ll see your coins, a green number for coins you earn and a red number for coins you lose. Tap end game to watch them add up!</Tip>
          </Section>

          <Section icon={<StairsIcon />} color="#5DBE4A" title="Levels">
            <P>There are 10 levels. The higher you climb, the trickier the math gets.</P>
            <Row label="Levels 1 to 3" value="adding" />
            <Row label="Levels 4 to 6" value="adding and taking away" />
            <Row label="Levels 7 to 10" value="times tables" />
            <Tip>Stuck? Tap the purple question button. The game pauses and gives you a tip and a fun fact.</Tip>
          </Section>

          <Section icon={<ZetaIcon />} color="#E85454" title="Race Zeta">
            <P>Zeta is a speedy star who loves math. You both race to catch the right stone. Whoever catches 5 first wins!</P>
            <Row label="Easy (adding)" value="win 1 coin" />
            <Row label="Medium (taking away)" value="win 3 coins" />
            <Row label="Hard (times tables)" value="win 5 coins and 1 gem" />
            <Tip>Zeta makes mistakes too, so never give up, even if you&apos;re behind!</Tip>
          </Section>

          <Section icon={<FlameIcon />} color="#FF6B35" title="Daily Streak">
            <P>Play at least once every day to grow your streak. Each day in a row adds 1.</P>
            <P>If you miss a day, your streak starts again at 1. You can always build it back up!</P>
            <Row label="7 days" value="5 coins" />
            <Row label="30 days" value="15 coins and 1 gem" />
            <Row label="100 days" value="50 coins and 3 gems" />
            <Row label="Other 10th days" value="2 bonus coins" />
          </Section>

          <Section icon={<HouseIcon />} color="#FF8FAB" title="Rooms">
            <P>You have 4 rooms to decorate. The Bedroom and Living Room are open right away.</P>
            <Row label="10 day streak" value="unlocks the Garden" />
            <Row label="20 day streak" value="unlocks the Treehouse" />
            <P>Tap something in Your Items to put it in your room. Drag it anywhere you like. Tap it, then tap the red cross to put it away again.</P>
          </Section>

          <Section icon={<ShopIcon />} color="#F5A623" title="Shop">
            <P>Spend your coins and gems on fun things for your rooms, like sofas, fountains, a fish bowl and even a gaming console.</P>
            <P>Everyone starts with a little plant, and every room has a window. Everything else you earn by playing, so keep collecting!</P>
            <P>Things you buy go to Your Items, and you can use them in any of your rooms. You keep them forever!</P>
          </Section>

          <Section icon={<PlayersIcon />} color="#9B7FE8" title="Taking Turns">
            <P>Everyone in your family gets their own player, with their own coins, streak and rooms.</P>
            <P>To switch players, tap your picture at the top of the Home screen.</P>
          </Section>
        </div>

        <div style={{ padding: "12px 16px 18px", flexShrink: 0, borderTop: "2px solid #ECEBFA" }}>
          <button
            onClick={onClose}
            style={{ width: "100%", background: "linear-gradient(to bottom, #FFD700, #F5A623)", border: "none", borderRadius: 99, padding: 14, fontFamily: "var(--font-game)", fontSize: 17, color: "white", cursor: "pointer", boxShadow: "0 4px 0 #C47A10", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
          >
            Got it, let&apos;s play!
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ icon, color, title, children }: { icon: ReactNode; color: string; title: string; children: ReactNode }) {
  return (
    <section style={{ background: "white", borderRadius: 20, padding: "14px 14px 12px", boxShadow: `0 4px 0 ${color}33, 0 4px 14px rgba(0,0,0,0.06)`, border: `2px solid ${color}40` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        <h2 style={{ fontFamily: "var(--font-game)", fontSize: 19, color: "#1A1A2E", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.5, color: "#3A3A55", margin: 0 }}>{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: "#F4F3FF", borderRadius: 12, padding: "7px 11px" }}>
      <span style={{ fontFamily: "var(--font-game)", fontSize: 13, color: "#5A50C8" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, color: "#3A3A55", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#FFF8E6", borderRadius: 12, padding: "8px 11px" }}>
      <svg width="16" height="18" viewBox="0 0 16 18" style={{ flexShrink: 0, marginTop: 2 }}>
        <path d="M8 1 A6 6 0 0 1 11.5 12 L11 14 L5 14 L4.5 12 A6 6 0 0 1 8 1 Z" fill="#FFD54A" stroke="#C49A1A" strokeWidth="1.2" />
        <rect x="5" y="14.5" width="6" height="2.5" rx="1" fill="#C49A1A" />
      </svg>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.45, color: "#7A5A00" }}>{children}</span>
    </div>
  );
}

function LightningIcon() {
  return <svg width="22" height="26" viewBox="0 0 32 40"><polygon points="18,2 6,22 16,22 14,38 26,18 16,18" fill="#7B6FE8" stroke="#5A50C8" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

function StairsIcon() {
  return (
    <svg width="26" height="24" viewBox="0 0 26 24">
      <path d="M2 22 L2 16 L9 16 L9 10 L16 10 L16 4 L24 4 L24 22 Z" fill="#6AC94F" stroke="#3D9E2A" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 1 L21 3 L23 3.3 L21.5 4.7 L22 7 L20 5.9 L18 7 L18.5 4.7 L17 3.3 L19 3 Z" fill="#FFD700" stroke="#C49A00" strokeWidth="0.8" />
    </svg>
  );
}

function ZetaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 60 60">
      <polygon points="30,4 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22" fill="#FFD700" stroke="#C49A00" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="24" cy="28" rx="3.5" ry="4" fill="#1A0A00" />
      <ellipse cx="36" cy="28" rx="3.5" ry="4" fill="#1A0A00" />
      <path d="M24 35 Q30 40 36 35" stroke="#C49A00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="22" height="26" viewBox="0 0 36 42">
      <path d="M18 2 C18 2 28 12 28 22 C28 32 22 38 18 40 C14 38 8 32 8 22 C8 12 18 2 18 2 Z" fill="#FF6B35" stroke="#C03010" strokeWidth="1.5" />
      <path d="M18 18 C18 18 22 23 22 27 C22 31 20 34 18 35 C16 34 14 31 14 27 C14 23 18 18 18 18 Z" fill="#FFE066" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="26" height="24" viewBox="0 0 26 24">
      <path d="M2 11 L13 2 L24 11" fill="none" stroke="#CC4477" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="10" width="16" height="12" rx="2" fill="#FF8FAB" stroke="#CC4477" strokeWidth="1.5" />
      <rect x="11" y="15" width="4" height="7" rx="1" fill="#C8874A" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="26" height="24" viewBox="0 0 26 24">
      <path d="M3 9 L5 3 L21 3 L23 9 Z" fill="#E85454" stroke="#A02020" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7 3 L6 9 M13 3 L13 9 M19 3 L20 9" stroke="white" strokeWidth="1.5" />
      <rect x="4" y="9" width="18" height="13" rx="2" fill="#F5C842" stroke="#C49A1A" strokeWidth="1.2" />
      <circle cx="13" cy="15.5" r="3" fill="#FFE066" stroke="#C49A1A" strokeWidth="1" />
    </svg>
  );
}

function PlayersIcon() {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24">
      <circle cx="9" cy="7" r="4.5" fill="#C68642" />
      <path d="M2 22 Q2 13 9 13 Q16 13 16 22 Z" fill="#FF6B9D" />
      <circle cx="19" cy="8" r="4" fill="#C68642" />
      <path d="M13 22 Q13 14 19 14 Q26 14 26 22 Z" fill="#4CAF50" />
    </svg>
  );
}
