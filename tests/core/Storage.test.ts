import { describe, expect, test } from 'vitest';
import {
  SaveStore,
  SAVE_KEY,
  SAVE_VERSION,
  createDefaultSave,
  type StorageBackend,
} from '../../src/core/Storage';

/** localStorage giả, nằm trong bộ nhớ. */
function fakeBackend(seed: Record<string, string> = {}): StorageBackend & { data: Record<string, string> } {
  const data = { ...seed };
  return {
    data,
    getItem: (k) => (k in data ? (data[k] as string) : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

/** Mô phỏng Safari chế độ ẩn danh: mọi truy cập đều ném lỗi. */
const hostileBackend: StorageBackend = {
  getItem: () => {
    throw new DOMException('SecurityError');
  },
  setItem: () => {
    throw new DOMException('QuotaExceededError');
  },
};

describe('createDefaultSave', () => {
  test('người chơi mới chưa mở màn nào, sổ tay rỗng, tiếng tắt sẵn', () => {
    const save = createDefaultSave();

    expect(save.version).toBe(SAVE_VERSION);
    expect(save.levels).toEqual({});
    expect(save.handbook).toEqual([]);
    expect(save.pledges).toEqual([]);
    expect(save.settings.muted).toBe(true);
    expect(save.stats).toEqual({ totalTrash: 0, totalCorrect: 0, veChaiSold: 0 });
  });

  test('mỗi lần gọi trả về một đối tượng mới, không dùng chung tham chiếu', () => {
    const a = createDefaultSave();
    const b = createDefaultSave();

    a.handbook.push('chai-nhua-pet');

    expect(b.handbook).toEqual([]);
  });
});

describe('SaveStore', () => {
  test('lưu rồi đọc lại ra đúng dữ liệu', () => {
    const backend = fakeBackend();
    const store = new SaveStore(backend);

    const save = createDefaultSave();
    save.levels['ha-noi'] = { stars: 3, bestScore: 1250, cleared: true };
    save.handbook.push('vo-chuoi');
    store.save(save);

    expect(new SaveStore(backend).load()).toEqual(save);
  });

  test('chưa từng chơi thì trả về bản mặc định', () => {
    expect(new SaveStore(fakeBackend()).load()).toEqual(createDefaultSave());
  });

  test('dữ liệu hỏng không làm văng lỗi, chỉ reset về mặc định', () => {
    const backend = fakeBackend({ [SAVE_KEY]: '{"levels": [[[' });

    expect(() => new SaveStore(backend).load()).not.toThrow();
    expect(new SaveStore(backend).load()).toEqual(createDefaultSave());
  });

  test('bản lưu của phiên bản lạ bị bỏ, không cố đọc bừa', () => {
    const backend = fakeBackend({
      [SAVE_KEY]: JSON.stringify({ version: 999, levels: { 'ha-noi': { stars: 3 } } }),
    });

    expect(new SaveStore(backend).load()).toEqual(createDefaultSave());
  });

  test('JSON hợp lệ nhưng không phải object cũng không làm vỡ', () => {
    for (const payload of ['null', '42', '"xin chao"', '[1,2,3]']) {
      const backend = fakeBackend({ [SAVE_KEY]: payload });
      expect(new SaveStore(backend).load()).toEqual(createDefaultSave());
    }
  });

  test('thiếu trường thì lấp bằng mặc định thay vì trả về undefined', () => {
    const backend = fakeBackend({
      [SAVE_KEY]: JSON.stringify({ version: SAVE_VERSION, levels: { 'ha-noi': { stars: 2, bestScore: 900, cleared: true } } }),
    });

    const save = new SaveStore(backend).load();

    expect(save.levels['ha-noi']?.stars).toBe(2);
    expect(save.handbook).toEqual([]);
    expect(save.stats.totalTrash).toBe(0);
    expect(save.settings.muted).toBe(true);
  });

  test('chế độ ẩn danh — đọc không văng lỗi, vẫn chơi được', () => {
    const store = new SaveStore(hostileBackend);

    expect(() => store.load()).not.toThrow();
    expect(store.load()).toEqual(createDefaultSave());
  });

  test('chế độ ẩn danh — ghi không văng lỗi, chỉ là không lưu được', () => {
    const store = new SaveStore(hostileBackend);

    expect(() => store.save(createDefaultSave())).not.toThrow();
    expect(store.save(createDefaultSave())).toBe(false);
  });

  test('ghi thành công thì báo true', () => {
    expect(new SaveStore(fakeBackend()).save(createDefaultSave())).toBe(true);
  });

  test('không có localStorage nào cả thì vẫn dựng được store', () => {
    const store = new SaveStore(null);

    expect(store.load()).toEqual(createDefaultSave());
    expect(store.save(createDefaultSave())).toBe(false);
  });
});
