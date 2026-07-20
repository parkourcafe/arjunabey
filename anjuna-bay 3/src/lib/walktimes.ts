/**
 * Formats a villa's walkTimes map (content/config.ts) into labelled rows for
 * WalkTimeMap.astro. Keeps display-label mapping in one place so content
 * authors only ever write short keys (thomasBeach, padangPadang, bingin…).
 */

const LABELS: Record<string, string> = {
  thomasBeach: 'Thomas Beach',
  padangPadang: 'Padang Padang',
  bingin: 'Bingin',
  impossibles: 'Impossibles',
  airport: 'Ngurah Rai Airport (drive)',
};

export interface WalkTimeRow {
  key: string;
  label: string;
  minutes: number;
}

export function formatWalkTimes(walkTimes: Record<string, number>): WalkTimeRow[] {
  return Object.entries(walkTimes)
    .map(([key, minutes]) => ({ key, label: LABELS[key] ?? key, minutes }))
    .sort((a, b) => a.minutes - b.minutes);
}
