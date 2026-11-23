import { describe, expect, test } from 'vitest';
import { Viewport } from '../../src/core/Viewport';
import { PLEDGES } from '../../src/data/pledges';
import { PledgeScene } from '../../src/scenes/PledgeScene';

function click(scene: PledgeScene, action: string): void {
  const bounds = scene.buttonBounds(action)!;
  const point = { id: 1, x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  scene.onPointer({ phase: 'down', ...point });
  scene.onPointer({ phase: 'up', ...point });
}

describe('PledgeScene', () => {
  test('phải chọn một tới ba lời cam kết trước khi xác nhận, không nhận lời thứ tư', () => {
    const submitted: string[][] = [];
    const scene = new PledgeScene(new Viewport(), [], { confirm: ids => submitted.push([...ids]), back() {} });
    click(scene, 'confirm');
    expect(submitted).toEqual([]);
    for (const pledge of PLEDGES.slice(0, 4)) click(scene, pledge.id);
    expect(scene.selectedIds).toEqual(PLEDGES.slice(0, 3).map(pledge => pledge.id));
    click(scene, 'confirm');
    expect(submitted).toEqual([PLEDGES.slice(0, 3).map(pledge => pledge.id)]);
  });

  test('bỏ chọn rồi chọn lời khác được, phân trang vẫn giữ lựa chọn', () => {
    const scene = new PledgeScene(new Viewport(), [], { confirm() {}, back() {} });
    click(scene, PLEDGES[0]!.id);
    click(scene, PLEDGES[1]!.id);
    click(scene, PLEDGES[0]!.id);
    expect(scene.selectedIds).toEqual([PLEDGES[1]!.id]);
    click(scene, 'next');
    expect(scene.buttonBounds(PLEDGES[0]!.id)).toBeNull();
    for (const pledge of PLEDGES.slice(4)) expect(scene.buttonBounds(pledge.id)).not.toBeNull();
    click(scene, PLEDGES[6]!.id);
    click(scene, 'previous');
    expect(scene.selectedIds).toEqual([PLEDGES[1]!.id, PLEDGES[6]!.id]);
  });

  test('dữ liệu lưu chỉ nhận tối đa ba id có thật và duy nhất', () => {
    const selected = ['unknown', PLEDGES[0]!.id, PLEDGES[0]!.id, ...PLEDGES.slice(1).map(pledge => pledge.id)];
    const scene = new PledgeScene(new Viewport(), selected, { confirm() {}, back() {} });
    expect(scene.selectedIds).toEqual(PLEDGES.slice(0, 3).map(pledge => pledge.id));
    expect(selected).toHaveLength(9);
  });

  test('cancel, up ngoài nút và exit không thay đổi lựa chọn hoặc xác nhận', () => {
    let calls = 0;
    const scene = new PledgeScene(new Viewport(), [PLEDGES[0]!.id], { confirm: () => calls++, back() {} });
    const bounds = scene.buttonBounds('confirm')!;
    const point = { id: 3, x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    scene.onPointer({ phase: 'down', ...point });
    scene.onPointer({ phase: 'cancel', ...point });
    scene.onPointer({ phase: 'up', ...point });
    scene.onPointer({ phase: 'down', ...point });
    scene.onPointer({ phase: 'up', id: 3, x: -1, y: -1 });
    scene.onPointer({ phase: 'down', ...point });
    scene.exit();
    scene.onPointer({ phase: 'up', ...point });
    expect(calls).toBe(0);
    expect(scene.selectedIds).toEqual([PLEDGES[0]!.id]);
  });

  test('các lựa chọn và nút phân trang đạt 44 CSS px và nằm trong khung hai hướng', () => {
    for (const [width, height] of [[844, 390], [390, 844]]) {
      const viewport = new Viewport();
      viewport.resize(width!, height!, 2);
      const scene = new PledgeScene(viewport, [], { confirm() {}, back() {} });
      const actions = [...PLEDGES.slice(0, 4).map(pledge => pledge.id), 'back', 'next', 'confirm'];
      for (const action of actions) {
        const bounds = scene.buttonBounds(action)!;
        expect(bounds.height * viewport.scale).toBeGreaterThanOrEqual(44);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
      }
    }
  });

  test('nút quay lại gọi đúng hành động', () => {
    let calls = 0;
    const scene = new PledgeScene(new Viewport(), [], { confirm() {}, back: () => calls++ });
    click(scene, 'back');
    expect(calls).toBe(1);
  });
});
