import { describe, expect, test } from 'vitest';
import { createDefaultSave } from '../../src/core/Storage';
import { Viewport } from '../../src/core/Viewport';
import { TRASH_TYPES } from '../../src/data/trashTypes';
import { HandbookScene } from '../../src/scenes/HandbookScene';

function click(scene: HandbookScene, action: string): void {
  const rect = scene.buttonBounds(action)!;
  scene.onPointer({ phase: 'down', id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
  scene.onPointer({ phase: 'up', id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
}

describe('HandbookScene', () => {
  test('thẻ khóa không mở được, thẻ đã sưu tập mở chi tiết và nguồn', () => {
    const save = createDefaultSave();
    save.handbook = ['chai-nhua-pet'];
    const urls: string[] = [];
    const scene = new HandbookScene(new Viewport(), save, { back() {}, openSource: url => urls.push(url) });
    click(scene, 'lon-nhom');
    expect(scene.selectedTypeId).toBeNull();
    click(scene, 'chai-nhua-pet');
    expect(scene.selectedTypeId).toBe('chai-nhua-pet');
    click(scene, 'source');
    expect(urls).toEqual([TRASH_TYPES[0]!.source.url]);
    click(scene, 'close');
    expect(scene.selectedTypeId).toBeNull();
  });

  test('đủ hai mươi tư thẻ trên bốn trang, dữ liệu lạ không tăng tiến độ', () => {
    const save = createDefaultSave();
    save.handbook = ['chai-nhua-pet', 'chai-nhua-pet', 'missing'];
    const scene = new HandbookScene(new Viewport(), save, { back() {}, openSource() {} });
    expect(scene.unlockedCount).toBe(1);
    for (let page = 0; page < 4; page++) {
      for (const type of TRASH_TYPES.slice(page * 6, page * 6 + 6)) {
        expect(scene.buttonBounds(type.id)).not.toBeNull();
      }
      if (page < 3) click(scene, 'next');
    }
    expect(scene.buttonBounds('next')).toBeNull();
    click(scene, 'previous');
    expect(scene.buttonBounds(TRASH_TYPES[12]!.id)).not.toBeNull();
  });

  test('nguồn chưa xác minh được ẩn và cancel/exit không mở thẻ', () => {
    const save = createDefaultSave();
    save.handbook = ['bia-carton'];
    const scene = new HandbookScene(new Viewport(), save, { back() {}, openSource() {} });
    click(scene, 'bia-carton');
    expect(scene.selectedTypeId).toBe('bia-carton');
    expect(scene.buttonBounds('source')).toBeNull();
    click(scene, 'close');
    const rect = scene.buttonBounds('bia-carton')!;
    const sample = { id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    scene.onPointer({ phase: 'down', ...sample });
    scene.onPointer({ phase: 'cancel', ...sample });
    scene.onPointer({ phase: 'up', ...sample });
    expect(scene.selectedTypeId).toBeNull();
    scene.exit();
    scene.onPointer({ phase: 'down', ...sample });
    scene.onPointer({ phase: 'up', ...sample });
    expect(scene.selectedTypeId).toBeNull();
  });
});
