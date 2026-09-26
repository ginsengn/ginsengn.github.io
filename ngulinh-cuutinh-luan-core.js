/* ============================================================
   MODULE LUẬN GIẢI CỬU TINH (THIÊN TINH) — CORE (ngulinh-cuutinh-luan-core.js)
   Trích xuất dữ liệu Cửu Tinh & Luận giải theo Dịch Học Ngũ Linh
   ============================================================ */

const CTL_CUA_TINH_DATA = {
    "Thiên Bồng": {
        nguHanh: "Thủy", amDuong: "Dương", thuocTinh: "Quyền tinh / Đào hoa tinh", banCung: "Tý",
        sinhVuong: "Chủ về uy quyền, tài lộc, quan chức thăng tiến, kinh doanh phát đạt. Hóa Đào hoa tinh giúp hôn nhân may mắn. Rất hợp ngày âm.",
        suyTuyet: "Hung tinh, phá tán, khắc hại, chia ly, đề phòng đạo tặc, binh hỏa. Hóa Dâm tinh bất lợi gia đạo, dâm sự.",
        ungDung: "Thích hợp trấn thủ biên giới, xây thành đắp đê, đóng quân. Kỵ kinh doanh đi xa (dễ mất cắp, bệnh tật)."
    },
    "Thiên Nhuế": {
        nguHanh: "Thổ", amDuong: "Âm", thuocTinh: "Quý tinh / Ám tinh / Bệnh tinh", banCung: ["Sửu", "Mùi"],
        sinhVuong: "Chủ uy quyền phú quý, danh dự địa vị, may mắn, cát khánh hỷ sự.",
        suyTuyet: "Tai nạn nguy hiểm, tiến thoái bất nhất. Xem bệnh là tình trạng nguy khốn; mưu sự khó thành, trì trệ dây dưa. Tượng xe tang.",
        ungDung: "Thích hợp làm thầy dạy nghề, giao lưu kết bạn, đóng quân. Kỵ dùng binh, cưới hỏi, kiện tụng, di cư, xây dựng."
    },
    "Thiên Xung": {
        nguHanh: "Mộc", amDuong: "Dương", thuocTinh: "Phúc tinh / Thứ cát tinh", banCung: "Dần",
        sinhVuong: "Chủ nhân nghĩa, tiến hành công việc thuận lợi, giao dịch dễ thành. Hợp ngày âm/dương cứu giải tai ách.",
        suyTuyet: "Chủ chinh phạt, báo ân báo oán, đổ vỡ, xung đột, thai hỏng. Người bỏ đi khó trở về.",
        ungDung: "Thích hợp chọn tướng soái, giao chiến, khua chiêng gõ trống. Suy tuyệt chỉ nên nhậm chức võ quan, xuất binh."
    },
    "Thiên Phụ": {
        nguHanh: "Mộc", amDuong: "Âm", thuocTinh: "Văn Khúc / Giao dịch tinh", banCung: "Mão",
        sinhVuong: "Giao dịch thuận lợi, hôn nhân gia đình hòa hợp, thai sản tốt đẹp, thi cử đỗ đạt.",
        suyTuyet: "Chủ lao tâm khổ tứ, thay lòng đổi dạ, tráo trở, tai nạn giao thông, chia ly rạn nứt.",
        ungDung: "Mọi việc đi lại, làm ăn, cưới hỏi, xây sửa đều lành. Đặc biệt tốt cho thi tuyển, giáo dục."
    },
    "Thiên Cầm": {
        nguHanh: "Hỏa", amDuong: "Dương", thuocTinh: "Văn tinh / Cát tinh", banCung: "Ngọ",
        sinhVuong: "Liêm khiết, chính đính, thuyết giáo, lợi cho khởi tạo, giao dịch, thi cử đỗ cao, thủ tục giấy tờ thuận lợi.",
        suyTuyet: "Thua thiệt, gãy đổ, thi trượt, hôn nhân bất thành, vướng mắc giấy tờ hành chính.",
        ungDung: "Tượng chim trời, đồ lông da, ví tiền, ấn tín, tranh ảnh, thuốc men, kính mắt."
    },
    "Thiên Tâm": {
        nguHanh: "Kim", amDuong: "Dương", thuocTinh: "Vũ Khúc / Tài tinh", banCung: "Thân",
        sinhVuong: "Cầu tài lộc, kinh doanh buôn bán rất hanh thông, cưới gả, xây dựng, xuất hành đều đắc tài.",
        suyTuyet: "Thất bại, kiếp tài, xuất hành bất cát, báo hiệu hao tổn, đề phòng trộm cướp.",
        ungDung: "Giỏi mưu lược, lãnh đạo, chỉ hữu quân sự, chữa bệnh chế thuốc."
    },
    "Thiên Trụ": {
        nguHanh: "Kim", amDuong: "Âm", thuocTinh: "Phá Quân / Tài tinh / Hung tinh", banCung: "Dậu",
        sinhVuong: "Phát đạt buôn bán, tốt cho điền trạch đất cát và hôn nhân gia đình.",
        suyTuyet: "Phá ngang, đổ vỡ, chia ly, hình thương, tai nạn cướp bóc trên đường, nguy hiểm thai sản.",
        ungDung: "Thích hợp xây doanh trại, luyện binh. Kỵ kinh doanh đi xa, cưới xin."
    },
    "Thiên Nhậm": {
        nguHanh: "Thổ", amDuong: "Dương", thuocTinh: "Tả Phù / Quyền tinh", banCung: ["Thìn", "Tuất"],
        sinhVuong: "Thăng quan tiến chức, tăng tài lộc, bao dung. Cầu quan, buôn bán, cưới hỏi đều tốt.",
        suyTuyet: "Trì trệ, khó thành, ngưng đọng, kinh doanh thất thoát, hẹn người không gặp.",
        ungDung: "Lợi lập nước, an dân, diệt trừ kẻ hung bạo, làm quan hiển hách."
    },
    "Thiên Anh": {
        nguHanh: "Hỏa", amDuong: "Âm", thuocTinh: "Hữu Bật / Văn tinh", banCung: "Tỵ",
        sinhVuong: "Thành đạt danh tiếng, vinh quang, mưu sự hanh thông, công việc tự nhiên thành.",
        suyTuyet: "Thất hẫm, tai họa, suy bại, thi trượt hoặc đỗ vớt, xuất hành gặp sự cố.",
        ungDung: "Lợi mưu tính sách lược, gặp quý nhân, yết kiến quan trên. Kỵ cầu tài, cưới xin."
    },
    "Thiên Không": {
        nguHanh: "Thủy", amDuong: "Âm", thuocTinh: "Tiện tinh / Vô sắc tinh", banCung: "Hợi",
        sinhVuong: "Những giá trị xấu bị ẩn tàng, có thể mang lại điểm tích cực.",
        suyTuyet: "Thất tán, bại tuyệt, vô vọng, lừa đảo trộm cắp, tin thất thiệt, thương tổn chân tay, bệnh tâm linh.",
        ungDung: "Phàm chiêm đoán gặp Thiên Không phần lớn là không cát lợi, mưu sự dễ đổ vỡ."
    }
};

