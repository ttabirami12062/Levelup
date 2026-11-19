# Changelog

Everything that changed in Levelup, newest first, in plain language.

## 19 November 2026: Getting ready to launch

### VS AI: a fair race against Zeta
- Before, Zeta won almost every Medium and Hard game and lost almost every Easy one. Now stones take a fixed time to fall (Easy 6s, Medium 7s, Hard 9s) and Zeta answers around that time, so kids can really beat it.
- Zeta sometimes grabs the wrong stone ("Zeta missed!") and slows down when it's 2 or more points ahead, so games stay close.
- The hint button now pauses Zeta too.
- Zeta always smiles, wiggles like a twinkling star when it scores, and keeps celebrating on the "Zeta wins!" screen.
- Rewards can't be changed by editing the web address any more.
- Tested with a simulation: an average kid wins about 57% on Easy, 42% on Medium and 31% on Hard.

### Solo and VS AI
- Kids now see the character they picked, instead of always the same one.
- Stones fall at the same speed on every screen (newer 120Hz screens used to be twice as fast).
- Solo shows the starting coin total, a green tracker for coins earned and a red tracker for coins lost.
- "end game" opens a summary that adds it all up (for example 36 + 5 − 2 = 39), counts the total up and gives the coin a happy shake.
- 514 "Did you know?" facts, shown in a shuffled order with no repeats until all have been seen.
- Hints now match the question: adding tips, taking-away tips, and times-table tricks for the actual numbers.

### Coins, gems and streaks
- Coins and gems can never go below zero, even with a quick double tap in the shop.
- Streak rewards: 7 days = 5 coins, 30 days = 15 coins + 1 gem, 100 days = 50 coins + 3 gems, other 10th days = 2 coins.
- The celebration shows once per milestone and always shows the real reward.

### Rooms and shop
- Only the plant and the window are free. Everything else, including the door, is bought.
- All prices are now between 30 and 150 coins.
- A Shop button on the Home screen.
- Switching between rooms can no longer mix up their layouts, and dragging furniture saves once instead of on every tiny move.
- The door, Sorting Hat and Gaming Console now sit where you drop them.
- If a purchase can't be saved, the coins are given back.

### Home and How to Play
- A How to Play side panel (the ? button) explains every mode, level, reward, streak and the shop in kid-friendly words.
- All emoji replaced with hand-drawn SVG icons.
- A friendly "we lost the internet" card instead of showing 0 coins when Supabase can't be reached.

### Parent login
- Sign in and Create account now look clearly different, with their own tabs, colors and icons.
- New passwords need at least 6 characters, a capital letter and a number, with a live checklist.
- Create account asks for the password twice.
- Signing up with an email that already has an account says so and switches to Sign in.
- Clear messages instead of raw errors, plus reminders to check the Spam folder for the confirmation email.
- The confirmation email link brings parents straight back to the player picker.

### Behind the scenes
- If loading fails, nothing is saved, so a bad connection can never overwrite real coins, rooms or purchases with zeros.
- A daily check-in (Vercel Cron calling `/api/keep-alive`) keeps the free Supabase project from pausing.
- `CLAUDE.md` updated to match how the game really works.

## Earlier

- Production build fixes, parent login before playing, database schema and README.
- Sprite overhaul: 32 shop items redrawn, tray placement and scroll arrows.
- VS AI fixes: Zeta moves on Easy, first to the stone scores.
- Phases 1 to 6: the runner game, VS AI, streaks, decorating rooms and Supabase accounts.
