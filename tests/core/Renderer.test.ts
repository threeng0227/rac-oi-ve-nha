import { describe, expect, test, vi } from 'vitest';
import { applyViewportTransform, clearFrame } from '../../src/core/Renderer';
import { Viewport, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../../src/core/Viewport';

function spyContext() {
  return {
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '' as string | CanvasGradient | CanvasPattern,
  };
}

describe('applyViewportTransform', () => {
  test('gộp DPR, scale và lề letterbox vào đúng một ma trận', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 2);
    const ctx = spyContext();

    applyViewportTransform(ctx as unknown as CanvasRenderingContext2D, vp);

    const k = vp.dpr * vp.scale;
    expect(ctx.setTransform).toHaveBeenCalledWith(k, 0, 0, k, vp.dpr * vp.offsetX, vp.dpr * vp.offsetY);
  });

  test('sau khi áp ma trận, vẽ ở (0,0) hệ ảo rơi đúng vào góc khung nội dung', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 2);

    // Góc trên trái của khung ảo, tính bằng pixel thật.
    const expectedX = vp.dpr * vp.offsetX;
    const expectedY = vp.dpr * vp.offsetY;
    const screen = vp.toScreen(0, 0);

    expect(screen.x * vp.dpr).toBeCloseTo(expectedX, 6);
    expect(screen.y * vp.dpr).toBeCloseTo(expectedY, 6);
  });
});

describe('clearFrame', () => {
  test('xoá toàn bộ đệm canvas, kể cả dải letterbox ngoài khung ảo', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 2);
    const ctx = spyContext();

    clearFrame(ctx as unknown as CanvasRenderingContext2D, vp, '#000000');

    // Phải reset về ma trận đơn vị trước, nếu không dải đen hai bên sẽ không được xoá.
    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, vp.canvasWidth, vp.canvasHeight);
    expect(ctx.fillStyle).toBe('#000000');
  });

  test('vùng xoá phủ hết đệm, không chỉ phần khung ảo', () => {
    const vp = new Viewport();
    vp.resize(844, 390, 1); // ngang: letterbox dồn sang hai cạnh trái phải
    const ctx = spyContext();

    clearFrame(ctx as unknown as CanvasRenderingContext2D, vp, '#123456');

    const contentWidth = VIRTUAL_WIDTH * vp.scale;
    expect(vp.canvasWidth).toBeGreaterThan(contentWidth);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, vp.canvasWidth, vp.canvasHeight);
  });

  test('khung ảo luôn vừa khít trong đệm sau khi scale', () => {
    const vp = new Viewport();
    vp.resize(412, 915, 2.625);

    expect(VIRTUAL_WIDTH * vp.scale).toBeLessThanOrEqual(vp.cssWidth + 1e-6);
    expect(VIRTUAL_HEIGHT * vp.scale).toBeLessThanOrEqual(vp.cssHeight + 1e-6);
  });
});
