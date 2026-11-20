# ĐẶC TẢ KỸ THUẬT — "RÁC ƠI VỀ NHÀ"

> Game web tuyên truyền phân loại rác, hành trình xuyên Việt.
> Tài liệu này được viết để giao thẳng cho một AI coding agent (Codex) thực thi.
> Phần nội dung, thông điệp viết bằng tiếng Việt. Tên file / hàm / biến / commit dùng tiếng Anh.

---

## 1. Bối cảnh — vì sao làm cái này

Nguyễn Ngọc Nguyên (mobile engineer, TP.HCM) muốn làm một việc cho cộng đồng: tuyên truyền ý thức giữ vệ sinh và **phân loại rác đúng cách** ở Việt Nam.

Vấn đề với tuyên truyền kiểu cũ: khẩu hiệu, poster, bài giảng — lớp trẻ lướt qua. Nên thay vì nói, ta cho họ **làm**: một game nhặt rác xuyên Việt, vui trước, thông điệp thấm sau.

**Kết quả mong muốn:** một người trẻ mở link trên điện thoại, chơi 5–10 phút, cười được vài lần, và nhớ được ít nhất 3 điều: (1) pin không bỏ vào thùng rác thường, (2) chai nhựa mất ~450 năm để phân hủy, (3) rác phân loại đúng thì mới tái chế được.

**Thành công trông như thế nào:** game được share tự nhiên trên Facebook/TikTok vì người chơi muốn khoe kết quả, không phải vì bị kêu gọi chia sẻ.

---

## 2. Mục tiêu / Không phải mục tiêu / Thất bại

### Mục tiêu
- Chơi được bằng **hai ngón cái, máy cầm ngang**, không cần hướng dẫn dài.
- Mỗi màn **60–90 giây**. Hết màn muốn chơi màn tiếp.
- Kiến thức về rác **gài vào trong lúc chơi**, không phải màn hình text bắt đọc.
- Có **lý do quay lại**: bản đồ mở khóa dần, sổ tay rác sưu tập dần.
- Chạy hoàn toàn trên trình duyệt. **Không backend, không tài khoản, không thu thập dữ liệu người chơi.**

### Không phải mục tiêu (giai đoạn này)
- Bảng xếp hạng toàn quốc, tài khoản đăng nhập.
- Bản đồ điểm thu gom pin ngoài đời thật (dữ liệu khó xác thực, dễ sai, dễ phản tác dụng).
- Đa ngôn ngữ. Tiếng Việt trước; code phải tách chuỗi ra file riêng để sau thêm tiếng Anh dễ.
- App native iOS/Android.

### Thất bại (anti-goals) — làm được hết mà vẫn hỏng nếu:
- **Game có giọng lên lớp.** Nếu người chơi cảm thấy đang bị dạy dỗ, họ đóng tab. Tông phải vui, tưng tửng, tự giễu.
- **Số liệu sai.** Đây là game tuyên truyền. Một con số sai bị bắt bẻ là mất sạch uy tín. Xem Mục 9.
- **Tải chậm.** Người ta mở từ link trên 4G. Quá 3 giây là mất một nửa người chơi.
- **Chơi không đã tay.** Nếu nhịp chơi chán thì kiến thức có hay mấy cũng vô nghĩa.

---

## 3. Các cách đã cân nhắc

| | Mô tả | Vì sao không chọn |
|---|---|---|
| **A. Arcade ngắn** | 3 màn, chơi một lèo 5 phút, không lưu | Chơi hết là thôi, không có lý do quay lại. Sổ tay rác không phát huy vì quá ít loại rác. |
| **C. Game + chiến dịch thật** | Thêm backend, leaderboard, bản đồ điểm thu gom thật | Cần server, cần dữ liệu thật tự đi gom, cần người bảo trì dài hạn. Không ai nuôi thì nửa năm sau hỏng. |

### ✅ B. Hành trình xuyên Việt — **đã chọn**
10 màn theo bản đồ Việt Nam, mở khóa tuần tự. Sổ tay rác sưu tập dần. Lưu tiến trình bằng `localStorage`. Thẻ kết quả chia sẻ được. Không server, không chi phí vận hành.

Cấu trúc của B **không cản** việc gắn thêm C về sau (leaderboard, bản đồ thật) — nhưng không làm bây giờ.

**Chia 2 chặng:** M1 dựng đúng phần lõi (xem Mục 11) để chơi thử thật trên điện thoại sớm, chỉnh nhịp chơi lúc còn rẻ, rồi mới mở rộng.

---

## 4. Quyết định kỹ thuật (đã chốt, không cần hỏi lại)

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| Ngôn ngữ | **TypeScript** (strict) | An toàn kiểu, Codex sinh code chính xác hơn |
| Render | **Canvas 2D API thuần, KHÔNG dùng game engine** | Phaser/PixiJS thêm 200–900KB. Game này chỉ cần chạm & kéo thả — Canvas thuần là đủ và nhẹ |
| Build | **Vite** | Nhanh, zero-config, output tĩnh |
| Deploy | **Vercel**, repo riêng `rac-oi-ve-nha` | Tác giả đã dùng Vercel. Repo riêng vì đây là dự án cộng đồng, không nên chôn trong portfolio cá nhân |
| Lưu dữ liệu | **`localStorage`**, có version & migration | Không backend. Không thu thập gì của người chơi |
| Đồ hoạ | **Vẽ bằng code (Canvas path) + SVG**, phong cách phẳng | Không mua asset, sửa màu/hình nhanh, file nhẹ. **Đây là phần tốn công nhất của dự án** |
| Font | **System font stack**, không tải font ngoài | Tiết kiệm 100–200KB và tránh FOUT. Dự phòng cần font riêng: `Be Vietnam Pro` subset Latin-Ext |
| Âm thanh | **Chỉ hiệu ứng ngắn (SFX)**, `.webm`, ≤ 20KB/file, tổng ≤ 120KB. **Một bản nhạc nền duy nhất cho màn 5**, tải lười (lazy) *ngoài* ngân sách bundle, ≤ 400KB. Chỉ nguồn CC0. Mặc định **tắt tiếng** | Trình duyệt mobile chặn autoplay, và mặc định tắt nghĩa là đa số người chơi không nghe — không đáng đầu tư nhạc cho cả 10 màn. "Nhạc tăng nhịp" ở `GIO_CAO_DIEM` làm bằng `audio.playbackRate = 1.15`, không cần track thứ hai |
| Test | **Vitest** cho logic thuần. Không test render | Test canvas rendering tốn công hơn giá trị thu được |
| Hướng màn hình | **Cả hai. Không ép xoay.** Cầm ngang hay dọc đều chơi được, đều full màn | Nhiều người bật khoá xoay màn hình và không biết tắt ở đâu. Ép xoay là mất người chơi ngay giây đầu, trước khi họ kịp thấy game là cái gì. Bố cục bốn dải ngang không khoá tỉ lệ nên xoay được tự nhiên |
| Kích thước gốc | **Cạnh NGẮN của khung ảo luôn 720. Cạnh dài co giãn** theo tỉ lệ máy, chặn trong 1100–1800. Cầm ngang: ~1560×720. Cầm dọc: 720×~1560 | Điện thoại hiện đại không còn 16:9. Khung cố định để lại hai dải đen mỗi bên ~230px, trông như chạy giả lập. **Không chiều nào cố định — mọi toạ độ phải qua `computeLayout()`** |
| **Mức độ đồ hoạ** | **Tối giản.** Mỗi món rác vẽ bằng **3–6 hình cơ bản** (`roundRect`, `ellipse`, `path`), đọc được ở 40px trên điện thoại. Bối cảnh = dải màu gradient + 2–4 silhouette đặc trưng của vùng | Codex vẽ được toàn bộ bằng code, **không cần hoạ sĩ**. `render/` phải tách hẳn khỏi logic để sau thay ảnh minh hoạ xịn vào mà không đụng gameplay |
| Repo | **`github.com/threeng0227/rac-oi-ve-nha`** — repo riêng, public | Dự án cộng đồng, không chôn trong portfolio cá nhân |
| Tên miền | **`rac-oi-ve-nha.vercel.app`** (miễn phí) | Dùng cố định cho `og:url`. Sau mua tên miền riêng chỉ cần trỏ DNS, không sửa code |
| Service worker / PWA | **KHÔNG làm** trong M1–M3 | Yêu cầu "tắt mạng vẫn chơi được" ở Mục 13 chỉ có nghĩa: tab đang mở thì không văng lỗi. Không yêu cầu sống sót qua reload. Thêm service worker sẽ kéo theo chuyện đồng bộ cache-version với migration của `localStorage` — không đáng ở giai đoạn này |

**Ngân sách hiệu năng (bắt buộc đạt):**
- JS bundle ≤ **250 KB gzip**
- Thời gian đến lúc chơi được ≤ **3 giây** trên 4G giả lập
- **60 fps** trên Android tầm trung (mốc tham chiếu: Redmi Note 11)
- Lighthouse Mobile Performance ≥ **90**

---

## 5. Cơ chế chơi (phần quan trọng nhất — đọc kỹ)

### 5.1 Bố cục màn chơi

Game chơi được **cả khi cầm ngang lẫn cầm dọc**. Bố cục là **bốn dải ngang**
chồng lên nhau, không dải nào khoá tỉ lệ — nên xoay máy thì dải co giãn theo,
không cần bố cục thứ hai.

⚠️ **Không chiều nào cố định.** Đừng viết số cho toạ độ ngang *lẫn* dọc.
Gọi `computeLayout(viewport)` trong `src/core/Layout.ts` và đọc mọi thứ từ đó.

```
CẦM NGANG  (~1560 × 720)              CẦM DỌC  (720 × ~1560)
┌──────────────────────────┐          ┌───────────────┐
│ HUD              cao 90  │          │ HUD    cao 90 │
├──────────────────────────┤          ├───────────────┤
│                          │          │               │
│      KHU CẢNH            │          │               │
│      cao ~440            │          │   KHU CẢNH    │
│                          │          │   cao ~1240   │
├──────────────────────────┤          │               │
│ TÚI 6 ô          cao 60  │          │               │
├────────┬────────┬────────┤          │               │
│ ♻️     │ 🍎     │ 🗑     │ cao 130  ├───────────────┤
└────────┴────────┴────────┘          │ TÚI    cao 90 │
                                      ├─────┬────┬────┤
                                      │ ♻️  │ 🍎 │ 🗑 │ cao 190
                                      └─────┴────┴────┘
```

**Mọi toạ độ lấy từ `computeLayout()`, không tự tính:**

