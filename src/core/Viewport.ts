/**
 * Hệ toạ độ ảo của game. MỌI toạ độ trong code viết theo hệ này,
 * không bao giờ dùng pixel thật. Viewport lo phần quy đổi.
 */
export const VIRTUAL_WIDTH = 720;
export const VIRTUAL_HEIGHT = 1280;

/** Chặn trên devicePixelRatio: máy 4x gấp đôi số điểm ảnh phải vẽ mà mắt gần như không phân biệt được. */
const MAX_DPR = 3;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export class Viewport {
  /** Chiều rộng vùng hiển thị, đơn vị CSS pixel. */
  cssWidth = VIRTUAL_WIDTH;
  /** Chiều cao vùng hiển thị, đơn vị CSS pixel. */
  cssHeight = VIRTUAL_HEIGHT;
  /** devicePixelRatio đã chặn trong khoảng [1, 3]. */
  dpr = 1;
  /** Hệ số phóng từ hệ ảo sang CSS pixel. */
  scale = 1;
  /** Lề trái của khung ảo trong vùng hiển thị (letterbox). */
  offsetX = 0;
  /** Lề trên của khung ảo trong vùng hiển thị (letterbox). */
  offsetY = 0;
  /** Chiều rộng đệm canvas, đơn vị pixel thật. */
  canvasWidth = VIRTUAL_WIDTH;
  /** Chiều cao đệm canvas, đơn vị pixel thật. */
  canvasHeight = VIRTUAL_HEIGHT;

  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number): void {
    // Màn hình 0×0 xảy ra thật: tab ẩn, iframe chưa layout xong.
    // Không chặn thì scale thành 0 và mọi phép chia sau đó ra Infinity.
    const w = Math.max(1, cssWidth);
    const h = Math.max(1, cssHeight);

    this.cssWidth = w;
    this.cssHeight = h;
    this.dpr = Math.min(MAX_DPR, Math.max(1, devicePixelRatio));
    this.scale = Math.min(w / VIRTUAL_WIDTH, h / VIRTUAL_HEIGHT);
    this.offsetX = (w - VIRTUAL_WIDTH * this.scale) / 2;
    this.offsetY = (h - VIRTUAL_HEIGHT * this.scale) / 2;
    this.canvasWidth = Math.round(w * this.dpr);
    this.canvasHeight = Math.round(h * this.dpr);
  }

  /** CSS pixel (toạ độ con trỏ/ngón tay) → hệ ảo. Có thể trả về giá trị ngoài khung nếu chạm vào dải letterbox. */
  toVirtual(cssX: number, cssY: number): Point {
    return {
      x: (cssX - this.offsetX) / this.scale,
      y: (cssY - this.offsetY) / this.scale,
    };
  }

  /** Hệ ảo → CSS pixel. */
  toScreen(virtualX: number, virtualY: number): Point {
    return {
      x: virtualX * this.scale + this.offsetX,
      y: virtualY * this.scale + this.offsetY,
    };
  }
}
