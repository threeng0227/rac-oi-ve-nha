# BẢN GIAO VIỆC — đọc hết trước khi viết dòng code nào

Bạn làm **game nhập vai** "Rác Ơi Về Nhà": người chơi vào vai một người trẻ Việt Nam
đi dọn rác từ phố cổ Hà Nội tới Côn Đảo, gặp người dân, nhận việc, thấy nơi mình dọn
đẹp dần lên.

**Đọc theo đúng thứ tự:**
1. `README.md` — trạng thái, quy ước
2. `docs/DESIGN.md` — đặc tả đầy đủ. **Đọc hết.** Đặc biệt Mục 3, 5, 6, 8, 11, 12.

> ⚠️ **Đặc tả vừa được viết lại toàn bộ (bản 2, 23/11/2026).** Bản 1 từng thiết kế
> thành game arcade chạm-và-thả không có nhân vật. Đó là hiểu sai ý tác giả và đã bị
> bỏ. Nếu bạn thấy ở đâu đó nhắc tới "túi 6 ô", "màn 60–90 giây", "thanh ô nhiễm",
> "hệ thống sao" — đó là tàn dư bản 1, **không làm theo**. Mục 19 của đặc tả liệt kê
> rõ cái gì giữ, cái gì bỏ.

---

## 1. Nền đã có — KHÔNG ĐƯỢC SỬA

Đã xong, đã có test, đã chạy thật trên điện thoại Android.

```
src/core/Game.ts        src/core/Viewport.ts     src/core/Input.ts
src/core/Tween.ts       src/core/Storage.ts      src/core/Random.ts
src/core/Renderer.ts    src/render/palette.ts
tests/core/{Game,Viewport,Input,Tween,Storage,Random,Renderer}.test.ts
tests/render/palette.test.ts
```

**Test đang xanh. Không được làm đỏ cái nào.** Nghĩ một file trong đó có lỗi thì viết
test chứng minh rồi mới sửa — đừng sửa vì thấy "có thể viết gọn hơn".

Sẵn sàng dùng:
- `Viewport` — khung ảo cạnh ngắn 720, cạnh dài co giãn; **chạy cả ngang lẫn dọc**
- `Game` — vòng lặp fixed-timestep 1/60 + `SceneManager`
- `Input` — Pointer Events đã quy đổi sang toạ độ ảo
- `TweenRunner` — 4 hàm easing
- `SaveStore` — `localStorage`, chịu được chế độ ẩn danh
- `Random` — RNG có seed, có `weighted()`
- `palette` — màu + `mix`, `desaturate`, `withAlpha`, `contrastRatio`

**Hai file phải VIẾT LẠI** (của bản arcade, không còn đúng):
- `src/core/Layout.ts` — bốn dải arcade. Giờ cần: HUD phủ lên thế giới + panel dạng modal.
- `src/scenes/BootScene.ts` — scene tạm, thay bằng màn nạp dữ liệu thật.

---

## 2. Tám nguyên tắc không được vi phạm

1. **Không chiều nào cố định.** Cạnh ngắn khung ảo 720, cạnh dài co giãn 1100–1800,
   **cầm ngang hay dọc đều phải chơi được**. Toạ độ giao diện lấy từ `Layout`, toạ độ
   thế giới lấy từ `Camera`. Không viết số cứng.
2. **Không hardcode mã màu.** Lấy từ `src/render/palette.ts`.
   Kiểm: `grep -rnE '#[0-9a-fA-F]{6}' src --include='*.ts' | grep -v palette.ts` — không được ra gì.
3. **Mọi chuỗi tiếng Việt nằm ở `src/i18n/vi.ts`.** Kể cả thoại NPC.
4. **Không thêm game engine, không thêm thư viện.** Canvas 2D thuần. Ngân sách 300 KB gzip.
5. **`WorldScene.ts` chỉ điều phối.** Logic nằm trong `world/` và `systems/`. Vượt 400 dòng thì tách.
6. **Mỗi `systems/*` phải test được trên Node**, không phụ thuộc DOM hay canvas.
7. **Test trước, code sau.** Viết test → chạy cho nó đỏ → rồi mới viết code. Bắt chước `tests/core/`.
8. **Mọi `requestAnimationFrame`, tween, listener phải huỷ khi rời scene** (`exit()`).

---

## 3. Năm chặng — làm đúng thứ tự, mỗi chặng commit riêng

### Chặng 1 — Dữ liệu và khung màn hình
- `src/data/trashTypes.ts` — đủ 24 loại, **dùng nguyên văn Mục 11.1 và 11.3**
- `src/data/characters.ts` (Minh, Lan), `shopItems.ts`, `facts.ts`
- `scripts/verify-facts.ts` theo luật Mục 11.2, nối vào `prebuild`
- `TitleScene` → `CharacterScene` → `MapScene`, đi lại được, lưu lựa chọn

**Xong khi:** mở game chọn được nhân vật, đặt tên, thấy bản đồ Việt Nam **có Hoàng Sa
và Trường Sa**, chọn được khu vực đầu. Chưa cần vào thế giới.

### Chặng 2 — Thế giới chơi được (quan trọng nhất)
- `Camera` (bám nhân vật, có vùng chết), `Pathfinding` (A* trên lưới), `TileMap`, `Player`
- **Chỉ khu vực 1 — Phố cổ Hà Nội**
- Chạm nền để đi, chạm rác để nhặt, ba lô, thể lực
- `CollectPoint` + `SortingScene` + độ sạch khu vực
- Cảnh đổi màu theo độ sạch (dùng `desaturate()` có sẵn)

**🛑 DỪNG Ở ĐÂY. Báo cho người giao việc chơi thử trước khi đi tiếp.**
Đi lại có sướng tay không, nhặt có đã không — test không trả lời được câu đó.

