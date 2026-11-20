import { describe, expect, test } from 'vitest';
import { createDefaultSave } from '../../src/core/Storage';
import { Viewport } from '../../src/core/Viewport';
import { LEVELS } from '../../src/data/levels';
import { MapScene, VIETNAM_COAST, LEVEL_COORDINATES, ARCHIPELAGOS } from '../../src/scenes/MapScene';

function click(scene: MapScene, action: string): void {
  const rect = scene.buttonBounds(action)!;
  scene.onPointer({ phase: 'down', id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
  scene.onPointer({ phase: 'up', id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
}

describe('MapScene', () => {
  test('chỉ màn đầu mở khi chưa chơi, màn sau chỉ mở tuần tự', () => {
    const save = createDefaultSave();
    const played: string[] = [];
    const scene = new MapScene(new Viewport(), save, { play: level => played.push(level.id), back() {}, handbook() {} });
    click(scene, 'ha-noi');
    click(scene, 'ha-long');
    expect(played).toEqual(['ha-noi']);
    save.levels['ha-noi'] = { stars: 1, bestScore: 50, cleared: true };
    click(scene, 'ha-long');
    expect(played).toEqual(['ha-noi', 'ha-long']);
  });

  test('phân trang đi đủ mười màn, mỗi nút chọn đúng LevelDef', () => {
    const save = createDefaultSave();
    for (const level of LEVELS) save.levels[level.id] = { stars: 3, bestScore: 50, cleared: true };
    const played: string[] = [];
    const scene = new MapScene(new Viewport(), save, { play: level => played.push(level.id), back() {}, handbook() {} });
    for (const id of ['ha-noi', 'ha-long', 'hoi-an', 'da-lat']) click(scene, id);
    click(scene, 'next');
    for (const id of ['concert', 'nhieu-loc', 'cai-rang', 'giao-thua']) click(scene, id);
    click(scene, 'next');
    for (const id of ['sa-pa', 'con-dao']) click(scene, id);
    expect(played).toEqual(LEVELS.map(level => level.id));
    expect(scene.buttonBounds('ha-noi')).toBeNull();
    click(scene, 'previous');
    expect(scene.buttonBounds('concert')).not.toBeNull();
  });

  test('bản đồ có hai quần đảo và tọa độ địa lý cho cả mười màn', () => {
    expect(VIETNAM_COAST.length).toBeLessThanOrEqual(120);
    expect(VIETNAM_COAST.length).toBeGreaterThan(20);
    expect(ARCHIPELAGOS.map(group => group.id)).toEqual(['hoang-sa', 'truong-sa']);
    expect(Object.keys(LEVEL_COORDINATES)).toEqual(LEVELS.map(level => level.id));
    expect(LEVEL_COORDINATES['sa-pa'].lat).toBeGreaterThan(LEVEL_COORDINATES['ha-noi'].lat);
    expect(LEVEL_COORDINATES['con-dao'].lat).toBeLessThan(LEVEL_COORDINATES['cai-rang'].lat);
    expect(LEVEL_COORDINATES['con-dao'].lon).toBeGreaterThan(LEVEL_COORDINATES['cai-rang'].lon);
  });

  test('các nút không chồng nhau và đạt vùng chạm tối thiểu ở hai hướng', () => {
    for (const [width, height] of [[844, 390], [390, 844]]) {
      const viewport = new Viewport();
      viewport.resize(width!, height!, 2);
      const scene = new MapScene(viewport, createDefaultSave(), { play() {}, back() {}, handbook() {} });
      const buttons = ['ha-noi', 'ha-long', 'hoi-an', 'da-lat', 'back', 'handbook', 'next']
        .map(action => scene.buttonBounds(action)!);
      for (const button of buttons) {
        expect(button.height * viewport.scale).toBeGreaterThanOrEqual(44);
        expect(button.y + button.height).toBeLessThanOrEqual(viewport.height);
      }
      for (const [index, button] of buttons.entries()) {
        for (const other of buttons.slice(index + 1)) {
          const intersects = button.x < other.x + other.width && button.x + button.width > other.x &&
            button.y < other.y + other.height && button.y + button.height > other.y;
          expect(intersects).toBe(false);
        }
      }
    }
  });
});
