# Levelup

Math learning game for kids aged 8 to 10. Next.js App Router, TypeScript, Tailwind, React Context (`src/lib/gameContext.tsx`), Supabase for auth and data. Owner: Abi. She works on Windows with Git Bash and VS Code.

## Flow
Landing (`/`) → `/login` (Google or email, parent only) → `/profiles` (kid picks player, id saved as `levelup_active_profile` in localStorage) → `/home` → `/solo`, `/vs-ai`, `/room`, `/room/shop`. `/onboarding` is old and no longer linked.

## Data (see `supabase/schema.sql`)
- `profiles`: kids, owned by `parent_id`
- `progress`: coins, gems, streak, last_played per profile
- `rooms`: owned_items (jsonb array) and room_items (jsonb keyed by room id) per profile

## Game rules
- Solo: 4 lanes, STONE_SPEED 1.0 (px per frame at 60fps, scaled by frame time), SPAWN_INTERVAL 2800ms. Every 3 correct: level up (max 10) and a reward. Every 2 wrong: -1 coin (never below 0).
- VS AI: rival Zeta, first to 5. Settings live in `src/lib/vsAi.ts`; the battle URL carries only `?difficulty=`. Stones take a fixed time to fall (Easy 6s / Medium 7s / Hard 9s). Zeta answers at 0.78 to 1.18x that time on Easy and Medium (0.8 to 1.2x on Hard), sometimes grabs a wrong stone, and eases off when 2+ ahead. Zeta runs on the game loop clock, so the hint screen pauses it. Rewards Easy 1c, Medium 3c, Hard 5c + 1 gem. Rematch uses `window.location.href`, not `router.push`.
- Streak: same day no change, yesterday +1, otherwise reset to 1. Rewards in `STREAK_MILESTONES` (gameContext): 7 days 5c, 30 days 15c + 1 gem, 100 days 50c + 3 gems; other 10th days +2c. Celebration popup on Home shows once per milestone.
- Coins and gems never go below 0 (clamped in gameContext, including on load).
- Items: only the plant is free (`STARTER_ITEMS`). The window is a room fixture (`ROOM_FIXTURES`), not sold. Everything else, including the door (60c), is bought.
- Solo coin display: starting total stays fixed during play, with separate +earned and -lost trackers. "end game" opens `CoinSummary` (start + earned - lost = new total, counts up, coin shakes). `addCoins`/`addGems` return the change actually applied, so lost coins at 0 aren't counted.

## Fun facts and hints
`src/lib/funFacts.ts` holds 500+ "Did you know?" facts (code file, not the database: same for every kid, works offline). `nextFunFact()` shuffles per kid in localStorage with no repeats until all are seen. `hintFor(question)` picks a tip for add, subtract or times tables, with tricks for x2, x4, x5, x9, x10, x11. Only add facts that are definitely true.

## Adding a shop item
Add it to `ALL_ITEMS` in `src/app/room/page.tsx`, draw its sprite in `FlatSprite` and give it a box in `SPRITE_SIZE` (height must match the drawing's shape). The shop has its own small drawings in `ItemSVGMini` in `src/app/room/shop/page.tsx`, so draw it there too or it shows a "?".

## Design
Sky #5BB8F5 to #C9EEFF, grass #6AC94F, purple #7B6FE8, coins #F5C842, gems #9B7FE8, correct #5DBE4A, wrong #E85454. Fonts: `var(--font-game)` (Fredoka One) and `var(--font-ui)` (Nunito). Chunky 3D cartoon look. All art is hand-written SVG, no emoji in components.

## Working with Abi
- Plain language, no jargon. Show a visual preview before building a new screen.
- Minimal code comments that explain why, not what.
- Commit after each milestone.
- `npm run build` must pass before calling anything done.

## Roadmap
Done: phases 1 to 6 (game, VS AI, streaks, rooms, Supabase). Next: deploy to Vercel, AI hints with OpenAI (key server-side only), parent dashboard.