| Cần | Lấy từ |
|---|---|
| Bốn dải | `layout.hud` · `layout.playfield` · `layout.bag` · `layout.bins` — mỗi cái có `y` và `height` |
| Thùng thứ `i` (0,1,2) | `layout.binX(i)`, rộng `layout.binWidth` |
| Ô túi thứ `i` (0…5) | `layout.bagSlotX(i)`, cạnh `layout.bagSlotSize` |
| Tâm màn hình | `layout.centerX` *(không phải `DESIGN_WIDTH / 2`)* |
| Vùng được sinh rác | `layout.spawnArea` — đã trừ lề an toàn |
| Mật độ rác | `layout.playfieldArea` — xem ghi chú cân bằng dưới |
| Đang cầm dọc? | `layout.isPortrait` |

Dải HUD cố định 90. Thùng và túi **dày thêm khi cầm dọc** (thùng 130→190, túi
60→90): màn dài hơn thì ngón cái phải với tới cạnh dưới, vùng chạm mỏng là hụt liên tục.

Ba thùng trải hết chiều ngang ở cạnh dưới: hai ngón cái nghỉ ở hai góc dưới,
với tới thùng trái và thùng phải không phải nhấc tay. Thùng giữa xa hơn một
chút — đó là lý do nhóm **Thực phẩm** (ít gặp nhất ở phần lớn màn) nằm ở giữa.

> ### ⚠️ Cân bằng: mật độ rác tính theo DIỆN TÍCH, không theo số tuyệt đối
>
> Khu cảnh cầm dọc rộng gấp khoảng **ba lần** khu cảnh cầm ngang. Rải cùng một
> số món rác lên hai khu đó cho ra hai game khác hẳn nhau: cầm ngang thì chật
> cứng, cầm dọc thì thưa thớt và phải quét mắt tìm.
>
> Nên `initialTrashCount` và `spawnRatePerSec` ở Mục 6.1 là **giá trị cho khu
> cảnh tham chiếu** (1280×440 = 563.200 đơn vị diện tích). Lúc chạy phải nhân
> theo tỉ lệ:
>
> ```
> hệ số = layout.playfieldArea / 563200
> số rác thật = số rác trong bảng × hệ số
> ```
>
> **Bài mô phỏng cân bằng ở Mục 5.6 phải chạy ở cả bốn trường hợp:**
> ngang hẹp, ngang rộng, dọc hẹp, dọc dài. Chỉ kiểm một hướng là bỏ sót.

> **Toàn màn hình:** game gọi Fullscreen API ở lần chạm đầu tiên để ẩn thanh địa
> chỉ trình duyệt. Thanh đó ăn khoảng 130px, làm vùng hiển thị dẹt hơn tỉ lệ thật
> của máy. iPhone không hỗ trợ Fullscreen API — ở đó chấp nhận còn dải đen hẹp.

### 5.2 Vòng lặp cốt lõi

1. Rác xuất hiện trong **khu cảnh** (có sẵn từ đầu + spawn thêm theo thời gian).
2. **Chạm vào một món rác** → nó bay theo đường cong vào **túi** (ô trống đầu tiên). `+5 điểm`.
3. **Kéo một món từ túi thả vào một trong 3 thùng**:
   - **Đúng** → `+10 × hệ số combo`, combo +1, thùng nảy lên, hiện dòng chữ nhỏ bay lên: `Ống hút nhựa · 200 năm`
   - **Sai** → `−15 điểm`, combo về 0, thùng rung lắc đỏ, hiện: `Ống hút nhựa thuộc nhóm KHÁC`, thanh ô nhiễm +8%
4. **Túi đầy 6 món → không nhặt thêm được nữa.** Đây là nguồn áp lực chính: buộc người chơi vừa nhặt vừa phân loại, không được nhặt bừa.
5. Hết giờ → tính kết quả.

> **Ghi chú thiết kế cho người implement:** Cơ chế "chạm để nhặt, kéo để phân loại" giữ nguyên ở khổ ngang, nhưng nay chơi bằng **hai ngón cái** — tay trái lo nửa màn trái, tay phải lo nửa phải. Không làm joystick ảo, không làm nhân vật di chuyển. Người chơi là "bàn tay", không phải nhân vật trong màn.
>
> Hệ quả cần kiểm khi cân bằng: vùng với tới của hai ngón cái ở khổ ngang rộng hơn ở khổ dọc, nên người chơi nhặt nhanh hơn. Bài mô phỏng ở Mục 5.6 phải chạy lại sau khi đổi, đừng bê nguyên con số cũ.

### 5.3 Ba thùng rác — theo đúng pháp luật Việt Nam

Phân loại theo Luật Bảo vệ môi trường 2020 (hiệu lực phân loại tại nguồn từ 01/01/2025), 3 nhóm:

| Thùng | `binId` | Màu | Biểu tượng | Gồm |
|---|---|---|---|---|
| **Tái chế** | `recycle` | Xanh dương `#2E7DD1` | ♻️ mũi tên xoay | Chai nhựa PET, lon nhôm, giấy, bìa carton, chai thủy tinh, vỏ hộp sữa |
| **Thực phẩm** | `food` | Xanh lá `#3DA35D` | 🍎 lá cây | Vỏ chuối, vỏ trái cây, thức ăn thừa, lá cây, bã mía |
| **Khác** | `other` | Xám `#6B7280` | 🗑 thùng | Túi nilon, hộp xốp, ống hút, tàn thuốc, khẩu trang, tã bỉm, que xiên |

### 5.4 ⭐ Cơ chế dạy quan trọng nhất: RÁC NGUY HẠI KHÔNG THUỘC THÙNG NÀO

Pin, lightstick, bóng đèn, bình xịt → `binId: 'hazard'`.

**Không có thùng nguy hại cố định trong màn chơi.** Khi một món nguy hại xuất hiện:

- Món đó **nhấp nháy viền vàng cảnh báo** trong khu cảnh.
- Một **"Hộp thu gom pin"** (màu vàng, có khoá) trượt vào từ cạnh phải khu cảnh, ở lại 15 giây.
- Bỏ đúng vào hộp → `+50 điểm`, combo giữ nguyên, hiện thẻ kiến thức ngay giữa màn hình trong 2 giây.
- Bỏ vào bất kỳ thùng nào trong 3 thùng kia → `−40 điểm`, combo reset, thanh ô nhiễm **+20%**, hiện: `Pin KHÔNG thuộc thùng nào cả. Pin phải mang tới điểm thu gom riêng.`

> Đây là bài học khó nhất và quan trọng nhất của game. Người chơi phải **thua vì nó một lần** thì mới nhớ. Đừng làm nó dễ.

**Luật chi tiết — bắt buộc đúng từng điểm (chỗ này dễ làm hỏng game nhất):**

| Tình huống | Xử lý |
|---|---|
| Chạm rác nguy hại **trước khi** hộp xuất hiện | Nhặt được bình thường, vào túi. Món đó giữ viền vàng nhấp nháy trong túi |
| Hộp hết 15 giây mà trong túi **vẫn còn** món nguy hại | **Hộp quay lại sau 10 giây.** Lặp lại cho tới hết màn. Không phạt lúc hộp rời đi |
| Ô túi bị món nguy hại chiếm | **KHÔNG bao giờ khoá vĩnh viễn.** Tối đa 2 món nguy hại cùng lúc trong túi; món nguy hại thứ 3 trở đi không nhặt được (chạm vào hiện gợi ý "Đợi hộp thu gom quay lại") |
| Hết giờ mà túi còn món nguy hại | `−20 điểm` mỗi món (nặng hơn `BO_LO` thường nhưng không thua màn). Hiện nhắc: "Pin vẫn còn trong túi — ngoài đời cũng vậy, nhiều nhà để pin cũ trong ngăn kéo hàng năm trời." |
| Rác nguy hại nằm lại trên sàn khi hết giờ | `−20 điểm` mỗi món, **và không tính vào mẫu số độ sạch** (xem 5.6) |

> **Vì sao không khoá túi:** một viên pin không vứt đi được mà chiếm chỗ cả màn sẽ biến "khó" thành "hỏng". Hộp phải luôn quay lại. Áp lực đến từ việc mất chỗ tạm thời, không từ việc bị kẹt.

### 5.5 Tính điểm & combo

```ts
NHAT_RAC          = +5
PHAN_LOAI_DUNG    = +10 * comboMultiplier
PHAN_LOAI_SAI     = -15
NGUY_HAI_DUNG     = +50
NGUY_HAI_SAI      = -40
BO_LO (hết giờ còn trên sàn) = -2 mỗi món
```

| Chuỗi đúng liên tiếp | Hệ số |
|---|---|
| 0–4 | ×1 |
| 5–11 | ×2 |
| 12–19 | ×3 |
| ≥20 | ×4 |

Điểm không bao giờ xuống dưới 0.

### 5.6 Thanh ô nhiễm & điều kiện thắng

**Thanh ô nhiễm** (`pollution`, 0–100%). Chạm 100% → **thua màn**, phải chơi lại.

```
+8   mỗi lần phân loại sai
+20  mỗi lần bỏ sai rác nguy hại
+15  thất bại ở sự kiện CUU_SINH_VAT
+1/giây  CHỈ KHI có ≥ 8 món rác đang nằm trên sàn   ← áp lực dọn nhanh
−2/giây  khi có ≤ 3 món trên sàn (tự phục hồi)      ← thưởng cho người chơi sạch
```

**Độ sạch** — công thức chính xác:

```
độ sạch = số món phân loại ĐÚNG / mẫu số

mẫu số = tổng số món đã xuất hiện
         − số món sinh ra trong 5 giây cuối màn      (không kịp xử lý, không công bằng)
         − số món bay ra khỏi màn hình trong GIO_MUA (do sự kiện, không do người chơi)
         − số món rác nguy hại                        (tính riêng, không trộn vào)
         + số món còn trong túi lúc hết giờ           (có nhặt mà không phân loại thì vẫn tính)
```

**Spawner phải giảm dần ở cuối màn:** 10 giây cuối, tốc độ sinh rác giảm tuyến tính về 0. Không có rác mới trong 5 giây cuối.

| Sao | Điều kiện |
|---|---|
| ⭐ | Độ sạch ≥ 60% |
| ⭐⭐ | Độ sạch ≥ 80% |
| ⭐⭐⭐ | Độ sạch ≥ 95% **và** sai ≤ 3 lần **và** không bỏ sai món nguy hại nào |

> **Bắt buộc kiểm chứng bằng số trước khi chốt M1:** viết một bài test mô phỏng người chơi hoàn hảo (phản xạ 400ms) chạy 1000 lượt mỗi màn. **Người chơi hoàn hảo phải đạt 3 sao ≥ 95% số lượt ở mọi màn.** Nếu không đạt, giảm `spawnRatePerSec` chứ **không** hạ ngưỡng sao. Các màn hỗn loạn (5, 6, 8, 10) là chỗ dễ vỡ công thức này nhất.

**Mở khóa màn kế tiếp:** đạt tối thiểu 1 sao.

### 5.7 Phần thưởng cảm xúc — đừng bỏ qua

