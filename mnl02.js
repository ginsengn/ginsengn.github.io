/* ============================================================
   MODULE mnl02 — CỬU TINH × 12 CUNG × VIỆC CẦU (đào sâu từ mnl01)
   ------------------------------------------------------------
   PHỤ THUỘC: phải nạp SAU mnl01.js (dùng lại các hàm/dữ liệu toàn cục
   của mnl01: NCT_CHI, NCT_STAR_DATA, nctThuThapDauVao,
   nctTinh3Tang, nctTruongSinhCanNgay, NCT_MUC_RANK, NCT_MO_KHO,
   nctChiTuCanChi, NCT_DS_CHI, NCT_CHI_DUONG, NCT_CAN).

   THEO TÀI LIỆU: LOGIC-CUU-TINH-TONG-HOP.md (mục 5, 6, 7, 10, 11, 12)
     1. Trường Sinh của CUNG CƯ theo CAN NGÀY -> vượng / suy / trung bình
     2. Phân loại sao (Nhất Cát / Thứ Cát / Lưng chừng / Hung)
     3. Lâm cung (chính vị = vua ở nước mình), thứ vị (quý khách)
     4. Sao ↔ việc cầu (◎ ○ △ ✕), Cung ↔ việc cầu (thuận / bất lợi)
     5. Cổng kích hoạt (sao từ trung bình trở lên ở mọi điều kiện)
     6. Sao suy: mặt tối tự bộc lộ, chọn "góc khuất" của Cung, cộng hưởng
     7. Mức cảnh giác + thế tiến công / phòng thủ

   LƯU Ý: các ngưỡng/mức trong file này là ƯỚC LƯỢNG TƯƠNG ĐỐI, để
   người xem tự cân nhắc; và các ô đánh dấu [HÀNH] là suy từ ngũ hành,
   cần người dùng duyệt.
   ============================================================ */

// ------------------------------------------------------------
// A. VIỆC CẦU (dùng làm nút chọn) — thứ tự cố định cho chuỗi mức
// ------------------------------------------------------------
const NCT2_TOPICS = [
    { ma: 'QC',  ten: 'Công danh, quan chức, thăng tiến' },
    { ma: 'TAI', ten: 'Cầu tài, kinh doanh, buôn bán' },
    { ma: 'HN',  ten: 'Hôn nhân, tình cảm, cưới hỏi' },
    { ma: 'TS',  ten: 'Thai sản, sinh nở, con cái' },
    { ma: 'THI', ten: 'Thi cử, học hành, văn bằng, giấy tờ' },
    { ma: 'GD',  ten: 'Giao dịch, hợp tác, gặp đối tác' },
    { ma: 'XH',  ten: 'Xuất hành, đi xa, di cư' },
    { ma: 'BT',  ten: 'Bệnh tật, sức khoẻ' },
    { ma: 'KT',  ten: 'Kiện tụng, tranh chấp' },
    { ma: 'XD',  ten: 'Xây cất, điền trạch, đất đai, khởi tạo' },
    { ma: 'TN',  ten: 'Tìm người, tin người đi xa, hẹn gặp' },
    { ma: 'QS',  ten: 'Đấu tranh / quân sự (tiến hoặc thủ)' },
    { ma: 'AN',  ten: 'An ninh, mất của, trộm cắp' },
    { ma: 'MUU', ten: 'Mưu tính, kế sách, gặp quý nhân' },
    { ma: 'PL',  ten: 'Pháp lý, đấu tranh tiêu cực, tố giác' },
];
const NCT2_TOPIC_CODES = NCT2_TOPICS.map(t => t.ma);
function nct2TenViec(ma) {
    const t = NCT2_TOPICS.find(x => x.ma === ma);
    return t ? t.ten : ma;
}

// Nhãn mức quan hệ Sao ↔ việc cầu
const NCT2_MUC_QUAN_HE = {
    C: { ky: '◎', ten: 'Chủ quản' },
    O: { ky: '○', ten: 'Có quan tâm/trợ đỡ' },
    T: { ky: '△', ten: 'Không chủ mảng này (bàng quan)' },
    X: { ky: '✕', ten: 'Không hợp' },
    Y: { ky: '✕✕', ten: 'Rất không hợp' },
};

// ------------------------------------------------------------
// B. NHÃN "TAG" DÙNG ĐỂ PHÁT HIỆN CỘNG HƯỞNG giữa mặt tối của Sao
//    và góc khuất (mặt hung) của Cung
// ------------------------------------------------------------
const NCT2_TAG_TEN = {
    tri_tre: 'trì trệ, ngưng đọng', tham_hiem: 'thâm hiểm', dam_dat: 'dâm dật',
    lo_au: 'lo âu, buồn phiền', oan_trai: 'oan trái', kien_tung: 'kiện tụng, tranh đấu',
    nhap_mo: 'nhập mộ', thi_phi: 'thị phi khẩu thiệt', mat_cua: 'mất của, trộm cắp',
    benh: 'bệnh tật', chia_ly: 'chia ly, rạn nứt', lua_dao: 'lừa lọc, tráo trở, không thật',
    cai_va: 'cãi vã', pha_ngang: 'phá ngang', tai_nan: 'tai nạn, tai hoạ',
    hoa_khi: 'hoả khí', kinh_so: 'kinh sợ, nghi hoặc', tang_che: 'tang chế',
    hao_tai: 'hao tài, tổn của', thay_doi: 'thay đổi, đảo lộn', canh_tranh: 'cạnh tranh, dời đổi',
    hon_thai_kt: 'hôn nhân/thai sản không thuận', lao_tam: 'lao tâm khổ tứ',
    do_vo: 'đổ vỡ', that_bai: 'thất bại', thai_hong: 'hỏng thai', giay_to: 'vướng giấy tờ, thủ tục',
};

