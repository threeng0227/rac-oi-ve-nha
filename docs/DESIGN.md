# ĐẶC TẢ — "RÁC ƠI VỀ NHÀ"

> Game nhập vai, chủ đề giữ gìn vệ sinh và phân loại rác, bối cảnh khắp Việt Nam.
> Tài liệu này viết để giao thẳng cho một AI coding agent thực thi.
> Nội dung và thông điệp bằng tiếng Việt. Tên file / hàm / biến / commit dùng tiếng Anh.

**Phiên bản 2 — 2026-11-23.** Bản 1 thiết kế thành game arcade chạm-và-thả, người chơi
là "bàn tay" không có nhân vật. Sai với ý ban đầu của tác giả: *"một con game cho mọi
người **đi** nhặt rác trên khắp Việt Nam"*. Bản này làm đúng cái "đi" đó — có nhân vật,
có thế giới để bước vào, có người để gặp.

---

## 1. Bối cảnh — vì sao làm cái này

Nguyễn Ngọc Nguyên (mobile engineer, TP.HCM) muốn làm một việc cho cộng đồng: tuyên
truyền ý thức giữ vệ sinh và **phân loại rác đúng cách** ở Việt Nam.

Tuyên truyền kiểu cũ — khẩu hiệu, poster, bài giảng — lớp trẻ lướt qua. Nên thay vì
nói, ta cho họ **sống thử**: vào vai một người trẻ Việt Nam đi dọn rác từ phố cổ Hà
Nội tới Côn Đảo, gặp người dân, nhận việc, thấy nơi mình dọn đẹp dần lên.

**Kết quả mong muốn:** một người trẻ chơi vài buổi, và nhớ được ít nhất ba điều:
(1) pin không bỏ vào thùng rác thường, (2) chai nhựa mất khoảng 450 năm để phân hủy,
(3) rác phân loại đúng thì mới tái chế được.

**Thành công trông như thế nào:** game được chia sẻ tự nhiên vì người chơi muốn khoe
nhân vật và nơi mình vừa dọn sạch — không phải vì bị kêu gọi chia sẻ.

---

## 2. Mục tiêu / Không phải mục tiêu / Thất bại

### Mục tiêu
- **Có nhân vật để nhập vai.** Người chơi *đi* trong thế giới, không nhìn nó qua ô cửa.
- Chơi được bằng **một ngón tay**, cầm máy ngang hay dọc đều được.
- Kiến thức về rác **gài vào trong lúc chơi**, không phải màn hình text bắt đọc.
- **Nơi mình dọn đẹp lên trước mắt** — phần thưởng cảm xúc chính của game.
- Có lý do quay lại: khu vực mở dần, nhân vật lên cấp, sổ tay rác sưu tập dần.
- Chạy hoàn toàn trên trình duyệt. **Không backend, không tài khoản, không thu thập dữ liệu người chơi.**

### Không phải mục tiêu (giai đoạn này)
- Chiến đấu, kẻ địch, máu. Đây là game nhập vai **không chiến đấu**.
- Chơi mạng, bảng xếp hạng toàn quốc, tài khoản đăng nhập.
- Bản đồ điểm thu gom pin ngoài đời thật — dữ liệu khó xác thực, sai là phản tác dụng.
- Đa ngôn ngữ. Tiếng Việt trước; chuỗi tách ra file riêng để sau thêm dễ.
- App native iOS/Android.
- Thế giới mở liền mạch. Mỗi khu vực là một bản đồ nhỏ riêng, đi vào từ bản đồ Việt Nam.

### Thất bại (anti-goals) — làm được hết mà vẫn hỏng nếu:
- **Game có giọng lên lớp.** Người chơi cảm thấy bị dạy dỗ là họ đóng tab. Tông phải vui, tưng tửng, tự giễu.
- **Số liệu sai.** Một con số bị bắt bẻ là mất sạch uy tín. Xem Mục 12.
- **Đi lại thấy nặng nề.** Nhân vật lê bước, chạm không ăn, kẹt vào vật cản — game nhập vai mà đi không sướng thì hỏng từ gốc.
- **Nhặt rác thành việc vặt.** Nếu chỉ là lặp đi lặp lại không có gì thay đổi thì người chơi bỏ sau mười phút.
- **Tải chậm.** Mở từ link trên 4G, quá 3 giây là mất một nửa người chơi.

---

## 3. Thể loại và vòng lặp cốt lõi

**Thể loại:** nhập vai nhìn từ trên xuống (top-down), không chiến đấu, có nhiệm vụ và
tiến trình nhân vật. Gần với *Stardew Valley* ở nhịp điệu — việc nhỏ, làm đều, thấy nơi
mình sống đẹp dần — hơn là gần game hành động.

### Vòng lặp lớn (một buổi chơi, 10–20 phút)

```
Bản đồ Việt Nam → chọn khu vực → vào thế giới
    ↓
Gặp NPC → nhận nhiệm vụ ("dọn giúp bác con hẻm này")
    ↓
Đi quanh khu vực, nhặt rác vào ba lô
    ↓
Ba lô đầy → tới điểm tập kết → PHÂN LOẠI (đây là chỗ dạy)
    ↓
Nhận kinh nghiệm + tiền + độ sạch khu vực tăng
    ↓
Mua dụng cụ tốt hơn → nhặt nhanh hơn, xa hơn, nhiều hơn
    ↓
Độ sạch 100% → khu vực HỒI SINH (xám → có màu) → mở khu vực mới
```

### Vòng lặp nhỏ (10–30 giây, lặp liên tục)

1. Thấy một món rác trên đường
2. **Chạm vào nó** → nhân vật tự đi tới và nhặt
3. Dòng chữ nhỏ bay lên: `Ống hút nhựa · ~200 năm`
4. Ba lô đầy dần — thấy rõ còn mấy chỗ

> **Hai vòng lặp này là trái tim của game.** Vòng nhỏ phải sướng tay trước đã.
> Nếu đi lại và nhặt không đã thì mọi thứ xây lên trên đều vô nghĩa.

---