Khi hoàn thành màn, **khu cảnh phải thay đổi rõ rệt trước mắt người chơi** trong 2 giây: bộ lọc xám (`saturate(0.3)`) chuyển dần sang màu đầy đủ, bầu trời sáng lên, thêm vài chi tiết sống động (chim bay, cá nhảy, người đi bộ). Chuyển bằng `requestAnimationFrame`, không cắt cảnh đột ngột.

Đây là lý do người ta chơi tiếp. Dành thời gian làm cho tử tế.

---

## 6. Mười màn chơi

Mỗi màn 75 giây (trừ ghi chú khác). Mở khóa tuần tự trên bản đồ Việt Nam từ Bắc vào Nam.

| # | Màn | Bối cảnh | Rác đặc trưng | Sự kiện |
|---|---|---|---|---|
| 1 | **Phố cổ Hà Nội** | Vỉa hè, quán trà đá, nhà ống | cốc trà đá, giấy, vỏ chuối, túi nilon | `NEM_RAC` — *màn hướng dẫn, 90s, chậm, ít rác* |
| 2 | **Vịnh Hạ Long** | Bãi biển + mặt nước, núi đá vôi | chai nhựa, hộp xốp, lưới đánh cá, phao | `MUA_BAO`, `CUU_SINH_VAT` (rùa) |
| 3 | **Phố cổ Hội An** | Sông Hoài, đèn lồng, hoa đăng | túi nilon, cốc nhựa, hoa đăng giấy, ống hút | `GIO_MUA` |
| 4 | **Đà Lạt** | Hồ Xuân Hương, đồi thông | vỏ bắp nướng, ly sữa đậu nành, lon, khẩu trang | `BAC_VE_CHAI` |
| 5 | ⭐ **ĐÊM NHẠC HỘI** | Sân khấu, biển lightstick, đám đông | cốc nhựa, **lightstick (nguy hại)**, áo mưa giấy, confetti, băng rôn, chai nước | `GIO_CAO_DIEM`, `PIN_ROI` — *60s, nhịp nhanh nhất, có nhạc* |
| 6 | **Kênh Nhiêu Lộc, TP.HCM** | Kênh, cầu, lục bình | hộp xốp, túi nilon, chai, dép đứt | `BAI_RAC_TU_PHAT` |
| 7 | **Chợ nổi Cái Răng** | Ghe thuyền, trái cây | vỏ trái cây, lá chuối, bã mía, túi nilon | `GIO_MUA` — *nhiều rác thực phẩm nhất* |
| 8 | **Giao thừa — phố đi bộ Nguyễn Huệ** | Sau pháo hoa, cờ hoa | lon bia, que xiên, cành đào/mai gãy, giấy, vỏ hạt dưa | `GIO_CAO_DIEM` |
| 9 | **Ruộng bậc thang Sa Pa** | Núi, ruộng, sương mù | chai nhựa, vỏ bánh kẹo, khẩu trang, **pin máy ảnh** | `MUA_BAO`, `PIN_ROI` |
| 10 | **Côn Đảo** | Biển, rùa đẻ trứng, rạn san hô | vi nhựa, lưới ma, ống hút, túi nilon | `CUU_SINH_VAT`, `BAI_RAC_TU_PHAT` — *màn cuối, khó nhất* |

Định nghĩa trong `src/data/levels.ts`, không hardcode trong scene:

```ts
export interface LevelDef {
  id: string;
  order: number;
  name: string;            // 'Vịnh Hạ Long'
  subtitle: string;        // 'Quảng Ninh'
  durationSec: number;
  initialTrashCount: number;
  spawnRatePerSec: number;
  trashPool: { typeId: string; weight: number }[];
  events: { eventId: string; atSec: number }[];
  palette: { sky: string; ground: string; accent: string; water?: string };
  backdrop: BackdropId;     // hàm vẽ nền
  factOnComplete: string;   // id của fact hiện ở màn kết quả
}
```


### 6.1 Số liệu từng màn — giá trị khởi điểm

> ⚠️ **Đây là giá trị khởi điểm, không phải chân lý.** Bài mô phỏng cân bằng ở Mục 5.6
> là trọng tài. Màn nào người chơi hoàn hảo không đạt 3 sao ≥95% thì **giảm
> `spawnRatePerSec` màn đó**, không hạ ngưỡng sao.

**Cách các con số này được chọn:** mỗi món rác tốn hai thao tác (chạm nhặt + kéo phân
loại). Với phản xạ 400ms và quãng kéo trung bình, người chơi khá xử lý được khoảng
**0,8 món/giây** trong thời gian ngắn, nhưng không giữ được nhịp đó cả màn. Nên tốc độ
sinh trung bình giữ dưới **0,55/giây**, phần căng thẳng đến từ **sự kiện dồn rác** chứ
không từ việc tăng đều — tăng đều chỉ làm người chơi mệt, dồn cục mới làm người chơi nhớ.

| # | Màn | `durationSec` | `initialTrashCount` | `spawnRatePerSec` | Tổng rác ước tính |
|---|---|---|---|---|---|
| 1 | Phố cổ Hà Nội | **90** | 4 | 0.25 | ~26 |
| 2 | Vịnh Hạ Long | 75 | 6 | 0.35 | ~32 |
| 3 | Phố cổ Hội An | 75 | 6 | 0.40 | ~36 |
| 4 | Đà Lạt | 75 | 8 | 0.45 | ~42 |
| 5 | **Đêm nhạc hội** | **60** | 6 | 0.40 | ~46 *(có dồn cục)* |
| 6 | Kênh Nhiêu Lộc | 75 | 8 | 0.45 | ~58 *(có bãi rác)* |
| 7 | Chợ nổi Cái Răng | 75 | 8 | 0.50 | ~46 |
| 8 | Giao thừa Nguyễn Huệ | 75 | 10 | 0.45 | ~56 *(có dồn cục)* |
| 9 | Ruộng bậc thang Sa Pa | 80 | 8 | 0.45 | ~44 |
| 10 | **Côn Đảo** | 85 | 10 | 0.50 | ~60 *(hai sự kiện)* |

Màn 1 dài 90 giây nhưng rác thưa nhất — người mới cần thời gian chứ không cần dễ.
Màn 5 ngắn nhất (60 giây) vì nó là màn dồn dập, kéo dài sẽ thành mệt chứ không còn đã.

### 6.2 Trọng số rác và lịch sự kiện từng màn

Trọng số là số tương đối trong cùng một màn, không phải phần trăm.

| # | `trashPool` (`typeId` : trọng số) | `events` (`eventId` @ giây) |
|---|---|---|
| 1 | `coc-nhua` 30 · `giay-bao` 20 · `vo-chuoi` 20 · `tui-nilon` 15 · `lon-nhom` 5 · `chai-nhua-pet` 5 · `tan-thuoc-la` 3 · `vo-trai-cay` 2 | `NEM_RAC` @ 55 |
| 2 | `chai-nhua-pet` 30 · `hop-xop` 20 · `tui-nilon` 20 · `luoi-danh-ca` 12 · `chai-thuy-tinh` 10 · `ong-hut-nhua` 8 | `MUA_BAO` @ 20 · `CUU_SINH_VAT` @ 50 *(rùa)* |
| 3 | `tui-nilon` 25 · `coc-nhua` 20 · `ong-hut-nhua` 20 · `giay-bao` 15 *(variant hoa đăng)* · `vo-trai-cay` 12 · `chai-nhua-pet` 8 | `GIO_MUA` @ 35 |
| 4 | `coc-nhua` 25 · `lon-nhom` 20 · `vo-trai-cay` 20 *(variant vỏ bắp)* · `khau-trang-y-te` 15 · `chai-nhua-pet` 12 · `giay-bao` 8 | `BAC_VE_CHAI` @ 30 |
| 5 | `coc-nhua` 35 · `ao-mua-giay` 20 · `chai-nhua-pet` 18 · `giay-bao` 12 *(variant băng rôn)* · `lon-nhom` 10 · `lightstick` 5 | `PIN_ROI` @ 18 · `GIO_CAO_DIEM` @ 40 |
| 6 | `hop-xop` 28 · `tui-nilon` 25 · `chai-nhua-pet` 18 · `coc-nhua` 15 · `ao-mua-giay` 8 · `bia-carton` 6 | `BAI_RAC_TU_PHAT` @ 30 |
| 7 | `vo-trai-cay` 30 · `la-chuoi` 20 · `ba-mia` 18 · `tui-nilon` 15 · `thuc-an-thua` 10 · `hop-xop` 7 | `GIO_MUA` @ 40 |
| 8 | `lon-nhom` 25 · `que-xien-tre` 20 · `vo-hat-dua` 18 · `giay-bao` 15 · `coc-nhua` 10 · `bia-carton` 7 · `bong-den` 5 | `PIN_ROI` @ 20 · `GIO_CAO_DIEM` @ 45 |
| 9 | `chai-nhua-pet` 28 · `tui-nilon` 22 · `khau-trang-y-te` 20 · `giay-bao` 14 · `lon-nhom` 11 · `pin-aa` 5 | `MUA_BAO` @ 25 · `PIN_ROI` @ 55 |
| 10 | `tui-nilon` 25 · `ong-hut-nhua` 20 · `chai-nhua-pet` 18 · `luoi-danh-ca` 15 · `hop-xop` 12 · `chai-thuy-tinh` 6 · `pin-aa` 4 | `CUU_SINH_VAT` @ 25 *(rùa)* · `BAI_RAC_TU_PHAT` @ 55 |

**Ba quy tắc khi chỉnh bảng này:**

1. **Rác nguy hại không bao giờ quá trọng số 5.** Nó là bài học, không phải vật cản. Gặp hai lần một màn là đủ nhớ, gặp năm lần là ức chế.
2. **Sự kiện cách nhau tối thiểu 20 giây** và không đặt trong 10 giây cuối — lúc đó `Spawner` đang giảm dần về 0, dồn rác vào đó là phạt oan người chơi.
3. **Mỗi màn chỉ nên có 4–7 loại rác.** Nhiều hơn thì người chơi không kịp học loại nào ra loại nào, và sổ tay mở quá nhanh mất cảm giác sưu tập.

### 6.3 Màu tạm từng màn

Chưa làm `docs/ART.md`, nên đây là giá trị tạm để `LevelDef.palette` có cái mà điền.
**Không coi đây là định hướng mỹ thuật** — sẽ thay khi có bảng màu thật.

| # | `sky` | `ground` | `accent` | `water` |
|---|---|---|---|---|
| 1 | `#C9A227` | `#6B5B4A` | `#D96B4A` | — |
| 2 | `#5FB3D9` | `#3E6B5A` | `#F2E8C9` | `#2E7DA8` |
| 3 | `#E8A33D` | `#8A5A3B` | `#D94F4F` | `#4A6B7A` |
| 4 | `#8FC5E8` | `#4A6B3A` | `#E88FB0` | `#3A7A9A` |
| 5 | `#2A1B4A` | `#1A1030` | `#E84FA0` | — |
| 6 | `#7AA8C9` | `#5A6B4A` | `#C9D94F` | `#4A7A6B` |
| 7 | `#E8C97A` | `#8A7A4A` | `#D9734F` | `#6B8A5A` |
| 8 | `#1B2A4A` | `#2A3A5A` | `#E8C94F` | — |
| 9 | `#B8D4E8` | `#6B8A4A` | `#D9A84F` | — |
| 10 | `#4FC9D9` | `#D9C9A8` | `#F2A84F` | `#2E9AB8` |


