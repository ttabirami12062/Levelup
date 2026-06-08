"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function Girl1() {
  return (
    <svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="60" cy="52" rx="26" ry="28" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="86" cy="44" rx="9" ry="20" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2" transform="rotate(15 86 44)"/>
      <ellipse cx="90" cy="62" rx="6" ry="13" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5" transform="rotate(25 90 62)"/>
      <ellipse cx="84" cy="42" rx="5" ry="5" fill="#FF6B9D" stroke="#CC4477" strokeWidth="2"/>
      <rect x="53" y="76" width="14" height="13" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="30" y="88" width="60" height="44" rx="14" fill="#FF6B9D" stroke="#CC4477" strokeWidth="2.5"/>
      <path d="M48 88 Q60 100 72 88" stroke="#CC4477" strokeWidth="2" fill="none"/>
      <ellipse cx="48" cy="102" rx="8" ry="5" fill="#FF8FB5" opacity="0.5"/>
      <rect x="16" y="90" width="15" height="34" rx="7" fill="#FF6B9D" stroke="#CC4477" strokeWidth="2"/>
      <rect x="89" y="90" width="15" height="34" rx="7" fill="#FF6B9D" stroke="#CC4477" strokeWidth="2"/>
      <ellipse cx="23" cy="127" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <ellipse cx="97" cy="127" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="30" y="130" width="60" height="26" rx="10" fill="#4A90D9" stroke="#2A6AB0" strokeWidth="2.5"/>
      <rect x="30" y="130" width="60" height="8" rx="8" fill="#2A6AB0" stroke="#1A4A80" strokeWidth="1.5"/>
      <line x1="60" y1="138" x2="60" y2="156" stroke="#2A6AB0" strokeWidth="2"/>
      <rect x="34" y="154" width="18" height="18" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="68" y="154" width="18" height="18" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="33" y="166" width="20" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <rect x="67" y="166" width="20" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <ellipse cx="43" cy="175" rx="14" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="77" cy="175" rx="14" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="60" cy="56" rx="23" ry="25" fill="#C68642" stroke="#9A6020" strokeWidth="2.5"/>
      <ellipse cx="60" cy="62" rx="18" ry="16" fill="#D4924E" opacity="0.3"/>
      <ellipse cx="49" cy="52" rx="7" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="71" cy="52" rx="7" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="50" cy="53" rx="4.5" ry="5" fill="#2E8B57"/>
      <ellipse cx="72" cy="53" rx="4.5" ry="5" fill="#2E8B57"/>
      <ellipse cx="50" cy="54" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="72" cy="54" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="51.5" cy="51.5" rx="1.5" ry="1.8" fill="white"/>
      <ellipse cx="73.5" cy="51.5" rx="1.5" ry="1.8" fill="white"/>
      <path d="M43 48 Q46 44 49 46" stroke="#2A1A00" strokeWidth="1.5" fill="none"/>
      <path d="M71 46 Q74 44 77 48" stroke="#2A1A00" strokeWidth="1.5" fill="none"/>
      <ellipse cx="40" cy="62" rx="8" ry="5" fill="#E8956D" opacity="0.55"/>
      <ellipse cx="80" cy="62" rx="8" ry="5" fill="#E8956D" opacity="0.55"/>
      <path d="M57 64 Q60 68 63 64" stroke="#9A6020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M50 70 Q60 80 70 70" stroke="#9A6020" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="60" cy="34" rx="23" ry="10" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="37" cy="46" rx="8" ry="16" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="48" cy="34" rx="8" ry="4" fill="#7A4A28" opacity="0.5"/>
    </svg>
  );
}

