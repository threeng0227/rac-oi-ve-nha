/**
 * Hệ toạ độ ảo của game. MỌI toạ độ trong code viết theo hệ này,
 * không bao giờ dùng pixel thật. Viewport lo phần quy đổi.
 *
 * ## Vì sao khung ảo co giãn thay vì cố định 16:9
 *
 * Điện thoại hiện đại không còn 16:9. Màn 20:9 nằm ngang là 2.22:1, rộng hơn
 * hẳn 1.78:1 — khung cố định sẽ để lại hai dải đen to đùng hai bên và game
 * trông như đang chạy trong giả lập.
 *
 * Nên: **chiều cao cố định 720**, chiều rộng giãn theo tỉ lệ máy. Máy rộng thì
 * nhìn được xa hơn sang hai bên, không ai bị bóp vùng chơi.
 *
 * ## Hệ quả cho người viết scene
 *
 * `DESIGN_WIDTH` chỉ là khung tham chiếu để nghĩ về bố cục. **Không dùng nó
 * làm toạ độ.** Mọi vị trí ngang phải tính theo `viewport.width`,
 * `viewport.centerX`, hoặc khoảng cách từ mép trái/phải. Chiều dọc thì cứ
 * dùng số cố định, vì chiều cao không bao giờ đổi.
 */

/** Chiều cao hệ ảo. Cố định — mọi toạ độ dọc viết thẳng theo số này. */
export const VIRTUAL_HEIGHT = 720;

/** Khung tham chiếu khi nghĩ về bố cục (16:9). KHÔNG phải chiều rộng thật lúc chạy. */
export const DESIGN_WIDTH = 1280;

/** Hẹp hơn mức này thì thà letterbox trên dưới, còn hơn bóp vùng chơi. */
export const MIN_VIRTUAL_WIDTH = 1280;

/** Rộng hơn mức này (màn siêu rộng 32:9) thì thà letterbox hai bên còn hơn kéo dãn vô hạn. */
export const MAX_VIRTUAL_WIDTH = 1800;

/** Chặn trên devicePixelRatio: máy 4x gấp đôi số điểm ảnh phải vẽ mà mắt gần như không phân biệt được. */
const MAX_DPR = 3;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export class Viewport {
  /** Chiều rộng khung ảo hiện tại. Thay đổi theo tỉ lệ màn hình. */
  width = DESIGN_WIDTH;
  /** Chiều cao khung ảo. Luôn bằng `VIRTUAL_HEIGHT`. */
  readonly height = VIRTUAL_HEIGHT;

  /** Chiều rộng vùng hiển thị, đơn vị CSS pixel. */
  cssWidth = DESIGN_WIDTH;
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
  canvasWidth = DESIGN_WIDTH;
  /** Chiều cao đệm canvas, đơn vị pixel thật. */
  canvasHeight = VIRTUAL_HEIGHT;

  /** Tâm ngang của khung ảo hiện tại. Dùng cái này, đừng dùng `DESIGN_WIDTH / 2`. */
  get centerX(): number {
    return this.width / 2;
  }

  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number): void {
    // Màn hình 0×0 xảy ra thật: tab ẩn, iframe chưa layout xong.
    // Không chặn thì scale thành 0 và mọi phép chia sau đó ra Infinity.
    const w = Math.max(1, cssWidth);
    const h = Math.max(1, cssHeight);

    this.cssWidth = w;
    this.cssHeight = h;
    this.dpr = Math.min(MAX_DPR, Math.max(1, devicePixelRatio));

    this.width = Math.min(
      MAX_VIRTUAL_WIDTH,
      Math.max(MIN_VIRTUAL_WIDTH, Math.round(VIRTUAL_HEIGHT * (w / h))),
    );

    this.scale = Math.min(w / this.width, h / VIRTUAL_HEIGHT);
    this.offsetX = (w - this.width * this.scale) / 2;
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