---

## 7. Tám tình huống bất ngờ (EventSystem)

Mỗi sự kiện **báo trước 2 giây** bằng toast trượt từ trên xuống + rung nhẹ (`navigator.vibrate(50)`, bọc try/catch vì iOS không hỗ trợ).

| `eventId` | Tên hiển thị | Thời lượng | Hành vi |
|---|---|---|---|
| `MUA_BAO` | "Mưa bão ập tới!" | 15s | Lớp mưa phủ màn hình. Rác trên sàn **trôi dạt** theo vector gió đổi hướng mỗi 3s. Khó chạm hơn. Điểm nhặt ×1.5 |
| `GIO_MUA` | "Gió mùa về!" | 12s | Rác mới **bay ngang màn hình** theo đường sin thay vì rơi xuống. Phải bắt trước khi bay mất |
| `CUU_SINH_VAT` | "Cứu nó với!" | 10s | Một con vật (rùa/bò/chó tuỳ màn) xuất hiện đang nuốt túi nilon. **Chạm liên tục 5 lần** vào nó để gỡ ra. Thành công `+100` + thẻ kiến thức. Thất bại: ô nhiễm +15%, con vật đi mất với vẻ mặt buồn |
| `BAC_VE_CHAI` | "Bác ve chai đi ngang" | 12s | Một xe ve chai đi chậm ngang khu cảnh. Kéo rác **tái chế** thả vào xe bác → `điểm ×2` và `+1` vào bộ đếm "đã bán ve chai". Rác khác thả vào → bác lắc đầu, không phạt |
| `NEM_RAC` | "Ơ kìa!" | 10s | Một người chạy xe máy ngang qua, **ném rác ra đường** mỗi 2s. Chạm vào họ → dừng lại, quay lại nhặt hết rác vừa ném, `+30`. Không chạm → rác nằm lại đó |
| `GIO_CAO_DIEM` | "Đám đông vừa tan!" | 10s | **Rác đổ xuống ồ ạt** — tốc độ spawn ×5. Dùng cho màn concert & lễ hội. Nhạc tăng nhịp |
| `PIN_ROI` | "Cẩn thận — rác nguy hại!" | 15s | Sinh ra 2–3 món `hazard`. Hộp thu gom vàng trượt vào. Xem Mục 5.4 |
| `BAI_RAC_TU_PHAT` | "Bãi rác tự phát!" | 20s | Một đống rác lớn xuất hiện ở vị trí cố định. **Chạm 8 lần** để phá vỡ → bung ra 12–20 món rác cùng lúc. Túi chỉ chứa 6 → phải phân loại cực nhanh |

Interface:

```ts
export interface GameEvent {
  id: string;
  label: string;
  durationSec: number;
  onStart(ctx: LevelContext): void;
  onUpdate(ctx: LevelContext, dt: number): void;
  onEnd(ctx: LevelContext): void;
  render?(ctx: LevelContext, g: CanvasRenderingContext2D): void;
}
```

Mỗi sự kiện là **một file riêng** trong `src/gameplay/events/`. Không bao giờ chạy 2 sự kiện cùng lúc — `EventSystem` xếp hàng, nếu trùng thì lùi sự kiện sau 3 giây.

---

## 8. Sổ tay rác (Handbook)

24 loại rác. Mỗi loại nhặt-và-phân-loại-đúng lần đầu → mở khoá một thẻ.

**Màn hình sổ tay:** lưới 3 cột. Thẻ chưa mở = bóng đen có dấu `?`. Thanh tiến trình trên cùng: `Đã sưu tập 18/24`.

**Chạm vào thẻ đã mở → trang chi tiết:**

```
┌──────────────────────────┐
│        [ hình rác ]      │
│      CHAI NHỰA PET       │
│   ♻️  Thùng TÁI CHẾ       │
├──────────────────────────┤
│ ⏳ Phân hủy ngoài môi     │
│    trường: ~450 năm      │
├──────────────────────────┤
│ ⚠️ Tác hại                │
│ Vỡ vụn thành vi nhựa,    │
│ cá nuốt phải, rồi quay   │
│ lại mâm cơm nhà mình.    │
├──────────────────────────┤
│ ✅ Làm đúng               │
│ Đổ hết nước, bóp dẹp,    │
│ bỏ riêng nắp — nắp làm   │
│ từ nhựa khác.            │
├──────────────────────────┤
│ Nguồn: NOAA Marine Debris│  ← bấm được
└──────────────────────────┘
```

### 8.1 Danh sách chính thức 24 loại rác

Đây là danh sách **duy nhất và đầy đủ**. Mọi `trashPool` trong `levels.ts` chỉ được trỏ tới các `id` dưới đây.

| # | `id` | Tên | Thùng | Phân hủy | ✓ |
|---|---|---|---|---|---|
| 1 | `chai-nhua-pet` | Chai nhựa PET | ♻️ recycle | ~450 năm | ✅ |
| 2 | `lon-nhom` | Lon nhôm *(nước ngọt, bia)* | ♻️ recycle | 80–200 năm | ✅ |
| 3 | `chai-thuy-tinh` | Chai thủy tinh | ♻️ recycle | Gần như không phân hủy sinh học | ✅ |
| 4 | `giay-bao` | Giấy báo | ♻️ recycle | 2–6 tuần | ✅ |
| 5 | `bia-carton` | Bìa carton | ♻️ recycle | 2–3 tháng | ⚠️ |
| 6 | `vo-chuoi` | Vỏ chuối | 🍎 food | 2–5 tuần | ✅ |
| 7 | `vo-trai-cay` | Vỏ trái cây *(cam, xoài, mít)* | 🍎 food | 2–5 tuần | ✅ |
| 8 | `thuc-an-thua` | Thức ăn thừa | 🍎 food | 2–4 tuần | ✅ |
| 9 | `la-chuoi` | Lá chuối gói hàng | 🍎 food | 1–3 tháng | ⚠️ |
| 10 | `ba-mia` | Bã mía | 🍎 food | 1–3 tháng | ⚠️ |
| 11 | `vo-hat-dua` | Vỏ hạt dưa | 🍎 food | 1–3 tháng | ⚠️ |
| 12 | `tui-nilon` | Túi nilon | 🗑 other | 10–20 năm | ✅ |
| 13 | `hop-xop` | Hộp xốp đựng cơm | 🗑 other | 50 năm+, gần như không phân hủy hết | ✅ |
| 14 | `coc-nhua` | Cốc nhựa *(trà sữa, trà đá, cà phê)* | 🗑 other | ~50 năm | ✅ |
| 15 | `tan-thuoc-la` | Tàn thuốc lá | 🗑 other | 1–5 năm | ✅ |
| 16 | `ta-bim` | Tã bỉm | 🗑 other | ~450 năm | ✅ |
| 17 | `luoi-danh-ca` | Lưới đánh cá *("lưới ma")* | 🗑 other | ~600 năm | ✅ |
| 18 | `ong-hut-nhua` | Ống hút nhựa | 🗑 other | ~200 năm | ⚠️ |
| 19 | `khau-trang-y-te` | Khẩu trang y tế | 🗑 other | ~450 năm | ⚠️ |
| 20 | `que-xien-tre` | Que xiên tre / đũa dùng một lần | 🗑 other | — | ⚠️ |
| 21 | `ao-mua-giay` | Áo mưa giấy dùng một lần | 🗑 other | — | ⚠️ |
| 22 | `pin-aa` | **Pin tiểu AA/AAA** | ☢️ **hazard** | — | ✅ |
| 23 | `lightstick` | **Gậy phát sáng (pin cúc)** | ☢️ **hazard** | — | ✅ |
| 24 | `bong-den` | **Bóng đèn huỳnh quang** | ☢️ **hazard** | — | ✅ |

✅ = đã có nguồn · ⚠️ = `verified: false`, xem Mục 9.

**Rác nguy hại chỉ có 3 loại là đủ** — ít mà đậm. Đừng pha loãng bài học quan trọng nhất.

### 8.2 Biến thể hình vẽ (variants) — tránh phình danh sách

Mục 6 có nhắc nhiều món đặc thù vùng (cốc trà đá, vỏ bắp nướng, hoa đăng giấy, dép đứt, cành đào gãy, phao, confetti, băng rôn). **Đây KHÔNG phải loại rác mới.** Chúng là **biến thể hình vẽ** của 24 loại trên:

```ts
// trong TrashType
variants?: { id: string; label: string; sprite: SpriteId }[];
```

Ví dụ: `coc-nhua` có variant `coc-tra-da` (Hà Nội), `coc-tra-sua` (Đà Lạt), `coc-bia` (concert) — khác hình, khác nhãn hiển thị, **nhưng chung một thẻ sổ tay và chung một thùng**.

`LevelDef.trashPool` trỏ tới `typeId` + `variantId` tuỳ chọn.

> Quy tắc: **sổ tay luôn đúng 24 thẻ.** Muốn thêm hình thì thêm variant, không thêm type. Thêm type nghĩa là phải sửa lưới sổ tay, sửa cổng kiểm chứng, và tìm thêm một nguồn khoa học nữa.

### 8.3 Kiểu dữ liệu

`src/data/trashTypes.ts`:

```ts
export interface TrashType {
  id: string;
  name: string;                  // 'Chai nhựa PET'
  bin: 'recycle' | 'food' | 'other' | 'hazard';
  decomposeLabel: string;        // '~450 năm'  — LUÔN ghi dạng khoảng/xấp xỉ
  harm: string;                  // 1–2 câu, nói thẳng, không bi kịch hoá
  tip: string;                   // hành động cụ thể làm được ngay
  source: { label: string; url: string };
  verified: boolean;             // false = ẩn con số, hiện "đang xác minh nguồn"
  sprite: SpriteId;
  size: 'small' | 'medium' | 'large';
  variants?: { id: string; label: string; sprite: SpriteId }[];
}
```

**Luật bắt buộc — `scripts/verify-facts.ts`, chạy ở `prebuild`:**

Cổng kiểm chứng **không chặn loại rác**, nó **chặn con số chưa có nguồn**:

| Trạng thái | Trong game | Trong sổ tay |
|---|---|---|
| `verified: true` | Xuất hiện bình thường | Hiện đầy đủ, có link nguồn |
| `verified: false` | **Vẫn xuất hiện bình thường**, vẫn phân loại được, vẫn mở thẻ | Ô "Phân hủy" hiện `⏳ Đang xác minh nguồn` thay cho con số. Phần tác hại & cách làm đúng vẫn hiện bình thường |