// ------------------------------------------------------------
// C. DỮ LIỆU 10 SAO (mở rộng từ mnl01)
//    mucViec: chuỗi 15 ký tự theo thứ tự NCT2_TOPIC_CODES
//             (C ◎ / O ○ / T △ / X ✕ / Y ✕✕)
//    darkTopics: việc cầu trùng mặt tối khi sao suy -> cảnh giác cao nhất
//    darkTags: mặt tối khi suy (để đối chiếu cộng hưởng với góc khuất Cung)
// ------------------------------------------------------------
const NCT2_STAR_META = {
    'Thiên Phụ': {
        phanLoai: 'nhatCat', nhan: 'Nhất Cát', hang: null,
        chuQuan: 'Giao dịch, hôn nhân gia đình, thai sản sinh nở, thi cử học hành, đi lại làm ăn, xây sửa',
        khongUa: 'Quân sự/chinh chiến không phải sở trường',
        mucViec: 'OOCCCCOOTOTTTOT',
        the: 'Mở rộng bằng giao dịch', theDai: 'Mở rộng quan hệ, hợp tác, giáo dục văn hoá',
        matToi: 'Lao tâm khổ tứ; thay lòng đổi dạ, tráo trở; tai nạn giao thông; chia ly rạn nứt',
        suyNenLam: null,
        darkTopics: ['HN', 'GD', 'XH', 'TS'],
        darkTags: ['lao_tam', 'lua_dao', 'tai_nan', 'chia_ly'],
    },
    'Thiên Tâm': {
        phanLoai: 'nhatCat', nhan: 'Nhất Cát', hang: null,
        chuQuan: 'Tài lộc, kinh doanh buôn bán (mạnh nhất), chỉ huy quân sự, lãnh đạo, chữa bệnh chế thuốc',
        khongUa: 'Hôn nhân, thai sản không phải sở trường (vô cảm dù vượng)',
        mucViec: 'CCOTTOOCTOTCOCC',
        the: 'Tiến công có mưu lược', theDai: 'Mở rộng kinh doanh có kế hoạch, lãnh đạo dẫn dắt, đấu tranh với tội phạm/sai phạm',
        matToi: 'Thất bại, kiếp tài; xuất hành hao tổn; trộm cướp (nếu quẻ xấu)',
        suyNenLam: null,
        darkTopics: ['TAI', 'XH', 'AN'],
        darkTags: ['that_bai', 'hao_tai', 'mat_cua'],
    },
    'Thiên Nhậm': {
        phanLoai: 'nhatCat', nhan: 'Nhất Cát', hang: null,
        chuQuan: 'Quan chức, tài lộc, buôn bán, điền sản, xây dựng, cưới hỏi, khởi tạo, an dân (toàn diện nhất)',
        khongUa: 'Bệnh tật (Thổ trì trệ: nuôi dưỡng bệnh, chồng bệnh, chôn lấp); khi suy hoá Hãm tinh',
        mucViec: 'CCOTOOTXOCTCOOC',
        the: 'Tiến công + nền tảng', theDai: 'Xây dựng thể chế/hệ thống, cải tạo môi trường sống, thực thi pháp luật, phát triển bền vững',
        matToi: 'Hãm tinh: trì trệ, khó thành, thất thoát kinh doanh; hôn nhân, thai sản, thi cử đều không tốt; không gặp người; tin người đi xa "chưa về"',
        suyNenLam: null,
        darkTopics: ['TAI', 'HN', 'TS', 'THI', 'TN', 'XD', 'XH', 'BT'],
        darkTags: ['tri_tre', 'hao_tai', 'hon_thai_kt'],
    },
    'Thiên Xung': {
        phanLoai: 'thuCat', nhan: 'Thứ Cát', hang: null,
        chuQuan: 'Quân sự: chọn tướng, giao chiến, chinh phạt (phạm vi hẹp); nếu cung/ngày Dương có thể cứu giải tai ách',
        khongUa: 'Văn bản ghi rõ: các việc khác không thuận lợi',
        mucViec: 'TOTOTOTOTXTCTTC',
        the: 'Tiến công mạnh nhất', theDai: 'Tấn công đúng phạm vi: mở rộng thị trường, tung sản phẩm, đấu tranh xoá bất công, tố giác tiêu cực',
        matToi: 'Chinh phạt, báo ân báo oán; đổ vỡ, cứng rắn, xung đột; người bỏ đi khó về; hỏng thai/lưu thai',
        suyNenLam: 'Chỉ nên nhậm chức võ quan, xây dinh trại, xuất binh',
        darkTopics: ['TS', 'TN', 'HN', 'TAI', 'XD', 'KT'],
        darkTags: ['kien_tung', 'do_vo', 'thi_phi', 'thai_hong'],
    },
    'Thiên Cầm': {
        phanLoai: 'thuCat', nhan: 'Thứ Cát', hang: null,
        chuQuan: 'Thi cử, văn bằng, giấy tờ thủ tục, hôn nhân tình cảm, thuốc men, ấn tín (tượng súc vật, vải, da)',
        khongUa: 'Không thuộc hàng "ba tinh" đầu — sức tốt kém Nhất Cát dù domain khá rộng',
        mucViec: 'OOCTCOTOTOTTTOO',
        the: 'Chính đính, văn thư', theDai: 'Làm đúng quy trình, pháp lý, chứng chỉ, thủ tục',
        matToi: 'Mất mát, thua thiệt, gãy đổ; thi trượt; hôn nhân không thành, chia ly; vướng giấy tờ thủ tục',
        suyNenLam: null,
        darkTopics: ['THI', 'HN'],
        darkTags: ['hao_tai', 'chia_ly', 'giay_to', 'do_vo'],
    },
    'Thiên Anh': {
        phanLoai: 'lungChung', nhan: 'Lưng chừng (trung bình / tiểu hung)', hang: null,
        chuQuan: 'Mưu tính, kế sách, gặp quý nhân, danh tiếng (ý nghĩa gần Thiên Cầm nhưng nhạt hơn)',
        khongUa: 'Không hợp cầu tài, cưới xin, di cư',
        mucViec: 'CXXTOTTTTTTTTCT',
        the: 'Mưu lược, cố vấn', theDai: 'Lập kế hoạch, chiến lược, tìm người bảo trợ (không phải hành động cứng)',
        matToi: 'Thất hãm, tai hoạ, suy bại; xuất hành chưa đi được/sự cố; hôn nhân chưa thành; kinh doanh có lời nhưng khó khăn; thi trượt/đỗ vớt',
        suyNenLam: null,
        darkTopics: ['XH', 'HN', 'TAI', 'THI', 'MUU'],
        darkTags: ['that_bai', 'tai_nan', 'hon_thai_kt'],
    },
    'Thiên Bồng': {
        phanLoai: 'hung', nhan: 'Hung Tinh (hạng 3 — nhẹ nhất)', hang: 3,
        chuQuan: 'Uy quyền, công danh quan chức, thành trì/đê điều/công trình, phòng thủ; khi vượng có kinh doanh, hôn nhân (Đào hoa)',
        khongUa: 'Xuất hành, bệnh tật, an ninh (trộm cắp mất của); kinh doanh/đi xa bất lợi nếu không vượng',
        mucViec: 'COOTTOXXTCTCXTO',
        the: 'Phòng thủ', theDai: 'Củng cố, bảo vệ tài sản, an ninh, hạ tầng phòng hộ',
        matToi: 'Phá tán, khắc hãm, đổ vỡ; chia ly; tai ương, đạo tặc, hoả hoạn; cưới xin, giao dịch, hội họp hao thiệt; hoá Dâm tinh (gia đạo, ăn uống, dâm sự); tin người đi xa "còn phiêu lãng"',
        suyNenLam: 'Chỉ tụ họp bạn bè vui vẻ là tốt',
        darkTopics: ['TAI', 'HN', 'GD', 'XH', 'AN', 'XD'],
        darkTags: ['hao_tai', 'chia_ly', 'mat_cua', 'hoa_khi', 'dam_dat', 'tai_nan'],
    },
    'Thiên Nhuế': {
        phanLoai: 'hung', nhan: 'Hung Tinh (hạng 2 — bệnh tinh)', hang: 2,
        chuQuan: 'Uy quyền, phú quý, danh dự địa vị; thầy dạy nghề, giao lưu kết bạn; đóng quân trấn thủ',
        khongUa: 'Cưới hỏi, kiện tụng, di cư, xây dựng, dùng binh; bệnh tật là dụng thần bệnh (nguy nhất)',
        mucViec: 'CTXTOOXYXXXOTTX',
        the: 'Cố thủ, truyền nghề', theDai: 'Giữ nề nếp, đào tạo, kết nối; tránh mở rộng, kiện tụng, di dời',
        matToi: 'Tai nạn, nguy hiểm, tiến thoái bất nhất; bệnh nguy khốn; thất tài; trì trệ, không gặp người/đợi lâu; tượng xe tang, chết nếu quẻ xấu',
        suyNenLam: null,
        darkTopics: ['BT', 'TAI', 'TN', 'XH', 'XD'],
        darkTags: ['tai_nan', 'benh', 'hao_tai', 'tri_tre', 'nhap_mo', 'tang_che'],
    },
    'Thiên Trụ': {
        phanLoai: 'hung', nhan: 'Hung Tinh (hạng 2 — nguy về thai sản/tính mạng)', hang: 2,
        chuQuan: 'Khi vượng: kinh doanh cầu tài, điền trạch đất cát, hôn nhân gia đình; doanh trại, luyện binh (phòng thủ)',
        khongUa: 'Chinh chiến, xuất hành, an ninh; thai sản đặc biệt nguy khi suy',
        mucViec: 'OCCYTTXTTCTCXTO',
        the: 'Phòng thủ, luyện tập', theDai: 'Đào tạo, củng cố nội lực, giữ nhịp, tránh mở mặt trận mới',
        matToi: 'Phá ngang, đổ vỡ, chia ly, hình thương khắc hại; xuất hành gặp cướp (nhất là cung Thân + quẻ xấu); thai sản huỷ bỏ, nguy hiểm cả mẹ',
        suyNenLam: 'Tế tự, làm phúc, nhún nhường, nín nhịn; không hành động/mưu vọng lớn',
        darkTopics: ['TS', 'XH', 'HN', 'AN', 'TAI', 'XD'],
        darkTags: ['do_vo', 'chia_ly', 'tai_nan', 'mat_cua', 'thai_hong', 'tang_che'],
    },
    'Thiên Không': {
        phanLoai: 'hung', nhan: 'Hung Tinh (hạng 1 — hung nhất, "tiện tinh")', hang: 1,
        chuQuan: '(Không có mảng nào thật sự sáng) — dù vượng chỉ che lấp cái xấu, đôi khi có giá trị tích cực nhỏ',
        khongUa: 'Phàm chiêm gặp Thiên Không là không cát lợi',
        mucViec: 'XXXXXXXXXXXXXXX',
        the: 'Không hợp tiến lẫn thủ', theDai: 'Đổi dự định, đổi phương pháp tiếp cận, tạm hoãn',
        matToi: 'Thất tán, bại tuyệt, vô vọng; lừa đảo, trộm cắp; tin thất thiệt; thương tổn chân tay, máu huyết, tim mạch; bệnh ảo (nếu Phụ Mẫu nhiều/động)',
        suyNenLam: null,
        darkTopics: NCT2_TOPIC_CODES.slice(),
        darkTags: ['hao_tai', 'lua_dao', 'mat_cua', 'benh', 'tri_tre', 'tai_nan'],
    },
};

// Ghi chú riêng cho một số cặp Sao × Việc
const NCT2_GHI_CHU_SAO_VIEC = {
    'Thiên Bồng|TAI': 'Chỉ khi sao từ trung bình trở lên; luôn đề phòng trộm cắp, mất của.',
    'Thiên Bồng|HN': 'Sao vượng hoá Đào hoa (hôn nhân nhanh nhẹn, may mắn); suy hoá Dâm tinh. Sao Thuỷ dương ứng hợp ngày Âm.',
    'Thiên Trụ|TAI': 'Chỉ khi sao vượng; luôn đề phòng xe hỏng, tai nạn ngoài ý muốn.',
    'Thiên Trụ|XD': 'Điền trạch, đất cát tốt khi sao vượng.',
    'Thiên Nhuế|BT': 'Bệnh tinh, là dụng thần của bệnh tật — xét kỹ vị trí bệnh và mức nghiêm trọng.',
    'Thiên Tâm|BT': 'Tượng trị bệnh, chế thuốc — có lợi cho việc chữa trị.',
    'Thiên Cầm|BT': 'Tượng thuốc men (Đông y hay Tây y).',
    'Thiên Xung|BT': 'Nếu cư cung Dương hoặc gặp ngày Dương thì có khả năng cứu giải tai ách.',
    'Thiên Nhậm|XD': 'Tượng buôn may bán đất, nền móng, hậu phương.',
    'Thiên Nhậm|BT': 'Thổ chủ tĩnh, trì trệ: nuôi dưỡng bệnh, chồng bệnh, chôn lấp — xem thêm Lục Hào.',
    'Thiên Cầm|THI': 'Sao chủ văn bằng, thi cử, giấy tờ.',
    'Thiên Phụ|TS': 'Sao Mộc chủ tạo mầm, sinh sôi: thai sản, sinh nở tốt khi từ trung bình trở lên [HÀNH].',
    'Thiên Phụ|HN': 'Hôn nhân gia đình, hai nhà hoà hợp khi sao vượng.',
    'Thiên Xung|TS': 'Sao Mộc chủ tạo mầm [HÀNH]; nhưng khi suy: hỏng thai/lưu thai.',
};

