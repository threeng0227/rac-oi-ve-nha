import { describe, expect, test } from 'vitest';
import { PLEDGES } from '../../src/data/pledges';

describe('PLEDGES', () => {
  test('giữ nguyên bảy lời cam kết Mục 11b', () => {
    expect(PLEDGES).toEqual([
      { id: 'binh-nuoc', text: 'Tuần này tôi mang bình nước riêng thay vì mua chai nhựa' },
      { id: 'tui-vai', text: 'Tôi để sẵn một cái túi vải trong cốp xe' },
      { id: 'tu-choi-ong-hut', text: 'Tôi nói "không lấy ống hút" khi mua nước' },
      { id: 'gom-pin', text: 'Tôi gom pin cũ vào một hộp riêng, không vứt vào thùng rác' },
      { id: 'phan-loai-nha', text: 'Nhà tôi sẽ có hai thùng rác thay vì một' },
      { id: 'khong-nem', text: 'Tôi không ném rác ra đường, dù đang vội' },
      { id: 'nhac-ban', text: 'Tôi sẽ nhắc bạn mình một lần, không gắt gỏng' },
    ]);
  });
});
