"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AVATARS } from "@/components/avatar/Avatars";

export default function Onboarding() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!selectedAvatar) { setError("Pick your character first!"); return; }
    if (name.trim().length < 2) { setError("Enter a name to continue!"); return; }
    localStorage.setItem("levelup_avatar", String(selectedAvatar));
    localStorage.setItem("levelup_name", name.trim());
    router.push("/home");
  };

  return (
    <main
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-12 px-4"
      style={{ background: "linear-gradient(to bottom, #5BB8F5 0%, #C9EEFF 50%, #6AC94F 50%, #4DAF35 56%, #C8874A 56%, #A0612A 100%)" }}
    >
      <div className="absolute top-[6%] left-[4%] opacity-90"><Cloud size="lg" /></div>
      <div className="absolute top-[10%] right-[6%] opacity-80"><Cloud size="md" /></div>

      <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 32, padding: "36px 32px", width: "100%", maxWidth: 600, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 10, position: "relative" }}>
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "var(--font-game)", fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "#1A1A2E", marginBottom: 8 }}>
            Pick Your Character
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "1rem", color: "#5A5A7A" }}>
            Choose your character and enter a name
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {AVATARS.map((avatar) => {
            const isSelected = selectedAvatar === avatar.id;
            const AvatarComponent = avatar.component;
            return (
              <button
                key={avatar.id}
                onClick={() => { setSelectedAvatar(avatar.id); setError(""); }}
                style={{
                  background: isSelected ? avatar.color : "#F8F9FF",
                  border: isSelected ? `3px solid ${avatar.shadow}` : "3px solid #E8E8F0",
                  borderRadius: 20,
                  padding: "12px 6px 8px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 200ms ease",
                  transform: isSelected ? "translateY(-6px) scale(1.05)" : "translateY(0) scale(1)",
                  boxShadow: isSelected ? `0 8px 0 ${avatar.shadow}, 0 12px 24px rgba(0,0,0,0.15)` : "0 4px 0 #D0D0E0",
                  position: "relative",
                }}
              >
                <div style={{ width: 72, height: 96 }}>
                  <AvatarComponent />
                </div>
                <span style={{ fontFamily: "var(--font-game)", fontSize: "0.8rem", color: isSelected ? "#FFFFFF" : "#5A5A7A" }}>
                  {avatar.label}
                </span>
                {isSelected && (
                  <div style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold", color: avatar.shadow, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>✓</div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: "var(--font-game)", fontSize: "1rem", color: "#1A1A2E", display: "block", marginBottom: 8 }}>
            Name
          </label>
          <input
            type="text"
            placeholder="Name your Character :)"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            maxLength={16}
            style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: "2.5px solid #E8E8F0", fontFamily: "var(--font-ui)", fontSize: "1rem", color: "#1A1A2E", outline: "none", background: "#FAFBFF" }}
            onFocus={(e) => { e.target.style.borderColor = "#7B6FE8"; }}
            onBlur={(e) => { e.target.style.borderColor = "#E8E8F0"; }}
          />
          <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#9898B8", marginTop: 4, fontFamily: "var(--font-ui)" }}>
            {name.length}/16
          </div>
        </div>

        {error && (
          <div style={{ background: "#FFF0F0", border: "2px solid #E85454", borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontFamily: "var(--font-ui)", fontSize: "0.9rem", color: "#C03030", textAlign: "center" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          style={{
            width: "100%", padding: "16px", borderRadius: 999, border: "none",
            background: selectedAvatar && name.trim().length >= 2 ? "linear-gradient(to bottom, #FFD700, #F5A623)" : "linear-gradient(to bottom, #D0D0D0, #B8B8B8)",
            color: "#FFFFFF", fontFamily: "var(--font-game)", fontSize: "1.3rem",
            cursor: selectedAvatar && name.trim().length >= 2 ? "pointer" : "not-allowed",
            boxShadow: selectedAvatar && name.trim().length >= 2 ? "0 6px 0 #C47A10, 0 10px 24px rgba(245,166,35,0.4)" : "0 4px 0 #A0A0A0",
            transition: "all 200ms ease", letterSpacing: "0.5px", textShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}
        >
          Start My Journey 
        </button>
      </div>

      <div className="absolute w-full flex justify-around" style={{ bottom: "40%", zIndex: 4 }}>
        <Bush /><Bush /><Bush /><Bush /><Bush />
      </div>
    </main>
  );
}

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

function Bush() {
  return (
    <div style={{ position: "relative", width: 48, height: 32 }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 48, height: 24, background: "#3D9E2A", borderRadius: "50% 50% 0 0" }} />
      <div style={{ position: "absolute", bottom: 8, left: "20%", width: 28, height: 28, background: "#4DAF35", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: 10, right: "15%", width: 24, height: 24, background: "#5DBE4A", borderRadius: "50%" }} />
    </div>
  );
}