// ------------------------------------------------------------
// D. DỮ LIỆU 12 CUNG (môi trường)
//    thuan / batLoi: các việc cầu mà cung thuận lợi / có góc khuất
//    (việc nằm ở cả hai: cung vượng -> thuận, cung suy -> bất lợi)
// ------------------------------------------------------------
const NCT2_CUNG_META = {
    'Tý':   { tuong: 'Thuỷ cung (sông hồ, biển lạch)', cat: 'Thông thoáng, động, chảy, trong sạch, thông minh',
              hung: 'Ngưng đọng, thâm hiểm, vương bẩn tù đọng, dâm dật',
              thuan: ['THI', 'GD', 'XH', 'TN'], batLoi: ['HN', 'KT', 'BT', 'AN'],
              hungTags: ['tri_tre', 'tham_hiem', 'dam_dat'] },
    'Sửu':  { tuong: 'Thổ cung (tường thành, nhà cửa, cầu cống)', cat: 'Vui mừng, tiến phát',
              hung: 'Lo lắng, buồn phiền, oan trái, tụng đình, nhập mộ',
              thuan: ['XD', 'QS'], batLoi: ['KT', 'BT'],
              hungTags: ['lo_au', 'oan_trai', 'kien_tung', 'nhap_mo'] },
    'Dần':  { tuong: 'Gỗ (bàn ghế, nhà cửa, rừng núi)', cat: 'Ấn tín, giấy tờ, tin tức đang mong hay tiền bạc đến',
              hung: 'Xung động, thị phi khẩu thiệt, mất của, ốm đau, chuyện khó chịu bực mình',
              thuan: ['THI', 'TN', 'TAI', 'GD'], batLoi: ['KT', 'AN', 'BT'],
              hungTags: ['thi_phi', 'mat_cua', 'benh'] },
    'Mão':  { tuong: 'Mộc âm (gỗ gia dụng)', cat: 'Mọi việc thuận hoà, yên ổn, mưu sự dễ thành',
              hung: 'Cãi vã, chia ly, cách trở, không thật, quẩn quanh, mục rỗng',
              thuan: ['GD', 'HN', 'MUU', 'TS'], batLoi: ['HN', 'TN'],
              hungTags: ['cai_va', 'chia_ly', 'lua_dao'] },
    'Thìn': { tuong: 'Thổ dương (đồi núi, ruộng, mồ mả, đường đi)', cat: 'Vui vẻ, bay cao, tiến thẳng, văn hoa sáng đẹp',
              hung: 'Tranh đấu, cãi vã, phá ngang, mưu sự chật vật khó thành, nhập mộ',
              thuan: ['THI', 'QC'], batLoi: ['KT', 'BT'],
              hungTags: ['kien_tung', 'pha_ngang', 'tri_tre', 'nhap_mo'] },
    'Tỵ':   { tuong: 'Lửa lò, bếp, đèn điện', cat: 'Nhẹ nhàng, thăng tiến, tươi nhuận, sáng sủa',
              hung: 'Không may, u tối, tai bay vạ gió, đau thương, hoả khí',
              thuan: ['QC', 'MUU', 'THI'], batLoi: ['AN', 'BT'],
              hungTags: ['tai_nan', 'hoa_khi', 'benh'] },
    'Ngọ':  { tuong: 'Hoả dương (sấm sét, lửa thiên địa, điện)', cat: 'Tin vui về ấn tín, văn thư, thi cử, mọi việc may mắn tươi sáng',
              hung: 'Kinh sợ, nghi hoặc, cân nhắc so đo, thị phi khẩu thiệt, tai nạn, hoả khí',
              thuan: ['THI', 'QC'], batLoi: ['KT', 'XH', 'AN'],
              hungTags: ['kinh_so', 'thi_phi', 'tai_nan', 'hoa_khi'] },
    'Mùi':  { tuong: 'Đất đình chùa, tường hoa, cây cảnh', cat: 'Ăn uống, rượu chè, vui vẻ, hanh thông',
              hung: 'Không bình lặng, lôi thôi, tang chế, hỏng việc, ốm đau, ngộ độc, nhập mộ',
              thuan: ['GD'], batLoi: ['BT'],
              hungTags: ['tang_che', 'benh', 'nhap_mo'] },
    'Thân': { tuong: 'Vàng trong đất, đá, núi', cat: 'Tiến phát tài lộc, dịch mã, tin mừng, mưu sự chóng thành đạt',
              hung: 'Hao tài tốn của, tật ách, tai nạn, ốm đau, chòng chành dễ đổ dễ chìm',
              thuan: ['TAI', 'XH', 'TN'], batLoi: ['TAI', 'BT', 'XH'],
              hungTags: ['hao_tai', 'benh', 'tai_nan'] },
    'Dậu':  { tuong: 'Vàng trang sức', cat: 'Tin tưởng, thừa nhận, uy tín, không thay đổi, hoà hợp',
              hung: 'Thay đổi, đảo lộn, lừa lọc, tang gia, đạo tặc, mất mát, khó thành',
              thuan: ['GD', 'HN', 'TAI'], batLoi: ['AN'],
              hungTags: ['thay_doi', 'lua_dao', 'tang_che', 'mat_cua'] },
    'Tuất': { tuong: 'Thổ dương (nhà tù, mồ mả, đường đi)', cat: 'Phúc đức, ấn tín, nên cầu phúc làm phúc',
              hung: 'Tráo trở, không thật, đấu tranh, hình ngục, nhập mộ',
              thuan: ['THI'], batLoi: ['KT', 'GD'],
              hungTags: ['lua_dao', 'kien_tung', 'nhap_mo'] },
    'Hợi':  { tuong: 'Thuỷ âm cung', cat: 'Tin mừng về hỷ, thai sản, mưu sự thành đạt, công việc toại lòng',
              hung: 'Cạnh tranh, dịch mã dời đổi, hôn nhân thai sản không thuận, mưu vượng khó thành, ngưng đọng, u uất',
              thuan: ['TS', 'HN', 'MUU'], batLoi: ['HN', 'TS', 'XH'],
              hungTags: ['canh_tranh', 'hon_thai_kt', 'tri_tre'] },
};

// ------------------------------------------------------------
// E. DANH SÁCH CAN (dùng cho dropdown) -- hàm Trường Sinh thật dùng
//    chung nctTruongSinhCanNgay() của mnl01, không định nghĩa lại ở đây.
// ------------------------------------------------------------
const NCT2_CAN = NCT_CAN.slice();

// ============================================================
// F. ENGINE
// ============================================================

// F1. Trường Sinh Cung theo Can Ngày -- DÙNG LẠI nctTruongSinhCanNgay của mnl01
//     (engine chính giờ là mô hình "3 tầng tên lửa" ở mnl01, mnl02 chỉ map
//     kết quả sang hình dạng cũ để tái dùng các hàm diễn giải bên dưới).
const NCT2_NHOM_TEN = { vuong: 'VƯỢNG khí', suy: 'SUY khí', trungBinh: 'TRUNG BÌNH' };
function nct2TruongSinh(dayCan, cungChi) {
    const t = nctTruongSinhCanNgay(dayCan, cungChi);
    if (!t) return null;
    const nhom = (t.muc === 'vuong' || t.muc === 'kha') ? 'vuong' : (t.muc === 'trungBinh' ? 'trungBinh' : 'suy');
    return { idx: t.idx, ten: t.ten, nhom, nang: t.muc === 'tuMoTuyet' };
}

// F3. Vị trí của sao: chính vị (Lâm cung) / thứ vị (quý khách) / khác
function nct2ViTri(starKey, cungChi) {
    const sd = NCT_STAR_DATA[starKey];
    if (sd.banVi.includes(cungChi)) return 'chinh';
    if ((sd.thuVi || []).includes(cungChi)) return 'khach';
    return 'khac';
}

// F4. Mức quan hệ Sao ↔ việc cầu (C/O/T/X/Y)
function nct2MucQuanHe(starKey, ma) {
    const meta = NCT2_STAR_META[starKey];
    const i = NCT2_TOPIC_CODES.indexOf(ma);
    return (meta && i >= 0) ? meta.mucViec.charAt(i) : 'T';
}

// F5. Quan hệ Cung ↔ việc cầu
function nct2CungViec(cungChi, ma, group) {
    const c = NCT2_CUNG_META[cungChi];
    const maCung = (ma === 'PL') ? 'KT' : ma; // pháp lý dùng góc khuất của kiện tụng
    const inT = ma !== 'PL' && c.thuan.includes(ma);
    const inB = c.batLoi.includes(maCung);
    if (inT && inB) return group === 'vuong' ? 'thuan' : (group === 'suy' ? 'batLoi' : 'trung');
    if (inT) return group === 'suy' ? 'trung' : 'thuan';
    if (inB) return group === 'vuong' ? 'batLoiNhe' : 'batLoi';
    return 'trung';
}
const NCT2_CUNG_VIEC_TEN = {
    thuan: 'THUẬN lợi', trung: 'trung tính', batLoiNhe: 'có góc khuất nhỏ (cung vượng nên ẩn, giới hạn)', batLoi: 'BẤT LỢI',
};

