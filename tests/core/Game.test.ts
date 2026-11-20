import { describe, expect, test, vi } from 'vitest';
import {
  FixedTimestep,
  SceneManager,
  Game,
  FIXED_DT,
  MAX_FRAME_SEC,
  type Scene,
  type FrameClock,
} from '../../src/core/Game';

/** Scene rỗng ghi lại mọi lần được gọi. */
function spyScene(): Scene & {
  enters: number;
  exits: number;
  updates: number[];
  renders: number;
} {
  return {
    enters: 0,
    exits: 0,
    updates: [] as number[],
    renders: 0,
    enter() {
      this.enters++;
    },
    exit() {
      this.exits++;
    },
    update(dt: number) {
      this.updates.push(dt);
    },
    render() {
      this.renders++;
    },
  };
}

/** requestAnimationFrame giả — test tự quyết khi nào khung hình kế tiếp chạy. */
function fakeClock() {
  let nextId = 1;
  const pending = new Map<number, (timeMs: number) => void>();
  const cancelled: number[] = [];

  return {
    cancelled,
    get pendingCount() {
      return pending.size;
    },
    clock: {
      requestFrame(cb: (timeMs: number) => void): number {
        const id = nextId++;
        pending.set(id, cb);
        return id;
      },
      cancelFrame(id: number): void {
        cancelled.push(id);
        pending.delete(id);
      },
    } satisfies FrameClock,
    /** Chạy khung hình đang chờ, với mốc thời gian cho trước. */
    tick(timeMs: number): void {
      const entries = [...pending.entries()];
      pending.clear();
      for (const [, cb] of entries) cb(timeMs);
    },
  };
}

describe('FixedTimestep', () => {
  test('một khung 60Hz cho đúng một bước cập nhật', () => {
    expect(new FixedTimestep().advance(1 / 60)).toBe(1);
  });

  test('máy 120Hz KHÔNG làm game chạy nhanh gấp đôi', () => {
    const ts = new FixedTimestep();

    const first = ts.advance(1 / 120);
    const second = ts.advance(1 / 120);

    expect(first + second).toBe(1);
  });

  test('phần dư được giữ lại, không bị vứt đi', () => {
    const ts = new FixedTimestep();

    ts.advance(1 / 90);
    ts.advance(1 / 90);
    ts.advance(1 / 90);

    // 3 khung 90Hz = 1/30 giây = đúng 2 bước 60Hz.
    expect(ts.advance(0)).toBe(0);
    expect(ts.totalSteps).toBe(2);
  });

  test('khung hình quá dài bị chặn — tab vừa bị treo không gây dồn 600 bước', () => {
    const ts = new FixedTimestep();

    const steps = ts.advance(10);

    expect(steps).toBe(Math.floor(MAX_FRAME_SEC / FIXED_DT));
    expect(steps).toBeLessThan(20);
  });

  test('dt âm (đồng hồ hệ thống nhảy lùi) không sinh bước nào', () => {
    expect(new FixedTimestep().advance(-5)).toBe(0);
  });

  test('alpha là phần dư trong khoảng [0, 1) để nội suy lúc vẽ', () => {
    const ts = new FixedTimestep();

    ts.advance(1 / 60 + 1 / 240);

    expect(ts.alpha).toBeGreaterThanOrEqual(0);
    expect(ts.alpha).toBeLessThan(1);
    expect(ts.alpha).toBeCloseTo(0.25, 4);
  });

  test('reset xoá sạch phần tích luỹ', () => {
    const ts = new FixedTimestep();
    ts.advance(1 / 120);

    ts.reset();

    expect(ts.alpha).toBe(0);
    expect(ts.totalSteps).toBe(0);
  });
});

