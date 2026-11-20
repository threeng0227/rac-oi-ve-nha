/** Mọi chuỗi hiển thị nằm ở đây. Không hardcode tiếng Việt trong scene. */
export const vi = {
  verifyingSource: '⏳ Đang xác minh nguồn',
  appTitle: 'Rác Ơi Về Nhà',
  appSubtitle: 'Hành trình xuyên Việt',
  bootHint: 'Chạm thử — xoay máy kiểu gì cũng chơi được',
  bootStatus: 'Đang dựng — lớp core đã xong',
  tutorialPick: 'Chạm vào vỏ chuối để nhặt',
  tutorialSort: 'Kéo vỏ chuối từ túi vào thùng Thực phẩm',
  playHint: 'Chạm để nhặt · Kéo từ túi xuống thùng',
  bagFull: 'Túi đầy rồi — kéo rác xuống thùng để có chỗ nhé',
  timeUp: 'Phố cổ cảm ơn bạn',
  replay: 'Chơi lại',
  replayHint: 'Thử thêm một lượt nhé',
  sortedCount: (count: number) => `Đã phân loại ${count} món`,
  wrongBin: (name: string, bin: string) => `${name} thuộc nhóm ${bin}`,
  sorted: (name: string, label: string) => label ? `${name} · ${label}` : name,
  score: (score: number) => `${score} điểm`,
  pollution: (value: number) => `Ô nhiễm ${Math.round(value)}%`,
  combo: (combo: number, multiplier: number) => `Chuỗi ${combo} · ×${multiplier}`,
  seconds: (seconds: number) => `${seconds}s`,
} as const;

export const BIN_TEXT = {
  recycle: { name: 'Tái chế', icon: '♻' },
  food: { name: 'Thực phẩm', icon: '♧' },
  other: { name: 'Khác', icon: '▤' },
  hazard: { name: 'Nguy hại', icon: '☢' },
} as const;

export type StringKey = keyof typeof vi;

export const LEVEL_TEXT = {
  'ha-noi': { name: 'Phố cổ Hà Nội', subtitle: 'Hà Nội' },
  'ha-long': { name: 'Vịnh Hạ Long', subtitle: 'Quảng Ninh' },
  'hoi-an': { name: 'Phố cổ Hội An', subtitle: 'Sông Hoài' },
  'da-lat': { name: 'Đà Lạt', subtitle: 'Hồ Xuân Hương' },
  concert: { name: 'Đêm nhạc hội', subtitle: 'Sân khấu ngoài trời' },
  'nhieu-loc': { name: 'Kênh Nhiêu Lộc, TP.HCM', subtitle: 'Kênh và những nhịp cầu' },
  'cai-rang': { name: 'Chợ nổi Cái Răng', subtitle: 'Cần Thơ' },
  'giao-thua': { name: 'Giao thừa — phố đi bộ Nguyễn Huệ', subtitle: 'TP.HCM' },
  'sa-pa': { name: 'Ruộng bậc thang Sa Pa', subtitle: 'Lào Cai' },
  'con-dao': { name: 'Côn Đảo', subtitle: 'Biển và những mùa rùa về' },
} as const;

export const FACT_TEXT = {
  'ha-noi': 'Dạo phố cổ lần tới, thử mang bình nước riêng. Cốc trà đá uống xong cũng cần về đúng thùng.',
  'ha-long': 'Ngắm vịnh xong, mang rác trở lại bờ. Chai nhựa và túi nilon đều không có vé xuống biển.',
  'hoi-an': 'Đi dọc sông Hoài, giữ lại chiếc túi của mình để gom rác. Đèn lồng đẹp hơn khi dưới sông không có túi nilon.',
  'da-lat': 'Đi chơi Đà Lạt, mang theo chiếc ly dùng lại được. Ly sữa đậu nành uống xong khỏi phải tìm thùng cho chiếc cốc nhựa.',
  concert: 'Tan đêm nhạc, tháo pin khỏi gậy phát sáng và gom riêng. Pin cần tới điểm thu gom, phần vỏ nhựa bỏ nhóm Khác.',
  'nhieu-loc': 'Đi ngang kênh Nhiêu Lộc, giữ hộp đồ ăn và túi nilon lại để bỏ đúng chỗ. Dòng kênh đâu phải chỗ nhận đồ mang về.',
  'cai-rang': 'Ăn trái cây ở chợ nổi, để vỏ riêng với chai và túi. Rác thực phẩm cũng cần về đúng chỗ, đừng thả xuống sông.',
  'giao-thua': 'Đi chơi giao thừa, cầm theo chiếc túi nhỏ đựng vỏ hạt dưa. Vui xong, phố vẫn còn chỗ cho người đi bộ.',
  'sa-pa': 'Đi ngắm ruộng bậc thang, gom pin máy ảnh cũ riêng với rác thường. Mang về nhà rồi chuyển tới điểm thu gom pin.',
  'con-dao': 'Rời bãi biển Côn Đảo, mang theo cả rác của mình. Túi nilon và lưới hỏng cần trở về bờ.',
} as const;