// F6. Cộng hưởng: mặt tối của sao trùng góc khuất của cung
function nct2CongHuong(starKey, cungChi) {
    const a = NCT2_STAR_META[starKey].darkTags;
    const b = NCT2_CUNG_META[cungChi].hungTags;
    return a.filter(t => b.includes(t)).map(t => NCT2_TAG_TEN[t] || t);
}

// F6b. Rủi ro có thể "hiện hình" theo việc cầu (mặt tối sao ∪ góc khuất cung; cộng hưởng nêu trước)
const NCT2_RUI_RO_CHUNG = {
    tai_nan: 'tai nạn, sự cố bất ngờ', hoa_khi: 'hoả hoạn, chập điện, nóng bức', hao_tai: 'hao tài, tốn của, vượt chi phí',
    mat_cua: 'mất của, trộm cắp', lua_dao: 'bị lừa dối, đối tác/tin tức không thật', kien_tung: 'tranh chấp, kiện tụng',
    benh: 'bệnh tật, sức khoẻ suy giảm', tri_tre: 'trì trệ, chậm trễ, đình đốn', chia_ly: 'chia ly, rạn nứt',
    do_vo: 'đổ vỡ, hỏng việc', that_bai: 'thất bại, không thành', thi_phi: 'thị phi, tiếng xấu', tang_che: 'tang chế, chuyện buồn',
    nhap_mo: 'nhập mộ: việc bị chôn vùi, giam hãm', lao_tam: 'lao tâm khổ tứ', thai_hong: 'hỏng thai',
    hon_thai_kt: 'hôn nhân/thai sản không thuận', kinh_so: 'kinh sợ, nghi hoặc', dam_dat: 'dâm dật, sa đà',
    cai_va: 'cãi vã', pha_ngang: 'bị phá ngang', thay_doi: 'thay đổi, đảo lộn liên tục', canh_tranh: 'cạnh tranh, dời đổi',
    lo_au: 'lo âu, buồn phiền', oan_trai: 'oan trái', tham_hiem: 'thâm hiểm, ngầm hại', giay_to: 'vướng giấy tờ, thủ tục',
};
const NCT2_RUI_RO_VIEC = {
    XD: { tai_nan: 'tai nạn lao động, sự cố công trình, ngã đổ', hoa_khi: 'cháy nổ, chập điện, nóng bức công trường',
          hao_tai: 'vượt dự toán, chi phí phát sinh, thất thoát', mat_cua: 'mất vật liệu, mất cắp công trường',
          lua_dao: 'nhà thầu/nhà cung cấp lừa dối, bội tín, thông tin sai', kien_tung: 'tranh chấp ranh giới, kiện tụng đất đai',
          benh: 'bệnh do bụi, nắng nóng, kiệt sức; thương tổn chân tay', tri_tre: 'đình trệ, chậm tiến độ',
          do_vo: 'sai hỏng, đổ vỡ kế hoạch/công trình', nhap_mo: 'nhập mộ: đất/việc bị chôn vùi, giam hãm',
          that_bai: 'công trình dang dở, không như ý', thay_doi: 'phải đổi thiết kế/phương án liên tục' },
    TAI: { hao_tai: 'thua lỗ, hao tổn vốn', lua_dao: 'bị lừa, đối tác không thật', mat_cua: 'mất tiền, trộm cắp', tri_tre: 'dòng tiền đình trệ',
           that_bai: 'thất bại, kiếp tài', do_vo: 'đổ vỡ hợp tác' },
    XH: { tai_nan: 'tai nạn trên đường, sự cố chuyến đi', mat_cua: 'mất đồ, gặp trộm cướp', lua_dao: 'gặp lừa đảo', benh: 'ốm đau, mệt mỏi dọc đường',
          tri_tre: 'chậm trễ, chưa đi được' },
    BT: { benh: 'bệnh nặng thêm, dai dẳng', tri_tre: 'bệnh trì trệ, khó dứt', tai_nan: 'tai biến, biến chứng bất ngờ', tang_che: 'nguy cơ nghiêm trọng (cần xem Lục Hào)' },
    HN: { chia_ly: 'chia ly, rạn nứt', lua_dao: 'thay lòng, tráo trở', dam_dat: 'dâm sự, sa đà', hon_thai_kt: 'hôn nhân không thuận', cai_va: 'cãi vã, xung đột' },
    TS: { thai_hong: 'hỏng thai/lưu thai', hon_thai_kt: 'thai sản không thuận', benh: 'sức khoẻ mẹ suy giảm', tai_nan: 'sự cố nguy hiểm khi sinh nở' },
};
function nct2RuiRo(starKey, cungChi, ma) {
    const meta = NCT2_STAR_META[starKey], cung = NCT2_CUNG_META[cungChi];
    const ch = meta.darkTags.filter(t => cung.hungTags.includes(t));
    const rest = meta.darkTags.filter(t => !ch.includes(t)).concat(cung.hungTags.filter(t => !meta.darkTags.includes(t)));
    const ph = t => (NCT2_RUI_RO_VIEC[ma] && NCT2_RUI_RO_VIEC[ma][t]) || NCT2_RUI_RO_CHUNG[t] || NCT2_TAG_TEN[t] || t;
    return { congHuong: ch.map(ph), khac: rest.map(ph) };
}

// F7. Mức cảnh giác
const NCT2_CANH_GIAC_TEN = {
    thap: 'THẤP', trung: 'TRUNG BÌNH (đề phòng cấp trung)', cao: 'CAO', caoNhat: 'CAO NHẤT',
};
function nct2CanhGiac(meta, tinh, groupEff, gate, cungTD) {
    if (meta.phanLoai === 'hung') {
        if (!tinh.ok) return 'caoNhat';
        return (groupEff === 'suy' || !gate) ? 'cao' : 'trung';
    }
    if (!tinh.ok) {
        // Cung vượng mà thù địch với sao suy: lực mạnh đè xuống sao -> nặng nhất
        if (cungTD && groupEff === 'vuong') return 'caoNhat';
        if (tinh.key === 'suyTuyet') return 'cao';
        return groupEff === 'suy' ? 'trung' : 'cao'; // cung suy + sao Cát tính: "đèn kém đường xấu"
    }
    return (!gate || groupEff === 'suy') ? 'trung' : 'thap';
}

