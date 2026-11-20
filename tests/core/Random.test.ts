import { describe, expect, test } from 'vitest';
import { Random } from '../../src/core/Random';

describe('Random', () => {
  test('cùng seed cho ra cùng một chuỗi — điều kiện để test lặp lại được', () => {
    const a = new Random(12345);
    const b = new Random(12345);

    const seqA = Array.from({ length: 50 }, () => a.next());
    const seqB = Array.from({ length: 50 }, () => b.next());

    expect(seqA).toEqual(seqB);
  });

  test('seed khác nhau cho chuỗi khác nhau', () => {
    const a = new Random(1);
    const b = new Random(2);

    expect(a.next()).not.toBe(b.next());
  });

  test('next() luôn nằm trong nửa khoảng [0, 1)', () => {
    const rng = new Random(777);

    for (let i = 0; i < 10_000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('next() trải đều — trung bình 10.000 mẫu xấp xỉ 0.5', () => {
    const rng = new Random(2024);
    let sum = 0;
    for (let i = 0; i < 10_000; i++) sum += rng.next();

    expect(sum / 10_000).toBeCloseTo(0.5, 1);
  });

  test('int(min, max) bao gồm cả hai đầu mút', () => {
    const rng = new Random(99);
    const seen = new Set<number>();

    for (let i = 0; i < 2000; i++) seen.add(rng.int(1, 3));

    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  test('int với min bằng max luôn trả về đúng giá trị đó', () => {
    const rng = new Random(5);

    expect(rng.int(7, 7)).toBe(7);
  });

  test('range(min, max) nằm trong khoảng yêu cầu', () => {
    const rng = new Random(31);

    for (let i = 0; i < 1000; i++) {
      const v = rng.range(-10, 10);
      expect(v).toBeGreaterThanOrEqual(-10);
      expect(v).toBeLessThan(10);
    }
  });

  test('pick lấy một phần tử có thật trong mảng', () => {
    const rng = new Random(8);
    const items = ['pin', 'chai', 'túi'];

    for (let i = 0; i < 100; i++) {
      expect(items).toContain(rng.pick(items));
    }
  });

  test('pick trên mảng rỗng trả về undefined thay vì văng lỗi', () => {
    expect(new Random(1).pick([])).toBeUndefined();
  });

  test('weighted tôn trọng trọng số — 10.000 mẫu, lệch dưới 3%', () => {
    const rng = new Random(4242);
    const pool = [
      { value: 'a', weight: 70 },
      { value: 'b', weight: 20 },
      { value: 'c', weight: 10 },
    ];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };

    for (let i = 0; i < 10_000; i++) {
      const got = rng.weighted(pool);
      counts[got as string] = (counts[got as string] ?? 0) + 1;
    }

    expect(counts['a']! / 10_000).toBeCloseTo(0.7, 1);
    expect(counts['b']! / 10_000).toBeCloseTo(0.2, 1);
    expect(counts['c']! / 10_000).toBeCloseTo(0.1, 1);
  });

  test('weighted bỏ qua phần tử trọng số 0', () => {
    const rng = new Random(13);
    const pool = [
      { value: 'khong-bao-gio', weight: 0 },
      { value: 'luon-luon', weight: 5 },
    ];

    for (let i = 0; i < 500; i++) {
      expect(rng.weighted(pool)).toBe('luon-luon');
    }
  });

  test('weighted trên mảng rỗng trả về undefined', () => {
    expect(new Random(1).weighted([])).toBeUndefined();
  });

  test('seed 0 vẫn chạy, không kẹt ở một giá trị', () => {
    const rng = new Random(0);
    const values = new Set(Array.from({ length: 20 }, () => rng.next()));

    expect(values.size).toBeGreaterThan(10);
  });
});
