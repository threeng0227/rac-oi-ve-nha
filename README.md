# Rác Ơi Về Nhà

Game web nhặt rác xuyên Việt — tuyên truyền phân loại rác đúng cách.

Chơi trên điện thoại, cầm ngang hay dọc đều được. Mười màn từ phố cổ Hà Nội vào tới Côn Đảo.
Không backend, không tài khoản, không thu thập dữ liệu người chơi.

---

## Trạng thái hiện tại — Chặng 2, chờ chơi thử

`npm run dev` mở thẳng màn Phố cổ Hà Nội. Lượt đầu có hướng dẫn chạm vỏ chuối,
kéo vào thùng Thực phẩm, rồi bắt đầu màn 90 giây. Túi có 6 ô, ba thùng nhận kéo
thả, thả sai hoặc huỷ thao tác thì rác trở về ô cũ. Hết giờ có nút chơi lại.

Chặng 1 có đủ 24 loại rác, 10 màn, 10 câu cuối màn, 7 cam kết và cổng kiểm chứng
ở `prebuild`. Các nhãn chưa xác minh được ẩn qua `getDecomposeLabel()`.

**193 test xanh, typecheck sạch.** Đã kiểm tra giao diện
trình duyệt ở 844×390 và 390×844. Cần chơi thử trên iPhone Safari và Chrome Android
thật trước khi tiếp tục Chặng 3, theo điểm dừng trong `docs/CODEX-BRIEF.md`.

### Nền M1 bước 1

### ✅ Đã xong

| Module | Việc nó làm | Test |
|---|---|---|
| `src/core/Viewport.ts` | Cạnh ngắn 720, cạnh dài co giãn 1100–1800; chạy cả ngang lẫn dọc; chặn DPR ở 3 | 22 ✅ |
| `src/core/Tween.ts` | Easing (linear, outCubic, outBack, inOutQuad) + TweenRunner | 15 ✅ |
| `src/core/Storage.ts` | Lưu tiến trình, migration theo version, sống sót chế độ ẩn danh | 12 ✅ |
| `src/core/Random.ts` | RNG có seed (mulberry32), `int` / `range` / `pick` / `weighted` | 13 ✅ |
| `src/core/Game.ts` | `FixedTimestep` + `SceneManager` + vòng lặp `Game` | 24 ✅ |
| `src/core/Layout.ts` | Bốn dải màn chơi, vị trí thùng/túi/vùng sinh rác, cho cả hai hướng | 11 ✅ |
| `src/core/Input.ts` | Pointer Events → `PointerSample`, chặn cuộn trang khi kéo | 12 ✅ |
| `index.html` + `global.css` | Canvas toàn màn hình, chặn cuộn khi kéo | — |
| `src/core/Renderer.ts` | Ma trận viewport + xoá khung (kể cả dải letterbox) | 5 ✅ |
| `src/main.ts` + `index.html` | Điểm vào: canvas, resize, tạm dừng khi ẩn tab | — |
| `src/render/palette.ts` | Toàn bộ màu + phép toán màu (mix, desaturate, tương phản) | 24 ✅ |
| `src/scenes/BootScene.ts` | Scene tạm để kiểm chứng core trên máy thật | — |

Nền bàn giao có **140/140 test xanh**, typecheck sạch và build khoảng 3.4 KB gzip.

Vài điểm đáng chú ý trong `Game.ts`:

- Bước cập nhật cố định `FIXED_DT = 1/60`, tách hẳn khỏi nhịp vẽ — máy 120Hz không làm game chạy nhanh gấp đôi.
- Khung hình dài hơn `MAX_FRAME_SEC = 0.25` bị chặn. Tab bị ẩn rồi hiện lại không được dồn hàng nghìn bước trong một khung ("spiral of death").
- `start()` lại sau `stop()` quên mốc thời gian cũ — khoá máy 30 giây rồi mở lại không bị tính thành thời gian chơi.
- `stop()` huỷ khung hình đang chờ, không rò rỉ `requestAnimationFrame`.
- Đổi scene ngay trong `update()` không làm scene mới bị update luôn trong cùng khung hình.

### Phần tiếp theo sau khi chơi thử

- `src/core/Audio.ts`
- `docs/ART.md` — hướng dẫn vẽ (đã hoãn; `palette.ts` đã sẵn chỗ để điền màu thật)
- `src/gameplay/` — `ScoreSystem`, `EventSystem`
- `src/scenes/` — `MenuScene`, `MapScene`, `ResultScene`, `HandbookScene`, `PledgeScene`
- `src/render/` — mở rộng sprite, `backdrops.ts`, `particles.ts`
- `src/ui/` — `Button`, `Modal`, `Toast`, `ProgressBar`, `StarRow`, `ShareCard`

**Việc kế tiếp:** người giao việc chơi thử Chặng 2, rồi mới làm điểm số và bộ mô
phỏng cân bằng ở Chặng 3. Các mục còn lại theo đúng thứ tự bản giao việc.

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