describe('SceneManager', () => {
  test('chuyển scene thì gọi enter của scene mới', () => {
    const manager = new SceneManager();
    const scene = spyScene();

    manager.change(scene);

    expect(scene.enters).toBe(1);
    expect(manager.current).toBe(scene);
  });

  test('chuyển scene thì gọi exit của scene cũ — chỗ dọn tween và rAF', () => {
    const manager = new SceneManager();
    const first = spyScene();
    const second = spyScene();

    manager.change(first);
    manager.change(second);

    expect(first.exits).toBe(1);
    expect(second.exits).toBe(0);
  });

  test('update chỉ chạy trên scene hiện tại, scene cũ im hẳn', () => {
    const manager = new SceneManager();
    const first = spyScene();
    const second = spyScene();

    manager.change(first);
    manager.change(second);
    manager.update(FIXED_DT);

    expect(first.updates).toHaveLength(0);
    expect(second.updates).toEqual([FIXED_DT]);
  });

  test('chưa có scene nào thì update và render không văng lỗi', () => {
    const manager = new SceneManager();

    expect(() => manager.update(FIXED_DT)).not.toThrow();
    expect(() => manager.render({} as CanvasRenderingContext2D)).not.toThrow();
  });

  test('đổi scene ngay trong update không làm scene mới bị update hai lần', () => {
    const manager = new SceneManager();
    const next = spyScene();
    const first: Scene = {
      update: () => manager.change(next),
      render: () => {},
    };

    manager.change(first);
    manager.update(FIXED_DT);

    expect(next.updates).toHaveLength(0);
    expect(manager.current).toBe(next);
  });

  test('chạm được chuyển tới scene hiện tại', () => {
    const manager = new SceneManager();
    const onPointer = vi.fn();
    manager.change({ update: () => {}, render: () => {}, onPointer });

    manager.onPointer({ x: 360, y: 640, phase: 'down', id: 1 });

    expect(onPointer).toHaveBeenCalledWith({ x: 360, y: 640, phase: 'down', id: 1 });
  });

  test('scene không khai báo onPointer thì bỏ qua, không văng lỗi', () => {
    const manager = new SceneManager();
    manager.change({ update: () => {}, render: () => {} });

    expect(() => manager.onPointer({ x: 1, y: 2, phase: 'up', id: 1 })).not.toThrow();
  });
});

describe('Game', () => {
  const ctx = {} as CanvasRenderingContext2D;

  test('start xếp lịch khung hình đầu tiên', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);

    game.start();

    expect(fake.pendingCount).toBe(1);
    expect(game.isRunning).toBe(true);
  });

  test('mỗi bước cập nhật luôn nhận đúng FIXED_DT, không phải thời gian thật', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);
    const scene = spyScene();
    game.scenes.change(scene);

    game.start();
    fake.tick(0);
    fake.tick(1000 / 60);

    expect(scene.updates.every((dt) => dt === FIXED_DT)).toBe(true);
  });

  test('khung hình 120Hz không làm game chạy nhanh gấp đôi', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);
    const scene = spyScene();
    game.scenes.change(scene);

    game.start();
    fake.tick(0);
    for (let i = 1; i <= 120; i++) fake.tick((i * 1000) / 120);

    // 1 giây thời gian thật → khoảng 60 bước, không phải 120.
    expect(scene.updates.length).toBeGreaterThanOrEqual(58);
    expect(scene.updates.length).toBeLessThanOrEqual(61);
  });

  test('vẽ đúng một lần mỗi khung hình, kể cả khi chạy nhiều bước cập nhật', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);
    const scene = spyScene();
    game.scenes.change(scene);

    game.start();
    fake.tick(0);
    fake.tick(100); // 100ms = 6 bước

    expect(scene.updates.length).toBeGreaterThan(1);
    expect(scene.renders).toBe(2);
  });

  test('stop huỷ khung hình đang chờ — không để rò rỉ rAF', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);

    game.start();
    game.stop();

    expect(fake.cancelled).toHaveLength(1);
    expect(fake.pendingCount).toBe(0);
    expect(game.isRunning).toBe(false);
  });

  test('sau stop thì không còn khung hình nào chạy nữa', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);
    const scene = spyScene();
    game.scenes.change(scene);

    game.start();
    fake.tick(0);
    game.stop();
    fake.tick(1000);

    expect(scene.renders).toBe(1);
  });

  test('gọi start hai lần không xếp lịch hai vòng lặp song song', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);

    game.start();
    game.start();

    expect(fake.pendingCount).toBe(1);
  });

  test('gọi stop khi chưa chạy không văng lỗi', () => {
    const game = new Game(fakeClock().clock, () => ctx);

    expect(() => game.stop()).not.toThrow();
  });

  test('chạy lại sau khi dừng thì không dồn một cục thời gian đã trôi qua', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => ctx);
    const scene = spyScene();
    game.scenes.change(scene);

    game.start();
    fake.tick(0);
    game.stop();

    // Người chơi khoá máy 30 giây rồi mở lại.
    game.start();
    fake.tick(30_000);

    expect(scene.updates.length).toBeLessThanOrEqual(1);
  });

  test('không lấy được context 2d thì bỏ qua lượt vẽ, không làm sập vòng lặp', () => {
    const fake = fakeClock();
    const game = new Game(fake.clock, () => null);
    const scene = spyScene();
    game.scenes.change(scene);

    game.start();

    expect(() => fake.tick(0)).not.toThrow();
    expect(scene.renders).toBe(0);
  });
});
