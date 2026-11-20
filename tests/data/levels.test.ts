import { describe, expect, test } from 'vitest';
import design from '../../docs/DESIGN.md?raw';
import { LEVELS } from '../../src/data/levels';
import { FACTS } from '../../src/data/facts';
import { TRASH_TYPES } from '../../src/data/trashTypes';
import { getLevelPalette } from '../../src/render/palette';

const EXPECTED = [
  ['ha-noi', 90, 4, 0.25],
  ['ha-long', 75, 6, 0.35],
  ['hoi-an', 75, 6, 0.40],
  ['da-lat', 75, 8, 0.45],
  ['concert', 60, 6, 0.40],
  ['nhieu-loc', 75, 8, 0.45],
  ['cai-rang', 75, 8, 0.50],
  ['giao-thua', 75, 10, 0.45],
  ['sa-pa', 80, 8, 0.45],
  ['con-dao', 85, 10, 0.48],
] as const;

const POOLS = [
  [['coc-nhua', 30], ['giay-bao', 20], ['vo-chuoi', 20], ['tui-nilon', 15], ['lon-nhom', 5], ['chai-nhua-pet', 5], ['tan-thuoc-la', 3], ['vo-trai-cay', 2]],
  [['chai-nhua-pet', 30], ['hop-xop', 20], ['tui-nilon', 20], ['luoi-danh-ca', 12], ['chai-thuy-tinh', 10], ['ong-hut-nhua', 8]],
  [['tui-nilon', 25], ['coc-nhua', 20], ['ong-hut-nhua', 20], ['giay-bao', 15], ['vo-trai-cay', 12], ['chai-nhua-pet', 8]],
  [['coc-nhua', 25], ['lon-nhom', 20], ['vo-trai-cay', 20], ['khau-trang-y-te', 15], ['chai-nhua-pet', 12], ['giay-bao', 8]],
  [['coc-nhua', 35], ['ao-mua-giay', 20], ['chai-nhua-pet', 18], ['giay-bao', 12], ['lon-nhom', 10], ['lightstick', 5]],
  [['hop-xop', 28], ['tui-nilon', 25], ['chai-nhua-pet', 18], ['coc-nhua', 15], ['ao-mua-giay', 8], ['bia-carton', 6]],
  [['vo-trai-cay', 30], ['la-chuoi', 20], ['ba-mia', 18], ['tui-nilon', 15], ['thuc-an-thua', 10], ['hop-xop', 7]],
  [['lon-nhom', 25], ['que-xien-tre', 20], ['vo-hat-dua', 18], ['giay-bao', 15], ['coc-nhua', 10], ['bia-carton', 7], ['bong-den', 5]],
  [['chai-nhua-pet', 28], ['tui-nilon', 22], ['khau-trang-y-te', 20], ['giay-bao', 14], ['lon-nhom', 11], ['pin-aa', 5]],
  [['tui-nilon', 25], ['ong-hut-nhua', 20], ['chai-nhua-pet', 18], ['luoi-danh-ca', 15], ['hop-xop', 12], ['chai-thuy-tinh', 6], ['pin-aa', 4]],
] as const;

const EVENTS = [
  [['NEM_RAC', 55]],
  [['MUA_BAO', 20], ['CUU_SINH_VAT', 50]],
  [['GIO_MUA', 35]],
  [['BAC_VE_CHAI', 30]],
  [['PIN_ROI', 18], ['GIO_CAO_DIEM', 40]],
  [['BAI_RAC_TU_PHAT', 30]],
  [['GIO_MUA', 40]],
  [['PIN_ROI', 20], ['GIO_CAO_DIEM', 45]],
  [['MUA_BAO', 25], ['PIN_ROI', 55]],
  [['CUU_SINH_VAT', 25], ['BAI_RAC_TU_PHAT', 55]],
] as const;

