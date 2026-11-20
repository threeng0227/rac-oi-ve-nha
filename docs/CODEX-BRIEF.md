# BẢN GIAO VIỆC — đọc hết trước khi viết dòng code nào

Bạn tiếp quản dự án **Rác Ơi Về Nhà** từ chặng M1 bước 2 tới hết M3.

**Đọc theo đúng thứ tự này trước:**
1. `README.md` — trạng thái, quy ước
2. `docs/DESIGN.md` — đặc tả đầy đủ, 942 dòng. Đọc hết. Đặc biệt Mục 5, 6, 8, 9.

---

## 1. Nền đã có — KHÔNG ĐƯỢC SỬA

Những file sau đã xong, đã có test, đã chạy thật. **Không sửa, không "cải tiến", không refactor.**

```
src/core/Viewport.ts     src/core/Game.ts      src/core/Input.ts
src/core/Tween.ts        src/core/Storage.ts   src/core/Random.ts
src/core/Renderer.ts     src/render/palette.ts
tests/core/*             tests/render/palette.test.ts
```

**120 test đang xanh. Không được làm đỏ cái nào.** Nếu bạn nghĩ một file trong đó có lỗi, hãy viết test chứng minh rồi mới sửa — đừng sửa vì thấy "có thể viết gọn hơn".

Những thứ này đã sẵn sàng dùng:
- `Viewport` — hệ ảo 1280×720, đã lo letterbox và DPR
- `Game` — vòng lặp fixed-timestep 1/60 + `SceneManager`
- `Input` — Pointer Events đã quy đổi sang toạ độ ảo
- `TweenRunner` — 4 hàm easing
- `SaveStore` — đọc/ghi `localStorage`, đã chịu được chế độ ẩn danh
- `Random` — RNG có seed, có `weighted()` sẵn cho `Spawner`
- `palette` — toàn bộ màu + `mix`, `desaturate`, `withAlpha`, `contrastRatio`

---

## 2. Bảy nguyên tắc không được vi phạm

1. **Chiều cao ảo cố định 720, chiều rộng CO GIÃN theo máy (1280–1800).**
   Toạ độ dọc viết số thẳng. Toạ độ ngang **luôn tính theo `viewport.width`
   hoặc `viewport.centerX`** — xem bảng tra ở Mục 5.1 của đặc tả.
   `DESIGN_WIDTH` chỉ để nghĩ bố cục, **không bao giờ dùng làm toạ độ**.
2. **Không hardcode mã màu.** Lấy từ `src/render/palette.ts`.
   Kiểm: `grep -rnE '#[0-9a-fA-F]{6}' src --include='*.ts' | grep -v palette.ts` — phải không ra gì.
3. **Mọi chuỗi tiếng Việt nằm ở `src/i18n/vi.ts`.** Không viết thẳng vào scene.
4. **Không thêm game engine, không thêm thư viện.** Canvas 2D thuần. Ngân sách 250 KB gzip.
5. **`LevelScene.ts` chỉ điều phối.** Logic nằm trong `gameplay/`. Vượt 400 dòng thì tách.
6. **Test trước, code sau.** Viết test → chạy cho nó đỏ → rồi mới viết code. Bắt chước phong cách `tests/core/`.
7. **Mọi `requestAnimationFrame` và tween phải huỷ khi rời scene** (`exit()`).

---

## 3. Sáu chặng — làm đúng thứ tự, mỗi chặng commit riêng

### Chặng 1 — Dữ liệu
Không có UI, chỉ dữ liệu và test.

- `src/data/trashTypes.ts` — **đủ 24 loại**, dùng nguyên văn Mục 8.1 và 8.4 của đặc tả
- `src/data/levels.ts` — **đủ 10 màn**, số liệu lấy nguyên từ Mục 6.1–6.3
- `src/data/facts.ts` — câu hiện ở màn kết quả mỗi màn *(đặc tả chưa viết, bạn soạn — xem Mục 5 dưới đây)*
- `src/data/pledges.ts` — 7 lời cam kết, nguyên văn Mục 11b
- `scripts/verify-facts.ts` — cổng kiểm chứng theo đúng luật Mục 8.3, nối vào `prebuild`

**Xong khi:** `npm test` xanh, `npm run build` chạy được, cổng kiểm chứng chặn đúng trường hợp phải chặn và không chặn trường hợp hợp lệ.