// Vượng Suy Cửu Tinh theo Nguyệt Lệnh (Lệnh Tháng)
function ctlTinhVuongSuyTheoNguyetLenh(tenTinh, chiNguyet) {
    if (!CTL_CUA_TINH_DATA[tenTinh] || !chiNguyet) return { trangThai: "Chưa xác định", moTa: "" };
    
    const tinhInfo = CTL_CUA_TINH_DATA[tenTinh];
    const hanh = tinhInfo.nguHanh;
    
    // Quy tắc Vượng/Tướng/Phế/Hưu/Tù của Cửu Tinh theo Yên Ba Điếu Tẩu Ca:
    // - Nguyệt sinh Tinh -> Vượng
    // - Nguyệt cùng hành Tinh -> Tướng
    // - Tinh sinh Nguyệt -> Phế
    // - Tinh khắc Nguyệt -> Hưu
    // - Nguyệt khắc Tinh -> Tù
    const NGU_HANH_CHI = {
        "Dần":"Mộc", "Mão":"Mộc",
        "Tỵ":"Hỏa", "Ngọ":"Hỏa",
        "Thân":"Kim", "Dậu":"Kim",
        "Tý":"Thủy", "Hợi":"Thủy",
        "Thìn":"Thổ", "Tuất":"Thổ", "Sửu":"Thổ", "Mùi":"Thổ"
    };
    
    const hanhNguyet = NGU_HANH_CHI[chiNguyet];
    const SINH = { "Thủy":"Mộc", "Mộc":"Hỏa", "Hỏa":"Thổ", "Thổ":"Kim", "Kim":"Thủy" };
    const KHAC = { "Thủy":"Hỏa", "Hỏa":"Kim", "Kim":"Mộc", "Mộc":"Thổ", "Thổ":"Thủy" };
    
    let trangThai = "";
    let moTa = "";
    
    if (SINH[hanhNguyet] === hanh) {
        trangThai = "VƯỢNG (Sinh Khí)";
        moTa = "Tháng sinh trợ cho Sao -> Cực Vượng, phát huy tối đa sức mạnh cát lành.";
    } else if (hanhNguyet === hanh) {
        trangThai = "TƯỚNG (Đồng Khí)";
        moTa = "Tháng tương đồng Ngũ Hành -> Tướng khí, rất tốt.";
    } else if (SINH[hanh] === hanhNguyet) {
        trangThai = "PHẾ (Tiết Khí)";
        moTa = "Sao phải sinh cho Tháng -> Suy giảm năng lượng.";
    } else if (KHAC[hanh] === hanhNguyet) {
        trangThai = "HƯU (Khắc Xuất)";
        moTa = "Sao đi khắc Tháng -> Mệt mỏi, suy yếu.";
    } else if (KHAC[hanhNguyet] === hanh) {
        trangThai = "TÙ (Thất Sát)";
        moTa = "Tháng khắc Tinh -> Bị giam hãm, suy tuyệt, dễ phát sinh tính chất hung hại.";
    }
    
    return { trangThai, moTa };
}

