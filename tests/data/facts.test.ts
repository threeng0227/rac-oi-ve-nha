import { describe, expect, test } from 'vitest';
import { FACTS } from '../../src/data/facts';

describe('FACTS', () => {
  test('mỗi màn có một câu, không trùng id', () => {
    expect(FACTS).toHaveLength(10);
    expect(new Set(FACTS.map((fact) => fact.id)).size).toBe(10);
    for (const fact of FACTS) expect(fact.text.length).toBeGreaterThan(0);
  });

  test('câu tự soạn không thêm số liệu và chưa nhận là đã xác minh', () => {
    for (const fact of FACTS) {
      expect(fact.text).not.toMatch(/\d/);
      expect(fact.verified).toBe(false);
      expect(fact.source.url).toBe('');
    }
  });
});