## 4. Quyết định kỹ thuật (đã chốt, không cần hỏi lại)

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| Ngôn ngữ | **TypeScript** (strict) | An toàn kiểu, agent sinh code chính xác hơn |
| Render | **Canvas 2D API thuần, KHÔNG dùng game engine** | Phaser/PixiJS thêm 200–900KB. Game này không cần vật lý, không cần shader |
| Build | **Vite** | Nhanh, output tĩnh |
| Deploy | **Vercel**, repo `github.com/threeng0227/rac-oi-ve-nha` | Tên miền `rac-oi-ve-nha.vercel.app`, dùng cố định cho `og:url` |
| Lưu dữ liệu | **`localStorage`**, có version & migration | Không backend. Không thu thập gì của người chơi |
| Đồ hoạ | **Vẽ bằng code, phong cách phẳng.** Nhân vật và rác là hình khối cơ bản | Không cần hoạ sĩ. `render/` tách hẳn khỏi logic để sau thay ảnh xịn mà không đụng gameplay |
| Font | **System font stack**, không tải font ngoài | Đã kiểm trên Android: dấu tiếng Việt dựng đúng |
| Âm thanh | SFX ngắn `.webm` ≤ 20KB/file. **Một bản nhạc nền chung** tải lười, ≤ 400KB. Chỉ nguồn CC0. Mặc định **tắt tiếng** | Trình duyệt mobile chặn autoplay |
| Test | **Vitest** cho logic thuần. Không test render | Test canvas rendering tốn hơn giá trị thu được |
| Hướng màn hình | **Cả ngang lẫn dọc. Không ép xoay** | Nhiều người bật khoá xoay và không biết tắt. Ép xoay là mất người chơi ở giây đầu |
| Kích thước gốc | **Cạnh NGẮN khung ảo luôn 720**, cạnh dài co giãn 1100–1800 | Cầm ngang ~1560×720, cầm dọc 720×~1560. Full màn ở cả hai |
| Camera | **Bám nhân vật, có vùng chết ở giữa** | Camera giật theo từng bước đi làm chóng mặt |
| Service worker / PWA | **KHÔNG làm** ở giai đoạn này | Kéo theo đồng bộ cache-version với migration `localStorage`, chưa đáng |

**Ngân sách hiệu năng (bắt buộc đạt):**
- JS bundle ≤ **300 KB gzip** *(nới từ 250 vì game nhập vai có nhiều hệ thống hơn)*
- Thời gian đến lúc chơi được ≤ **3 giây** trên 4G giả lập
- **60 fps** trên Android tầm trung (mốc tham chiếu: Redmi Note 11)
- Lighthouse Mobile Performance ≥ **90**

---

## 5. Luồng màn hình

```
BootScene ──▶ TitleScene ──▶ CharacterScene ──▶ MapScene ──▶ WorldScene
             (màn hình        (chọn nam/nữ,       (bản đồ VN,   (chơi thật)
              bắt đầu)         lần đầu thôi)       chọn vùng)        │
                                                        ▲            │
                                                        └────────────┘
                                                         rời khu vực
```

### 5.1 `TitleScene` — màn hình bắt đầu

Thứ đầu tiên người chơi thấy. Phải nói được game này là gì trong ba giây.

```
┌────────────────────────────────────────────┐
│                                            │
│            RÁC ƠI VỀ NHÀ                   │
│          Hành trình xuyên Việt             │
│                                            │
│            ┌──────────────┐                │
│            │   BẮT ĐẦU    │                │
│            └──────────────┘                │
│            ┌──────────────┐                │
│            │  CHƠI TIẾP   │  ← chỉ hiện khi có bản lưu
│            └──────────────┘                │
│                                            │
│        [ 📖 Sổ tay ]   [ 🔊 ]               │
│                                            │
│   nền: silhouette bản đồ VN chuyển động chậm│
└────────────────────────────────────────────┘
```

- **BẮT ĐẦU** → `CharacterScene` (xoá bản lưu cũ thì hỏi xác nhận trước)
- **CHƠI TIẾP** → thẳng vào `MapScene`, chỉ hiện khi `localStorage` có tiến trình
- **Sổ tay** → `HandbookScene`, xem được cả khi chưa chơi
- **Nút loa** → bật/tắt tiếng, trạng thái lưu lại

### 5.2 `CharacterScene` — chọn nhân vật

Hiện **một lần duy nhất** ở lần chơi đầu. Sau đó đổi được trong phần cài đặt.

```
┌────────────────────────────────────────────┐
│          CHỌN NHÂN VẬT CỦA BẠN             │
│                                            │
│     ┌──────────┐        ┌──────────┐       │
│     │          │        │          │       │
│     │   🧍‍♂️     │        │   🧍‍♀️     │       │
│     │          │        │          │       │
│     │   MINH   │        │   LAN    │       │
│     └──────────┘        └──────────┘       │
│                                            │
│       Tên của bạn: [ ____________ ]        │
│                                            │
│            ┌──────────────┐                │
│            │  BẮT ĐẦU ĐI  │                │
│            └──────────────┘                │
└────────────────────────────────────────────┘
```

**Hai nhân vật: Minh (nam) và Lan (nữ).**

> ⚠️ **Hai nhân vật có chỉ số GIỐNG HỆT NHAU.** Khác nhau chỉ ở hình vẽ và màu áo.
>
> Đây là quyết định có chủ ý, không phải lười. Gán "nam khoẻ hơn, nữ nhanh hơn" vào
> một game tuyên truyền cho học sinh là dạy các em một thứ mình không định dạy. Và nó
> còn làm việc cân bằng phức tạp gấp đôi mà không đổi lại được gì.

- Ô nhập tên: tối đa 12 ký tự, cho phép tiếng Việt có dấu. Bỏ trống thì lấy tên mặc định (Minh/Lan).
- Nhân vật đứng **nhúc nhích nhẹ** (thở, chớp mắt) — nhân vật đứng chết trông như ảnh tĩnh.
- Chạm vào nhân vật nào thì nhân vật đó sáng lên, cái kia mờ đi.

### 5.3 `MapScene` — bản đồ Việt Nam

```
┌────────────────────────────────────────────┐
│  👤 Minh  ·  Cấp 3  ·  💰 450đ      [⚙]    │
├────────────────────────────────────────────┤
│                   ╭─╮                      │
│                  ╭╯ ●  Hà Nội      ✅ 100% │
│                  │                         │
│                  ╰╮ ●  Hạ Long     🔓 40%  │
│                   │                        │
│                   ├ 🔒 Hội An              │
│                   │           · Hoàng Sa   │
│                   ╰╮ 🔒 Đà Lạt             │
│                    │                       │
│                    ╰╮🔒 TP.HCM             │
│                     │      · Trường Sa     │
│                     ╰ 🔒 Cà Mau            │
└────────────────────────────────────────────┘
```

