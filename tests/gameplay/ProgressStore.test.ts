import { describe, expect, test } from 'vitest';
import { SAVE_KEY, SaveStore, createDefaultSave, type SaveData, type StorageBackend } from '../../src/core/Storage';
import { LEVELS } from '../../src/data/levels';
import type { LevelResult } from '../../src/gameplay/ScoreSystem';
import { ProgressStore, isLevelUnlocked } from '../../src/gameplay/ProgressStore';

function result(overrides: Partial<LevelResult> = {}): LevelResult {
  return {
    score: 250, stars: 2, cleanliness: 0.9, failed: false, correctCount: 20,
    totalSpawned: 25, mistakes: 1, hazardMistakes: 0, remainingCount: 5,
    hazardRemainingCount: 0, ...overrides,
  };
}

function memory(initial = createDefaultSave()): { backend: StorageBackend; read: () => SaveData } {
  let saved = JSON.stringify(initial);
  return {
    backend: { getItem: () => saved, setItem: (key, value) => { expect(key).toBe(SAVE_KEY); saved = value; } },
    read: () => JSON.parse(saved) as SaveData,
  };
}

describe('ProgressStore', () => {
  test('thẻ mở ngay khi phân loại đúng, trước khi kết thúc màn và không lưu trùng', () => {
    const storage = memory();
    let writes = 0;
    const backend: StorageBackend = {
      getItem: storage.backend.getItem,
      setItem: (key, value) => { writes++; storage.backend.setItem(key, value); },
    };
    const progress = new ProgressStore(new SaveStore(backend));
    const before = progress.data.handbook;
    progress.discover('vo-chuoi');
    expect(progress.data.handbook).not.toBe(before);
    expect(storage.read().handbook).toEqual(['vo-chuoi']);
    expect(storage.read().levels).toEqual({});
    progress.discover('vo-chuoi');
    expect(writes).toBe(1);
    expect(progress.data.stats.totalTrash).toBe(0);
    progress.complete(LEVELS[0]!, result(), ['vo-chuoi'], 0);
    expect(storage.read().handbook).toEqual(['vo-chuoi']);
  });

  test('đọc một lần và giữ tiến trình trong bộ nhớ qua các thao tác', () => {
    let reads = 0;
    const progress = new ProgressStore(new SaveStore({ getItem: () => { reads++; return null; }, setItem: () => {} }));
    const data = progress.data;
    progress.setMuted(false);
    progress.setPledges(['gom-pin']);
    expect(progress.data).toBe(data);
    expect(progress.data.settings.muted).toBe(false);
    expect(reads).toBe(1);
  });

  test('lưu sao và điểm tốt nhất độc lập, không phạt khi chơi lại thấp hơn', () => {
    const storage = memory();
    const progress = new ProgressStore(new SaveStore(storage.backend));
    const level = LEVELS[0]!;
    progress.complete(level, result({ stars: 3, score: 300 }), ['vo-chuoi'], 0);
    progress.complete(level, result({ stars: 1, score: 500 }), ['giay-bao'], 2);
    progress.complete(level, result({ stars: 0, score: 10, failed: true }), [], 0);
    expect(storage.read().levels[level.id]).toEqual({ stars: 3, bestScore: 500, cleared: true });
    expect(progress.data.handbook).toEqual(['vo-chuoi', 'giay-bao']);
    expect(progress.data.stats).toEqual({ totalTrash: 75, totalCorrect: 60, veChaiSold: 2 });
  });

  test('cùng kết quả hoàn tất chỉ được cộng một lần', () => {
    const progress = new ProgressStore(new SaveStore(null));
    const finished = result();
    progress.complete(LEVELS[0]!, finished, ['vo-chuoi', 'vo-chuoi'], 2);
    progress.complete(LEVELS[0]!, finished, ['giay-bao'], 2);
    expect(progress.data.stats).toEqual({ totalTrash: 25, totalCorrect: 20, veChaiSold: 2 });
    expect(progress.data.handbook).toEqual(['vo-chuoi']);
    progress.complete(LEVELS[0]!, { ...finished }, [], 0);
    expect(progress.data.stats.totalTrash).toBe(50);
  });

  test('thua vẫn mở thẻ đã phân loại đúng, lưu kỷ lục và giữ trạng thái chưa qua màn', () => {
    const progress = new ProgressStore(new SaveStore(null));
    progress.complete(LEVELS[0]!, result({ stars: 0, failed: true, score: 150 }), ['pin-aa'], 0);
    expect(progress.data.levels['ha-noi']).toEqual({ stars: 0, bestScore: 150, cleared: false });
    expect(progress.data.handbook).toEqual(['pin-aa']);
    expect(isLevelUnlocked(progress.data, LEVELS[1]!)).toBe(false);
  });

  test('localStorage bị chặn vẫn có thể mở khóa và giữ dữ liệu trong phiên', () => {
    const backend: StorageBackend = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    };
    const progress = new ProgressStore(new SaveStore(backend));
    expect(() => progress.complete(LEVELS[0]!, result({ stars: 1 }), ['tui-nilon'], 1)).not.toThrow();
    progress.setMuted(false);
    progress.setPledges(['tui-vai']);
    expect(isLevelUnlocked(progress.data, LEVELS[1]!)).toBe(true);
    expect(progress.data.settings.muted).toBe(false);
    expect(progress.data.pledges).toEqual(['tui-vai']);
  });

  test('cam kết chỉ giữ id hợp lệ, duy nhất và tối đa ba lời', () => {
    const storage = memory();
    const progress = new ProgressStore(new SaveStore(storage.backend));
    progress.setPledges(['bad', 'gom-pin', 'gom-pin', 'tui-vai', 'binh-nuoc', 'nhac-ban']);
    expect(storage.read().pledges).toEqual(['gom-pin', 'tui-vai', 'binh-nuoc']);
    progress.setPledges([]);
    expect(progress.data.pledges).toEqual([]);
  });

  test('khôi phục mục tiến trình cũ hỏng và giữ trường bổ sung của mục hợp lệ', () => {
    const saved = createDefaultSave();
    const rawLevels = saved.levels as unknown as Record<string, unknown>;
    rawLevels['ha-noi'] = { stars: '3', bestScore: -100, cleared: 'yes', legacyNote: 'preserve' };
    rawLevels['ha-long'] = null;
    rawLevels['unknown-level'] = { custom: 'untouched' };
    saved.handbook = ['vo-chuoi', 'vo-chuoi'];
    const storage = memory(saved);
    const progress = new ProgressStore(new SaveStore(storage.backend));
    progress.complete(LEVELS[0]!, result({ stars: 1, score: 50 }), ['vo-chuoi', 'lon-nhom'], 0);
    progress.complete(LEVELS[1]!, result({ stars: 0, score: 20 }), [], 0);
    const levels = storage.read().levels as unknown as Record<string, unknown>;
    expect(levels['ha-noi']).toEqual({ stars: 1, bestScore: 50, cleared: true, legacyNote: 'preserve' });
    expect(levels['ha-long']).toEqual({ stars: 0, bestScore: 20, cleared: false });
    expect(levels['unknown-level']).toEqual({ custom: 'untouched' });
    expect(progress.data.handbook).toEqual(['vo-chuoi', 'lon-nhom']);
  });
});

describe('isLevelUnlocked', () => {
  test('màn đầu luôn mở, màn sau cần ít nhất một sao của màn liền trước', () => {
    const saved = createDefaultSave();
    expect(isLevelUnlocked(saved, LEVELS[0]!)).toBe(true);
    for (const level of LEVELS.slice(1)) expect(isLevelUnlocked(saved, level)).toBe(false);
    saved.levels['ha-noi'] = { stars: 1, bestScore: 0, cleared: false };
    expect(isLevelUnlocked(saved, LEVELS[1]!)).toBe(true);
    expect(isLevelUnlocked(saved, LEVELS[2]!)).toBe(false);
    saved.levels['ha-long'] = { stars: 0, bestScore: 0, cleared: true };
    expect(isLevelUnlocked(saved, LEVELS[2]!)).toBe(false);
  });

  test.each([null, 3, { stars: '3' }, { stars: 4 }, { stars: -1 }, { stars: 1.5 }])('mục cũ hỏng không mở khóa %j', entry => {
    const saved = createDefaultSave();
    (saved.levels as unknown as Record<string, unknown>)['ha-noi'] = entry;
    expect(isLevelUnlocked(saved, LEVELS[1]!)).toBe(false);
  });
});