Build **fail** khi và chỉ khi: một `TrashType` có `verified: false` **mà** `decomposeLabel` không rỗng và đang được hiển thị, **hoặc** một `TrashType` có `verified: true` mà `source.url` rỗng / không phải URL hợp lệ.

> Như vậy game phát hành được ngay, và mỗi lần ai đó tìm ra một nguồn gốc thì game lại đúng thêm một chút. Thà hiện "đang xác minh" còn hơn hiện một con số bịa.

---

### 8.4 Nội dung 24 thẻ — viết sẵn, dùng nguyên văn

Đây là **phần tuyên truyền thật sự của game**. Không để người implement tự viết lại.

**Quy tắc tông chữ:**
- Câu `harm` nói **hậu quả cụ thể**, không nói "gây ô nhiễm môi trường" chung chung.
- Câu `tip` phải là **việc làm được trong tuần này**, không phải lời kêu gọi.
- Không dấu chấm than. Không "hãy". Không "chúng ta cần".
- `harm` và `tip` **không được chứa con số** nào ngoài những số đã qua cổng kiểm chứng ở Mục 9.

---

#### ♻️ Nhóm TÁI CHẾ

**1. `chai-nhua-pet` — Chai nhựa PET** · ~450 năm
- *Tác hại:* Vỡ vụn dần thành vi nhựa. Cá nuốt phải, rồi quay lại mâm cơm nhà mình.
- *Làm đúng:* Đổ hết nước, bóp dẹp cho đỡ tốn chỗ. Nắp chai làm từ loại nhựa khác — tháo ra để riêng.

**2. `lon-nhom` — Lon nhôm** · 80–200 năm
- *Tác hại:* Nằm ngoài môi trường cả trăm năm, trong khi nhôm tái chế được gần như vô hạn mà không mất chất.
- *Làm đúng:* Đổ cạn, bóp dẹp. Lon nhôm là thứ ve chai được giá nhất — đừng để nó lẫn vào rác thường.

**3. `chai-thuy-tinh` — Chai thủy tinh** · gần như không phân hủy sinh học
- *Tác hại:* Không phân hủy, chỉ vỡ thành mảnh nhỏ dần. Mảnh vỡ trên bãi biển cắt chân người và chân chim.
- *Làm đúng:* Để nguyên chai, đừng đập. Chai vỡ vừa nguy hiểm cho người thu gom vừa khó tái chế hơn.

**4. `giay-bao` — Giấy báo** · 2–6 tuần
- *Tác hại:* Tự nó phân hủy nhanh. Vấn đề là dính dầu mỡ thì làm hỏng cả mẻ giấy tái chế.
- *Làm đúng:* Giữ khô. Giấy ướt hoặc dính thức ăn thì bỏ nhóm Khác, đừng bỏ nhầm vào tái chế.

**5. `bia-carton` — Bìa carton** · 2–3 tháng ⚠️
- *Tác hại:* Chiếm chỗ khổng lồ ở bãi chôn lấp dù thừa sức tái chế.
- *Làm đúng:* Gỡ băng keo, xếp dẹp. Thùng dính dầu mỡ như hộp pizza thì không tái chế được.

---

#### 🍎 Nhóm THỰC PHẨM

**6. `vo-chuoi` — Vỏ chuối** · 2–5 tuần
- *Tác hại:* Bản thân nó vô hại. Sai ở chỗ lẫn vào rác tái chế thì làm bẩn cả mẻ.
- *Làm đúng:* Bỏ nhóm Thực phẩm. Nhà có chậu cây thì vỏ chuối ủ làm phân rất tốt.

**7. `vo-trai-cay` — Vỏ trái cây** · 2–5 tuần
- *Tác hại:* Phân hủy nhanh, nhưng bị chôn kín trong túi nilon thì sinh khí mê-tan — một khí nhà kính mạnh hơn CO₂ nhiều lần.
- *Làm đúng:* Bỏ nhóm Thực phẩm, đừng gói trong túi nilon rồi mới bỏ.

**8. `thuc-an-thua` — Thức ăn thừa** · 2–4 tuần
- *Tác hại:* Là thành phần nặng nhất trong rác sinh hoạt. Trộn lẫn thì cả xe rác không còn gì tái chế được.
- *Làm đúng:* Gạn bớt nước trước khi bỏ — nước rỉ rác là thứ gây mùi và ngấm xuống mạch nước.

**9. `la-chuoi` — Lá chuối gói hàng** · 1–3 tháng ⚠️
- *Tác hại:* Gần như không có. Nó chỉ sai khi bị bỏ nhầm nhóm.
- *Làm đúng:* Bỏ nhóm Thực phẩm. Gói hàng bằng lá chuối là cách cũ mà đúng.

**10. `ba-mia` — Bã mía** · 1–3 tháng ⚠️
- *Tác hại:* Lượng lớn, ướt và nặng. Lẫn vào rác tái chế là hỏng cả mẻ.
- *Làm đúng:* Bỏ nhóm Thực phẩm. Bã mía ép khô còn làm được hộp đựng thay hộp xốp.

**11. `vo-hat-dua` — Vỏ hạt dưa** · 1–3 tháng ⚠️
- *Tác hại:* Nhỏ nên hay bị nhổ thẳng xuống đất. Một người thì không sao, cả phố đi bộ cùng làm thì thành một lớp rác.
- *Làm đúng:* Bỏ nhóm Thực phẩm. Đi chơi Tết thì cầm theo một cái túi nhỏ.

---

#### 🗑 Nhóm KHÁC

**12. `tui-nilon` — Túi nilon** · 10–20 năm
- *Tác hại:* Trôi ra biển, rùa nhầm là sứa và nuốt. Trên cạn thì bịt cống, và đó là một lý do phố ngập sau mưa.
- *Làm đúng:* Bỏ nhóm Khác. Tốt hơn: để sẵn một túi vải trong cốp xe.

**13. `hop-xop` — Hộp xốp đựng cơm** · 50 năm+
- *Tác hại:* Vỡ vụn thành hạt trắng li ti, chim và cá nuốt nhầm là thức ăn. Gần như không nơi nào tái chế.
- *Làm đúng:* Bỏ nhóm Khác. Mua cơm mang về thì mang hộp riêng — quán nào cũng đồng ý.

**14. `coc-nhua` — Cốc nhựa** · ~50 năm
- *Tác hại:* Một ly trà sữa gồm ly, nắp, ống hút và túi đựng — bốn món nhựa cho hai mươi phút uống.
- *Làm đúng:* Bỏ nhóm Khác. Nói trước "không lấy ống hút, không lấy túi" lúc gọi nước.

**15. `tan-thuoc-la` — Tàn thuốc lá** · 1–5 năm
- *Tác hại:* Đầu lọc làm bằng nhựa chứ không phải bông. Ngấm nicotine và kim loại nặng ra nước.
- *Làm đúng:* Bỏ nhóm Khác. Đừng búng xuống cống — cống chảy thẳng ra sông.

**16. `ta-bim` — Tã bỉm** · ~450 năm
- *Tác hại:* Vừa là nhựa vừa là chất thải sinh học. Không tái chế được, và là nguồn lây bệnh cho người đi thu gom.
- *Làm đúng:* Gói kín rồi bỏ nhóm Khác.

**17. `luoi-danh-ca` — Lưới đánh cá** · ~600 năm
- *Tác hại:* Dân biển gọi là "lưới ma". Nó trôi dưới nước hàng chục năm và vẫn tiếp tục bắt cá, rùa, cá heo — bắt mà không ai thu.
- *Làm đúng:* Lưới hỏng mang về bờ, không thả lại biển. Nhiều nơi đã thu mua lưới cũ để tái chế.

**18. `ong-hut-nhua` — Ống hút nhựa** · ~200 năm ⚠️
- *Tác hại:* Quá nhỏ để máy phân loại nhặt ra, nên gần như luôn đi thẳng ra bãi rác hoặc ra biển.
- *Làm đúng:* Bỏ nhóm Khác. Hoặc đơn giản hơn: uống thẳng từ ly.

**19. `khau-trang-y-te` — Khẩu trang y tế** · ~450 năm ⚠️
- *Tác hại:* Lớp giữa là nhựa polypropylene chứ không phải vải. Dây đeo thắt vào chân chim và cổ cá.
- *Làm đúng:* Cắt đôi dây đeo rồi bỏ nhóm Khác. Đừng bỏ vào thùng tái chế.

**20. `que-xien-tre` — Que xiên tre, đũa dùng một lần** ⚠️
- *Tác hại:* Tre thì phân hủy được, nhưng đầu nhọn đâm thủng túi rác và đâm vào tay người thu gom.
- *Làm đúng:* Bẻ đôi hoặc bọc lại trước khi bỏ nhóm Khác.

**21. `ao-mua-giay` — Áo mưa giấy dùng một lần** ⚠️
- *Tác hại:* Tên là giấy nhưng làm bằng nhựa PE mỏng. Dùng một lần, rách ngay, và không tái chế được.
- *Làm đúng:* Bỏ nhóm Khác. Một cái áo mưa tử tế mặc được vài năm.

---

#### ☢️ Nhóm NGUY HẠI — không thuộc thùng nào

**22. `pin-aa` — Pin tiểu AA/AAA**
- *Tác hại:* Chứa kim loại nặng, rò rỉ ra đất và nước. Nguy hơn: pin bị ép trong xe rác rất dễ chập và bốc cháy.
- *Làm đúng:* KHÔNG bỏ vào thùng nào cả. Gom vào một hộp riêng ở nhà, đầy thì mang tới điểm thu gom pin.

**23. `lightstick` — Gậy phát sáng**
- *Tác hại:* Bên trong là pin cúc. Trẻ con nuốt phải pin cúc có thể bị bỏng thực quản chỉ trong vài giờ.
- *Làm đúng:* Tháo pin ra, mang pin tới điểm thu gom. Phần vỏ nhựa bỏ nhóm Khác.

**24. `bong-den` — Bóng đèn huỳnh quang**
- *Tác hại:* Chứa thủy ngân. Vỡ trong phòng kín thì hơi thủy ngân phát tán ra không khí trong nhà.
- *Làm đúng:* KHÔNG bỏ vào thùng nào. Bọc kỹ rồi mang tới điểm thu gom chất thải nguy hại.

---

> **Về nguồn:** cổng kiểm chứng ở Mục 8.3 chỉ soi `decomposeLabel`. Câu `harm` và `tip`
> là mô tả định tính đã được thừa nhận rộng rãi, không cần nguồn cấp một — **nhưng
> cũng không được chứa con số**. Thấy ai thêm số vào hai trường đó thì chặn lại.

---

## 9. ⚠️ Quy tắc về số liệu — ĐỌC KỸ, ĐÂY LÀ GAME TUYÊN TRUYỀN

