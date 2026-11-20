# Rác Ơi Về Nhà

Game web nhặt rác xuyên Việt — tuyên truyền phân loại rác đúng cách.

Chơi ở khổ ngang trên điện thoại, hai ngón cái. Mười màn từ phố cổ Hà Nội vào tới Côn Đảo.
Không backend, không tài khoản, không thu thập dữ liệu người chơi.

---

## Trạng thái hiện tại — M1 bước 1 đã xong

`npm run dev` chạy được, hiện canvas có nền, tiêu đề, và một vòng tròn bám theo ngón tay
để kiểm chứng luồng chạm hoạt động trên máy thật.

### ✅ Đã xong

| Module | Việc nó làm | Test |
|---|---|---|
| `src/core/Viewport.ts` | Khung ảo cao 720 cố định, rộng co giãn 1280–1800 theo máy; letterbox; chặn DPR ở 3 | 17 ✅ |
| `src/core/Tween.ts` | Easing (linear, outCubic, outBack, inOutQuad) + TweenRunner | 15 ✅ |
| `src/core/Storage.ts` | Lưu tiến trình, migration theo version, sống sót chế độ ẩn danh | 12 ✅ |
| `src/core/Random.ts` | RNG có seed (mulberry32), `int` / `range` / `pick` / `weighted` | 13 ✅ |
| `src/core/Game.ts` | `FixedTimestep` + `SceneManager` + vòng lặp `Game` | 24 ✅ |
| `src/core/Input.ts` | Pointer Events → `PointerSample`, chặn cuộn trang khi kéo | 12 ✅ |
| `index.html` + `global.css` | Lớp phủ "xoay ngang điện thoại" khi cầm dọc | — |
| `src/core/Renderer.ts` | Ma trận viewport + xoá khung (kể cả dải letterbox) | 5 ✅ |
| `src/main.ts` + `index.html` | Điểm vào: canvas, resize, tạm dừng khi ẩn tab | — |
| `src/render/palette.ts` | Toàn bộ màu + phép toán màu (mix, desaturate, tương phản) | 24 ✅ |
| `src/scenes/BootScene.ts` | Scene tạm để kiểm chứng core trên máy thật | — |

**124/124 test xanh, typecheck sạch, build 3.43 KB gzip.** Chạy `npm test` và `npm run typecheck` để kiểm.

Vài điểm đáng chú ý trong `Game.ts`:

- Bước cập nhật cố định `FIXED_DT = 1/60`, tách hẳn khỏi nhịp vẽ — máy 120Hz không làm game chạy nhanh gấp đôi.
- Khung hình dài hơn `MAX_FRAME_SEC = 0.25` bị chặn. Tab bị ẩn rồi hiện lại không được dồn hàng nghìn bước trong một khung ("spiral of death").
- `start()` lại sau `stop()` quên mốc thời gian cũ — khoá máy 30 giây rồi mở lại không bị tính thành thời gian chơi.
- `stop()` huỷ khung hình đang chờ, không rò rỉ `requestAnimationFrame`.
- Đổi scene ngay trong `update()` không làm scene mới bị update luôn trong cùng khung hình.

### ⬜ Chưa có — M1 bước 2 trở đi

- `src/core/Audio.ts`
- `docs/ART.md` — hướng dẫn vẽ (đã hoãn; `palette.ts` đã sẵn chỗ để điền màu thật)
- `src/gameplay/` — `TrashItem`, `Bag`, `Bin`, `Spawner`, `ScoreSystem`, `EventSystem`
- `src/data/` — `trashTypes.ts` (24 loại), `levels.ts`, `facts.ts`, `pledges.ts`
- `src/scenes/` — `MenuScene`, `MapScene`, `LevelScene`, `ResultScene`, `HandbookScene`, `PledgeScene`
- `src/render/` — `sprites.ts`, `backdrops.ts`, `particles.ts`
- `src/ui/` — `Button`, `Modal`, `Toast`, `ProgressBar`, `StarRow`, `ShareCard`
- `scripts/verify-facts.ts`

**Việc kế tiếp:** `LevelScene` với một màn Phố cổ Hà Nội, 8 loại rác đầu tiên, 3 thùng, nhặt bằng chạm và phân loại bằng kéo thả. Xem Mục 5 trong `docs/DESIGN.md`.

---

## Giao việc cho agent

Đọc `docs/CODEX-BRIEF.md` — bản giao việc đầy đủ: nền đã có, bảy nguyên tắc
không được vi phạm, sáu chặng theo thứ tự, luật về số liệu, và các cạm bẫy đã biết.

## Chạy thử

```bash
npm install
npm test          # 124 xanh
npm run typecheck
npm run dev -- --host   # mở IP mạng LAN trên điện thoại thật
```

## Quy ước bắt buộc

- **Chiều cao ảo cố định 720; chiều rộng co giãn theo máy (1280–1800).** Toạ độ ngang luôn tính theo `viewport.width` / `viewport.centerX`, không bao giờ theo `DESIGN_WIDTH`.
- **Game chỉ chạy ở khổ ngang.** Điều kiện chặn trong `global.css` và `main.ts` phải luôn khớp nhau.
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
