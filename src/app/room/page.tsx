"use client";

import { useState, useEffect, useRef, Suspense, type JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/lib/gameContext";
import { supabase } from "@/lib/supabase";

const CANVAS_W = 700;
const CANVAS_H = 460;
// Where the wall meets the floor (as a fraction of canvas height).
const HORIZON = 0.42;

const ROOMS = [
  { id: 1, name: "Bedroom",     bg: "linear-gradient(135deg, #FFB3C6, #FF8FAB)", floor: "#D4A96A", floorDark: "#B8894A", wall: "#FFD6E7", wallDark: "#FFC2D4", trim: "#FF6B9D" },
  { id: 2, name: "Living Room", bg: "linear-gradient(135deg, #A8EDEA, #7EC8C8)", floor: "#C4956A", floorDark: "#A67848", wall: "#B8F0ED", wallDark: "#96E4E0", trim: "#5BB8B5" },
  { id: 3, name: "Garden",      bg: "linear-gradient(135deg, #98F5A0, #6BDA74)", floor: "#6AC94F", floorDark: "#4DAF35", wall: "#A8E6FF", wallDark: "#C9EEFF", trim: "#4CAF50" },
  { id: 4, name: "Treehouse",   bg: "linear-gradient(135deg, #D4A96A, #B8844A)", floor: "#8D6E63", floorDark: "#6D4E45", wall: "#E8C89A", wallDark: "#D4A96A", trim: "#795548" },
];

// Streak required to unlock each room (must match home/page.tsx).
const ROOM_UNLOCK_STREAK: Record<number, number> = {
  1: 0,
  2: 0,
  3: 10,
  4: 20,
};

export interface ShopItem {
  id: string;
  name: string;
  category: "furniture" | "walls" | "floor" | "special" | "garden";
  price: number;
  currency: "coins" | "gems";
  footprint: { w: number; d: number };
}

export const ALL_ITEMS: ShopItem[] = [
  { id: "bed",        name: "Bed",          category: "furniture", price: 100, currency: "coins", footprint: { w: 2, d: 2 } },
  { id: "desk",       name: "Desk + Lamp",  category: "furniture", price: 50,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "plant",      name: "Plant",        category: "furniture", price: 45,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "sofa",       name: "Sofa",         category: "furniture", price: 220, currency: "coins", footprint: { w: 2, d: 1 } },
  { id: "armchair",   name: "Armchair",     category: "furniture", price: 185, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "coffeetable",name: "Coffee Table", category: "furniture", price: 90,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "tv",         name: "TV",           category: "furniture", price: 180, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "bookshelf",  name: "Bookshelf",    category: "furniture", price: 100, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "beanbag",    name: "Bean Bag",     category: "furniture", price: 80,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "wardrobe",   name: "Wardrobe",     category: "furniture", price: 250, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "vanity",     name: "Vanity Table", category: "furniture", price: 230, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "nightstand", name: "Nightstand",   category: "furniture", price: 65,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "floorlamp",  name: "Floor Lamp",   category: "furniture", price: 70,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "fireplace",  name: "Fireplace",    category: "furniture", price: 200, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "door",       name: "Door",         category: "walls",     price: 0,   currency: "coins", footprint: { w: 1, d: 2 } },
  { id: "window",     name: "Window",       category: "walls",     price: 0,   currency: "coins", footprint: { w: 2, d: 1 } },
  { id: "poster",     name: "Star Poster",  category: "walls",     price: 50,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "clock",      name: "Magic Clock",  category: "walls",     price: 180, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "painting",   name: "Painting",     category: "walls",     price: 120, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "wallmirror", name: "Wall Mirror",  category: "walls",     price: 115, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "wallshelf",  name: "Wall Shelf",   category: "walls",     price: 155, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "rug",        name: "Purple Rug",   category: "floor",     price: 50,  currency: "coins", footprint: { w: 2, d: 2 } },
  { id: "floorplant", name: "Floor Plant",  category: "floor",     price: 60,  currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "trophy",     name: "Trophy",       category: "special",   price: 3,   currency: "gems",  footprint: { w: 1, d: 1 } },
  { id: "galaxy",     name: "Galaxy Map",   category: "special",   price: 8,   currency: "gems",  footprint: { w: 1, d: 1 } },
  { id: "wand",       name: "Magic Broom",  category: "special",   price: 200, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "sortinghat", name: "Sorting Hat",  category: "special",   price: 2,   currency: "gems",  footprint: { w: 1, d: 1 } },
  { id: "snitch",     name: "Golden Winged Ball", category: "special", price: 4, currency: "gems", footprint: { w: 1, d: 1 } },
  { id: "wizardmap",  name: "Wizards Map",  category: "special",   price: 250, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "gamingconsole", name: "Gaming Console", category: "special", price: 5, currency: "gems", footprint: { w: 1, d: 1 } },
  { id: "fishbowl",   name: "Fish Bowl",    category: "special",   price: 2,   currency: "gems",  footprint: { w: 1, d: 1 } },
  { id: "gardenbed",  name: "Garden Bench", category: "garden",    price: 180, currency: "coins", footprint: { w: 2, d: 1 } },
  { id: "fountain",   name: "Fountain",     category: "garden",    price: 3,   currency: "gems",  footprint: { w: 1, d: 1 } },
  { id: "flowerbed",  name: "Flower Bed",   category: "garden",    price: 100, currency: "coins", footprint: { w: 2, d: 1 } },
  { id: "gardengnome",name: "Garden Gnome", category: "garden",    price: 150, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "birdbath",   name: "Bird Bath",    category: "garden",    price: 170, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "pond",       name: "Pond",         category: "garden",    price: 7,   currency: "gems",  footprint: { w: 2, d: 2 } },
  { id: "swingset",   name: "Swing Set",    category: "garden",    price: 120, currency: "coins", footprint: { w: 2, d: 1 } },
  { id: "wateringcan",name: "Watering Can", category: "garden",    price: 130, currency: "coins", footprint: { w: 1, d: 1 } },
  { id: "trampoline", name: "Trampoline",   category: "garden",    price: 150, currency: "coins", footprint: { w: 2, d: 2 } },
  { id: "hammock",    name: "Hammock",      category: "garden",    price: 90,  currency: "coins", footprint: { w: 2, d: 1 } },
];

const FREE_ITEMS = ["bed", "desk", "plant", "door", "window", "rug"];

// Default layouts per room, used when a kid has no saved data yet.
const DEFAULT_ROOM_ITEMS: Record<number, PlacedItem[]> = {
  1: [
    { itemId: "rug",    x: 0.5,  y: 0.80 },
    { itemId: "bed",    x: 0.26, y: 0.74 },
    { itemId: "window", x: 0.72, y: 0.30 },
    { itemId: "door",   x: 0.92, y: 0.55 },
    { itemId: "plant",  x: 0.10, y: 0.86 },
  ],
  2: [
    { itemId: "window", x: 0.30, y: 0.30 },
    { itemId: "door",   x: 0.90, y: 0.55 },
  ],
  3: [
    { itemId: "window", x: 0.30, y: 0.30 },
    { itemId: "door",   x: 0.90, y: 0.55 },
  ],
  4: [
    { itemId: "window", x: 0.30, y: 0.30 },
    { itemId: "door",   x: 0.90, y: 0.55 },
  ],
};

// Flat layout stores a free x/y position as a fraction (0-1) of the canvas.
interface PlacedItem { itemId: string; x: number; y: number; }

function RoomContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { coins, gems, streak } = useGame();

  const roomId = Number(searchParams.get("id")) || 1;
  const room   = ROOMS.find(r => r.id === roomId) || ROOMS[0];

  // Is this room still locked for the current streak?
  const requiredStreak = ROOM_UNLOCK_STREAK[roomId] ?? 0;
  const isLocked = streak < requiredStreak;

  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [ownedItems, setOwnedItems]   = useState<string[]>(FREE_ITEMS);
  const [selected, setSelected]       = useState<string | null>(null);
  const [dragging, setDragging]       = useState<string | null>(null);
  const [loaded, setLoaded]           = useState(false);
  // The full room_items object for this kid: { "1": [...], "2": [...], ... }
  const allRoomsRef = useRef<Record<string, PlacedItem[]>>({});
  const stageRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  const scrollTray = (dir: number) => {
    if (trayRef.current) trayRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  // ── LOAD THIS KID'S ROOMS FROM SUPABASE ──
  useEffect(() => {
    const load = async () => {
      setLoaded(false);
      const profileId = localStorage.getItem("levelup_active_profile");
      if (!profileId) {
        // No active profile — fall back to defaults so the page still works.
        setPlacedItems(DEFAULT_ROOM_ITEMS[roomId] || []);
        setOwnedItems(FREE_ITEMS);
        setLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("rooms")
        .select("owned_items, room_items")
        .eq("profile_id", profileId)
        .single();

      if (data && !error) {
        // Existing row — pull this room's slice and the owned list.
        const allRooms = (data.room_items as Record<string, PlacedItem[]>) || {};
        allRoomsRef.current = allRooms;
        const thisRoom = allRooms[String(roomId)] ?? DEFAULT_ROOM_ITEMS[roomId] ?? [];
        setPlacedItems(thisRoom);

        const owned = (data.owned_items as string[]) || [];
        setOwnedItems([...new Set([...FREE_ITEMS, ...owned])]);
      } else {
        // No row yet — create one seeded with default layouts for all rooms.
        const seeded: Record<string, PlacedItem[]> = {
          "1": DEFAULT_ROOM_ITEMS[1],
          "2": DEFAULT_ROOM_ITEMS[2],
          "3": DEFAULT_ROOM_ITEMS[3],
          "4": DEFAULT_ROOM_ITEMS[4],
        };
        allRoomsRef.current = seeded;
        await supabase.from("rooms").insert({
          profile_id:   profileId,
          owned_items:  FREE_ITEMS,
          room_items:   seeded,
          room_version: "v2",
        });
        setPlacedItems(seeded[String(roomId)] || []);
        setOwnedItems(FREE_ITEMS);
      }

      setLoaded(true);
    };

    load();
  }, [roomId]);

  // ── SAVE THIS ROOM'S LAYOUT BACK TO SUPABASE ──
  // Updates this room's slice inside the combined object, then writes the row.
  useEffect(() => {
    if (!loaded) return; // don't save until the initial load is done
    const profileId = localStorage.getItem("levelup_active_profile");
    if (!profileId) return;

    allRoomsRef.current = { ...allRoomsRef.current, [String(roomId)]: placedItems };

    supabase
      .from("rooms")
      .update({
        room_items: allRoomsRef.current,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", profileId)
      .then(({ error }) => {
        if (error) console.error("Failed to save room:", error.message);
      });
  }, [placedItems, roomId, loaded]);

  const eventToFraction = (clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return { x: 0.5, y: 0.7 };
    const rect = el.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    // Wall items (door, window, wall decor) may sit up on the wall;
    // everything else stays on the floor area.
    x = Math.max(0.04, Math.min(0.96, x));
    y = Math.max(0.06, Math.min(0.96, y));
    return { x, y };
  };

  const moveTo = (clientX: number, clientY: number) => {
    if (!dragging) return;
    const f = eventToFraction(clientX, clientY);
    setPlacedItems(prev => prev.map(p =>
      p.itemId === dragging ? { ...p, x: f.x, y: f.y } : p
    ));
  };

  const removeItem = (id: string) => {
    setPlacedItems(prev => prev.filter(p => p.itemId !== id));
    setSelected(null);
  };

  const addToRoom = (id: string) => {
    if (placedItems.find(p => p.itemId === id)) return;
    const wallItem = WALL_ITEMS.has(id);
    setPlacedItems(prev => [...prev, { itemId: id, x: 0.5, y: wallItem ? 0.3 : 0.7 }]);
    setSelected(id);
  };

  const trayItems = ownedItems.filter(id => !placedItems.find(p => p.itemId === id));

  // Items lower on screen (higher y) draw in front.
  const drawOrder = [...placedItems].sort((a, b) => a.y - b.y);

  if (isLocked) {
    return (
      <main className="w-full h-screen overflow-hidden flex flex-col items-center justify-center" style={{ background: room.bg }}>
        <button
          onClick={() => router.push("/home")}
          style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", border: "none", borderRadius: 12, width: 36, height: 36, color: "#1A1A2E", fontSize: 18, cursor: "pointer" }}
        >
          ←
        </button>

        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 28, padding: "32px 28px", maxWidth: 340, width: "88%", textAlign: "center", boxShadow: "0 14px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🔒</div>
          <div style={{ fontFamily: "var(--font-game)", fontSize: 24, color: "#1A1A2E", marginBottom: 8 }}>
            {room.name} is locked
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "#5A5A7A", lineHeight: 1.6, marginBottom: 6 }}>
            Keep playing every day to unlock this room!
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF1E8", borderRadius: 99, padding: "8px 18px", marginTop: 6, marginBottom: 22 }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontFamily: "var(--font-game)", fontSize: 16, color: "#FF6B35" }}>
              unlocks at {requiredStreak} day streak
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#9898B8", marginBottom: 18 }}>
            your streak: {streak} {streak === 1 ? "day" : "days"} — {Math.max(0, requiredStreak - streak)} to go!
          </div>

          <button
            onClick={() => router.push("/home")}
            style={{ width: "100%", background: "linear-gradient(to bottom, #FFD700, #F5A623)", border: "none", borderRadius: 99, padding: "14px", fontFamily: "var(--font-game)", fontSize: 16, color: "white", cursor: "pointer", boxShadow: "0 4px 0 #C47A10" }}
          >
            back home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-screen overflow-hidden flex flex-col" style={{ background: room.bg }}>
      <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => router.push("/home")} style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", border: "none", borderRadius: 12, width: 36, height: 36, color: "#1A1A2E", fontSize: 18, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontFamily: "var(--font-game)", fontSize: 22, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{room.name}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "rgba(255,255,255,0.75)" }}>tap an item, then drag it anywhere</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
            <CoinSVG size={14} /><span style={{ fontFamily: "var(--font-game)", fontSize: 13, color: "#C47A10" }}>{coins}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
            <GemSVG size={12} /><span style={{ fontFamily: "var(--font-game)", fontSize: 13, color: "#6A4FC4" }}>{gems}</span>
          </div>
          <button onClick={() => router.push(`/room/shop?id=${roomId}`)} style={{ background: "white", border: "none", borderRadius: 14, padding: "8px 16px", fontFamily: "var(--font-game)", fontSize: 13, color: room.trim, cursor: "pointer", boxShadow: "0 4px 0 rgba(0,0,0,0.12)" }}>shop</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 8px", flexShrink: 0 }}>
        {ROOMS.map(r => (
          <button key={r.id} onClick={() => router.push(`/room?id=${r.id}`)} style={{ padding: "5px 14px", borderRadius: 20, border: "none", background: r.id === roomId ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)", color: r.id === roomId ? "#1A1A2E" : "rgba(255,255,255,0.8)", fontFamily: "var(--font-game)", fontSize: 10, cursor: "pointer" }}>{r.name}</button>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px 8px", overflow: "hidden" }}>
        <div
          ref={stageRef}
          style={{ width: "100%", maxWidth: CANVAS_W, aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, position: "relative", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.18)", cursor: dragging ? "grabbing" : "default" }}
          onMouseMove={(e) => moveTo(e.clientX, e.clientY)}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
          onTouchMove={(e) => { if (dragging) { e.preventDefault(); moveTo(e.touches[0].clientX, e.touches[0].clientY); } }}
          onTouchEnd={() => setDragging(null)}
          onClick={(e) => { if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).closest("[data-room-bg]")) setSelected(null); }}
        >
          <svg data-room-bg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none">
            <RoomShell room={room} />
          </svg>

          {drawOrder.map(p => {
            const item = ALL_ITEMS.find(i => i.id === p.itemId);
            if (!item) return null;
            const isSel = selected === p.itemId;
            const spr = SPRITE_SIZE[p.itemId] || { w: 70, h: 80 };
            const widthPct = spr.w / CANVAS_W * 100;
            // Anchor the sprite by its bottom-center on the (x,y) point.
            const leftPct = p.x * 100 - widthPct / 2;
            const topPct  = p.y * 100 - (spr.h / CANVAS_H * 100);
            return (
              <div
                key={p.itemId}
                style={{
                  position: "absolute", left: `${leftPct}%`, top: `${topPct}%`,
                  width: `${widthPct}%`,
                  cursor: dragging === p.itemId ? "grabbing" : "grab",
                  zIndex: dragging === p.itemId ? 999 : 10 + Math.round(p.y * 100),
                  filter: isSel ? "drop-shadow(0 0 8px rgba(123,111,232,0.9))" : "drop-shadow(0 5px 4px rgba(0,0,0,0.22))",
                  userSelect: "none",
                }}
                onMouseDown={(e) => { e.stopPropagation(); setDragging(p.itemId); setSelected(p.itemId); }}
                onTouchStart={(e) => { e.stopPropagation(); setDragging(p.itemId); setSelected(p.itemId); }}
                onClick={(e) => { e.stopPropagation(); setSelected(p.itemId); }}
              >
                <FlatSprite id={p.itemId} room={room} />
              {isSel && (
                  <button
                    onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); removeItem(p.itemId); }}
                    onClick={(e) => { e.stopPropagation(); removeItem(p.itemId); }}
                    style={{
                      position: "absolute",
                      top: -16,
                      right: -16,
                      width: 38,
                      height: 38,
                      background: "#E85454",
                      border: "3px solid white",
                      borderRadius: "50%",
                      color: "white",
                      fontSize: 22,
                      cursor: "pointer",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1000,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      touchAction: "none",
                    }}
                  >×</button>
                )}
              </div>
            );
          })}

          {placedItems.length === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <span style={{ fontFamily: "var(--font-game)", fontSize: 18, color: "rgba(0,0,0,0.18)" }}>tap items below to add them</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(16px)", borderTop: "2px solid rgba(255,255,255,0.4)", flexShrink: 0, paddingBottom: 8 }}>
        <div style={{ padding: "6px 16px 4px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-game)", fontSize: 10, color: "rgba(255,255,255,0.9)", letterSpacing: 1, textTransform: "uppercase" }}>your items</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>tap to place</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 6px" }}>
          {trayItems.length > 4 && (
            <button
              onClick={() => scrollTray(-1)}
              aria-label="scroll left"
              style={{ flexShrink: 0, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.7)", color: "#1A1A2E", fontSize: 16, cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >‹</button>
          )}
          <div ref={trayRef} style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 6px", scrollbarWidth: "none", flex: 1 }}>
            {trayItems.length === 0 && <div style={{ padding: "10px 8px", fontFamily: "var(--font-ui)", fontSize: 11, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>all items placed — visit shop for more</div>}
            {trayItems.map(id => {
              const item = ALL_ITEMS.find(i => i.id === id);
              if (!item) return null;
              return (
                <button key={id} onClick={() => addToRoom(id)} style={{ background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: 16, padding: "8px 10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", flexShrink: 0, minWidth: 68 }}>
                  <div style={{ width: 46, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><FlatSprite id={id} room={room} /></div>
                  <span style={{ fontFamily: "var(--font-game)", fontSize: 8, color: "#1A1A2E", textAlign: "center", lineHeight: 1.3 }}>{item.name}</span>
                </button>
              );
            })}
          </div>
          {trayItems.length > 4 && (
            <button
              onClick={() => scrollTray(1)}
              aria-label="scroll right"
              style={{ flexShrink: 0, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.7)", color: "#1A1A2E", fontSize: 16, cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >›</button>
          )}
        </div>
      </div>
    </main>
  );
}

// Items that hang on the wall (start higher up, not on the floor).
const WALL_ITEMS = new Set(["door", "window", "poster", "clock", "painting", "wallmirror", "wallshelf"]);

function RoomShell({ room }: { room: typeof ROOMS[0] }) {
  const horizonY = CANVAS_H * HORIZON;
  return (
    <g>
      {/* back wall base */}
      <rect x={0} y={0} width={CANVAS_W} height={horizonY} fill={room.wall} />
      {/* per-room painted scenery on the wall */}
      <WallScenery room={room} horizonY={horizonY} />
      {/* floor */}
      <rect x={0} y={horizonY} width={CANVAS_W} height={CANVAS_H - horizonY} fill={room.floor} />
      {[0.62, 0.78, 0.94].map((f, i) => (
        <line key={i} x1={0} y1={CANVAS_H * f} x2={CANVAS_W} y2={CANVAS_H * f} stroke={room.floorDark} strokeWidth={1.5} opacity={0.4} />
      ))}
      {/* skirting / horizon trim */}
      <rect x={0} y={horizonY - 5} width={CANVAS_W} height={9} fill={room.trim} opacity={0.85} />
    </g>
  );
}

function WallScenery({ room, horizonY }: { room: typeof ROOMS[0]; horizonY: number }) {
  if (room.id === 1) {
    // Bedroom — soft striped wallpaper + cosy dots
    return (
      <g opacity={0.5}>
        {[90, 210, 330, 450, 570, 690].map((x, i) => (
          <rect key={i} x={x - 22} y={0} width={22} height={horizonY} fill="#FFC2D4" opacity={0.4} />
        ))}
        {[60, 180, 300, 420, 540, 660].map((x, i) => (
          <circle key={`d${i}`} cx={x} cy={40 + (i % 2) * 50} r={5} fill="#FF8FAB" opacity={0.5} />
        ))}
      </g>
    );
  }
  if (room.id === 2) {
    // Living Room — wood panel wainscot + warm wall
    return (
      <g>
        <rect x={0} y={horizonY - 60} width={CANVAS_W} height={60} fill="#D9B98C" opacity={0.6} />
        {[0, 100, 200, 300, 400, 500, 600, 700].map((x, i) => (
          <line key={i} x1={x} y1={horizonY - 60} x2={x} y2={horizonY} stroke="#B89668" strokeWidth={2} opacity={0.5} />
        ))}
        <line x1={0} y1={horizonY - 60} x2={CANVAS_W} y2={horizonY - 60} stroke="#B89668" strokeWidth={3} opacity={0.6} />
      </g>
    );
  }
  if (room.id === 3) {
    // Garden — blue sky with fluffy clouds + sun
    return (
      <g>
        <circle cx={600} cy={55} r={34} fill="#FFE066" opacity={0.9} />
        <circle cx={600} cy={55} r={44} fill="#FFE066" opacity={0.25} />
        <Cloud cx={130} cy={60} s={1.1} />
        <Cloud cx={330} cy={95} s={0.8} />
        <Cloud cx={470} cy={45} s={0.9} />
        {/* distant hedge along the horizon */}
        <rect x={0} y={horizonY - 26} width={CANVAS_W} height={26} fill="#5DBE4A" opacity={0.55} />
        {[40, 120, 200, 280, 360, 440, 520, 600, 680].map((x, i) => (
          <circle key={i} cx={x} cy={horizonY - 26} r={20} fill="#6AC94F" opacity={0.55} />
        ))}
      </g>
    );
  }
  // Treehouse — wooden planks + leafy bits
  return (
    <g>
      {[0, 34, 68, 102, 136, 170].map((y, i) => (
        <line key={i} x1={0} y1={y} x2={CANVAS_W} y2={y} stroke="#B8884A" strokeWidth={2.5} opacity={0.45} />
      ))}
      {[120, 260, 400, 540, 660].map((x, i) => (
        <line key={`k${i}`} x1={x} y1={0} x2={x} y2={horizonY} stroke="#A6743A" strokeWidth={1.5} opacity={0.3} />
      ))}
      <ellipse cx={90} cy={36} rx={26} ry={16} fill="#5DBE4A" opacity={0.5} />
      <ellipse cx={150} cy={50} rx={20} ry={13} fill="#6AC94F" opacity={0.5} />
      <ellipse cx={610} cy={40} rx={26} ry={16} fill="#5DBE4A" opacity={0.5} />
    </g>
  );
}

function Cloud({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={0.9}>
      <ellipse cx={0} cy={0} rx={34} ry={20} fill="#FFFFFF" />
      <ellipse cx={-26} cy={6} rx={20} ry={14} fill="#FFFFFF" />
      <ellipse cx={26} cy={6} rx={22} ry={15} fill="#FFFFFF" />
    </g>
  );
}

const SPRITE_SIZE: Record<string, { w: number; h: number }> = {
  bed:        { w: 200, h: 130 },
  desk:       { w: 110, h: 120 },
  plant:      { w: 70,  h: 120 },
  sofa:       { w: 180, h: 110 },
  bookshelf:  { w: 100, h: 150 },
  floorlamp:  { w: 64,  h: 160 },
  rug:        { w: 200, h: 76  },
  armchair:   { w: 100, h: 110 },
  coffeetable:{ w: 120, h: 78  },
  tv:         { w: 120, h: 110 },
  beanbag:    { w: 90,  h: 95  },
  wardrobe:   { w: 110, h: 160 },
  vanity:     { w: 100, h: 160 },
  nightstand: { w: 70,  h: 90  },
  fireplace:  { w: 120, h: 140 },
  floorplant: { w: 90,  h: 135 },
  door:       { w: 80,  h: 50 },
  window:     { w: 150, h: 150 },
  painting:   { w: 110, h: 95  },
  poster:     { w: 80,  h: 110 },
  clock:      { w: 90,  h: 100 },
  wallmirror: { w: 70,  h: 110 },
  trophy:     { w: 90,  h: 100 },
  galaxy:     { w: 100, h: 100 },
  wand:       { w: 150, h: 150 },
  sortinghat: { w: 80, h: 145 },
  wizardmap:  { w: 90,  h: 100 },
  fishbowl:   { w: 90,  h: 100 },
  gardenbed:  { w: 120, h: 100 },
  flowerbed:  { w: 130, h: 90  },
  fountain:   { w: 90,  h: 130 },
  gardengnome:{ w: 70,  h: 110 },
  birdbath:   { w: 80,  h: 110 },
  pond:       { w: 130, h: 80  },
  swingset:   { w: 110, h: 110 },
  wateringcan:{ w: 70,  h: 90  },
  trampoline: { w: 120, h: 80  },
  hammock:    { w: 130, h: 90  },
  snitch:     { w: 90,  h: 70  },
  gamingconsole: { w: 50, h: 90 },
  wallshelf:  { w: 120, h: 80  },
};

function FlatSprite({ id, room }: { id: string; room: typeof ROOMS[0] }) {
  switch (id) {
    case "bed": return (
      <svg viewBox="0 0 200 130" width="100%">
        <ellipse cx="105" cy="122" rx="92" ry="7" fill="#000" opacity="0.07" />
        <rect x="6" y="18" width="32" height="104" rx="12" fill="#B07D45" stroke="#7A4A1E" strokeWidth="3" />
        <rect x="12" y="26" width="20" height="60" rx="8" fill="#C28E54" />
        <rect x="18" y="100" width="172" height="22" rx="6" fill="#6D4520" />
        <rect x="22" y="78" width="168" height="28" rx="8" fill="#8B5E2C" />
        <path d="M30 88 Q110 78 190 88 L190 104 Q110 96 30 104 Z" fill="#FFFFFF" stroke="#E6E6E6" strokeWidth="2" />
        <path d="M70 84 Q130 76 190 82 L190 102 Q130 96 70 100 Z" fill="#74B3FF" />
        <path d="M78 88 Q130 82 188 86" fill="none" stroke="#5B8CFF" strokeWidth="2" opacity="0.5" />
        <path d="M96 92 Q140 87 186 90" fill="none" stroke="#5B8CFF" strokeWidth="2" opacity="0.4" />
        <path d="M34 56 Q40 44 58 46 Q74 48 74 60 Q74 74 56 74 Q38 74 34 62 Z" fill="#FF8FAB" stroke="#FF6B9D" strokeWidth="2" />
        <path d="M40 52 Q52 48 66 54" fill="none" stroke="#FF6B9D" strokeWidth="1.5" opacity="0.6" />
        <path d="M50 60 Q56 50 72 52 Q86 54 86 66 Q84 78 68 78 Q54 76 50 64 Z" fill="#FFC2D2" stroke="#FF8FAB" strokeWidth="2" />
        <rect x="26" y="120" width="9" height="9" rx="2" fill="#5A3818" />
        <rect x="177" y="120" width="9" height="9" rx="2" fill="#5A3818" />
      </svg>
    );
    case "desk": return (
      <svg viewBox="0 0 120 120" width="100%">
        <ellipse cx="60" cy="112" rx="48" ry="7" fill="#000" opacity="0.07" />
        <rect x="14" y="68" width="92" height="12" rx="4" fill="#C8874A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="18" y="72" width="84" height="4" rx="2" fill="#DBA071" />
        <rect x="20" y="80" width="14" height="32" fill="#A06830" />
        <rect x="86" y="80" width="14" height="32" fill="#A06830" />
        <rect x="38" y="80" width="44" height="32" rx="3" fill="#C4864A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="44" y="88" width="32" height="4" rx="2" fill="#8B5E2C" />
        <rect x="44" y="98" width="32" height="4" rx="2" fill="#8B5E2C" />
        <circle cx="60" cy="93" r="2" fill="#FFD54A" />
        <line x1="80" y1="68" x2="80" y2="36" stroke="#7A7A7A" strokeWidth="3" />
        <path d="M68 36 Q80 16 94 36 Z" fill="#FFD54A" stroke="#C49A00" strokeWidth="2" />
        <ellipse cx="81" cy="38" rx="13" ry="4" fill="#FFE899" />
        <ellipse cx="81" cy="44" rx="20" ry="6" fill="#FFE066" opacity="0.4" />
      </svg>
    );
    case "plant": return (
      <svg viewBox="0 0 80 120" width="100%">
        <ellipse cx="40" cy="112" rx="24" ry="6" fill="#000" opacity="0.08" />
        <path d="M22 86 L58 86 L53 112 L27 112 Z" fill="#E07B4A" stroke="#B85A2C" strokeWidth="2" />
        <rect x="20" y="80" width="40" height="9" rx="3" fill="#C8632F" />
        <rect x="20" y="80" width="40" height="9" rx="3" fill="none" stroke="#A04A1E" strokeWidth="1" />
        <path d="M40 80 Q22 64 18 38 Q34 50 40 80" fill="#5DBE4A" stroke="#3B8E2A" strokeWidth="1.5" />
        <path d="M40 80 Q58 64 62 38 Q46 50 40 80" fill="#6AC94F" stroke="#3B8E2A" strokeWidth="1.5" />
        <path d="M40 80 Q40 50 40 24 Q50 48 40 80" fill="#7BD862" stroke="#3B8E2A" strokeWidth="1.5" />
        <path d="M40 80 Q28 58 30 34 Q40 52 40 80" fill="#5DBE4A" stroke="#3B8E2A" strokeWidth="1.5" />
        <path d="M40 80 Q52 58 50 34 Q40 52 40 80" fill="#6AC94F" stroke="#3B8E2A" strokeWidth="1.5" />
      </svg>
    );
    case "sofa": return (
      <svg viewBox="0 0 180 110" width="100%">
        <ellipse cx="90" cy="103" rx="80" ry="6" fill="#000" opacity="0.07" />
        <path d="M16 30 Q14 22 26 22 L154 22 Q166 22 164 30 L164 60 Q164 66 154 64 L26 64 Q16 66 16 60 Z" fill="#C4AEFF" stroke="#9B7FE8" strokeWidth="2" />
        <path d="M30 28 Q44 24 58 28 Q60 46 58 60 Q44 62 30 60 Q28 44 30 28 Z" fill="#B7A0FF" />
        <path d="M62 28 Q76 24 90 28 Q92 46 90 60 Q76 62 62 60 Q60 44 62 28 Z" fill="#C4AEFF" />
        <path d="M94 28 Q108 24 122 28 Q124 46 122 60 Q108 62 94 60 Q92 44 94 28 Z" fill="#B7A0FF" />
        <path d="M126 28 Q140 24 150 28 Q152 46 150 60 Q138 62 126 60 Q124 44 126 28 Z" fill="#C4AEFF" />
        <path d="M6 42 Q4 36 14 36 Q24 36 24 46 L24 88 Q24 96 14 94 Q4 94 6 86 Z" fill="#9B7FE8" />
        <path d="M156 42 Q154 36 164 36 Q174 36 174 46 L174 88 Q174 96 164 94 Q154 94 156 86 Z" fill="#9B7FE8" />
        <path d="M28 60 Q30 54 40 56 L140 56 Q150 54 152 60 L152 86 Q152 94 142 92 L38 92 Q28 94 28 86 Z" fill="#B09AFF" />
        <path d="M88 58 Q90 74 88 90" fill="none" stroke="#9B7FE8" strokeWidth="2" opacity="0.5" />
        <path d="M40 52 Q42 44 56 46 Q70 48 70 58 Q70 70 54 70 Q40 68 40 56 Z" fill="#FF8FAB" stroke="#FF6B9D" strokeWidth="2" transform="rotate(-8 55 58)" />
        <path d="M112 52 Q114 44 128 46 Q142 48 142 58 Q142 70 126 70 Q112 68 112 56 Z" fill="#FFD54A" stroke="#E8A800" strokeWidth="2" transform="rotate(8 127 58)" />
        <rect x="24" y="92" width="10" height="13" rx="3" fill="#7B5FD8" />
        <rect x="146" y="92" width="10" height="13" rx="3" fill="#7B5FD8" />
      </svg>
    );
    case "bookshelf": return (
      <svg viewBox="0 0 100 150" width="100%">
        <rect x="14" y="10" width="72" height="132" rx="5" fill="#C4864A" stroke="#8B5E2C" strokeWidth="3" />
        <rect x="20" y="16" width="60" height="120" fill="#A06830" />
        {[44, 80, 116].map((y, i) => <rect key={i} x="20" y={y} width="60" height="4" fill="#7A4A1E" />)}
        {/* books row 1 */}
        <rect x="24" y="22" width="9" height="20" fill="#FF6B9D" />
        <rect x="35" y="20" width="8" height="22" fill="#5DBE4A" />
        <rect x="45" y="24" width="10" height="18" fill="#9B7FE8" />
        <rect x="58" y="21" width="8" height="21" fill="#FFD700" />
        <rect x="68" y="23" width="9" height="19" fill="#74B3FF" />
        {/* books row 2 */}
        <rect x="24" y="58" width="8" height="20" fill="#FFD700" />
        <rect x="34" y="56" width="9" height="22" fill="#FF8FAB" />
        <rect x="46" y="60" width="8" height="18" fill="#5DBE4A" />
        <rect x="56" y="57" width="10" height="21" fill="#9B7FE8" />
        {/* a little plant on bottom shelf */}
        <rect x="40" y="118" width="14" height="14" rx="3" fill="#E07B4A" />
        <circle cx="47" cy="114" r="9" fill="#6AC94F" />
      </svg>
    );
    case "floorlamp": return (
      <svg viewBox="0 0 70 160" width="100%">
        <ellipse cx="35" cy="150" rx="22" ry="7" fill="#000" opacity="0.08" />
        <ellipse cx="35" cy="146" rx="20" ry="8" fill="#A06830" stroke="#7A4A1E" strokeWidth="1.5" />
        <rect x="32" y="50" width="6" height="96" rx="3" fill="#9A9A9A" />
        <rect x="33" y="50" width="2" height="96" fill="#C4C4C4" />
        <path d="M12 50 L58 50 L48 18 L22 18 Z" fill="#FFD54A" stroke="#C49A00" strokeWidth="2" />
        <path d="M12 50 L58 50 L52 44 L18 44 Z" fill="#E8A800" opacity="0.5" />
        <rect x="22" y="14" width="26" height="6" rx="3" fill="#FFE899" />
        <ellipse cx="35" cy="52" rx="24" ry="6" fill="#FFE066" opacity="0.5" />
        <ellipse cx="35" cy="60" rx="32" ry="9" fill="#FFE066" opacity="0.25" />
      </svg>
    );
    case "rug": return (
      <svg viewBox="0 0 200 76" width="100%">
        <ellipse cx="100" cy="42" rx="96" ry="30" fill="#7B5FD8" />
        <ellipse cx="100" cy="40" rx="92" ry="28" fill="#9B7FE8" />
        <ellipse cx="100" cy="40" rx="74" ry="22" fill="#B09AFF" />
        <ellipse cx="100" cy="40" rx="52" ry="15" fill="#C4AEFF" />
        <ellipse cx="100" cy="40" rx="28" ry="8" fill="#D9C9FF" />
        <g fill="#FFFFFF" opacity="0.45">
          <circle cx="100" cy="18" r="2.5" /><circle cx="70" cy="40" r="2.5" /><circle cx="130" cy="40" r="2.5" /><circle cx="100" cy="62" r="2.5" />
        </g>
      </svg>
    );
    case "armchair": return (
      <svg viewBox="0 0 100 110" width="100%">
        <ellipse cx="50" cy="103" rx="44" ry="6" fill="#000" opacity="0.07" />
        <path d="M22 26 Q20 18 32 18 L68 18 Q80 18 78 26 L78 60 Q78 66 68 64 L32 64 Q22 66 22 60 Z" fill="#FFB3C6" stroke="#FF6B9D" strokeWidth="2" />
        <path d="M34 24 Q50 20 66 24 Q68 44 66 60 Q50 62 34 60 Q32 44 34 24 Z" fill="#FFA0B8" />
        <path d="M50 22 Q52 42 50 60" fill="none" stroke="#FF6B9D" strokeWidth="1.5" opacity="0.5" />
        <path d="M6 40 Q4 34 14 34 Q24 34 24 44 L24 86 Q24 94 14 92 Q4 92 6 84 Z" fill="#E0758F" />
        <path d="M76 40 Q74 34 84 34 Q94 34 94 44 L94 86 Q94 94 84 92 Q74 92 76 84 Z" fill="#E0758F" />
        <path d="M24 58 Q26 52 36 54 L64 54 Q74 52 76 58 L76 84 Q76 92 66 90 L34 90 Q24 92 24 84 Z" fill="#FF8FAB" />
        <rect x="18" y="92" width="9" height="13" rx="3" fill="#CC6680" />
        <rect x="73" y="92" width="9" height="13" rx="3" fill="#CC6680" />
      </svg>
    );
    case "coffeetable": return (
      <svg viewBox="0 0 120 78" width="100%">
        <ellipse cx="60" cy="68" rx="46" ry="7" fill="#000" opacity="0.08" />
        <rect x="20" y="40" width="9" height="30" rx="3" fill="#A06830" />
        <rect x="91" y="40" width="9" height="30" rx="3" fill="#A06830" />
        <rect x="26" y="62" width="68" height="6" rx="3" fill="#8B5E2C" />
        <ellipse cx="60" cy="34" rx="54" ry="15" fill="#C8874A" stroke="#8B5E2C" strokeWidth="2" />
        <ellipse cx="60" cy="31" rx="46" ry="11" fill="#DBA071" />
        <ellipse cx="48" cy="28" rx="16" ry="5" fill="#E8B98E" opacity="0.7" />
        <ellipse cx="60" cy="22" rx="9" ry="4" fill="#FF8FAB" />
        <rect x="55" y="10" width="10" height="13" rx="3" fill="#FF8FAB" />
        <path d="M55 12 Q60 4 65 12" fill="#6AC94F" />
      </svg>
    );
    case "tv": return (
      <svg viewBox="0 0 120 110" width="100%">
        <rect x="12" y="14" width="96" height="58" rx="6" fill="#1A1A2E" stroke="#2A2A4E" strokeWidth="3" />
        <rect x="18" y="20" width="84" height="46" rx="3" fill="#4A90D9" />
        <polygon points="18,66 50,30 78,66" fill="#6FB0E8" opacity="0.6" />
        <circle cx="84" cy="34" r="7" fill="#FFE066" opacity="0.85" />
        {/* stand */}
        <rect x="54" y="72" width="12" height="14" fill="#555" />
        <rect x="38" y="86" width="44" height="8" rx="3" fill="#C4864A" />
      </svg>
    );
    case "beanbag": return (
      <svg viewBox="0 0 90 95" width="100%">
        <ellipse cx="45" cy="84" rx="40" ry="9" fill="#000" opacity="0.08" />
        <path d="M14 60 Q10 30 45 26 Q80 30 76 60 Q78 80 45 86 Q12 80 14 60 Z" fill="#FFB3C6" stroke="#FF6B9D" strokeWidth="2.5" />
        <path d="M45 26 Q30 28 22 52 Q20 70 32 82 Q24 78 16 62 Q12 32 45 26 Z" fill="#FFC2D2" opacity="0.8" />
        <path d="M45 30 Q58 34 64 54" fill="none" stroke="#FF8FAB" strokeWidth="3" opacity="0.6" />
        <ellipse cx="34" cy="50" rx="9" ry="12" fill="#FFFFFF" opacity="0.3" />
      </svg>
    );
    case "wardrobe": return (
      <svg viewBox="0 0 110 160" width="100%">
        <rect x="14" y="10" width="82" height="142" rx="5" fill="#C4864A" stroke="#8B5E2C" strokeWidth="3" />
        <rect x="20" y="16" width="34" height="130" rx="3" fill="#D4956A" />
        <rect x="56" y="16" width="34" height="130" rx="3" fill="#D4956A" />
        <line x1="55" y1="16" x2="55" y2="146" stroke="#8B5E2C" strokeWidth="2" />
        <circle cx="49" cy="82" r="3.5" fill="#FFD700" />
        <circle cx="61" cy="82" r="3.5" fill="#FFD700" />
        <rect x="14" y="6" width="82" height="8" rx="3" fill="#A06830" />
      </svg>
    );
    case "vanity": return (
      <svg viewBox="0 0 100 160" width="100%">
        <rect x="14" y="96" width="72" height="16" rx="4" fill="#C8874A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="20" y="112" width="60" height="40" rx="4" fill="#C4864A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="26" y="120" width="48" height="14" rx="2" fill="#D9A06E" />
        <rect x="26" y="138" width="48" height="10" rx="2" fill="#D9A06E" />
        <circle cx="50" cy="127" r="2.5" fill="#FFD700" />
        <rect x="20" y="152" width="10" height="8" fill="#7A4A1E" />
        <rect x="70" y="152" width="10" height="8" fill="#7A4A1E" />
        <rect x="22" y="10" width="56" height="78" rx="28" fill="#E0C9A0" stroke="#C8874A" strokeWidth="4" />
        <rect x="28" y="16" width="44" height="66" rx="22" fill="#C9E9F5" />
        <path d="M40 22 Q32 30 33 48" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <circle cx="29" cy="20" r="3" fill="#FFD54A" />
        <circle cx="71" cy="20" r="3" fill="#FFD54A" />
        <circle cx="29" cy="78" r="3" fill="#FFD54A" />
        <circle cx="71" cy="78" r="3" fill="#FFD54A" />
      </svg>
    );
    case "nightstand": return (
      <svg viewBox="0 0 70 90" width="100%">
        <rect x="12" y="30" width="46" height="48" rx="5" fill="#C4864A" stroke="#8B5E2C" strokeWidth="3" />
        <rect x="18" y="38" width="34" height="14" rx="2" fill="#D4956A" />
        <rect x="18" y="56" width="34" height="14" rx="2" fill="#D4956A" />
        <circle cx="35" cy="45" r="2.5" fill="#FFD700" />
        <circle cx="35" cy="63" r="2.5" fill="#FFD700" />
        <rect x="14" y="78" width="8" height="8" fill="#8B5E2C" />
        <rect x="48" y="78" width="8" height="8" fill="#8B5E2C" />
        {/* little lamp on top */}
        <rect x="30" y="20" width="10" height="10" fill="#888" />
        <path d="M26 20 Q35 8 44 20 Z" fill="#FFD700" />
      </svg>
    );
    case "fireplace": return (
      <svg viewBox="0 0 120 140" width="100%">
        <rect x="8" y="20" width="104" height="16" rx="4" fill="#D6A878" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="14" y="36" width="92" height="96" rx="4" fill="#C4864A" stroke="#8B5E2C" strokeWidth="3" />
        <rect x="14" y="36" width="92" height="96" rx="4" fill="none" stroke="#A06830" strokeWidth="6" opacity="0.4" />
        <rect x="30" y="54" width="60" height="64" rx="4" fill="#2A1810" />
        <rect x="36" y="60" width="48" height="52" fill="#1A0E08" />
        <rect x="40" y="106" width="40" height="8" rx="4" fill="#6B4226" />
        <rect x="46" y="104" width="28" height="6" rx="3" fill="#7A4A1E" />
        <path d="M60 104 Q48 92 54 76 Q58 86 60 76 Q62 86 66 76 Q72 92 60 104 Z" fill="#FF6B35" />
        <path d="M60 104 Q52 96 56 84 Q60 92 60 84 Q60 92 64 84 Q68 96 60 104 Z" fill="#FFD54A" />
        <path d="M60 104 Q56 98 58 90 Q60 95 62 90 Q64 98 60 104 Z" fill="#FFF3B0" />
        <rect x="46" y="40" width="10" height="10" rx="2" fill="#FF8FAB" />
        <circle cx="72" cy="45" r="6" fill="#FFD54A" />
      </svg>
    );
    case "door": return (
      <svg viewBox="0 0 96 200" width="100%">
        {/* frame */}
        <rect x="6" y="6" width="84" height="194" rx="6" fill="#A06830" stroke="#7A4A1E" strokeWidth="3" />
        {/* door slab */}
        <rect x="16" y="14" width="64" height="186" rx="4" fill="#C4864A" stroke="#8B5E2C" strokeWidth="2" />
        {/* panels */}
        <rect x="24" y="24" width="48" height="60" rx="4" fill="#B07A40" stroke="#8B5E2C" strokeWidth="1.5" />
        <rect x="24" y="92" width="48" height="96" rx="4" fill="#B07A40" stroke="#8B5E2C" strokeWidth="1.5" />
        {/* knob */}
        <circle cx="66" cy="108" r="5" fill="#FFD700" stroke="#C49A00" strokeWidth="1.5" />
      </svg>
    );
    case "window": return (
      <svg viewBox="0 0 150 150" width="100%">
        {/* curtain rod */}
        <rect x="4" y="10" width="142" height="7" rx="3" fill="#8B5E2C" />
        <circle cx="6" cy="13" r="6" fill="#A06830" />
        <circle cx="144" cy="13" r="6" fill="#A06830" />
        {/* window frame */}
        <rect x="30" y="20" width="90" height="108" rx="5" fill="#A07040" stroke="#6B4820" strokeWidth="4" />
        {/* sky panes */}
        <rect x="38" y="28" width="34" height="44" fill="#B8E4F8" />
        <rect x="78" y="28" width="34" height="44" fill="#B8E4F8" />
        <rect x="38" y="78" width="34" height="42" fill="#A8D8F0" />
        <rect x="78" y="78" width="34" height="42" fill="#A8D8F0" />
        {/* little cloud + sun in the view */}
        <circle cx="95" cy="40" r="8" fill="#FFE066" />
        <ellipse cx="52" cy="46" rx="12" ry="6" fill="#FFFFFF" />
        {/* big curtains */}
        <path d="M14 14 Q34 70 22 128 Q40 120 44 14 Z" fill="#FF8FAB" stroke="#FF6B9D" strokeWidth="2" />
        <path d="M136 14 Q116 70 128 128 Q110 120 106 14 Z" fill="#FF8FAB" stroke="#FF6B9D" strokeWidth="2" />
        {/* curtain folds */}
        <path d="M28 18 Q24 70 28 124" fill="none" stroke="#FF6B9D" strokeWidth="1.5" opacity="0.6" />
        <path d="M37 18 Q34 70 38 122" fill="none" stroke="#FF6B9D" strokeWidth="1.5" opacity="0.6" />
        <path d="M122 18 Q126 70 122 124" fill="none" stroke="#FF6B9D" strokeWidth="1.5" opacity="0.6" />
        <path d="M113 18 Q116 70 112 122" fill="none" stroke="#FF6B9D" strokeWidth="1.5" opacity="0.6" />
        {/* tiebacks */}
        <ellipse cx="33" cy="112" rx="7" ry="4" fill="#FFD700" />
        <ellipse cx="117" cy="112" rx="7" ry="4" fill="#FFD700" />
      </svg>
    );
    case "floorplant": return (
      <svg viewBox="0 0 90 135" width="100%">
        <ellipse cx="45" cy="126" rx="28" ry="7" fill="#000" opacity="0.08" />
        <path d="M22 104 Q22 124 45 124 Q68 124 68 104 Q66 116 45 117 Q24 116 22 104 Z" fill="#9FB0BA" stroke="#7A8A92" strokeWidth="2" />
        <ellipse cx="45" cy="104" rx="23" ry="8" fill="#B7C4CB" stroke="#7A8A92" strokeWidth="2" />
        <ellipse cx="45" cy="103" rx="17" ry="5" fill="#5A3A1A" />
        <path d="M40 100 Q34 76 38 54" fill="none" stroke="#3B8E2A" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 100 Q54 78 50 58" fill="none" stroke="#3B8E2A" strokeWidth="3" strokeLinecap="round" />
        <path d="M44 100 Q44 70 44 44" fill="none" stroke="#3B8E2A" strokeWidth="3" strokeLinecap="round" />
        <g fill="#5DBE4A" stroke="#3B8E2A" strokeWidth="1">
          <ellipse cx="30" cy="60" rx="6" ry="13" transform="rotate(-42 30 60)" />
          <ellipse cx="60" cy="58" rx="6" ry="13" transform="rotate(42 60 58)" />
          <ellipse cx="34" cy="80" rx="5" ry="12" transform="rotate(-32 34 80)" />
          <ellipse cx="56" cy="80" rx="5" ry="12" transform="rotate(32 56 80)" />
        </g>
        <g><circle cx="44" cy="40" r="9" fill="#FF6B9D" />
          <g fill="#FF8FAB"><ellipse cx="44" cy="30" rx="4" ry="6" /><ellipse cx="36" cy="38" rx="6" ry="4" /><ellipse cx="52" cy="38" rx="6" ry="4" /><ellipse cx="44" cy="48" rx="4" ry="5" /></g>
          <circle cx="44" cy="40" r="4" fill="#FFD54A" /></g>
        <g><circle cx="28" cy="54" r="6" fill="#FFD54A" /><circle cx="28" cy="54" r="2.5" fill="#E8A800" /></g>
        <g><circle cx="62" cy="52" r="6" fill="#9B7FE8" /><circle cx="62" cy="52" r="2.5" fill="#FFD54A" /></g>
      </svg>
    );
    case "painting": return (
      <svg viewBox="0 0 110 95" width="100%">
        <rect x="6" y="6" width="98" height="80" rx="4" fill="#C8874A" stroke="#8B5E2C" strokeWidth="3" />
        <rect x="11" y="11" width="88" height="70" rx="2" fill="#A06830" />
        <rect x="15" y="15" width="80" height="62" rx="1" fill="#B8E4F8" />
        <rect x="15" y="55" width="80" height="22" fill="#7BD862" />
        <path d="M15 55 Q35 44 55 52 Q75 60 95 50 L95 55 Z" fill="#6AC94F" />
        <polygon points="30,55 44,28 58,55" fill="#9FB0BA" />
        <polygon points="50,55 66,22 82,55" fill="#B7C4CB" />
        <polygon points="58,38 66,22 74,38" fill="#FFFFFF" />
        <circle cx="80" cy="26" r="8" fill="#FFD54A" />
        <g stroke="#FFD54A" strokeWidth="2" strokeLinecap="round"><line x1="80" y1="13" x2="80" y2="9" /><line x1="91" y1="26" x2="95" y2="26" /><line x1="88" y1="18" x2="91" y2="15" /></g>
        <ellipse cx="34" cy="22" rx="9" ry="4" fill="#FFFFFF" opacity="0.9" />
      </svg>
    );
    case "poster": return (
      <svg viewBox="0 0 80 110" width="100%">
        <rect x="6" y="4" width="68" height="100" rx="4" fill="#2A2150" stroke="#1A1238" strokeWidth="2" />
        <rect x="11" y="9" width="58" height="90" rx="2" fill="#3D2F6E" />
        <circle cx="40" cy="40" r="22" fill="#1A1238" />
        <circle cx="40" cy="40" r="16" fill="#9B7FE8" opacity="0.5" />
        <polygon points="40,16 45,34 63,34 49,45 54,62 40,51 26,62 31,45 17,34 35,34" fill="#FFD54A" stroke="#E8A800" strokeWidth="1" />
        <g fill="#FFFFFF"><circle cx="20" cy="22" r="1.5" /><circle cx="62" cy="20" r="1.5" /><circle cx="22" cy="60" r="1.5" /><circle cx="60" cy="58" r="1.5" /></g>
        <rect x="16" y="82" width="48" height="12" rx="2" fill="#1A1238" />
        <rect x="20" y="85" width="32" height="3" rx="1" fill="#9B7FE8" />
        <rect x="20" y="90" width="22" height="2.5" rx="1" fill="#7B5FD8" />
      </svg>
    );
    case "clock": return (
      <svg viewBox="0 0 90 100" width="100%">
        <circle cx="45" cy="50" r="42" fill="#C49A1A" />
        <circle cx="45" cy="50" r="38" fill="#FFD54A" stroke="#C49A1A" strokeWidth="2" />
        <circle cx="45" cy="50" r="32" fill="#FFF6E0" />
        <g stroke="#8B6030" strokeWidth="2.5" strokeLinecap="round"><line x1="45" y1="22" x2="45" y2="28" /><line x1="73" y1="50" x2="67" y2="50" /><line x1="45" y1="78" x2="45" y2="72" /><line x1="17" y1="50" x2="23" y2="50" /></g>
        <g stroke="#C49A1A" strokeWidth="1.5"><line x1="62" y1="32" x2="59" y2="35" /><line x1="62" y1="68" x2="59" y2="65" /><line x1="28" y1="68" x2="31" y2="65" /><line x1="28" y1="32" x2="31" y2="35" /></g>
        <polygon points="45,50 45,30 49,50" fill="#9B7FE8" />
        <polygon points="45,50 60,56 45,54" fill="#7B5FD8" />
        <circle cx="45" cy="50" r="4" fill="#7B5FD8" />
        <circle cx="45" cy="50" r="2" fill="#FFD54A" />
        <g fill="#9B7FE8"><circle cx="45" cy="33" r="1.6" /><circle cx="62" cy="50" r="1.6" /><circle cx="45" cy="67" r="1.6" /><circle cx="28" cy="50" r="1.6" /></g>
        <circle cx="45" cy="11" r="5" fill="#C49A1A" />
      </svg>
    );
    case "wallmirror": return (
      <svg viewBox="0 0 70 110" width="100%">
        <ellipse cx="35" cy="55" rx="32" ry="50" fill="#C49A1A" />
        <ellipse cx="35" cy="55" rx="28" ry="46" fill="#FFD54A" />
        <ellipse cx="35" cy="55" rx="23" ry="41" fill="#C9E9F5" />
        <ellipse cx="35" cy="55" rx="23" ry="41" fill="#B8E4F8" opacity="0.5" />
        <path d="M22 26 Q18 44 24 64" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <path d="M30 22 Q27 32 29 42" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <circle cx="35" cy="9" r="6" fill="#C49A1A" />
        <circle cx="35" cy="9" r="3" fill="#FFD54A" />
        <g fill="#FF8FAB"><circle cx="14" cy="40" r="2.5" /><circle cx="56" cy="70" r="2.5" /></g>
      </svg>
    );
    case "trophy": return (
      <svg viewBox="0 0 90 100" width="100%">
        <ellipse cx="45" cy="90" rx="30" ry="7" fill="#000" opacity="0.08" />
        <rect x="30" y="84" width="30" height="8" rx="2" fill="#C49A1A" />
        <path d="M22 24 L24 56 Q24 76 45 76 Q66 76 66 56 L68 24 Z" fill="#FFD54A" stroke="#C49A1A" strokeWidth="2.5" />
        <path d="M22 26 Q12 26 10 40 Q9 54 20 56" fill="none" stroke="#C49A1A" strokeWidth="3" />
        <path d="M68 26 Q78 26 80 40 Q81 54 70 56" fill="none" stroke="#C49A1A" strokeWidth="3" />
        <rect x="18" y="18" width="54" height="10" rx="3" fill="#E8A800" />
        <rect x="24" y="30" width="42" height="40" rx="6" fill="#C49A1A" opacity="0.25" />
        <ellipse cx="38" cy="40" rx="6" ry="10" fill="#FFFFFF" opacity="0.55" />
        <path d="M30 60 Q45 68 60 60" fill="none" stroke="#FFF6E0" strokeWidth="2" opacity="0.6" />
      </svg>
    );
    case "galaxy": return (
      <svg viewBox="0 0 100 100" width="100%">
        <circle cx="50" cy="50" r="46" fill="#1A1238" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#3D2F6E" strokeWidth="3" />
        <circle cx="50" cy="50" r="40" fill="#241A48" />
        <ellipse cx="50" cy="50" rx="38" ry="13" fill="none" stroke="#9B7FE8" strokeWidth="2" opacity="0.7" />
        <ellipse cx="50" cy="50" rx="38" ry="13" fill="none" stroke="#C4AEFF" strokeWidth="1" opacity="0.5" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="50" rx="38" ry="13" fill="none" stroke="#C4AEFF" strokeWidth="1" opacity="0.5" transform="rotate(-30 50 50)" />
        <circle cx="50" cy="50" r="9" fill="#C4AEFF" />
        <circle cx="50" cy="50" r="9" fill="#9B7FE8" opacity="0.6" />
        <circle cx="47" cy="47" r="3" fill="#E6DBFF" />
        <g fill="#FFFFFF"><circle cx="26" cy="30" r="1.6" /><circle cx="74" cy="28" r="1.6" /><circle cx="30" cy="72" r="1.6" /><circle cx="72" cy="70" r="1.6" /><circle cx="20" cy="52" r="1.3" /><circle cx="80" cy="50" r="1.3" /><circle cx="50" cy="20" r="1.3" /></g>
        <polygon points="68,38 69,41 72,41 70,43 71,46 68,44 65,46 66,43 64,41 67,41" fill="#FFD54A" />
      </svg>
    );
    case "wand": return (
      <svg viewBox="0 0 150 150" width="100%">
        <g transform="rotate(-30 75 75)">
          <ellipse cx="75" cy="98" rx="68" ry="4" fill="#000" opacity="0.05" />
          <path d="M60 71 L138 66 Q146 65.5 146 69.5 Q146 73.5 138 74 L62 79 Q57 75 60 71 Z" fill="#A0703C" stroke="#6B4420" strokeWidth="1.5" />
          <path d="M136 66 Q143 65.5 145 62.5 L146 68.5 Q143 72.5 137 72.5 Z" fill="#8B5E2C" />
          <path d="M60 73 Q56 71 60 69 L62 69 L62 78 L60 78 Q56 76 60 73 Z" fill="#6B4420" />
          <path d="M58 69 Q48 63 34 67 Q40 71 50 71 Q32 75 20 82 Q36 80 46 75 Q26 84 16 95 Q36 89 50 79 Q34 95 30 108 Q50 96 58 82 Q54 98 60 110 Q70 94 66 78 Q64 90 70 76 Z" fill="#C8874A" stroke="#8B5E2C" strokeWidth="1.5" />
          <g stroke="#A0612A" strokeWidth="1" opacity="0.75" fill="none">
            <path d="M58 73 Q44 75 30 84" /><path d="M59 76 Q46 80 34 92" /><path d="M60 79 Q50 86 44 100" /><path d="M61 81 Q56 92 56 106" /><path d="M58 71 Q42 70 28 74" /><path d="M59 78 Q48 84 38 96" />
          </g>
          <rect x="56" y="66" width="13" height="16" rx="2" fill="#F5C842" stroke="#C49A1A" strokeWidth="1.5" transform="rotate(-6 62 74)" />
          <rect x="58" y="68" width="3" height="12" fill="#E8B020" transform="rotate(-6 62 74)" />
        </g>
      </svg>
    );
    case "sortinghat": return (
      <svg viewBox="0 0 130 145" width="100%">
        <ellipse cx="65" cy="135" rx="54" ry="8" fill="#000" opacity="0.1" />
        <path d="M10 116 Q4 108 18 105 Q40 99 65 100 Q90 99 112 105 Q126 108 120 116 Q98 124 65 123 Q32 124 10 116 Z" fill="#6B5638" stroke="#3E3018" strokeWidth="2.5" />
        <path d="M40 108 Q34 70 44 42 Q52 18 65 14 Q78 18 86 42 Q96 70 90 108 Q78 112 65 111 Q52 112 40 108 Z" fill="#7A6240" stroke="#3E3018" strokeWidth="2.5" />
        <rect x="40" y="96" width="50" height="14" rx="3" fill="#5E4A2E" stroke="#3E3018" strokeWidth="2" />
        <rect x="54" y="94" width="22" height="18" rx="3" fill="#F5C842" stroke="#C49A1A" strokeWidth="2.5" />
        <rect x="61" y="94" width="8" height="18" fill="#E8B020" />
        <path d="M48 64 Q54 58 62 63" fill="none" stroke="#2E2410" strokeWidth="3" strokeLinecap="round" />
        <path d="M68 63 Q76 58 82 64" fill="none" stroke="#2E2410" strokeWidth="3" strokeLinecap="round" />
        <circle cx="55" cy="72" r="3" fill="#2E2410" />
        <circle cx="75" cy="72" r="3" fill="#2E2410" />
        <path d="M52 86 Q65 80 78 86" fill="none" stroke="#2E2410" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
    case "wizardmap": return (
      <svg viewBox="0 0 90 100" width="100%">
        <ellipse cx="45" cy="92" rx="30" ry="6" fill="#000" opacity="0.08" />
        <path d="M12 16 L12 84 Q14 80 22 82 L68 82 Q76 80 78 84 L78 16 Q76 20 68 18 L22 18 Q14 20 12 16 Z" fill="#E8D5A8" stroke="#C4A860" strokeWidth="2" />
        <path d="M20 18 L20 82" stroke="#C4A860" strokeWidth="1" opacity="0.5" />
        <path d="M70 18 L70 82" stroke="#C4A860" strokeWidth="1" opacity="0.5" />
        <path d="M26 34 Q38 28 50 34 Q62 40 66 32" fill="none" stroke="#8B6030" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M24 50 Q36 56 48 50 Q60 44 64 52" fill="none" stroke="#8B6030" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M28 64 Q40 60 52 66" fill="none" stroke="#8B6030" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="32" cy="40" r="3" fill="#E85454" />
        <circle cx="56" cy="56" r="3" fill="#4DAF35" />
        <polygon points="44,68 46,73 51,73 47,76 49,81 44,78 39,81 41,76 37,73 42,73" fill="#FFD54A" stroke="#C49A00" strokeWidth="0.5" />
        <rect x="8" y="12" width="9" height="76" rx="4" fill="#C4A860" />
        <rect x="73" y="12" width="9" height="76" rx="4" fill="#C4A860" />
      </svg>
    );
    case "fishbowl": return (
      <svg viewBox="0 0 90 100" width="100%">
        <ellipse cx="45" cy="92" rx="28" ry="6" fill="#000" opacity="0.08" />
        <rect x="28" y="84" width="34" height="9" rx="3" fill="#C4864A" />
        <rect x="33" y="80" width="24" height="6" rx="2" fill="#8B5E2C" />
        <path d="M14 52 Q14 18 45 18 Q76 18 76 52 Q76 80 45 82 Q14 80 14 52 Z" fill="#C9E9F5" stroke="#9FD4E8" strokeWidth="2" />
        <path d="M16 58 Q45 50 74 58 L74 70 Q45 80 16 70 Z" fill="#5BA0E9" opacity="0.55" />
        <path d="M16 58 Q30 54 45 57" fill="none" stroke="#A8DCF0" strokeWidth="2" opacity="0.8" />
        <g transform="translate(40 56)">
          <ellipse cx="0" cy="0" rx="14" ry="8" fill="#FF8C42" />
          <polygon points="12,0 24,-8 24,8" fill="#FF8C42" />
          <polygon points="14,-2 21,-7 20,-1" fill="#FFB07A" />
          <circle cx="-6" cy="-2" r="2" fill="#2A1A05" />
          <path d="M-14 0 Q-20 -3 -24 0 Q-20 3 -14 0" fill="#FFB07A" />
        </g>
        <g fill="#FFFFFF" opacity="0.85"><circle cx="58" cy="44" r="1.8" /><circle cx="50" cy="38" r="1.4" /><circle cx="62" cy="52" r="1.4" /></g>
        <ellipse cx="32" cy="34" rx="7" ry="10" fill="#FFFFFF" opacity="0.35" />
      </svg>
    );
    case "gardenbed": return (
      <svg viewBox="0 0 120 100" width="100%">
        <ellipse cx="60" cy="92" rx="52" ry="7" fill="#000" opacity="0.07" />
        <path d="M14 50 L106 50 L100 88 L20 88 Z" fill="#A06830" stroke="#6B4420" strokeWidth="2" />
        <rect x="10" y="44" width="100" height="12" rx="3" fill="#C8874A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="8" y="40" width="16" height="50" rx="3" fill="#B07D45" stroke="#7A4A1E" strokeWidth="2" />
        <rect x="96" y="40" width="16" height="50" rx="3" fill="#B07D45" stroke="#7A4A1E" strokeWidth="2" />
        <rect x="24" y="52" width="72" height="14" fill="#5A3A1A" />
        <g><line x1="36" y1="54" x2="36" y2="30" stroke="#4DAF35" strokeWidth="3" /><path d="M36 30 Q28 26 30 18 Q38 22 36 30" fill="#5DBE4A" /><path d="M36 30 Q44 26 42 18 Q34 22 36 30" fill="#6AC94F" /></g>
        <g><line x1="54" y1="54" x2="54" y2="26" stroke="#4DAF35" strokeWidth="3" /><path d="M54 26 Q46 22 48 12 Q56 18 54 26" fill="#5DBE4A" /><path d="M54 26 Q62 22 60 12 Q52 18 54 26" fill="#6AC94F" /><path d="M54 26 Q54 18 54 10 Q58 18 54 26" fill="#7BD862" /></g>
        <g><line x1="72" y1="54" x2="72" y2="30" stroke="#4DAF35" strokeWidth="3" /><path d="M72 30 Q64 26 66 18 Q74 22 72 30" fill="#5DBE4A" /><path d="M72 30 Q80 26 78 18 Q70 22 72 30" fill="#6AC94F" /></g>
        <g><line x1="88" y1="54" x2="88" y2="32" stroke="#4DAF35" strokeWidth="3" /><circle cx="88" cy="30" r="6" fill="#E85454" /><circle cx="86" cy="28" r="2" fill="#FF8080" opacity="0.7" /></g>
      </svg>
    );
    case "flowerbed": return (
      <svg viewBox="0 0 130 90" width="100%">
        <ellipse cx="65" cy="80" rx="60" ry="10" fill="#7BD862" opacity="0.5" />
        <path d="M8 70 Q30 58 65 60 Q100 58 122 70 Q100 80 65 80 Q30 80 8 70 Z" fill="#8B5E2C" />
        <path d="M14 68 Q40 60 65 62 Q90 60 116 68 Q90 74 65 74 Q40 74 14 68 Z" fill="#6B4420" />
        <g><line x1="26" y1="68" x2="26" y2="44" stroke="#4DAF35" strokeWidth="2.5" /><circle cx="26" cy="40" r="8" fill="#FF6B9D" /><circle cx="26" cy="40" r="3.5" fill="#FFD54A" /></g>
        <g><line x1="44" y1="70" x2="44" y2="38" stroke="#4DAF35" strokeWidth="2.5" /><g fill="#9B7FE8"><ellipse cx="44" cy="30" rx="4" ry="7" /><ellipse cx="38" cy="36" rx="7" ry="4" /><ellipse cx="50" cy="36" rx="7" ry="4" /><ellipse cx="44" cy="42" rx="4" ry="6" /></g><circle cx="44" cy="36" r="3" fill="#FFD54A" /></g>
        <g><line x1="65" y1="72" x2="65" y2="42" stroke="#4DAF35" strokeWidth="2.5" /><circle cx="65" cy="38" r="8" fill="#FF8FAB" /><circle cx="65" cy="38" r="3.5" fill="#FFD54A" /></g>
        <g><line x1="86" y1="70" x2="86" y2="38" stroke="#4DAF35" strokeWidth="2.5" /><g fill="#74B3FF"><ellipse cx="86" cy="30" rx="4" ry="7" /><ellipse cx="80" cy="36" rx="7" ry="4" /><ellipse cx="92" cy="36" rx="7" ry="4" /><ellipse cx="86" cy="42" rx="4" ry="6" /></g><circle cx="86" cy="36" r="3" fill="#FFD54A" /></g>
        <g><line x1="104" y1="68" x2="104" y2="44" stroke="#4DAF35" strokeWidth="2.5" /><circle cx="104" cy="40" r="8" fill="#FFD54A" /><circle cx="104" cy="40" r="3.5" fill="#E8A800" /></g>
        <ellipse cx="20" cy="66" rx="5" ry="3" fill="#6AC94F" />
        <ellipse cx="112" cy="66" rx="5" ry="3" fill="#6AC94F" />
      </svg>
    );
    case "fountain": return (
      <svg viewBox="0 0 90 130" width="100%">
        <ellipse cx="45" cy="118" rx="40" ry="9" fill="#000" opacity="0.08" />
        <ellipse cx="45" cy="110" rx="42" ry="14" fill="#9FB0BA" />
        <ellipse cx="45" cy="106" rx="42" ry="13" fill="#C0CDD4" />
        <ellipse cx="45" cy="105" rx="34" ry="9" fill="#87CEEB" />
        <ellipse cx="45" cy="103" rx="28" ry="6" fill="#A8DCF0" />
        <rect x="40" y="64" width="10" height="42" fill="#B7C4CB" />
        <ellipse cx="45" cy="62" rx="24" ry="8" fill="#9FB0BA" />
        <ellipse cx="45" cy="60" rx="24" ry="7" fill="#C0CDD4" />
        <ellipse cx="45" cy="59" rx="17" ry="4.5" fill="#87CEEB" />
        <rect x="42" y="36" width="6" height="24" fill="#B7C4CB" />
        <circle cx="45" cy="32" r="7" fill="#C0CDD4" />
        <path d="M45 30 Q38 18 45 12 Q52 18 45 30" fill="#A8DCF0" opacity="0.85" />
        <path d="M30 56 Q26 70 33 82" fill="none" stroke="#A8DCF0" strokeWidth="2" opacity="0.7" />
        <path d="M60 56 Q64 70 57 82" fill="none" stroke="#A8DCF0" strokeWidth="2" opacity="0.7" />
      </svg>
    );
    case "gardengnome": return (
      <svg viewBox="0 0 70 110" width="100%">
        <ellipse cx="35" cy="102" rx="26" ry="7" fill="#000" opacity="0.08" />
        <path d="M18 100 Q14 70 35 64 Q56 70 52 100 Z" fill="#5DBE4A" stroke="#3B8E2A" strokeWidth="2" />
        <rect x="24" y="92" width="9" height="10" fill="#6AC94F" />
        <rect x="37" y="92" width="9" height="10" fill="#6AC94F" />
        <ellipse cx="35" cy="52" rx="15" ry="16" fill="#E8B98E" />
        <path d="M22 56 Q35 72 48 56 Q44 70 35 72 Q26 70 22 56 Z" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
        <circle cx="29" cy="50" r="2.2" fill="#3A2A1A" />
        <circle cx="41" cy="50" r="2.2" fill="#3A2A1A" />
        <ellipse cx="35" cy="58" rx="4" ry="3" fill="#FF8FAB" />
        <path d="M16 40 L54 40 L35 8 Z" fill="#E85454" stroke="#C03030" strokeWidth="2" />
        <ellipse cx="35" cy="40" rx="19" ry="5" fill="#F5F5F5" />
      </svg>
    );
    case "birdbath": return (
      <svg viewBox="0 0 80 110" width="100%">
        <ellipse cx="40" cy="102" rx="28" ry="7" fill="#000" opacity="0.08" />
        <path d="M30 60 L26 100 L54 100 L50 60 Z" fill="#B7C4CB" />
        <rect x="22" y="96" width="36" height="8" rx="3" fill="#9FB0BA" />
        <ellipse cx="40" cy="40" rx="34" ry="14" fill="#9FB0BA" />
        <ellipse cx="40" cy="37" rx="34" ry="13" fill="#C0CDD4" />
        <ellipse cx="40" cy="36" rx="26" ry="9" fill="#87CEEB" />
        <ellipse cx="40" cy="34" rx="20" ry="6" fill="#A8DCF0" />
        <g><ellipse cx="56" cy="30" rx="6" ry="4" fill="#F5C842" /><circle cx="52" cy="28" r="2" fill="#3A2A1A" /><path d="M61 30 L68 28" stroke="#F5C842" strokeWidth="2.5" /></g>
      </svg>
    );
    case "pond": return (
      <svg viewBox="0 0 130 80" width="100%">
        <ellipse cx="65" cy="44" rx="60" ry="32" fill="#6AA84F" />
        <ellipse cx="65" cy="42" rx="54" ry="28" fill="#3B7BC0" />
        <ellipse cx="65" cy="40" rx="48" ry="24" fill="#5BA0E9" />
        <ellipse cx="48" cy="32" rx="14" ry="6" fill="#FFFFFF" opacity="0.3" />
        <g><ellipse cx="44" cy="44" rx="10" ry="6" fill="#5DBE4A" /><ellipse cx="42" cy="42" rx="4" ry="2.5" fill="#7BD862" /></g>
        <g><ellipse cx="82" cy="48" rx="9" ry="5" fill="#5DBE4A" /></g>
        <circle cx="90" cy="36" r="4" fill="#FF8FAB" />
        <circle cx="90" cy="36" r="1.8" fill="#FFD54A" />
        <g stroke="#3B7BC0" strokeWidth="1.5" fill="none" opacity="0.5"><path d="M30 40 Q34 38 38 40" /><path d="M95 46 Q99 44 103 46" /></g>
      </svg>
    );
    case "swingset": return (
      <svg viewBox="0 0 110 110" width="100%">
        <line x1="16" y1="98" x2="30" y2="14" stroke="#A06830" strokeWidth="6" strokeLinecap="round" />
        <line x1="94" y1="98" x2="80" y2="14" stroke="#A06830" strokeWidth="6" strokeLinecap="round" />
        <line x1="22" y1="16" x2="88" y2="16" stroke="#8B5E2C" strokeWidth="7" strokeLinecap="round" />
        <line x1="40" y1="18" x2="40" y2="64" stroke="#7A7A7A" strokeWidth="2.5" />
        <line x1="70" y1="18" x2="70" y2="64" stroke="#7A7A7A" strokeWidth="2.5" />
        <rect x="33" y="64" width="44" height="9" rx="4" fill="#F5C842" stroke="#C89A1A" strokeWidth="1.5" />
        <line x1="46" y1="18" x2="46" y2="58" stroke="#7A7A7A" strokeWidth="2.5" />
        <line x1="64" y1="18" x2="64" y2="58" stroke="#7A7A7A" strokeWidth="2.5" />
        <rect x="42" y="58" width="26" height="8" rx="4" fill="#E85454" stroke="#C03030" strokeWidth="1.5" />
      </svg>
    );
    case "wateringcan": return (
      <svg viewBox="0 0 70 90" width="100%">
        <ellipse cx="35" cy="82" rx="24" ry="6" fill="#000" opacity="0.08" />
        <path d="M14 44 Q12 40 16 38 L48 38 Q54 38 54 46 L54 74 Q54 80 46 80 L20 80 Q14 80 14 74 Z" fill="#5DBE4A" stroke="#3B8E2A" strokeWidth="2" />
        <rect x="14" y="44" width="40" height="6" fill="#7BD862" />
        <path d="M48 38 L66 30 L66 36 L54 46" fill="#4DAF35" stroke="#3B8E2A" strokeWidth="1.5" />
        <g fill="#3B8E2A"><circle cx="60" cy="32" r="1.4" /><circle cx="62" cy="34" r="1.4" /><circle cx="58" cy="35" r="1.4" /></g>
        <path d="M12 50 Q4 50 6 60 Q8 56 12 58" fill="none" stroke="#5DBE4A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
    case "trampoline": return (
      <svg viewBox="0 0 120 80" width="100%">
        <ellipse cx="60" cy="56" rx="50" ry="18" fill="#3B8E2A" />
        <ellipse cx="60" cy="50" rx="50" ry="18" fill="#5DBE4A" />
        <ellipse cx="60" cy="48" rx="40" ry="13" fill="#7BD862" />
        <ellipse cx="60" cy="46" rx="40" ry="12" fill="#A8E08A" />
        <line x1="18" y1="48" x2="14" y2="74" stroke="#7A7A7A" strokeWidth="4" strokeLinecap="round" />
        <line x1="102" y1="48" x2="106" y2="74" stroke="#7A7A7A" strokeWidth="4" strokeLinecap="round" />
        <line x1="38" y1="52" x2="36" y2="72" stroke="#9A9A9A" strokeWidth="3" strokeLinecap="round" />
        <line x1="82" y1="52" x2="84" y2="72" stroke="#9A9A9A" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="60" cy="46" rx="40" ry="12" fill="none" stroke="#4DAF35" strokeWidth="2" strokeDasharray="3 4" opacity="0.6" />
      </svg>
    );
    case "hammock": return (
      <svg viewBox="0 0 130 90" width="100%">
        <line x1="14" y1="14" x2="14" y2="78" stroke="#8B5E2C" strokeWidth="7" strokeLinecap="round" />
        <line x1="116" y1="14" x2="116" y2="78" stroke="#8B5E2C" strokeWidth="7" strokeLinecap="round" />
        <line x1="14" y1="20" x2="36" y2="34" stroke="#A06830" strokeWidth="3" />
        <line x1="116" y1="20" x2="94" y2="34" stroke="#A06830" strokeWidth="3" />
        <path d="M30 34 Q65 80 100 34" fill="#FF8FAB" stroke="#E0758F" strokeWidth="2" />
        <path d="M30 34 Q65 70 100 34" fill="none" stroke="#FFB3C6" strokeWidth="2" opacity="0.7" />
        <g stroke="#E0758F" strokeWidth="1.5" opacity="0.6">
          <path d="M42 40 Q44 56 50 64" fill="none" /><path d="M58 44 Q59 60 62 68" fill="none" /><path d="M72 44 Q73 60 70 68" fill="none" /><path d="M88 40 Q86 56 82 64" fill="none" />
        </g>
        <rect x="30" y="32" width="70" height="5" rx="2" fill="#E0758F" />
      </svg>
    );
    case "snitch": return (
      <svg viewBox="0 0 90 70" width="100%">
        <path d="M44 35 Q24 10 4 14 Q12 24 22 28 Q12 32 8 42 Q26 42 44 35 Z" fill="#F5F0E0" stroke="#C4A860" strokeWidth="1.5" />
        <path d="M46 35 Q66 10 86 14 Q78 24 68 28 Q78 32 82 42 Q64 42 46 35 Z" fill="#F5F0E0" stroke="#C4A860" strokeWidth="1.5" />
        <line x1="20" y1="18" x2="30" y2="30" stroke="#C4A860" strokeWidth="1" />
        <line x1="70" y1="18" x2="60" y2="30" stroke="#C4A860" strokeWidth="1" />
        <circle cx="45" cy="35" r="18" fill="#FFD54A" stroke="#C49A00" strokeWidth="2.5" />
        <circle cx="45" cy="35" r="13" fill="#FFE066" />
        <path d="M32 35 Q45 28 58 35" fill="none" stroke="#C49A00" strokeWidth="1.5" opacity="0.6" />
        <ellipse cx="39" cy="29" rx="4" ry="5" fill="#FFFFFF" opacity="0.6" />
      </svg>
    );
    case "gamingconsole": return (
      <svg viewBox="0 0 110 90" width="100%">
        <ellipse cx="55" cy="82" rx="42" ry="6" fill="#000" opacity="0.08" />
        <rect x="14" y="30" width="82" height="48" rx="10" fill="#2A2A3E" stroke="#1A1A2E" strokeWidth="2" />
        <rect x="22" y="38" width="34" height="26" rx="4" fill="#4A90D9" />
        <rect x="26" y="42" width="20" height="12" rx="2" fill="#6FB0E8" opacity="0.7" />
        <circle cx="74" cy="44" r="6" fill="#E85454" />
        <circle cx="86" cy="50" r="6" fill="#5DBE4A" />
        <circle cx="68" cy="56" r="5" fill="#FFD54A" />
        <circle cx="80" cy="62" r="5" fill="#9B7FE8" />
        <rect x="30" y="68" width="50" height="6" rx="3" fill="#1A1A2E" />
        <rect x="40" y="20" width="6" height="12" fill="#555" />
        <rect x="64" y="20" width="6" height="12" fill="#555" />
        <rect x="36" y="14" width="14" height="8" rx="3" fill="#4A90D9" />
        <rect x="60" y="14" width="14" height="8" rx="3" fill="#E85454" />
      </svg>
    );
    case "wallshelf": return (
      <svg viewBox="0 0 120 80" width="100%">
        <rect x="10" y="40" width="100" height="10" rx="3" fill="#C4864A" stroke="#8B5E2C" strokeWidth="2" />
        <path d="M18 50 L26 64 L32 50 Z" fill="#8B5E2C" />
        <path d="M88 50 L96 64 L102 50 Z" fill="#8B5E2C" />
        <rect x="24" y="14" width="11" height="26" rx="2" fill="#FF6B9D" />
        <rect x="37" y="20" width="11" height="20" rx="2" fill="#9B7FE8" />
        <rect x="50" y="16" width="11" height="24" rx="2" fill="#5DBE4A" />
        <rect x="63" y="22" width="11" height="18" rx="2" fill="#FFD54A" />
        <circle cx="90" cy="28" r="11" fill="#78D660" />
        <circle cx="90" cy="20" r="6" fill="#FF8FAB" />
        <rect x="84" y="36" width="12" height="6" rx="2" fill="#E07B4A" />
      </svg>
    );
    default: return (
      <svg viewBox="0 0 70 80" width="100%">
        <rect x="14" y="34" width="42" height="36" rx="8" fill="#9B7FE8" opacity="0.85" />
        <text x="35" y="26" textAnchor="middle" fontSize="9" fill="#5A40B0" fontFamily="sans-serif">soon</text>
      </svg>
    );
  }
}

function CoinSVG({ size = 24 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="11" ry="11" fill="#F5C842" stroke="#C49A1A" strokeWidth="1.5" /><ellipse cx="12" cy="12" rx="8" ry="8" fill="#FFE066" stroke="#C49A1A" strokeWidth="1" /><ellipse cx="10" cy="10" rx="3" ry="3" fill="#FFE899" opacity="0.7" /></svg>);
}
function GemSVG({ size = 24 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24"><polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="#9B7FE8" stroke="#6A4FC4" strokeWidth="1.5" /><polygon points="12,2 22,8 12,10 2,8" fill="#C4AEFF" /><polygon points="12,10 22,8 22,16 12,22" fill="#7B5FD8" /><polygon points="12,10 2,8 2,16 12,22" fill="#8B6FE8" /></svg>);
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div style={{ width: "100%", height: "100vh", background: "#FFB3C6", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "var(--font-game)", fontSize: 24, color: "white" }}>Loading room...</span></div>}>
      <RoomContent />
    </Suspense>
  );
}