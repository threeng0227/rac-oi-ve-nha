/**
 * Hệ toạ độ ảo của game. MỌI toạ độ trong code viết theo hệ này,
 * không bao giờ dùng pixel thật. Viewport lo phần quy đổi.
 *
 * ## Vì sao khung ảo co giãn cả hai chiều
 *
 * Điện thoại hiện đại không còn 16:9. Màn 20:9 nằm ngang là 2.22:1 — khung cố
 * định sẽ để lại hai dải đen to đùng và game trông như chạy trong giả lập.
 *
 * Và người chơi không phải lúc nào cũng chịu xoay máy. Nhiều người bật khoá
 * xoay màn hình và không biết tắt ở đâu. Ép xoay là mất người chơi ngay ở giây
 * đầu tiên, trước khi họ kịp thấy game là cái gì.
 *
 * Nên: **cạnh NGẮN của khung ảo luôn là 720**, cạnh dài giãn theo tỉ lệ máy.
 * Cầm ngang thì cao 720 rộng ~1560; cầm dọc thì rộng 720 cao ~1560. Game chơi
 * được ở cả hai hướng, full màn ở cả hai.
 *
 * ## Hệ quả cho người viết scene
 *
 * **Không có chiều nào là cố định.** Mọi toạ độ phải tính theo `viewport.width`,
 * `viewport.height`, `viewport.centerX` — hoặc qua `computeLayout()` trong
 * `Layout.ts`. `DESIGN_WIDTH` chỉ là khung tham chiếu để nghĩ bố cục,
 * **không bao giờ dùng làm toạ độ.**
 */

/** Cạnh ngắn của khung ảo. Luôn là giá trị này, dù cầm ngang hay dọc. */
export const SHORT_SIDE = 720;

/** Khung tham chiếu khi nghĩ về bố cục ngang (16:9). KHÔNG phải kích thước thật lúc chạy. */
export const DESIGN_WIDTH = 1280;

/** Tỉ lệ vuông hơn mức này thì thà letterbox còn hơn bóp vùng chơi. */
export const MIN_LONG_SIDE = 1100;

/** Dài hơn mức này (màn siêu rộng 32:9) thì thà letterbox còn hơn kéo dãn vô hạn. */
export const MAX_LONG_SIDE = 1800;

/** Chặn trên devicePixelRatio: máy 4x gấp đôi số điểm ảnh phải vẽ mà mắt gần như không phân biệt được. */
const MAX_DPR = 3;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export class Viewport {
  /** Chiều rộng khung ảo hiện tại. Thay đổi theo tỉ lệ và hướng màn hình. */
  width = DESIGN_WIDTH;
  /** Chiều cao khung ảo hiện tại. Thay đổi theo tỉ lệ và hướng màn hình. */
  height = SHORT_SIDE;
  /** Máy đang cầm dọc hay không. */
  isPortrait = false;

  /** Chiều rộng vùng hiển thị, đơn vị CSS pixel. */
  cssWidth = DESIGN_WIDTH;
  /** Chiều cao vùng hiển thị, đơn vị CSS pixel. */
  cssHeight = SHORT_SIDE;
  /** devicePixelRatio đã chặn trong khoảng [1, 3]. */
  dpr = 1;
  /** Hệ số phóng từ hệ ảo sang CSS pixel. */
  scale = 1;
  /** Lề trái của khung ảo trong vùng hiển thị (letterbox). */
  offsetX = 0;
  /** Lề trên của khung ảo trong vùng hiển thị (letterbox). */
  offsetY = 0;
  /** Chiều rộng đệm canvas, đơn vị pixel thật. */
  canvasWidth = DESIGN_WIDTH;
  /** Chiều cao đệm canvas, đơn vị pixel thật. */
  canvasHeight = SHORT_SIDE;

  /** Tâm ngang của khung ảo hiện tại. Dùng cái này, đừng dùng `DESIGN_WIDTH / 2`. */
  get centerX(): number {
    return this.width / 2;
  }

  /** Tâm dọc của khung ảo hiện tại. */
  get centerY(): number {
    return this.height / 2;
  }

  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number): void {
    // Màn hình 0×0 xảy ra thật: tab ẩn, iframe chưa layout xong.
    // Không chặn thì scale thành 0 và mọi phép chia sau đó ra Infinity.
    const w = Math.max(1, cssWidth);
    const h = Math.max(1, cssHeight);

    this.cssWidth = w;
    this.cssHeight = h;
    this.dpr = Math.min(MAX_DPR, Math.max(1, devicePixelRatio));

    // Cạnh ngắn luôn 720; cạnh dài giãn theo tỉ lệ máy rồi chặn hai đầu.
    this.isPortrait = h > w;
    const longSide = Math.min(
      MAX_LONG_SIDE,
      Math.max(MIN_LONG_SIDE, Math.round(SHORT_SIDE * (Math.max(w, h) / Math.min(w, h)))),
    );
    this.width = this.isPortrait ? SHORT_SIDE : longSide;
    this.height = this.isPortrait ? longSide : SHORT_SIDE;

    this.scale = Math.min(w / this.width, h / this.height);
    this.offsetX = (w - this.width * this.scale) / 2;
    this.offsetY = (h - this.height * this.scale) / 2;
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