export const PLEDGE_TEXT = {
  'binh-nuoc': 'Tuần này tôi mang bình nước riêng thay vì mua chai nhựa',
  'tui-vai': 'Tôi để sẵn một cái túi vải trong cốp xe',
  'tu-choi-ong-hut': 'Tôi nói "không lấy ống hút" khi mua nước',
  'gom-pin': 'Tôi gom pin cũ vào một hộp riêng, không vứt vào thùng rác',
  'phan-loai-nha': 'Nhà tôi sẽ có hai thùng rác thay vì một',
  'khong-nem': 'Tôi không ném rác ra đường, dù đang vội',
  'nhac-ban': 'Tôi sẽ nhắc bạn mình một lần, không gắt gỏng',
} as const;

/** Nội dung sổ tay, nguyên văn Mục 8.4. */
export const TRASH_TEXT = {
  "chai-nhua-pet": {
    name: "Chai nhựa PET",
    harm: "Vỡ vụn dần thành vi nhựa. Cá nuốt phải, rồi quay lại mâm cơm nhà mình.",
    tip: "Đổ hết nước, bóp dẹp cho đỡ tốn chỗ. Nắp chai làm từ loại nhựa khác — tháo ra để riêng.",
  },
  "lon-nhom": {
    name: "Lon nhôm",
    harm: "Nằm ngoài môi trường cả trăm năm, trong khi nhôm tái chế được gần như vô hạn mà không mất chất.",
    tip: "Đổ cạn, bóp dẹp. Lon nhôm là thứ ve chai được giá nhất — đừng để nó lẫn vào rác thường.",
  },
  "chai-thuy-tinh": {
    name: "Chai thủy tinh",
    harm: "Không phân hủy, chỉ vỡ thành mảnh nhỏ dần. Mảnh vỡ trên bãi biển cắt chân người và chân chim.",
    tip: "Để nguyên chai, đừng đập. Chai vỡ vừa nguy hiểm cho người thu gom vừa khó tái chế hơn.",
  },
  "giay-bao": {
    name: "Giấy báo",
    harm: "Tự nó phân hủy nhanh. Vấn đề là dính dầu mỡ thì làm hỏng cả mẻ giấy tái chế.",
    tip: "Giữ khô. Giấy ướt hoặc dính thức ăn thì bỏ nhóm Khác, đừng bỏ nhầm vào tái chế.",
  },
  "bia-carton": {
    name: "Bìa carton",
    harm: "Chiếm chỗ khổng lồ ở bãi chôn lấp dù thừa sức tái chế.",
    tip: "Gỡ băng keo, xếp dẹp. Thùng dính dầu mỡ như hộp pizza thì không tái chế được.",
  },
  "vo-chuoi": {
    name: "Vỏ chuối",
    harm: "Bản thân nó vô hại. Sai ở chỗ lẫn vào rác tái chế thì làm bẩn cả mẻ.",
    tip: "Bỏ nhóm Thực phẩm. Nhà có chậu cây thì vỏ chuối ủ làm phân rất tốt.",
  },
  "vo-trai-cay": {
    name: "Vỏ trái cây",
    harm: "Phân hủy nhanh, nhưng bị chôn kín trong túi nilon thì sinh khí mê-tan — một khí nhà kính mạnh hơn CO₂ nhiều lần.",
    tip: "Bỏ nhóm Thực phẩm, đừng gói trong túi nilon rồi mới bỏ.",
  },
  "thuc-an-thua": {
    name: "Thức ăn thừa",
    harm: "Là thành phần nặng nhất trong rác sinh hoạt. Trộn lẫn thì cả xe rác không còn gì tái chế được.",
    tip: "Gạn bớt nước trước khi bỏ — nước rỉ rác là thứ gây mùi và ngấm xuống mạch nước.",
  },
  "la-chuoi": {
    name: "Lá chuối gói hàng",
    harm: "Gần như không có. Nó chỉ sai khi bị bỏ nhầm nhóm.",
    tip: "Bỏ nhóm Thực phẩm. Gói hàng bằng lá chuối là cách cũ mà đúng.",
  },
  "ba-mia": {
    name: "Bã mía",
    harm: "Lượng lớn, ướt và nặng. Lẫn vào rác tái chế là hỏng cả mẻ.",
    tip: "Bỏ nhóm Thực phẩm. Bã mía ép khô còn làm được hộp đựng thay hộp xốp.",
  },
  "vo-hat-dua": {
    name: "Vỏ hạt dưa",
    harm: "Nhỏ nên hay bị nhổ thẳng xuống đất. Một người thì không sao, cả phố đi bộ cùng làm thì thành một lớp rác.",
    tip: "Bỏ nhóm Thực phẩm. Đi chơi Tết thì cầm theo một cái túi nhỏ.",
  },
  "tui-nilon": {
    name: "Túi nilon",
    harm: "Trôi ra biển, rùa nhầm là sứa và nuốt. Trên cạn thì bịt cống, và đó là một lý do phố ngập sau mưa.",
    tip: "Bỏ nhóm Khác. Tốt hơn: để sẵn một túi vải trong cốp xe.",
  },
  "hop-xop": {
    name: "Hộp xốp đựng cơm",
    harm: "Vỡ vụn thành hạt trắng li ti, chim và cá nuốt nhầm là thức ăn. Gần như không nơi nào tái chế.",
    tip: "Bỏ nhóm Khác. Mua cơm mang về thì mang hộp riêng — quán nào cũng đồng ý.",
  },
  "coc-nhua": {
    name: "Cốc nhựa",
    harm: "Một ly trà sữa gồm ly, nắp, ống hút và túi đựng — bốn món nhựa cho hai mươi phút uống.",
    tip: "Bỏ nhóm Khác. Nói trước \"không lấy ống hút, không lấy túi\" lúc gọi nước.",
  },
  "tan-thuoc-la": {
    name: "Tàn thuốc lá",
    harm: "Đầu lọc làm bằng nhựa chứ không phải bông. Ngấm nicotine và kim loại nặng ra nước.",
    tip: "Bỏ nhóm Khác. Đừng búng xuống cống — cống chảy thẳng ra sông.",
  },
  "ta-bim": {
    name: "Tã bỉm",
    harm: "Vừa là nhựa vừa là chất thải sinh học. Không tái chế được, và là nguồn lây bệnh cho người đi thu gom.",
    tip: "Gói kín rồi bỏ nhóm Khác.",
  },
  "luoi-danh-ca": {
    name: "Lưới đánh cá",
    harm: "Dân biển gọi là \"lưới ma\". Nó trôi dưới nước hàng chục năm và vẫn tiếp tục bắt cá, rùa, cá heo — bắt mà không ai thu.",
    tip: "Lưới hỏng mang về bờ, không thả lại biển. Nhiều nơi đã thu mua lưới cũ để tái chế.",
  },
  "ong-hut-nhua": {
    name: "Ống hút nhựa",
    harm: "Quá nhỏ để máy phân loại nhặt ra, nên gần như luôn đi thẳng ra bãi rác hoặc ra biển.",
    tip: "Bỏ nhóm Khác. Hoặc đơn giản hơn: uống thẳng từ ly.",
  },
  "khau-trang-y-te": {
    name: "Khẩu trang y tế",
    harm: "Lớp giữa là nhựa polypropylene chứ không phải vải. Dây đeo thắt vào chân chim và cổ cá.",
    tip: "Cắt đôi dây đeo rồi bỏ nhóm Khác. Đừng bỏ vào thùng tái chế.",
  },
  "que-xien-tre": {
    name: "Que xiên tre / đũa dùng một lần",
    harm: "Tre thì phân hủy được, nhưng đầu nhọn đâm thủng túi rác và đâm vào tay người thu gom.",
    tip: "Bẻ đôi hoặc bọc lại trước khi bỏ nhóm Khác.",
  },
  "ao-mua-giay": {
    name: "Áo mưa giấy dùng một lần",
    harm: "Tên là giấy nhưng làm bằng nhựa PE mỏng. Dùng một lần, rách ngay, và không tái chế được.",
    tip: "Bỏ nhóm Khác. Một cái áo mưa tử tế mặc được vài năm.",
  },
  "pin-aa": {
    name: "Pin tiểu AA/AAA",
    harm: "Chứa kim loại nặng, rò rỉ ra đất và nước. Nguy hơn: pin bị ép trong xe rác rất dễ chập và bốc cháy.",
    tip: "KHÔNG bỏ vào thùng nào cả. Gom vào một hộp riêng ở nhà, đầy thì mang tới điểm thu gom pin.",
  },
  "lightstick": {
    name: "Gậy phát sáng (pin cúc)",
    harm: "Bên trong là pin cúc. Trẻ con nuốt phải pin cúc có thể bị bỏng thực quản chỉ trong vài giờ.",
    tip: "Tháo pin ra, mang pin tới điểm thu gom. Phần vỏ nhựa bỏ nhóm Khác.",
  },
  "bong-den": {
    name: "Bóng đèn huỳnh quang",
    harm: "Chứa thủy ngân. Vỡ trong phòng kín thì hơi thủy ngân phát tán ra không khí trong nhà.",
    tip: "KHÔNG bỏ vào thùng nào. Bọc kỹ rồi mang tới điểm thu gom chất thải nguy hại.",
  },
} as const;

