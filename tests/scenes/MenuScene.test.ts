import { describe, expect, test } from 'vitest';
import { Viewport } from '../../src/core/Viewport';
import { MenuScene } from '../../src/scenes/MenuScene';

describe('MenuScene', () => {
  test('nút Chơi, Sổ tay và âm thanh gọi đúng hành động qua pointer', () => {
    const calls: string[] = [];
    const scene = new MenuScene(new Viewport(), {
      play: () => calls.push('play'), handbook: () => calls.push('handbook'),
      toggleMute: () => calls.push('mute'), isMuted: () => true,
    });
    for (const action of ['play', 'handbook', 'mute']) {
      const rect = scene.buttonBounds(action)!;
      scene.onPointer({ phase: 'down', id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
      scene.onPointer({ phase: 'up', id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
    }
    expect(calls).toEqual(['play', 'handbook', 'mute']);
  });

  test('up ngoài nút, sai pointer, cancel và exit đều không kích hoạt', () => {
    let calls = 0;
    const scene = new MenuScene(new Viewport(), {
      play: () => calls++, handbook: () => {}, toggleMute: () => {}, isMuted: () => true,
    });
    const rect = scene.buttonBounds('play')!;
    const point = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    scene.onPointer({ phase: 'down', id: 1, ...point });
    scene.onPointer({ phase: 'up', id: 2, ...point });
    scene.onPointer({ phase: 'up', id: 1, x: -1, y: -1 });
    scene.onPointer({ phase: 'down', id: 1, ...point });
    scene.onPointer({ phase: 'cancel', id: 1, ...point });
    scene.onPointer({ phase: 'up', id: 1, ...point });
    scene.onPointer({ phase: 'down', id: 1, ...point });
    scene.exit();
    scene.onPointer({ phase: 'up', id: 1, ...point });
    expect(calls).toBe(0);
  });

  test('ba nút nằm trong khung và đạt 44 CSS px ở hai hướng', () => {
    for (const [width, height] of [[844, 390], [390, 844]]) {
      const viewport = new Viewport();
      viewport.resize(width!, height!, 2);
      const scene = new MenuScene(viewport, { play() {}, handbook() {}, toggleMute() {}, isMuted: () => true });
      for (const action of ['play', 'handbook', 'mute']) {
        const rect = scene.buttonBounds(action)!;
        expect(rect.height * viewport.scale).toBeGreaterThanOrEqual(44);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height);
      }
    }
  });
});
