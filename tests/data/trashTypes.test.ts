import design from '../../docs/DESIGN.md?raw';
import { describe, expect, test } from 'vitest';
import { TRASH_TYPES, getDecomposeLabel } from '../../src/data/trashTypes';
import { vi } from '../../src/i18n/vi';

const EXPECTED = [
  ['chai-nhua-pet', 'recycle', '~450 năm', true],
  ['lon-nhom', 'recycle', '80–200 năm', true],
  ['chai-thuy-tinh', 'recycle', 'Gần như không phân hủy sinh học', true],
  ['giay-bao', 'recycle', '2–6 tuần', true],
  ['bia-carton', 'recycle', '2–3 tháng', false],
  ['vo-chuoi', 'food', '2–5 tuần', true],
  ['vo-trai-cay', 'food', '2–5 tuần', true],
  ['thuc-an-thua', 'food', '2–4 tuần', true],
  ['la-chuoi', 'food', '1–3 tháng', false],
  ['ba-mia', 'food', '1–3 tháng', false],
  ['vo-hat-dua', 'food', '1–3 tháng', false],
  ['tui-nilon', 'other', '10–20 năm', true],
  ['hop-xop', 'other', '50 năm+, gần như không phân hủy hết', true],
  ['coc-nhua', 'other', '~50 năm', true],
  ['tan-thuoc-la', 'other', '1–5 năm', true],
  ['ta-bim', 'other', '~450 năm', true],
  ['luoi-danh-ca', 'other', '~600 năm', true],
  ['ong-hut-nhua', 'other', '~200 năm', false],
  ['khau-trang-y-te', 'other', '~450 năm', false],
  ['que-xien-tre', 'other', '', false],
  ['ao-mua-giay', 'other', '', false],
  ['pin-aa', 'hazard', '', true],
  ['lightstick', 'hazard', '', true],
  ['bong-den', 'hazard', '', true],
] as const;

describe('TRASH_TYPES', () => {
  test('đúng 24 loại, nhóm, nhãn phân hủy và trạng thái nguồn ở Mục 8.1', () => {
    expect(TRASH_TYPES.map(t => [t.id, t.bin, t.decomposeLabel, t.verified])).toEqual(EXPECTED);
    expect(new Set(TRASH_TYPES.map(t => t.id)).size).toBe(24);
  });

  test('dùng nguyên văn tác hại và cách làm đúng ở Mục 8.4', () => {
    const cards = [...design.matchAll(/\*\*\d+\. `([^`]+)`[^\n]+\n- \*Tác hại:\* ([^\n]+)\n- \*Làm đúng:\* ([^\n]+)/g)];
    expect(cards).toHaveLength(24);
    for (const [, id, harm, tip] of cards) {
      const type = TRASH_TYPES.find(t => t.id === id);
      expect(type?.harm, id).toBe(harm);
      expect(type?.tip, id).toBe(tip);
    }
  });

  test('ẩn mọi nhãn chưa xác minh và giữ nguyên nhãn đã xác minh', () => {
    for (const type of TRASH_TYPES) {
      expect(getDecomposeLabel(type)).toBe(type.verified ? type.decomposeLabel : vi.verifyingSource);
      expect(type.name).not.toBe('');
      expect(type.sprite).not.toBe('');
      expect(['small', 'medium', 'large']).toContain(type.size);
      expect(type.harm + type.tip).not.toMatch(/\d/);
    }
  });

  test('chỉ ba loại nguy hại, không trùng ba thùng thường', () => {
    expect(TRASH_TYPES.filter(t => t.bin === 'hazard').map(t => t.id))
      .toEqual(['pin-aa', 'lightstick', 'bong-den']);
    for (const type of TRASH_TYPES.filter(t => t.bin === 'hazard')) {
      expect(['recycle', 'food', 'other']).not.toContain(type.bin);
    }
  });

  test('biến thể có id riêng trong từng loại và cùng thẻ sổ tay', () => {
    for (const type of TRASH_TYPES) {
      const variants = type.variants ?? [];
      expect(new Set(variants.map(v => v.id)).size).toBe(variants.length);
      for (const variant of variants) {
        expect(variant.label).not.toBe('');
        expect(variant.sprite).not.toBe('');
      }
    }
  });
});
