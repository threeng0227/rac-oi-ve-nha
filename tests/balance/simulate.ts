import type { Layout } from '../../src/core/Layout';
import { Random } from '../../src/core/Random';
import type { LevelDef } from '../../src/data/levels';
import { Bag } from '../../src/gameplay/Bag';
import { NORMAL_BIN_IDS } from '../../src/gameplay/Bin';
import { ScoreSystem, type LevelResult } from '../../src/gameplay/ScoreSystem';
import { Spawner } from '../../src/gameplay/Spawner';
import type { TrashItem } from '../../src/gameplay/TrashItem';

const REACTION_SEC = 0.4;
const FLIGHT_SEC = 0.3;
const DRAG_SPEED = 1000;
const STEP_SEC = 0.05;
const EPSILON = 1e-8;

export interface SimulationResult {
  readonly result: LevelResult;
  readonly actions: number;
  readonly pickedCount: number;
  readonly sortedCount: number;
}

/**
 * Stage 3 baseline. Uses the production spawn, bag and scoring rules. Event
 * burdens and collector absences must be exercised with their production
 * implementations when Stage 4 adds them. A hazard collector is available
 * throughout this baseline. The player always sorts correctly.
 *
 * Each pickup and each drag requires 400ms reaction. Pickup flight lasts
 * 300ms, overlapping the next reaction. Drag then travels from its actual bag
 * slot to the correct bin at 1000 virtual units/s. The 50ms simulation step
 * rounds action completion upward, never granting extra time to the player.
 */
export function simulatePerfectPlayer(level: LevelDef, layout: Layout, seed: number): SimulationResult {
  const spawner = new Spawner(level, new Random(seed));
  const decisions = new Random(seed ^ 0x5f3759df);
  const bag = new Bag();
  const score = new ScoreSystem(level.durationSec);
  const ground = spawner.initial(layout);
  for (const item of ground) score.registerSpawn(item, 0);

  let held: TrashItem | null = null;
  let slot = -1;
  let flightEnds = 0;
  let dropEnds = 0;
  let nextAction = REACTION_SEC;
  let actions = 0;
  let pickedCount = 0;
  let sortedCount = 0;
  let elapsed = 0;

  while (elapsed < level.durationSec - EPSILON && !score.failed) {
    const end = Math.min(level.durationSec, elapsed + STEP_SEC);
    const dt = end - elapsed;
    const spawned = spawner.update(dt, end, layout);
    for (const item of spawned) score.registerSpawn(item, end);
    ground.push(...spawned);
    elapsed = end;

    if (held?.state === 'flying' && elapsed + EPSILON >= flightEnds) bag.settle(held);
    if (held?.state === 'dragging' && elapsed + EPSILON >= dropEnds) {
      const item = bag.removeDragged(0);
      if (!item) throw new Error('A simulated drag lost its reserved bag slot');
      score.sort(item, true);
      sortedCount++;
      held = null;
    }

    if (elapsed + EPSILON >= nextAction && elapsed < level.durationSec - EPSILON) {
      if (held?.state === 'bag') {
        if (!bag.beginDrag(slot, 0)) throw new Error('A settled simulated item could not be dragged');
        const fromX = layout.bagSlotX(slot) + layout.bagSlotSize / 2;
        const fromY = layout.bag.y + layout.bag.height / 2;
        const bin = NORMAL_BIN_IDS.findIndex(id => id === held?.type.bin);
        const toX = bin < 0 ? layout.spawnArea.x + layout.spawnArea.width : layout.binX(bin) + layout.binWidth / 2;
        const toY = bin < 0 ? layout.playfield.y + layout.playfield.height / 2 : layout.bins.y + layout.bins.height / 2;
        dropEnds = elapsed + Math.hypot(toX - fromX, toY - fromY) / DRAG_SPEED;
        nextAction = dropEnds + REACTION_SEC;
        actions++;
      } else if (!held && ground.length > 0) {
        const index = decisions.int(0, ground.length - 1);
        const item = ground.splice(index, 1)[0]!;
        const reserved = bag.tryAdd(item);
        if (reserved === null) throw new Error('An empty simulated bag rejected a pickup');
        held = item;
        slot = reserved;
        score.pick(item);
        flightEnds = elapsed + FLIGHT_SEC;
        nextAction = elapsed + REACTION_SEC;
        pickedCount++;
        actions++;
      }
    }
    score.update(dt, ground.length);
  }

  bag.cancelAllDrags();
  return {
    result: score.finish(bag.slots.filter((item): item is TrashItem => item !== null)),
    actions,
    pickedCount,
    sortedCount,
  };
}
