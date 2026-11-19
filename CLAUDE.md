# Levelup

Math learning game for kids aged 8 to 10. Next.js App Router, TypeScript, Tailwind, React Context (`src/lib/gameContext.tsx`), Supabase for auth and data. Owner: Abi. She works on Windows with Git Bash and VS Code.

## Flow
Landing (`/`) → `/login` (Google or email, parent only) → `/profiles` (kid picks player, id saved as `levelup_active_profile` in localStorage) → `/home` → `/solo`, `/vs-ai`, `/room`, `/room/shop`. `/onboarding` is old and no longer linked.

## Data (see `supabase/schema.sql`)
- `profiles`: kids, owned by `parent_id`
- `progress`: coins, gems, streak, last_played per profile
- `rooms`: owned_items (jsonb array) and room_items (jsonb keyed by room id) per profile

## Game rules
- Solo: 4 lanes, STONE_SPEED 1.0, SPAWN_INTERVAL 2800ms. Every 5 correct: level up (max 10) and a reward. Every 5 wrong: -1 coin (never below 0).
- VS AI: rival Zeta, Easy 8000ms / Medium 5000ms / Hard 3000ms, first to 5. Rewards Easy 1c, Medium 3c, Hard 5c + 1 gem. Rematch uses `window.location.href`, not `router.push`.
- Streak: same day no change, yesterday +1, otherwise reset to 1. Celebrations at 7, 30, 100.

## Adding a shop item
Add it to `ALL_ITEMS` in `src/app/room/page.tsx` and draw its sprite in `FlatSprite` there. The shop imports from the room page.

## Design
Sky #5BB8F5 to #C9EEFF, grass #6AC94F, purple #7B6FE8, coins #F5C842, gems #9B7FE8, correct #5DBE4A, wrong #E85454. Fonts: `var(--font-game)` (Fredoka One) and `var(--font-ui)` (Nunito). Chunky 3D cartoon look. All art is hand-written SVG, no emoji in components.

## Working with Abi
- Plain language, no jargon. Show a visual preview before building a new screen.
- Minimal code comments that explain why, not what.
- Commit after each milestone.
- `npm run build` must pass before calling anything done.

## Roadmap
Done: phases 1 to 6 (game, VS AI, streaks, rooms, Supabase). Next: deploy to Vercel, AI hints with OpenAI (key server-side only), parent dashboard.
