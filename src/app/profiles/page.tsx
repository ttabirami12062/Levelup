"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAvatarById } from "@/components/avatar/Avatars";

// One kid profile row, matching the columns in the Supabase profiles table.
interface Profile {
  id: string;
  name: string;
  avatar: number;
}

export default function Profiles() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // On load: confirm a parent is signed in, then pull their kids.
  // No session means nobody is logged in, so send them to the login screen.
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setProfiles(data as Profile[]);
      }
      setLoading(false);
    };

    load();
  }, [router]);

  // Picking a kid records who is playing, then drops them into the game.
  const pickProfile = (profile: Profile) => {
    localStorage.setItem("levelup_active_profile", profile.id);
    localStorage.setItem("levelup_name", profile.name);
    localStorage.setItem("levelup_avatar", String(profile.avatar));
    router.push("/home");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <main
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-12 px-4"
      style={{ background: "linear-gradient(180deg, #5BB8F5 0%, #C9EEFF 100%)", overflow: "hidden" }}
    >
      <div className="absolute top-[6%] left-[4%] opacity-90"><Cloud size="lg" /></div>
      <div className="absolute top-[10%] right-[6%] opacity-80"><Cloud size="md" /></div>
      <div className="absolute bottom-[10%] left-[10%] opacity-80"><Cloud size="md" /></div>
      <div className="absolute bottom-[16%] right-[8%] opacity-70"><Cloud size="sm" /></div>

      <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 32, padding: "36px 32px", width: "100%", maxWidth: 600, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 10, position: "relative" }}>
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "var(--font-game)", fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "#1A1A2E", marginBottom: 8 }}>
            Who&apos;s Playing?
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "1rem", color: "#5A5A7A" }}>
            Pick your player to keep going
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "var(--font-ui)", fontSize: "1rem", color: "#5A5A7A" }}>
            Loading players...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
            {profiles.map((profile) => {
              const avatar = getAvatarById(profile.avatar);
              const AvatarComponent = avatar.component;
              return (
                <button
                  key={profile.id}
                  onClick={() => pickProfile(profile)}
                  style={{
                    background: avatar.color,
                    border: `3px solid ${avatar.shadow}`,
                    borderRadius: 20,
                    padding: "14px 6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 200ms ease",
                    boxShadow: `0 6px 0 ${avatar.shadow}, 0 10px 20px rgba(0,0,0,0.12)`,
                  }}
                >
                  <div style={{ width: 72, height: 96 }}>
                    <AvatarComponent />
                  </div>
                  <span style={{ fontFamily: "var(--font-game)", fontSize: "0.85rem", color: "#FFFFFF" }}>
                    {profile.name}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => router.push("/profiles/add")}
              style={{
                background: "#F8F9FF",
                border: "3px dashed #C0C0D8",
                borderRadius: 20,
                padding: "14px 6px 10px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                minHeight: 140,
                boxShadow: "0 4px 0 #D0D0E0",
              }}
            >
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#E8E8F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#7B6FE8", fontWeight: "bold" }}>
                +
              </div>
              <span style={{ fontFamily: "var(--font-game)", fontSize: "0.85rem", color: "#7B6FE8" }}>
                Add a Player
              </span>
            </button>
          </div>
        )}

        <button
          onClick={signOut}
          style={{
            width: "100%", padding: "13px", borderRadius: 999, border: "none",
            background: "#F0F0F5", color: "#8A8AA5",
            fontFamily: "var(--font-game)", fontSize: "0.95rem", cursor: "pointer",
          }}
        >
          Sign out
        </button>
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