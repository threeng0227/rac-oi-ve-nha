import type { Layout, Rect } from '../../src/core/Layout';
import { Random } from '../../src/core/Random';
import { Viewport } from '../../src/core/Viewport';
import type { LevelDef } from '../../src/data/levels';
import { LevelSession } from '../../src/gameplay/LevelSession';
import type { LevelResult } from '../../src/gameplay/ScoreSystem';
import type { TrashItem } from '../../src/gameplay/TrashItem';

const REACTION_SEC = 0.4;
const DRAG_SPEED = 1000;
const STEP_SEC = 0.05;
const EPSILON = 1e-8;
const TAP_EVENTS = new Set(['NEM_RAC', 'CUU_SINH_VAT', 'BAI_RAC_TU_PHAT']);

export interface SimulationResult {
  readonly result: LevelResult;
  readonly actions: number;
  readonly pickedCount: number;
  readonly sortedCount: number;
  readonly eventActions: number;
  readonly hazardSorted: number;
  readonly peakBagCount: number;
  readonly overlappingActions: number;
}

interface PendingDrag {
  readonly item: TrashItem;
  readonly target: Rect;
  readonly endSec: number;
  readonly pointerId: number;
}

const center = (rect: Rect): { x: number; y: number } => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});

/**
 * Exercises the production session through pointer input, including scheduled
 * events, moving trash, six bag slots, and returning hazardous collectors.
 * Each pickup, drag and event tap requires 400ms reaction. Drag then travels
 * from its actual bag slot to its target at 1000 virtual units/s. Reduced
 * motion removes visual flight only, whose normal 300ms duration already fits
 * inside the following reaction. The 50ms simulation step rounds completion
 * upward and the player always classifies the item actually picked up.
 * Two thumbs allow drag travel to overlap the next reaction or another drag.
 * There are at most two active pointers and still 400ms between every action.
 * The player keeps a few items in the bag, then chooses the shortest legal drag.
 * During the final ten seconds they drain the bag before collecting more.
 */
export function simulatePerfectPlayer(level: LevelDef, layout: Layout, seed: number): SimulationResult {
  const viewport = new Viewport();
  viewport.resize(layout.width, layout.height, 1);
  const session = new LevelSession(viewport, { level, skipTutorial: true, seed, reducedMotion: true });
  const decisions = new Random(seed ^ 0x5f3759df);
  const pending: PendingDrag[] = [];
  let nextAction = REACTION_SEC;
  let waitingForWork = false;
  let actions = 0;
  let pickedCount = 0;
  let sortedCount = 0;
  let eventActions = 0;
  let hazardSorted = 0;
  let peakBagCount = 0;
  let overlappingActions = 0;

  while (!session.finished) {
    session.update(Math.min(STEP_SEC, level.durationSec - session.elapsedSec));
    if (session.finished) break;
    const elapsed = session.elapsedSec;
    for (const drag of [...pending]) {
      if (elapsed + EPSILON < drag.endSec) continue;
      const target = center(drag.target);
      session.onPointer({ phase: 'up', ...target, id: drag.pointerId });
      if (drag.item.state === 'sorted') {
        sortedCount++;
        if (drag.item.type.bin === 'hazard') hazardSorted++;
      }
      pending.splice(pending.indexOf(drag), 1);
    }
    const pointerId = [0, 1].find(id => !pending.some(drag => drag.pointerId === id));
    if (pointerId === undefined || elapsed + EPSILON < nextAction) continue;

    const eventTarget = session.eventTarget;
    const tappingEvent = eventTarget !== null && TAP_EVENTS.has(session.eventId ?? '');
    const slots = session.bag.slots;
    const hazardous = slots.findIndex(item => item?.state === 'bag' && item.type.bin === 'hazard');
    let normal = -1;
    let shortestDrag = Infinity;
    for (const [index, item] of slots.entries()) {
      if (item?.state !== 'bag' || item.type.bin === 'hazard') continue;
      const from = session.slotCenter(index);
      const bin = session.bins.find(bin => bin.id === item.type.bin)!;
      const to = center(bin.bounds(session.layout));
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      if (distance < shortestDrag) { shortestDrag = distance; normal = index; }
    }
    const hazardCount = slots.filter(item => item?.type.bin === 'hazard').length;
    const ground = session.items.filter(item => item.state === 'ground' &&
      (item.type.bin !== 'hazard' || hazardCount < 2));
    const ordinaryGround = ground.filter(item => item.type.bin !== 'hazard');
    const pool = !session.collector.visible && ordinaryGround.length ? ordinaryGround : ground;
    const urgentHazard = session.collector.visible && hazardous >= 0;
    const fillingBag = session.bag.count < 3 && pool.length > 0 && session.remainingSec > 10;
    const slot = urgentHazard ? hazardous : fillingBag ? -1 : normal;
    const available = tappingEvent || slot >= 0 || (!session.bag.isFull && pool.length > 0);
    if (!available) { if (pending.length === 0) waitingForWork = true; continue; }
    if (waitingForWork) {
      waitingForWork = false;
      nextAction = elapsed + REACTION_SEC;
      continue;
    }

    if (tappingEvent) {
      const target = center(eventTarget);
      session.onPointer({ phase: 'down', ...target, id: pointerId });
      session.onPointer({ phase: 'up', ...target, id: pointerId });
      if (pending.length > 0) overlappingActions++;
      eventActions++;
      actions++;
      nextAction = elapsed + REACTION_SEC;
      continue;
    }
    if (slot >= 0) {
      const item = slots[slot]!;
      const from = session.slotCenter(slot);
      const bin = session.bins.find(bin => bin.id === item.type.bin);
      const target = item.type.bin === 'hazard' ? session.collector.bounds(session.layout) : bin!.bounds(session.layout);
      const to = center(target);
      session.onPointer({ phase: 'down', ...from, id: pointerId });
      if (item.state !== 'dragging') throw new Error('A settled simulated item could not be dragged');
      if (pending.length > 0) overlappingActions++;
      pending.push({ item, target, endSec: elapsed + Math.hypot(to.x - from.x, to.y - from.y) / DRAG_SPEED, pointerId });
      actions++;
      nextAction = elapsed + REACTION_SEC;
      continue;
    }
    const item = decisions.pick(pool);
    if (!item || session.bag.isFull) continue;
    const previous = new Set(slots.filter(entry => entry !== null));
    session.onPointer({ phase: 'down', x: item.x, y: item.y, id: pointerId });
    session.onPointer({ phase: 'up', x: item.x, y: item.y, id: pointerId });
    if (session.bag.slots.some(entry => entry !== null && !previous.has(entry))) pickedCount++;
    peakBagCount = Math.max(peakBagCount, session.bag.count);
    if (pending.length > 0) overlappingActions++;
    actions++;
    nextAction = elapsed + REACTION_SEC;
  }

  if (!session.result) throw new Error('A simulated round ended without a result');
  const result = session.result;
  session.exit();
  return { result, actions, pickedCount, sortedCount, eventActions, hazardSorted, peakBagCount, overlappingActions };
}
