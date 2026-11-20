/** Mọi chuỗi hiển thị nằm ở đây. Không hardcode tiếng Việt trong scene. */
export const vi = {
  appTitle: 'Rác Ơi Về Nhà',
  appSubtitle: 'Hành trình xuyên Việt',
  bootHint: 'Chạm thử vào màn hình',
  bootStatus: 'Đang dựng — lớp core đã xong',
} as const;

export type StringKey = keyof typeof vi;