### Chặng 2 — Cơ chế màn chơi (quan trọng nhất)
- `src/gameplay/TrashItem.ts`, `Bag.ts`, `Bin.ts`, `Spawner.ts`
- `src/scenes/LevelScene.ts` — **chỉ màn `ha-noi`**
- `src/render/sprites.ts` — hình 8 loại rác của màn 1
- Chạm để nhặt, kéo thả để phân loại, túi 6 ô, 3 thùng theo bố cục Mục 5.1

Chưa làm: điểm, combo, ô nhiễm, sự kiện, rác nguy hại.

**Test bắt buộc:** `Bag` không bao giờ kẹt; túi đầy thì từ chối nhận; `Spawner` phân bố đúng trọng số (RNG có seed, 10.000 mẫu); vùng chạm đúng.

**🛑 DỪNG Ở ĐÂY. Báo cho người giao việc chơi thử trước khi đi tiếp.** Đây là chỗ duy nhất quyết định game có vui hay không, và test không trả lời được câu đó.

### Chặng 3 — Điểm số và bộ mô phỏng cân bằng
- `src/gameplay/ScoreSystem.ts` — điểm, combo, ô nhiễm, độ sạch, sao (Mục 5.5–5.6)
- `src/scenes/ResultScene.ts` — sao, điểm, fact, nút chơi lại
- Màn hình thua khi ô nhiễm chạm 100% *(đặc tả chưa viết, bạn soạn)*
- **`tests/balance/simulation.test.ts`** — mô phỏng người chơi hoàn hảo, phản xạ 400ms, 1000 lượt mỗi màn

> Bộ mô phỏng này là **bắt buộc, không phải tuỳ chọn**. Bảng số ở Mục 6.1 do người thiết kế đoán, chưa ai kiểm. Người chơi hoàn hảo phải đạt 3 sao ở ≥95% số lượt ở **mọi màn**. Màn nào trượt thì **giảm `spawnRatePerSec` màn đó**, tuyệt đối không hạ ngưỡng sao.

### Chặng 4 — Sự kiện và rác nguy hại
- `src/gameplay/EventSystem.ts` + 8 file trong `gameplay/events/` (Mục 7)
- Cơ chế rác nguy hại + hộp thu gom (Mục 5.4) — **đọc kỹ bảng luật chi tiết**

**Test bắt buộc:** không bao giờ hai sự kiện chồng nhau; túi không bao giờ bị kẹt vì rác nguy hại.

### Chặng 5 — Hành trình
- `src/scenes/MapScene.ts` — bản đồ Việt Nam, mở khoá tuần tự
  ⚠️ **Bắt buộc có Hoàng Sa và Trường Sa** (Mục 11b). Đây không phải chi tiết nhỏ.
- `src/scenes/MenuScene.ts`, `HandbookScene.ts`
- Đủ 10 màn + `src/render/backdrops.ts`
- Nối `SaveStore` vào, lưu tiến trình thật
- Hiệu ứng xám → có màu khi hoàn thành màn (dùng `desaturate` đã có sẵn)

### Chặng 6 — Hoàn thiện
- `src/ui/ShareCard.ts` — ảnh **1080×1080 vuông**, Web Share API + nút tải về
- `src/scenes/PledgeScene.ts`
- Âm thanh (chỉ nguồn CC0), nút tắt tiếng, mặc định tắt
- `public/og-image.png` 1200×630
- Tối ưu đạt ngân sách Mục 4

---

## 4. ⚠️ Luật về số liệu — vi phạm là hỏng cả dự án

Đây là game tuyên truyền. Một con số sai bị bắt bẻ là mất sạch uy tín.

**Đọc Mục 9 của đặc tả và tuân thủ tuyệt đối.** Ba điều dễ sai nhất:

1. **TUYỆT ĐỐI KHÔNG dùng con số "một viên pin làm ô nhiễm 500 lít nước / 1m³ đất".**
   Con số này lan truyền khắp internet tiếng Việt nên mô hình ngôn ngữ rất dễ nhả ra.
   Nó **không có nguồn khoa học nào** — xuất phát từ một bài viết thương mại năm 2018.
   Mục 8.4 đã viết sẵn câu thay thế đúng. Dùng nguyên văn.
2. **Không tự thêm con số nào** vào `harm` hay `tip`. Cổng kiểm chứng chỉ soi `decomposeLabel`,
   nên số lọt vào hai trường kia là số không ai soi.
