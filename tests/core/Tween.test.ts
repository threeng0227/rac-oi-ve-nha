import { describe, expect, test, vi } from 'vitest';
import {
  easeLinear,
  easeOutCubic,
  easeOutBack,
  easeInOutQuad,
  TweenRunner,
} from '../../src/core/Tween';

describe('hàm easing', () => {
  const allEasings = [easeLinear, easeOutCubic, easeOutBack, easeInOutQuad];

  test('mọi easing đều bắt đầu ở 0 và kết thúc ở 1', () => {
    for (const ease of allEasings) {
      expect(ease(0)).toBeCloseTo(0, 6);
      expect(ease(1)).toBeCloseTo(1, 6);
    }
  });

  test('easeOutCubic chạy nhanh lúc đầu rồi chậm dần', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);

    const quangDau = easeOutCubic(0.25) - easeOutCubic(0);
    const quangCuoi = easeOutCubic(1) - easeOutCubic(0.75);
    expect(quangDau).toBeGreaterThan(quangCuoi);
  });

  test('easeOutBack vọt quá 1 rồi mới lùi về — đó là cú nảy của thùng rác', () => {
    const samples = Array.from({ length: 99 }, (_, i) => easeOutBack((i + 1) / 100));
    expect(Math.max(...samples)).toBeGreaterThan(1);
  });

  test('easeInOutQuad đối xứng quanh điểm giữa', () => {
    expect(easeInOutQuad(0.5)).toBeCloseTo(0.5, 6);
    expect(easeInOutQuad(0.25) + easeInOutQuad(0.75)).toBeCloseTo(1, 6);
  });

  test('easing chặn đầu vào nằm ngoài [0,1]', () => {
    for (const ease of allEasings) {
      expect(ease(-5)).toBeCloseTo(0, 6);
      expect(ease(99)).toBeCloseTo(1, 6);
    }
  });
});

describe('TweenRunner', () => {
  test('gọi onUpdate với giá trị đầu ngay khi bắt đầu', () => {
    const runner = new TweenRunner();
    const seen: number[] = [];

    runner.add({ from: 10, to: 20, durationSec: 1, onUpdate: (v) => seen.push(v) });

    expect(seen[0]).toBeCloseTo(10, 6);
  });

  test('đi đúng nửa đường sau nửa thời gian với easing tuyến tính', () => {
    const runner = new TweenRunner();
    let value = 0;

    runner.add({ from: 0, to: 100, durationSec: 1, ease: easeLinear, onUpdate: (v) => (value = v) });
    runner.update(0.5);

    expect(value).toBeCloseTo(50, 6);
  });

  test('kết thúc đúng bằng giá trị đích dù dt vượt quá thời lượng', () => {
    const runner = new TweenRunner();
    let value = 0;

    runner.add({ from: 0, to: 100, durationSec: 1, ease: easeOutBack, onUpdate: (v) => (value = v) });
    runner.update(99);

    expect(value).toBe(100);
  });

  test('onComplete chỉ chạy đúng một lần', () => {
    const runner = new TweenRunner();
    const done = vi.fn();

    runner.add({ from: 0, to: 1, durationSec: 0.5, onUpdate: () => {}, onComplete: done });
    runner.update(0.3);
    runner.update(0.3);
    runner.update(0.3);

    expect(done).toHaveBeenCalledTimes(1);
  });

  test('tween đã xong thì bị loại khỏi danh sách', () => {
    const runner = new TweenRunner();

    runner.add({ from: 0, to: 1, durationSec: 0.5, onUpdate: () => {} });
    expect(runner.count).toBe(1);
    runner.update(1);

    expect(runner.count).toBe(0);
  });

  test('huỷ một tween thì nó không chạy nữa', () => {
    const runner = new TweenRunner();
    let value = 0;

    const handle = runner.add({
      from: 0, to: 100, durationSec: 1, ease: easeLinear, onUpdate: (v) => (value = v),
    });
    runner.cancel(handle);
    runner.update(0.5);

    expect(value).toBeCloseTo(0, 6);
    expect(runner.count).toBe(0);
  });

  test('clear dọn sạch mọi tween — dùng khi rời scene, tránh rò rỉ', () => {
    const runner = new TweenRunner();
    runner.add({ from: 0, to: 1, durationSec: 1, onUpdate: () => {} });
    runner.add({ from: 0, to: 1, durationSec: 1, onUpdate: () => {} });

    runner.clear();

    expect(runner.count).toBe(0);
  });

  test('tween thời lượng 0 hoàn tất ngay ở lần update đầu', () => {
    const runner = new TweenRunner();
    let value = 0;

    runner.add({ from: 0, to: 42, durationSec: 0, onUpdate: (v) => (value = v) });
    runner.update(0.016);

    expect(value).toBe(42);
    expect(runner.count).toBe(0);
  });

  test('nhiều tween chạy song song, độc lập với nhau', () => {
    const runner = new TweenRunner();
    let a = 0;
    let b = 0;

    runner.add({ from: 0, to: 10, durationSec: 1, ease: easeLinear, onUpdate: (v) => (a = v) });
    runner.add({ from: 0, to: 20, durationSec: 2, ease: easeLinear, onUpdate: (v) => (b = v) });
    runner.update(1);

    expect(a).toBeCloseTo(10, 6);
    expect(b).toBeCloseTo(10, 6);
    expect(runner.count).toBe(1);
  });

  test('huỷ một tween ngay trong onUpdate của tween khác không làm vỡ vòng lặp', () => {
    const runner = new TweenRunner();
    let bRan = false;

    const b = runner.add({ from: 0, to: 1, durationSec: 1, onUpdate: () => (bRan = true) });
    runner.add({ from: 0, to: 1, durationSec: 1, onUpdate: () => runner.cancel(b) });

    bRan = false;
    expect(() => runner.update(0.1)).not.toThrow();
    expect(bRan).toBe(false);
  });
});
