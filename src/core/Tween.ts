/** Nội suy giá trị theo thời gian — dùng cho mọi hiệu ứng nảy, bay, mờ dần trong game. */

export type EasingFn = (t: number) => number;

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

export const easeLinear: EasingFn = (t) => clamp01(t);

export const easeOutCubic: EasingFn = (t) => {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
};

/** Vọt quá đích rồi lùi về — cú nảy khi thùng rác nhận đúng món. */
export const easeOutBack: EasingFn = (t) => {
  const x = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export const easeInOutQuad: EasingFn = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

export interface TweenSpec {
  from: number;
  to: number;
  durationSec: number;
  ease?: EasingFn;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

/** Định danh mờ của một tween đang chạy, dùng để huỷ. */
export type TweenHandle = number;

interface ActiveTween extends TweenSpec {
  handle: TweenHandle;
  elapsedSec: number;
  cancelled: boolean;
}

export class TweenRunner {
  private tweens: ActiveTween[] = [];
  private nextHandle: TweenHandle = 1;

  get count(): number {
    return this.tweens.length;
  }

  add(spec: TweenSpec): TweenHandle {
    const handle = this.nextHandle++;
    this.tweens.push({ ...spec, handle, elapsedSec: 0, cancelled: false });
    // Phát giá trị đầu ngay, nếu không khung hình đầu tiên sẽ vẽ ở vị trí cũ.
    spec.onUpdate(spec.from);
    return handle;
  }

  cancel(handle: TweenHandle): void {
    const tween = this.tweens.find((t) => t.handle === handle);
    if (tween === undefined) return;
    // Đánh dấu thay vì xoá ngay: cancel có thể được gọi từ trong onUpdate
    // của một tween khác, lúc vòng lặp update đang chạy trên mảng này.
    tween.cancelled = true;
  }

  /** Dọn sạch. Gọi khi rời scene — tween còn sót lại sẽ giữ tham chiếu tới đối tượng đã chết. */
  clear(): void {
    this.tweens = [];
  }

  update(dtSec: number): void {
    if (this.tweens.length === 0) return;

    const snapshot = this.tweens.slice();
    const completed: Array<() => void> = [];

    for (const tween of snapshot) {
      if (tween.cancelled) continue;

      tween.elapsedSec += dtSec;

      const finished = tween.durationSec <= 0 || tween.elapsedSec >= tween.durationSec;
      if (finished) {
        // Chốt đúng giá trị đích, không để sai số dấu phẩy động làm lệch vị trí cuối.
        tween.onUpdate(tween.to);
        tween.cancelled = true;
        if (tween.onComplete !== undefined) completed.push(tween.onComplete);
        continue;
      }

      const ease = tween.ease ?? easeOutCubic;
      const progress = ease(tween.elapsedSec / tween.durationSec);
      tween.onUpdate(tween.from + (tween.to - tween.from) * progress);
    }

    this.tweens = this.tweens.filter((t) => !t.cancelled);
    for (const done of completed) done();
  }
}
