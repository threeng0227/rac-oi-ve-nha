/** Điểm vào: nối canvas, viewport, input và vòng lặp lại với nhau. */
import { Game, type FrameClock } from './core/Game';
import { Input } from './core/Input';
import { Viewport } from './core/Viewport';
import { applyViewportTransform, clearFrame } from './core/Renderer';
import { BootScene } from './scenes/BootScene';
import { UI } from './render/palette';

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
  clearFrame(ctx, viewport, UI.letterbox);
  applyViewportTransform(ctx, viewport);
  return ctx;
});

game.scenes.change(new BootScene(viewport), game);

/**
 * Vào toàn màn hình ở lần chạm đầu tiên.
 *
 * Thanh địa chỉ trình duyệt ăn mất khoảng 130px chiều cao, làm vùng hiển thị
 * dẹt hơn tỉ lệ thật của máy — khung ảo giãn kịch mức chặn mà vẫn còn dải đen
 * hai bên. Ẩn nó đi thì khung ảo khớp đúng tỉ lệ máy và hết dải đen.
 *
 * Phải gọi từ trong một thao tác của người dùng, nên bám vào lần chạm đầu.
 * iPhone không hỗ trợ Fullscreen API — ở đó lệnh này lặng lẽ không làm gì,
 * game vẫn chơi được, chỉ là còn dải đen hẹp.
 */
let fullscreenTried = false;
function enterFullscreenOnce(): void {
  if (fullscreenTried) return;
  fullscreenTried = true;
  if (document.fullscreenElement !== null) return;
  void document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {
    // Người dùng từ chối, hoặc trình duyệt không cho. Không phải lỗi.
  });
}

const input = new Input(viewport, (sample) => {
  if (sample.phase === 'down') enterFullscreenOnce();
  game.scenes.onPointer(sample);
});
input.attach(canvas);

// Vào/ra toàn màn hình làm đổi kích thước vùng hiển thị.
document.addEventListener('fullscreenchange', fitToScreen);

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
