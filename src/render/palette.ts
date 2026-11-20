/**
 * Mọi màu của game nằm ở đây.
 *
 * Luật: **không hardcode mã hex ở bất kỳ file nào khác.** Lý do không phải
 * thẩm mỹ mà là khả năng sửa — hiệu ứng "xám sang màu" khi dọn xong một vùng
 * là phép biến đổi trên chính bộ màu này, không phải một bộ asset thứ hai.
 * Màu rải rác khắp nơi thì hiệu ứng đó không viết được.
 *
 * Bảng màu từng màn hiện là giá trị tạm (Mục 6.3 của đặc tả). Sẽ thay khi
 * có `docs/ART.md`. Kiến trúc thì đã đúng rồi, chỉ số liệu là tạm.
 */

export interface LevelPalette {
  sky: string;
  ground: string;
  accent: string;
  water?: string;
}

/** Màu giao diện dùng chung mọi màn. */
export const UI = {
  /** Dải letterbox ngoài khung ảo. */
  letterbox: '#06120d',
  backdropTop: '#0e2a1f',
  backdropBottom: '#1d5c42',
  textOnDark: '#f2fbf6',
  /** Màu nhấn cho nút chính, combo, hiệu ứng thành công. */
  highlight: '#7ee7a9',
  warning: '#f2b84f',
  danger: '#e8604f',
  /** Viền khung ảo và các đường chia tầng. */
  hairline: '#2a4a3a',
} as const;

/**
 * Màu bốn nhóm rác. Màu KHÔNG BAO GIỜ là dấu hiệu duy nhất —
 * mỗi thùng luôn có thêm biểu tượng và chữ (Mục 12, tiếp cận).
 */
export const BIN_COLORS = {
  recycle: '#2e7dd1',
  food: '#3da35d',
  other: '#6b7280',
  hazard: '#c07a10',
} as const;

export const LEVEL_PALETTES: Record<string, LevelPalette> = {
  'ha-noi': { sky: '#c9a227', ground: '#6b5b4a', accent: '#d96b4a' },
  'ha-long': { sky: '#5fb3d9', ground: '#3e6b5a', accent: '#f2e8c9', water: '#2e7da8' },
  'hoi-an': { sky: '#e8a33d', ground: '#8a5a3b', accent: '#d94f4f', water: '#4a6b7a' },
  'da-lat': { sky: '#8fc5e8', ground: '#4a6b3a', accent: '#e88fb0', water: '#3a7a9a' },
  concert: { sky: '#2a1b4a', ground: '#1a1030', accent: '#e84fa0' },
  'nhieu-loc': { sky: '#7aa8c9', ground: '#5a6b4a', accent: '#c9d94f', water: '#4a7a6b' },
  'cai-rang': { sky: '#e8c97a', ground: '#8a7a4a', accent: '#d9734f', water: '#6b8a5a' },
  'giao-thua': { sky: '#1b2a4a', ground: '#2a3a5a', accent: '#e8c94f' },
  'sa-pa': { sky: '#b8d4e8', ground: '#6b8a4a', accent: '#d9a84f' },
  'con-dao': { sky: '#4fc9d9', ground: '#a8946b', accent: '#f2a84f', water: '#2e9ab8' },
};

const FALLBACK: LevelPalette = { sky: '#7aa8c9', ground: '#5a6b4a', accent: '#f2e8c9' };

/** Màn lạ (dữ liệu lưu của phiên bản khác) không được làm game sập. */
export function getLevelPalette(levelId: string): LevelPalette {
  return LEVEL_PALETTES[levelId] ?? FALLBACK;
}

// ── Phép toán màu ───────────────────────────────────────────────────────────

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (v: number): string =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Trộn hai màu. `t = 0` ra màu đầu, `t = 1` ra màu sau. */
export function mix(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  const k = clamp01(t);
  return toHex({
    r: a.r + (b.r - a.r) * k,
    g: a.g + (b.g - a.g) * k,
    b: a.b + (b.b - a.b) * k,
  });
}

/**
 * Rút màu về xám. `amount = 1` là xám hoàn toàn.
 *
 * Dùng độ sáng cảm nhận (hệ số Rec. 709) chứ không lấy trung bình ba kênh:
 * trung bình cộng làm màu xanh lá sáng thành xám đậm và màu xanh dương đậm
 * thành xám nhạt, nên lúc chuyển từ xám sang màu sẽ thấy ảnh "nảy" độ sáng.
 */
export function desaturate(color: string, amount: number): string {
  const k = clamp01(amount);
  if (k === 0) return color.toLowerCase();

  const { r, g, b } = parseHex(color);

  // Phải làm trong không gian TUYẾN TÍNH. Trộn thẳng trên giá trị 0–255 (vốn
  // đã mã hoá gamma) sẽ cho ra xám sai độ sáng — xanh lá bị tối đi, xanh dương
  // bị sáng lên — nên lúc chuyển xám sang màu cả cảnh "nảy" một cái.
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);
  const y = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;

  return toHex({
    r: fromLinear(rl + (y - rl) * k),
    g: fromLinear(gl + (y - gl) * k),
    b: fromLinear(bl + (y - bl) * k),
  });
}

/** sRGB 0–255 (đã mã hoá gamma) → cường độ ánh sáng tuyến tính 0–1. */
const toLinear = (channel8: number): number => {
  const c = channel8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** Chiều ngược lại của `toLinear`. */
const fromLinear = (linear: number): number => {
  const c = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return c * 255;
};

/** Độ sáng tương đối theo WCAG: 0 là đen, 1 là trắng. */
export function relativeLuminance(color: string): number {
  const { r, g, b } = parseHex(color);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Mã hex → chuỗi `rgba()` cho Canvas.
 * Luôn trả về dạng `rgba` kể cả khi alpha bằng 1, để chỗ gọi không phải phân nhánh.
 */
export function withAlpha(color: string, alpha: number): string {
  const { r, g, b } = parseHex(color);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
}

/** Tỉ lệ tương phản WCAG, từ 1 (giống hệt) tới 21 (đen trên trắng). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
