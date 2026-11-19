# Levelup

A math game for kids aged 8 to 10. Kids steer their character between lanes to catch the stone with the right answer, race an AI rival called Zeta, and spend the coins and gems they earn decorating four rooms.

## What's in it

- **Solo run**: four lanes, answer stones fall, level up every 5 correct answers (max level 10), rewards every 5 correct
- **VS AI**: race Zeta on Easy, Medium or Hard, first to 5 wins
- **Daily streak**: celebrations at 7, 30 and 100 days; the Garden and Treehouse unlock with longer streaks
- **Rooms and shop**: 41 hand-drawn SVG items across furniture, walls, floor, special and garden
- **Family accounts**: a parent signs in once (Google or email), each kid picks their own player, progress is saved per kid

## Tech

Next.js (App Router), TypeScript, Tailwind CSS, React Context for game state, Supabase for auth and storage.

## Running it locally

1. `npm install`
2. Create a Supabase project, open the SQL editor and run `supabase/schema.sql`
3. In Supabase, turn on the Google provider under Authentication and add `http://localhost:3000/profiles` to the redirect URLs
4. Copy `.env.example` to `.env.local` and fill in your project URL and anon key
5. `npm run dev` and open http://localhost:3000

## Flow

Landing page → parent login → "Who's playing?" → home hub → Solo, VS AI or Rooms. Tap your avatar on the home screen to switch players.