⚠️ **Bản đồ BẮT BUỘC vẽ đầy đủ lãnh thổ Việt Nam, gồm hai quần đảo Hoàng Sa và
Trường Sa**, theo đúng chuẩn bản đồ hành chính Việt Nam.

Đây là game do người Việt làm, cho người Việt, về đất nước Việt Nam. Bản đồ thiếu
Hoàng Sa – Trường Sa sẽ bị chụp màn hình lan truyền — rủi ro ngang với đưa sai số
liệu, và không sửa được sau khi đã lan.

Cách vẽ: đường bờ biển path đơn giản hoá (≤ 120 điểm), hai quần đảo vẽ thành cụm chấm
nhỏ ngoài khơi kèm nhãn chữ.

**Mỗi khu vực là một chấm trên bản đồ:**

| Trạng thái | Hiện ra sao | Chạm vào thì |
|---|---|---|
| 🔒 Chưa mở | Chấm xám, có ổ khoá | Hiện "Cần dọn sạch {vùng trước} tới 80%" |
| 🔓 Đang mở | Chấm sáng, có vòng tiến trình quanh nó | Vào thẳng `WorldScene` |
| ✅ Đã sạch | Chấm xanh, có dấu tích, vùng xung quanh có màu | Vào lại được, nhặt lai rai, đổi cảnh |

**Mở khoá tuần tự từ Bắc vào Nam.** Dọn vùng hiện tại đạt **80%** thì mở vùng kế tiếp —
không bắt 100%, vì bắt hoàn hảo mới đi tiếp là cách nhanh nhất làm người chơi chán.

Bản đồ cũng là chỗ thấy rõ nhất tiến trình: vùng đã sạch thì **có màu**, vùng chưa thì
**xám**. Chơi càng lâu, Việt Nam trên bản đồ càng sáng lên.

---

## 6. Nhân vật và điều khiển

### 6.1 Di chuyển — chạm để đi, không joystick

**Cách chính: chạm vào đâu thì nhân vật đi tới đó.**

- Chạm **nền đất** → nhân vật đi tới điểm đó rồi dừng
- Chạm **món rác** → nhân vật đi tới, tự nhặt khi tới nơi
- Chạm **NPC** → đi tới, tự bắt chuyện khi tới nơi
- **Giữ và kéo** → nhân vật đi theo ngón tay liên tục (khi cần né hoặc chỉnh vị trí)

> **Vì sao không làm joystick ảo:** joystick ăn một góc màn hình, bắt buộc cầm hai tay,
> và trên màn cảm ứng luôn kém hơn joystick thật. Chạm-để-đi chơi được bằng một ngón
> cái, hợp với nhịp chậm rãi của game này.

**Tìm đường:** bản đồ chia ô lưới, ô nào đi được ô nào không. Dùng A* đơn giản. Nhân
vật phải **tự đi vòng qua vật cản**, không được kẹt vào tường — kẹt một lần là người
chơi mất lòng tin vào điều khiển.

### 6.2 Chỉ số nhân vật

| Chỉ số | Khởi điểm | Tăng bằng cách |
|---|---|---|
| **Cấp độ** | 1 | Kinh nghiệm từ nhặt và phân loại đúng |
| **Sức chứa ba lô** | 8 món | Mua ba lô tốt hơn |
| **Tầm với** | 60 đơn vị | Mua kẹp gắp rác |
| **Tốc độ đi** | 180 đv/giây | Mua giày |
| **Thể lực** | 100 | Lên cấp |

### 6.3 Thể lực — thay cho đồng hồ đếm ngược

**Không có đồng hồ đếm ngược trong game này.** Đếm ngược tạo áp lực, mà áp lực thì
chống lại việc khám phá — thứ mà game nhập vai sống nhờ nó.

Thay vào đó: **thể lực**. Mỗi món rác nhặt lên tốn 1 thể lực. Hết thể lực thì nhân vật
đi chậm lại và không nhặt được nữa, phải:

- Về **điểm tập kết** phân loại rác (hồi 30 thể lực) — khuyến khích đi phân loại thường xuyên thay vì ôm đầy ba lô
- Hoặc ngồi nghỉ ở **ghế đá / quán nước** (hồi đầy, mất 10 giây thật)
- Hoặc mua **nước mía** ở cửa hàng (hồi đầy ngay, tốn tiền)

Thể lực hồi đầy mỗi lần vào lại khu vực. Đây là cái phanh nhẹ nhàng, không phải hình phạt.

---

## 7. Thế giới — mười khu vực

Mỗi khu vực là **một bản đồ nhỏ đi lại được**, cỡ khoảng 3–4 màn hình, không phải
thế giới mở liền mạch.

| # | Khu vực | Mở khi | Bối cảnh đi lại được | Rác đặc trưng |
|---|---|---|---|---|
| 1 | **Phố cổ Hà Nội** | Từ đầu | Vỉa hè, quán trà đá, ngõ nhỏ, hồ Gươm | cốc trà đá, giấy, vỏ chuối, túi nilon |
| 2 | **Vịnh Hạ Long** | HN ≥ 80% | Bãi biển, cầu tàu, thuyền, hang | chai nhựa, hộp xốp, lưới đánh cá |
| 3 | **Phố cổ Hội An** | HL ≥ 80% | Phố đèn lồng, bờ sông Hoài, chợ | túi nilon, cốc nhựa, hoa đăng, ống hút |
| 4 | **Đà Lạt** | HA ≥ 80% | Hồ Xuân Hương, đồi thông, chợ đêm | vỏ bắp, ly sữa đậu nành, lon, khẩu trang |
| 5 | **Đêm nhạc hội** ⭐ | ĐL ≥ 80% | Sân khấu, khu khán giả, hậu trường | cốc nhựa, **lightstick**, áo mưa giấy, băng rôn |
| 6 | **Kênh Nhiêu Lộc** | NH ≥ 80% | Bờ kênh, cầu, công viên, có **thuyền** | hộp xốp, túi nilon, chai, dép đứt |
| 7 | **Chợ nổi Cái Răng** | NL ≥ 80% | Bến, ghe thuyền, chợ nổi | vỏ trái cây, lá chuối, bã mía |
| 8 | **Giao thừa Nguyễn Huệ** | CR ≥ 80% | Phố đi bộ sau pháo hoa, sân khấu | lon bia, que xiên, cành mai, vỏ hạt dưa |
| 9 | **Ruộng bậc thang Sa Pa** | GT ≥ 80% | Ruộng, bản làng, đường núi | chai nhựa, vỏ bánh kẹo, **pin máy ảnh** |
| 10 | **Côn Đảo** | SP ≥ 80% | Bãi rùa đẻ, rạn san hô, rừng | lưới ma, ống hút, túi nilon, vi nhựa |

