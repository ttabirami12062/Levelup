// VS AI difficulty settings. The battle reads these by difficulty name only,
// so rewards can't be changed by editing the page address.
//
// Zeta's answer time is a fraction of the stone's fall time (fallSeconds), so a
// pace above 1 means the kid can beat Zeta by catching the stone. Tuned with a
// simulation: an average kid wins about 65% on easy, 50% on medium, 30% on hard.
export interface Difficulty {
  id:          "easy" | "medium" | "hard";
  label:       string;
  description: string;
  reward:      number;
  gems:        number;
  startLevel:  number;
  fallSeconds: number;
  minPace:     number;
  maxPace:     number;
  missChance:  number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: "easy",   label: "Easy",   description: "Zeta is quick but clumsy", reward: 1, gems: 0, startLevel: 1, fallSeconds: 6, minPace: 0.8, maxPace: 1.2, missChance: 0.2 },
  { id: "medium", label: "Medium", description: "Zeta fights back hard",    reward: 3, gems: 0, startLevel: 4, fallSeconds: 7, minPace: 0.8, maxPace: 1.2, missChance: 0.15 },
  { id: "hard",   label: "Hard",   description: "Zeta is a math whiz",      reward: 5, gems: 1, startLevel: 7, fallSeconds: 9, minPace: 0.8, maxPace: 1.2, missChance: 0.15 },
];

export function getDifficulty(id: string | null): Difficulty {
  return DIFFICULTIES.find(d => d.id === id) ?? DIFFICULTIES[1];
}

// How long Zeta takes on this wave, or null if Zeta will grab a wrong stone.
// Zeta slows down when 2+ ahead and speeds up when 2+ behind, so games stay close.
export function rollZetaTime(d: Difficulty, fallMs: number, zetaScore: number, playerScore: number): number | null {
  let pace = d.minPace + Math.random() * (d.maxPace - d.minPace);
  let miss = d.missChance;
  const lead = zetaScore - playerScore;
  if (lead >= 2)  { pace *= 1.15; miss += 0.1; }
  if (lead <= -2) { pace *= 0.9; }
  if (Math.random() < miss) return null;
  return pace * fallMs;
}
