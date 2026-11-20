/**
 * Vòng lặp game và quản lý scene.
 *
 * Bước cập nhật cố định 1/60 giây, tách hẳn khỏi nhịp vẽ. Nếu buộc logic
 * vào tốc độ màn hình thì game chạy nhanh gấp đôi trên máy 120Hz — rác rơi
 * nhanh gấp đôi, đồng hồ đếm ngược nhanh gấp đôi, và mọi con số cân bằng
 * ở Mục 5 của đặc tả trở thành vô nghĩa.
 */

/** Một bước logic. Mọi `update` đều nhận đúng giá trị này, không bao giờ nhận thời gian thật. */
export const FIXED_DT = 1 / 60;

/**
 * Chặn trên độ dài một khung hình. Khi tab bị ẩn rồi hiện lại, hoặc máy vừa
 * ngủ dậy, `timeMs` nhảy vài chục giây. Không chặn thì vòng lặp cố chạy bù
 * hàng nghìn bước trong một khung hình, treo máy luôn — "spiral of death".
 */
export const MAX_FRAME_SEC = 0.25;

export type PointerPhase = 'down' | 'move' | 'up' | 'cancel';

export interface PointerSample {
  /** Toạ độ theo hệ ảo 720×1280. */
  readonly x: number;
  readonly y: number;
  readonly phase: PointerPhase;
  /** Định danh ngón tay, để phân biệt khi chạm nhiều điểm. */
  readonly id: number;
}

export interface Scene {
  /** `game` chỉ có khi scene được đổi từ bên trong vòng lặp; test đổi scene trực tiếp thì không. */
  enter?(game?: Game): void;
  /** Dọn dẹp: huỷ tween, bỏ listener. Không dọn thì tween còn sống giữ tham chiếu tới đối tượng đã chết. */
  exit?(): void;
  update(dt: number): void;
  render(g: CanvasRenderingContext2D): void;
  onPointer?(sample: PointerSample): void;
}

/** Phần requestAnimationFrame mà game dùng — tách ra để test tiêm đồng hồ giả vào. */
export interface FrameClock {
  requestFrame(callback: (timeMs: number) => void): number;
  cancelFrame(id: number): void;
}

/**
 * Gom thời gian thật thành những bước cố định.
 * Phần dư được giữ lại sang khung sau, nên về lâu dài không trôi nhịp.
 */
export class FixedTimestep {
  private accumulator = 0;
  private steps = 0;

  constructor(
    private readonly stepSec: number = FIXED_DT,
    private readonly maxFrameSec: number = MAX_FRAME_SEC,
  ) {}

  /** Tổng số bước đã chạy từ lần reset gần nhất. */
  get totalSteps(): number {
    return this.steps;
  }

  /** Phần dư chưa đủ một bước, quy về [0, 1). Dùng để nội suy vị trí lúc vẽ. */
  get alpha(): number {
    return this.accumulator / this.stepSec;
  }

  /** Nạp thời gian của một khung hình, trả về số bước cần chạy. */
  advance(frameSec: number): number {
    // dt âm xảy ra thật khi đồng hồ hệ thống bị chỉnh lùi.
    // Để lọt vào accumulator thì nó âm luôn và game đứng hình.
    const clamped = Math.min(Math.max(frameSec, 0), this.maxFrameSec);
    this.accumulator += clamped;

    let steps = 0;
    while (this.accumulator >= this.stepSec) {
      this.accumulator -= this.stepSec;
      steps++;
    }

    this.steps += steps;
    return steps;
  }

  reset(): void {
    this.accumulator = 0;
    this.steps = 0;
  }
}

export class SceneManager {
  private scene: Scene | undefined;

  get current(): Scene | undefined {
    return this.scene;
  }

  change(next: Scene, game?: Game): void {
    this.scene?.exit?.();
    this.scene = next;
    next.enter?.(game);
  }

  update(dt: number): void {
    // Chụp lại scene hiện tại trước khi gọi: update có thể tự đổi scene,
    // và scene mới không được chạy luôn trong cùng khung hình đó.
    this.scene?.update(dt);
  }

  render(g: CanvasRenderingContext2D): void {
    this.scene?.render(g);
  }

  onPointer(sample: PointerSample): void {
    this.scene?.onPointer?.(sample);
  }
}

export class Game {
  readonly scenes = new SceneManager();
  private readonly timestep = new FixedTimestep();
  private frameId: number | null = null;
  private lastTimeMs: number | null = null;
  private running = false;

  constructor(
    private readonly clock: FrameClock,
    private readonly getContext: () => CanvasRenderingContext2D | null,
  ) {}

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    // Quên mốc thời gian cũ: chạy lại sau khi dừng không được tính cả
    // quãng người chơi khoá máy thành thời gian chơi.
    this.lastTimeMs = null;
    this.timestep.reset();
    this.schedule();
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.frameId !== null) {
      this.clock.cancelFrame(this.frameId);
      this.frameId = null;
    }
  }

  private schedule(): void {
    if (this.frameId !== null) return;
    this.frameId = this.clock.requestFrame(this.onFrame);
  }

  private readonly onFrame = (timeMs: number): void => {
    this.frameId = null;
    if (!this.running) return;

    if (this.lastTimeMs === null) {
      // Khung đầu tiên chỉ để lấy mốc. Chưa có khoảng thời gian nào để chạy.
      this.lastTimeMs = timeMs;
    } else {
      const frameSec = (timeMs - this.lastTimeMs) / 1000;
      this.lastTimeMs = timeMs;

      const steps = this.timestep.advance(frameSec);
      for (let i = 0; i < steps; i++) {
        this.scenes.update(FIXED_DT);
      }
    }

    // Vẽ đúng một lần mỗi khung hình, dù vừa chạy bao nhiêu bước cập nhật.
    const ctx = this.getContext();
    if (ctx !== null) this.scenes.render(ctx);

    this.schedule();
  };
}