Đã kiểm tra nguồn. Dưới đây là kết luận bắt buộc tuân theo:

### KHÔNG ĐƯỢC DÙNG
- ❌ **"Một viên pin làm ô nhiễm 500 lít nước / 1m³ đất trong 50 năm."** Con số này lan truyền khắp Việt Nam nhưng **không có nghiên cứu gốc nào**. Nó xuất phát từ một bài viết thương mại năm 2018, không dẫn nguồn, không nêu loại pin hay điều kiện.
- ❌ Bất kỳ con số nào không tìm được nguồn cấp một.

**Thay bằng cách nói đúng mà vẫn mạnh:**
> "Pin thải chứa kim loại nặng, có thể rò rỉ ra đất và nước. Nguy hơn: pin bị ép trong xe rác rất dễ chập và bốc cháy. Vì vậy pin phải mang tới điểm thu gom riêng, không bỏ vào thùng rác nào."

### Thời gian phân hủy — luôn ghi dạng khoảng

Các nguồn chênh nhau, nên **không bao giờ ghi một con số tuyệt đối** trừ khi nó được nhiều nguồn uy tín thống nhất.

| Loại rác | Ghi trong game | Ghi chú cho người implement |
|---|---|---|
| Vỏ chuối, vỏ trái cây | `2–5 tuần` | ✅ |
| Giấy báo | `2–6 tuần` | ✅ |
| Tàn thuốc lá | `1–5 năm` | ✅ có nguồn ghi tới 10 năm — dùng khoảng thấp |
| Túi nilon | `10–20 năm` | ✅ NOAA |
| Cốc/ly nhựa xốp | `~50 năm` | ✅ |
| Hộp xốp (EPS) | `50 năm+, gần như không phân hủy hết` | ✅ |
| Lon nhôm | `80–200 năm` | ✅ nguồn chênh nhiều, bắt buộc ghi khoảng |
| Ống hút nhựa | `~200 năm` | ⚠️ `verified: false` — phải tìm nguồn cấp một trước khi phát hành |
| Chai nhựa PET | `~450 năm` | ✅ NOAA / US National Park Service |
| Tã bỉm | `~450 năm` | ✅ |
| Khẩu trang y tế | `~450 năm` | ⚠️ `verified: false` — suy ra từ polypropylene, cần nguồn riêng |
| Lưới đánh cá / cước | `~600 năm` | ✅ |
| Chai thủy tinh | `Gần như không phân hủy sinh học` | ✅ tốt hơn con số "1 triệu năm" vốn chỉ là ước lượng |

### Số liệu Việt Nam
Con số "**1,8 triệu tấn rác nhựa/năm, chỉ ~27% được tái chế**" (Bộ TN&MT) xuất hiện trên rất nhiều báo nhưng **mọi nguồn đều là tường thuật lại**, chưa truy được báo cáo gốc.

→ Nếu dùng, bắt buộc ghi rõ: `Theo số liệu Bộ TN&MT được báo chí dẫn lại` và `verified: false` cho tới khi tìm được văn bản gốc.

### Quy trình cho mọi fact mới
1. Tìm nguồn cấp một (cơ quan nhà nước, tổ chức quốc tế, bài báo khoa học).
2. Ghi `source.url` trỏ thẳng tới nguồn đó, không trỏ tới bài báo thuật lại.
3. Nếu không tìm được → đặt `verified: false`. Loại rác đó **vẫn vào game**, nhưng sổ tay hiện `⏳ Đang xác minh nguồn` thay cho con số (Mục 8.3).
4. Thà ít fact mà đúng còn hơn nhiều fact mà sai.

---

## 10. Kiến trúc mã nguồn

```
rac-oi-ve-nha/
├─ index.html
├─ vite.config.ts
├─ tsconfig.json              # strict: true
├─ package.json
├─ public/
│  ├─ og-image.png            # ảnh preview khi share link
│  └─ audio/                  # CC0. SFX ≤ 20KB/file; nhạc màn 5 tải lười, ≤ 400KB
├─ scripts/
│  └─ verify-facts.ts         # chạy prebuild — luật ở Mục 8.3
└─ src/
   ├─ main.ts                 # entry: tạo canvas, khởi động Game
   ├─ core/
   │  ├─ Game.ts              # vòng lặp fixed-timestep 60Hz + scene manager
   │  ├─ Scene.ts             # abstract: enter/exit/update/render/onPointer
   │  ├─ Input.ts             # gộp touch + mouse thành PointerEvent chung
   │  ├─ Viewport.ts          # map 720×1280 ảo ↔ pixel thật, xử lý DPR & letterbox
   │  ├─ Renderer.ts          # helper vẽ: roundRect, text có outline, shadow
   │  ├─ Audio.ts             # preload, play, mute; mặc định mute
   │  ├─ Storage.ts           # load/save + migration theo version
   │  ├─ Tween.ts             # easing: easeOutBack, easeOutCubic
   │  └─ Random.ts            # RNG có seed (để test lặp lại được)
   ├─ scenes/
   │  ├─ BootScene.ts         # preload, thanh loading
   │  ├─ MenuScene.ts         # tên game, nút CHƠI, nút Sổ tay, nút loa
   │  ├─ MapScene.ts          # bản đồ VN, 10 chấm, chấm chưa mở có ổ khoá
   │  ├─ LevelScene.ts        # ⭐ màn chơi — file lớn nhất
   │  ├─ ResultScene.ts       # sao, điểm, fact, nút chia sẻ, nút chơi lại
   │  ├─ HandbookScene.ts     # sổ tay rác
   │  └─ PledgeScene.ts       # cam kết, hiện sau khi xong màn 6
   ├─ gameplay/
   │  ├─ TrashItem.ts         # thực thể rác: vị trí, vận tốc, state, hitbox
   │  ├─ Bag.ts               # túi 6 ô, logic kéo thả
   │  ├─ Bin.ts               # 3 thùng + hộp nguy hại
   │  ├─ Spawner.ts           # sinh rác theo trọng số từ LevelDef
   │  ├─ ScoreSystem.ts       # điểm, combo, ô nhiễm, tính sao
   │  ├─ EventSystem.ts       # xếp lịch & chạy sự kiện
   │  └─ events/              # 8 file, mỗi file một sự kiện
   ├─ data/
   │  ├─ trashTypes.ts        # 24 loại
   │  ├─ levels.ts            # 10 màn
   │  ├─ facts.ts             # fact cuối màn
   │  └─ pledges.ts           # danh sách lời cam kết
   ├─ render/
   │  ├─ sprites.ts           # mọi hàm vẽ rác, ánh xạ SpriteId → hàm
   │  ├─ backdrops.ts         # 10 hàm vẽ nền (Hạ Long, concert, …)
   │  └─ particles.ts         # bụi, nước bắn, confetti, mưa
   ├─ ui/
   │  ├─ Button.ts  Modal.ts  Toast.ts  ProgressBar.ts  StarRow.ts
   │  └─ ShareCard.ts         # vẽ ảnh 1080×1080 ra canvas ngoài màn hình
   ├─ i18n/
   │  └─ vi.ts                # ⚠️ MỌI chuỗi hiển thị nằm ở đây, không hardcode
   └─ styles/global.css
```

### Nguyên tắc bắt buộc
- `LevelScene.ts` **chỉ điều phối**. Logic nằm trong `gameplay/`. Nếu file vượt 400 dòng → tách ra.
- **Không hardcode chuỗi tiếng Việt** trong scene. Tất cả qua `i18n/vi.ts`.
- **Không hardcode toạ độ pixel thật.** Mọi thứ theo hệ ảo 720×1280, `Viewport` lo phần quy đổi.
- Vòng lặp **fixed timestep** (`dt = 1/60`), tách khỏi render. Game không được chạy nhanh hơn trên máy 120Hz.
- Mọi `requestAnimationFrame` phải huỷ khi rời scene. Không để rò rỉ.

### Dữ liệu lưu

```ts
export interface SaveData {
  version: 1;
  levels: Record<string, { stars: 0|1|2|3; bestScore: number; cleared: boolean }>;
  handbook: string[];        // id loại rác đã mở
  pledges: string[];         // id cam kết đã chọn
  stats: { totalTrash: number; totalCorrect: number; veChaiSold: number };
  settings: { muted: boolean };
}
```
Key: `racoivenha.save`. Đọc hỏng hoặc `version` lạ → reset về mặc định, **không văng lỗi**. Bọc mọi truy cập `localStorage` trong `try/catch` (chế độ ẩn danh có thể ném lỗi).

---

## 11. Ba chặng thực hiện

### M1 — Lõi chơi được (ưu tiên cao nhất)
Mục tiêu: **cầm điện thoại đưa bạn bè chơi thử được**.

- [ ] Dựng dự án: Vite + TS strict + Vitest + cấu hình Vercel
- [ ] `core/`: Game loop, Scene manager, Viewport, Input, Tween, Storage
- [ ] `LevelScene` với **1 màn duy nhất (Phố cổ Hà Nội)**
- [ ] Nhặt (chạm) + phân loại (kéo thả) + túi 6 ô
- [ ] 3 thùng, 8 loại rác đầu tiên
- [ ] `ScoreSystem`: điểm, combo, ô nhiễm, sao
- [ ] `ResultScene` cơ bản: sao + điểm + nút chơi lại
- [ ] Deploy Vercel, mở được trên điện thoại thật

**🛑 Dừng lại ở đây. Chơi thử. Chỉnh nhịp chơi.** Thời lượng màn, tốc độ spawn, sức chứa túi, số điểm — đều có thể phải đổi. Đừng xây tiếp trên một nhịp chơi chưa vui.

### M2 — Hành trình & kiến thức
- [ ] `MapScene`: bản đồ Việt Nam, mở khoá tuần tự, lưu tiến trình
- [ ] Thêm 4 màn: Hạ Long, Hội An, Đà Lạt, **Đêm nhạc hội**
- [ ] `EventSystem` + 4 sự kiện: `NEM_RAC`, `MUA_BAO`, `BAC_VE_CHAI`, `GIO_CAO_DIEM`
- [ ] Cơ chế **rác nguy hại** + hộp thu gom (Mục 5.4) + sự kiện `PIN_ROI`
- [ ] Đủ 24 loại rác + `HandbookScene` + `scripts/verify-facts.ts`
- [ ] Hiệu ứng "cảnh chuyển từ xám sang có màu" khi hoàn thành màn

### M3 — Đủ bộ & đánh bóng
- [ ] 5 màn còn lại: Nhiêu Lộc, Cái Răng, Giao thừa, Sa Pa, Côn Đảo
- [ ] 3 sự kiện còn lại: `GIO_MUA`, `CUU_SINH_VAT`, `BAI_RAC_TU_PHAT`
- [ ] `ShareCard`: xuất ảnh **1080×1080 (vuông)**, Web Share API + nút tải về
- [ ] `PledgeScene`: chọn 1–3 cam kết, hiện trên thẻ chia sẻ
- [ ] Âm thanh (CC0) + nút tắt tiếng, mặc định tắt
- [ ] Thẻ Open Graph để link share lên Facebook có ảnh đẹp
- [ ] Tối ưu hiệu năng đạt ngân sách Mục 4

