import { describe, expect, test } from 'vitest';
import { TRASH_TYPES, type TrashType } from '../../src/data/trashTypes';
import { verifyFacts } from '../../scripts/verify-facts';

const candidate = (overrides: Partial<TrashType> = {}): TrashType => ({
  id: 'chai-nhua-pet', name: '', bin: 'other', decomposeLabel: '~450 năm',
  harm: '', tip: '', source: { label: '', url: 'https://marinedebris.noaa.gov/' },
  verified: true, sprite: 'chai-nhua-pet', size: 'medium', ...overrides,
});

describe('verify-facts — chỉ chặn hai trường hợp của Mục 8.3', () => {
  test('toàn bộ dữ liệu phát hành hợp lệ', () => {
    expect(verifyFacts(TRASH_TYPES)).toEqual([]);
  });

  test('nhãn chưa xác minh được ẩn vẫn build được, không cần nguồn hợp lệ', () => {
    expect(verifyFacts([candidate({ verified: false, source: { label: '', url: 'chưa có' } })])).toEqual([]);
  });

  test('chặn nhãn chưa xác minh khi nơi hiển thị để lọt số', () => {
    const type = candidate({ verified: false });
    expect(verifyFacts([type], t => t.decomposeLabel)).toHaveLength(1);
    expect(verifyFacts([type], t => `Phân hủy ${t.decomposeLabel}`)).toHaveLength(1);
  });

  test('nhãn rỗng chưa xác minh không bị chặn kể cả khi hiển thị', () => {
    expect(verifyFacts([candidate({ verified: false, decomposeLabel: '' })], t => t.decomposeLabel)).toEqual([]);
  });

  test.each(['', ' ', 'không phải URL', '/nguon-tuong-doi'])('chặn nguồn đã xác minh không hợp lệ %j', url => {
    expect(verifyFacts([candidate({ source: { label: '', url } })])).toHaveLength(1);
  });

  test('nguồn hợp lệ cùng nhãn định tính hoặc rỗng vẫn được phép', () => {
    expect(verifyFacts([
      candidate({ decomposeLabel: '' }),
      candidate({ decomposeLabel: 'Gần như không phân hủy sinh học' }),
    ])).toEqual([]);
  });
});
