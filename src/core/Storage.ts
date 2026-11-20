/**
 * Tiến trình người chơi, lưu trên máy họ.
 * Không gửi đi đâu, không tài khoản, không theo dõi.
 *
 * Mọi truy cập localStorage đều có thể ném lỗi: Safari ẩn danh, trình duyệt
 * chặn cookie bên thứ ba, hết dung lượng. Hỏng chỗ này thì game không mở được,
 * nên ở đây không bao giờ để lỗi thoát ra ngoài.
 */

export const SAVE_KEY = 'racoivenha.save';
export const SAVE_VERSION = 1;

export interface LevelProgress {
  stars: 0 | 1 | 2 | 3;
  bestScore: number;
  cleared: boolean;
}

export interface SaveData {
  version: number;
  levels: Record<string, LevelProgress>;
  handbook: string[];
  pledges: string[];
  stats: {
    totalTrash: number;
    totalCorrect: number;
    veChaiSold: number;
  };
  settings: {
    muted: boolean;
  };
}

/** Phần localStorage mà game thật sự dùng — để test tiêm bản giả vào. */
export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    levels: {},
    handbook: [],
    pledges: [],
    stats: { totalTrash: 0, totalCorrect: 0, veChaiSold: 0 },
    // Trình duyệt di động chặn autoplay, và tiếng bật sẵn ở nơi công cộng
    // là cách nhanh nhất để người ta đóng tab.
    settings: { muted: true },
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export class SaveStore {
  constructor(private readonly backend: StorageBackend | null) {}

  /** Luôn trả về một bản lưu dùng được. Dữ liệu hỏng hay thiếu đều lấp bằng mặc định. */
  load(): SaveData {
    const defaults = createDefaultSave();

    let raw: string | null = null;
    try {
      raw = this.backend?.getItem(SAVE_KEY) ?? null;
    } catch {
      return defaults;
    }
    if (raw === null) return defaults;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return defaults;
    }

    if (!isRecord(parsed)) return defaults;
    // Phiên bản lạ: có thể là bản lưu của tương lai, đoán mò còn tệ hơn làm lại.
    if (parsed['version'] !== SAVE_VERSION) return defaults;

    const stats = isRecord(parsed['stats']) ? parsed['stats'] : {};
    const settings = isRecord(parsed['settings']) ? parsed['settings'] : {};

    return {
      version: SAVE_VERSION,
      levels: isRecord(parsed['levels']) ? (parsed['levels'] as Record<string, LevelProgress>) : defaults.levels,
      handbook: Array.isArray(parsed['handbook']) ? (parsed['handbook'] as string[]) : defaults.handbook,
      pledges: Array.isArray(parsed['pledges']) ? (parsed['pledges'] as string[]) : defaults.pledges,
      stats: {
        totalTrash: typeof stats['totalTrash'] === 'number' ? stats['totalTrash'] : 0,
        totalCorrect: typeof stats['totalCorrect'] === 'number' ? stats['totalCorrect'] : 0,
        veChaiSold: typeof stats['veChaiSold'] === 'number' ? stats['veChaiSold'] : 0,
      },
      settings: {
        muted: typeof settings['muted'] === 'boolean' ? settings['muted'] : defaults.settings.muted,
      },
    };
  }

  /** `false` nghĩa là không lưu được — người chơi vẫn chơi tiếp bình thường, chỉ mất tiến trình. */
  save(data: SaveData): boolean {
    try {
      this.backend?.setItem(SAVE_KEY, JSON.stringify(data));
      return this.backend !== null;
    } catch {
      return false;
    }
  }
}

/** localStorage thật, nếu trình duyệt cho phép chạm vào. */
export function detectBackend(): StorageBackend | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