// F8. Diễn giải phối Sao × Cung (ma trận + mô hình môi trường/nhân sự)
function nct2PhoiSaoCung(P) {
    const { meta, tinh, groupEff, viTri, ts, cungTD, kq } = P;
    const L = [];
    if (viTri === 'chinh') {
        L.push('LÂM CUNG: sao đóng đúng nhà (chính vị) — như vua ngự trong nước mình, kiểm soát, làm chủ.' +
               (ts.nhom === 'suy' && tinh.ok ? ' Cung tự thân suy theo Trường Sinh nhưng sao không bị khắc phá nên vẫn tốt, ổn (được coi là trung bình).' : ''));
    } else if (viTri === 'khach') {
        L.push('THỨ VỊ: sao là đại quý khách ở nước bạn thân thiện — được đón tiếp, thuận lợi nhưng KHÔNG làm chủ; phụ thuộc chủ nhà (Cung) nhiều hơn.');
    }
    const tdVuong = `Cung VƯỢNG nhưng THÙ ĐỊCH với sao (${kq.nhanCung}): Cung không phải nơi nương náu mà là lực mạnh dồn xuống đè/xung tán sao — như người kiệt sức, tàn tật bị đặt giữa môi trường mạnh và khắc nghiệt. Đây là tổ hợp nặng nhất: cái xấu bộc phát dữ dội, KHÔNG còn "nhỏ, ẩn".`;
    const tdSuy = `Cung SUY nhưng vẫn THÙ ĐỊCH với sao (${kq.nhanCung}): vừa không nuôi được sao vừa tiếp tục áp chế — cái xấu lộ rõ, rộng.`;
    const tdTb = `Cung trung bình nhưng THÙ ĐỊCH với sao (${kq.nhanCung}): áp chế vừa phải, cái xấu bị đẩy mạnh, mặt tốt bị kìm hãm.`;
    if (meta.phanLoai === 'hung') {
        if (tinh.ok) {
            if (P.starKey === 'Thiên Không') L.push('Thiên Không từ trung bình trở lên: dù vượng cũng chỉ che lấp cái xấu, không có mảng nào thật sự sáng; nguy cơ ẩn tiềm tàng (chưa phát lộ) vẫn nhiều — đề phòng cấp trung' + (groupEff === 'vuong' ? ' (môi trường tốt làm hung tính giảm một phần).' : '.'));
            else if (groupEff === 'vuong') L.push('Hung tinh nhưng đang từ trung bình trở lên, môi trường tốt: hung tính giảm một phần; chỉ nổi 1–2 mảng tốt (' + meta.chuQuan + '), phần còn lại vẫn hung — đề phòng cấp trung.');
            else if (groupEff === 'trungBinh') L.push('Hung tinh từ trung bình trở lên, môi trường vừa: mặt tốt nổi ở vài mảng chủ quản, mặt xấu bẩm sinh vẫn lộ song song ở mức nhỏ; đề phòng cấp trung.');
            else L.push('Hung tinh gặp MÔI TRƯỜNG XẤU (cung suy): đây là đất để hung tính thể hiện bản tính đặc hữu, dù sao chưa suy — đề phòng cấp cao.');
        } else {
            L.push('Hung tinh SUY (mất kiểm soát, như người sầu đời): hung tính bộc phát, chỉ thấy cái xấu; môi trường tốt không cứu được.');
            if (cungTD && groupEff === 'vuong') L.push(tdVuong);
            else if (cungTD && groupEff === 'suy') L.push(tdSuy);
            else if (cungTD) L.push(tdTb);
            else if (groupEff === 'vuong') L.push('Cung vượng và không thù địch với sao: hung tính KHÔNG do Cung kích phát; sao tự tìm "góc khuất" nhỏ của Cung để sa vào — xấu có thật nhưng giới hạn, ẩn (vết ố trên tấm áo đẹp).');
            else if (groupEff === 'suy') L.push('Cung suy: góc khuất lộ rõ, rộng, dễ lan — Cung là đất dụng võ của hung tính (mức nguy hiểm cao nhất).');
            else L.push('Cung trung bình: mặt tiêu cực được đẩy mạnh, mặt tốt bị kìm hãm.');
        }
    } else {
        if (tinh.ok) {
            if (groupEff === 'vuong') L.push('"Áo gấm thêm hoa": sao từ trung bình trở lên + cung vượng — mặt tốt thuộc chủ quản phát lộ rõ, mặt xấu bẩm sinh nhỏ, không ảnh hưởng kết cục chung.');
            else if (groupEff === 'trungBinh') L.push('Sao từ trung bình trở lên + cung trung bình: mặt tốt phát lộ vừa phải, mặt xấu nhỏ; có thể dàn xếp để ra kết quả ổn.');
            else L.push('"Trong vui có buồn": sao đủ lực nhưng cung (môi trường) suy — tài năng bị giam hãm, gò bó, cái tốt thực tế thấp hơn nhiều so với danh nghĩa; có risk phát sinh.');
        } else {
            if (cungTD && groupEff === 'vuong') L.push('Sao suy: ' + tdVuong);
            else if (groupEff === 'vuong') L.push('Sao suy nhưng cung vượng và không thù địch: sao vẫn phát mặt xấu (bản tính "sầu đời"), chọn góc khuất nhỏ của Cung; xấu có thật nhưng giới hạn/ẩn. Cung tốt không cứu được sao suy.');
            else if (groupEff === 'suy') L.push('Sao suy + cung suy (sao Cát tính): như xe đèn pha kém trên đường gồ ghề — chậm hành trình, mất thời gian, mệt mỏi, bất tiện; vẫn quan sát và xoay xở được, chưa đến mức thảm hoạ.' + (cungTD ? ' (Cung còn thù địch với sao nên khó hơn mức "đèn kém" thông thường.)' : ''));
            else L.push(cungTD ? 'Sao suy: ' + tdTb : 'Sao suy + cung trung bình: mặt tiêu cực bị đẩy mạnh, mặt tốt bị kìm hãm.');
            if (tinh.key === 'suyTuyet') L.push('Sao suy tuyệt: chỉ thấy cái xấu, tính xấu bộc phát dữ dội; Cung quyết định cái xấu nào được active tối đa.');
        }
    }
    return L;
}

// F8b. Bức tranh tổng hợp (khi sao suy): gom Sao + Cung + Tháng
function nct2BucTranh(P, thangChi) {
    const { tinh, kq, ts } = P;
    const cung = NCT2_CUNG_META[P.cungChi];
    const sd = NCT_STAR_DATA[P.starKey];
    const L = [];
    L.push(`• Thiên Tinh ${P.starKey} (bản vị ${sd.banVi.join('/')}) ở thế ${tinh.ten.toUpperCase()} (điểm ${kq.diemCuoi.toFixed(2)}).`);
    L.push(`• Cung ${P.cungChi} (${cung.tuong}): ${kq.nhanCung} Theo Can Ngày, cung ở "${ts.ten}" (${NCT2_NHOM_TEN[ts.nhom]})` +
           (P.cungTD ? (ts.nhom === 'vuong' ? ' và THÙ ĐỊCH với sao → lực mạnh dồn xuống đè/xung tán sao.' : ' và THÙ ĐỊCH với sao.') : '.'));
    L.push(`• Tháng ${thangChi} (chiếm 60% lực nền): ${kq.nhanThang}` + (P.thangTD ? ' → thù địch mạnh.' : '') +
           (P.giamThang ? ` ${thangChi} còn là mộ khố của hành ${sd.hanh}: sao bị giam nhốt, bó buộc (như xiềng xích, bị kết án).` : ''));
    if (P.giamCung) L.push(`• Cung ${P.cungChi} là mộ khố của hành ${sd.hanh}: sao bị nhốt ngay trong môi trường.`);
    if (P.cungTD && P.thangTD) L.push('• Cả Cung lẫn Tháng cùng thù địch: sao bị kẹp hai phía, không còn chỗ dựa.');
    L.push(`• Môi trường Cung ${P.cungChi} khi hung: ${cung.hung}.`);
    return L;
}

