/** Điểm vào: nối canvas, viewport, input và vòng lặp lại với nhau. */
import { Game, type FrameClock } from './core/Game';
import { Input } from './core/Input';
import { Viewport } from './core/Viewport';
import { applyViewportTransform, clearFrame } from './core/Renderer';
import { Journey } from './scenes/Journey';
import { ProgressStore } from './gameplay/ProgressStore';
import { AudioManager } from './core/Audio';
import { SaveStore, detectBackend } from './core/Storage';
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

const store = new SaveStore(detectBackend());
const progress = new ProgressStore(store);
const audio = new AudioManager();
audio.setMuted(progress.data.settings.muted);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
new Journey(game, viewport, progress, {
  reducedMotion,
  audio,
  onEventWarning: () => { try { if (!reducedMotion) navigator.vibrate?.(50); } catch { /* iOS may block vibration. */ } },
  openSource: url => window.open(url, '_blank', 'noopener,noreferrer'),
}).start();

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

// Giữ pointer khi kéo ra ngoài canvas, trình duyệt vẫn gửi up/cancel về đúng nơi.
canvas.addEventListener('pointerdown', (event) => canvas.setPointerCapture(event.pointerId));
canvas.addEventListener('lostpointercapture', (event) => {
  game.scenes.onPointer({ phase: 'cancel', id: event.pointerId, x: 0, y: 0 });
});

function cancelPointers(): void {
  const scene = game.scenes.current;
  if (scene && 'cancelPointers' in scene && typeof scene.cancelPointers === 'function') scene.cancelPointers();
}
window.addEventListener('blur', cancelPointers);

// Vào/ra toàn màn hình làm đổi kích thước vùng hiển thị.
document.addEventListener('fullscreenchange', fitToScreen);

window.addEventListener('resize', fitToScreen);
window.addEventListener('orientationchange', fitToScreen);
window.visualViewport?.addEventListener('resize', fitToScreen);

// Khoá máy hoặc chuyển tab: dừng hẳn vòng lặp. Không dừng thì pin tụt
// và lúc quay lại game phải chạy bù một cục thời gian.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelPointers(); game.stop(); audio.suspend(); }
  else { game.start(); audio.resume(); }
});

game.start();

console.info(
  `[Rác Ơi Về Nhà] viewport ${window.innerWidth}×${window.innerHeight} css · ` +
    `đệm ${viewport.canvasWidth}×${viewport.canvasHeight} px · ` +
    `dpr ${viewport.dpr} · scale ${viewport.scale.toFixed(4)} · ` +
    `lề ${viewport.offsetX.toFixed(1)}/${viewport.offsetY.toFixed(1)}`,
);