---

## 11b. Ba chi tiết nội dung đã chốt sẵn

### Bản đồ Việt Nam trong `MapScene`

⚠️ **Bắt buộc:** bản đồ phải vẽ đầy đủ lãnh thổ Việt Nam **bao gồm hai quần đảo Hoàng Sa và Trường Sa**, theo đúng chuẩn bản đồ hành chính Việt Nam.

Đây là game do người Việt làm, cho người Việt, về đất nước Việt Nam. Một bản đồ thiếu Hoàng Sa – Trường Sa sẽ bị chụp màn hình và lan truyền — rủi ro ngang với việc đưa sai số liệu, và không sửa được sau khi đã lan.

Cách vẽ: đường bờ biển dạng path đơn giản hoá (≤ 120 điểm), hai quần đảo vẽ thành cụm chấm nhỏ ngoài khơi kèm nhãn chữ `Hoàng Sa` và `Trường Sa`. Màn 10 (Côn Đảo) đặt đúng vị trí địa lý.

### Màn 1 làm hướng dẫn thế nào

Không làm màn hình hướng dẫn riêng, không có nút "Bỏ qua". Dạy bằng cách chơi:

1. Giây 0–3: chỉ có **một** món rác (vỏ chuối), một bàn tay mờ nhấp nháy chỉ vào nó. Game dừng cho tới khi người chơi chạm.
2. Chạm xong → rác bay vào túi. Thùng **Thực phẩm** sáng lên, bàn tay mờ kéo từ túi sang thùng đó. Game dừng cho tới khi người chơi kéo đúng.
3. Xong hai bước → gỡ bỏ mọi chỉ dẫn, màn chơi bắt đầu bình thường.
4. Lần chơi thứ hai trở đi (`localStorage` đã có `levels['ha-noi']`) → **bỏ hoàn toàn phần hướng dẫn**.

Rác nguy hại **không** xuất hiện ở màn 1. Bài học đó để dành cho màn 5 (concert), lúc người chơi đã quen tay.

### Nội dung cam kết — `src/data/pledges.ts`

Hiện sau khi hoàn thành màn 6. Chọn 1–3, hiện lên thẻ chia sẻ. Phải **cụ thể và làm được ngay**, không chung chung:

```ts
export const PLEDGES = [
  { id: 'binh-nuoc',   text: 'Tuần này tôi mang bình nước riêng thay vì mua chai nhựa' },
  { id: 'tui-vai',     text: 'Tôi để sẵn một cái túi vải trong cốp xe' },
  { id: 'tu-choi-ong-hut', text: 'Tôi nói "không lấy ống hút" khi mua nước' },
  { id: 'gom-pin',     text: 'Tôi gom pin cũ vào một hộp riêng, không vứt vào thùng rác' },
  { id: 'phan-loai-nha', text: 'Nhà tôi sẽ có hai thùng rác thay vì một' },
  { id: 'khong-nem',   text: 'Tôi không ném rác ra đường, dù đang vội' },
  { id: 'nhac-ban',    text: 'Tôi sẽ nhắc bạn mình một lần, không gắt gỏng' },
];
```

Tông chữ: câu khẳng định ngắn, ngôi thứ nhất, không có dấu chấm than, không hô hào.

---

## 12. Yêu cầu khác

### Tiếp cận (accessibility)
- Vùng chạm nhỏ nhất **44×44 px thật** (không phải px ảo).
- Thùng rác phân biệt bằng **màu + biểu tượng + chữ**, không chỉ bằng màu (8% nam giới mù màu).
- Chữ nhỏ nhất **14px thật**.
- Tôn trọng `prefers-reduced-motion`: giảm particle, bỏ rung màn hình.
- Game vẫn chơi được bình thường khi tắt tiếng.

### Riêng tư
- **Không analytics, không cookie, không tracking.** Nếu sau này muốn đếm lượt chơi, dùng dịch vụ không theo dõi cá nhân (Plausible/Umami) và ghi rõ trong trang.
- Không gửi gì ra ngoài. Mọi dữ liệu nằm trong `localStorage`.

### SEO & chia sẻ
- `<title>`: `Rác Ơi Về Nhà — Game nhặt rác xuyên Việt`
- `og:image` 1200×630, `og:description`, `twitter:card = summary_large_image`
- `lang="vi"`

---

## 13. Kiểm chứng (bắt buộc làm trước khi nói "xong")

### Test tự động — `npm test`
Chỉ test logic thuần, không test render:
- `ScoreSystem`: ngưỡng combo, điểm không âm, ngưỡng sao, tích luỹ ô nhiễm
- Ánh xạ rác→thùng: mọi `TrashType` phải có `bin` hợp lệ; món `hazard` không khớp với bất kỳ thùng nào trong 3 thùng
- `Storage`: lưu/đọc khứ hồi, dữ liệu hỏng → trả về mặc định không văng lỗi, migration version
- `EventSystem`: không bao giờ 2 sự kiện chồng nhau; sự kiện trùng giờ bị lùi
- `Spawner`: phân bố theo trọng số đúng (RNG có seed, 10.000 lần lấy mẫu); tốc độ sinh giảm về 0 ở 5 giây cuối
- `verify-facts`: fail đúng theo luật ở Mục 8 (và **chỉ** theo luật đó)
- **Mô phỏng cân bằng** (quan trọng nhất): người chơi hoàn hảo phản xạ 400ms, 1000 lượt/màn → phải đạt 3 sao ở ≥ 95% số lượt, **mọi màn**. Fail ở màn nào thì giảm `spawnRatePerSec` màn đó
- `Bag`: không bao giờ kẹt — mọi chuỗi thao tác hợp lệ đều phải còn ít nhất một nước đi

### Chạy thật
```bash
npm run dev -- --host     # rồi mở IP mạng LAN trên điện thoại thật
npm run build && npm run preview
npx vercel                # deploy preview
```

### Checklist thủ công — mỗi chặng đều phải đi qua
- [ ] Chơi trọn một màn trên **iPhone Safari** thật — kéo thả không bị trình duyệt cuộn trang (`touch-action: none`)
- [ ] Chơi trọn một màn trên **Chrome Android** thật
- [ ] Xoay ngang → letterbox đúng, không vỡ layout
- [ ] Khoá máy giữa màn chơi, mở lại → game tạm dừng, không chạy tiếp ngầm
- [ ] Chế độ ẩn danh (localStorage bị chặn) → vẫn chơi được, không văng lỗi
- [ ] Tắt mạng sau khi tải xong → vẫn chơi được
- [ ] **Cố tình bỏ pin vào thùng tái chế** → thông báo rõ ràng, đáng nhớ
- [ ] Hoàn thành một màn → hiệu ứng xám-sang-màu chạy mượt
- [ ] Mở sổ tay → mọi thẻ đã mở có nguồn bấm được, link mở đúng
- [ ] Dán link vào Messenger/Zalo → hiện ảnh preview đúng
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 90

### Đo bằng số
```bash
npm run build && du -sh dist/assets/*.js   # ≤ 250KB gzip
```
Dùng Chrome DevTools → Performance, throttle CPU ×4 → giữ 60fps ở màn concert (màn nặng nhất).

---

## 14. Gợi ý cách giao việc cho Codex

Đừng đưa cả tài liệu này rồi bảo "làm đi". Chia theo chặng:

1. **Lần 1:** đưa Mục 4 + 10 → *"Dựng khung dự án và lớp `core/`. Chưa làm gameplay. Phải `npm run dev` chạy được, hiện canvas trống có màu nền, log kích thước viewport."*
2. **Lần 2:** đưa Mục 5 + 10 → *"Làm `LevelScene` với một màn Phố cổ Hà Nội, 8 loại rác, 3 thùng, nhặt và phân loại."*
3. **Lần 3:** Mục 5.5–5.7 → điểm, combo, ô nhiễm, `ResultScene`.
4. **Dừng, chơi thử, chỉnh số.**
5. Tiếp M2, M3 theo thứ tự Mục 11.

Mỗi lần giao việc **luôn kèm Mục 9 (quy tắc số liệu)** nếu công việc có đụng tới nội dung fact.

Sau mỗi chặng: chạy `npm test`, chạy checklist thủ công Mục 13, rồi mới sang chặng sau.

---

## 15. Những chỗ tôi (Claude) tự quyết — Nguyên soát lại giúp

Bạn chưa nói gì về các điểm này, tôi chốt theo phán đoán. Thấy sai thì sửa, không ảnh hưởng tới phần còn lại:

1. **Danh sách 24 loại rác** (Mục 8.1) — tôi tự soạn. Có thể bạn muốn thêm món đặc trưng khác, ví dụ vỏ dừa hay bao xi măng.
2. **Chỉ 3 loại rác nguy hại** (pin, lightstick, bóng đèn) — ít mà đậm, thay vì dàn trải.
3. **Hộp thu gom pin luôn quay lại sau 10 giây** — để túi không bao giờ bị kẹt.
4. **Công thức độ sạch loại trừ** rác sinh ở 5 giây cuối, rác bị gió thổi bay, và rác nguy hại — nếu không thì 3 sao là bất khả thi về mặt toán học ở các màn hỗn loạn.
5. **Bản đồ phải có Hoàng Sa – Trường Sa** (Mục 11b).
6. **Chỉ một bản nhạc nền cho màn 5**, các màn khác chỉ có hiệu ứng âm thanh.
7. **Không làm PWA / service worker** ở giai đoạn này.
8. **Màn 1 dạy bằng cách chơi**, không có màn hình hướng dẫn riêng; chơi lần hai trở đi thì bỏ luôn.
9. **Bảy lời cam kết** ở Mục 11b — tôi tự viết, tông cố ý nhẹ và cụ thể.
10. **Cổng kiểm chứng số liệu chặn con số, không chặn loại rác** — để game phát hành được mà vẫn không bịa số.

### Sửa ngày 2026-11-20: đổi sang khổ ngang

Nguyên yêu cầu game chơi ở khổ ngang trên điện thoại. Hệ ảo đổi từ 720×1280
sang **1280×720**. Kéo theo:

- Desktop vừa khít 16:9, không còn hai dải đen mỗi bên 656px như bố cục dọc.
- Cầm dọc trên máy nhỏ (`orientation: portrait` và `max-width: 900px`) thì hiện
  lớp phủ "Xoay ngang điện thoại" và **vòng lặp dừng hẳn** để đỡ tốn pin.
  Điều kiện trong `global.css` và trong `main.ts` phải luôn khớp nhau.
- Mất tính "mở link là chơi ngay": người bật khoá xoay màn hình sẽ phải tự tắt.
  Lớp phủ nói rõ điều đó thay vì để họ đoán.