### Chặng 3 — Người và nhiệm vụ
- `Npc`, `DialogueScene`, `QuestSystem`
- 4 NPC + 1 nhiệm vụ chính + 3 phụ cho khu vực 1 (Mục 9.3)
- `EventSystem` + 4 sự kiện: `NEM_RAC`, `BAC_VE_CHAI`, `CUU_SINH_VAT`, `TRE_CON_HOC`

### Chặng 4 — Tiến trình
- `ProgressSystem`, `EconomySystem`, `ShopScene`, 6 món dụng cụ
- `HandbookScene` + đủ 24 thẻ
- Mở khoá khu vực theo độ sạch 80%

### Chặng 5 — Đủ bộ
- 9 khu vực còn lại, 4 sự kiện còn lại
- `ShareCard` 1080×1080, âm thanh CC0, Open Graph, tối ưu

---

## 4. ⚠️ Luật về số liệu — vi phạm là hỏng cả dự án

Đây là game tuyên truyền. Một con số sai bị bắt bẻ là mất sạch uy tín.
**Đọc Mục 12 của đặc tả và tuân thủ tuyệt đối.** Ba điều dễ sai nhất:

1. **TUYỆT ĐỐI KHÔNG dùng con số "một viên pin làm ô nhiễm 500 lít nước / 1m³ đất".**
   Nó phủ kín internet tiếng Việt nên mô hình ngôn ngữ rất dễ tự nhả ra. Nó **không có
   nguồn khoa học nào** — xuất phát từ một bài viết thương mại năm 2018. Mục 11.3 đã
   viết sẵn câu thay thế đúng. Dùng nguyên văn.
2. **Không tự thêm con số nào** vào `harm` hay `tip`. Cổng kiểm chứng chỉ soi
   `decomposeLabel`, nên số lọt vào hai trường kia là số không ai soi.
3. **Thời gian phân hủy ghi dạng khoảng**, lấy nguyên từ bảng Mục 11.1.

Cần fact mới mà không tìm được nguồn cấp một → đặt `verified: false`. Thà ít mà đúng.

---

## 5. Những chỗ để trống — bạn tự quyết

Được tự quyết, nhưng **phải ghi lại** vào Mục 18 của `docs/DESIGN.md`:

- **Thoại chi tiết của NPC** — Mục 9.3 cho nhân thân và giọng. Luật: NPC nhờ vả, than
  phiền, kể chuyện, trêu chọc. **Không bao giờ giảng đạo.**
- **Bố cục ô của từng khu vực** — chỗ nào đi được, NPC đứng đâu, điểm tập kết ở đâu
- **`facts.ts`** — câu hiện khi dọn xong một khu vực
- **Hoạt ảnh nhân vật** — mấy khung cho bước đi, cúi nhặt
- **Màn hình hết thể lực** — nhắc nhẹ, đừng thành hình phạt

---

## 6. Cạm bẫy đã biết — đừng dẫm lại

- **Đừng làm theo bản 1.** Không túi 6 ô, không đồng hồ đếm ngược, không thanh ô nhiễm,
  không hệ thống sao. Đây là game nhập vai, không phải arcade.
- **Đừng làm joystick ảo.** Chạm-để-đi là quyết định có chủ ý (Mục 6.1).
- **Đừng để nhân vật kẹt vào vật cản.** Kẹt một lần là người chơi mất lòng tin vào
  điều khiển, và không lấy lại được. `Pathfinding` không tìm ra đường thì trả về rỗng,
  **tuyệt đối không treo vòng lặp**.
- **Đừng gán chỉ số khác nhau cho Minh và Lan.** Giống hệt nhau, khác mỗi hình vẽ.
- **Đừng để phân loại sai làm mất món rác.** Nó quay lại ba lô để thử lại — đó là chỗ dạy.
- **Đừng sửa `desaturate` trong `palette.ts`.** Nó cố ý tính trong không gian tuyến
  tính. Bản gamma trông gọn hơn nhưng làm cả cảnh nảy độ sáng lúc chuyển xám sang màu.
- **Đừng bỏ `touch-action: none`** trong `global.css`. Bỏ là kéo thả biến thành cuộn trang.
- **Đừng giả định máy cầm ngang.** Cầm dọc khung ảo là 720×~1560.
- **Đừng thêm lớp phủ ép xoay máy.** Nó từng có và đã bị gỡ có chủ ý.
- **Đừng dùng `DESIGN_WIDTH` làm toạ độ.** Nó là 1280 nhưng khung ảo lúc chạy có thể
  là 1560 ngang hoặc 720 dọc.

---

## 7. XONG nghĩa là gì

Không được nói "xong" nếu chưa chạy đủ những lệnh này và **đọc kết quả thật**:

```bash
npm test              # tất cả xanh
npm run typecheck     # không lỗi
npm run build         # chạy được, JS ≤ 300 KB gzip
grep -rnE '#[0-9a-fA-F]{6}' src --include='*.ts' | grep -v palette.ts   # không ra gì
```

Và đi qua checklist thủ công Mục 16 của đặc tả — đặc biệt:
- Chơi trọn một khu vực trên iPhone Safari và Chrome Android thật
- **Cầm dọc chơi được, cầm ngang chơi được**, xoay giữa chừng không vỡ
- Nhân vật không bao giờ kẹt vào tường
- **Cố tình bỏ pin vào thùng tái chế** → thông báo rõ ràng, pin quay lại ba lô
- Chế độ ẩn danh (localStorage bị chặn) → vẫn chơi được

**Báo cáo trung thực.** Test nào đỏ thì nói là đỏ, kèm output. Chặng nào bỏ qua thì
nói rõ bỏ qua cái gì và vì sao. Đừng nói "đã xong" khi mới chạy được một phần.
