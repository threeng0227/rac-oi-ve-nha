# Rác Ơi Về Nhà

Game web nhặt rác xuyên Việt — tuyên truyền phân loại rác đúng cách.

Chơi bằng một ngón tay trên điện thoại. Mười màn từ phố cổ Hà Nội vào tới Côn Đảo.
Không backend, không tài khoản, không thu thập dữ liệu người chơi.

---

## Trạng thái hiện tại — M1 đang dở

Khung dự án và một phần lớp `core/` đã xong, **có test xanh**. Phần còn lại chưa làm.

### ✅ Đã xong

| Module | Việc nó làm | Test |
|---|---|---|
| `src/core/Viewport.ts` | Hệ toạ độ ảo 720×1280, letterbox, chặn DPR ở 3, quy đổi toạ độ chạm | 11 ✅ |
| `src/core/Tween.ts` | Easing (linear, outCubic, outBack, inOutQuad) + TweenRunner | 15 ✅ |
| `src/core/Storage.ts` | Lưu tiến trình, migration theo version, sống sót chế độ ẩn danh | 12 ✅ |
| `src/core/Random.ts` | RNG có seed (mulberry32), `int` / `range` / `pick` / `weighted` | 13 ✅ |

**51/51 test xanh.** Chạy `npm test` để kiểm.

### 🔴 Việc tiếp theo — `src/core/Game.ts`

`tests/core/Game.test.ts` **đã viết xong nhưng đang đỏ** vì `src/core/Game.ts` chưa tồn tại.
Đây là cố ý: file test đó là bản đặc tả chạy được. Việc cần làm là **viết `src/core/Game.ts` cho tới khi 19 test đó xanh**, không sửa test.

File đó yêu cầu ba thứ:

- **`FixedTimestep`** — bộ tích luỹ thời gian. Bước cố định `FIXED_DT = 1/60`. Khung hình dài hơn `MAX_FRAME_SEC = 0.25` bị chặn (tab vừa bị treo không được dồn 600 bước). Có `alpha` để nội suy lúc vẽ, có `totalSteps`, có `reset()`.
- **`SceneManager`** — `change()` gọi `exit()` của scene cũ rồi `enter()` của scene mới. `update` / `render` / `onPointer` chỉ chạy trên scene hiện tại. Đổi scene ngay trong `update` không được làm scene mới bị update luôn trong khung hình đó.
- **`Game`** — nhận `FrameClock` (requestAnimationFrame tiêm vào được) và một hàm lấy `CanvasRenderingContext2D`. Cập nhật N bước rồi **vẽ đúng một lần** mỗi khung hình. `stop()` phải huỷ khung hình đang chờ. `start()` gọi hai lần không được tạo hai vòng lặp. `start()` lại sau `stop()` không được dồn cục thời gian đã trôi qua.

### ⬜ Chưa có

- `src/core/Input.ts` — gộp touch + mouse thành một luồng `PointerSample`
- `src/core/Renderer.ts`, `src/core/Audio.ts`
- `index.html`, `src/main.ts` — điểm vào, tạo canvas
- Toàn bộ `scenes/`, `gameplay/`, `data/`, `render/`, `ui/`, `i18n/`

**Tiêu chí xong M1 bước 1:** `npm run dev` chạy được, hiện canvas trống có màu nền, console log đúng kích thước viewport trên cả desktop lẫn điện thoại.

---

## Chạy thử

```bash
npm install
npm test          # 51 xanh + 19 đỏ (Game.ts chưa viết)
npm run typecheck
npm run dev -- --host   # mở IP mạng LAN trên điện thoại thật
```

## Quy ước bắt buộc

- **Mọi toạ độ theo hệ ảo 720×1280.** Không bao giờ hardcode pixel thật. `Viewport` lo quy đổi.
- **Không hardcode chuỗi tiếng Việt** trong scene — tất cả qua `src/i18n/vi.ts`.
- **Vòng lặp fixed timestep**, tách khỏi render. Game không được chạy nhanh hơn trên máy 120Hz.
- **Mọi `requestAnimationFrame` phải huỷ khi rời scene.** Không để rò rỉ.
- `LevelScene.ts` chỉ điều phối. Logic nằm trong `gameplay/`. Vượt 400 dòng thì tách.
- **Test trước, code sau.** Mọi module trong `core/` và `gameplay/` đều phải có test chạy được trên Node, không phụ thuộc DOM.

## ⚠️ Quy tắc về số liệu

Đây là game tuyên truyền. Một con số sai bị bắt bẻ là mất sạch uy tín.

- **Không dùng** con số "một viên pin làm ô nhiễm 500 lít nước / 1m³ đất" — nó lan truyền khắp Việt Nam nhưng không có nghiên cứu gốc nào, xuất phát từ một bài viết thương mại năm 2018.
- Thời gian phân hủy **luôn ghi dạng khoảng** (lon nhôm `80–200 năm`), vì các nguồn chênh nhau.
- Mỗi con số phải có `source.url` trỏ tới **nguồn cấp một**, không trỏ tới bài báo thuật lại.
- Không tìm được nguồn → `verified: false`. Loại rác đó vẫn vào game, nhưng sổ tay hiện `⏳ Đang xác minh nguồn` thay cho con số.

Đặc tả đầy đủ: xem Mục 9 trong tài liệu thiết kế.

## Giấy phép

Chưa chọn. Dự định mở mã nguồn.
