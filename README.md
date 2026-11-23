# Rác Ơi Về Nhà

**Game nhập vai** về giữ gìn vệ sinh và phân loại rác, bối cảnh khắp Việt Nam.

Vào vai Minh hoặc Lan, đi dọn rác từ phố cổ Hà Nội tới Côn Đảo. Gặp người dân, nhận
việc, phân loại đúng, thấy nơi mình dọn đẹp dần lên. Chơi được cầm ngang hay dọc.
Không backend, không tài khoản, không thu thập dữ liệu người chơi.

> ⚠️ **Đặc tả vừa viết lại toàn bộ (bản 2, 23/11/2026).** Bản 1 thiết kế thành game
> arcade không có nhân vật — hiểu sai ý tác giả, đã bỏ. Xem Mục 19 của `docs/DESIGN.md`
> để biết phần nào giữ, phần nào bỏ.

---

## Trạng thái hiện tại — đã triển khai đủ sáu chặng

`npm run dev` mở menu, bản đồ Việt Nam, 10 màn chơi và sổ tay 24 loại rác.
Chạm để nhặt, kéo để phân loại vào ba thùng, gom riêng rác nguy hại vào hộp vàng.
Có điểm, combo, ô nhiễm, sao, tám sự kiện, lưu tiến trình và cảnh đổi từ xám sang màu.

Sau màn 6 có thể chọn 1–3 cam kết. Màn kết quả hỗ trợ Web Share và tải ảnh vuông
1080×1080. Âm thanh CC0 mặc định tắt, nhạc concert tải riêng. Ảnh Open Graph là
1200×630. Các quyết định triển khai được ghi ở Mục 15 trong `docs/DESIGN.md`.

**348 test xanh**, gồm mô phỏng 1.000 lượt × 10 màn × 4 khổ máy, phản xạ 400ms.
Mỗi trường hợp đạt ba sao ở ít nhất 95% lượt. Typecheck sạch, JS **32.10 KB gzip**.
Bảy SFX tổng 13.983 byte, nhạc concert 84.426 byte.

Đã kiểm tra menu, bản đồ và sổ tay bằng trình duyệt ở cả ngang và dọc. Checklist
thiết bị thật, Web Share thực tế, Lighthouse, 4G, FPS trên Redmi Note 11 và preview
Messenger/Zalo còn cần kiểm tra. Chưa xác minh trực tuyến lại các URL nguồn số liệu.
Chưa deploy trong phiên này.

### Nền M1 bước 1

### ✅ Đã xong

| Module | Việc nó làm | Test |
|---|---|---|
| `src/core/Viewport.ts` | Cạnh ngắn 720, cạnh dài co giãn 1100–1800; chạy cả ngang lẫn dọc; chặn DPR ở 3 | 22 ✅ |
| `src/core/Tween.ts` | Easing (linear, outCubic, outBack, inOutQuad) + TweenRunner | 15 ✅ |
| `src/core/Storage.ts` | Lưu tiến trình, migration theo version, sống sót chế độ ẩn danh | 12 ✅ |
| `src/core/Random.ts` | RNG có seed (mulberry32), `int` / `range` / `pick` / `weighted` | 13 ✅ |
| `src/core/Game.ts` | `FixedTimestep` + `SceneManager` + vòng lặp `Game` | 24 ✅ |
| `src/core/Layout.ts` | ⚠️ Của bản arcade — **phải viết lại** thành HUD + panel modal | 11 ⚠️ |
| `src/core/Input.ts` | Pointer Events → `PointerSample`, chặn cuộn trang khi kéo | 12 ✅ |
| `index.html` + `global.css` | Canvas toàn màn hình, chặn cuộn khi kéo | — |
| `src/core/Renderer.ts` | Ma trận viewport + xoá khung (kể cả dải letterbox) | 5 ✅ |
| `src/main.ts` + `index.html` | Điểm vào: canvas, resize, tạm dừng khi ẩn tab | — |
| `src/render/palette.ts` | Toàn bộ màu + phép toán màu (mix, desaturate, tương phản) | 24 ✅ |
| `src/scenes/BootScene.ts` | ⚠️ Scene tạm — thay bằng màn nạp dữ liệu thật | — |

Nền bàn giao có **140/140 test xanh**, typecheck sạch và build khoảng 3.4 KB gzip.

Vài điểm đáng chú ý trong `Game.ts`:

- Bước cập nhật cố định `FIXED_DT = 1/60`, tách hẳn khỏi nhịp vẽ — máy 120Hz không làm game chạy nhanh gấp đôi.
- Khung hình dài hơn `MAX_FRAME_SEC = 0.25` bị chặn. Tab bị ẩn rồi hiện lại không được dồn hàng nghìn bước trong một khung ("spiral of death").
- `start()` lại sau `stop()` quên mốc thời gian cũ — khoá máy 30 giây rồi mở lại không bị tính thành thời gian chơi.
- `stop()` huỷ khung hình đang chờ, không rò rỉ `requestAnimationFrame`.
- Đổi scene ngay trong `update()` không làm scene mới bị update luôn trong cùng khung hình.

### Kiểm tra trên thiết bị trước phát hành

Theo checklist Mục 13 trong đặc tả, chơi đủ màn trên iPhone Safari và Chrome Android,
thử bỏ pin vào thùng thường, chế độ ẩn danh, khoá máy, tắt mạng, chia sẻ và tải ảnh.
Đo Lighthouse, FPS và thời gian tải bằng thiết bị hoặc cấu hình tham chiếu đã ghi.

---

## Giao việc cho agent

Đọc `docs/CODEX-BRIEF.md` — bản giao việc đầy đủ: nền đã có, bảy nguyên tắc
không được vi phạm, sáu chặng theo thứ tự, luật về số liệu, và các cạm bẫy đã biết.

## Chạy thử

```bash
npm install
npm test
npm run typecheck
npm run dev -- --host   # mở IP mạng LAN trên điện thoại thật
```

## Quy ước bắt buộc

- **Không chiều nào cố định.** Cạnh ngắn khung ảo là 720, cạnh dài co giãn 1100–1800, và máy cầm ngang hay dọc đều phải chơi được. Mọi toạ độ lấy từ `computeLayout(viewport)`, không tự tính.
- **Mật độ rác tính theo `layout.playfieldArea`**, không theo số tuyệt đối — khu cảnh dọc rộng gấp ~3 lần khu cảnh ngang.
- **Không hardcode mã màu ở bất kỳ file nào ngoài `src/render/palette.ts`.** Hiệu ứng "xám sang màu" lúc dọn xong một vùng là phép biến đổi trên chính bộ màu đó — màu rải rác khắp nơi thì không viết được hiệu ứng ấy. Kiểm nhanh: `grep -rnE '#[0-9a-fA-F]{6}' src --include='*.ts' | grep -v palette.ts` phải không ra gì.
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
