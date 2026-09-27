/* ============================================================
   MODULE mnl01 — LUẬN GIẢI CỬU TINH (Thiên Tinh cư Cung)
   ------------------------------------------------------------
   GIAI ĐOẠN 2 — đã có engine tính điểm + Bảng rà soát bắt buộc
   (user xem & sửa tay MỌI input trước khi bấm Tính toán).

   File này dùng chung các hàm/dữ liệu toàn cục của Ngũ Linh Độn
   Toán (ndtHauThien, ndtTienThien, ndtHourCan...) nên PHẢI nạp
   sau: ngulinh-dontoan-data.js , ngulinh-dontoan-core.js

   THANG ĐIỂM: xem chú thích ở đầu Phần C — là ước lượng tương
   đối (không tuyệt đối chính xác), dùng để người xem tự cân
   nhắc nặng nhẹ, không phải công thức toán học chuẩn xác.
   ============================================================ */
/* ============================================================
   NCT-RULES-DATA.js — GIAI ĐOẠN 1 (DRAFT ĐỂ DUYỆT THANG ĐIỂM)
   ------------------------------------------------------------
   Mục đích: tách riêng phần DỮ LIỆU (data-driven) khỏi phần ENGINE
   tính điểm, để:
     - Dễ rà soát / sửa từng sao độc lập, không đụng code logic.
     - Dễ tự động hoá test (so khớp lại với văn bản gốc Cửu Tinh.docx).

   ĐÃ LÀM ĐẦY ĐỦ: (1) Thiên Bồng, (2) Thiên Nhuế — làm mẫu để anh
   duyệt THANG ĐIỂM trước khi tôi transcribe nốt 8 sao còn lại
   (Thiên Xung, Thiên Phụ, Thiên Cầm, Thiên Tâm, Thiên Trụ, Thiên
   Nhậm, Thiên Anh, Thiên Không) theo đúng cùng 1 khuôn.

   THANG ĐIỂM ĐỀ XUẤT CHO "NGUYỆT" (mỗi ô monthTable):
     +1.0   Vượng khí (đúng bản cung, hoặc tam hợp mà sao là chủ)
     +0.9   Vượng khí do củng phù (thứ vị vượng) / tam hợp có sinh+hợp
     +0.7   Sinh khí rõ ràng (được sinh, không vướng gì)
     +0.5   Sinh khí nhẹ / được hợp có kèm sinh dù không phải chính vị
      0     Bình hoà / trung tính (không dùng nhiều ở lớp Nguyệt)
     -0.3   Xì hơi thoái khí (sao sinh cho tháng — mất khí nhẹ)
     -0.4   Suy (hình nhẹ, hoặc xung không khắc)
     -0.5   Tử khí (bị khắc thuần, không xung không hình)
     -0.7   Sát khí (khắc kèm 1 lớp phụ: xung HOẶC hình)
     -1.0   Sát khí tối hung (khắc kèm ≥2 lớp phụ: xung+hình, hoặc
             đủ bộ Tam Hình Dần-Tỵ-Thân)

   MỖI Ô monthTable CÓ THỂ KÈM "cuu" (điều kiện cứu):
     { type: 'hop'|'tamHop', can: [Chi cần có ở Cung Cư hoặc Ngày],
       hieuUng: 'nang_len_toi' | 'giam_bot',
       diem: <điểm mới nếu đủ điều kiện, hoặc số cộng thêm> }
   Đây là các case "nếu lại Cư tại cung X / hoặc gặp ngày X nữa thì…"
   được ghi rõ trong văn bản gốc.
   ============================================================ */

// ------------------------------------------------------------
// A. QUAN HỆ 12 ĐỊA CHI — CỐ ĐỊNH, DÙNG CHUNG CHO MỌI SAO
// ------------------------------------------------------------
const NCT_CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

// Lục Hợp (6 cặp hợp đôi)
const NCT_LUC_HOP = {
    'Tý':'Sửu', 'Sửu':'Tý',
    'Dần':'Hợi', 'Hợi':'Dần',
    'Mão':'Tuất', 'Tuất':'Mão',
    'Thìn':'Dậu', 'Dậu':'Thìn',
    'Tỵ':'Thân', 'Thân':'Tỵ',
    'Ngọ':'Mùi', 'Mùi':'Ngọ',
};

// Tam Hợp (4 bộ 3 chi cùng cục)
const NCT_TAM_HOP = [
    { cuc: 'Thuỷ', chis: ['Thân','Tý','Thìn'] },
    { cuc: 'Mộc',  chis: ['Hợi','Mão','Mùi'] },
    { cuc: 'Hoả',  chis: ['Dần','Ngọ','Tuất'] },
    { cuc: 'Kim',  chis: ['Tỵ','Dậu','Sửu'] },
];

// Lục Xung (đối xung, cách nhau 6 vị trí)
const NCT_LUC_XUNG = {
    'Tý':'Ngọ', 'Ngọ':'Tý',
    'Sửu':'Mùi', 'Mùi':'Sửu',
    'Dần':'Thân', 'Thân':'Dần',
    'Mão':'Dậu', 'Dậu':'Mão',
    'Thìn':'Tuất', 'Tuất':'Thìn',
    'Tỵ':'Hợi', 'Hợi':'Tỵ',
};

// Lục Hại
const NCT_LUC_HAI = {
    'Tý':'Mùi', 'Mùi':'Tý',
    'Sửu':'Ngọ', 'Ngọ':'Sửu',
    'Dần':'Tỵ', 'Tỵ':'Dần',
    'Mão':'Thìn', 'Thìn':'Mão',
    'Thân':'Hợi', 'Hợi':'Thân',
    'Dậu':'Tuất', 'Tuất':'Dậu',
};

// Tam Hình (2 bộ 3 chi) + Nhị Hình (Tý-Mão) + Tự Hình (4 chi)
const NCT_TAM_HINH = [
    { ten: 'Thế lực chi hình', chis: ['Dần','Tỵ','Thân'] },
    { ten: 'Vô ân chi hình',   chis: ['Sửu','Mùi','Tuất'] },
];
const NCT_NHI_HINH = ['Tý','Mão']; // Vô lễ chi hình — quan hệ hình 2 chiều Tý<->Mão
const NCT_TU_HINH = ['Thìn','Ngọ','Dậu','Hợi']; // Tự hình — chỉ tính khi KHÔNG phải bản vị

// Mộ/Khố theo hành (dùng cho case "khắc ngoài hợp trong")
const NCT_MO_KHO = { 'Thuỷ':'Thìn', 'Thổ':'Thìn', 'Kim':'Sửu', 'Mộc':'Mùi', 'Hoả':'Tuất' };

// ------------------------------------------------------------
// B. HÀM TIỆN ÍCH TRA QUAN HỆ GIỮA 2 CHI (dùng cho Cung Cư & Tháng)
// ------------------------------------------------------------
function nctLaLucHop(chiA, chiB) { return NCT_LUC_HOP[chiA] === chiB; }
function nctLaLucXung(chiA, chiB) { return NCT_LUC_XUNG[chiA] === chiB; }
function nctLaLucHai(chiA, chiB) { return NCT_LUC_HAI[chiA] === chiB; }
function nctLaMoKho(chiSao, hanhSao, chiKia) { return NCT_MO_KHO[hanhSao] === chiKia && chiKia !== chiSao; }

// Trả về bộ Tam Hợp chứa chiA (nếu có)
function nctTimTamHop(chiA) {
    return NCT_TAM_HOP.find(b => b.chis.includes(chiA)) || null;
}
// Kiểm tra 3 chi (banVi, cungCu, thang) có tạo đủ bộ Tam Hợp không
function nctDuTamHop(banVi, cungCu, thang) {
    const bo = nctTimTamHop(banVi);
    if (!bo) return null;
    const co = [banVi, cungCu, thang].filter(c => bo.chis.includes(c));
    const daDu = bo.chis.every(c => [banVi, cungCu, thang].includes(c));
    return { bo, daDu, coMay: co.length };
}

