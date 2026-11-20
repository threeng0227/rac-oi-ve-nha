import { describe, expect, test } from 'vitest';
import {
  UI,
  BIN_COLORS,
  LEVEL_PALETTES,
  getLevelPalette,
  mix,
  desaturate,
  relativeLuminance,
  contrastRatio,
  withAlpha,
} from '../../src/render/palette';

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('phép toán màu', () => {
  test('mix ở hai đầu trả về đúng màu gốc', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  test('mix ở giữa cho đúng điểm giữa', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  test('mix chặn tỉ lệ ngoài [0,1]', () => {
    expect(mix('#000000', '#ffffff', -3)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 42)).toBe('#ffffff');
  });

  test('desaturate ở mức 0 giữ nguyên màu', () => {
    expect(desaturate('#2e7dd1', 0)).toBe('#2e7dd1');
  });

  test('desaturate ở mức 1 cho ra xám — ba kênh bằng nhau', () => {
    const gray = desaturate('#2e7dd1', 1);
    const r = gray.slice(1, 3);
    const g = gray.slice(3, 5);
    const b = gray.slice(5, 7);

    expect(r).toBe(g);
    expect(g).toBe(b);
  });

  test('desaturate giữ nguyên độ sáng cảm nhận — đây là cơ sở của hiệu ứng xám sang màu', () => {
    const color = '#3da35d';
    const gray = desaturate(color, 1);

    expect(relativeLuminance(gray)).toBeCloseTo(relativeLuminance(color), 2);
  });

  test('màu xám sẵn thì desaturate không đổi gì', () => {
    expect(desaturate('#808080', 1)).toBe('#808080');
  });

  test('relativeLuminance: trắng là 1, đen là 0', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 4);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 4);
  });

  test('contrastRatio giữa trắng và đen là 21', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 2);
  });

  test('contrastRatio đối xứng — đổi thứ tự không đổi kết quả', () => {
    expect(contrastRatio('#2e7dd1', '#f2fbf6')).toBeCloseTo(contrastRatio('#f2fbf6', '#2e7dd1'), 6);
  });

  test('màu giống hệt nhau thì tỉ lệ tương phản là 1', () => {
    expect(contrastRatio('#3da35d', '#3da35d')).toBeCloseTo(1, 6);
  });

  test('chấp nhận mã hex viết hoa', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(relativeLuminance('#ffffff'), 6);
  });
});

describe('withAlpha', () => {
  test('đổi mã hex thành rgba giữ nguyên ba kênh màu', () => {
    expect(withAlpha('#2e7dd1', 0.5)).toBe('rgba(46, 125, 209, 0.5)');
  });

  test('alpha 1 vẫn trả về rgba — một dạng duy nhất, đỡ phải phân nhánh khi vẽ', () => {
    expect(withAlpha('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)');
  });

  test('alpha ngoài [0,1] bị chặn', () => {
    expect(withAlpha('#000000', -2)).toBe('rgba(0, 0, 0, 0)');
    expect(withAlpha('#000000', 9)).toBe('rgba(0, 0, 0, 1)');
  });

  test('chấp nhận hex viết hoa', () => {
    expect(withAlpha('#F2FBF6', 0.72)).toBe('rgba(242, 251, 246, 0.72)');
  });
});

describe('bảng màu', () => {
  test('mọi token UI đều là mã hex hợp lệ', () => {
    for (const [name, value] of Object.entries(UI)) {
      expect(value, `UI.${name}`).toMatch(HEX);
    }
  });

  test('ba thùng rác có đủ màu, và đều là hex hợp lệ', () => {
    expect(Object.keys(BIN_COLORS).sort()).toEqual(['food', 'hazard', 'other', 'recycle']);
    for (const [bin, value] of Object.entries(BIN_COLORS)) {
      expect(value, bin).toMatch(HEX);
    }
  });

  test('chữ trắng trên mỗi thùng đạt tương phản tối thiểu 3:1', () => {
    // WCAG 1.4.11 cho thành phần giao diện. Nhãn thùng phải đọc được
    // ngoài nắng, trên màn hình điện thoại rẻ tiền.
    for (const [bin, value] of Object.entries(BIN_COLORS)) {
      expect(contrastRatio(value, UI.textOnDark), `nhãn trên thùng ${bin}`).toBeGreaterThanOrEqual(3);
    }
  });

  test('bốn màu thùng không trùng nhau', () => {
    // Lưu ý: KHÔNG đo bằng contrastRatio. Tỉ lệ tương phản đo độ sáng, không đo
    // màu sắc — xanh dương và xám có cùng độ sáng nhưng mắt phân biệt ngay.
    // Việc phân biệt thật sự do biểu tượng và chữ đảm nhiệm (Mục 12), màu chỉ hỗ trợ.
    const values = Object.values(BIN_COLORS);
    expect(new Set(values).size).toBe(values.length);
  });

  test('mỗi thùng nổi được trên nền thanh giao diện', () => {
    // Thùng nằm trên dải giao diện tối ở cạnh dưới. Không đủ tương phản thì
    // hình thùng chìm vào nền và người chơi phải tìm chỗ thả.
    for (const [bin, value] of Object.entries(BIN_COLORS)) {
      expect(contrastRatio(value, UI.backdropTop), `thùng ${bin} trên nền`).toBeGreaterThanOrEqual(3);
    }
  });

  test('đủ bảng màu cho cả 10 màn', () => {
    expect(Object.keys(LEVEL_PALETTES)).toHaveLength(10);
  });

  test('mỗi bảng màu màn chơi có đủ sky, ground, accent', () => {
    for (const [id, palette] of Object.entries(LEVEL_PALETTES)) {
      expect(palette.sky, `${id}.sky`).toMatch(HEX);
      expect(palette.ground, `${id}.ground`).toMatch(HEX);
      expect(palette.accent, `${id}.accent`).toMatch(HEX);
      if (palette.water !== undefined) expect(palette.water, `${id}.water`).toMatch(HEX);
    }
  });

  test('nền mỗi màn đủ trầm để rác sáng nổi lên trên', () => {
    // Luật quan trọng nhất của game nhặt đồ: rác phải nhảy ra khỏi nền.
    // Nền quá sáng thì người chơi phải căng mắt tìm thay vì phản xạ.
    for (const [id, palette] of Object.entries(LEVEL_PALETTES)) {
      expect(relativeLuminance(palette.ground), `${id}.ground quá sáng`).toBeLessThan(0.62);
    }
  });

  test('getLevelPalette trả về đúng bảng màu của màn', () => {
    expect(getLevelPalette('ha-noi')).toBe(LEVEL_PALETTES['ha-noi']);
  });

  test('màn lạ thì trả về bảng dự phòng, không văng lỗi', () => {
    expect(() => getLevelPalette('khong-ton-tai')).not.toThrow();
    expect(getLevelPalette('khong-ton-tai').sky).toMatch(HEX);
  });
});
