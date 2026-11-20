import { describe, expect, test } from 'vitest';
import { Game } from '../../src/core/Game';
import { SaveStore } from '../../src/core/Storage';
import { Viewport } from '../../src/core/Viewport';
import { LEVELS } from '../../src/data/levels';
import { ProgressStore } from '../../src/gameplay/ProgressStore';
import { Journey } from '../../src/scenes/Journey';
import { MenuScene } from '../../src/scenes/MenuScene';
import { LevelScene } from '../../src/scenes/LevelScene';
import { ResultScene } from '../../src/scenes/ResultScene';

describe('Journey', () => {
  test('menu, màn chơi, lưu kết quả và chơi lại dùng chung luồng scene thực', () => {
    const game = new Game({ requestFrame: () => 1, cancelFrame: () => {} }, () => null);
    const viewport = new Viewport();
    const progress = new ProgressStore(new SaveStore(null));
    progress.data.levels['ha-noi'] = { stars: 0, bestScore: 0, cleared: false };
    const journey = new Journey(game, viewport, progress, { reducedMotion: true, openSource: () => {} });
    journey.start();
    expect(game.scenes.current).toBeInstanceOf(MenuScene);
    journey.play({ ...LEVELS[0]!, initialTrashCount: 0, spawnRatePerSec: 0, durationSec: 1, events: [] });
    expect(game.scenes.current).toBeInstanceOf(LevelScene);
    game.scenes.update(1);
    expect(game.scenes.current).toBeInstanceOf(ResultScene);
    expect(progress.data.levels['ha-noi']?.stars).toBe(3);
    const result = game.scenes.current as ResultScene;
    const button = result.buttonBounds('replay')!;
    const sample = { x: button.x + button.width / 2, y: button.y + button.height / 2, id: 1 };
    result.onPointer({ ...sample, phase: 'down' });
    result.onPointer({ ...sample, phase: 'up' });
    expect(game.scenes.current).toBeInstanceOf(LevelScene);
    expect((game.scenes.current as LevelScene).session.tutorial).toBe('done');
  });

  test('màn chưa mở không thể vào qua điều hướng', () => {
    const game = new Game({ requestFrame: () => 1, cancelFrame: () => {} }, () => null);
    const progress = new ProgressStore(new SaveStore(null));
    const journey = new Journey(game, new Viewport(), progress, { reducedMotion: true, openSource: () => {} });
    journey.start();
    journey.play(LEVELS[3]!);
    expect(game.scenes.current).toBeInstanceOf(MenuScene);
  });
});