function Girl2() {
  return (
    <svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="60" cy="50" rx="27" ry="28" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="34" cy="62" rx="9" ry="22" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="86" cy="58" rx="8" ry="18" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <path d="M72 34 Q90 30 92 46 Q88 38 72 38 Z" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <ellipse cx="50" cy="36" rx="10" ry="5" fill="#7A4A28" opacity="0.45"/>
      <ellipse cx="72" cy="34" rx="8" ry="4" fill="#7A4A28" opacity="0.35"/>
      <rect x="53" y="74" width="14" height="13" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="30" y="86" width="60" height="30" rx="12" fill="#FFFFFF" stroke="#DDDDDD" strokeWidth="2.5"/>
      <path d="M48 86 Q60 96 72 86" stroke="#DDDDDD" strokeWidth="2" fill="none"/>
      <rect x="30" y="110" width="60" height="6" rx="3" fill="#F0F0F0" stroke="#DDDDDD" strokeWidth="1.5"/>
      <ellipse cx="46" cy="98" rx="9" ry="5" fill="#F8F8F8" opacity="0.8"/>
      <rect x="34" y="114" width="52" height="10" rx="4" fill="#C68642"/>
      <rect x="16" y="88" width="15" height="30" rx="7" fill="#FFFFFF" stroke="#DDDDDD" strokeWidth="2"/>
      <rect x="89" y="88" width="15" height="30" rx="7" fill="#FFFFFF" stroke="#DDDDDD" strokeWidth="2"/>
      <ellipse cx="23" cy="121" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <ellipse cx="97" cy="121" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="30" y="122" width="60" height="28" rx="10" fill="#9B7FE8" stroke="#6A4FC4" strokeWidth="2.5"/>
      <rect x="30" y="122" width="60" height="9" rx="8" fill="#7B5FD8" stroke="#5A40B0" strokeWidth="1.5"/>
      <line x1="60" y1="131" x2="60" y2="150" stroke="#7B5FD8" strokeWidth="2"/>
      <ellipse cx="44" cy="138" rx="8" ry="5" fill="#B09AFF" opacity="0.4"/>
      <rect x="34" y="148" width="18" height="20" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="68" y="148" width="18" height="20" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="33" y="163" width="20" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <rect x="67" y="163" width="20" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <ellipse cx="43" cy="173" rx="14" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="77" cy="173" rx="14" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="43" cy="174" rx="14" ry="4" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="77" cy="174" rx="14" ry="4" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="60" cy="54" rx="23" ry="25" fill="#C68642" stroke="#9A6020" strokeWidth="2.5"/>
      <ellipse cx="60" cy="60" rx="18" ry="16" fill="#D4924E" opacity="0.3"/>
      <ellipse cx="49" cy="50" rx="7" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="71" cy="50" rx="7" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="50" cy="51" rx="4.5" ry="5" fill="#4A90D9"/>
      <ellipse cx="72" cy="51" rx="4.5" ry="5" fill="#4A90D9"/>
      <ellipse cx="50" cy="52" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="72" cy="52" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="51.5" cy="49.5" rx="1.5" ry="1.8" fill="white"/>
      <ellipse cx="73.5" cy="49.5" rx="1.5" ry="1.8" fill="white"/>
      <path d="M43 46 Q46 42 49 44" stroke="#2A1A00" strokeWidth="1.5" fill="none"/>
      <path d="M71 44 Q74 42 77 46" stroke="#2A1A00" strokeWidth="1.5" fill="none"/>
      <ellipse cx="40" cy="60" rx="8" ry="5" fill="#E8956D" opacity="0.55"/>
      <ellipse cx="80" cy="60" rx="8" ry="5" fill="#E8956D" opacity="0.55"/>
      <path d="M57 62 Q60 66 63 62" stroke="#9A6020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M50 68 Q60 78 70 68" stroke="#9A6020" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="60" cy="32" rx="24" ry="11" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <path d="M36 42 Q38 28 55 30 Q44 32 38 44 Z" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
    </svg>
  );
}