// ------------------------------------------------------------
// C. DỮ LIỆU TỪNG SAO — MẪU: (1) THIÊN BỒNG, (2) THIÊN NHUẾ
//    (8 sao còn lại transcribe theo đúng khuôn này sau khi duyệt)
// ------------------------------------------------------------
const NCT_STAR_DATA = {

    'Thiên Bồng': {
        num: 1, hanh: 'Thuỷ', parity: 'D', // dương
        banVi: ['Tý'],                     // 1 bản cung
        chinhVi: 'Tý', thuVi: ['Hợi'],      // Hợi = củng phù (thứ vị)

        // Điểm CUNG CƯ (thang riêng, độc lập Nguyệt — theo mô tả tổng quát,
        // dùng chung công thức Chính vị/Thứ vị/Sinh Khắc Xung Hại Hình cho Cung).
        // (Sẽ hoàn thiện đồng bộ ở Giai đoạn 2 — engine dùng chung 1 hàm
        // tính quan hệ Chi-vs-BảnVị cho cả Cung và Tháng.)

        monthTable: {
            'Tý':   { diem: 1.0,  nhan: 'Bản cung — vượng khí.' },
            'Sửu':  { diem: -0.5, nhan: 'Thổ khắc Thuỷ (tử khí xu hướng) nhưng Tý-Sửu lục hợp, trong khắc có sinh — có cứu.',
                      cuu: { type: 'hop', giamConLai: -0.2 } }, // net nhẹ hơn tử khí thường (-0.5) nhờ hợp
            'Dần':  { diem: -0.3, nhan: 'Thuỷ sinh Mộc — xì hơi thoái khí, suy.' },
            'Mão':  { diem: -0.6, nhan: 'Xì hơi thoái khí + bị hình (Tý-Mão nhị hình) — hung hoạ.' },
            'Thìn': { diem: -0.5, nhan: 'Thổ khắc Thuỷ nhưng Thìn hợp Tý (mộ khố) — trong khắc có sinh, có cứu.',
                      cuu: { type: 'tamHop', can: ['Thân'], batLuanViTri: true, // Thân ở Cung Cư HOẶC Ngày đều tính
                             hieuUng: 'nang_len_toi', diem: 1.0,
                             ghiChu: 'Nếu có Thân (cư cung Thân, hoặc ngày Thân) → đủ Tam Hợp Thân-Tý-Thìn → vượng khí.' } },
            'Tỵ':   { diem: -0.4, nhan: 'Tiết giảm khí — suy.' },
            'Ngọ':  { diem: -0.8, nhan: 'Vừa xung vừa khắc — càng suy.' },
            'Mùi':  { diem: -0.5, nhan: 'Thổ (Nguyệt kiến) khắc Thuỷ — suy.' },
            'Thân': { diem: 0.9,  nhan: 'Vừa được sinh (Kim sinh Thuỷ) vừa được hợp (tam hợp Thân-Tý-Thìn) — vượng khí.' },
            'Dậu':  { diem: 0.6,  nhan: 'Được Nguyệt kiến sinh phù — sinh khí.' },
            'Tuất': { diem: -0.5, nhan: 'Như Mùi — bị khắc chết, suy khí.' },
            'Hợi':  { diem: 0.9,  nhan: 'Được củng phù — vượng (thứ vị).' },
        },
    },

    'Thiên Nhuế': {
        num: 2, hanh: 'Thổ', parity: 'A', // âm
        banVi: ['Sửu', 'Mùi'],             // 2 bản cung song song — cần chọn nhánh
        chinhVi: ['Sửu', 'Mùi'], thuVi: [],

        // GHI CHÚ ĐẶC BIỆT (đã thảo luận): khi so khớp với 1 Chi bất kỳ (Cung
        // Cư hoặc Tháng), phải THỬ CẢ Sửu và Mùi rồi CHỌN nhánh cho quan hệ
        // "đẹp" hơn (ưu tiên Hợp/Sinh/Vượng, tránh Hình/Xung/Khắc/Hại nếu
        // nhánh kia tốt hơn). Hai phép so sánh (Cung Cư và Tháng) ĐỘC LẬP
        // nhau về việc chọn nhánh.
        chonNhanh: true,

        // Vì có 2 bản vị, monthTable áp dụng RIÊNG cho từng nhánh; engine
        // Giai đoạn 2 sẽ tính điểm cho cả 2 nhánh rồi lấy nhánh tốt hơn.
        monthTable: {
            // ---- Nhánh Sửu ----
            branchSuu: {
                'Sửu':  { diem: 1.0,  nhan: 'Bản cung (nhánh Sửu) — vượng khí.' },
                'Mùi':  { diem: 1.0,  nhan: 'Bản cung kia (đồng Thổ) — vượng khí (xem thêm nhánh Mùi).' },
                'Hợi':  { diem: -0.7, nhan: 'Thổ khắc Thuỷ — tử khí. (Nếu Thiên Nhuế cư cung Mão → thành Tam Hợp Hợi-Mão-Mùi, dùng nhánh Mùi thay vì Sửu — xem monthTable.branchMui.)' },
                'Tý':   { diem: -0.5, nhan: 'Thổ khắc Thuỷ nhưng Tý-Sửu nhị hợp — trong khắc có sinh, có cứu.',
                          cuu: { type: 'hop', giamConLai: -0.2 } },
                'Dần':  { diem: -0.7, nhan: 'Mộc khắc Thổ — sát khí.' },
                'Mão':  { diem: -0.7, nhan: 'Mộc khắc Thổ — sát khí.' },
                'Thìn': { diem: 0.9,  nhan: 'Phù vượng khí (đồng Thổ).' },
                'Tuất': { diem: 0.9,  nhan: 'Phù vượng khí (đồng Thổ).' },
                'Tỵ':   { diem: 0.7,  nhan: 'Hoả sinh Thổ — sinh khí. (Nếu Thiên Nhuế cư cung Dậu → vừa sinh vừa hợp, bộ Tỵ-Dậu-Sửu → tốt đẹp hơn nữa.)',
                          cuu: { type: 'tamHop', can: ['Dậu'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 1.0 } },
                'Ngọ':  { diem: -0.3, nhan: 'Hại nhẹ với Sửu (Sửu-Ngọ lục hại) — nên ưu tiên xét nhánh Mùi (Ngọ-Mùi lục hợp) nếu áp dụng được — xem branchMui.' },
                'Thân': { diem: -0.3, nhan: 'Thổ sinh Kim — xì hơi thoái khí, suy.' },
                'Dậu':  { diem: -0.3, nhan: 'Thổ sinh Kim — xì hơi thoái khí, suy.' },
            },
            // ---- Nhánh Mùi ----
            branchMui: {
                'Mùi':  { diem: 1.0,  nhan: 'Bản cung (nhánh Mùi) — vượng khí.' },
                'Sửu':  { diem: 1.0,  nhan: 'Bản cung kia (đồng Thổ) — vượng khí.' },
                'Hợi':  { diem: 0.7,  nhan: 'Về ngũ hành Thổ khắc Thuỷ, NHƯNG nếu Thiên Nhuế cư cung Mão → Hợi-Mão-Mùi đủ Tam Hợp, sao hưởng lợi → trong hung có cát, có cứu mạnh.',
                          cuu: { type: 'tamHop', can: ['Mão'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.95 } },
                'Tý':   { diem: -0.7, nhan: 'Mùi-Tý lục hại + Thổ khắc Thuỷ không có hợp cứu ở nhánh này — nên ưu tiên nhánh Sửu (Sửu-Tý lục hợp) nếu áp dụng được.' },
                'Dần':  { diem: -0.7, nhan: 'Mộc khắc Thổ — sát khí.' },
                'Mão':  { diem: -0.7, nhan: 'Mộc khắc Thổ — sát khí (trừ khi đủ Tam Hợp Hợi-Mão-Mùi như trên).' },
                'Thìn': { diem: 0.9,  nhan: 'Phù vượng khí (đồng Thổ).' },
                'Tuất': { diem: 0.9,  nhan: 'Phù vượng khí (đồng Thổ), tàng chút Nhị Hình Mùi-Tuất — bất trắc nhỏ ngầm.',
                          modifier: -0.1 },
                'Tỵ':   { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí (nên ưu tiên nhánh Sửu — Tỵ-Sửu cùng bộ Kim cục — nếu áp dụng được).' },
                'Ngọ':  { diem: 1.0,  nhan: 'Ngọ-Mùi lục hợp + Hoả sinh Thổ — vừa sinh vừa hợp, tốt đẹp.' },
                'Thân': { diem: -0.3, nhan: 'Thổ sinh Kim — xì hơi thoái khí.' },
                'Dậu':  { diem: -0.3, nhan: 'Thổ sinh Kim — xì hơi thoái khí.' },
            },
        },
    },

    'Thiên Xung': {
        num: 3, hanh: 'Mộc', parity: 'D',
        banVi: ['Dần'], chinhVi: 'Dần', thuVi: ['Mão'],
        monthTable: {
            'Dần':  { diem: 1.0,  nhan: 'Bản cung — vượng khí.' },
            'Mão':  { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Thìn': { diem: -0.5, nhan: 'Mộc khắc Thổ — tử khí.' },
            'Tỵ':   { diem: -0.4, nhan: 'Xì hơi thoái khí, lại bị hình (Tam Hình Dần-Tỵ-Thân nếu đủ bộ).',
                      cuu: { type: 'tamHinh', can: ['Thân'], hieuUng: 'nang_hung', diem: -1.0,
                             ghiChu: 'Nếu cư cung Thân → đủ Tam Hình Dần-Tỵ-Thân → hung hoạ nặng.' } },
            'Ngọ':  { diem: -0.3, nhan: 'Xì hơi thoái khí.',
                      cuu: { type: 'tamHop', can: ['Tuất'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.8,
                             ghiChu: 'Nếu cư cung Tuất → tam hợp Dần-Ngọ-Tuất → không đáng lo.' } },
            'Sửu':  { diem: -0.5, nhan: 'Mộc khắc Thổ — tử khí.' },
            'Mùi':  { diem: -0.5, nhan: 'Mộc khắc Thổ — tử khí.' },
            'Thân': { diem: -1.0, nhan: 'Vừa xung vừa khắc — sát khí tối hung.' },
            'Dậu':  { diem: -0.7, nhan: 'Kim khắc Mộc — sát khí.' },
            'Tuất': { diem: -0.5, nhan: 'Mộc khắc Thổ — tử khí.',
                      cuu: { type: 'tamHop', can: ['Ngọ'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.8,
                             ghiChu: 'Nếu cư cung Ngọ → tam hợp Dần-Ngọ-Tuất → có cứu.' } },
            'Hợi':  { diem: 0.9,  nhan: 'Vừa sinh vừa hợp (Dần-Hợi lục hợp, Thuỷ sinh Mộc) — sinh khí tốt đẹp.' },
            'Tý':   { diem: 0.7,  nhan: 'Thuỷ dưỡng Mộc — sinh khí tốt đẹp.' },
        },
    },

    'Thiên Phụ': {
        num: 4, hanh: 'Mộc', parity: 'A',
        banVi: ['Mão'], chinhVi: 'Mão', thuVi: ['Dần'],
        monthTable: {
            'Mão':  { diem: 1.0,  nhan: 'Bản cung — vượng khí.' },
            'Dần':  { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Thìn': { diem: -0.5, nhan: 'Mộc khắc Thổ — tử khí.' },
            'Tỵ':   { diem: -0.3, nhan: 'Mộc sinh Hoả — xì hơi thoái khí.' },
            'Ngọ':  { diem: -0.3, nhan: 'Mộc sinh Hoả — xì hơi thoái khí.' },
            'Mùi':  { diem: -0.5, nhan: 'Mộc khắc Thổ — tử khí.',
                      cuu: { type: 'tamHop', can: ['Hợi'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.7,
                             ghiChu: 'Nếu cư cung Hợi → tam hợp Hợi-Mão-Mùi → trong hung có cát.' } },
            'Thân': { diem: -0.7, nhan: 'Kim khắc Mộc — sát khí.' },
            'Dậu':  { diem: -1.0, nhan: 'Vừa khắc vừa xung — sát khí tối độc.' },
            'Tuất': { diem: -0.2, nhan: 'Mộc khắc Thổ nhưng Mão-Tuất lục hợp (Hợp suông, không sinh thực) — trong khắc có sinh hình thức, có cứu nhẹ, không rơi hẳn nhưng cũng không lên rõ.' },
            'Hợi':  { diem: 0.7,  nhan: 'Thuỷ dưỡng Mộc — sinh khí.',
                      cuu: { type: 'tamHop', can: ['Mùi'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.95,
                             ghiChu: 'Nếu cư cung Mùi → tam hợp Hợi-Mão-Mùi, sao là chủ hưởng lợi → càng tốt đẹp.' } },
            'Tý':   { diem: 0.3,  nhan: 'Được Thuỷ sinh nhưng Tý-Mão tương hình — trong sinh có hình, cát hàm hung, cần thận trọng.' },
            'Sửu':  { diem: -0.5, nhan: 'Mộc khắc Thổ — tử khí hung hoạ.' },
        },
    },

    'Thiên Cầm': {
        num: 5, hanh: 'Hoả', parity: 'D',
        banVi: ['Ngọ'], chinhVi: 'Ngọ', thuVi: ['Tỵ'],
        monthTable: {
            'Ngọ':  { diem: 1.0,  nhan: 'Bản cung — vượng khí (không luận Tự Hình dù Ngọ-Ngọ vốn là cặp tự hình).' },
            'Tỵ':   { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Mùi':  { diem: 0.5,  nhan: 'Hoả sinh Thổ xì hơi, nhưng Ngọ-Mùi nhị hợp — trong có sinh, vẫn là tượng hữu khí tốt đẹp.' },
            'Thân': { diem: -0.5, nhan: 'Hoả khắc Kim — tử khí.' },
            'Dậu':  { diem: -0.5, nhan: 'Hoả khắc Kim — tử khí.' },
            'Tuất': { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí.',
                      cuu: { type: 'tamHop', can: ['Dần'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.6,
                             ghiChu: 'Nếu cư cung Dần → tam hợp Dần-Ngọ-Tuất → có cứu.' } },
            'Hợi':  { diem: -0.7, nhan: 'Thuỷ khắc Hoả — sát khí.' },
            'Tý':   { diem: -1.0, nhan: 'Vừa xung vừa khắc — sát khí tối hung.' },
            'Dần':  { diem: 0.7,  nhan: 'Mộc dưỡng Hoả — sinh khí.',
                      cuu: { type: 'tamHop', can: ['Tuất'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 1.0,
                             ghiChu: 'Nếu cư cung Tuất → vừa sinh vừa hợp (Dần-Ngọ-Tuất) → rất tốt đẹp.' } },
            'Mão':  { diem: 0.7,  nhan: 'Mộc dưỡng Hoả — sinh khí tốt đẹp.' },
            'Thìn': { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí.' },
            'Sửu':  { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí.' },
        },
    },

    'Thiên Tâm': {
        num: 6, hanh: 'Kim', parity: 'D',
        banVi: ['Thân'], chinhVi: 'Thân', thuVi: ['Dậu'],
        monthTable: {
            'Thân': { diem: 1.0,  nhan: 'Bản cung — vượng khí.' },
            'Dậu':  { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Tuất': { diem: 0.7,  nhan: 'Thổ sinh Kim — sinh khí.' },
            'Mùi':  { diem: 0.7,  nhan: 'Thổ sinh Kim — sinh khí.' },
            'Sửu':  { diem: 0.7,  nhan: 'Thổ sinh Kim — sinh khí.' },
            'Hợi':  { diem: -0.3, nhan: 'Kim sinh Thuỷ — xì hơi thoái khí.' },
            'Tý':   { diem: -0.3, nhan: 'Kim sinh Thuỷ — xì hơi thoái khí.',
                      cuu: { type: 'tamHop', can: ['Thìn'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.6,
                             ghiChu: 'Nếu cư cung Thìn → tam hợp Thân-Tý-Thìn → có cứu.' } },
            'Dần':  { diem: -1.0, nhan: 'Vừa khắc vừa xung — tử khí hung hoạ.' },
            'Mão':  { diem: -0.9, nhan: 'Kim khắc Mộc — tử khí (nặng gần bằng tháng Dần).' },
            'Thìn': { diem: 0.7,  nhan: 'Thổ sinh Kim — sinh khí.',
                      cuu: { type: 'tamHop', can: ['Tý'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 1.0,
                             ghiChu: 'Nếu cư cung Tý → vừa sinh vừa hợp (Thân-Tý-Thìn, sao là chủ) → rất tốt đẹp.' } },
            'Tỵ':   { diem: -1.0, nhan: 'Hoả khắc Kim, trong khắc có Hình (Dần-Tỵ-Thân, bản vị Thân là 1 chi trong bộ) — sát khí tối hung.' },
            'Ngọ':  { diem: -0.7, nhan: 'Hoả khắc Kim — sát khí.' },
        },
    },

    'Thiên Trụ': {
        num: 7, hanh: 'Kim', parity: 'A',
        banVi: ['Dậu'], chinhVi: 'Dậu', thuVi: ['Thân'],
        monthTable: {
            'Dậu':  { diem: 1.0,  nhan: 'Bản cung — vượng khí.' },
            'Thân': { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Tuất': { diem: 0.7,  nhan: 'Thổ sinh Kim — sinh khí.' },
            'Mùi':  { diem: 0.7,  nhan: 'Thổ sinh Kim — sinh khí.' },
            'Hợi':  { diem: -0.3, nhan: 'Kim sinh Thuỷ — xì hơi thoái khí.' },
            'Tý':   { diem: -0.3, nhan: 'Kim sinh Thuỷ — xì hơi thoái khí.' },
            'Sửu':  { diem: 0.7,  nhan: 'Sinh khí.',
                      cuu: { type: 'tamHop', can: ['Tỵ'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 1.0,
                             ghiChu: 'Nếu cư cung Tỵ → tam hợp Tỵ-Dậu-Sửu, sao là chủ → càng tốt đẹp.' } },
            'Dần':  { diem: -0.5, nhan: 'Kim khắc Mộc — tử khí.' },
            'Mão':  { diem: -0.8, nhan: 'Vừa xung vừa khắc — tử khí càng xấu.' },
            'Thìn': { diem: 0.9,  nhan: 'Thổ sinh Kim, trong sinh có Hợp (Thìn-Dậu lục hợp) — càng tốt đẹp.' },
            'Tỵ':   { diem: -0.7, nhan: 'Hoả khắc Kim — sát khí hung hoạ.',
                      cuu: { type: 'hopHoacTamHop', can: ['Dậu','Sửu'], viTri: 'cungCu', hieuUng: 'giam_manh', diemMoi: -0.2,
                             ghiChu: 'Nếu cư cung Dậu hay Sửu → trong khắc có sinh, có cứu.' } },
            'Ngọ':  { diem: -0.8, nhan: 'Hoả (Nguyệt kiến) khắc chết Kim — sát khí hung hoạ.' },
        },
    },

    'Thiên Nhậm': {
        num: 8, hanh: 'Thổ', parity: 'D',
        banVi: ['Thìn', 'Tuất'], chinhVi: ['Thìn','Tuất'], thuVi: ['Sửu','Mùi'],
        chonNhanh: false, // khác Thiên Nhuế: Thìn & Tuất đối xử đối xứng, không cần chọn nhánh phức tạp
        monthTable: {
            'Thìn': { diem: 1.0,  nhan: 'Bản cung — vượng khí.' },
            'Tuất': { diem: 1.0,  nhan: 'Bản cung — vượng khí.' },
            'Sửu':  { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Mùi':  { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Tỵ':   { diem: 0.7,  nhan: 'Hoả sinh Thổ — sinh khí.' },
            'Ngọ':  { diem: 0.7,  nhan: 'Hoả sinh Thổ — sinh khí.',
                      cuu: { type: 'tamHopHoacHop', can: ['Dần','Tuất'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 1.0,
                             ghiChu: 'Nếu cư cung Dần hay Tuất → vừa sinh vừa hợp → càng tốt đẹp.' } },
            'Thân': { diem: -0.3, nhan: 'Thổ sinh Kim — xì hơi thoái khí.',
                      cuu: { type: 'sinhTuCungCu', can: ['Tý','Thìn'], viTri: 'cungCu', hieuUng: 'giam_manh', diemMoi: 0.2,
                             ghiChu: 'Nếu cư cung Tý hay Thìn → trong tiết thoái khí lại được sinh, có cứu, không đáng lo.' } },
            'Dậu':  { diem: -0.3, nhan: 'Thổ sinh Kim — xì hơi thoái khí.' },
            'Hợi':  { diem: -0.6, nhan: 'Thổ khắc Thuỷ — tử khí hung hoạ.' },
            'Tý':   { diem: -0.5, nhan: 'Thổ khắc Thuỷ — tử khí.',
                      cuu: { type: 'sinhTuCungCu', can: ['Thân','Thìn'], viTri: 'cungCu', hieuUng: 'giam_manh', diemMoi: 0.2,
                             ghiChu: 'Nếu cư cung Thân hay Thìn → trong hung hàm cát, có cứu.' } },
            'Dần':  { diem: -1.0, nhan: 'Mộc khắc Thổ — sát khí tối hung.',
                      cuu: { type: 'tamHop', can: ['Ngọ','Tuất'], viTri: 'cungCu', hieuUng: 'giam_manh', diemMoi: 0.3,
                             ghiChu: 'Nếu cư cung Ngọ hay Tuất → đạt thế tam hợp Dần-Ngọ-Tuất, được cứu, không đáng lo.' } },
            'Mão':  { diem: -1.0, nhan: 'Mộc khắc Thổ — sát khí tối hung.' },
        },
    },

    'Thiên Anh': {
        num: 9, hanh: 'Hoả', parity: 'A',
        banVi: ['Tỵ'], chinhVi: 'Tỵ', thuVi: ['Ngọ'],
        monthTable: {
            'Tỵ':   { diem: 1.0,  nhan: 'Bản cung — vượng tướng.' },
            'Ngọ':  { diem: 0.9,  nhan: 'Củng phù — vượng.' },
            'Mùi':  { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí.' },
            'Tuất': { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí.' },
            'Thìn': { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí.' },
            'Thân': { diem: -0.5, nhan: 'Hoả khắc Kim — tử khí.' },
            'Dậu':  { diem: -0.3, nhan: 'Xì hơi thoái khí (văn bản gốc ghi tương tự tháng Thân — có thể là biến thể Hoả khắc Kim, cần đối chiếu thêm).',
                      cuu: { type: 'hop', can: ['Tỵ','Sửu'], viTri: 'cungCu', hieuUng: 'giam_manh', diemMoi: 0.1,
                             ghiChu: 'Nếu cư cung Tỵ hay Sửu → trong khắc có sinh, có cứu.' } },
            'Hợi':  { diem: -1.0, nhan: 'Vừa xung vừa khắc — sát khí tối hung.' },
            'Tý':   { diem: -0.7, nhan: 'Sát khí (như Hợi nhưng nhẹ hơn).' },
            'Sửu':  { diem: -0.3, nhan: 'Hoả sinh Thổ — xì hơi thoái khí.',
                      cuu: { type: 'hop', can: ['Tỵ','Dậu'], viTri: 'cungCu', hieuUng: 'giam_manh', diemMoi: 0.1,
                             ghiChu: 'Nếu cư cung Tỵ hay Dậu → có cứu, không đáng lo ngại lắm.' } },
            'Dần':  { diem: 0.7,  nhan: 'Mộc dưỡng Hoả — đắc sinh khí tốt đẹp.' },
            'Mão':  { diem: 0.7,  nhan: 'Mộc dưỡng Hoả — đắc sinh khí tốt đẹp.' },
        },
    },

    'Thiên Không': {
        num: 10, hanh: 'Thuỷ', parity: 'A',
        banVi: ['Hợi'], chinhVi: 'Hợi', thuVi: ['Tý'],
        monthTable: {
            'Hợi':  { diem: 1.0,  nhan: 'Bản cung — vượng khí tốt đẹp.' },
            'Tý':   { diem: 0.9,  nhan: 'Củng phù — vượng khí.' },
            'Sửu':  { diem: -1.0, nhan: 'Thổ khắc Thuỷ — sát khí tối hung.' },
            'Tuất': { diem: -1.0, nhan: 'Thổ khắc Thuỷ — sát khí tối hung.' },
            'Thìn': { diem: -1.0, nhan: 'Thổ khắc Thuỷ — sát khí tối hung.' },
            'Dần':  { diem: -0.1, nhan: 'Thuỷ dưỡng Mộc — xì hơi thoái khí, nhưng Dần hợp Hợi (lục hợp) — trong tiết khí có nguồn sinh, không đáng lo.' },
            'Mão':  { diem: -0.3, nhan: 'Xì hơi thoái khí.',
                      cuu: { type: 'tamHop', can: ['Hợi','Mùi'], viTri: 'cungCu', hieuUng: 'nang_len_toi', diem: 0.7,
                             ghiChu: 'Nếu cư cung Hợi hay Mùi → đắc thế tam hợp Hợi-Mão-Mùi → không đáng lo ngại.' } },
            'Tỵ':   { diem: -1.0, nhan: 'Vừa xung vừa khắc — tử khí tối hung.' },
            'Ngọ':  { diem: -0.7, nhan: 'Thuỷ khắc Hoả — tử khí hung khí (lưu ý: ngược với lý thuyết "ta khắc nguyệt kiến là hưu" nêu ở đầu file gốc — ở đây theo mô tả thực tế riêng của sao này).' },
            'Mùi':  { diem: -0.7, nhan: 'Thổ khắc Thuỷ — sát khí.',
                      cuu: { type: 'hopSinh', can: ['Hợi','Mão'], viTri: 'cungCu', hieuUng: 'giam_manh', diemMoi: -0.1,
                             ghiChu: 'Nếu cư cung Hợi hay Mão → được hợp sinh, không đáng lo nhiều.' } },
            'Thân': { diem: 0.7,  nhan: '[SUY LUẬN — không có trong văn bản gốc] Kim sinh Thuỷ — sinh khí. Cần bạn xác nhận lại.',
                      suyLuan: true },
            'Dậu':  { diem: 0.7,  nhan: '[SUY LUẬN — không có trong văn bản gốc] Kim sinh Thuỷ — sinh khí. Cần bạn xác nhận lại.',
                      suyLuan: true },
        },
    },
};

// ------------------------------------------------------------
// D. DANH SÁCH 12 CHI — dùng cho dropdown trong Bảng rà soát
// ------------------------------------------------------------
const NCT_DS_CHI = NCT_CHI.slice();

// ------------------------------------------------------------
// E. LẤY Ô monthTable THEO CHI (xử lý sao có 2 bản cung — tự chọn
//    nhánh cho điểm cao hơn khi dùng làm Cung Cư/Ngày; khi dùng làm
//    Tháng cũng theo cùng quy tắc "chọn nhánh lợi nhất")
// ------------------------------------------------------------
function nctLayOMonth(starKey, chi) {
    const sd = NCT_STAR_DATA[starKey];
    if (!sd) return null;
    if (sd.chonNhanh) {
        const a = sd.monthTable.branchSuu[chi];
        const b = sd.monthTable.branchMui[chi];
        if (!a) return { ...b, nhanh: sd.banVi[1] };
        if (!b) return { ...a, nhanh: sd.banVi[0] };
        return (a.diem >= b.diem) ? { ...a, nhanh: sd.banVi[0] } : { ...b, nhanh: sd.banVi[1] };
    }
    return sd.monthTable[chi] || null;
}

// ------------------------------------------------------------
// F. LỚP MODIFIER TỔNG HỢP — Tam Hợp (chủ/khách) + Lục Hợp + Lục Hại
//    + Tam Hình đủ bộ (với ngoại lệ Thiên Nhuế cho bộ Sửu-Mùi-Tuất và
//    ngoại lệ Tự Hình khi Chi trùng đúng bản vị)
// ------------------------------------------------------------
function nctTinhModifier(starKey, cungChi, thangChi) {
    const sd = NCT_STAR_DATA[starKey];
    const hanh = sd.hanh;
    const banViList = sd.banVi;
    const kq = {
        tamHopDu: false, tamHopChu: false, tamHopBo: null,
        tamHopBanPhan: false,
        lucHopCung: false, lucHopThang: false,
        haiCung: false, haiThang: false,
        tamHinhDu: false, tamHinhBo: null,
        hinhBanPhanCung: false, hinhBanPhanThang: false,   // << MỚI
        ghiChu: [],
    };

    banViList.forEach(bv => {
        // ---- Tam Hợp đủ bộ (3/3) ----
        const th = nctDuTamHop(bv, cungChi, thangChi);
        if (th && th.daDu && !kq.tamHopDu) {
            kq.tamHopDu = true;
            kq.tamHopBo = th.bo;
            kq.tamHopChu = (hanh === th.bo.cuc);
            kq.ghiChu.push(`Đủ Tam Hợp ${th.bo.chis.join('-')} (cục ${th.bo.cuc}) — sao ${kq.tamHopChu ? 'LÀ CHỦ hưởng lợi chính' : 'ăn theo (theo đóm ăn tàn)'}.`);
        }
        // ---- Tam Hợp BÁN PHẦN (2/3, thiếu 1 chi) — "cảm tình nền tảng":
        //      không giúp không hại trực tiếp, nhưng xoa dịu bớt hung khí
        //      từ nguồn khác (Cung/Tháng/Hình...) — KHÔNG cộng điểm thẳng. ----
        if (!kq.tamHopDu) {
            const boTH = nctTimTamHop(bv);
            if (boTH) {
                const coCung = boTH.chis.includes(cungChi) && cungChi !== bv;
                const coThang = boTH.chis.includes(thangChi) && thangChi !== bv;
                if (coCung || coThang) {
                    kq.tamHopBanPhan = true;
                    kq.ghiChu.push(`Bán phần Tam Hợp ${boTH.chis.join('-')} (thiếu 1 chi) — có "cảm tình nền", không cộng điểm trực tiếp nhưng xoa dịu bớt hung khí khác.`);
                }
            }
        }
        // ---- Lục Hợp ----
        if (nctLaLucHop(bv, cungChi) && bv !== cungChi) kq.lucHopCung = true;
        if (nctLaLucHop(bv, thangChi) && bv !== thangChi) kq.lucHopThang = true;
        // ---- Lục Hại ----
        if (nctLaLucHai(bv, cungChi)) kq.haiCung = true;
        if (nctLaLucHai(bv, thangChi)) kq.haiThang = true;
        // ---- Hình BÁN PHẦN (2/3 của 1 bộ Tam Hình, thiếu 1 chi) — môi
        //      trường (Cung/Tháng) luôn là bên MẠNH hơn Thiên Tinh, nên áp
        //      chế/gây khó cho sao, kể cả khi 2 chi đó ĐỒNG THỜI cũng là
        //      Lục Hợp (như cặp Tỵ-Thân) — Hình lấn át, Hợp không cứu được. ----
        NCT_TAM_HINH.forEach(set => {
            if (starKey === 'Thiên Nhuế' && set.ten === 'Vô ân chi hình') return; // đã xử lý riêng trong data
            if (!set.chis.includes(bv)) return;
            if (set.chis.includes(cungChi) && cungChi !== bv) kq.hinhBanPhanCung = true;
            if (set.chis.includes(thangChi) && thangChi !== bv) kq.hinhBanPhanThang = true;
        });
    });

    if (kq.hinhBanPhanCung) {
        kq.ghiChu.push(`Hình bán phần ở Cung Cư (${cungChi}) — môi trường áp chế Thiên Tinh (gây khó, soi mói, cản trở); nếu 2 chi này đồng thời Lục Hợp thì Hợp KHÔNG cứu được vì Hình lấn át.`);
        kq.lucHopCung = false; // Hình lấn át — huỷ bỏ softening của Lục Hợp trên cùng 1 cặp chi
    }
    if (kq.hinhBanPhanThang) {
        kq.ghiChu.push(`Hình bán phần ở Tháng (${thangChi}) — môi trường áp chế Thiên Tinh, Lục Hợp (nếu trùng) KHÔNG cứu được.`);
        kq.lucHopThang = false;
    }
    if (kq.lucHopCung) kq.ghiChu.push(`Lục Hợp ở Cung Cư (${cungChi}).`);
    if (kq.lucHopThang) kq.ghiChu.push(`Lục Hợp ở Tháng (${thangChi}).`);
    if (kq.haiCung) kq.ghiChu.push(`Lục Hại ở Cung Cư (${cungChi}).`);
    if (kq.haiThang) kq.ghiChu.push(`Lục Hại ở Tháng (${thangChi}).`);

    NCT_TAM_HINH.forEach(set => {
        banViList.forEach(bv => {
            const mem = [bv, cungChi, thangChi];
            const daDu = set.chis.every(c => mem.includes(c));
            if (!daDu) return;
            if (starKey === 'Thiên Nhuế' && set.ten === 'Vô ân chi hình') {
                kq.ghiChu.push('Bộ Sửu-Mùi-Tuất hội đủ nhưng Thiên Nhuế MIỄN Tam Hình (vì bản thân vừa là Sửu vừa là Mùi) — chỉ tàng chút Nhị Hình Mùi-Tuất (bất trắc nhỏ, ngầm).');
                return;
            }
            kq.tamHinhDu = true;
            kq.tamHinhBo = set;
            kq.ghiChu.push(`ĐỦ TAM HÌNH ${set.chis.join('-')} (${set.ten}) — bại toàn tập, không có yếu tố nào cứu.`);
        });
    });

    return kq;
}

// ------------------------------------------------------------
// G. ĐIỂM NGÀY CHIÊM — chỉ +0.5 hoặc 0, không bao giờ âm
//    (Chi Dương: Tý Dần Thìn Ngọ Thân Tuất | Chi Âm: Sửu Mão Tỵ Mùi Dậu Hợi)
// ------------------------------------------------------------
const NCT_CHI_DUONG = ['Tý','Dần','Thìn','Ngọ','Thân','Tuất'];
function nctDiemNgay(starParity, dayChi) {
    const ngayDuong = NCT_CHI_DUONG.includes(dayChi);
    const hop = (starParity === 'D' && ngayDuong) || (starParity === 'A' && !ngayDuong);
    return hop ? 0.5 : 0;
}

// ------------------------------------------------------------
// H. PHÂN LOẠI ĐIỂM CUỐI THÀNH MỨC LUẬN GIẢI
// ------------------------------------------------------------
function nctPhanLoai(diem) {
    if (diem >= 0.7)  return { muc: 'Đại Cát',  mota: 'Tốt đẹp rõ rệt, việc thành nhanh, mạnh mẽ, thuận lợi toàn diện.' };
    if (diem >= 0.3)  return { muc: 'Cát',      mota: 'Thuận lợi, tốt đẹp vừa phải, việc tiến triển tự nhiên.' };
    if (diem >= -0.15) return { muc: 'Bình Hoà', mota: 'Chưa rõ tốt xấu, trạng thái trung tính — nên xét thêm quẻ Dịch (Thể Dụng Hỗ Biến) để quyết đoán.' };
    if (diem >= -0.6)  return { muc: 'Hung Nhẹ', mota: 'Có khó khăn/trở ngại, tiêu cực có lộ ra nhưng còn lực bổ trợ, chưa đến mức sụp đổ, có thể xoay xở/giảm nhẹ.' };
    return { muc: 'Đại Hung', mota: 'Bất lợi nặng, khó cứu vãn, các đặc tính hung của sao bộc phát mạnh — nên thận trọng, tạm hoãn việc lớn.' };
}

// ------------------------------------------------------------
// I. ENGINE TÍNH 1 BỘ (starKey, cungChi, dayChi, thangChi)
//    -> { diemCung, diemNgay, diemThang, modifier, diemCuoi, phanLoai, nhanCung, nhanThang }
// ------------------------------------------------------------
function nctTinhDiemTongHop(starKey, cungChi, dayChi, thangChi) {
    const sd = NCT_STAR_DATA[starKey];
    const oCung  = nctLayOMonth(starKey, cungChi);
    const oThang = nctLayOMonth(starKey, thangChi);
    const diemCung  = oCung  ? oCung.diem  : 0;
    const diemThang = oThang ? oThang.diem : 0;
    const diemNgay  = nctDiemNgay(sd.parity, dayChi);

    let diemCoBan = (diemCung + diemNgay) * 0.4 + diemThang * 0.6;

    const modifier = nctTinhModifier(starKey, cungChi, thangChi);
    let diemCuoi = diemCoBan;

    if (modifier.tamHinhDu) {
        diemCuoi = Math.min(diemCuoi, -1.0);
    } else {
        if (modifier.hinhBanPhanCung) diemCuoi -= 0.25;   // môi trường áp chế — Cung (trọng số 40%)
        if (modifier.hinhBanPhanThang) diemCuoi -= 0.35;  // môi trường áp chế — Tháng (trọng số 60%, mạnh hơn)
        if (modifier.tamHopDu) {
            diemCuoi += modifier.tamHopChu ? 0.3 : 0.15;
        }
        if (modifier.haiCung || modifier.haiThang) diemCuoi -= 0.1;
        if ((modifier.lucHopCung || modifier.lucHopThang) && diemCuoi < 0) diemCuoi += 0.1;
        if (modifier.tamHopBanPhan && !modifier.tamHopDu && diemCuoi < 0) {
            diemCuoi *= 0.75; // "cảm tình nền" — xoa dịu bớt hung khí (không cộng điểm dương trực tiếp)
        }
    }

    diemCuoi = Math.max(-1.5, Math.min(1.3, diemCuoi));

    return {
        diemCung, diemNgay, diemThang, diemCoBan,
        modifier, diemCuoi,
        phanLoai: nctPhanLoai(diemCuoi),
        nhanCung: oCung ? oCung.nhan : '(không có dữ liệu)',
        nhanThang: oThang ? oThang.nhan : '(không có dữ liệu)',
        nhanhDuocChon: (oCung && oCung.nhanh) || (oThang && oThang.nhanh) || null,
    };
}

// ------------------------------------------------------------
// J. TRÍCH CHI TỪ CHUỖI "Can Chi" (vd "Canh Dần" -> "Dần")
// ------------------------------------------------------------
function nctChiTuCanChi(canChiStr) {
    if (!canChiStr) return null;
    const p = canChiStr.trim().split(/\s+/);
    return p.length >= 2 ? p[1] : null;
}

// ============================================================
// K. THU THẬP DỮ LIỆU ĐẦU VÀO TỪ ctx (đã bổ sung dayChi)
// ============================================================
function nctSplitCanChi(text) {
    if (!text) return null;
    const parts = text.trim().split(/\s+/);
    if (parts.length < 2) return null;
    return { can: parts[0], chi: parts[1] };
}
function nctParseAmLich(text) {
    if (!text) return null;
    const m = text.match(/^(\d+)\s*\/\s*(\d+)/);
    if (!m) return null;
    return { day: parseInt(m[1], 10), month: parseInt(m[2], 10) };
}

function nctThuThapDauVao(ctx) {
    if (!ctx || !ctx.socVong || !ctx.gio) return null;

    const namCC = nctSplitCanChi(ctx.socVong.canChiNam);
    const ngayCC = nctSplitCanChi(ctx.socVong.canChiNgay);
    const amLich = nctParseAmLich(ctx.socVong.amLich);
    const hourChi = ctx.gio.chi;
    if (!namCC || !ngayCC || !amLich || !hourChi) return null;

    const yearChi = namCC.chi;
    const dayCan = ngayCC.can;
    const dayChi = ngayCC.chi;          // << BỔ SUNG — cần cho điểm Âm/Dương Ngày
    const month = amLich.month;
    const day = amLich.day;
    const hCan = ndtHourCan(dayCan, hourChi);

    const ht = ndtHauThien(yearChi, month, day, hourChi);
    const tt = ndtTienThien(hCan, hourChi, ht.chuThoiLenh);

    return {
        duong: ctx.duong,
        yearChi, dayCan, dayChi, hourChi, hCan,

        thangSocVong: {
            so: month,
            canChi: ctx.socVong.canChiThang,
        },
        thangTietKhi: ctx.tietKhi ? {
            canChi: ctx.tietKhi.canChiThang,
            tietHienHanh: ctx.tietKhi.tietHienHanh,
        } : null,

        thienTinh: tt.chuThienTinh,
        cuCung: ht.chuThoiLenh,

        hauThien: ht,
        tienThien: tt,
    };
}

// ============================================================
// L. LUẬN GIẢI CỬU TINH — dùng engine ở Phần I, tính song song
//    Tháng Sóc Vọng + Tháng Tiết Khí (nếu có)
//    input ở đây là bản đã QUA BẢNG RÀ SOÁT (có thể đã bị sửa tay):
//      input.thienTinh.name, input.cuCung, input.dayChi,
//      input.thangSocVongChi, input.thangTietKhiChi (chi thuần, hoặc null)
// ============================================================
function nctLuanGiaiCuuTinh(input) {
    const starKey = input.thienTinh.name;
    const sd = NCT_STAR_DATA[starKey];
    if (!sd) {
        return {
            tomTat: `Chưa có dữ liệu luận giải cho sao "${starKey}" trong bảng tra cứu.`,
            chiTiet: [],
        };
    }

    const kqSoc = nctTinhDiemTongHop(starKey, input.cuCung, input.dayChi, input.thangSocVongChi);
    const kqTiet = input.thangTietKhiChi
        ? nctTinhDiemTongHop(starKey, input.cuCung, input.dayChi, input.thangTietKhiChi)
        : null;

    const tomTat =
        `Sao ${starKey} (Hành ${sd.hanh} ${sd.parity === 'D' ? 'dương' : 'âm'}) cư tại cung ${input.cuCung} — ` +
        `theo Tháng Sóc Vọng (${input.thangSocVongChi}): ${kqSoc.phanLoai.muc} (điểm ${kqSoc.diemCuoi.toFixed(2)})` +
        (kqTiet ? `; theo Tháng Tiết Khí (${input.thangTietKhiChi}): ${kqTiet.phanLoai.muc} (điểm ${kqTiet.diemCuoi.toFixed(2)})` : '');

    function khoiChiTiet(tieuDe, kq, thangChi) {
        const L = [];
        L.push(`• Cung Cư (${input.cuCung}): ${kq.nhanCung}  →  điểm ${kq.diemCung >= 0 ? '+' : ''}${kq.diemCung.toFixed(2)}`);
        L.push(`• Ngày Chiêm (${input.dayChi}): ${kq.diemNgay > 0 ? 'hợp Âm/Dương bản tinh, +0.5' : 'không hợp Âm/Dương bản tinh, +0'}`);
        L.push(`• Tháng (${thangChi}): ${kq.nhanThang}  →  điểm ${kq.diemThang >= 0 ? '+' : ''}${kq.diemThang.toFixed(2)}`);
        if (kq.nhanhDuocChon) L.push(`  (Sao có 2 bản cung song song — đã tự chọn nhánh "${kq.nhanhDuocChon}" vì cho điểm lợi hơn ở phép so sánh này.)`);
        L.push(`• Điểm cơ bản = (Cung+Ngày)×40% + Tháng×60% = ${kq.diemCoBan.toFixed(2)}`);
        if (kq.modifier.ghiChu.length) L.push(`• Modifier (Hợp/Hại/Hình): ${kq.modifier.ghiChu.join(' | ')}`);
        L.push('');
        L.push(`➜ ĐIỂM CUỐI: ${kq.diemCuoi.toFixed(2)}  —  ${kq.phanLoai.muc}`);
        L.push(kq.phanLoai.mota);
        return { tieuDe, noiDung: L.join('\n') };
    }

    const chiTiet = [
        khoiChiTiet(`Luận theo Tháng Sóc Vọng (${input.thangSocVongChi})`, kqSoc, input.thangSocVongChi),
    ];
    if (kqTiet) {
        chiTiet.push(khoiChiTiet(`Luận theo Tháng Tiết Khí (${input.thangTietKhiChi})`, kqTiet, input.thangTietKhiChi));
        if (kqSoc.phanLoai.muc !== kqTiet.phanLoai.muc) {
            chiTiet.push({
                tieuDe: '⚠ Hai cách tính Tháng cho kết quả khác nhau',
                noiDung: `Sóc Vọng → ${kqSoc.phanLoai.muc}; Tiết Khí → ${kqTiet.phanLoai.muc}. ` +
                          `Nên ưu tiên Tiết Khí nếu ngày chiêm quẻ gần điểm giao tiết (Nguyệt Lệnh thực chất theo tiết khí); ` +
                          `tham khảo cả hai để cân nhắc.`,
            });
        }
    } else {
        chiTiet.push({
            tieuDe: 'Tháng Tiết Khí',
            noiDung: '(Không có / ngoài phạm vi dữ liệu — có thể nhập tay ở Bảng rà soát phía trên nếu muốn tính thêm.)',
        });
    }

    return { tomTat, chiTiet };
}

// ============================================================
// M. ADAPTER — Bảng rà soát (bắt buộc xem & có thể sửa) rồi mới
//    tính, sau đó vẽ kết quả (hero + tóm tắt + chi tiết + actions)
// ============================================================
(function () {

    function nctInjectStyleOnce() {
        if (document.getElementById('nct-style')) return;
        const css = `
            .nct-infobar{font-size:.8rem;color:var(--ink-soft);background:var(--paper-alt);
                border:1px solid #e8e2d6;border-radius:8px;padding:8px 12px;margin-bottom:14px;line-height:1.6;}
            .nct-review{border:1.5px solid var(--violet);background:var(--violet-lt);border-radius:10px;padding:14px;margin-bottom:16px;}
            .nct-review-title{font-weight:700;color:var(--violet);margin-bottom:10px;font-size:.9rem;}
            .nct-review-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;}
            .nct-review-grid label{display:flex;flex-direction:column;font-size:.72rem;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.3px;gap:4px;}
            .nct-review-grid select{font-size:.9rem;padding:7px 8px;border-radius:6px;border:1px solid #cfc3e6;background:#fff;font-family:inherit;color:var(--ink);text-transform:none;letter-spacing:0;font-weight:500;}
            .nct-review-note{font-size:.76rem;color:var(--ink-soft);margin:10px 0;line-height:1.5;}
            @media (max-width:480px){.nct-review-grid{grid-template-columns:1fr;}}
            .nct-hero{background:var(--violet-lt);border:1px solid #d8c8ec;border-radius:10px;
                padding:18px 16px;text-align:center;margin-bottom:14px;}
            .nct-hero .nct-tag{font-size:.72rem;color:var(--violet);font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;}
            .nct-hero .nct-name{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--ink);margin-bottom:2px;}
            .nct-hero .nct-sub{font-size:.85rem;color:var(--ink-soft);}
            .nct-kv-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-top:12px;text-align:left;font-size:.83rem;}
            .nct-kv-grid .k{color:var(--ink-soft);font-weight:600;font-size:.68rem;text-transform:uppercase;letter-spacing:.4px;}
            .nct-kv-grid .v{color:var(--gold);font-weight:700;}
            .nct-tomtat{background:var(--teal-lt);border-left:4px solid var(--teal);border-radius:0 8px 8px 0;
                padding:12px 14px;font-size:.85rem;color:var(--ink);margin-bottom:14px;line-height:1.6;}
            .nct-card{border:1px solid #e8e2d6;background:var(--paper-alt);border-radius:8px;padding:12px 14px;margin-bottom:8px;}
            .nct-card .nct-card-title{font-size:.78rem;font-weight:700;color:var(--violet);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;}
            .nct-card .nct-card-body{font-size:.85rem;color:var(--ink);line-height:1.65;white-space:pre-wrap;}
            .nct-actions{display:flex;gap:8px;margin:12px 0 4px;flex-wrap:wrap;}
            .nct-btn{flex:1;min-width:120px;padding:9px 14px;border-radius:8px;font-size:.82rem;font-weight:600;
                cursor:pointer;border:1.5px solid var(--violet);background:white;color:var(--violet);transition:all .15s;font-family:inherit;}
            .nct-btn:hover{background:var(--violet-lt);}
            .nct-btn.primary{background:var(--violet);color:#fff;}
            .nct-btn.primary:hover{background:#5a3f8a;}
            .nct-copied{background:var(--teal) !important;color:#fff !important;border-color:var(--teal) !important;}
            @media (max-width:480px){.nct-kv-grid{grid-template-columns:1fr;}}
        `;
        const style = document.createElement('style');
        style.id = 'nct-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function nctCopy(text, btn) {
        const done = () => {
            if (!btn) return;
            const old = btn.textContent;
            btn.textContent = '✅ Đã copy';
            btn.classList.add('nct-copied');
            setTimeout(() => { btn.textContent = old; btn.classList.remove('nct-copied'); }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => nctFallbackCopy(text, done));
        } else {
            nctFallbackCopy(text, done);
        }
    }
    function nctFallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
    }

    function nctSaveImage(el, filename, btn) {
        if (typeof html2canvas === 'undefined') {
            alert('Chưa có thư viện chụp ảnh (html2canvas). Xem hướng dẫn bật tính năng "Lưu ảnh" trong lich-am-duong.html.');
            return;
        }
        const old = btn ? btn.textContent : null;
        if (btn) btn.textContent = '⏳ Đang lưu...';
        html2canvas(el, { backgroundColor: '#fdfaf5', scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = filename + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (btn) btn.textContent = old;
        }).catch(err => {
            alert('Lỗi khi lưu ảnh: ' + (err && err.message ? err.message : err));
            if (btn) btn.textContent = old;
        });
    }

    function nctBuildFullText(input, luan) {
        const L = [];
        L.push('LUẬN GIẢI CỬU TINH');
        L.push(`Thời điểm: ${input.duong.ngay}/${input.duong.thang}/${input.duong.nam} (${input.duong.thu}) — giờ ${input.hCan} ${input.hourChi}`);
        L.push(`Cung Cư: ${input.cuCung}  |  Chi Ngày: ${input.dayChi}  |  Tháng Sóc Vọng: ${input.thangSocVongChi}` +
               (input.thangTietKhiChi ? `  |  Tháng Tiết Khí: ${input.thangTietKhiChi}` : ''));
        L.push(`Thiên Tinh: ${input.thienTinh.name} (Hành ${input.thienTinh.hanh} ${input.thienTinh.parity === 'D' ? 'dương' : 'âm'})`);
        L.push('');
        L.push(luan.tomTat);
        luan.chiTiet.forEach(c => {
            L.push('');
            L.push('— ' + c.tieuDe + ' —');
            L.push(c.noiDung);
        });
        return L.join('\n');
    }

    // ---- Bước 1: Bảng rà soát (luôn hiện, bắt buộc) ----
    function nctRenderBangRaSoat(input, container) {
        const dsSao = Object.keys(NCT_STAR_DATA);
        const chiThangSoc = nctChiTuCanChi(input.thangSocVong.canChi) || NCT_DS_CHI[0];
        const chiThangTiet = input.thangTietKhi ? nctChiTuCanChi(input.thangTietKhi.canChi) : '';

        function opt(list, sel) {
            return list.map(v => `<option value="${v}" ${v === sel ? 'selected' : ''}>${v}</option>`).join('');
        }

        container.innerHTML = `
            <div class="nct-infobar">
                🕐 Giờ lập quẻ: <b>${input.hCan} ${input.hourChi}</b><br>
                📅 ${input.duong.ngay}/${input.duong.thang}/${input.duong.nam} (${input.duong.thu})
            </div>
            <div class="nct-review">
                <div class="nct-review-title">📋 Bảng dữ liệu đầu vào — kiểm tra & sửa nếu cần, rồi bấm Tính toán</div>
                <div class="nct-review-grid">
                    <label>Thiên Tinh
                        <select id="nct-f-star">${opt(dsSao, input.thienTinh.name)}</select>
                    </label>
                    <label>Cung Cư
                        <select id="nct-f-cung">${opt(NCT_DS_CHI, input.cuCung)}</select>
                    </label>
                    <label>Chi Ngày Chiêm
                        <select id="nct-f-ngay">${opt(NCT_DS_CHI, input.dayChi || NCT_DS_CHI[0])}</select>
                    </label>
                    <label>Tháng Sóc Vọng
                        <select id="nct-f-thangsoc">${opt(NCT_DS_CHI, chiThangSoc)}</select>
                    </label>
                    <label>Tháng Tiết Khí (nếu giao khí lệch Nguyệt Lệnh)
                        <select id="nct-f-thangtiet">
                            <option value="">— không dùng —</option>
                            ${opt(NCT_DS_CHI, chiThangTiet)}
                        </select>
                    </label>
                </div>
                <p class="nct-review-note">Các giá trị trên được trích tự động từ Lịch. Nếu không khớp thực tế (vd ngoài phạm vi dữ liệu Tiết Khí 2023–2046, hoặc muốn thử tình huống khác), hãy sửa trực tiếp trước khi tính.</p>
                <button type="button" class="nct-btn primary" id="nct-btn-tinh">⚙️ Tính toán</button>
            </div>
            <div id="nct-ket-qua"></div>
        `;

        container.querySelector('#nct-btn-tinh').addEventListener('click', function () {
            const starName    = container.querySelector('#nct-f-star').value;
            const cuCung      = container.querySelector('#nct-f-cung').value;
            const dayChi      = container.querySelector('#nct-f-ngay').value;
            const thangSocChi = container.querySelector('#nct-f-thangsoc').value;
            const thangTietChi = container.querySelector('#nct-f-thangtiet').value || null;
            const sd = NCT_STAR_DATA[starName];

            const finalInput = {
                ...input,
                thienTinh: { name: starName, hanh: sd.hanh, parity: sd.parity, num: sd.num },
                cuCung, dayChi,
                thangSocVongChi: thangSocChi,
                thangTietKhiChi: thangTietChi,
            };
            nctRenderKetQua(finalInput, container.querySelector('#nct-ket-qua'));
        });
    }

    // ---- Bước 2: Vẽ kết quả sau khi bấm Tính toán ----
    function nctRenderKetQua(input, target) {
        const luan = nctLuanGiaiCuuTinh(input);

        const heroHtml = `
            <div class="nct-hero">
                <div class="nct-tag">Thiên Tinh cư Cung</div>
                <div class="nct-name">${input.thienTinh.name}</div>
                <div class="nct-sub">Hành ${input.thienTinh.hanh} ${input.thienTinh.parity === 'D' ? 'dương' : 'âm'} — cư tại cung <b>${input.cuCung}</b></div>
                <div class="nct-kv-grid">
                    <div><div class="k">Chi Ngày</div><div class="v">${input.dayChi}</div></div>
                    <div><div class="k">Tháng Sóc / Tiết</div><div class="v">${input.thangSocVongChi}${input.thangTietKhiChi ? ' / ' + input.thangTietKhiChi : ''}</div></div>
                </div>
            </div>
        `;
        const tomTatHtml = `<div class="nct-tomtat">${luan.tomTat}</div>`;
        const chiTietHtml = luan.chiTiet.map(c => `
            <div class="nct-card">
                <div class="nct-card-title">${c.tieuDe}</div>
                <div class="nct-card-body">${c.noiDung}</div>
            </div>
        `).join('');

        target.innerHTML = `
            <div id="nct-save-target">
                ${heroHtml}
                ${tomTatHtml}
                ${chiTietHtml}
            </div>
            <div class="nct-actions">
                <button type="button" class="nct-btn primary" id="nct-btn-save">📷 Lưu ảnh</button>
                <button type="button" class="nct-btn" id="nct-btn-copy">📋 Copy text</button>
            </div>
        `;

        const saveTarget = target.querySelector('#nct-save-target');
        target.querySelector('#nct-btn-save').addEventListener('click', function () {
            nctSaveImage(saveTarget, 'cuuTinh_' + input.thienTinh.name + '_' + input.cuCung, this);
        });
        target.querySelector('#nct-btn-copy').addEventListener('click', function () {
            nctCopy(nctBuildFullText(input, luan), this);
        });
    }

    NguLinhEngine.register({
        id: 'cuu-tinh-luan',
        name: 'Luận Giải Cửu Tinh',
        render: function (ctx, container) {
            nctInjectStyleOnce();
            const input = nctThuThapDauVao(ctx);
            if (!input) {
                container.innerHTML = '<p style="color:var(--red)">Thiếu dữ liệu (Sóc Vọng / Giờ) hoặc dữ liệu không hợp lệ — không thể luận giải.</p>';
                return;
            }
            nctRenderBangRaSoat(input, container);
        }
    });

})();
