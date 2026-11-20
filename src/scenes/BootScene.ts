/**
 * Scene tạm để kiểm chứng toàn bộ lớp core chạy đúng trên máy thật.
 * Sẽ bị MenuScene thay thế ở bước sau.
 */
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../core/Viewport';
import { TweenRunner, easeInOutQuad } from '../core/Tween';
import type { Scene, PointerSample } from '../core/Game';
import { vi } from '../i18n/vi';

const SKY_TOP = '#0E2A1F';
const SKY_BOTTOM = '#1D5C42';

export class BootScene implements Scene {
  private readonly tweens = new TweenRunner();
  private pulse = 0;
  private lastTouch: { x: number; y: number } | null = null;
  private touchCount = 0;

  enter(): void {
    this.breathe();
  }

  exit(): void {
    // Tween còn sống sau khi rời scene sẽ giữ tham chiếu tới scene đã chết.
    this.tweens.clear();
  }

  /** Nhịp thở chậm — đủ để nhìn ra vòng lặp có chạy đều hay không. */
  private breathe(): void {
    this.tweens.add({
      from: 0,
      to: 1,
      durationSec: 1.4,
      ease: easeInOutQuad,
      onUpdate: (v) => (this.pulse = v),
      onComplete: () => {
        this.tweens.add({
          from: 1,
          to: 0,
          durationSec: 1.4,
          ease: easeInOutQuad,
          onUpdate: (v) => (this.pulse = v),
          onComplete: () => this.breathe(),
        });
      },
    });
  }

  update(dt: number): void {
    this.tweens.update(dt);
  }

  onPointer(sample: PointerSample): void {
    if (sample.phase === 'down') this.touchCount++;
    if (sample.phase === 'up' || sample.phase === 'cancel') this.lastTouch = null;
    else this.lastTouch = { x: sample.x, y: sample.y };
  }

  render(g: CanvasRenderingContext2D): void {
    const sky = g.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    sky.addColorStop(0, SKY_TOP);
    sky.addColorStop(1, SKY_BOTTOM);
    g.fillStyle = sky;
    g.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Viền khung ảo: nhìn là biết letterbox có đúng không trên máy thật.
    g.strokeStyle = 'rgba(255,255,255,0.14)';
    g.lineWidth = 4;
    g.strokeRect(2, 2, VIRTUAL_WIDTH - 4, VIRTUAL_HEIGHT - 4);

    g.textAlign = 'center';
    g.textBaseline = 'middle';

    g.fillStyle = '#F2FBF6';
    g.font = '700 72px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    g.fillText(vi.appTitle, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 70);

    g.fillStyle = 'rgba(242,251,246,0.72)';
    g.font = '400 34px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    g.fillText(vi.appSubtitle, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 10);

    g.fillStyle = `rgba(242,251,246,${0.25 + this.pulse * 0.55})`;
    g.font = '400 30px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    g.fillText(vi.bootHint, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 62);

    g.fillStyle = 'rgba(242,251,246,0.38)';
    g.font = '400 22px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    g.fillText(`${vi.bootStatus} · ${this.touchCount} lần chạm`, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 46);

    if (this.lastTouch !== null) {
      g.beginPath();
      g.arc(this.lastTouch.x, this.lastTouch.y, 46, 0, Math.PI * 2);
      g.fillStyle = 'rgba(126,231,169,0.30)';
      g.fill();
      g.strokeStyle = '#7EE7A9';
      g.lineWidth = 3;
      g.stroke();
    }
  }
}