function Boy1() {
  return (
    <svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="60" cy="48" rx="26" ry="16" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="36" cy="54" rx="8" ry="14" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="84" cy="54" rx="8" ry="14" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <rect x="35" y="36" width="50" height="14" rx="7" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="52" cy="36" rx="10" ry="5" fill="#7A4A28" opacity="0.5"/>
      <rect x="53" y="76" width="14" height="13" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="28" y="88" width="64" height="44" rx="14" fill="#FFD700" stroke="#C9A800" strokeWidth="2.5"/>
      <path d="M46 88 Q60 102 74 88" stroke="#C9A800" strokeWidth="2" fill="none"/>
      <ellipse cx="46" cy="104" rx="10" ry="6" fill="#FFE566" opacity="0.5"/>
      <rect x="28" y="110" width="64" height="7" rx="3" fill="#FFC200" opacity="0.4"/>
      <rect x="14" y="90" width="16" height="36" rx="8" fill="#FFD700" stroke="#C9A800" strokeWidth="2"/>
      <rect x="90" y="90" width="16" height="36" rx="8" fill="#FFD700" stroke="#C9A800" strokeWidth="2"/>
      <ellipse cx="22" cy="129" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <ellipse cx="98" cy="129" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="28" y="130" width="64" height="28" rx="10" fill="#1A1A2E" stroke="#000000" strokeWidth="2.5"/>
      <rect x="28" y="130" width="64" height="9" rx="8" fill="#2A2A40" stroke="#000000" strokeWidth="1.5"/>
      <line x1="60" y1="139" x2="60" y2="158" stroke="#2A2A40" strokeWidth="2"/>
      <rect x="32" y="156" width="20" height="18" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="68" y="156" width="20" height="18" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="31" y="168" width="22" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <rect x="67" y="168" width="22" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <ellipse cx="42" cy="177" rx="15" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="78" cy="177" rx="15" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="42" cy="178" rx="15" ry="4" fill="#E0E0E0" opacity="0.6"/>
      <ellipse cx="78" cy="178" rx="15" ry="4" fill="#E0E0E0" opacity="0.6"/>
      <ellipse cx="60" cy="58" rx="24" ry="26" fill="#C68642" stroke="#9A6020" strokeWidth="2.5"/>
      <ellipse cx="60" cy="64" rx="19" ry="17" fill="#D4924E" opacity="0.3"/>
      <ellipse cx="48" cy="54" rx="7.5" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="72" cy="54" rx="7.5" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="49" cy="55" rx="4.5" ry="5" fill="#4A90D9"/>
      <ellipse cx="73" cy="55" rx="4.5" ry="5" fill="#4A90D9"/>
      <ellipse cx="49" cy="56" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="73" cy="56" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="50.5" cy="53.5" rx="1.5" ry="1.8" fill="white"/>
      <ellipse cx="74.5" cy="53.5" rx="1.5" ry="1.8" fill="white"/>
      <ellipse cx="39" cy="64" rx="8" ry="5" fill="#E8956D" opacity="0.45"/>
      <ellipse cx="81" cy="64" rx="8" ry="5" fill="#E8956D" opacity="0.45"/>
      <path d="M57 66 Q60 70 63 66" stroke="#9A6020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M49 72 Q60 83 71 72" stroke="#9A6020" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <rect x="36" y="33" width="48" height="13" rx="6" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
    </svg>
  );
}