// Hàm phân tích song song 2 Nguyệt Lệnh (Sóc Vọng & Tiết Khí)
function ctlPhanTichSongSong(tenTinh, cungCu, chiSocVong, chiTietKhi) {
    const dataTinh = CTL_CUA_TINH_DATA[tenTinh];
    if (!dataTinh) return "Không tìm thấy dữ liệu Thiên Tinh.";

    const isTrungThang = (chiSocVong === chiTietKhi);
    
    let res = `=== PHÂN TÍCH TÍNH CHẤT THIÊN TINH: ${tenTinh.toUpperCase()} ===\n`;
    res += `• Thuộc Tính: Hành ${dataTinh.nguHanh} (${dataTinh.amDuong}) | ${dataTinh.thuocTinh}\n`;
    res += `• Bản Cung Địa Bàn: ${Array.isArray(dataTinh.banCung) ? dataTinh.banCung.join(", ") : dataTinh.banCung}\n`;
    res += `• Vị Trí An Cung Chiêm: Cung ${cungCu}\n\n`;

    if (isTrungThang) {
        const vs = ctlTinhVuongSuyTheoNguyetLenh(tenTinh, chiSocVong);
        res += `--- 1. ĐÁNH GIÁ VƯỢNG SUY THEO NGUYỆT LỆNH (Tháng ${chiSocVong}) ---\n`;
        res += `• Trạng Thái Vượng Suy: ${vs.trangThai}\n`;
        res += `• Đánh Giá: ${vs.moTa}\n`;
        res += `• Luận Giải Chi Tiết: ${vs.trangThai.includes("VƯỢNG") || vs.trangThai.includes("TƯỚNG") ? dataTinh.sinhVuong : dataTinh.suyTuyet}\n\n`;
    } else {
        res += `⚠️ CẢNH BÁO TẠO KHÍ GIAO THỜI (Tháng Sóc Vọng ≠ Tháng Tiết Khí)\n`;
        res += `• Tháng Sóc Vọng (Âm Lịch) : Chi ${chiSocVong}\n`;
        res += `• Nguyệt Lệnh (Tiết KhíThực) : Chi ${chiTietKhi}\n`;
        res += `=> Tự động kích hoạt Logic Phân Tích Song Song 2 Mặt Cắt:\n\n`;

        const vsSV = ctlTinhVuongSuyTheoNguyetLenh(tenTinh, chiSocVong);
        res += `MẶT CẮT A — Theo Lịch Sóc Vọng (Tháng ${chiSocVong}):\n`;
        res += `  + Trạng Thái: ${vsSV.trangThai}\n`;
        res += `  + Tác Động: ${vsSV.trangThai.includes("VƯỢNG") || vsSV.trangThai.includes("TƯỚNG") ? dataTinh.sinhVuong : dataTinh.suyTuyet}\n\n`;

        const vsTK = ctlTinhVuongSuyTheoNguyetLenh(tenTinh, chiTietKhi);
        res += `MẶT CẮT B — Theo Lệnh Tiết Khí Thực (Tháng ${chiTietKhi}):\n`;
        res += `  + Trạng Thái: ${vsTK.trangThai}\n`;
        res += `  + Tác Động: ${vsTK.trangThai.includes("VƯỢNG") || vsTK.trangThai.includes("TƯỚNG") ? dataTinh.sinhVuong : dataTinh.suyTuyet}\n\n`;
        res += `=> ĐÁNH GIÁ CHUYỂN GIAO: Khí cũ (${chiSocVong}) đang thoái, Khí mới (${chiTietKhi}) đang tiến. Cần kết hợp cả 2 trạng thái để luận đoán độ trễ ứng nghiệm.\n\n`;
    }

    res += `--- 2. ỨNG DỤNG MƯU SỰ & PHƯƠNG HƯỚNG --- \n`;
    res += `• Khuyên Dùng: ${dataTinh.ungDung}\n`;

    return res;
}