export const VARIANT_TEXT = {
  'coc-tra-da': 'Cốc trà đá',
  'coc-tra-sua': 'Cốc trà sữa',
  'coc-bia': 'Cốc bia',
  'hoa-dang': 'Hoa đăng giấy',
  'bang-ron': 'Băng rôn',
  'vo-bap': 'Vỏ bắp nướng',
} as const;

/** Giữ nguyên nhãn Mục 8.1, nhãn chưa xác minh được ẩn khi hiển thị. */
export const DECOMPOSE_TEXT = {
  "chai-nhua-pet": "~450 năm",
  "lon-nhom": "80–200 năm",
  "chai-thuy-tinh": "Gần như không phân hủy sinh học",
  "giay-bao": "2–6 tuần",
  "bia-carton": "2–3 tháng",
  "vo-chuoi": "2–5 tuần",
  "vo-trai-cay": "2–5 tuần",
  "thuc-an-thua": "2–4 tuần",
  "la-chuoi": "1–3 tháng",
  "ba-mia": "1–3 tháng",
  "vo-hat-dua": "1–3 tháng",
  "tui-nilon": "10–20 năm",
  "hop-xop": "50 năm+, gần như không phân hủy hết",
  "coc-nhua": "~50 năm",
  "tan-thuoc-la": "1–5 năm",
  "ta-bim": "~450 năm",
  "luoi-danh-ca": "~600 năm",
  "ong-hut-nhua": "~200 năm",
  "khau-trang-y-te": "~450 năm",
  "que-xien-tre": "",
  "ao-mua-giay": "",
  "pin-aa": "",
  "lightstick": "",
  "bong-den": "",
} as const;

