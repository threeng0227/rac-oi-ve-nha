/**
 * Gom chạm và chuột thành một luồng duy nhất, toạ độ đã quy về hệ ảo.
 *
 * Dùng Pointer Events thay vì xử lý riêng touch và mouse: trình duyệt đã gộp
 * sẵn, viết hai nhánh chỉ tạo thêm chỗ cho hai nhánh lệch nhau.
 */
import type { PointerSample, PointerPhase } from './Game';
import type { Viewport } from './Viewport';

/**
 * Phần DOM mà Input thật sự dùng — tách ra để test tiêm phần tử giả vào.
 * Chữ ký phải đủ rộng để một `HTMLCanvasElement` thật khớp được.
 */
export interface PointerTarget {
  addEventListener(type: string, handler: (ev: Event) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: string, handler: (ev: Event) => void, options?: EventListenerOptions): void;
  getBoundingClientRect(): { left: number; top: number };
}

/** Thứ Input cần đọc từ một pointer event. */
interface PointerLike {
  type: string;
  clientX: number;
  clientY: number;
  pointerId: number;
  preventDefault(): void;
}

const PHASE_BY_TYPE: Record<string, PointerPhase> = {
  pointerdown: 'down',
  pointermove: 'move',
  pointerup: 'up',
  pointercancel: 'cancel',
};

export class Input {
  private target: PointerTarget | null = null;

  constructor(
    private readonly viewport: Viewport,
    private readonly sink: (sample: PointerSample) => void,
  ) {}

  attach(target: PointerTarget): void {
    // Attach đè lên lần trước sẽ nhân đôi mọi sự kiện: một cú chạm thành hai
    // lần nhặt rác. Gỡ cái cũ ra trước.
    if (this.target !== null) this.detach();
    this.target = target;

    for (const type of Object.keys(PHASE_BY_TYPE)) {
      target.addEventListener(type, this.handle, { passive: false });
    }
  }

  detach(): void {
    const target = this.target;
    if (target === null) return;

    for (const type of Object.keys(PHASE_BY_TYPE)) {
      // Không truyền options: chỉ `capture` ảnh hưởng tới việc gỡ, mà ta không dùng capture.
      target.removeEventListener(type, this.handle);
    }
    this.target = null;
  }

  private readonly handle = (raw: Event): void => {
    // Pointer event thật mang đủ các trường này; ép kiểu một chỗ duy nhất
    // thay vì rải `as` khắp nơi bên dưới.
    const event = raw as unknown as PointerLike;
    const phase = PHASE_BY_TYPE[event.type];
    if (phase === undefined) return;

    // Không chặn thì kéo rác xuống thùng sẽ bị trình duyệt hiểu là cuộn trang,
    // và trên iOS còn kích hoạt pull-to-refresh.
    event.preventDefault();

    const rect = this.target?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const point = this.viewport.toVirtual(event.clientX - rect.left, event.clientY - rect.top);

    this.sink({ x: point.x, y: point.y, phase, id: event.pointerId });
  };
}
