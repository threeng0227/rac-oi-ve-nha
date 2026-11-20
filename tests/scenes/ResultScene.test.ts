import { describe, expect, test, vi as mock } from 'vitest';
import { Viewport } from '../../src/core/Viewport';
import { LEVELS } from '../../src/data/levels';
import type { LevelResult } from '../../src/gameplay/ScoreSystem';
import { ResultScene } from '../../src/scenes/ResultScene';

const result: LevelResult = {
  score: 420, stars: 3, cleanliness: 1, failed: false,
  correctCount: 20, totalSpawned: 20, mistakes: 0, hazardMistakes: 0, remainingCount: 0, hazardRemainingCount: 0,
};

function scene(viewport = new Viewport()) {
  const replay = mock.fn();
  const map = mock.fn();
  return { scene: new ResultScene(viewport, LEVELS[0]!, result, { replay, map }), replay, map };
}

function point(subject: ResultScene, action: 'replay' | 'map') {
  const rect = subject.buttonBounds(action)!;
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

describe('ResultScene', () => {
  test('chạm xuống rồi thả trên cùng nút mới chơi lại một lần', () => {
    const { scene: subject, replay } = scene();
    const p = point(subject, 'replay');
    subject.onPointer({ ...p, phase: 'up', id: 1 });
    expect(replay).not.toHaveBeenCalled();
    subject.onPointer({ ...p, phase: 'down', id: 1 });
    subject.onPointer({ ...p, phase: 'up', id: 2 });
    expect(replay).not.toHaveBeenCalled();
    subject.onPointer({ ...p, phase: 'up', id: 1 });
    subject.onPointer({ ...p, phase: 'up', id: 1 });
    expect(replay).toHaveBeenCalledTimes(1);
  });

  test('cancel hoặc thả ra ngoài không kích hoạt nút', () => {
    const { scene: subject, replay, map } = scene();
    const p = point(subject, 'replay');
    subject.onPointer({ ...p, phase: 'down', id: 1 });
    subject.onPointer({ ...p, phase: 'cancel', id: 1 });
    subject.onPointer({ ...p, phase: 'up', id: 1 });
    subject.onPointer({ ...p, phase: 'down', id: 2 });
    subject.onPointer({ ...point(subject, 'map'), phase: 'up', id: 2 });
    expect(replay).not.toHaveBeenCalled();
    expect(map).not.toHaveBeenCalled();
  });

  test('nút bản đồ gọi đúng hành động khi được cung cấp', () => {
    const { scene: subject, replay, map } = scene();
    const p = point(subject, 'map');
    subject.onPointer({ ...p, phase: 'down', id: 1 });
    subject.onPointer({ ...p, phase: 'up', id: 1 });
    expect(map).toHaveBeenCalledTimes(1);
    expect(replay).not.toHaveBeenCalled();
    const withoutMap = new ResultScene(new Viewport(), LEVELS[0]!, result, { replay });
    expect(withoutMap.buttonBounds('map')).toBeNull();
  });

  test('các nút đủ 44 CSS px và nằm trong màn ở cả hai hướng', () => {
    for (const [width, height] of [[844, 390], [390, 844], [720, 1100], [1800, 720]]) {
      const viewport = new Viewport();
      viewport.resize(width!, height!, 2);
      const { scene: subject } = scene(viewport);
      for (const action of ['replay', 'map'] as const) {
        const rect = subject.buttonBounds(action)!;
        expect(rect.width * viewport.scale).toBeGreaterThanOrEqual(44);
        expect(rect.height * viewport.scale).toBeGreaterThanOrEqual(44);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width);
        expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height);
      }
    }
  });

  test('exit vô hiệu hoá thao tác còn giữ của scene cũ', () => {
    const { scene: subject, replay } = scene();
    const p = point(subject, 'replay');
    subject.onPointer({ ...p, phase: 'down', id: 1 });
    subject.exit();
    subject.onPointer({ ...p, phase: 'up', id: 1 });
    expect(replay).not.toHaveBeenCalled();
  });
});
