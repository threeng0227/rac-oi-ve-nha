import { describe, expect, test, vi } from 'vitest';
import { Input, type PointerTarget } from '../../src/core/Input';
import { Viewport, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../../src/core/Viewport';
import type { PointerSample } from '../../src/core/Game';

/** Phần tử DOM giả: ghi lại listener và cho test tự bắn sự kiện. */
function fakeTarget(rect = { left: 0, top: 0 }) {
  const listeners = new Map<string, Set<(ev: unknown) => void>>();

  const target: PointerTarget = {
    addEventListener(type, handler) {
      let set = listeners.get(type);
      if (set === undefined) {
        set = new Set();
        listeners.set(type, set);
      }
      set.add(handler as (ev: unknown) => void);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler as (ev: unknown) => void);
    },
    getBoundingClientRect: () => ({ left: rect.left, top: rect.top }),
  };

  return {
    target,
    get listenerCount() {
      let n = 0;
      for (const set of listeners.values()) n += set.size;
      return n;
    },
    dispatch(type: string, event: Record<string, unknown>) {
      const ev = { type, preventDefault: vi.fn(), ...event };
      for (const handler of listeners.get(type) ?? []) handler(ev);
      return ev;
    },
  };
}

/** Viewport của iPhone 14 dọc: scale 390/720, lề trên ~75.3. */
function phoneViewport(): Viewport {
  const vp = new Viewport();
  vp.resize(390, 844, 2);
  return vp;
}

describe('Input', () => {
  test('chạm giữa canvas trả về đúng tâm hệ ảo', () => {
    const vp = phoneViewport();
    const samples: PointerSample[] = [];
    const dom = fakeTarget();
    new Input(vp, (s) => samples.push(s)).attach(dom.target);

    dom.dispatch('pointerdown', { clientX: 195, clientY: 422, pointerId: 1 });

    expect(samples[0]?.x).toBeCloseTo(VIRTUAL_WIDTH / 2, 3);
    expect(samples[0]?.y).toBeCloseTo(VIRTUAL_HEIGHT / 2, 3);
  });

  test('trừ đi vị trí của canvas trong trang — canvas không phải lúc nào cũng ở góc trên trái', () => {
    const vp = phoneViewport();
    const samples: PointerSample[] = [];
    const dom = fakeTarget({ left: 40, top: 100 });
    new Input(vp, (s) => samples.push(s)).attach(dom.target);

    dom.dispatch('pointerdown', { clientX: 195 + 40, clientY: 422 + 100, pointerId: 1 });

    expect(samples[0]?.x).toBeCloseTo(VIRTUAL_WIDTH / 2, 3);
    expect(samples[0]?.y).toBeCloseTo(VIRTUAL_HEIGHT / 2, 3);
  });

  test('mỗi loại sự kiện chuyển thành đúng phase', () => {
    const samples: PointerSample[] = [];
    const dom = fakeTarget();
    new Input(phoneViewport(), (s) => samples.push(s)).attach(dom.target);

    dom.dispatch('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 });
    dom.dispatch('pointermove', { clientX: 20, clientY: 20, pointerId: 1 });
    dom.dispatch('pointerup', { clientX: 30, clientY: 30, pointerId: 1 });
    dom.dispatch('pointercancel', { clientX: 40, clientY: 40, pointerId: 1 });

    expect(samples.map((s) => s.phase)).toEqual(['down', 'move', 'up', 'cancel']);
  });

  test('giữ nguyên pointerId để phân biệt nhiều ngón tay', () => {
    const samples: PointerSample[] = [];
    const dom = fakeTarget();
    new Input(phoneViewport(), (s) => samples.push(s)).attach(dom.target);

    dom.dispatch('pointerdown', { clientX: 10, clientY: 10, pointerId: 7 });
    dom.dispatch('pointerdown', { clientX: 20, clientY: 20, pointerId: 9 });

    expect(samples.map((s) => s.id)).toEqual([7, 9]);
  });

  test('chặn hành vi mặc định — nếu không trình duyệt sẽ cuộn trang khi kéo', () => {
    const dom = fakeTarget();
    new Input(phoneViewport(), () => {}).attach(dom.target);

    const down = dom.dispatch('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 });
    const move = dom.dispatch('pointermove', { clientX: 10, clientY: 90, pointerId: 1 });

    expect(down.preventDefault).toHaveBeenCalled();
    expect(move.preventDefault).toHaveBeenCalled();
  });

  test('detach gỡ sạch listener — không rò rỉ khi rời scene', () => {
    const dom = fakeTarget();
    const input = new Input(phoneViewport(), () => {});

    input.attach(dom.target);
    expect(dom.listenerCount).toBeGreaterThan(0);
    input.detach();

    expect(dom.listenerCount).toBe(0);
  });

  test('sau detach thì sự kiện không còn tới game nữa', () => {
    const sink = vi.fn();
    const dom = fakeTarget();
    const input = new Input(phoneViewport(), sink);

    input.attach(dom.target);
    input.detach();
    dom.dispatch('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 });

    expect(sink).not.toHaveBeenCalled();
  });

  test('attach hai lần không đăng ký trùng listener', () => {
    const dom = fakeTarget();
    const input = new Input(phoneViewport(), () => {});

    input.attach(dom.target);
    const soLuongBanDau = dom.listenerCount;
    input.attach(dom.target);

    expect(dom.listenerCount).toBe(soLuongBanDau);
  });

  test('attach hai lần thì mỗi sự kiện vẫn chỉ tới game một lần', () => {
    const sink = vi.fn();
    const dom = fakeTarget();
    const input = new Input(phoneViewport(), sink);

    input.attach(dom.target);
    input.attach(dom.target);
    dom.dispatch('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 });

    expect(sink).toHaveBeenCalledTimes(1);
  });

  test('detach khi chưa attach không văng lỗi', () => {
    expect(() => new Input(phoneViewport(), () => {}).detach()).not.toThrow();
  });

  test('chạm vào dải letterbox vẫn báo lên, toạ độ nằm ngoài khung ảo', () => {
    const samples: PointerSample[] = [];
    const dom = fakeTarget();
    new Input(phoneViewport(), (s) => samples.push(s)).attach(dom.target);

    dom.dispatch('pointerdown', { clientX: 195, clientY: 2, pointerId: 1 });

    expect(samples[0]?.y).toBeLessThan(0);
  });

  test('đổi kích thước màn hình rồi thì toạ độ tính theo viewport mới', () => {
    const vp = phoneViewport();
    const samples: PointerSample[] = [];
    const dom = fakeTarget();
    new Input(vp, (s) => samples.push(s)).attach(dom.target);

    vp.resize(844, 390, 2); // xoay ngang
    dom.dispatch('pointerdown', { clientX: 422, clientY: 195, pointerId: 1 });

    expect(samples[0]?.x).toBeCloseTo(VIRTUAL_WIDTH / 2, 3);
    expect(samples[0]?.y).toBeCloseTo(VIRTUAL_HEIGHT / 2, 3);
  });
});