export const RESULT_TEXT = {
  completeTitle: 'Dọn xong rồi',
  failedTitle: 'Nghỉ tay một chút nhé',
  failedHint: 'Túi đầy thì phân loại trước. Dọn bớt rác trên sàn để thanh ô nhiễm hạ xuống.',
  retryHint: 'Thử lại để phố sạch hơn nhé',
  map: 'Bản đồ',
  share: 'Chia sẻ',
  pledge: 'Lời cam kết',
  score: (score: number) => `${score} điểm`,
  cleanliness: (value: number) => `Độ sạch ${Math.round(value * 100)}%`,
  correct: (count: number) => `Phân loại đúng ${count} món`,
  stars: (count: number) => '★'.repeat(count) + '☆'.repeat(3 - count),
} as const;

export const EVENT_TEXT = {
  MUA_BAO: 'Mưa bão ập tới!',
  GIO_MUA: 'Gió mùa về!',
  CUU_SINH_VAT: 'Cứu nó với!',
  BAC_VE_CHAI: 'Bác ve chai đi ngang',
  NEM_RAC: 'Ơ kìa!',
  GIO_CAO_DIEM: 'Đám đông vừa tan!',
  PIN_ROI: 'Cẩn thận — rác nguy hại!',
  BAI_RAC_TU_PHAT: 'Bãi rác tự phát!',
  retrieved: 'Quay lại nhặt rồi. Lần sau bỏ đúng thùng nhé.',
  rejected: 'Bác chỉ nhận rác tái chế thôi nhé.',
  tapsRemaining: (count: number) => `Chạm thêm ${count} lần`,
} as const;

export const HAZARD_TEXT = {
  collector: 'Hộp thu gom',
  waitCollector: 'Đợi hộp thu gom quay lại',
  wrongSort: 'Pin KHÔNG thuộc thùng nào cả. Pin phải mang tới điểm thu gom riêng.',
  pendingAtEnd: 'Pin vẫn còn trong túi — ngoài đời cũng vậy, nhiều nhà để pin cũ trong ngăn kéo hàng năm trời.',
} as const;
