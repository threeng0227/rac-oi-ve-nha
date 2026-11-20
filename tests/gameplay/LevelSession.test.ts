import { describe, expect, test } from 'vitest';
import { Viewport } from '../../src/core/Viewport';
import { LevelSession } from '../../src/gameplay/LevelSession';
import { LEVELS } from '../../src/data/levels';

function session(skipTutorial = true): LevelSession {
  const viewport = new Viewport();
  viewport.resize(844, 390, 2);
  return new LevelSession(viewport, { skipTutorial, seed: 42 });
}

function pick(game: LevelSession, id = 1): void {
  const item = game.items.find(t => t.state === 'ground')!;
  game.onPointer({ phase: 'down', x: item.x, y: item.y, id });
  game.onPointer({ phase: 'up', x: item.x, y: item.y, id });
  game.update(0.4);
}

function drop(game: LevelSession, slot: number, binIndex: number, pointer = 1): void {
  const rect = game.slotBounds(slot);
  game.onPointer({ phase: 'down', x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, id: pointer });
  const layout = game.layout;
  game.onPointer({ phase: 'up', x: layout.binX(binIndex) + layout.binWidth / 2,
    y: layout.bins.y + layout.bins.height / 2, id: pointer });
}

describe('LevelSession — normal pointer entry points', () => {
  test('màn đạt sao đổi màu trong hai giây, chỉ mở kết quả sau khi chuyển xong', () => {
    const viewport = new Viewport();
    const game = new LevelSession(viewport, { skipTutorial: true,
      level: { ...LEVELS[0]!, initialTrashCount: 0, spawnRatePerSec: 0, events: [] } });
    game.update(90);
    expect(game.result?.stars).toBe(3);
    expect(game.revealProgress).toBe(0);
    expect(game.resultReady).toBe(false);
    game.update(1);
    expect(game.revealProgress).toBeCloseTo(0.5);
    game.update(1);
    expect(game.resultReady).toBe(true);
    expect(game.revealProgress).toBe(1);
  });
  test('rác nguy hại vào hộp đúng, vào thùng thường bị phạt và vẫn kéo lại được', () => {
    const viewport = new Viewport();
    const level = { ...LEVELS[0]!, initialTrashCount: 1, events: [], spawnRatePerSec: 0,
      trashPool: [{ typeId: 'pin-aa' as const, weight: 1 }] };
    const game = new LevelSession(viewport, { level, skipTutorial: true });
    pick(game);
    drop(game, 0, 0);
    expect(game.score.pollution).toBe(20);
    expect(game.bag.count).toBe(1);
    expect(game.collector.visible).toBe(true);
    const from = game.slotCenter(0);
    const to = game.collector.bounds(game.layout);
    game.onPointer({ phase: 'down', ...from, id: 1 });
    game.onPointer({ phase: 'up', x: to.x + to.width / 2, y: to.y + to.height / 2, id: 1 });
    expect(game.bag.count).toBe(0);
    expect(game.score.score).toBe(50);
  });

  test('hộp quay lại sau mười giây khi túi còn pin, nhặt pin thứ ba bị từ chối', () => {
    const viewport = new Viewport();
    const game = new LevelSession(viewport, { skipTutorial: true });
    game.spawnTrash(3, 'hazard');
    for (const item of game.items.filter(t => t.type.bin === 'hazard')) {
      game.onPointer({ phase: 'down', x: item.x, y: item.y, id: item.id + 10 });
      game.update(0.4);
    }
    expect(game.bag.slots.filter(t => t?.type.bin === 'hazard')).toHaveLength(2);
    game.update(15);
    expect(game.collector.visible).toBe(false);
    game.update(10);
    expect(game.collector.visible).toBe(true);
  });

  test('sự kiện ném rác được chạm xử lý qua cùng đường vào pointer', () => {
    const viewport = new Viewport();
    const game = new LevelSession(viewport, { skipTutorial: true,
      level: { ...LEVELS[0]!, initialTrashCount: 0, spawnRatePerSec: 0, events: [{ eventId: 'NEM_RAC', atSec: 2 }] } });
    game.update(2);
    expect(game.events.active?.id).toBe('NEM_RAC');
    const target = game.eventTarget!;
    game.onPointer({ phase: 'down', x: target.x + target.width / 2, y: target.y + target.height / 2, id: 9 });
    expect(game.score.score).toBe(30);
  });
  test('nhặt và phân loại qua pointer cập nhật điểm, sai làm tăng ô nhiễm', () => {
    const game = session();
    pick(game);
    expect(game.score.score).toBe(5);
    const item = game.bag.slots[0]!;
    const correct = ['recycle', 'food', 'other'].indexOf(item.type.bin);
    drop(game, 0, (correct + 1) % 3);
    expect(game.score.score).toBe(0);
    expect(game.score.pollution).toBe(8);
    drop(game, 0, correct);
    expect(game.score.score).toBe(10);
    expect(game.score.combo).toBe(1);
  });

  test('ô nhiễm đầy kết thúc ngay, callback chỉ chạy một lần và không nhận thêm thao tác', () => {
    const game = session();
    pick(game);
    const item = game.bag.slots[0]!;
    const wrong = (['recycle', 'food', 'other'].indexOf(item.type.bin) + 1) % 3;
    for (let i = 0; i < 13; i++) drop(game, 0, wrong);
    expect(game.finished).toBe(true);
    expect(game.result?.failed).toBe(true);
    expect(game.elapsedSec).toBeLessThan(90);
    expect(game.result?.stars).toBe(0);
    const score = game.score.score;
    game.update(10);
    expect(game.score.score).toBe(score);
  });

  test('hướng dẫn không cộng điểm, ô nhiễm hoặc mẫu số độ sạch', () => {
    const game = session(false);
    pick(game);
    drop(game, 0, 0);
    expect(game.score.score).toBe(0);
    expect(game.score.pollution).toBe(0);
    drop(game, 0, 1);
    expect(game.score.correctCount).toBe(0);
    expect(game.correctTypeIds.has('vo-chuoi')).toBe(true);
    expect(game.score.totalSpawned).toBe(game.items.length);
  });
  test('chỉ báo hoàn thành một lần để ghi dấu lượt chơi cho lần tải sau', () => {
    const viewport = new Viewport();
    let completed = 0;
    const game = new LevelSession(viewport, { skipTutorial: true, onComplete: () => completed++ });
    expect(completed).toBe(0);
    game.update(90);
    game.update(1);
    expect(completed).toBe(1);
  });
  test('hướng dẫn chỉ có một vỏ chuối, đồng hồ dừng tới khi kéo đúng', () => {
    const game = session(false);
    expect(game.items.map(t => t.type.id)).toEqual(['vo-chuoi']);
    game.update(10);
    expect(game.elapsedSec).toBe(0);
    pick(game);
    expect(game.tutorial).toBe('sort');
    drop(game, 0, 0);
    expect(game.bag.count).toBe(1);
    expect(game.tutorial).toBe('sort');
    drop(game, 0, 1);
    expect(game.tutorial).toBe('done');
    expect(game.bag.count).toBe(0);
    game.update(1);
    expect(game.elapsedSec).toBe(1);
    expect(game.items.some(t => t.state === 'ground')).toBe(true);
  });

  test('chạm nhặt chỉ nhận một lần, giữ chỗ cả trong lúc bay', () => {
    const game = session();
    const item = game.items[0]!;
    game.onPointer({ phase: 'down', x: item.x, y: item.y, id: 1 });
    game.onPointer({ phase: 'down', x: item.x, y: item.y, id: 2 });
    expect(game.bag.slots.filter(t => t?.id === item.id)).toHaveLength(1);
    expect(item.state).toBe('flying');
    game.update(0.4);
    expect(item.state).toBe('bag');
  });

  test('thả sai, thả ngoài và pointercancel đều trả về ô cũ', () => {
    const game = session();
    pick(game);
    const item = game.bag.slots[0]!;
    const correct = ['recycle', 'food', 'other'].indexOf(item.type.bin);
    drop(game, 0, (correct + 1) % 3);
    expect(game.bag.slots[0]).toBe(item);
    expect(item.state).toBe('bag');
    const rect = game.slotBounds(0);
    for (const phase of ['up', 'cancel'] as const) {
      game.onPointer({ phase: 'down', x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, id: 7 });
      game.onPointer({ phase, x: -100, y: -100, id: 7 });
      expect(item.state).toBe('bag');
      expect(game.bag.slots[0]).toBe(item);
    }
    drop(game, 0, correct);
    expect(game.bag.count).toBe(0);
    expect(game.sortedCount).toBe(1);
  });

  test('xoay máy khi đang kéo hoặc bay không làm mất rác hay kẹt ô', () => {
    const viewport = new Viewport();
    viewport.resize(844, 390, 2);
    const game = new LevelSession(viewport, { skipTutorial: true, seed: 3 });
    pick(game);
    const item = game.bag.slots[0]!;
    const rect = game.slotBounds(0);
    game.onPointer({ phase: 'down', x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, id: 2 });
    viewport.resize(390, 844, 2);
    game.update(0);
    expect(item.state).toBe('bag');
    expect(game.bag.count).toBe(1);
    for (const ground of game.items.filter(t => t.state === 'ground')) {
      expect(ground.x).toBeGreaterThanOrEqual(game.layout.spawnArea.x);
      expect(ground.x).toBeLessThanOrEqual(game.layout.spawnArea.x + game.layout.spawnArea.width);
    }
    pick(game, 3);
    expect(game.bag.count).toBe(2);
  });

  test('vùng nhặt và ô túi đạt ít nhất 44 CSS px ở hai hướng', () => {
    for (const [w, h] of [[844, 390], [390, 844]]) {
      const viewport = new Viewport();
      viewport.resize(w!, h!, 2);
      const game = new LevelSession(viewport, { skipTutorial: true });
      const rect = game.slotBounds(0);
      expect(rect.width * viewport.scale).toBeGreaterThanOrEqual(44);
      expect(rect.height * viewport.scale).toBeGreaterThanOrEqual(44);
    }
  });

  test('hết giờ dừng sinh rác và giải phóng thao tác kéo', () => {
    const game = session();
    pick(game);
    const rect = game.slotBounds(0);
    game.onPointer({ phase: 'down', x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, id: 1 });
    game.update(100);
    expect(game.finished).toBe(true);
    expect(game.bag.slots[0]?.state).toBe('bag');
    const count = game.items.length;
    game.update(100);
    expect(game.items).toHaveLength(count);
    expect(game.elapsedSec).toBe(90);
  });

  test('exit huỷ tween và bỏ tương tác của scene cũ', () => {
    const game = session();
    const item = game.items[0]!;
    game.onPointer({ phase: 'down', x: item.x, y: item.y, id: 1 });
    game.exit();
    const position = { x: item.x, y: item.y };
    game.update(1);
    game.onPointer({ phase: 'down', x: item.x, y: item.y, id: 3 });
    expect({ x: item.x, y: item.y }).toEqual(position);
    expect(game.elapsedSec).toBe(0);
  });
});