- Thao tác thành **hai ngón cái** thay vì một. Mọi con số cân bằng ở Mục 5.6
  phải chạy lại bài mô phỏng, không được bê nguyên từ bố cục dọc.

### Bổ sung ngày 2026-11-20: số liệu màn chơi và nội dung sổ tay

Hai chỗ trống nguy hiểm nhất đã được lấp. Thêm vào đó, tôi tự quyết mấy điểm sau:

11. **Số liệu 10 màn** (Mục 6.1–6.2) — tôi tự đặt, dựa trên giả định người chơi khá
    xử lý được ~0,8 món/giây và tốc độ sinh trung bình giữ dưới 0,55/giây. Căng thẳng
    đến từ sự kiện dồn rác chứ không từ việc tăng đều. **Bài mô phỏng là trọng tài,
    không phải bảng này.**
12. **Rác nguy hại trọng số tối đa 5** — gặp hai lần một màn là đủ nhớ, năm lần là ức chế.
13. **Mỗi màn 4–7 loại rác** — nhiều hơn thì người chơi không kịp học loại nào ra loại nào.
14. **Màn 1 dài 90 giây nhưng rác thưa nhất** — người mới cần thời gian, không cần dễ.
    Màn 5 ngắn nhất 60 giây vì kéo dài màn dồn dập sẽ thành mệt chứ không còn đã.
15. **Nội dung 24 thẻ sổ tay** (Mục 8.4) — tôi tự viết toàn bộ. Tông cố ý: nói hậu quả
    cụ thể thay vì "gây ô nhiễm môi trường", và câu khuyên phải làm được trong tuần này.
16. **`harm` và `tip` không được chứa con số** — chỉ `decomposeLabel` mới qua cổng kiểm
    chứng, nên số lọt vào hai trường kia là số không ai soi.
17. **Thẻ chia sẻ đổi sang 1080×1080 vuông** (trước là 1080×1350 dọc) — game đã thành
    khổ ngang, nhét ảnh ngang vào khung dọc thì hoặc cắt mất hai đầu hoặc thừa hai dải trống.
    Ảnh vuông lên Facebook và Instagram đều vừa.
18. **Sửa "một ngón tay" thành "hai ngón cái"** ở Mục 2 — sót lại từ bố cục dọc.

### Chặng 1 — dữ liệu, ngày 2026-11-20

19. **Mười câu cuối màn** trong `facts.ts` là lời nhắc định tính gắn với địa danh,
    không thêm số liệu. Tất cả để `verified: false`, nguồn rỗng để chờ soát nguồn cấp một.
    Phụ đề màn dùng địa phương hoặc bối cảnh đã mô tả ở Mục 6.
20. **Nhãn phân hủy chưa xác minh** vẫn lưu nguyên văn bảng 8.1 nhưng mọi nơi hiển thị
    phải gọi `getDecomposeLabel()`, nhận câu đang xác minh. Cổng prebuild kiểm chính
    phép chiếu này, có test cố tình làm lộ nhãn để chứng minh cổng chặn được.
21. **Màu nền Côn Đảo** trong palette nền cũ lệch Mục 6.3. Đã viết test đối chiếu cả
    bảng, chạy đỏ ở riêng giá trị này, rồi sửa đúng màu bảng. Không đổi phép toán màu.
22. **Nguồn của 24 loại rác** giữ trạng thái xác minh theo bảng bàn giao, dùng liên kết
    cấp một NOAA, EPA và CPSC. Chưa kiểm tra được truy cập mạng trong phiên này.
    Cổng kiểm chứng chỉ xác nhận cú pháp URL, không xác nhận nội dung nguồn.
23. **Nội dung sổ tay** giữ nguyên văn Mục 8.4, kể cả câu cốc nhựa có lượng viết bằng
    chữ, theo yêu cầu dùng nguyên văn. Không bổ sung số liệu mới vào `harm` hoặc `tip`.

### Chặng 2 — màn chơi thử, ngày 2026-11-20

24. **Thả sai thùng hoặc thả ra ngoài** trả món về đúng ô túi cũ để người chơi thử
    lại. Huỷ pointer, mất focus, ẩn tab và xoay máy cũng trả món đang kéo về ô.
    Ô được giữ ngay từ lúc bắt đầu bay vào túi, tránh hai ngón nhận cùng một ô.
25. **Hướng dẫn Hà Nội** dừng đồng hồ và sinh rác cho tới khi phân loại đúng vỏ
    chuối. Chơi lại trong cùng phiên bỏ hướng dẫn. Bản lưu đã có `ha-noi` cũng bỏ
    hướng dẫn theo Mục 11b. Hết lượt đầu ghi dấu `ha-noi` với sao/điểm bằng không,
    `cleared: false` nếu chưa có mục này. Lượt sau giữ dữ liệu hiện có. Việc lưu
    tiến trình kết nối đầy đủ ở Chặng 5.
26. **Kết thúc bản chơi thử Chặng 2** hiện số món đã phân loại và nút chơi lại.
    Đây là bộ đếm thao tác để chơi thử. Điểm, sao và màn kết quả theo Chặng 3.
27. **Vùng chạm** dùng tối thiểu 44 CSS px qua `viewport.scale`. Ô túi mở rộng vùng
    chạm lên phía khu cảnh khi dải túi quá mỏng. Sprite trên sàn vẽ tối thiểu
    40 CSS px. Tôn trọng giảm chuyển động bằng cách bỏ nhịp rung và chuyển bay tức thì.
28. **Tải lại giữa màn** bắt đầu lại màn đó. Chặng 2 chỉ đọc bản lưu để quyết định
    bỏ hướng dẫn và ghi dấu lượt chơi đã kết thúc.

Đã kiểm tra tự động dữ liệu, cổng kiểm chứng, túi, vùng chạm, trọng số 10.000 mẫu,
nhặt/kéo/thả qua `PointerSample`, thay đổi hướng và huỷ tween. Đã kiểm tra bằng
trình duyệt ở khổ 844×390 và 390×844. Checklist thiết bị thật, chế độ ẩn danh thực
tế, Lighthouse và ảnh preview chia sẻ chưa được kiểm tra trong phiên này.

### Chặng 3 — điểm và cân bằng

29. Hệ số combo lấy từ chuỗi đúng trước món hiện tại. Năm món đầu ×1, món thứ
    sáu ×2. Các tập rác sinh muộn, bị gió cuốn và nguy hại được loại theo hợp để
    không trừ cùng một món nhiều lần. Hướng dẫn không tính điểm hoặc độ sạch.
30. Màn thua dùng lời nhắc nhẹ về túi đầy và thả đúng nhóm, giữ nút chơi lại ngay
    trên màn kết quả. Ô nhiễm chạm 100% chốt thua ngay và không hồi phục sau đó.
31. Bộ mô phỏng chạy 1.000 seed × 10 màn × 4 khổ máy, phản xạ 400ms cho mỗi thao
    tác nhặt và kéo, bay vào túi 300ms, tốc độ kéo 1.000 đơn vị ảo/giây. Bước mô
    phỏng 50ms làm tròn thời gian hoàn thành thao tác lên. Đây là kiểm tra cơ sở
    với Spawner, Bag và ScoreSystem thực. Chặng 4 sẽ kiểm lại với sự kiện và hộp
    thu gom thực thay cho hộp luôn có sẵn trong mô phỏng cơ sở.
32. Côn Đảo ở khổ dọc dài chỉ đạt 635/1.000 lượt ba sao khi tốc độ sinh 0,50.
    Giảm xuống 0,48 cho 970/1.000 lượt, các ngưỡng sao giữ nguyên. Giá trị này thay
    thế giá trị khởi điểm ở bảng 6.1. Các màn còn lại vượt ngưỡng trong bộ cơ sở.

### Chặng 4 — sự kiện và rác nguy hại

33. Tám sự kiện dùng lịch có cảnh báo trước hai giây, dời sự kiện sau tới ít nhất
    ba giây sau khi sự kiện trước kết thúc. Nhân vật có vùng chạm tối thiểu 44 CSS px.
    Bác ve chai chỉ nhận tái chế, đồ khác trả lại túi. Người ném rác chỉ nhặt lại
    những món còn trên sàn, các món đã nằm trong túi vẫn do người chơi phân loại.
34. Hộp thu gom hiện 15 giây, quay lại sau 10 giây nếu còn rác nguy hại trong túi.
    Rác nguy hại mới xuất hiện trong lúc chờ cũng xếp yêu cầu cho lần quay lại.
    Yêu cầu mới không gia hạn cửa sổ hiện có. Hiệu ứng trượt vào dài 300ms, bỏ khi
    người chơi chọn giảm chuyển động. Túi giữ tối đa hai món nguy hại.
35. Bộ mô phỏng hiện dùng `LevelSession.onPointer` thực, bao gồm tám sự kiện và
    chu kỳ hộp thực. Hai ngón tay cho phép quãng kéo diễn ra cùng thời gian phản
    xạ của thao tác kế tiếp, tối đa hai pointer và cách mọi quyết định ít nhất
    400ms. Người chơi giữ một vài món trong túi rồi chọn quãng kéo ngắn nhất.
36. Sau khi đưa sự kiện vào mô phỏng, giảm tốc độ sinh concert từ 0,40 xuống 0,30,
    giao thừa từ 0,45 xuống 0,42, Côn Đảo từ 0,48 xuống 0,47. Mọi ngưỡng sao và
    số rác sự kiện giữ nguyên. Các giá trị này thay thế bảng khởi điểm Mục 6.1.

### Chặng 5 — hành trình và lưu tiến trình

37. Menu có Chơi, Sổ tay và bật/tắt tiếng. Bản đồ chọn màn bằng danh sách phân
    trang bốn màn để các địa điểm gần nhau vẫn dễ chạm. Đường bờ biển giản lược
    theo kinh/vĩ độ, có Hoàng Sa và Trường Sa. Concert tạm đặt tại TP.HCM vì đặc
    tả không chỉ định địa điểm, các màn còn lại theo địa danh đã ghi.
38. Sao và điểm tốt nhất lấy max độc lập qua các lần chơi. Đạt ít nhất một sao
    mới mở màn tiếp theo. Thẻ sổ tay lưu ngay khi phân loại đúng, kể cả vỏ chuối
    hướng dẫn, không đợi kết thúc màn. Lưu trữ bị chặn vẫn giữ tiến trình trong phiên.
39. Sổ tay chia sáu thẻ mỗi trang, ba cột. Thẻ khoá chỉ có bóng và dấu hỏi, thẻ
    mở có nhãn phân hủy đã qua bộ lọc, tác hại, cách làm và nút mở nguồn.
40. Màn đạt sao chuyển xám sang màu trong hai giây trước khi mở kết quả. Chế độ
    giảm chuyển động chuyển màu tức thì. Mỗi bối cảnh và mọi sprite vẽ bằng Canvas.
