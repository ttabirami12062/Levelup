"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/lib/gameContext";

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

const getStorageKey = (roomId: number) => `levelup_flat_room_${roomId}`;
const OWNED_KEY = "levelup_flat_owned";

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
  { id: "wand",       name: "Magic Wand",   category: "special",   price: 300, currency: "coins", footprint: { w: 1, d: 1 } },
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
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(roomId));
    const owned = localStorage.getItem(OWNED_KEY);
    if (saved) {
      setPlacedItems(JSON.parse(saved));
    } else if (roomId === 1) {
      setPlacedItems([
        { itemId: "rug",    x: 0.5,  y: 0.80 },
        { itemId: "bed",    x: 0.26, y: 0.74 },
        { itemId: "window", x: 0.72, y: 0.30 },
        { itemId: "door",   x: 0.92, y: 0.55 },
        { itemId: "plant",  x: 0.10, y: 0.86 },
      ]);
    } else {
      setPlacedItems([
        { itemId: "window", x: 0.30, y: 0.30 },
        { itemId: "door",   x: 0.90, y: 0.55 },
      ]);
    }
    if (owned) setOwnedItems([...new Set([...FREE_ITEMS, ...JSON.parse(owned)])]);
  }, [roomId]);

  useEffect(() => {
    if (placedItems.length > 0) {
      localStorage.setItem(getStorageKey(roomId), JSON.stringify(placedItems));
    }
  }, [placedItems, roomId]);

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
          onClick={() => setSelected(null)}
        >
          <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none">
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
                onClick={(e) => { e.stopPropagation(); setSelected(isSel ? null : p.itemId); }}
              >
                <FlatSprite id={p.itemId} room={room} />
                {isSel && (
                  <button onClick={(e) => { e.stopPropagation(); removeItem(p.itemId); }} style={{ position: "absolute", top: -10, right: -4, width: 22, height: 22, background: "#E85454", border: "2px solid white", borderRadius: "50%", color: "white", fontSize: 13, cursor: "pointer", lineHeight: 1 }}>×</button>
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
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 12px", scrollbarWidth: "none" }}>
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
  door:       { w: 96,  h: 200 },
  window:     { w: 150, h: 150 },
};

function FlatSprite({ id, room }: { id: string; room: typeof ROOMS[0] }) {
  switch (id) {
    case "bed": return (
      <svg viewBox="0 0 200 130" width="100%">
        {/* headboard */}
        <rect x="6" y="22" width="30" height="96" rx="8" fill="#A6743A" stroke="#7A4A1E" strokeWidth="3" />
        {/* base / frame */}
        <rect x="20" y="78" width="174" height="40" rx="8" fill="#8B5E2C" />
        <rect x="20" y="108" width="174" height="14" rx="5" fill="#6D4520" />
        {/* mattress */}
        <rect x="30" y="58" width="160" height="30" rx="10" fill="#FFFFFF" stroke="#E6E6E6" strokeWidth="2" />
        {/* duvet */}
        <rect x="78" y="62" width="116" height="30" rx="8" fill="#74B3FF" stroke="#5B8CFF" strokeWidth="2" />
        <path d="M78 70 Q136 62 194 70" fill="none" stroke="#5B8CFF" strokeWidth="2" opacity="0.7" />
        {/* pillow */}
        <rect x="38" y="50" width="48" height="26" rx="10" fill="#FF8FAB" stroke="#FF6B9D" strokeWidth="2" />
        {/* legs */}
        <rect x="28" y="118" width="10" height="10" fill="#6D4520" />
        <rect x="176" y="118" width="10" height="10" fill="#6D4520" />
      </svg>
    );
    case "desk": return (
      <svg viewBox="0 0 110 120" width="100%">
        <rect x="8" y="60" width="94" height="14" rx="4" fill="#D4956A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="14" y="74" width="12" height="38" fill="#A06830" />
        <rect x="84" y="74" width="12" height="38" fill="#A06830" />
        <rect x="30" y="74" width="44" height="38" rx="3" fill="#C4864A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="36" y="84" width="32" height="4" rx="2" fill="#8B5E2C" />
        <rect x="36" y="96" width="32" height="4" rx="2" fill="#8B5E2C" />
        {/* lamp */}
        <line x1="74" y1="60" x2="74" y2="34" stroke="#888" strokeWidth="3" />
        <path d="M62 34 Q74 18 88 34 Z" fill="#FFD700" stroke="#C49A00" strokeWidth="2" />
        <ellipse cx="74" cy="36" rx="14" ry="4" fill="#FFE566" />
      </svg>
    );
    case "plant": return (
      <svg viewBox="0 0 70 120" width="100%">
        <path d="M22 86 L48 86 L43 114 L27 114 Z" fill="#E07B4A" stroke="#B85A2C" strokeWidth="2" />
        <rect x="22" y="82" width="26" height="8" rx="3" fill="#C8632F" />
        {/* leaves */}
        <path d="M35 84 Q14 60 20 34 Q34 52 35 84" fill="#6AC94F" stroke="#4DAF35" strokeWidth="1.5" />
        <path d="M35 84 Q56 60 50 34 Q36 52 35 84" fill="#78D660" stroke="#4DAF35" strokeWidth="1.5" />
        <path d="M35 84 Q35 50 35 26 Q44 48 35 84" fill="#8BE06A" stroke="#4DAF35" strokeWidth="1.5" />
      </svg>
    );
    case "sofa": return (
      <svg viewBox="0 0 180 110" width="100%">
        {/* back cushions */}
        <rect x="24" y="26" width="132" height="40" rx="12" fill="#C4AEFF" stroke="#9B7FE8" strokeWidth="2" />
        <line x1="90" y1="30" x2="90" y2="62" stroke="#9B7FE8" strokeWidth="2" opacity="0.6" />
        {/* arms */}
        <rect x="8" y="44" width="28" height="50" rx="12" fill="#9B7FE8" />
        <rect x="144" y="44" width="28" height="50" rx="12" fill="#9B7FE8" />
        {/* seat */}
        <rect x="30" y="58" width="120" height="36" rx="10" fill="#B09AFF" />
        <line x1="90" y1="60" x2="90" y2="92" stroke="#9B7FE8" strokeWidth="2" opacity="0.5" />
        {/* throw pillows */}
        <rect x="42" y="50" width="30" height="24" rx="7" fill="#FF8FAB" opacity="0.95" transform="rotate(-8 57 62)" />
        <rect x="110" y="50" width="30" height="24" rx="7" fill="#FFD700" opacity="0.95" transform="rotate(8 125 62)" />
        {/* legs */}
        <rect x="22" y="94" width="10" height="12" fill="#7B5FD8" />
        <rect x="148" y="94" width="10" height="12" fill="#7B5FD8" />
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
      <svg viewBox="0 0 64 160" width="100%">
        <ellipse cx="32" cy="146" rx="20" ry="8" fill="#A0612A" />
        <rect x="29" y="46" width="6" height="100" fill="#999" />
        <path d="M10 46 L54 46 L46 16 L18 16 Z" fill="#FFD700" stroke="#C49A00" strokeWidth="2" />
        <rect x="18" y="14" width="28" height="5" rx="2" fill="#FFE566" />
        <ellipse cx="32" cy="48" rx="22" ry="5" fill="#FFE566" opacity="0.9" />
      </svg>
    );
    case "rug": return (
      <svg viewBox="0 0 200 76" width="100%">
        <ellipse cx="100" cy="38" rx="96" ry="32" fill="#9B7FE8" stroke="#7B5FD8" strokeWidth="3" />
        <ellipse cx="100" cy="38" rx="74" ry="23" fill="#B09AFF" />
        <ellipse cx="100" cy="38" rx="50" ry="15" fill="#C4AEFF" />
        <ellipse cx="100" cy="38" rx="26" ry="8" fill="#D9C9FF" />
      </svg>
    );
    case "armchair": return (
      <svg viewBox="0 0 100 110" width="100%">
        <rect x="28" y="26" width="44" height="40" rx="12" fill="#FFB3C6" stroke="#FF6B9D" strokeWidth="2" />
        <rect x="10" y="44" width="22" height="50" rx="11" fill="#E0758F" />
        <rect x="68" y="44" width="22" height="50" rx="11" fill="#E0758F" />
        <rect x="26" y="58" width="48" height="34" rx="9" fill="#FF8FAB" />
        <rect x="20" y="94" width="9" height="12" fill="#CC6680" />
        <rect x="71" y="94" width="9" height="12" fill="#CC6680" />
      </svg>
    );
    case "coffeetable": return (
      <svg viewBox="0 0 120 78" width="100%">
        <ellipse cx="60" cy="30" rx="52" ry="14" fill="#D4956A" stroke="#8B5E2C" strokeWidth="2" />
        <ellipse cx="60" cy="27" rx="44" ry="10" fill="#E0A878" opacity="0.6" />
        <rect x="22" y="36" width="9" height="32" fill="#A06830" />
        <rect x="89" y="36" width="9" height="32" fill="#A06830" />
        <rect x="40" y="40" width="9" height="28" fill="#8B5E2C" opacity="0.7" />
        {/* a little vase */}
        <rect x="52" y="14" width="14" height="14" rx="3" fill="#FF8FAB" />
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
        <ellipse cx="45" cy="80" rx="38" ry="13" fill="#CC6680" opacity="0.5" />
        <path d="M10 70 Q6 36 45 30 Q84 36 80 70 Q66 88 45 88 Q24 88 10 70 Z" fill="#FFB3C6" stroke="#FF6B9D" strokeWidth="2.5" />
        <path d="M22 44 Q45 36 68 44" fill="none" stroke="#FF8FAB" strokeWidth="3" opacity="0.7" />
        <ellipse cx="32" cy="54" rx="11" ry="14" fill="rgba(255,255,255,0.3)" />
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
        <ellipse cx="50" cy="40" rx="30" ry="36" fill="#FFE066" stroke="#C4864A" strokeWidth="5" />
        <ellipse cx="50" cy="40" rx="22" ry="28" fill="#B8E4F8" />
        <ellipse cx="40" cy="30" rx="8" ry="12" fill="rgba(255,255,255,0.55)" />
        <rect x="14" y="84" width="72" height="16" rx="4" fill="#D4956A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="20" y="100" width="60" height="44" rx="3" fill="#C4864A" stroke="#8B5E2C" strokeWidth="2" />
        <rect x="30" y="112" width="40" height="4" rx="2" fill="#8B5E2C" />
        <circle cx="50" cy="128" r="3" fill="#FFD700" />
        <rect x="22" y="144" width="10" height="10" fill="#8B5E2C" />
        <rect x="68" y="144" width="10" height="10" fill="#8B5E2C" />
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
        <rect x="10" y="24" width="100" height="12" rx="3" fill="#D4956A" />
        <rect x="16" y="36" width="88" height="92" rx="4" fill="#C4864A" stroke="#8B5E2C" strokeWidth="3" />
        <rect x="34" y="58" width="52" height="60" rx="4" fill="#3A2018" />
        {/* logs + fire */}
        <rect x="42" y="104" width="36" height="8" rx="4" fill="#7A4A1E" />
        <ellipse cx="60" cy="96" rx="14" ry="18" fill="#FF6B35" />
        <ellipse cx="60" cy="100" rx="8" ry="12" fill="#FFD700" />
        <ellipse cx="60" cy="104" rx="4" ry="7" fill="#FFF3B0" />
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