describe('LEVELS', () => {
  test('màu từng màn khớp nguyên bảng Mục 6.3', () => {
    const table = design.split('### 6.3')[1]!.split('## 7.')[0]!;
    const rows = [...table.matchAll(/\| \d+ \| `([^`]+)` \| `([^`]+)` \| `([^`]+)` \| (?:`([^`]+)`|—) \|/g)];
    expect(rows).toHaveLength(10);
    for (const [index, row] of rows.entries()) {
      const [, sky, ground, accent, water] = row;
      const expected = { sky: sky!.toLowerCase(), ground: ground!.toLowerCase(), accent: accent!.toLowerCase(),
        ...(water ? { water: water.toLowerCase() } : {}) };
      expect(LEVELS[index]?.palette).toEqual(expected);
    }
  });
  test('đủ mười màn, đúng thứ tự và số liệu Mục 6.1', () => {
    expect(LEVELS).toHaveLength(10);
    expect(LEVELS.map((level) => [level.id, level.durationSec, level.initialTrashCount, level.spawnRatePerSec])).toEqual(EXPECTED);
    expect(LEVELS.map((level) => level.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(LEVELS.map((level) => level.id)).size).toBe(10);
  });

  test('giữ nguyên trọng số và lịch sự kiện Mục 6.2', () => {
    expect(LEVELS.map((level) => level.trashPool.map((entry) => [entry.typeId, entry.weight]))).toEqual(POOLS);
    expect(LEVELS.map((level) => level.events.map((event) => [event.eventId, event.atSec]))).toEqual(EVENTS);
  });

  test('mọi màn có màu từ palette, nền và fact cuối màn hợp lệ', () => {
    const factIds = new Set(FACTS.map((fact) => fact.id));
    for (const level of LEVELS) {
      expect(level.palette).toEqual(getLevelPalette(level.id));
      expect(level.backdrop).toBe(level.id);
      expect(factIds.has(level.factOnComplete), level.id).toBe(true);
      expect(level.name.length).toBeGreaterThan(0);
      expect(level.subtitle.length).toBeGreaterThan(0);
    }
  });

  test('biến thể vùng vẫn dùng chung loại rác', () => {
    expect(LEVELS[0]?.trashPool[0]).toMatchObject({ typeId: 'coc-nhua', variantId: 'coc-tra-da' });
    expect(LEVELS[2]?.trashPool[3]).toMatchObject({ typeId: 'giay-bao', variantId: 'hoa-dang' });
    expect(LEVELS[3]?.trashPool[2]).toMatchObject({ typeId: 'vo-trai-cay', variantId: 'vo-bap' });
    expect(LEVELS[4]?.trashPool[3]).toMatchObject({ typeId: 'giay-bao', variantId: 'bang-ron' });
  });

  test('mọi pool chỉ trỏ tới loại và biến thể có trong danh sách chính thức', () => {
    for (const level of LEVELS) {
      for (const entry of level.trashPool) {
        const type = TRASH_TYPES.find((type) => type.id === entry.typeId);
        expect(type, `${level.id}/${entry.typeId}`).toBeDefined();
        if (entry.variantId) {
          expect(type?.variants?.some((variant) => variant.id === entry.variantId), entry.variantId).toBe(true);
        }
      }
    }
  });

  test('nguy hại không quá trọng số năm, sự kiện đủ cách xa và tránh cuối màn', () => {
    const hazardIds = new Set(['pin-aa', 'lightstick', 'bong-den']);
    for (const level of LEVELS) {
      for (const entry of level.trashPool) {
        if (hazardIds.has(entry.typeId)) expect(entry.weight).toBeLessThanOrEqual(5);
      }
      for (const [index, event] of level.events.entries()) {
        expect(event.atSec).toBeLessThanOrEqual(level.durationSec - 10);
        const previous = level.events[index - 1];
        if (previous) expect(event.atSec - previous.atSec).toBeGreaterThanOrEqual(20);
      }
    }
  });
});
