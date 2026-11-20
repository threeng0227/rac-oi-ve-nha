/** Cầu nối giữa hệ toạ độ ảo và canvas thật. */
import type { Viewport } from './Viewport';

/**
 * Đặt ma trận để scene vẽ bằng toạ độ ảo 720×1280 mà ra đúng chỗ trên canvas.
 *
 * Gộp cả ba phép (lề letterbox → scale → DPR) vào một `setTransform` thay vì
 * gọi `translate` rồi `scale`: ma trận tích luỹ qua nhiều khung hình là nguồn
 * sai lệch âm thầm cổ điển.
 */
export function applyViewportTransform(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
  const k = viewport.dpr * viewport.scale;
  ctx.setTransform(k, 0, 0, k, viewport.dpr * viewport.offsetX, viewport.dpr * viewport.offsetY);
}

/**
 * Xoá cả đệm canvas, kể cả dải letterbox nằm ngoài khung ảo.
 * Phải reset về ma trận đơn vị trước, nếu không hai dải đen hai bên không được xoá
 * và rác của khung hình trước còn dính lại ở đó.
 */
export function clearFrame(ctx: CanvasRenderingContext2D, viewport: Viewport, color: string): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, viewport.canvasWidth, viewport.canvasHeight);
}