const NCT2_VIEC_CO_THE = ['QC', 'TAI', 'GD', 'XD', 'KT', 'QS', 'MUU', 'PL'];
// F9. Luận theo một việc cầu (cho một hệ Tháng)
function nct2LuanViec(P, ma) {
    const { starKey, meta, tinh, gate, groupEff, viTri } = P;
    const rel = nct2MucQuanHe(starKey, ma);
    const relInfo = NCT2_MUC_QUAN_HE[rel];
    const cr = nct2CungViec(P.cungChi, ma, groupEff);
    const dark = meta.darkTopics.includes(ma);
    const sd = NCT_STAR_DATA[starKey];
    const ghiChu = NCT2_GHI_CHU_SAO_VIEC[starKey + '|' + ma];
    const L = [];
    let muc = '';

    L.push(`Sao ${starKey} ↔ việc: ${relInfo.ky} ${relInfo.ten}` + (ghiChu ? ` — ${ghiChu}` : ''));
    L.push(`Cung ${P.cungChi} ↔ việc: ${NCT2_CUNG_VIEC_TEN[cr]}`);

    const nang = (P.cungTD ? 1 : 0) + (P.thangTD ? 1 : 0) + ((P.giamCung || P.giamThang) ? 1 : 0) + ((P.cungTD && groupEff === 'vuong') ? 1 : 0);
    if (starKey === 'Thiên Không') {
        muc = (!tinh.ok && nang >= 3) ? 'ĐẠI HUNG — TRÁNH TUYỆT ĐỐI' : 'TRÁNH / ĐỔI HƯỚNG';
        if (tinh.ok) L.push('Thiên Không là hung tinh xấu nhiều, tốt chẳng bao nhiêu: dù chưa suy cũng chỉ được rất ít, nguy cơ ẩn tiềm tàng (chưa phát lộ) còn nhiều. Không hợp cho việc này — tuyệt đối cẩn trọng, thay đổi dự định hoặc đổi phương pháp tiếp cận.');
        else L.push('Thiên Không suy: mọi tính xấu bộc phát (thất tán, lừa đảo, tin thất thiệt...). Tránh tiến hành; đổi dự định, tạm hoãn.' + (nang >= 3 ? ' Sao bị Cung và Tháng cùng đè (xem thẻ Phối Sao × Cung): bức tranh cực kỳ thống khổ.' : ''));
    } else if (!tinh.ok) {
        if (dark && nang >= 3) muc = 'ĐẠI HUNG — TRÁNH TUYỆT ĐỐI';
        else if (dark) muc = (meta.phanLoai === 'hung') ? 'NGUY — CẢNH GIÁC CAO NHẤT' : 'NGUY — CẢNH GIÁC CAO';
        else muc = 'BẤT LỢI — NÊN THỦ';
        L.push(`Sao ${tinh.ten.toLowerCase()}: mặt tối tự bộc lộ dù không ai cầu (xem thẻ "Thiên Tinh — bản chất").`);
        if (dark) L.push('Việc cầu này TRÙNG mặt tối của sao khi suy → ' + ((meta.phanLoai === 'hung') ? 'mức cảnh giác cao nhất.' : 'mức cảnh giác cao.'));
        else L.push('Việc cầu không nằm trực tiếp trong mặt tối, nhưng sao suy thì không giúp được gì; nên thủ, không vọng động.');
        if (sd.hanh === 'Thổ' && ma === 'BT') L.push('Sao Thổ suy tuyệt khi hỏi bệnh: KHÔNG phải trì trệ giảm để người bệnh thoát, mà hung tính gia tăng, việc xấu bộc phát dữ dội, kết quả tiêu cực hiện nhanh hơn.');
        if (sd.hanh === 'Mộc' && (ma === 'TS' || ma === 'HN')) L.push('Sao Mộc suy: tâm ý tạo mầm không gặp điều kiện tốt — mầm héo úa, hư úng.');
        if (meta.suyNenLam) L.push(`Khi sao suy, văn bản khuyên: ${meta.suyNenLam}.`);
    } else if (!gate) {
        muc = 'KÌM HÃM';
        L.push(`Sao đủ lực (${tinh.ten.toLowerCase()}) nhưng Cung Cư tự thân suy nặng (${P.ts.ten}) và sao không lâm cung → tài năng bị giam hãm, cái tốt thực tế thấp hơn rất nhiều; chưa qua cổng kích hoạt.`);
        if (rel === 'C' || rel === 'O') L.push('Sao vốn hợp việc này nhưng môi trường không nuôi được — tiến hành rất thận trọng, đừng kỳ vọng.');
        else L.push('Sao không chủ mảng này, lại thêm môi trường kìm hãm — không nên tiến hành như phương án chính.');
    } else {
        if (rel === 'C' || rel === 'O') {
            if (cr === 'thuan') muc = rel === 'C' ? 'THUẬN LỢI — NÊN TIẾN HÀNH' : 'THUẬN LỢI VỪA PHẢI';
            else if (cr === 'trung') muc = (rel === 'C' && (tinh.key === 'vuong' || tinh.key === 'tuong') && groupEff === 'vuong') ? 'THUẬN LỢI — NÊN TIẾN HÀNH' : 'KHÁ — TIẾN HÀNH CÓ KIỂM SOÁT';
            else if (cr === 'batLoiNhe') muc = 'KHÁ — CÓ GÓC KHUẤT NHỎ';
            else muc = 'THẬN TRỌNG — MÔI TRƯỜNG BẤT LỢI';
            if (cr === 'batLoi') L.push('Sao hợp việc này nhưng Cung có mặt bất lợi cho việc này: tài năng bị gò bó, được ít, phải dàn xếp kỹ.');
            if (rel === 'O') L.push('Sao chỉ ở mức có quan tâm/trợ đỡ (không phải chủ quản): kết quả vừa phải.');
            if (P.giaiCuu) L.push(P.giaiCuu);
            if (NCT2_VIEC_CO_THE.includes(ma)) L.push(`Thế nên dùng: ${meta.the} — ${meta.theDai}.`);
        } else if (rel === 'T') {
            muc = 'KHÔNG HỢP LÀM CHỦ LỰC';
            L.push('Sao không chủ mảng này: dù đang tốt vẫn như chạy bộ đuổi nhà vô địch marathon — không hợp. Kết quả dựa vào Cung và quẻ Dịch; nên đổi phương pháp hoặc dựa vào yếu tố khác, không kỳ vọng sao trợ đỡ.');
        } else {
            muc = rel === 'Y' ? 'RẤT KHÔNG HỢP' : 'KHÔNG HỢP';
            L.push('Sao đang từ trung bình trở lên nhưng bản chất nghịch với việc này (không hợp dù vượng).');
            if (sd.hanh === 'Thổ' && ma === 'BT') L.push('Thổ chủ tĩnh, trì giữ, chôn lấp: nuôi dưỡng bệnh, bệnh chồng bệnh, bệnh được duy trì/dự trữ — không có tính vươn lên để thoát bệnh. Cần xem thêm Lục Hào.');
            L.push('Cẩn trọng, đổi cách tiếp cận hoặc hoãn.');
        }
        if (meta.phanLoai === 'hung') {
            L.push(`Sao Hung tính: chỉ một vài mảng tốt nổi (${meta.chuQuan}); các mảng khác vẫn hung dù không suy.` +
                   (groupEff === 'suy' ? ' Môi trường (cung suy) là đất để hung tính thể hiện — tăng cảnh giác.' : ''));
        }
    }
    if (!tinh.ok || !gate || meta.phanLoai === 'hung') {
        const rr = nct2RuiRo(starKey, P.cungChi, ma);
        if (rr.congHuong.length) L.push('⚠ Rủi ro CỘNG HƯỞNG sao–cung (dễ hiện hình nhất) cho việc này: ' + rr.congHuong.join('; ') + '.');
        if (rr.khac.length) L.push('Rủi ro khác có thể hiện hình: ' + rr.khac.join('; ') + '.');
    }
    if (viTri === 'chinh' && tinh.ok) L.push('(Lâm cung: sao làm chủ tại nhà mình — nền tảng vững.)');
    if (viTri === 'khach') L.push('(Thứ vị: quý khách — thuận lợi nhưng không làm chủ, phụ thuộc môi trường.)');
    return { ma, ten: nct2TenViec(ma), muc, dong: L };
}

// F10. Phân tích trọn cho 1 hệ Tháng
function nct2PhanTichThang(p, thangChi) {
    const meta = NCT2_STAR_META[p.starKey];
    const r3 = nctTinh3Tang(p.starKey, p.cungChi, p.dayChi, thangChi, p.dayCan);

    // Map kết quả "3 tầng tên lửa" (mnl01) sang hình dạng cũ để tái dùng
    // các hàm diễn giải Phối Sao×Cung / Luận Việc / Bức Tranh bên dưới:
    //   tang3 (bản vị vs Cung)  <-> "diemCung" cũ
    //   tang1 (Nguyệt vs bản vị) <-> "diemThang" cũ
    //   tang2 (Cung tự thân theo Trường Sinh Can Ngày) <-> "ts" cũ
    const kq = {
        diemCung: r3.tang3.diem, diemThang: r3.tang1.diem,
        diemCuoi: r3.tang3.diem, nhanCung: r3.tang3.nhan, nhanThang: r3.tang1.nhan,
        phanLoai: { muc: r3.ketLuan.muc, mota: r3.ketLuan.mota },
        nhanhDuocChon: r3.nhanhDuocChon, modifier: r3.modifier,
    };
    const tinh = {
        ok: r3.tang2.muc !== 'tuMoTuyet' && r3.tang3.muc !== 'tuMoTuyet',
        key: r3.tang3.muc, ten: r3.ketLuan.muc,
    };
    const ts = nct2TruongSinh(p.dayCan, p.cungChi);
    const viTri = nct2ViTri(p.starKey, p.cungChi);
    const groupEff = ts.nhom;
    const gate = tinh.ok && NCT_MUC_RANK[r3.tang3.muc] >= 2; // sao (Tầng 3) từ trung bình trở lên & không bị Tầng 2 chặn
    const P = { starKey: p.starKey, cungChi: p.cungChi, meta, kq, tinh, ts, viTri, groupEff, gate, giaiCuu: null, r3 };

    const cungTD = kq.diemCung <= -0.5;     // Cung (Tầng 3) xung/khắc/hình/hại sao (thù địch)
    const thangTD = kq.diemThang <= -0.5;   // Nguyệt (Tầng 1) thù địch với sao
    const sdd = NCT_STAR_DATA[p.starKey];
    const moChi = NCT_MO_KHO[sdd.hanh];
    const giamCung = moChi === p.cungChi && !sdd.banVi.includes(p.cungChi) && kq.diemCung <= -0.7;
    const giamThang = moChi === thangChi && !sdd.banVi.includes(thangChi) && kq.diemThang <= -0.7;
    Object.assign(P, { cungTD, thangTD, giamCung, giamThang });

    // Thiên Xung + cung/ngày Dương -> cứu giải tai ách
    if (p.starKey === 'Thiên Xung' && tinh.ok && (NCT_CHI_DUONG.includes(p.cungChi) || NCT_CHI_DUONG.includes(p.dayChi))) {
        P.giaiCuu = 'Thiên Xung gặp cung/ngày Dương: có khả năng cứu giải tai ách, hung hoạ.';
    }
    const canh = nct2CanhGiac(meta, tinh, groupEff, gate, cungTD);
    const phoi = nct2PhoiSaoCung(P);
    if (r3.canBao.length) phoi.push('TẦNG 1 (Nguyệt, độ khó khởi đầu — không đổi kết luận cuối): ' + r3.canBao.join(' '));
    const congHuong = nct2CongHuong(p.starKey, p.cungChi);
    const viecs = p.topics.map(ma => nct2LuanViec(P, ma));
    return { P, kq, tinh, ts, viTri, groupEff, gate, canh, phoi, congHuong, viecs, r3 };
}