function Boy2() {
  return (
    <svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="60" cy="48" rx="26" ry="20" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="36" cy="54" rx="9" ry="16" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <ellipse cx="84" cy="54" rx="9" ry="16" fill="#5C3317" stroke="#3B1F0A" strokeWidth="2"/>
      <path d="M40 36 Q44 22 48 34" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <path d="M50 32 Q54 18 58 32" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <path d="M60 32 Q64 18 68 32" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <path d="M68 34 Q72 22 76 36" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <rect x="36" y="30" width="48" height="14" rx="4" fill="#5C3317" stroke="#3B1F0A" strokeWidth="1.5"/>
      <ellipse cx="50" cy="28" rx="6" ry="3" fill="#7A4A28" opacity="0.5"/>
      <ellipse cx="66" cy="26" rx="5" ry="3" fill="#7A4A28" opacity="0.4"/>
      <rect x="53" y="76" width="14" height="13" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="28" y="88" width="64" height="44" rx="14" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2.5"/>
      <path d="M46 88 Q60 102 74 88" stroke="#2E7D32" strokeWidth="2" fill="none"/>
      <ellipse cx="46" cy="104" rx="10" ry="6" fill="#66BB6A" opacity="0.5"/>
      <rect x="64" y="100" width="16" height="14" rx="4" fill="#2E7D32" opacity="0.3" stroke="#2E7D32" strokeWidth="1"/>
      <rect x="28" y="126" width="64" height="6" rx="3" fill="#2E7D32" opacity="0.2"/>
      <rect x="14" y="90" width="16" height="36" rx="8" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2"/>
      <rect x="90" y="90" width="16" height="36" rx="8" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2"/>
      <ellipse cx="22" cy="129" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <ellipse cx="98" cy="129" rx="9" ry="8" fill="#C68642" stroke="#9A6020" strokeWidth="1.5"/>
      <rect x="28" y="130" width="64" height="28" rx="10" fill="#1A3A6E" stroke="#0A2040" strokeWidth="2.5"/>
      <rect x="28" y="130" width="64" height="9" rx="8" fill="#0A2040" stroke="#000814" strokeWidth="1.5"/>
      <line x1="60" y1="139" x2="60" y2="158" stroke="#0A2040" strokeWidth="2"/>
      <ellipse cx="42" cy="144" rx="8" ry="5" fill="#2A5AB0" opacity="0.3"/>
      <rect x="32" y="156" width="20" height="18" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="68" y="156" width="20" height="18" rx="5" fill="#C68642" stroke="#9A6020" strokeWidth="2"/>
      <rect x="31" y="168" width="22" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <rect x="67" y="168" width="22" height="8" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
      <ellipse cx="42" cy="177" rx="15" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="78" cy="177" rx="15" ry="7" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      <ellipse cx="42" cy="178" rx="15" ry="4" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="78" cy="178" rx="15" ry="4" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="60" cy="58" rx="24" ry="26" fill="#C68642" stroke="#9A6020" strokeWidth="2.5"/>
      <ellipse cx="60" cy="64" rx="19" ry="17" fill="#D4924E" opacity="0.3"/>
      <ellipse cx="48" cy="54" rx="7.5" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="72" cy="54" rx="7.5" ry="8" fill="white" stroke="#2A1A00" strokeWidth="2"/>
      <ellipse cx="49" cy="55" rx="4.5" ry="5" fill="#2E8B57"/>
      <ellipse cx="73" cy="55" rx="4.5" ry="5" fill="#2E8B57"/>
      <ellipse cx="49" cy="56" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="73" cy="56" rx="2.5" ry="3" fill="#1A0A00"/>
      <ellipse cx="50.5" cy="53.5" rx="1.5" ry="1.8" fill="white"/>
      <ellipse cx="74.5" cy="53.5" rx="1.5" ry="1.8" fill="white"/>
      <ellipse cx="39" cy="64" rx="8" ry="5" fill="#E8956D" opacity="0.45"/>
      <ellipse cx="81" cy="64" rx="8" ry="5" fill="#E8956D" opacity="0.45"/>
      <path d="M57 66 Q60 70 63 66" stroke="#9A6020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M49 72 Q60 83 71 72" stroke="#9A6020" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M36 38 Q48 30 60 36 Q72 30 84 38" stroke="#3B1F0A" strokeWidth="2" fill="#5C3317"/>
    </svg>
  );
}

const AVATARS = [
  { id: 1, label: "Girl 1", color: "#FF6B9D", shadow: "#CC4477", component: Girl1 },
  { id: 2, label: "Girl 2", color: "#9B7FE8", shadow: "#6A4FC4", component: Girl2 },
  { id: 3, label: "Boy 1",  color: "#FFD700", shadow: "#C9A800", component: Boy1 },
  { id: 4, label: "Boy 2",  color: "#4CAF50", shadow: "#2E7D32", component: Boy2 },
];

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