### 7.1 Độ sạch khu vực

Mỗi khu vực có một **thanh độ sạch 0–100%**, không reset khi rời đi.

```
độ sạch = số món đã PHÂN LOẠI ĐÚNG / tổng số món khu vực đó sinh ra
```

Rác **sinh lại từ từ** (khoảng 1 món mỗi 20 giây, dừng khi đạt 100%) — thế giới sống,
không phải bãi rác tĩnh. Nhưng tốc độ sinh luôn thấp hơn tốc độ dọn, nên người chơi
luôn thấy mình tiến lên.

**Khu vực đổi hình theo độ sạch** — đây là phần thưởng cảm xúc chính:

| Độ sạch | Khu vực trông thế nào |
|---|---|
| 0–30% | Xám xịt (`desaturate` 0.7), trời âm u, không có người qua lại |
| 30–60% | Màu nhạt dần lên, vài người đi bộ xuất hiện |
| 60–80% | Gần đủ màu, có chim, có tiếng động vui |
| 80–100% | Đủ màu, trời sáng, người bán hàng, trẻ con chơi, hoa nở |
| 100% | Cảnh "hồi sinh": chuyển trong 3 giây, nhạc nổi lên, NPC vỗ tay |

Chuyển bằng `desaturate()` và `mix()` trên chính bảng màu khu vực — **không làm bộ
ảnh thứ hai**. Hàm đó đã có sẵn trong `src/render/palette.ts`.

---

## 8. Cơ chế nhặt và phân loại

### 8.1 Nhặt rác

1. Món rác nằm trên mặt đất, có **viền sáng nhẹ** khi nhân vật tới gần tầm với
2. Chạm vào → nhân vật đi tới → nhặt (0.3 giây, có hoạt ảnh cúi xuống)
3. Rác bay vào ba lô, `+2 kinh nghiệm`, `−1 thể lực`
4. Dòng chữ nhỏ bay lên: `Ống hút nhựa · ~200 năm`
5. Ba lô đầy → chạm rác thì hiện "Ba lô đầy rồi — tới điểm tập kết đi"

**Rác nguy hại (pin, lightstick, bóng đèn):** viền **vàng nhấp nháy**. Chưa có găng
tay thì nhặt được nhưng `−3 thể lực`; có găng tay thì như bình thường.

### 8.2 Điểm tập kết — đây là chỗ DẠY

Mỗi khu vực có **1–2 điểm tập kết** (xe rác, nhà tập kết, thuyền gom rác). Chạm vào
để mở bảng phân loại.

```
┌──────────────────────────────────────────────┐
│  PHÂN LOẠI RÁC                      [✕]      │
├──────────────────────────────────────────────┤
│  Ba lô:  🥤 🍌 🔋 🧴 📰 🥫 ( 6/8 )            │
│          ↑ kéo từng món xuống thùng đúng     │
├────────────┬────────────┬────────────────────┤
│ ♻️ TÁI CHẾ │ 🍎 THỰC PHẨM│ 🗑 KHÁC            │
└────────────┴────────────┴────────────────────┘
│  ☢️ Hộp rác nguy hại  ← chỉ hiện khi ba lô có │
└──────────────────────────────────────────────┘
```

- **Đúng** → `+10 kinh nghiệm`, `+tiền`, độ sạch khu vực tăng, thùng nảy lên
- **Sai** → `−5 kinh nghiệm`, thùng rung đỏ, hiện ngay: `Ống hút nhựa thuộc nhóm KHÁC`, **món rác quay lại ba lô** để thử lại
- Phân loại xong hết → `+30 thể lực`, đóng bảng

> **Sai thì không mất rác, chỉ mất điểm.** Game này dạy phân loại — bắt người chơi
> làm lại cho đúng mới là dạy. Vứt món rác đi là bỏ lỡ đúng khoảnh khắc họ đang chú ý.

### 8.3 ⭐ Rác nguy hại KHÔNG thuộc thùng nào

Ba nhóm thùng theo Luật Bảo vệ môi trường 2020 (phân loại tại nguồn từ 01/01/2025):

| Thùng | `binId` | Màu | Gồm |
|---|---|---|---|
| **Tái chế** | `recycle` | Xanh dương `#2e7dd1` | chai nhựa PET, lon nhôm, giấy, bìa carton, chai thủy tinh |
| **Thực phẩm** | `food` | Xanh lá `#3da35d` | vỏ chuối, vỏ trái cây, thức ăn thừa, lá chuối, bã mía |
| **Khác** | `other` | Xám `#6b7280` | túi nilon, hộp xốp, ống hút, tàn thuốc, khẩu trang, tã bỉm |

**Pin, lightstick, bóng đèn → `hazard`. Không thuộc ba thùng trên.**

- Hộp thu gom nguy hại màu vàng **chỉ hiện khi trong ba lô có món nguy hại**
- Bỏ đúng → `+40 kinh nghiệm`, hiện thẻ kiến thức giữa màn hình 2 giây
- Bỏ vào ba thùng kia → `−20 kinh nghiệm`, hiện: **"Pin KHÔNG thuộc thùng nào cả. Pin phải mang tới điểm thu gom riêng."** Món pin quay lại ba lô.

> Đây là bài học khó nhất và quan trọng nhất của game. Người chơi phải **làm sai một
> lần** thì mới nhớ. Đừng làm nó dễ, và đừng bỏ qua nó.

---

## 9. Nhiệm vụ và NPC

### 9.1 Vì sao cần NPC