3. **Thời gian phân hủy ghi dạng khoảng**, lấy nguyên từ bảng Mục 8.1. Không làm tròn, không "đẹp hoá".

Nếu cần một fact mới mà không tìm được nguồn cấp một → đặt `verified: false`. Thà ít mà đúng.

---

## 5. Những chỗ đặc tả để trống — bạn tự quyết

Được tự quyết, nhưng **phải ghi lại** vào `docs/DESIGN.md` mục 15 để người khác soát:

- `src/data/facts.ts` — câu hiện cuối mỗi màn. Gợi ý: nối với địa danh vừa dọn. Không được chứa số chưa kiểm chứng.
- **Màn hình thua** (ô nhiễm 100%). Đây là lúc người chơi dễ bỏ cuộc nhất — đừng làm nó nặng nề.
- **Danh sách hiệu ứng âm thanh** cần những tiếng gì.
- **`MenuScene`** có gì ngoài nút Chơi, Sổ tay, nút loa.
- **Chơi lại màn cũ:** sao và điểm ghi đè thế nào (gợi ý: lấy max, đừng lấy mới nhất — người chơi không nên bị phạt vì chơi lại cho vui).
- **Tải lại trang giữa màn:** mất tiến trình màn đó (gợi ý: chấp nhận, màn chỉ 60–90 giây).

---

## 6. Cạm bẫy đã biết — đừng dẫm lại

- **Đừng sửa `desaturate` trong `palette.ts`.** Nó cố ý tính trong không gian tuyến tính. Bản gamma trông "gọn hơn" nhưng làm cả cảnh nảy độ sáng lúc chuyển xám sang màu. Đã có test canh.
- **Đừng bỏ `touch-action: none`** trong `global.css`. Bỏ là kéo rác biến thành cuộn trang trên điện thoại.
- **Đừng để túi kẹt vì rác nguy hại.** Mục 5.4 có bảng luật chi tiết — hộp thu gom phải luôn quay lại sau 10 giây.
- **Điều kiện chặn khổ dọc nằm ở hai nơi** — `global.css` và `main.ts` — và phải luôn khớp nhau.
- **`removeEventListener` không nhận `passive`**, chỉ nhận `capture`. TypeScript sẽ báo.
- **Game chỉ chạy ở khổ ngang.** Đừng thiết kế gì cho khổ dọc.
- **Rác nguy hại không bao giờ quá trọng số 5** trong `trashPool`. Nó là bài học, không phải vật cản.
- **Đừng dùng `DESIGN_WIDTH` làm toạ độ.** Nó là 1280 nhưng khung ảo lúc chạy có thể là 1600.
  Dùng nó để căn giữa là lệch hẳn sang trái trên điện thoại.
- **Bài mô phỏng cân bằng phải chạy ở cả `W=1280` và `W=1800`.** Máy rộng thì thùng rộng,
  đích dễ trúng hơn, nên hơi dễ hơn. Chỉ kiểm một giá trị là bỏ sót.
- **Đừng gỡ lệnh gọi Fullscreen API** ở lần chạm đầu trong `main.ts`. Không có nó thì
  thanh địa chỉ ăn mất chiều cao và dải đen quay lại.

---

## 7. XONG nghĩa là gì

Không được nói "xong" nếu chưa chạy đủ những lệnh này và **đọc kết quả thật**:

```bash
npm test              # tất cả xanh, kể cả bộ mô phỏng cân bằng
npm run typecheck     # không lỗi
npm run build         # chạy được, JS ≤ 250 KB gzip
grep -rnE '#[0-9a-fA-F]{6}' src --include='*.ts' | grep -v palette.ts   # không ra gì
```

Và đi qua checklist thủ công ở Mục 13 của đặc tả — đặc biệt:
- Chơi trọn một màn trên iPhone Safari và Chrome Android thật, cầm ngang
- **Cố tình bỏ pin vào thùng tái chế** → thông báo phải rõ ràng và đáng nhớ
- Chế độ ẩn danh (localStorage bị chặn) → vẫn chơi được, không văng lỗi
- Dán link vào Messenger/Zalo → hiện ảnh preview đúng

**Báo cáo trung thực.** Test nào đỏ thì nói là đỏ, kèm output. Chặng nào bỏ qua thì nói rõ bỏ qua cái gì và vì sao. Đừng nói "đã xong" khi mới chạy được một phần.
