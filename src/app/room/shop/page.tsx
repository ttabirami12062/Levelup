"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/lib/gameContext";
import { supabase } from "@/lib/supabase";
import { ALL_ITEMS, ShopItem } from "../page";

const FREE_ITEMS = ["bed", "desk", "plant", "door", "window", "rug"];
type Category = "furniture" | "walls" | "floor" | "special" | "garden";

interface PlacedItem { itemId: string; x: number; y: number; }

function ShopContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { coins, gems, spendCoins, spendGems } = useGame();

  const roomId = Number(searchParams.get("id")) || 1;

  const [ownedItems, setOwnedItems]     = useState<string[]>(FREE_ITEMS);
  const [allRooms, setAllRooms]         = useState<Record<string, PlacedItem[]>>({});
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [category, setCategory]         = useState<Category>("furniture");
  const [buyMessage, setBuyMessage]     = useState<string | null>(null);
  const [buySuccess, setBuySuccess]     = useState(false);

  // Load the kid's owned list + room layouts from Supabase.
  useEffect(() => {
    const load = async () => {
      const profileId = localStorage.getItem("levelup_active_profile");
      if (!profileId) return;

      const { data, error } = await supabase
        .from("rooms")
        .select("owned_items, room_items")
        .eq("profile_id", profileId)
        .single();

      if (data && !error) {
        const owned = (data.owned_items as string[]) || [];
        setOwnedItems([...new Set([...FREE_ITEMS, ...owned])]);
        setAllRooms((data.room_items as Record<string, PlacedItem[]>) || {});
      }
    };
    load();
  }, []);

  const filteredItems = ALL_ITEMS.filter(i => i.category === category);

  const handleBuy = () => {
    if (!selectedItem) return;
    if (ownedItems.includes(selectedItem.id)) return;

    if (selectedItem.currency === "coins") {
      if (coins < selectedItem.price) {
        setBuyMessage("not enough coins!");
        setBuySuccess(false);
        setTimeout(() => setBuyMessage(null), 2000);
        return;
      }
      spendCoins(selectedItem.price);
    } else {
      if (gems < selectedItem.price) {
        setBuyMessage("not enough gems!");
        setBuySuccess(false);
        setTimeout(() => setBuyMessage(null), 2000);
        return;
      }
      spendGems(selectedItem.price);
    }

    const newOwned = [...ownedItems, selectedItem.id];
    setOwnedItems(newOwned);

    // Drop the new item into the current room's layout at the default centre spot.
    const roomKey = String(roomId);
    const placed  = allRooms[roomKey] ? [...allRooms[roomKey]] : [];
    if (!placed.find(p => p.itemId === selectedItem.id)) {
      placed.push({ itemId: selectedItem.id, x: 0.5, y: 0.7 });
    }
    const nextRooms = { ...allRooms, [roomKey]: placed };
    setAllRooms(nextRooms);

    // Save both the owned list and the updated room layouts to Supabase.
    const profileId = localStorage.getItem("levelup_active_profile");
    if (profileId) {
      supabase
        .from("rooms")
        .update({
          owned_items: newOwned.filter(id => !FREE_ITEMS.includes(id)),
          room_items:  nextRooms,
          updated_at:  new Date().toISOString(),
        })
        .eq("profile_id", profileId)
        .then(({ error }) => {
          if (error) console.error("Failed to save purchase:", error.message);
        });
    }

    setBuyMessage(`${selectedItem.name} added to your room!`);
    setBuySuccess(true);
    setTimeout(() => {
      setBuyMessage(null);
      setSelectedItem(null);
    }, 1500);
  };

 const CATEGORIES: { id: Category; label: string; emoji: string; color: string }[] = [
    { id: "furniture", label: "Furniture", emoji: "🛋️", color: "#FF8FAB" },
    { id: "walls",     label: "Walls",     emoji: "🪟", color: "#74B3FF" },
    { id: "floor",     label: "Floor",     emoji: "🏠", color: "#78D660" },
    { id: "special",   label: "Special",   emoji: "✨", color: "#FFD700" },
    { id: "garden",    label: "Garden",    emoji: "🌿", color: "#5DBE4A" },
  ];

  const currentCat = CATEGORIES.find(c => c.id === category)!;

  return (
    <main
      className="w-full h-screen overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg, #FFF0F5 0%, #FFF8E7 50%, #F0FFF4 100%)",
      }}
    >
      {/* ── TOP BAR ── */}
      <div
        style={{
          background: "linear-gradient(to right, #FF6B9D, #FF8FAB)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          boxShadow: "0 4px 16px rgba(255,107,157,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => router.push(`/room?id=${roomId}`)}
            style={{
              background: "rgba(255,255,255,0.3)",
              border: "none",
              borderRadius: 10,
              width: 36,
              height: 36,
              color: "white",
              fontSize: 18,
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontFamily: "var(--font-game)", fontSize: 22, color: "white", textShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
              Decoration Shop
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>
              make your room amazing!
            </div>
          </div>
        </div>

        {/* Currency badges */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "6px 14px", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <CoinSVG size={16} />
            <span style={{ fontFamily: "var(--font-game)", fontSize: 14, color: "#C47A10" }}>{coins}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "6px 14px", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <GemSVG size={14} />
            <span style={{ fontFamily: "var(--font-game)", fontSize: 14, color: "#6A4FC4" }}>{gems}</span>
          </div>
        </div>
      </div>

      {/* ── SHOP SIGN ── */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, flexShrink: 0 }}>
        <div
          style={{
            background: "linear-gradient(to bottom, #C4864A, #A06830)",
            borderRadius: 16,
            padding: "8px 32px",
            boxShadow: "0 6px 0 #6B4820, 0 8px 16px rgba(0,0,0,0.2)",
            border: "3px solid #D4956A",
          }}
        >
          <span style={{ fontFamily: "var(--font-game)", fontSize: 20, color: "#FFE066", textShadow: "0 2px 4px rgba(0,0,0,0.3)", letterSpacing: 2 }}>
            ✦ SHOP ✦
          </span>
        </div>
      </div>

      {/* ── AWNING / CATEGORY TABS ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px 8px",
          flexShrink: 0,
          justifyContent: "center",
        }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setSelectedItem(null); }}
            style={{
              flex: 1,
              maxWidth: 90,
              padding: "8px 4px",
              borderRadius: 16,
              border: "3px solid",
              borderColor: category === cat.id ? cat.color : "rgba(255,255,255,0.6)",
              background: category === cat.id ? cat.color : "rgba(255,255,255,0.7)",
              color: category === cat.id ? "white" : "#888",
              fontFamily: "var(--font-game)",
              fontSize: 10,
              cursor: "pointer",
              boxShadow: category === cat.id ? `0 4px 0 rgba(0,0,0,0.15)` : "0 2px 4px rgba(0,0,0,0.08)",
              transform: category === cat.id ? "translateY(-2px)" : "none",
              transition: "all 150ms ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ fontSize: 18 }}>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ── ITEM GRID ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          alignContent: "start",
        }}
      >
        {filteredItems.map(item => {
          const owned    = ownedItems.includes(item.id);
          const selected = selectedItem?.id === item.id;
          const canAfford = item.currency === "coins" ? coins >= item.price : gems >= item.price;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(selected ? null : item)}
              style={{
                background: owned
                  ? "linear-gradient(135deg, #E8FFF0, #D4FFE4)"
                  : selected
                    ? "linear-gradient(135deg, #FFF0F8, #FFE0EE)"
                    : "rgba(255,255,255,0.85)",
                borderRadius: 18,
                padding: "10px 6px 8px",
                border: owned
                  ? "2.5px solid #5DBE4A"
                  : selected
                    ? "2.5px solid #FF6B9D"
                    : "2.5px solid rgba(255,255,255,0.9)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                transition: "all 150ms ease",
                transform: selected ? "scale(1.05) translateY(-2px)" : "scale(1)",
                boxShadow: selected
                  ? "0 6px 20px rgba(255,107,157,0.25)"
                  : owned
                    ? "0 4px 12px rgba(93,190,74,0.2)"
                    : "0 3px 10px rgba(0,0,0,0.08)",
              }}
            >
              {/* Item illustration */}
              <div style={{ width: 58, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ItemSVGMini id={item.id} />
              </div>

              {/* Name */}
              <span style={{ fontFamily: "var(--font-game)", fontSize: 9, color: owned ? "#3D9E2A" : "#444", textAlign: "center", lineHeight: 1.3 }}>
                {item.name}
              </span>

              {/* Price or owned */}
              {owned ? (
                <div style={{ background: "#5DBE4A", borderRadius: 99, padding: "2px 8px" }}>
                  <span style={{ fontFamily: "var(--font-game)", fontSize: 9, color: "white" }}>✓ owned</span>
                </div>
              ) : item.price === 0 ? (
                <div style={{ background: "#5DBE4A", borderRadius: 99, padding: "2px 8px" }}>
                  <span style={{ fontFamily: "var(--font-game)", fontSize: 9, color: "white" }}>free!</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 3, background: canAfford ? "rgba(245,200,66,0.15)" : "rgba(232,84,84,0.1)", borderRadius: 99, padding: "2px 8px" }}>
                  {item.currency === "coins" ? <CoinSVG size={11} /> : <GemSVG size={10} />}
                  <span style={{ fontFamily: "var(--font-game)", fontSize: 10, color: canAfford ? (item.currency === "coins" ? "#C47A10" : "#6A4FC4") : "#E85454" }}>
                    {item.price}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── BUY SECTION ── */}
      <div
        style={{
          background: "white",
          borderTop: "3px solid #FFE0EE",
          padding: "10px 16px 14px",
          flexShrink: 0,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {buyMessage && (
          <div
            style={{
              background: buySuccess ? "linear-gradient(to right, #E8FFF0, #D4FFE4)" : "linear-gradient(to right, #FFF0F0, #FFE0E0)",
              border: `2px solid ${buySuccess ? "#5DBE4A" : "#E85454"}`,
              borderRadius: 12,
              padding: "8px 14px",
              marginBottom: 8,
              textAlign: "center",
              fontFamily: "var(--font-game)",
              fontSize: 13,
              color: buySuccess ? "#3D9E2A" : "#E85454",
            }}
          >
            {buySuccess ? "🎉 " : "❌ "}{buyMessage}
          </div>
        )}

        <button
          onClick={handleBuy}
          disabled={!selectedItem || ownedItems.includes(selectedItem?.id || "")}
          style={{
            width: "100%",
            background: !selectedItem || ownedItems.includes(selectedItem?.id || "")
              ? "linear-gradient(to bottom, #E0E0E0, #D0D0D0)"
              : "linear-gradient(to bottom, #FF8FAB, #FF6B9D)",
            border: "none",
            borderRadius: 18,
            padding: "14px",
            fontFamily: "var(--font-game)",
            fontSize: 16,
            color: "white",
            cursor: !selectedItem || ownedItems.includes(selectedItem?.id || "") ? "not-allowed" : "pointer",
            boxShadow: !selectedItem || ownedItems.includes(selectedItem?.id || "")
              ? "none"
              : "0 5px 0 #CC4477, 0 8px 20px rgba(255,107,157,0.3)",
            transition: "all 200ms ease",
            textShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
        >
          {!selectedItem
            ? "select an item first"
            : ownedItems.includes(selectedItem.id)
              ? "✓ already owned"
              : selectedItem.price === 0
                ? "✨ add to room — free!"
                : `buy — ${selectedItem.price} ${selectedItem.currency}`}
        </button>
      </div>
    </main>
  );
}

// ── MINI ITEM SVGs ──
function ItemSVGMini({ id }: { id: string }) {
  const map: Record<string, JSX.Element> = {
    bed:          <svg width="52" height="30" viewBox="0 0 160 95"><rect x="4" y="48" width="152" height="44" rx="8" fill="#8B5E3C"/><rect x="8" y="32" width="144" height="56" rx="6" fill="#FFF"/><rect x="14" y="36" width="52" height="32" rx="8" fill="#FF8FAB"/><rect x="94" y="36" width="52" height="32" rx="8" fill="#B09AFF"/><rect x="8" y="66" width="144" height="22" rx="6" fill="#74B3FF"/><rect x="2" y="10" width="156" height="38" rx="10" fill="#C4864A"/></svg>,
    desk:         <svg width="48" height="48" viewBox="0 0 90 90"><line x1="60" y1="44" x2="60" y2="20" stroke="#999" strokeWidth="3"/><path d="M44 20 Q60 10 76 20" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/><rect x="4" y="44" width="82" height="9" rx="3" fill="#C4864A"/><rect x="8" y="53" width="74" height="28" rx="4" fill="#D4956A"/></svg>,
    plant:        <svg width="34" height="48" viewBox="0 0 52 68"><path d="M14 54 L10 68 L42 68 L38 54 Z" fill="#C8874A"/><line x1="26" y1="54" x2="26" y2="32" stroke="#5DBE4A" strokeWidth="3.5"/><ellipse cx="26" cy="26" rx="13" ry="8.5" fill="#78D660"/><circle cx="26" cy="18" r="8" fill="#FF8FAB"/></svg>,
    sofa:         <svg width="52" height="32" viewBox="0 0 125 75"><rect x="4" y="28" width="117" height="44" rx="12" fill="#B09AFF"/><rect x="8" y="18" width="109" height="24" rx="10" fill="#C4AEFF"/><rect x="2" y="24" width="22" height="40" rx="10" fill="#9B7FE8"/><rect x="101" y="24" width="22" height="40" rx="10" fill="#9B7FE8"/><rect x="16" y="30" width="28" height="18" rx="6" fill="#FF8FAB" opacity="0.8"/><rect x="81" y="30" width="28" height="18" rx="6" fill="#FFD700" opacity="0.8"/></svg>,
    armchair:     <svg width="38" height="36" viewBox="0 0 80 75"><rect x="4" y="30" width="72" height="42" rx="12" fill="#FF8FAB"/><rect x="8" y="20" width="64" height="24" rx="10" fill="#FFB3C6"/><rect x="2" y="26" width="18" height="36" rx="9" fill="#FF6B9D"/><rect x="60" y="26" width="18" height="36" rx="9" fill="#FF6B9D"/></svg>,
    coffeetable:  <svg width="48" height="34" viewBox="0 0 96 68"><rect x="10" y="40" width="7" height="22" rx="3" fill="#A06830"/><rect x="79" y="40" width="7" height="22" rx="3" fill="#A06830"/><rect x="4" y="26" width="88" height="18" rx="6" fill="#C4864A"/><rect x="8" y="29" width="80" height="6" rx="3" fill="#D4956A"/><line x1="20" y1="35" x2="76" y2="35" stroke="#A06830" strokeWidth="1.5" opacity="0.5"/></svg>,
    tv:           <svg width="48" height="36" viewBox="0 0 90 72"><rect x="2" y="2" width="86" height="50" rx="8" fill="#1A1A2E"/><rect x="6" y="6" width="78" height="42" rx="5" fill="#4A90D9"/><rect x="12" y="12" width="28" height="18" rx="3" fill="rgba(255,255,255,0.25)"/></svg>,
    bookshelf:    <svg width="38" height="48" viewBox="0 0 76 88"><rect x="2" y="2" width="72" height="84" rx="6" fill="#C4864A"/><rect x="5" y="6" width="66" height="18" rx="2" fill="#F0F0F0"/><rect x="7" y="8" width="10" height="14" rx="1" fill="#FF6B9D"/><rect x="19" y="8" width="7" height="14" rx="1" fill="#9B7FE8"/><rect x="28" y="8" width="11" height="14" rx="1" fill="#5DBE4A"/><rect x="5" y="28" width="66" height="18" rx="2" fill="#F0F0F0"/></svg>,
    beanbag:      <svg width="38" height="38" viewBox="0 0 62 62"><ellipse cx="31" cy="44" rx="27" ry="17" fill="#FF8FAB"/><ellipse cx="31" cy="30" rx="23" ry="26" fill="#FFB3C6"/></svg>,
    wardrobe:     <svg width="36" height="44" viewBox="0 0 76 92"><rect x="2" y="4" width="72" height="84" rx="6" fill="#C4864A"/><line x1="38" y1="4" x2="38" y2="88" stroke="#8B5E2C" strokeWidth="2"/><rect x="6" y="10" width="28" height="68" rx="3" fill="#D4956A"/><rect x="42" y="10" width="28" height="68" rx="3" fill="#D4956A"/><circle cx="30" cy="44" r="3.5" fill="#FFD700"/><circle cx="48" cy="44" r="3.5" fill="#FFD700"/></svg>,
    vanity:       <svg width="38" height="44" viewBox="0 0 80 88"><rect x="4" y="48" width="72" height="38" rx="6" fill="#C4864A"/><ellipse cx="40" cy="24" rx="30" ry="24" fill="#87CEEB" stroke="#C4864A" strokeWidth="3"/><ellipse cx="40" cy="24" rx="24" ry="18" fill="#B8E4F8" opacity="0.7"/></svg>,
    nightstand:   <svg width="30" height="32" viewBox="0 0 60 62"><rect x="2" y="16" width="56" height="44" rx="6" fill="#C4864A"/><rect x="6" y="22" width="48" height="14" rx="2" fill="#D4956A"/><rect x="6" y="38" width="48" height="16" rx="2" fill="#D4956A"/></svg>,
    floorlamp:    <svg width="28" height="44" viewBox="0 0 48 88"><line x1="24" y1="77" x2="24" y2="28" stroke="#888" strokeWidth="4" strokeLinecap="round"/><path d="M6 28 Q24 8 42 28" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/><ellipse cx="24" cy="82" rx="18" ry="5" fill="#C4864A"/></svg>,
    fireplace:    <svg width="38" height="44" viewBox="0 0 80 88"><rect x="4" y="18" width="72" height="66" rx="6" fill="#C4864A"/><rect x="12" y="26" width="56" height="46" rx="4" fill="#1A1A2E"/><ellipse cx="40" cy="60" rx="10" ry="12" fill="#FF6B35"/><ellipse cx="40" cy="56" rx="5" ry="7" fill="#FFE066"/></svg>,
    window:       <svg width="34" height="40" viewBox="0 0 68 80"><rect x="2" y="2" width="64" height="76" rx="5" fill="#A07040" stroke="#6B4820" strokeWidth="3"/><rect x="6" y="6" width="26" height="32" rx="2" fill="#C8E8F8"/><rect x="36" y="6" width="26" height="32" rx="2" fill="#C8E8F8"/></svg>,
    door:         <svg width="30" height="46" viewBox="0 0 56 86"><rect x="2" y="2" width="52" height="82" rx="4" fill="#A06830" stroke="#6B4820" strokeWidth="3"/><rect x="8" y="8" width="40" height="34" rx="3" fill="#C4864A"/><rect x="8" y="46" width="40" height="32" rx="3" fill="#C4864A"/><circle cx="42" cy="44" r="3.5" fill="#FFD700" stroke="#C49A00" strokeWidth="1"/></svg>,
    poster:       <svg width="28" height="36" viewBox="0 0 56 68"><rect x="2" y="2" width="52" height="64" rx="4" fill="#D4A96A"/><rect x="5" y="5" width="46" height="58" rx="3" fill="#1A1A2E"/><polygon points="28,10 33,24 48,24 36,33 40,48 28,39 16,48 20,33 8,24 23,24" fill="#FFD700"/></svg>,
    clock:        <svg width="32" height="32" viewBox="0 0 50 50"><circle cx="25" cy="25" r="23" fill="#1A1A2E" stroke="#FFD700" strokeWidth="3"/><circle cx="25" cy="25" r="19" fill="#0D1B2A"/><line x1="25" y1="25" x2="25" y2="11" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/></svg>,
    painting:     <svg width="34" height="30" viewBox="0 0 66 56"><rect x="2" y="2" width="62" height="52" rx="4" fill="#C4864A" stroke="#8B5E2C" strokeWidth="3"/><rect x="6" y="6" width="54" height="44" rx="2" fill="#87CEEB"/><ellipse cx="33" cy="28" rx="16" ry="12" fill="#78D660" opacity="0.6"/></svg>,
    wallmirror:   <svg width="30" height="36" viewBox="0 0 56 68"><ellipse cx="28" cy="28" rx="26" ry="24" fill="#87CEEB" stroke="#FFD700" strokeWidth="3"/><ellipse cx="28" cy="28" rx="20" ry="18" fill="#B8E4F8" opacity="0.7"/></svg>,
    wallshelf:    <svg width="48" height="34" viewBox="0 0 96 68"><rect x="6" y="40" width="84" height="9" rx="3" fill="#C4864A" stroke="#8B5E2C" strokeWidth="1.5"/><path d="M14 49 L20 60 L24 49 Z" fill="#8B5E2C"/><path d="M72 49 L78 60 L82 49 Z" fill="#8B5E2C"/><rect x="20" y="14" width="9" height="26" rx="2" fill="#FF6B9D"/><rect x="31" y="20" width="9" height="20" rx="2" fill="#9B7FE8"/><rect x="42" y="16" width="9" height="24" rx="2" fill="#5DBE4A"/><circle cx="64" cy="30" r="9" fill="#78D660"/><circle cx="64" cy="22" r="5" fill="#FF8FAB"/></svg>,
    rug:          <svg width="52" height="24" viewBox="0 0 200 46"><ellipse cx="100" cy="23" rx="98" ry="21" fill="#9B7FE8" stroke="#7B5FD8" strokeWidth="2"/><ellipse cx="100" cy="23" rx="82" ry="16" fill="#B09AFF"/><ellipse cx="100" cy="23" rx="64" ry="11" fill="#C4AEFF" opacity="0.7"/></svg>,
    floorplant:   <svg width="28" height="38" viewBox="0 0 52 68"><path d="M14 54 L10 68 L42 68 L38 54 Z" fill="#C8874A"/><line x1="26" y1="54" x2="26" y2="32" stroke="#5DBE4A" strokeWidth="3.5"/><ellipse cx="26" cy="26" rx="13" ry="8.5" fill="#78D660"/><circle cx="26" cy="18" r="8" fill="#FF8FAB"/></svg>,
    trophy:       <svg width="38" height="48" viewBox="0 0 50 62"><path d="M8 8 L8 30 Q8 42 25 42 Q42 42 42 30 L42 8 Z" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/><path d="M8 12 Q2 12 2 22 Q2 32 8 32" fill="none" stroke="#C49A00" strokeWidth="2"/><path d="M42 12 Q48 12 48 22 Q48 32 42 32" fill="none" stroke="#C49A00" strokeWidth="2"/><rect x="6" y="4" width="38" height="9" rx="3" fill="#C49A00"/></svg>,
    galaxy:       <svg width="42" height="42" viewBox="0 0 62 62"><circle cx="31" cy="31" r="29" fill="#0D1B3E" stroke="#2A3A6E" strokeWidth="2"/><circle cx="31" cy="29" r="12" fill="#9B7FE8"/><ellipse cx="31" cy="29" rx="22" ry="6" fill="none" stroke="#C4AEFF" strokeWidth="2.5"/><circle cx="20" cy="18" r="2" fill="white" opacity="0.8"/></svg>,
    wand:         <svg width="26" height="40" viewBox="0 0 42 62"><polygon points="21,2 24,11 33,11 26,17 29,26 21,20 13,26 16,17 9,11 18,11" fill="#FFD700" stroke="#C49A00" strokeWidth="1.5"/><rect x="18" y="18" width="6" height="42" rx="3" fill="#6B4820"/></svg>,
    sortinghat:   <svg width="32" height="42" viewBox="0 0 54 62"><ellipse cx="27" cy="50" rx="25" ry="10" fill="#2A1A00"/><path d="M8 48 Q6 32 13 20 Q20 5 27 3 Q34 5 41 20 Q48 32 46 48 Z" fill="#4A3000" stroke="#1A0A00" strokeWidth="2"/><rect x="10" y="36" width="34" height="6" rx="3" fill="#FFD700"/></svg>,
    snitch:       <svg width="42" height="38" viewBox="0 0 64 50"><path d="M30 25 Q16 6 2 10 Q8 18 14 21 Q8 24 6 30 Q18 30 30 25 Z" fill="#F5F0E0" stroke="#C4A860" strokeWidth="1.5"/><path d="M34 25 Q48 6 62 10 Q56 18 50 21 Q56 24 58 30 Q46 30 34 25 Z" fill="#F5F0E0" stroke="#C4A860" strokeWidth="1.5"/><line x1="14" y1="13" x2="22" y2="22" stroke="#C4A860" strokeWidth="1"/><line x1="50" y1="13" x2="42" y2="22" stroke="#C4A860" strokeWidth="1"/><circle cx="32" cy="25" r="13" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/><circle cx="32" cy="25" r="9" fill="#FFE566"/><ellipse cx="28" cy="21" rx="3" ry="4" fill="rgba(255,255,255,0.6)"/></svg>,
    wizardmap:    <svg width="42" height="32" viewBox="0 0 68 56"><rect x="2" y="4" width="10" height="48" rx="5" fill="#C4A860"/><rect x="56" y="4" width="10" height="48" rx="5" fill="#C4A860"/><rect x="8" y="6" width="52" height="44" fill="#F5E6C8" stroke="#C4A860" strokeWidth="1"/><path d="M14 24 Q22 19 30 24 Q38 29 50 24" stroke="#8B6030" strokeWidth="1.5" fill="none"/><circle cx="22" cy="24" r="3.5" fill="#FF6B35" opacity="0.8"/></svg>,
    gamingconsole:<svg width="38" height="32" viewBox="0 0 70 60"><rect x="4" y="18" width="62" height="38" rx="8" fill="#1A1A2E"/><rect x="8" y="22" width="24" height="18" rx="3" fill="#4A90D9"/><circle cx="50" cy="26" r="4" fill="#E85454"/><circle cx="58" cy="30" r="4" fill="#5DBE4A"/></svg>,
    fishbowl:     <svg width="30" height="36" viewBox="0 0 52 58"><ellipse cx="26" cy="30" rx="24" ry="22" fill="#B8E4F8" stroke="#87CEEB" strokeWidth="2"/><ellipse cx="18" cy="22" rx="7" ry="9" fill="rgba(255,255,255,0.4)"/></svg>,
    gardenbed:    <svg width="48" height="28" viewBox="0 0 100 55"><rect x="4" y="18" width="92" height="10" rx="4" fill="#C4864A"/><rect x="4" y="4" width="20" height="24" rx="3" fill="#A07040"/><rect x="76" y="4" width="20" height="24" rx="3" fill="#A07040"/></svg>,
    fountain:     <svg width="36" height="44" viewBox="0 0 70 80"><ellipse cx="35" cy="60" rx="26" ry="14" fill="#87CEEB" stroke="#5BB8B5" strokeWidth="2"/><rect x="31" y="26" width="8" height="36" rx="3" fill="#C4864A"/><ellipse cx="35" cy="22" rx="20" ry="8" fill="#87CEEB" stroke="#5BB8B5" strokeWidth="2"/></svg>,
    flowerbed:    <svg width="48" height="34" viewBox="0 0 96 68"><rect x="2" y="44" width="92" height="20" rx="6" fill="#8B5E2C"/><rect x="2" y="44" width="92" height="6" rx="3" fill="#6B4820"/><line x1="20" y1="44" x2="20" y2="28" stroke="#4DAF35" strokeWidth="2.5"/><line x1="40" y1="44" x2="40" y2="24" stroke="#4DAF35" strokeWidth="2.5"/><line x1="60" y1="44" x2="60" y2="28" stroke="#4DAF35" strokeWidth="2.5"/><line x1="78" y1="44" x2="78" y2="24" stroke="#4DAF35" strokeWidth="2.5"/><g><circle cx="20" cy="20" r="8" fill="#FF6B9D"/><circle cx="20" cy="20" r="3.5" fill="#FFD700"/></g><g><circle cx="40" cy="16" r="8" fill="#9B7FE8"/><circle cx="40" cy="16" r="3.5" fill="#FFD700"/></g><g><circle cx="60" cy="20" r="8" fill="#FF8FAB"/><circle cx="60" cy="20" r="3.5" fill="#FFD700"/></g><g><circle cx="78" cy="16" r="8" fill="#74B3FF"/><circle cx="78" cy="16" r="3.5" fill="#FFD700"/></g></svg>,
    gardengnome:  <svg width="28" height="40" viewBox="0 0 44 62"><ellipse cx="22" cy="56" rx="18" ry="5" fill="#C8874A"/><rect x="14" y="38" width="16" height="20" rx="4" fill="#5DBE4A"/><ellipse cx="22" cy="30" rx="12" ry="14" fill="#C68642"/><polygon points="22,4 34,18 10,18" fill="#E85454" stroke="#CC2222" strokeWidth="1.5"/></svg>,
    birdbath:     <svg width="30" height="40" viewBox="0 0 52 68"><ellipse cx="26" cy="20" rx="22" ry="12" fill="#87CEEB" stroke="#5BB8B5" strokeWidth="2"/><ellipse cx="26" cy="20" rx="16" ry="8" fill="#B8E4F8"/><rect x="22" y="32" width="8" height="24" rx="3" fill="#C4864A"/><ellipse cx="26" cy="56" rx="16" ry="5" fill="#A07040"/></svg>,
    pond:         <svg width="52" height="28" viewBox="0 0 110 55"><ellipse cx="55" cy="32" rx="52" ry="22" fill="#4A90D9" stroke="#2A6AB0" strokeWidth="2"/><ellipse cx="55" cy="32" rx="44" ry="16" fill="#5BA0E9"/><ellipse cx="40" cy="26" rx="10" ry="6" fill="rgba(255,255,255,0.25)"/></svg>,
    swingset:     <svg width="44" height="44" viewBox="0 0 90 90"><line x1="10" y1="10" x2="10" y2="80" stroke="#8B5E2C" strokeWidth="5" strokeLinecap="round"/><line x1="80" y1="10" x2="80" y2="80" stroke="#8B5E2C" strokeWidth="5" strokeLinecap="round"/><line x1="8" y1="10" x2="82" y2="10" stroke="#8B5E2C" strokeWidth="5" strokeLinecap="round"/><rect x="24" y="52" width="42" height="8" rx="4" fill="#FFD700"/></svg>,
    wateringcan:  <svg width="30" height="30" viewBox="0 0 48 48"><ellipse cx="26" cy="32" rx="18" ry="14" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/><rect x="12" y="10" width="28" height="8" rx="4" fill="#FFD700" stroke="#C49A00" strokeWidth="1.5"/></svg>,
    trampoline:   <svg width="48" height="30" viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="46" ry="18" fill="#E85454" stroke="#CC2222" strokeWidth="2"/><ellipse cx="50" cy="30" rx="36" ry="12" fill="#FF8FAB"/></svg>,
    hammock:      <svg width="52" height="30" viewBox="0 0 120 60"><line x1="8" y1="8" x2="8" y2="56" stroke="#8B5E2C" strokeWidth="6" strokeLinecap="round"/><line x1="112" y1="8" x2="112" y2="56" stroke="#8B5E2C" strokeWidth="6" strokeLinecap="round"/><path d="M8 20 Q60 56 112 20" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/></svg>,
  };
  return map[id] || <svg width="48" height="48" viewBox="0 0 60 60"><rect x="4" y="4" width="52" height="52" rx="8" fill="#7B6FE8"/><text x="30" y="36" textAnchor="middle" fontSize="24" fill="white">?</text></svg>;
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ width: "100%", height: "100vh", background: "#FFF0F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-game)", fontSize: 24, color: "#FF6B9D" }}>Loading shop...</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}