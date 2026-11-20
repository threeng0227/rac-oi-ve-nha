import { describe, expect, test } from 'vitest';
import { computeLayout } from '../../src/core/Layout';
import { Viewport } from '../../src/core/Viewport';
import { LEVELS } from '../../src/data/levels';
import { simulatePerfectPlayer } from './simulate';

const SCREENS = [
  { name: 'landscape narrow', width: 1100, height: 720 },
  { name: 'landscape wide', width: 1800, height: 720 },
  { name: 'portrait short', width: 720, height: 1100 },
  { name: 'portrait tall', width: 720, height: 1800 },
] as const;

describe('balance — 400ms perfect player, baseline before event systems', () => {
  test('seeded runs repeat the same result and actually process two actions per item', () => {
    const viewport = new Viewport();
    viewport.resize(1100, 720, 1);
    const layout = computeLayout(viewport);
    const first = simulatePerfectPlayer(LEVELS[0]!, layout, 2026);
    expect(first).toEqual(simulatePerfectPlayer(LEVELS[0]!, layout, 2026));
    expect(first.actions).toBeGreaterThan(0);
    expect(first.actions).toBe(first.pickedCount + first.sortedCount);
    expect(first.result.correctCount).toBe(first.sortedCount);
    expect(first.result.mistakes).toBe(0);
    expect(first.result.totalSpawned).toBeGreaterThan(LEVELS[0]!.initialTrashCount);
  });

  test('a short round cannot skip the second reaction and an overloaded round fails', () => {
    const viewport = new Viewport();
    viewport.resize(1100, 720, 1);
    const layout = computeLayout(viewport);
    const short = { ...LEVELS[0]!, durationSec: 0.7, initialTrashCount: 2, spawnRatePerSec: 0 };
    const shortRun = simulatePerfectPlayer(short, layout, 1);
    expect(shortRun.pickedCount).toBe(1);
    expect(shortRun.sortedCount).toBe(0);
    expect(shortRun.result.stars).toBe(0);
    const overloaded = { ...LEVELS[0]!, initialTrashCount: 100, spawnRatePerSec: 4 };
    expect(simulatePerfectPlayer(overloaded, layout, 1).result.stars).toBeLessThan(3);
  });

  for (const screen of SCREENS) {
    const viewport = new Viewport();
    viewport.resize(screen.width, screen.height, 1);
    const layout = computeLayout(viewport);
    for (const level of LEVELS) {
      test(`${level.id} / ${screen.name} — at least 950 of 1000 runs earn three stars`, () => {
        let threeStars = 0;
        let minCleanliness = 1;
        for (let seed = 1; seed <= 1000; seed++) {
          const { result } = simulatePerfectPlayer(level, layout, seed);
          if (result.stars === 3) threeStars++;
          minCleanliness = Math.min(minCleanliness, result.cleanliness);
        }
        expect(threeStars, `${level.id} ${screen.name}: ${threeStars}/1000, minimum cleanliness ${minCleanliness.toFixed(3)}`)
          .toBeGreaterThanOrEqual(950);
      }, 60_000);
    }
  }
});