// F11. Phân tích tổng
function nct2PhanTich(p) {
    const meta = NCT2_STAR_META[p.starKey];
    const cung = NCT2_CUNG_META[p.cungChi];
    const ts = nct2TruongSinh(p.dayCan, p.cungChi);
    const viTri = nct2ViTri(p.starKey, p.cungChi);

    // ---- Thẻ 1: bản chất Sao + phạm vi chủ quản ----
    const ds = { C: [], O: [], T: [], X: [], Y: [] };
    NCT2_TOPIC_CODES.forEach(ma => ds[nct2MucQuanHe(p.starKey, ma)].push(nct2TenViec(ma)));
    const sd = NCT_STAR_DATA[p.starKey];
    const the1 = [];
    the1.push(`Phân loại: ${meta.nhan}. Hành ${sd.hanh} ${sd.parity === 'D' ? 'dương' : 'âm'}; bản cung: ${sd.banVi.join(' / ')}` + ((sd.thuVi && sd.thuVi.length) ? `; thứ vị: ${sd.thuVi.join(' / ')}` : '') + '.');
    the1.push(`Chủ quản: ${meta.chuQuan}.`);
    the1.push(`Không ưa / vô cảm: ${meta.khongUa}.`);
    the1.push('');
    the1.push('Khi sao TỪ TRUNG BÌNH TRỞ LÊN:');
    the1.push(`◎ Chủ quản: ${ds.C.length ? ds.C.join('; ') : '(không có)'}`);
    the1.push(`○ Có quan tâm/trợ đỡ: ${ds.O.length ? ds.O.join('; ') : '(không có)'}`);
    the1.push(`△ Bàng quan (không chủ mảng này): ${ds.T.length ? ds.T.join('; ') : '(không có)'}`);
    the1.push(`✕ Không hợp: ${ds.X.concat(ds.Y).length ? ds.X.concat(ds.Y).join('; ') : '(không có)'}`);
    the1.push('');
    the1.push(`Thế: ${meta.the} — ${meta.theDai}.`);
    the1.push(`Khi sao SUY, mặt tối tự bộc lộ (dù không ai cầu): ${meta.matToi}.`);
    if (meta.suyNenLam) the1.push(`Khi suy nên: ${meta.suyNenLam}.`);

    // ---- Thẻ 2: Cung Cư ----
    const the2 = [];
    the2.push(`Cung ${p.cungChi}: ${cung.tuong}.`);
    the2.push(`Mặt cát: ${cung.cat}.`);
    the2.push(`Mặt hung (góc khuất): ${cung.hung}.`);
    the2.push('');
    the2.push(`Can Ngày ${p.dayCan}, vòng Trường Sinh: Cung ${p.cungChi} rơi vào "${ts.ten}" → ${NCT2_NHOM_TEN[ts.nhom]}.`);
    if (viTri === 'chinh') the2.push('Sao đóng đúng bản cung: LÂM CUNG (chính vị, vua trong nước mình).');
    else if (viTri === 'khach') the2.push('Sao đóng thứ vị: quý khách ở nước bạn (không làm chủ).');
    else the2.push('Sao không ở bản cung/thứ vị.');

    // ---- Các hệ Tháng ----
    const thangs = [];
    if (p.thangTietChi && p.thangTietChi !== p.thangSocChi) {
        thangs.push({ ten: 'Sóc Vọng', chi: p.thangSocChi });
        thangs.push({ ten: 'Tiết Khí', chi: p.thangTietChi });
    } else if (p.thangTietChi) {
        thangs.push({ ten: 'Sóc Vọng = Tiết Khí', chi: p.thangSocChi });
    } else {
        thangs.push({ ten: 'Sóc Vọng', chi: p.thangSocChi });
    }
    const kqThang = thangs.map(t => Object.assign({}, t, { r: nct2PhanTichThang(p, t.chi) }));

    // ---- Thẻ theo Tháng ----
    const theThang = kqThang.map(t => {
        const r = t.r;
        const L = [];
        L.push(`Thiên Tinh theo mnl01: ${r.kq.phanLoai.muc} (điểm ${r.kq.diemCuoi.toFixed(2)}) → mức ${r.tinh.ten}${r.tinh.ok ? ' (từ trung bình trở lên)' : ''}.`);
        L.push(`Cổng kích hoạt: ${r.gate ? 'ĐẠT — mặt tốt thuộc chủ quản có thể phát lộ (mặt xấu bẩm sinh vẫn lộ song song).' : 'CHƯA ĐẠT — chỉ còn mặt tối / bị kìm hãm.'}`);
        L.push('');
        r.phoi.forEach(x => L.push(x));
        if (!r.tinh.ok || meta.phanLoai === 'hung') {
            L.push('');
            L.push(`Góc khuất của Cung ${p.cungChi} (mặt hung) mà sao sẽ chọn: ${cung.hung}.`);
            if (r.P.cungTD && r.groupEff === 'vuong') L.push('Cung vượng và thù địch với sao: góc khuất KHÔNG còn nhỏ/ẩn — bị lực Cung dồn ép, bộc lộ mạnh.');
            else L.push(r.groupEff === 'vuong' ? 'Cung vượng: góc khuất nhỏ, ẩn, giới hạn.' : (r.groupEff === 'suy' ? 'Cung suy: góc khuất lộ rõ, rộng, dễ lan.' : 'Cung trung bình: góc khuất ở mức vừa.'));
            if (r.congHuong.length) L.push(`⚠ CỘNG HƯỞNG với mặt tối bẩm sinh của sao: ${r.congHuong.join('; ')} — đây là "đất dụng võ", nguy hiểm nhất ở các khía cạnh này.`);
            else L.push('Không trùng trực tiếp mặt tối bẩm sinh của sao.');
        }
        if (!r.tinh.ok) {
            L.push('');
            L.push('BỨC TRANH TỔNG HỢP:');
            nct2BucTranh(r.P, t.chi).forEach(x => L.push(x));
        }
        L.push('');
        L.push(`MỨC CẢNH GIÁC: ${NCT2_CANH_GIAC_TEN[r.canh]}.`);
        return { tieuDe: `Phối Sao × Cung — theo Tháng ${t.ten} (${t.chi})`, noiDung: L.join('\n') };
    });

    // ---- Thẻ theo việc cầu ----
    const theViec = [];
    p.topics.forEach((ma, i) => {
        const L = [];
        kqThang.forEach((t, j) => {
            const v = t.r.viecs[i];
            if (kqThang.length > 1) L.push(`[Tháng ${t.ten} — ${t.chi}]`);
            L.push(`➜ ${v.muc}`);
            v.dong.forEach(x => L.push(x));
            if (j < kqThang.length - 1) L.push('');
        });
        theViec.push({ tieuDe: `Việc cầu: ${nct2TenViec(ma)}`, noiDung: L.join('\n') });
    });
    if (!p.topics.length) {
        theViec.push({ tieuDe: 'Việc cầu', noiDung: '(Chưa chọn việc cầu — chọn ở Bảng rà soát để xét sao có chủ quản/hợp việc đó không.)' });
    }

    // ---- Tóm tắt ----
    const tk = kqThang[0].r;
    const tomTat =
        `Sao ${p.starKey} (${meta.nhan}) cư Cung ${p.cungChi} — Trường Sinh Can ${p.dayCan}: "${ts.ten}" (${NCT2_NHOM_TEN[ts.nhom]})` +
        (viTri === 'chinh' ? ', LÂM CUNG' : (viTri === 'khach' ? ', thứ vị (quý khách)' : '')) + '. ' +
        kqThang.map(t => `Tháng ${t.ten}: sao ${t.r.tinh.ten}, cảnh giác ${NCT2_CANH_GIAC_TEN[t.r.canh]}` +
            (!t.r.tinh.ok && t.r.P.cungTD && t.r.groupEff === 'vuong' ? ' (Cung vượng và thù địch đè sao)' : '') +
            (t.r.P.giamThang ? ' (Tháng là mộ khố giam nhốt sao)' : '')).join('; ') + '.';

    const luuY = { tieuDe: 'Lưu ý', noiDung: 'Đây chỉ là dấu hiệu đầu tiên theo logic Thiên Tinh; cần xét tiếp quẻ Dịch/Lục Hào để xác nhận. Các mức điểm/ngưỡng là ước lượng tương đối, người xem tự cân nhắc nặng nhẹ.' };

    return {
        tomTat,
        chiTiet: [
            { tieuDe: 'Thiên Tinh — bản chất & phạm vi chủ quản', noiDung: the1.join('\n') },
            { tieuDe: 'Cung Cư — tính chất & vượng suy theo Can Ngày', noiDung: the2.join('\n') },
        ].concat(theThang, theViec, [luuY]),
    };
}