Không có NPC thì đây chỉ là nhặt rác trong một thị trấn ma. **Người dân chính là lý do
dọn rác có nghĩa** — và là cách đưa kiến thức vào mà không thành bài giảng.

Mỗi khu vực có **3–5 NPC**. Chạm vào để nói chuyện.

### 9.2 Ba loại nhiệm vụ

| Loại | Ví dụ | Thưởng |
|---|---|---|
| **Chính** (1 mỗi khu vực) | "Dọn khu này sạch 80% giúp bác" | Mở khu vực mới |
| **Phụ** (2–4 mỗi khu vực) | "Tìm giúp cô 5 viên pin cũ, đừng vứt bậy" | Tiền + kinh nghiệm |
| **Vặt** (sinh ngẫu nhiên) | "Con chó nhà tôi nuốt túi nilon!" | Kinh nghiệm + thẻ sổ tay |

### 9.3 NPC mẫu — khu vực 1, Phố cổ Hà Nội

| NPC | Là ai | Nhiệm vụ | Giọng |
|---|---|---|---|
| **Bác Tám** | Tổ trưởng dân phố, ngồi ghế đá | Nhiệm vụ chính: dọn ngõ sạch 80% | Nói nhiều, tốt bụng, hay kể chuyện ngày xưa |
| **Cô Hoa** | Bán trà đá vỉa hè | Phụ: gom 10 cốc nhựa — "cô bán mà cô cũng ngại" | Thật thà, tự nhận mình cũng có lỗi |
| **Thằng Tí** | Học sinh cấp 2 | Phụ: thi xem ai nhặt nhanh hơn | Láu cá, trêu người chơi |
| **Bà ve chai** | Đi bộ quanh khu | Đổi rác tái chế lấy tiền (giá tốt hơn điểm tập kết) | Ít nói, cười hiền |

> **Luật viết thoại:** NPC **không bao giờ giảng đạo**. Họ nhờ vả, than phiền, kể
> chuyện, trêu chọc. Kiến thức đi ra từ hoàn cảnh của họ, không từ lời khuyên của họ.
>
> ❌ "Bạn biết không, túi nilon mất 10–20 năm để phân hủy đấy!"
> ✅ "Cái cống này tắc suốt. Tháng trước mưa to, nước ngập tới đầu gối. Toàn túi nilon chứ gì nữa."

### 9.4 Sự kiện bất ngờ

Sinh ngẫu nhiên trong lúc chơi, báo trước bằng toast + rung nhẹ.

| `eventId` | Chuyện gì xảy ra | Người chơi làm gì |
|---|---|---|
| `MUA_BAO` | Mưa ập xuống, rác trôi dạt theo nước | Nhặt nhanh trước khi trôi mất, điểm ×1.5 |
| `CUU_SINH_VAT` | Con chó / bò / rùa đang nuốt túi nilon | Chạy tới, chạm liên tục 5 lần để gỡ. `+100 kn` |
| `BAC_VE_CHAI` | Bà ve chai đi ngang 30 giây | Bán rác tái chế được giá gấp đôi |
| `NEM_RAC` | Người đi xe máy ném rác ra đường | Đuổi theo chạm vào → họ quay lại nhặt. `+30 kn` |
| `DAM_DONG_TAN` | Đám đông vừa giải tán (màn 5, 8) | Rác đổ xuống ồ ạt trong 20 giây |
| `BAI_RAC_TU_PHAT` | Đống rác lớn xuất hiện ở góc khuất | Chạm 8 lần để phá, bung ra 15–20 món |
| `PIN_ROI` | Ai đó làm rơi hộp pin cũ | 3–4 món nguy hại xuất hiện cùng lúc |
| `TRE_CON_HOC` | Trẻ con chạy theo bắt chước nhặt rác | Nhặt cùng, tốc độ ×2 trong 30 giây |

`TRE_CON_HOC` là sự kiện mình thích nhất — nó nói đúng điều game muốn nói, mà không
cần nói ra câu nào.

---

## 10. Tiến trình

### 10.1 Cấp độ

| Nguồn kinh nghiệm | Điểm |
|---|---|
| Nhặt một món rác | +2 |
| Phân loại đúng | +10 |
| Phân loại đúng rác nguy hại | +40 |
| Hoàn thành nhiệm vụ phụ | +50 |
| Hoàn thành nhiệm vụ chính | +200 |
| Mở thẻ sổ tay mới | +25 |

Cấp `n` cần `100 × n^1.5` kinh nghiệm. Mỗi cấp: `+10` thể lực tối đa.

### 10.2 Tiền và cửa hàng

Tiền từ phân loại đúng (1–3đ mỗi món, rác tái chế được giá hơn) và bán cho bà ve chai.

| Món | Giá | Tác dụng |
|---|---|---|
| Găng tay | 100đ | Nhặt rác nguy hại không tốn thêm thể lực |
| Kẹp gắp rác | 250đ | Tầm với 60 → 110 |
| Giày tốt | 300đ | Tốc độ đi 180 → 240 |
| Ba lô lớn | 400đ | Sức chứa 8 → 14 |
| Xe đẩy | 800đ | Sức chứa 14 → 24, nhưng đi chậm hơn 15% |
| Nước mía | 20đ | Hồi đầy thể lực ngay |

> **Mỗi món đồ phải đổi được cảm giác chơi, không chỉ đổi con số.** Kẹp gắp làm nhặt
> đỡ phải đi sát. Xe đẩy đổi tốc độ lấy sức chứa — người chơi phải chọn. Đó là chỗ
> game nhập vai hay hơn game arcade.

### 10.3 Sổ tay rác

24 loại rác. Nhặt-và-phân-loại-đúng lần đầu → mở một thẻ. Mở đủ 24 thẻ → danh hiệu
"Người hiểu rác".

Xem đầy đủ ở Mục 11.

---

## 11. Sổ tay rác — 24 loại

Mỗi loại nhặt-và-phân-loại-đúng lần đầu thì mở một thẻ trong sổ tay.

### 11.1 Danh sách chính thức 24 loại rác

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

### 11.2 Cổng kiểm chứng số liệu

`scripts/verify-facts.ts` chạy ở `prebuild`. Nó **không chặn loại rác**, nó **chặn con
số chưa có nguồn**:

| Trạng thái | Trong game | Trong sổ tay |
|---|---|---|
| `verified: true` | Xuất hiện bình thường | Hiện đầy đủ, có link nguồn |
| `verified: false` | **Vẫn xuất hiện bình thường** | Ô "Phân hủy" hiện `⏳ Đang xác minh nguồn` thay cho con số |

Build **fail** khi và chỉ khi: một `TrashType` có `verified: false` mà vẫn hiển thị
`decomposeLabel`, **hoặc** có `verified: true` mà `source.url` rỗng / không hợp lệ.

```ts
export interface TrashType {
  id: string;
  name: string;
  bin: 'recycle' | 'food' | 'other' | 'hazard';
  decomposeLabel: string;        // LUÔN ghi dạng khoảng/xấp xỉ
  harm: string;                  // 1–2 câu, hậu quả cụ thể, KHÔNG chứa số
  tip: string;                   // việc làm được trong tuần này, KHÔNG chứa số
  source: { label: string; url: string };
  verified: boolean;
  sprite: SpriteId;
  size: 'small' | 'medium' | 'large';
  variants?: { id: string; label: string; sprite: SpriteId }[];
}
```

> **Biến thể hình vẽ:** cốc trà đá, vỏ bắp nướng, hoa đăng giấy, dép đứt, cành mai gãy…
> **không phải loại rác mới** — chúng là `variants` của 24 loại trên. Sổ tay luôn đúng
> 24 thẻ. Muốn thêm hình thì thêm variant, không thêm type.

### 11.3 Nội dung 24 thẻ — viết sẵn, dùng nguyên văn

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

> **Về nguồn:** cổng kiểm chứng ở Mục 11.2 chỉ soi `decomposeLabel`. Câu `harm` và `tip`
> là mô tả định tính đã được thừa nhận rộng rãi, không cần nguồn cấp một — **nhưng
> cũng không được chứa con số**. Thấy ai thêm số vào hai trường đó thì chặn lại.

---

---

## 12. ⚠️ Quy tắc về số liệu — ĐỌC KỸ, ĐÂY LÀ GAME TUYÊN TRUYỀN

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
3. Nếu không tìm được → đặt `verified: false`. Loại rác đó **vẫn vào game**, nhưng sổ tay hiện `⏳ Đang xác minh nguồn` thay cho con số (Mục 11.2).
4. Thà ít fact mà đúng còn hơn nhiều fact mà sai.

---

---

## 13. Kiến trúc mã nguồn

```
rac-oi-ve-nha/
├─ index.html
├─ vite.config.ts · tsconfig.json · package.json
├─ public/og-image.png · public/audio/
├─ scripts/verify-facts.ts        # cổng kiểm chứng số liệu, chạy prebuild
└─ src/
   ├─ main.ts
   ├─ core/                       # ✅ ĐÃ XONG, KHÔNG SỬA (trừ Layout)
   │  ├─ Game.ts                  # vòng lặp fixed-timestep + SceneManager
   │  ├─ Viewport.ts              # khung ảo co giãn, cả ngang lẫn dọc
   │  ├─ Input.ts                 # Pointer Events → toạ độ ảo
   │  ├─ Renderer.ts  Tween.ts  Storage.ts  Random.ts
   │  ├─ Layout.ts                # ⚠️ VIẾT LẠI: HUD + panel, không còn 4 dải arcade
   │  ├─ Camera.ts                # 🆕 bám nhân vật, có vùng chết
   │  └─ Pathfinding.ts           # 🆕 A* trên lưới ô
   ├─ scenes/
   │  ├─ BootScene.ts             # nạp dữ liệu, thanh tiến trình
   │  ├─ TitleScene.ts            # 🆕 màn hình bắt đầu (Mục 5.1)
   │  ├─ CharacterScene.ts        # 🆕 chọn Minh/Lan, đặt tên (Mục 5.2)
   │  ├─ MapScene.ts              # bản đồ VN, chọn khu vực (Mục 5.3)
   │  ├─ WorldScene.ts            # ⭐ chơi thật — file lớn nhất, CHỈ ĐIỀU PHỐI
   │  ├─ SortingScene.ts          # bảng phân loại (overlay trên WorldScene)
   │  ├─ DialogueScene.ts         # hộp thoại NPC (overlay)
   │  ├─ ShopScene.ts             # cửa hàng dụng cụ
   │  └─ HandbookScene.ts         # sổ tay rác
   ├─ world/
   │  ├─ TileMap.ts               # lưới ô, ô nào đi được
   │  ├─ Player.ts                # nhân vật: vị trí, hướng, hoạt ảnh, chỉ số
   │  ├─ Npc.ts  TrashNode.ts  CollectPoint.ts
   │  ├─ TrashSpawner.ts          # sinh lại rác từ từ
   │  └─ AreaState.ts             # độ sạch, rác đã dọn, nhiệm vụ của một khu vực
   ├─ systems/
   │  ├─ InventorySystem.ts       # ba lô
   │  ├─ StaminaSystem.ts         # thể lực
   │  ├─ ProgressSystem.ts        # kinh nghiệm, cấp độ
   │  ├─ EconomySystem.ts         # tiền, mua bán
   │  ├─ QuestSystem.ts           # nhận, theo dõi, hoàn thành nhiệm vụ
   │  ├─ CleanlinessSystem.ts     # độ sạch khu vực
   │  └─ EventSystem.ts           # 8 sự kiện bất ngờ
   ├─ data/
   │  ├─ trashTypes.ts            # 24 loại (Mục 11)
   │  ├─ areas.ts                 # 10 khu vực: bản đồ ô, NPC, điểm tập kết
   │  ├─ npcs.ts  quests.ts  dialogues.ts
   │  ├─ characters.ts            # Minh, Lan
   │  ├─ shopItems.ts  facts.ts
   ├─ render/
   │  ├─ palette.ts               # ✅ ĐÃ XONG, KHÔNG SỬA
   │  ├─ trashSprites.ts  characterSprites.ts  tiles.ts  particles.ts
   ├─ ui/
   │  ├─ Button.ts  Panel.ts  Toast.ts  Bar.ts  DialogueBox.ts  ShareCard.ts
   ├─ i18n/vi.ts                  # ⚠️ MỌI chuỗi hiển thị nằm ở đây
   └─ styles/global.css
```

