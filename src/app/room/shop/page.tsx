"use client";

import { useState, useEffect, Suspense, type JSX } from "react";
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

    // Save ONLY the owned list to Supabase. Do NOT auto-place the item into
    // any room — purchased items go to the "Your Items" tray, and the kid
    // drags them into whichever room they want from there.
    const profileId = localStorage.getItem("levelup_active_profile");
    if (profileId) {
      supabase
        .from("rooms")
        .update({
          owned_items: newOwned.filter(id => !FREE_ITEMS.includes(id)),
          updated_at:  new Date().toISOString(),
        })
        .eq("profile_id", profileId)
        .then(({ error }) => {
          if (error) console.error("Failed to save purchase:", error.message);
        });
    }

    setBuyMessage(`${selectedItem.name} added to your items!`);
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
    bed:          <svg width="52" height="32" viewBox="0 0 200 130"><ellipse cx="105" cy="122" rx="92" ry="7" fill="#000" opacity="0.07"/><rect x="6" y="18" width="32" height="104" rx="12" fill="#B07D45"/><rect x="18" y="100" width="172" height="22" rx="6" fill="#6D4520"/><rect x="22" y="78" width="168" height="28" rx="8" fill="#8B5E2C"/><path d="M30 88 Q110 78 190 88 L190 104 Q110 96 30 104 Z" fill="#FFF"/><path d="M70 84 Q130 76 190 82 L190 102 Q130 96 70 100 Z" fill="#74B3FF"/><path d="M34 56 Q40 44 58 46 Q74 48 74 60 Q74 74 56 74 Q38 74 34 62 Z" fill="#FF8FAB"/><path d="M50 60 Q56 50 72 52 Q86 54 86 66 Q84 78 68 78 Q54 76 50 64 Z" fill="#FFC2D2"/></svg>,
    desk:         <svg width="48" height="48" viewBox="0 0 120 120"><rect x="14" y="68" width="92" height="12" rx="4" fill="#C8874A"/><rect x="20" y="80" width="14" height="32" fill="#A06830"/><rect x="86" y="80" width="14" height="32" fill="#A06830"/><rect x="38" y="80" width="44" height="32" rx="3" fill="#C4864A"/><rect x="44" y="88" width="32" height="4" rx="2" fill="#8B5E2C"/><line x1="80" y1="68" x2="80" y2="36" stroke="#7A7A7A" strokeWidth="3"/><path d="M68 36 Q80 16 94 36 Z" fill="#FFD54A" stroke="#C49A00" strokeWidth="2"/><ellipse cx="81" cy="38" rx="13" ry="4" fill="#FFE899"/></svg>,
    plant:        <svg width="34" height="48" viewBox="0 0 80 120"><path d="M22 86 L58 86 L53 112 L27 112 Z" fill="#E07B4A"/><rect x="20" y="80" width="40" height="9" rx="3" fill="#C8632F"/><path d="M40 80 Q22 64 18 38 Q34 50 40 80" fill="#5DBE4A"/><path d="M40 80 Q58 64 62 38 Q46 50 40 80" fill="#6AC94F"/><path d="M40 80 Q40 50 40 24 Q50 48 40 80" fill="#7BD862"/><path d="M40 80 Q28 58 30 34 Q40 52 40 80" fill="#5DBE4A"/><path d="M40 80 Q52 58 50 34 Q40 52 40 80" fill="#6AC94F"/></svg>,
    sofa:         <svg width="54" height="33" viewBox="0 0 180 110"><path d="M16 30 Q14 22 26 22 L154 22 Q166 22 164 30 L164 60 Q164 66 154 64 L26 64 Q16 66 16 60 Z" fill="#C4AEFF"/><path d="M30 28 Q44 24 58 28 Q60 46 58 60 Q44 62 30 60 Z" fill="#B7A0FF"/><path d="M94 28 Q108 24 122 28 Q124 46 122 60 Q108 62 94 60 Z" fill="#B7A0FF"/><path d="M6 42 Q4 36 14 36 Q24 36 24 46 L24 88 Q24 96 14 94 Q4 94 6 86 Z" fill="#9B7FE8"/><path d="M156 42 Q154 36 164 36 Q174 36 174 46 L174 88 Q174 96 164 94 Q154 94 156 86 Z" fill="#9B7FE8"/><path d="M28 60 Q30 54 40 56 L140 56 Q150 54 152 60 L152 86 Q152 94 142 92 L38 92 Q28 94 28 86 Z" fill="#B09AFF"/><path d="M40 52 Q42 44 56 46 Q70 48 70 58 Q70 70 54 70 Q40 68 40 56 Z" fill="#FF8FAB"/><path d="M112 52 Q114 44 128 46 Q142 48 142 58 Q142 70 126 70 Q112 68 112 56 Z" fill="#FFD54A"/></svg>,
    armchair:     <svg width="40" height="40" viewBox="0 0 100 110"><path d="M22 26 Q20 18 32 18 L68 18 Q80 18 78 26 L78 60 Q78 66 68 64 L32 64 Q22 66 22 60 Z" fill="#FFB3C6"/><path d="M34 24 Q50 20 66 24 Q68 44 66 60 Q50 62 34 60 Z" fill="#FFA0B8"/><path d="M6 40 Q4 34 14 34 Q24 34 24 44 L24 86 Q24 94 14 92 Q4 92 6 84 Z" fill="#E0758F"/><path d="M76 40 Q74 34 84 34 Q94 34 94 44 L94 86 Q94 94 84 92 Q74 92 76 84 Z" fill="#E0758F"/><path d="M24 58 Q26 52 36 54 L64 54 Q74 52 76 58 L76 84 Q76 92 66 90 L34 90 Q24 92 24 84 Z" fill="#FF8FAB"/></svg>,
    coffeetable:  <svg width="48" height="32" viewBox="0 0 120 78"><rect x="20" y="40" width="9" height="30" rx="3" fill="#A06830"/><rect x="91" y="40" width="9" height="30" rx="3" fill="#A06830"/><rect x="26" y="62" width="68" height="6" rx="3" fill="#8B5E2C"/><ellipse cx="60" cy="34" rx="54" ry="15" fill="#C8874A"/><ellipse cx="60" cy="31" rx="46" ry="11" fill="#DBA071"/><ellipse cx="60" cy="22" rx="9" ry="4" fill="#FF8FAB"/><rect x="55" y="10" width="10" height="13" rx="3" fill="#FF8FAB"/></svg>,
    tv:           <svg width="48" height="36" viewBox="0 0 90 72"><rect x="2" y="2" width="86" height="50" rx="8" fill="#1A1A2E"/><rect x="6" y="6" width="78" height="42" rx="5" fill="#4A90D9"/><rect x="12" y="12" width="28" height="18" rx="3" fill="rgba(255,255,255,0.25)"/></svg>,
    bookshelf:    <svg width="38" height="48" viewBox="0 0 76 88"><rect x="2" y="2" width="72" height="84" rx="6" fill="#C4864A"/><rect x="5" y="6" width="66" height="18" rx="2" fill="#F0F0F0"/><rect x="7" y="8" width="10" height="14" rx="1" fill="#FF6B9D"/><rect x="19" y="8" width="7" height="14" rx="1" fill="#9B7FE8"/><rect x="28" y="8" width="11" height="14" rx="1" fill="#5DBE4A"/><rect x="5" y="28" width="66" height="18" rx="2" fill="#F0F0F0"/></svg>,
    beanbag:      <svg width="40" height="42" viewBox="0 0 90 95"><path d="M14 60 Q10 30 45 26 Q80 30 76 60 Q78 80 45 86 Q12 80 14 60 Z" fill="#FFB3C6" stroke="#FF6B9D" strokeWidth="2.5"/><path d="M45 26 Q30 28 22 52 Q20 70 32 82 Q24 78 16 62 Q12 32 45 26 Z" fill="#FFC2D2"/><path d="M45 30 Q58 34 64 54" fill="none" stroke="#FF8FAB" strokeWidth="3" opacity="0.6"/></svg>,
    wardrobe:     <svg width="36" height="44" viewBox="0 0 76 92"><rect x="2" y="4" width="72" height="84" rx="6" fill="#C4864A"/><line x1="38" y1="4" x2="38" y2="88" stroke="#8B5E2C" strokeWidth="2"/><rect x="6" y="10" width="28" height="68" rx="3" fill="#D4956A"/><rect x="42" y="10" width="28" height="68" rx="3" fill="#D4956A"/><circle cx="30" cy="44" r="3.5" fill="#FFD700"/><circle cx="48" cy="44" r="3.5" fill="#FFD700"/></svg>,
    vanity:       <svg width="34" height="48" viewBox="0 0 100 160"><rect x="14" y="96" width="72" height="16" rx="4" fill="#C8874A"/><rect x="20" y="112" width="60" height="40" rx="4" fill="#C4864A"/><rect x="26" y="120" width="48" height="14" rx="2" fill="#D9A06E"/><rect x="22" y="10" width="56" height="78" rx="28" fill="#E0C9A0" stroke="#C8874A" strokeWidth="4"/><rect x="28" y="16" width="44" height="66" rx="22" fill="#C9E9F5"/><path d="M40 22 Q32 30 33 48" fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round" opacity="0.7"/></svg>,
    nightstand:   <svg width="30" height="32" viewBox="0 0 60 62"><rect x="2" y="16" width="56" height="44" rx="6" fill="#C4864A"/><rect x="6" y="22" width="48" height="14" rx="2" fill="#D4956A"/><rect x="6" y="38" width="48" height="16" rx="2" fill="#D4956A"/></svg>,
    floorlamp:    <svg width="26" height="48" viewBox="0 0 70 160"><ellipse cx="35" cy="146" rx="20" ry="8" fill="#A06830"/><rect x="32" y="50" width="6" height="96" rx="3" fill="#9A9A9A"/><path d="M12 50 L58 50 L48 18 L22 18 Z" fill="#FFD54A" stroke="#C49A00" strokeWidth="2"/><rect x="22" y="14" width="26" height="6" rx="3" fill="#FFE899"/><ellipse cx="35" cy="52" rx="24" ry="6" fill="#FFE066" opacity="0.5"/></svg>,
    fireplace:    <svg width="40" height="46" viewBox="0 0 120 140"><rect x="8" y="20" width="104" height="16" rx="4" fill="#D6A878"/><rect x="14" y="36" width="92" height="96" rx="4" fill="#C4864A"/><rect x="30" y="54" width="60" height="64" rx="4" fill="#2A1810"/><path d="M60 104 Q48 92 54 76 Q58 86 60 76 Q62 86 66 76 Q72 92 60 104 Z" fill="#FF6B35"/><path d="M60 104 Q52 96 56 84 Q60 92 60 84 Q60 92 64 84 Q68 96 60 104 Z" fill="#FFD54A"/></svg>,
    window:       <svg width="34" height="40" viewBox="0 0 68 80"><rect x="2" y="2" width="64" height="76" rx="5" fill="#A07040" stroke="#6B4820" strokeWidth="3"/><rect x="6" y="6" width="26" height="32" rx="2" fill="#C8E8F8"/><rect x="36" y="6" width="26" height="32" rx="2" fill="#C8E8F8"/></svg>,
    door:         <svg width="30" height="46" viewBox="0 0 56 86"><rect x="2" y="2" width="52" height="82" rx="4" fill="#A06830" stroke="#6B4820" strokeWidth="3"/><rect x="8" y="8" width="40" height="34" rx="3" fill="#C4864A"/><rect x="8" y="46" width="40" height="32" rx="3" fill="#C4864A"/><circle cx="42" cy="44" r="3.5" fill="#FFD700" stroke="#C49A00" strokeWidth="1"/></svg>,
    poster:       <svg width="30" height="42" viewBox="0 0 80 110"><rect x="6" y="4" width="68" height="100" rx="4" fill="#2A2150"/><rect x="11" y="9" width="58" height="90" rx="2" fill="#3D2F6E"/><circle cx="40" cy="40" r="22" fill="#1A1238"/><polygon points="40,16 45,34 63,34 49,45 54,62 40,51 26,62 31,45 17,34 35,34" fill="#FFD54A"/><rect x="16" y="82" width="48" height="12" rx="2" fill="#1A1238"/><rect x="20" y="85" width="32" height="3" rx="1" fill="#9B7FE8"/></svg>,
    clock:        <svg width="38" height="42" viewBox="0 0 90 100"><circle cx="45" cy="50" r="42" fill="#C49A1A"/><circle cx="45" cy="50" r="38" fill="#FFD54A"/><circle cx="45" cy="50" r="32" fill="#FFF6E0"/><g stroke="#8B6030" strokeWidth="2.5" strokeLinecap="round"><line x1="45" y1="22" x2="45" y2="28"/><line x1="73" y1="50" x2="67" y2="50"/><line x1="45" y1="78" x2="45" y2="72"/><line x1="17" y1="50" x2="23" y2="50"/></g><polygon points="45,50 45,30 49,50" fill="#9B7FE8"/><polygon points="45,50 60,56 45,54" fill="#7B5FD8"/><circle cx="45" cy="50" r="4" fill="#7B5FD8"/></svg>,
    painting:     <svg width="44" height="38" viewBox="0 0 110 95"><rect x="6" y="6" width="98" height="80" rx="4" fill="#C8874A"/><rect x="15" y="15" width="80" height="62" fill="#B8E4F8"/><rect x="15" y="55" width="80" height="22" fill="#7BD862"/><polygon points="30,55 44,28 58,55" fill="#9FB0BA"/><polygon points="50,55 66,22 82,55" fill="#B7C4CB"/><polygon points="58,38 66,22 74,38" fill="#FFF"/><circle cx="80" cy="26" r="8" fill="#FFD54A"/><ellipse cx="34" cy="22" rx="9" ry="4" fill="#FFF"/></svg>,
    wallmirror:   <svg width="28" height="44" viewBox="0 0 70 110"><ellipse cx="35" cy="55" rx="32" ry="50" fill="#C49A1A"/><ellipse cx="35" cy="55" rx="28" ry="46" fill="#FFD54A"/><ellipse cx="35" cy="55" rx="23" ry="41" fill="#C9E9F5"/><path d="M22 26 Q18 44 24 64" fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round" opacity="0.7"/><circle cx="35" cy="9" r="6" fill="#C49A1A"/></svg>,
    wallshelf:    <svg width="48" height="34" viewBox="0 0 96 68"><rect x="6" y="40" width="84" height="9" rx="3" fill="#C4864A" stroke="#8B5E2C" strokeWidth="1.5"/><path d="M14 49 L20 60 L24 49 Z" fill="#8B5E2C"/><path d="M72 49 L78 60 L82 49 Z" fill="#8B5E2C"/><rect x="20" y="14" width="9" height="26" rx="2" fill="#FF6B9D"/><rect x="31" y="20" width="9" height="20" rx="2" fill="#9B7FE8"/><rect x="42" y="16" width="9" height="24" rx="2" fill="#5DBE4A"/><circle cx="64" cy="30" r="9" fill="#78D660"/><circle cx="64" cy="22" r="5" fill="#FF8FAB"/></svg>,
    rug:          <svg width="52" height="22" viewBox="0 0 200 76"><ellipse cx="100" cy="42" rx="96" ry="30" fill="#7B5FD8"/><ellipse cx="100" cy="40" rx="92" ry="28" fill="#9B7FE8"/><ellipse cx="100" cy="40" rx="74" ry="22" fill="#B09AFF"/><ellipse cx="100" cy="40" rx="52" ry="15" fill="#C4AEFF"/><ellipse cx="100" cy="40" rx="28" ry="8" fill="#D9C9FF"/></svg>,
    floorplant:   <svg width="30" height="46" viewBox="0 0 90 135"><path d="M22 104 Q22 124 45 124 Q68 124 68 104 Q66 116 45 117 Q24 116 22 104 Z" fill="#9FB0BA"/><ellipse cx="45" cy="104" rx="23" ry="8" fill="#B7C4CB"/><path d="M40 100 Q34 76 38 54" fill="none" stroke="#3B8E2A" strokeWidth="3" strokeLinecap="round"/><path d="M44 100 Q44 70 44 44" fill="none" stroke="#3B8E2A" strokeWidth="3" strokeLinecap="round"/><g fill="#5DBE4A"><ellipse cx="30" cy="60" rx="6" ry="13" transform="rotate(-42 30 60)"/><ellipse cx="60" cy="58" rx="6" ry="13" transform="rotate(42 60 58)"/></g><circle cx="44" cy="40" r="9" fill="#FF6B9D"/><circle cx="44" cy="40" r="4" fill="#FFD54A"/><circle cx="28" cy="54" r="6" fill="#FFD54A"/><circle cx="62" cy="52" r="6" fill="#9B7FE8"/></svg>,
    trophy:       <svg width="38" height="42" viewBox="0 0 90 100"><rect x="30" y="84" width="30" height="8" rx="2" fill="#C49A1A"/><path d="M22 24 L24 56 Q24 76 45 76 Q66 76 66 56 L68 24 Z" fill="#FFD54A" stroke="#C49A1A" strokeWidth="2.5"/><path d="M22 26 Q12 26 10 40 Q9 54 20 56" fill="none" stroke="#C49A1A" strokeWidth="3"/><path d="M68 26 Q78 26 80 40 Q81 54 70 56" fill="none" stroke="#C49A1A" strokeWidth="3"/><rect x="18" y="18" width="54" height="10" rx="3" fill="#E8A800"/><ellipse cx="38" cy="40" rx="6" ry="10" fill="#FFF" opacity="0.55"/></svg>,
    galaxy:       <svg width="42" height="42" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1A1238"/><circle cx="50" cy="50" r="40" fill="#241A48"/><ellipse cx="50" cy="50" rx="38" ry="13" fill="none" stroke="#9B7FE8" strokeWidth="2" opacity="0.7"/><ellipse cx="50" cy="50" rx="38" ry="13" fill="none" stroke="#C4AEFF" strokeWidth="1" opacity="0.5" transform="rotate(30 50 50)"/><circle cx="50" cy="50" r="9" fill="#C4AEFF"/><g fill="#FFF"><circle cx="26" cy="30" r="1.6"/><circle cx="74" cy="28" r="1.6"/><circle cx="30" cy="72" r="1.6"/></g></svg>,
    wand:         <svg width="48" height="48" viewBox="0 0 150 150"><g transform="rotate(-30 75 75)"><path d="M60 71 L138 66 Q146 65.5 146 69.5 Q146 73.5 138 74 L62 79 Q57 75 60 71 Z" fill="#A0703C" stroke="#6B4420" strokeWidth="1.5"/><path d="M136 66 Q143 65.5 145 62.5 L146 68.5 Q143 72.5 137 72.5 Z" fill="#8B5E2C"/><path d="M58 69 Q48 63 34 67 Q40 71 50 71 Q32 75 20 82 Q36 80 46 75 Q26 84 16 95 Q36 89 50 79 Q34 95 30 108 Q50 96 58 82 Q54 98 60 110 Q70 94 66 78 Z" fill="#C8874A" stroke="#8B5E2C" strokeWidth="1.5"/><rect x="56" y="66" width="13" height="16" rx="2" fill="#F5C842" stroke="#C49A1A" strokeWidth="1.5" transform="rotate(-6 62 74)"/></g></svg>,
    sortinghat:   <svg width="42" height="46" viewBox="0 0 130 145"><path d="M10 116 Q4 108 18 105 Q40 99 65 100 Q90 99 112 105 Q126 108 120 116 Q98 124 65 123 Q32 124 10 116 Z" fill="#6B5638" stroke="#3E3018" strokeWidth="2.5"/><path d="M40 108 Q34 70 44 42 Q52 18 65 14 Q78 18 86 42 Q96 70 90 108 Q78 112 65 111 Q52 112 40 108 Z" fill="#7A6240" stroke="#3E3018" strokeWidth="2.5"/><rect x="40" y="96" width="50" height="14" rx="3" fill="#5E4A2E"/><rect x="54" y="94" width="22" height="18" rx="3" fill="#F5C842" stroke="#C49A1A" strokeWidth="2.5"/><path d="M48 64 Q54 58 62 63" fill="none" stroke="#2E2410" strokeWidth="3" strokeLinecap="round"/><path d="M68 63 Q76 58 82 64" fill="none" stroke="#2E2410" strokeWidth="3" strokeLinecap="round"/><circle cx="55" cy="72" r="3" fill="#2E2410"/><circle cx="75" cy="72" r="3" fill="#2E2410"/><path d="M52 86 Q65 80 78 86" fill="none" stroke="#2E2410" strokeWidth="3" strokeLinecap="round"/></svg>,
    snitch:       <svg width="42" height="38" viewBox="0 0 64 50"><path d="M30 25 Q16 6 2 10 Q8 18 14 21 Q8 24 6 30 Q18 30 30 25 Z" fill="#F5F0E0" stroke="#C4A860" strokeWidth="1.5"/><path d="M34 25 Q48 6 62 10 Q56 18 50 21 Q56 24 58 30 Q46 30 34 25 Z" fill="#F5F0E0" stroke="#C4A860" strokeWidth="1.5"/><line x1="14" y1="13" x2="22" y2="22" stroke="#C4A860" strokeWidth="1"/><line x1="50" y1="13" x2="42" y2="22" stroke="#C4A860" strokeWidth="1"/><circle cx="32" cy="25" r="13" fill="#FFD700" stroke="#C49A00" strokeWidth="2"/><circle cx="32" cy="25" r="9" fill="#FFE566"/><ellipse cx="28" cy="21" rx="3" ry="4" fill="rgba(255,255,255,0.6)"/></svg>,
    wizardmap:    <svg width="40" height="44" viewBox="0 0 90 100"><path d="M12 16 L12 84 Q14 80 22 82 L68 82 Q76 80 78 84 L78 16 Q76 20 68 18 L22 18 Q14 20 12 16 Z" fill="#E8D5A8" stroke="#C4A860" strokeWidth="2"/><path d="M26 34 Q38 28 50 34 Q62 40 66 32" fill="none" stroke="#8B6030" strokeWidth="1.5" strokeDasharray="3 2"/><path d="M24 50 Q36 56 48 50 Q60 44 64 52" fill="none" stroke="#8B6030" strokeWidth="1.5" strokeDasharray="3 2"/><circle cx="32" cy="40" r="3" fill="#E85454"/><circle cx="56" cy="56" r="3" fill="#4DAF35"/><polygon points="44,68 46,73 51,73 47,76 49,81 44,78 39,81 41,76 37,73 42,73" fill="#FFD54A"/><rect x="8" y="12" width="9" height="76" rx="4" fill="#C4A860"/><rect x="73" y="12" width="9" height="76" rx="4" fill="#C4A860"/></svg>,
    gamingconsole:<svg width="38" height="32" viewBox="0 0 70 60"><rect x="4" y="18" width="62" height="38" rx="8" fill="#1A1A2E"/><rect x="8" y="22" width="24" height="18" rx="3" fill="#4A90D9"/><circle cx="50" cy="26" r="4" fill="#E85454"/><circle cx="58" cy="30" r="4" fill="#5DBE4A"/></svg>,
    fishbowl:     <svg width="38" height="42" viewBox="0 0 90 100"><rect x="28" y="84" width="34" height="9" rx="3" fill="#C4864A"/><path d="M14 52 Q14 18 45 18 Q76 18 76 52 Q76 80 45 82 Q14 80 14 52 Z" fill="#C9E9F5" stroke="#9FD4E8" strokeWidth="2"/><path d="M16 58 Q45 50 74 58 L74 70 Q45 80 16 70 Z" fill="#5BA0E9" opacity="0.55"/><g transform="translate(40 56)"><ellipse cx="0" cy="0" rx="14" ry="8" fill="#FF8C42"/><polygon points="12,0 24,-8 24,8" fill="#FF8C42"/><circle cx="-6" cy="-2" r="2" fill="#2A1A05"/></g></svg>,
    gardenbed:    <svg width="48" height="40" viewBox="0 0 120 100"><path d="M14 50 L106 50 L100 88 L20 88 Z" fill="#A06830"/><rect x="10" y="44" width="100" height="12" rx="3" fill="#C8874A"/><rect x="8" y="40" width="16" height="50" rx="3" fill="#B07D45"/><rect x="96" y="40" width="16" height="50" rx="3" fill="#B07D45"/><rect x="24" y="52" width="72" height="14" fill="#5A3A1A"/><g><line x1="36" y1="54" x2="36" y2="30" stroke="#4DAF35" strokeWidth="3"/><path d="M36 30 Q28 26 30 18 Q38 22 36 30" fill="#5DBE4A"/><path d="M36 30 Q44 26 42 18 Q34 22 36 30" fill="#6AC94F"/></g><g><line x1="54" y1="54" x2="54" y2="26" stroke="#4DAF35" strokeWidth="3"/><path d="M54 26 Q46 22 48 12 Q56 18 54 26" fill="#5DBE4A"/><path d="M54 26 Q62 22 60 12 Q52 18 54 26" fill="#6AC94F"/></g><g><line x1="72" y1="54" x2="72" y2="30" stroke="#4DAF35" strokeWidth="3"/><path d="M72 30 Q64 26 66 18 Q74 22 72 30" fill="#5DBE4A"/></g><g><line x1="88" y1="54" x2="88" y2="32" stroke="#4DAF35" strokeWidth="3"/><circle cx="88" cy="30" r="6" fill="#E85454"/></g></svg>,
    fountain:     <svg width="32" height="46" viewBox="0 0 90 130"><ellipse cx="45" cy="110" rx="42" ry="14" fill="#9FB0BA"/><ellipse cx="45" cy="106" rx="42" ry="13" fill="#C0CDD4"/><ellipse cx="45" cy="105" rx="34" ry="9" fill="#87CEEB"/><rect x="40" y="64" width="10" height="42" fill="#B7C4CB"/><ellipse cx="45" cy="62" rx="24" ry="8" fill="#9FB0BA"/><ellipse cx="45" cy="60" rx="24" ry="7" fill="#C0CDD4"/><ellipse cx="45" cy="59" rx="17" ry="4.5" fill="#87CEEB"/><rect x="42" y="36" width="6" height="24" fill="#B7C4CB"/><circle cx="45" cy="32" r="7" fill="#C0CDD4"/><path d="M45 30 Q38 18 45 12 Q52 18 45 30" fill="#A8DCF0"/></svg>,
    flowerbed:    <svg width="48" height="34" viewBox="0 0 130 90"><ellipse cx="65" cy="80" rx="60" ry="10" fill="#7BD862" opacity="0.5"/><path d="M8 70 Q30 58 65 60 Q100 58 122 70 Q100 80 65 80 Q30 80 8 70 Z" fill="#8B5E2C"/><path d="M14 68 Q40 60 65 62 Q90 60 116 68 Q90 74 65 74 Q40 74 14 68 Z" fill="#6B4420"/><g><line x1="26" y1="68" x2="26" y2="44" stroke="#4DAF35" strokeWidth="2.5"/><circle cx="26" cy="40" r="8" fill="#FF6B9D"/><circle cx="26" cy="40" r="3.5" fill="#FFD54A"/></g><g><line x1="44" y1="70" x2="44" y2="38" stroke="#4DAF35" strokeWidth="2.5"/><g fill="#9B7FE8"><ellipse cx="44" cy="30" rx="4" ry="7"/><ellipse cx="38" cy="36" rx="7" ry="4"/><ellipse cx="50" cy="36" rx="7" ry="4"/><ellipse cx="44" cy="42" rx="4" ry="6"/></g><circle cx="44" cy="36" r="3" fill="#FFD54A"/></g><g><line x1="65" y1="72" x2="65" y2="42" stroke="#4DAF35" strokeWidth="2.5"/><circle cx="65" cy="38" r="8" fill="#FF8FAB"/><circle cx="65" cy="38" r="3.5" fill="#FFD54A"/></g><g><line x1="86" y1="70" x2="86" y2="38" stroke="#4DAF35" strokeWidth="2.5"/><g fill="#74B3FF"><ellipse cx="86" cy="30" rx="4" ry="7"/><ellipse cx="80" cy="36" rx="7" ry="4"/><ellipse cx="92" cy="36" rx="7" ry="4"/><ellipse cx="86" cy="42" rx="4" ry="6"/></g><circle cx="86" cy="36" r="3" fill="#FFD54A"/></g><g><line x1="104" y1="68" x2="104" y2="44" stroke="#4DAF35" strokeWidth="2.5"/><circle cx="104" cy="40" r="8" fill="#FFD54A"/><circle cx="104" cy="40" r="3.5" fill="#E8A800"/></g></svg>,
    gardengnome:  <svg width="28" height="44" viewBox="0 0 70 110"><path d="M18 100 Q14 70 35 64 Q56 70 52 100 Z" fill="#5DBE4A"/><ellipse cx="35" cy="52" rx="15" ry="16" fill="#E8B98E"/><path d="M22 56 Q35 72 48 56 Q44 70 35 72 Q26 70 22 56 Z" fill="#FFF"/><circle cx="29" cy="50" r="2.2" fill="#3A2A1A"/><circle cx="41" cy="50" r="2.2" fill="#3A2A1A"/><ellipse cx="35" cy="58" rx="4" ry="3" fill="#FF8FAB"/><path d="M16 40 L54 40 L35 8 Z" fill="#E85454" stroke="#C03030" strokeWidth="2"/><ellipse cx="35" cy="40" rx="19" ry="5" fill="#F5F5F5"/></svg>,
    birdbath:     <svg width="30" height="44" viewBox="0 0 80 110"><path d="M30 60 L26 100 L54 100 L50 60 Z" fill="#B7C4CB"/><rect x="22" y="96" width="36" height="8" rx="3" fill="#9FB0BA"/><ellipse cx="40" cy="40" rx="34" ry="14" fill="#9FB0BA"/><ellipse cx="40" cy="37" rx="34" ry="13" fill="#C0CDD4"/><ellipse cx="40" cy="36" rx="26" ry="9" fill="#87CEEB"/><ellipse cx="40" cy="34" rx="20" ry="6" fill="#A8DCF0"/><g><ellipse cx="56" cy="30" rx="6" ry="4" fill="#F5C842"/><circle cx="52" cy="28" r="2" fill="#3A2A1A"/><path d="M61 30 L68 28" stroke="#F5C842" strokeWidth="2.5"/></g></svg>,
    pond:         <svg width="52" height="32" viewBox="0 0 130 80"><ellipse cx="65" cy="44" rx="60" ry="32" fill="#6AA84F"/><ellipse cx="65" cy="42" rx="54" ry="28" fill="#3B7BC0"/><ellipse cx="65" cy="40" rx="48" ry="24" fill="#5BA0E9"/><ellipse cx="48" cy="32" rx="14" ry="6" fill="#FFF" opacity="0.3"/><g><ellipse cx="44" cy="44" rx="10" ry="6" fill="#5DBE4A"/></g><g><ellipse cx="82" cy="48" rx="9" ry="5" fill="#5DBE4A"/></g><circle cx="90" cy="36" r="4" fill="#FF8FAB"/><circle cx="90" cy="36" r="1.8" fill="#FFD54A"/></svg>,
    swingset:     <svg width="44" height="44" viewBox="0 0 110 110"><line x1="16" y1="98" x2="30" y2="14" stroke="#A06830" strokeWidth="6" strokeLinecap="round"/><line x1="94" y1="98" x2="80" y2="14" stroke="#A06830" strokeWidth="6" strokeLinecap="round"/><line x1="22" y1="16" x2="88" y2="16" stroke="#8B5E2C" strokeWidth="7" strokeLinecap="round"/><line x1="40" y1="18" x2="40" y2="64" stroke="#7A7A7A" strokeWidth="2.5"/><line x1="70" y1="18" x2="70" y2="64" stroke="#7A7A7A" strokeWidth="2.5"/><rect x="33" y="64" width="44" height="9" rx="4" fill="#F5C842" stroke="#C89A1A" strokeWidth="1.5"/></svg>,
    wateringcan:  <svg width="32" height="40" viewBox="0 0 70 90"><path d="M14 44 Q12 40 16 38 L48 38 Q54 38 54 46 L54 74 Q54 80 46 80 L20 80 Q14 80 14 74 Z" fill="#5DBE4A" stroke="#3B8E2A" strokeWidth="2"/><rect x="14" y="44" width="40" height="6" fill="#7BD862"/><path d="M48 38 L66 30 L66 36 L54 46" fill="#4DAF35" stroke="#3B8E2A" strokeWidth="1.5"/><path d="M12 50 Q4 50 6 60 Q8 56 12 58" fill="none" stroke="#5DBE4A" strokeWidth="3" strokeLinecap="round"/></svg>,
    trampoline:   <svg width="48" height="32" viewBox="0 0 120 80"><ellipse cx="60" cy="56" rx="50" ry="18" fill="#3B8E2A"/><ellipse cx="60" cy="50" rx="50" ry="18" fill="#5DBE4A"/><ellipse cx="60" cy="48" rx="40" ry="13" fill="#7BD862"/><ellipse cx="60" cy="46" rx="40" ry="12" fill="#A8E08A"/><line x1="18" y1="48" x2="14" y2="74" stroke="#7A7A7A" strokeWidth="4" strokeLinecap="round"/><line x1="102" y1="48" x2="106" y2="74" stroke="#7A7A7A" strokeWidth="4" strokeLinecap="round"/></svg>,
    hammock:      <svg width="52" height="36" viewBox="0 0 130 90"><line x1="14" y1="14" x2="14" y2="78" stroke="#8B5E2C" strokeWidth="7" strokeLinecap="round"/><line x1="116" y1="14" x2="116" y2="78" stroke="#8B5E2C" strokeWidth="7" strokeLinecap="round"/><line x1="14" y1="20" x2="36" y2="34" stroke="#A06830" strokeWidth="3"/><line x1="116" y1="20" x2="94" y2="34" stroke="#A06830" strokeWidth="3"/><path d="M30 34 Q65 80 100 34" fill="#FF8FAB" stroke="#E0758F" strokeWidth="2"/><path d="M30 34 Q65 70 100 34" fill="none" stroke="#FFB3C6" strokeWidth="2" opacity="0.7"/><rect x="30" y="32" width="70" height="5" rx="2" fill="#E0758F"/></svg>,
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