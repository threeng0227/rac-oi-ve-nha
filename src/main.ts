/** Điểm vào: nối canvas, viewport, input và vòng lặp lại với nhau. */
import { Game, type FrameClock } from './core/Game';
import { Input } from './core/Input';
import { Viewport } from './core/Viewport';
import { applyViewportTransform, clearFrame } from './core/Renderer';
import { BootScene } from './scenes/BootScene';

const LETTERBOX_COLOR = '#06120D';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (canvas === null) throw new Error('Không tìm thấy <canvas id="game">');

const viewport = new Viewport();

function fitToScreen(): void {
  // innerWidth/innerHeight thay vì clientWidth: trên iOS thanh địa chỉ co giãn
  // làm clientWidth trả về giá trị của khung hình trước.
  const width = window.innerWidth;
  const height = window.innerHeight;

  viewport.resize(width, height, window.devicePixelRatio || 1);

  canvas!.width = viewport.canvasWidth;
  canvas!.height = viewport.canvasHeight;
  canvas!.style.width = `${width}px`;
  canvas!.style.height = `${height}px`;
}

fitToScreen();

const clock: FrameClock = {
  requestFrame: (cb) => window.requestAnimationFrame(cb),
  cancelFrame: (id) => window.cancelAnimationFrame(id),
};

const ctx = canvas.getContext('2d', { alpha: false });

const game = new Game(clock, () => {
  if (ctx === null) return null;
  clearFrame(ctx, viewport, LETTERBOX_COLOR);
  applyViewportTransform(ctx, viewport);
  return ctx;
});

game.scenes.change(new BootScene(), game);

const input = new Input(viewport, (sample) => game.scenes.onPointer(sample));
input.attach(canvas);

window.addEventListener('resize', fitToScreen);
window.addEventListener('orientationchange', fitToScreen);
window.visualViewport?.addEventListener('resize', fitToScreen);

/**
 * Cùng điều kiện với lớp phủ xoay máy trong global.css. Hai nơi phải khớp:
 * nếu lệch, người chơi hoặc thấy lớp phủ mà game vẫn chạy ngầm tốn pin,
 * hoặc thấy canvas mà vòng lặp đã dừng.
 */
const portraitPhone = window.matchMedia('(orientation: portrait) and (max-width: 900px)');

/** Chỉ chạy khi tab đang hiện VÀ máy đang nằm ngang. */
function syncRunning(): void {
  if (document.hidden || portraitPhone.matches) game.stop();
  else game.start();
}

// Khoá máy hoặc chuyển tab: dừng hẳn vòng lặp. Không dừng thì pin tụt
// và lúc quay lại game phải chạy bù một cục thời gian.
document.addEventListener('visibilitychange', syncRunning);
portraitPhone.addEventListener('change', () => {
  fitToScreen();
  syncRunning();
});

syncRunning();

console.info(
  `[Rác Ơi Về Nhà] viewport ${window.innerWidth}×${window.innerHeight} css · ` +
    `đệm ${viewport.canvasWidth}×${viewport.canvasHeight} px · ` +
    `dpr ${viewport.dpr} · scale ${viewport.scale.toFixed(4)} · ` +
    `lề ${viewport.offsetX.toFixed(1)}/${viewport.offsetY.toFixed(1)}`,
);