### Nguyên tắc bắt buộc

1. **Không chiều nào cố định.** Cạnh ngắn khung ảo là 720, cạnh dài co giãn 1100–1800,
   **cầm ngang hay dọc đều phải chơi được**. Toạ độ giao diện lấy từ `Layout`, toạ độ
   thế giới lấy từ `Camera`. Không viết số cứng.
2. **Không hardcode mã màu.** Lấy từ `src/render/palette.ts`.
   Kiểm: `grep -rnE '#[0-9a-fA-F]{6}' src --include='*.ts' | grep -v palette.ts` phải không ra gì.
3. **Mọi chuỗi tiếng Việt nằm ở `src/i18n/vi.ts`.** Kể cả thoại NPC.
4. **Không thêm game engine, không thêm thư viện.** Canvas 2D thuần.
5. **`WorldScene.ts` chỉ điều phối.** Logic nằm trong `world/` và `systems/`.
   Vượt 400 dòng thì tách.
6. **Mỗi `systems/*` phải test được trên Node**, không phụ thuộc DOM hay canvas.
7. **Test trước, code sau.** Viết test → chạy cho nó đỏ → rồi mới viết code.
8. **Mọi `requestAnimationFrame`, tween, listener phải huỷ khi rời scene** (`exit()`).

### Dữ liệu lưu

```ts
export interface SaveData {
  version: 2;
  player: {
    characterId: 'minh' | 'lan';
    name: string;
    level: number;
    xp: number;
    money: number;
    maxStamina: number;
    tools: string[];              // id dụng cụ đã mua
  };
  areas: Record<string, {
    unlocked: boolean;
    cleanliness: number;          // 0–100
    totalSpawned: number;
    totalSorted: number;
  }>;
  quests: Record<string, {
    state: 'chua-nhan' | 'dang-lam' | 'xong';
    progress: number;
  }>;
  handbook: string[];             // id loại rác đã mở
  stats: { totalTrash: number; totalCorrect: number; veChaiSold: number };
  settings: { muted: boolean };
}
```

Key: `racoivenha.save`. **Bản lưu version 1 (bản arcade) không chuyển đổi được** — cấu
trúc khác hẳn. Gặp `version: 1` thì bỏ và tạo mới, không cố đoán. Bọc mọi truy cập
`localStorage` trong `try/catch`.

---

## 14. Năm chặng thực hiện

### Chặng 1 — Dữ liệu và khung màn hình
- `src/data/trashTypes.ts` — đủ 24 loại, dùng nguyên văn Mục 11
- `src/data/characters.ts`, `shopItems.ts`, `facts.ts`
- `scripts/verify-facts.ts` nối vào `prebuild`
- `TitleScene`, `CharacterScene`, `MapScene` — đi lại được giữa ba màn hình, lưu lựa chọn

**Xong khi:** mở game chọn được nhân vật, đặt tên, thấy bản đồ Việt Nam có Hoàng Sa –
Trường Sa, chọn khu vực đầu tiên. Chưa cần vào được thế giới.

### Chặng 2 — Thế giới chơi được (quan trọng nhất)
- `Camera`, `Pathfinding`, `TileMap`, `Player`
- **Chỉ khu vực 1 (Phố cổ Hà Nội)**
- Chạm để đi, chạm rác để nhặt, ba lô, thể lực
- `CollectPoint` + `SortingScene` + độ sạch khu vực
- Cảnh đổi màu theo độ sạch

**🛑 DỪNG Ở ĐÂY. Báo cho người giao việc chơi thử trước khi đi tiếp.**
Đây là chỗ duy nhất quyết định game có vui hay không. Đi lại có sướng tay không, nhặt
có đã không — test không trả lời được, chỉ ngón tay người chơi trả lời được.

### Chặng 3 — Người và nhiệm vụ
- `Npc`, `DialogueScene`, `QuestSystem`
- 4 NPC + 1 nhiệm vụ chính + 3 nhiệm vụ phụ cho khu vực 1
- `EventSystem` + 4 sự kiện: `NEM_RAC`, `BAC_VE_CHAI`, `CUU_SINH_VAT`, `TRE_CON_HOC`

### Chặng 4 — Tiến trình
- `ProgressSystem` (kinh nghiệm, cấp độ), `EconomySystem`, `ShopScene`
- 6 món dụng cụ, mỗi món đổi được cảm giác chơi
- `HandbookScene` + đủ 24 thẻ
- Mở khoá khu vực theo độ sạch 80%

### Chặng 5 — Đủ bộ
- 9 khu vực còn lại + `tiles.ts` cho từng vùng
- 4 sự kiện còn lại
- `ShareCard` 1080×1080 — nhân vật + nơi vừa dọn + độ sạch
- Âm thanh CC0, thẻ Open Graph, tối ưu đạt ngân sách Mục 4

---

## 15. Tiếp cận và riêng tư

### Tiếp cận
- Vùng chạm nhỏ nhất **44×44 px thật**
- Thùng rác phân biệt bằng **màu + biểu tượng + chữ**, không chỉ bằng màu
- Chữ nhỏ nhất **14px thật**
- Tôn trọng `prefers-reduced-motion`: giảm particle, bỏ rung màn hình
- Game chơi được bình thường khi tắt tiếng
- **Không có thao tác nào cần hai ngón cùng lúc**

### Riêng tư
- **Không analytics, không cookie, không tracking.** Mọi dữ liệu nằm trong `localStorage`.
- Tên người chơi nhập vào **không bao giờ rời khỏi máy họ**.

### SEO & chia sẻ
- `<title>`: `Rác Ơi Về Nhà — Game nhập vai nhặt rác xuyên Việt`
- `og:image` 1200×630, `twitter:card = summary_large_image`, `lang="vi"`

---

## 16. Kiểm chứng

### Test tự động — `npm test`
Chỉ test logic thuần, không test render:

