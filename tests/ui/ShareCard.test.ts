import { describe, expect, test, vi } from 'vitest';
import { LEVELS } from '../../src/data/levels';
import type { LevelResult } from '../../src/gameplay/ScoreSystem';
import { ShareCard, type ShareCardEnvironment } from '../../src/ui/ShareCard';

const result: LevelResult = {
  score: 420, stars: 3, cleanliness: 1, failed: false, correctCount: 20,
  totalSpawned: 20, mistakes: 0, hazardMistakes: 0, remainingCount: 0, hazardRemainingCount: 0,
};

function environment() {
  const context = new Proxy({}, {
    get: (_target, key) => {
      if (key === 'measureText') return (text: string) => ({ width: text.length * 20 });
      if (key === 'createLinearGradient') return () => ({ addColorStop: vi.fn() });
      return vi.fn();
    },
    set: () => true,
  });
  const canvas = { width: 0, height: 0, getContext: () => context,
    toBlob: (callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' })) };
  const env: ShareCardEnvironment = {
    createCanvas: () => canvas as unknown as HTMLCanvasElement,
    createObjectURL: vi.fn(() => 'blob:card'),
    revokeObjectURL: vi.fn(),
    downloadLink: vi.fn(),
    deferCleanup: callback => callback(),
  };
  return { env, canvas };
}

describe('ShareCard', () => {
  test('ảnh chia sẻ luôn vuông 1080×1080', () => {
    const { env } = environment();
    const card = new ShareCard(LEVELS[0]!, result, [], env).canvas();
    expect([card.width, card.height]).toEqual([1080, 1080]);
  });

  test('Web Share nhận file PNG khi trình duyệt hỗ trợ chia sẻ file', async () => {
    const { env } = environment();
    env.canShare = vi.fn(() => true);
    env.share = vi.fn(async () => {});
    expect(await new ShareCard(LEVELS[0]!, result, [], env).share()).toBe('shared');
    expect(env.share).toHaveBeenCalledTimes(1);
    const data = vi.mocked(env.share).mock.calls[0]![0];
    expect(data.files?.[0]?.type).toBe('image/png');
    expect(data.files?.[0]?.name).toBe('rac-oi-ve-nha-ha-noi.png');
    expect(env.downloadLink).not.toHaveBeenCalled();
  });

  test('không hỗ trợ hoặc canShare từ chối thì tải ảnh và thu hồi URL', async () => {
    for (const canShare of [undefined, () => false, () => { throw new Error('unsupported'); }]) {
      const { env } = environment();
      env.share = vi.fn(async () => {});
      if (canShare) env.canShare = canShare;
      const card = new ShareCard(LEVELS[0]!, result, [], env);
      expect(await card.share()).toBe('downloaded');
      expect(env.downloadLink).toHaveBeenCalledWith('blob:card', 'rac-oi-ve-nha-ha-noi.png');
      expect(env.revokeObjectURL).toHaveBeenCalledWith('blob:card');
      expect(env.share).not.toHaveBeenCalled();
    }
  });

  test('huỷ bảng chia sẻ không tự tải file', async () => {
    const { env } = environment();
    env.canShare = () => true;
    env.share = async () => { throw new DOMException('cancelled', 'AbortError'); };
    expect(await new ShareCard(LEVELS[0]!, result, [], env).share()).toBe('cancelled');
    expect(env.downloadLink).not.toHaveBeenCalled();
  });

  test('lỗi chia sẻ khác vẫn tải được ảnh', async () => {
    const { env } = environment();
    env.canShare = () => true;
    env.share = async () => { throw new DOMException('blocked', 'NotAllowedError'); };
    expect(await new ShareCard(LEVELS[0]!, result, [], env).share()).toBe('downloaded');
    expect(env.downloadLink).toHaveBeenCalledTimes(1);
  });

  test('nút tải riêng thu hồi URL kể cả khi tải thất bại', async () => {
    const { env } = environment();
    env.downloadLink = () => { throw new Error('download failed'); };
    await expect(new ShareCard(LEVELS[0]!, result, [], env).download()).rejects.toThrow('download failed');
    expect(env.revokeObjectURL).toHaveBeenCalledWith('blob:card');
  });

  test('báo lỗi khi không xuất được PNG, không tạo URL rỗng', async () => {
    const { env, canvas } = environment();
    canvas.toBlob = callback => callback(null);
    await expect(new ShareCard(LEVELS[0]!, result, [], env).download()).rejects.toThrow();
    expect(env.createObjectURL).not.toHaveBeenCalled();
  });
});