// ============================================================
// G. ADAPTER — Bảng rà soát bắt buộc (sửa được mọi input, chọn việc cầu)
// ============================================================
(function () {

    function nct2Style() {
        if (document.getElementById('nct2-style')) return;
        const css = `
            .nct2-info{font-size:.8rem;color:var(--ink-soft);background:var(--paper-alt);border:1px solid #e8e2d6;border-radius:8px;padding:8px 12px;margin-bottom:14px;line-height:1.6;}
            .nct2-review{border:1.5px solid var(--violet);background:var(--violet-lt);border-radius:10px;padding:14px;margin-bottom:16px;}
            .nct2-title{font-weight:700;color:var(--violet);margin-bottom:10px;font-size:.9rem;}
            .nct2-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;}
            .nct2-grid label{display:flex;flex-direction:column;font-size:.72rem;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.3px;gap:4px;}
            .nct2-grid select{font-size:.9rem;padding:7px 8px;border-radius:6px;border:1px solid #cfc3e6;background:#fff;font-family:inherit;color:var(--ink);text-transform:none;letter-spacing:0;font-weight:500;}
            .nct2-sub{font-size:.72rem;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.3px;margin:12px 0 6px;}
            .nct2-chips{display:flex;flex-wrap:wrap;gap:6px;}
            .nct2-chip{padding:6px 10px;border-radius:16px;border:1.5px solid var(--violet);background:#fff;color:var(--violet);font-size:.78rem;cursor:pointer;font-family:inherit;user-select:none;}
            .nct2-chip.on{background:var(--violet);color:#fff;}
            .nct2-note{font-size:.76rem;color:var(--ink-soft);margin:10px 0;line-height:1.5;}
            .nct2-hero{background:var(--violet-lt);border:1px solid #d8c8ec;border-radius:10px;padding:16px;text-align:center;margin-bottom:14px;}
            .nct2-hero .t{font-size:.72rem;color:var(--violet);font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;}
            .nct2-hero .n{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:700;color:var(--ink);}
            .nct2-hero .s{font-size:.85rem;color:var(--ink-soft);margin-top:2px;}
            .nct2-tomtat{background:var(--teal-lt);border-left:4px solid var(--teal);border-radius:0 8px 8px 0;padding:12px 14px;font-size:.85rem;color:var(--ink);margin-bottom:14px;line-height:1.6;}
            .nct2-card{border:1px solid #e8e2d6;background:var(--paper-alt);border-radius:8px;padding:12px 14px;margin-bottom:8px;}
            .nct2-card .ct{font-size:.78rem;font-weight:700;color:var(--violet);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;}
            .nct2-card .cb{font-size:.85rem;color:var(--ink);line-height:1.65;white-space:pre-wrap;}
            .nct2-actions{display:flex;gap:8px;margin:12px 0 4px;flex-wrap:wrap;}
            .nct2-btn{flex:1;min-width:120px;padding:9px 14px;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;border:1.5px solid var(--violet);background:white;color:var(--violet);font-family:inherit;}
            .nct2-btn.primary{background:var(--violet);color:#fff;}
            .nct2-copied{background:var(--teal) !important;color:#fff !important;border-color:var(--teal) !important;}
            @media (max-width:480px){.nct2-grid{grid-template-columns:1fr;}}
        `;
        const st = document.createElement('style');
        st.id = 'nct2-style';
        st.textContent = css;
        document.head.appendChild(st);
    }

    function copy(text, btn) {
        const done = () => {
            if (!btn) return;
            const old = btn.textContent;
            btn.textContent = '✅ Đã copy';
            btn.classList.add('nct2-copied');
            setTimeout(() => { btn.textContent = old; btn.classList.remove('nct2-copied'); }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done));
        } else fallback(text, done);
    }
    function fallback(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
    }
    function saveImage(el, filename, btn) {
        if (typeof html2canvas === 'undefined') { alert('Chưa có thư viện html2canvas để lưu ảnh.'); return; }
        const old = btn ? btn.textContent : null;
        if (btn) btn.textContent = '⏳ Đang lưu...';
        html2canvas(el, { backgroundColor: '#fdfaf5', scale: 2 }).then(c => {
            const a = document.createElement('a');
            a.download = filename + '.png'; a.href = c.toDataURL('image/png'); a.click();
            if (btn) btn.textContent = old;
        }).catch(err => { alert('Lỗi khi lưu ảnh: ' + (err && err.message ? err.message : err)); if (btn) btn.textContent = old; });
    }

    function fullText(p, kq) {
        const L = [];
        L.push('LUẬN GIẢI CỬU TINH × 12 CUNG × VIỆC CẦU');
        L.push(`Thiên Tinh: ${p.starKey} | Cung Cư: ${p.cungChi} | Can Ngày: ${p.dayCan} | Chi Ngày: ${p.dayChi}`);
        L.push(`Tháng Sóc Vọng: ${p.thangSocChi}` + (p.thangTietChi ? ` | Tháng Tiết Khí: ${p.thangTietChi}` : ''));
        L.push('Việc cầu: ' + (p.topics.length ? p.topics.map(nct2TenViec).join('; ') : '(chưa chọn)'));
        L.push('');
        L.push(kq.tomTat);
        kq.chiTiet.forEach(c => { L.push(''); L.push('— ' + c.tieuDe + ' —'); L.push(c.noiDung); });
        return L.join('\n');
    }

    function renderKetQua(p, target) {
        const kq = nct2PhanTich(p);
        const chiTietHtml = kq.chiTiet.map(c =>
            `<div class="nct2-card"><div class="ct"></div><div class="cb"></div></div>`).join('');
        target.innerHTML = `
            <div id="nct2-save">
                <div class="nct2-hero">
                    <div class="t">Thiên Tinh × Cung Cư</div>
                    <div class="n"></div>
                    <div class="s"></div>
                </div>
                <div class="nct2-tomtat"></div>
                ${chiTietHtml}
            </div>
            <div class="nct2-actions">
                <button type="button" class="nct2-btn primary" id="nct2-save-btn">📷 Lưu ảnh</button>
                <button type="button" class="nct2-btn" id="nct2-copy-btn">📋 Copy text</button>
            </div>`;
        // đổ nội dung bằng textContent (tránh chèn HTML)
        target.querySelector('.nct2-hero .n').textContent = `${p.starKey} cư ${p.cungChi}`;
        target.querySelector('.nct2-hero .s').textContent = `Can Ngày ${p.dayCan} — Chi Ngày ${p.dayChi} — Tháng ${p.thangSocChi}` + (p.thangTietChi ? ` / ${p.thangTietChi}` : '');
        target.querySelector('.nct2-tomtat').textContent = kq.tomTat;
        const cards = target.querySelectorAll('.nct2-card');
        kq.chiTiet.forEach((c, i) => {
            cards[i].querySelector('.ct').textContent = c.tieuDe;
            cards[i].querySelector('.cb').textContent = c.noiDung;
        });
        target.querySelector('#nct2-save-btn').addEventListener('click', function () {
            saveImage(target.querySelector('#nct2-save'), 'cuuTinhCung_' + p.starKey + '_' + p.cungChi, this);
        });
        target.querySelector('#nct2-copy-btn').addEventListener('click', function () {
            copy(fullText(p, kq), this);
        });
    }

    function renderBangRaSoat(input, container) {
        const dsSao = Object.keys(NCT_STAR_DATA);
        const chiSoc = nctChiTuCanChi(input.thangSocVong.canChi) || NCT_DS_CHI[0];
        const chiTiet = input.thangTietKhi ? nctChiTuCanChi(input.thangTietKhi.canChi) : '';
        const opt = (list, sel) => list.map(v => `<option value="${v}" ${v === sel ? 'selected' : ''}>${v}</option>`).join('');

        container.innerHTML = `
            <div class="nct2-info"></div>
            <div class="nct2-review">
                <div class="nct2-title">📋 Bảng dữ liệu đầu vào — kiểm tra, sửa nếu cần, chọn việc cầu rồi bấm Tính toán</div>
                <div class="nct2-grid">
                    <label>Thiên Tinh<select id="nct2-star">${opt(dsSao, input.thienTinh.name)}</select></label>
                    <label>Cung Cư<select id="nct2-cung">${opt(NCT_DS_CHI, input.cuCung)}</select></label>
                    <label>Can Ngày Chiêm<select id="nct2-can">${opt(NCT2_CAN, input.dayCan)}</select></label>
                    <label>Chi Ngày Chiêm<select id="nct2-chi">${opt(NCT_DS_CHI, input.dayChi || NCT_DS_CHI[0])}</select></label>
                    <label>Tháng Sóc Vọng<select id="nct2-socv">${opt(NCT_DS_CHI, chiSoc)}</select></label>
                    <label>Tháng Tiết Khí (nếu giao khí lệch Nguyệt Lệnh)
                        <select id="nct2-tiet"><option value="">— không dùng —</option>${opt(NCT_DS_CHI, chiTiet)}</select></label>
                </div>
                <div class="nct2-sub">Việc cầu (chọn một hoặc nhiều)</div>
                <div class="nct2-chips" id="nct2-chips"></div>
                <p class="nct2-note">Giá trị lấy tự động từ Lịch + Ngũ Linh + mnl01. Nếu không khớp thực tế (hoặc muốn thử tình huống khác) hãy sửa trực tiếp. Không chọn việc cầu thì chỉ xét bản chất Sao và Cung.</p>
                <button type="button" class="nct2-btn primary" id="nct2-go">⚙️ Tính toán</button>
            </div>
            <div id="nct2-out"></div>`;
        container.querySelector('.nct2-info').textContent =
            `Giờ lập quẻ: ${input.hCan} ${input.hourChi} — ${input.duong.ngay}/${input.duong.thang}/${input.duong.nam} (${input.duong.thu})`;

        const chips = container.querySelector('#nct2-chips');
        NCT2_TOPICS.forEach(t => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'nct2-chip'; b.dataset.ma = t.ma; b.textContent = t.ten;
            b.addEventListener('click', () => b.classList.toggle('on'));
            chips.appendChild(b);
        });

        container.querySelector('#nct2-go').addEventListener('click', function () {
            const p = {
                starKey: container.querySelector('#nct2-star').value,
                cungChi: container.querySelector('#nct2-cung').value,
                dayCan: container.querySelector('#nct2-can').value,
                dayChi: container.querySelector('#nct2-chi').value,
                thangSocChi: container.querySelector('#nct2-socv').value,
                thangTietChi: container.querySelector('#nct2-tiet').value || null,
                topics: Array.prototype.map.call(chips.querySelectorAll('.nct2-chip.on'), b => b.dataset.ma),
            };
            renderKetQua(p, container.querySelector('#nct2-out'));
        });
    }

    NguLinhEngine.register({
        id: 'cuu-tinh-cung',
        name: 'Cửu Tinh × 12 Cung × Việc cầu',
        render: function (ctx, container) {
            nct2Style();
            if (typeof nctThuThapDauVao !== 'function' || typeof nctTinh3Tang !== 'function' || typeof NCT_STAR_DATA === 'undefined') {
                container.innerHTML = '<p style="color:var(--red)">Cần nạp mnl01.js (bản có engine 3 tầng) trước mnl02.js.</p>';
                return;
            }
            const input = nctThuThapDauVao(ctx);
            if (!input) {
                container.innerHTML = '<p style="color:var(--red)">Thiếu dữ liệu (Sóc Vọng / Giờ) hoặc dữ liệu không hợp lệ.</p>';
                return;
            }
            renderBangRaSoat(input, container);
        }
    });

})();