- `InventorySystem`: ba lô không bao giờ kẹt; đầy thì từ chối nhận; món nguy hại quay lại được
- `StaminaSystem`: không âm; hồi đúng khi phân loại; hết thì chặn nhặt
- `ProgressSystem`: ngưỡng cấp độ; kinh nghiệm không âm
- `EconomySystem`: không mua được khi thiếu tiền; mua rồi không mất món
- `CleanlinessSystem`: độ sạch trong [0,100]; không giảm khi rời khu vực
- `QuestSystem`: không nhận trùng; hoàn thành đúng điều kiện; lưu/đọc khứ hồi
- `Pathfinding`: tìm được đường quanh vật cản; **không có đường thì trả về rỗng, không treo**
- `TrashSpawner`: phân bố đúng trọng số (RNG có seed, 10.000 mẫu); dừng khi đạt 100%
- Ánh xạ rác→thùng: món `hazard` không khớp bất kỳ thùng nào trong ba thùng
- `Storage`: migration; dữ liệu hỏng → mặc định, không văng lỗi; **version 1 bị bỏ đúng cách**
- `verify-facts`: fail đúng theo luật Mục 11, và **chỉ** theo luật đó

### Checklist thủ công — mỗi chặng đều phải đi qua
- [ ] Chơi trọn một khu vực trên **iPhone Safari** và **Chrome Android** thật
- [ ] **Cầm dọc chơi được, cầm ngang chơi được**, xoay giữa chừng không vỡ
- [ ] Nhân vật **không bao giờ kẹt** vào tường hay vật cản
- [ ] Chạm liên tục nhiều chỗ — nhân vật đổi hướng mượt, không khựng
- [ ] Khoá máy giữa chừng, mở lại → game tạm dừng, không chạy ngầm
- [ ] Chế độ ẩn danh (localStorage bị chặn) → vẫn chơi được, không văng lỗi
- [ ] **Cố tình bỏ pin vào thùng tái chế** → thông báo rõ ràng, pin quay lại ba lô
- [ ] Dọn khu vực lên 100% → cảnh hồi sinh chạy mượt
- [ ] Mở sổ tay → mọi thẻ đã mở có nguồn bấm được
- [ ] Dán link vào Messenger/Zalo → hiện ảnh preview đúng
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 90

### Đo bằng số
```bash
npm run build && du -sh dist/assets/*.js    # ≤ 300KB gzip
```
Chrome DevTools → Performance, throttle CPU ×4 → giữ 60fps ở khu vực đông rác nhất.

---

## 17. Những chỗ để trống — người implement tự quyết

Được tự quyết, nhưng **phải ghi lại** vào Mục 18 để người khác soát:

- **Thoại chi tiết của NPC.** Mục 9.3 cho nhân thân và giọng; câu chữ cụ thể thì viết
  theo luật ở Mục 9.3 — NPC nhờ vả và than phiền, không giảng đạo.
- **Bố cục ô của từng khu vực** — chỗ nào đi được, NPC đứng đâu, điểm tập kết ở đâu.
- **`facts.ts`** — câu hiện khi dọn xong một khu vực.
- **Hoạt ảnh nhân vật** — mấy khung hình cho bước đi, cúi nhặt.
- **Màn hình hết thể lực** — nhắc nhẹ, đừng làm thành hình phạt.
- **Chơi lại khu vực đã sạch** — gợi ý: rác sinh lại chậm hơn hẳn, chủ yếu để nhặt lai rai.

---

## 18. Những chỗ tôi (Claude) tự quyết — Nguyên soát lại giúp

1. **Chạm-để-đi thay vì joystick ảo** — chơi được một ngón, hợp nhịp chậm của game.
2. **Thể lực thay cho đồng hồ đếm ngược** — đếm ngược chống lại việc khám phá.
3. **Hai nhân vật chỉ số giống hệt nhau**, khác mỗi hình vẽ. Gán "nam khoẻ, nữ nhanh"
   vào game cho học sinh là dạy một thứ mình không định dạy.
4. **Phân loại sai thì rác quay lại ba lô**, chỉ mất điểm. Bắt làm lại cho đúng mới là dạy.
5. **Mở khu vực mới ở 80%, không phải 100%** — bắt hoàn hảo mới đi tiếp là cách nhanh
   nhất làm người chơi chán.
6. **Rác sinh lại từ từ** (1 món / 20 giây) — thế giới sống, nhưng luôn chậm hơn tốc độ dọn.
7. **Chỉ 3 loại rác nguy hại** (pin, lightstick, bóng đèn) — ít mà đậm.
8. **Mười khu vực, mỗi khu 3–4 màn hình**, không làm thế giới mở liền mạch.
9. **Ngân sách bundle nới từ 250 lên 300 KB gzip** — game nhập vai nhiều hệ thống hơn.
10. **Bản lưu version 1 bị bỏ, không chuyển đổi** — cấu trúc khác hẳn, đoán mò còn tệ hơn.
11. **Sự kiện `TRE_CON_HOC`** (trẻ con chạy theo bắt chước nhặt rác) — tôi tự thêm. Nó
    nói đúng điều game muốn nói mà không cần nói ra câu nào.
12. **Bản đồ phải có Hoàng Sa – Trường Sa** — không phải chi tiết nhỏ.

---

## 19. Phần nào của bản 1 còn dùng được

Bản 1 thiết kế thành game arcade. Đổi sang nhập vai thì:

### ✅ Giữ nguyên, đã có test xanh
- `src/core/Game.ts` — vòng lặp fixed-timestep + SceneManager
- `src/core/Viewport.ts` — khung ảo co giãn, chạy cả ngang lẫn dọc
- `src/core/Input.ts` — Pointer Events → toạ độ ảo
- `src/core/Tween.ts`, `Storage.ts`, `Random.ts`, `Renderer.ts`
- `src/render/palette.ts` — bảng màu + `mix`/`desaturate`/`contrastRatio`
- **Mục 11 và 12 của tài liệu này** — 24 loại rác và quy tắc số liệu, nguyên vẹn

### ⚠️ Viết lại
- `src/core/Layout.ts` — bốn dải arcade không còn đúng. Giờ cần: HUD phủ lên thế giới,
  và các panel (phân loại, thoại, cửa hàng) dạng modal.
- `src/scenes/BootScene.ts` — thành màn nạp dữ liệu thật

### ❌ Bỏ hẳn
- Túi 6 ô kéo-thả-vào-ba-thùng ngay trên màn chơi
- Màn chơi 60–90 giây có đồng hồ đếm ngược
- Thanh ô nhiễm, hệ thống sao 1–2–3
- Bảng số liệu `spawnRatePerSec` của bản 1
