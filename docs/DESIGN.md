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
- Chơi được bằng **một ngón tay trên điện thoại**, không cần hướng dẫn dài.
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
| Hướng màn hình | **Dọc (portrait) là chính**. Ngang thì letterbox | Người ta cầm điện thoại dọc |
| Kích thước gốc | **Hệ toạ độ ảo 720 × 1280**, scale theo màn hình | Mọi toạ độ trong code viết theo hệ này, không bao giờ dùng px thật |
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

Màn hình dọc, chia ba tầng cố định (toạ độ theo hệ ảo 720×1280):

```
┌─────────────────────────────┐  y=0
│ HUD: thời gian · điểm · combo│  cao 120
├─────────────────────────────┤  y=120
│                             │
│      KHU CẢNH (playfield)   │  cao 800
│   rác nằm rải rác ở đây     │
│   → CHẠM để nhặt            │
│                             │
├─────────────────────────────┤  y=920
│  TÚI: [🥤][🍌][🔋][ ][ ][ ] │  cao 140  (6 ô)
├─────────────────────────────┤  y=1060
│   ♻️ TÁI CHẾ │ 🍎 THỰC PHẨM │ 🗑 KHÁC │  cao 220
└─────────────────────────────┘  y=1280
```

### 5.2 Vòng lặp cốt lõi

1. Rác xuất hiện trong **khu cảnh** (có sẵn từ đầu + spawn thêm theo thời gian).
2. **Chạm vào một món rác** → nó bay theo đường cong vào **túi** (ô trống đầu tiên). `+5 điểm`.
3. **Kéo một món từ túi thả vào một trong 3 thùng**:
   - **Đúng** → `+10 × hệ số combo`, combo +1, thùng nảy lên, hiện dòng chữ nhỏ bay lên: `Ống hút nhựa · 200 năm`
   - **Sai** → `−15 điểm`, combo về 0, thùng rung lắc đỏ, hiện: `Ống hút nhựa thuộc nhóm KHÁC`, thanh ô nhiễm +8%
4. **Túi đầy 6 món → không nhặt thêm được nữa.** Đây là nguồn áp lực chính: buộc người chơi vừa nhặt vừa phân loại, không được nhặt bừa.
5. Hết giờ → tính kết quả.

> **Ghi chú thiết kế cho người implement:** Cơ chế "chạm để nhặt, kéo để phân loại" được chọn vì chơi được bằng **một ngón cái**. Không làm joystick ảo, không làm nhân vật di chuyển. Người chơi là "bàn tay", không phải nhân vật trong màn.

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
   │  └─ ShareCard.ts         # vẽ ảnh 1080×1350 ra canvas ngoài màn hình
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
- [ ] `ShareCard`: xuất ảnh 1080×1350, Web Share API + nút tải về
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
