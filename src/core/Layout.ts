/**
 * Bố cục màn chơi, tính lại mỗi khi khung ảo đổi.
 *
 * Màn chơi là bốn dải ngang chồng lên nhau — HUD, khu cảnh, túi, thùng rác.
 * Không dải nào khoá tỉ lệ, nên bố cục này chạy được **cả khi cầm ngang lẫn
 * cầm dọc**: cầm dọc thì khu cảnh cao và hẹp, thùng rác vẫn ở cạnh dưới.
 *
 * Quãng kéo thả không đổi theo hướng máy — túi luôn nằm ngay trên thùng. Chỉ
 * vùng chạm để nhặt là khác, và đó là lý do mật độ rác phải tính theo
 * **diện tích** (`playfieldArea`) chứ không theo số tuyệt đối.
 *
 * KHÔNG scene nào được tự tính toạ độ. Gọi `computeLayout()` rồi đọc từ đó.
 */
import type { Viewport } from './Viewport';

/** Số ô trong túi. Nguồn áp lực chính của game — xem Mục 5.2 đặc tả. */
export const BAG_SLOTS = 6;

const HUD_HEIGHT = 90;
const BAG_SLOT_SIZE = 96;
const BAG_SLOT_GAP = 8;
/** Lề an toàn quanh khu cảnh: rác sinh sát mép thì ngón tay khó chạm. */
const SPAWN_INSET_X = 60;
const SPAWN_INSET_Y = 40;

export interface Band {
  readonly y: number;
  readonly height: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Layout {
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly isPortrait: boolean;

  readonly hud: Band;
  readonly playfield: Band;
  readonly bag: Band;
  readonly bins: Band;

  readonly binWidth: number;
  /** Mép trái của thùng thứ `index` (0, 1, 2). */
  binX(index: number): number;

  readonly bagSlotSize: number;
  /** Mép trái của ô túi thứ `index` (0…5). */
  bagSlotX(index: number): number;

  /** Vùng được phép sinh rác — khu cảnh đã trừ lề an toàn. */
  readonly spawnArea: Rect;
  /** Diện tích vùng sinh rác. Dùng để tính mật độ, đừng dùng số rác tuyệt đối. */
  readonly playfieldArea: number;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

export function computeLayout(viewport: Viewport): Layout {
  const { width, height, centerX, isPortrait } = viewport;

  // Cầm dọc thì màn hình dài hơn, nên thùng và túi được dày thêm — ngón cái
  // phải với tới cạnh dưới, vùng chạm mỏng là hụt liên tục.
  const binsHeight = clamp(Math.round(height * 0.14), 130, 190);
  const bagHeight = clamp(Math.round(height * 0.085), 60, 90);

  const hud: Band = { y: 0, height: HUD_HEIGHT };
  const playfieldHeight = height - HUD_HEIGHT - bagHeight - binsHeight;
  const playfield: Band = { y: HUD_HEIGHT, height: playfieldHeight };
  const bag: Band = { y: playfield.y + playfieldHeight, height: bagHeight };
  const bins: Band = { y: bag.y + bagHeight, height: binsHeight };

  const binWidth = width / 3;

  // Ô túi: cố định 96, nhưng co lại nếu khung quá hẹp để sáu ô vẫn nằm gọn.
  const pitchBudget = (width - 2 * SPAWN_INSET_X) / BAG_SLOTS;
  const bagSlotSize = Math.min(BAG_SLOT_SIZE, Math.max(48, pitchBudget - BAG_SLOT_GAP));
  const pitch = bagSlotSize + BAG_SLOT_GAP;
  const bagRowWidth = BAG_SLOTS * pitch - BAG_SLOT_GAP;
  const bagStartX = centerX - bagRowWidth / 2;

  const spawnArea: Rect = {
    x: SPAWN_INSET_X,
    y: playfield.y + SPAWN_INSET_Y,
    width: width - 2 * SPAWN_INSET_X,
    height: playfieldHeight - 2 * SPAWN_INSET_Y,
  };

  return {
    width,
    height,
    centerX,
    isPortrait,
    hud,
    playfield,
    bag,
    bins,
    binWidth,
    binX: (index) => index * binWidth,
    bagSlotSize,
    bagSlotX: (index) => bagStartX + index * pitch,
    spawnArea,
    playfieldArea: spawnArea.width * spawnArea.height,
  };
}
