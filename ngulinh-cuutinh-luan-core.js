/* ============================================================
   MODULE LUẬN GIẢI CỬU TINH (THIÊN TINH) — CORE
   Nâng cấp Logic Chi Tiết 1:1 theo Sách Cửu Tinh Ngũ Linh Dụng Sự
   - Phân cấp Cát/Hung/Thứ Cát/Ám Tinh/Tiện Tinh
   - So sánh Cung Dương / Cung Âm & Ngày Dương / Ngày Âm
   - Phân tích Vượng/Tướng/Phế/Hưu/Tù song song 2 Nguyệt Lệnh
   ============================================================ */

const CTL_FULL_DATA = {
    "Thiên Bồng": {
        nguHanh: "Thủy", amDuong: "Dương", thuocTinh: "Quyền tinh / Đào hoa tinh", 
        capSao: "Hung Tinh (Đạo tinh - Sao trộm cướp)", banCung: "Tý",
        dacCach: "Cần gặp Cung Âm/Ngày Âm và Vượng Khí để đắc cách. Vượng tướng thì uy quyền tài lộc, thăng quan tiến chức, hôn nhân may mắn.",
        suyTuyet: "Suy tuyệt hóa thành Dâm tinh, dâm sự, phá tán, chia ly, xuất hành gặp đạo tặc, bệnh tật.",
        ungDung: "Thích hợp trấn thủ biên giới, xây thành đắp đê, đóng quân. Kỵ kinh doanh đi xa."
    },
    "Thiên Nhuế": {
        nguHanh: "Thổ", amDuong: "Âm", thuocTinh: "Quý tinh / Ám tinh / Bệnh tinh", 
        capSao: "Hung Tinh (Bệnh tinh - Tượng xe tang)", banCung: ["Sửu", "Mùi"],
        dacCach: "Nếu Sinh Vượng thì chủ uy quyền phú quý, danh dự địa vị, nhanh nhẹn cát khánh.",
        suyTuyet: "Chủ tai nạn nguy hiểm, tiến thoái bất nhất, bệnh tật nguy khốn. Thổ chủ tĩnh nên suy khí gây trì trệ, vướng mắc kéo dài, hẹn người không gặp.",
        ungDung: "Thích hợp làm thầy dạy nghề, giao lưu kết bạn, đóng quân. Kỵ dùng binh, cưới hỏi, kiện tụng, di cư."
    },
    "Thiên Xung": {
        nguHanh: "Mộc", amDuong: "Dương", thuocTinh: "Phúc tinh / Giải ách tinh", 
        capSao: "THỨ CÁT TINH (Mức độ tốt lành kém hơn Thiên Tâm, Thiên Nhậm, Thiên Phụ)", banCung: "Dần",
        dacCach: "RẤT ƯA CUNG DƯƠNG (Dần) VÀ NGÀY DƯƠNG (Tý, Dần, Thìn, Ngọ, Thân, Tuất). Nếu đắc cách Vượng Tướng + Cung Dương + Ngày Dương thì mới trọn đẹp ('phản hung vi cát', giải trừ tai ách, mưu sự thành công). Nếu cư Cung Âm (Mão) hoặc Ngày Âm thì chỉ đạt THỨ CÁCH, lực cát bị giảm xuống.",
        suyTuyet: "Suy tuyệt chủ chinh phạt, báo ân báo oán, đổ vỡ, xung đột, thai hỏng. Người bỏ đi khó trở về.",
        ungDung: "Thích hợp chọn tướng soái, giao chiến, xuất binh. Kỵ cầu tài, cưới xin, buôn bán."
    },
    "Thiên Phụ": {
        nguHanh: "Mộc", amDuong: "Âm", thuocTinh: "Văn Khúc / Giao dịch tinh", 
        capSao: "ĐẠI CÁT TINH", banCung: "Mão",
        dacCach: "Mọi việc đi lại, làm ăn, cưới hỏi, xây sửa đều lành. Đặc biệt tốt cho thi tuyển, giáo dục, giao dịch thuận lợi, thai sản mẹ tròn con vuông.",
        suyTuyet: "Lao tâm khổ tứ, thay lòng đổi dạ, tráo trở, tai nạn giao thông, chia ly rạn nứt.",
        ungDung: "Đặc biệt tốt cho sĩ tử thi tuyển và phát triển sự nghiệp văn hóa, giáo dục."
    },
    "Thiên Cầm": {
        nguHanh: "Hỏa", amDuong: "Dương", thuocTinh: "Văn tinh / Cát tinh", 
        capSao: "CÁT TINH (Chủ danh tiếng, ánh sáng)", banCung: "Ngọ",
        dacCach: "Sinh vượng chủ liêm khiết, chính đính, thi cử đỗ cao, tình cảm dẫn đến hôn nhân, thủ tục giấy tờ đầy đủ.",
        suyTuyet: "Mất mát thua thiệt, thi trượt, hôn nhân gãy đổ, vướng mắc thủ tục hành chính.",
        ungDung: "Tượng chim trời, đồ lông da, ấn tín, tranh ảnh, thuốc men, kính mắt."
    },
    "Thiên Tâm": {
        nguHanh: "Kim", amDuong: "Dương", thuocTinh: "Vũ Khúc / Tài tinh", 
        capSao: "ĐẠI CÁT TINH", banCung: "Thân",
        dacCach: "Sinh vượng rất ích lợi cho cầu tài, kinh doanh buôn bán (nhất là cư Thân, Dậu), mưu sự, cưới gả, xuất hành đều hanh thông.",
        suyTuyet: "Thất bại, kiếp tài, xuất hành bất cát, báo hiệu hao tổn, đề phòng trộm cướp.",
        ungDung: "Giỏi mưu lược, lãnh đạo, chữa bệnh chế thuốc."
    },
    "Thiên Trụ": {
        nguHanh: "Kim", amDuong: "Âm", thuocTinh: "Phá Quân / Tài tinh", 
        capSao: "HUNG TINH (Sát khí mùa Thu)", banCung: "Dậu",
        dacCach: "Sinh vượng tốt cho kinh doanh cầu tài, buôn bán phát đạt, tốt cho điền trạch đất cát và hôn nhân.",
        suyTuyet: "Phá ngang, đổ vỡ, chia ly, hình thương, tai nạn cướp giết trên đường, nguy hiểm thai sản.",
        ungDung: "Nên yên tĩnh, tế tự, nhún nhường. Kỵ đi xa, cưới gả, khởi tạo."
    },
    "Thiên Nhậm": {
        nguHanh: "Thổ", amDuong: "Dương", thuocTinh: "Tả Phù / Quyền tinh / Hãm tinh", 
        capSao: "CÁT TINH", banCung: ["Thìn", "Tuất"],
        dacCach: "Sinh vượng chủ thăng quan tiến chức, tăng tài lộc, bao dung. Cầu quan, buôn bán, cưới hỏi đều tốt.",
        suyTuyet: "Hãm tinh làm mọi việc trì trệ, khó thành, ngưng đọng, kinh doanh thất thoát, hẹn người không về.",
        ungDung: "Lợi lập nước, an dân, làm quan hiển hách. Suy tuyệt kỵ xây cất, xuất hành."
    },
    "Thiên Anh": {
        nguHanh: "Hỏa", amDuong: "Âm", thuocTinh: "Hữu Bật / Văn tinh", 
        capSao: "TRUNG BÌNH CHI TINH (Tiểu hung tinh)", banCung: "Tỵ",
        dacCach: "Sinh vượng chủ danh tiếng vinh quang, mưu sự hanh thông, công việc tự nhiên thành.",
        suyTuyet: "Thất hẫm, tai họa, suy bại, thi trượt hoặc đỗ vớt, xuất hành gặp khó khăn.",
        ungDung: "Lợi mưu tính sách lược, gặp quý nhân. Không thích hợp cầu tài, cưới xin, di cư."
    },
    "Thiên Không": {
        nguHanh: "Thủy", amDuong: "Âm", thuocTinh: "Tiện tinh / Vô sắc tinh", 
        capSao: "HUNG TINH (Bại tuyệt, suy vong)", banCung: "Hợi",
        dacCach: "Sinh vượng thì những giá trị xấu bị ẩn tàng.",
        suyTuyet: "Thất tán, vô vọng, lừa đảo trộm cắp, tin thất thiệt, thương tổn chân tay, bệnh tâm linh.",
        ungDung: "Phàm chiêm gặp Thiên Không là không cát lợi, mưu sự dễ mông quạnh."
    }
};

// Hàm đánh giá Tương Quan Cung Dương/Âm & Ngày Dương/Âm
function ctlXetAmDuongAmDuoi(tenTinh, cungCu, nhatCanChi) {
    const isCungDuong = ["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"].includes(cungCu);
    const nhatChi = nhatCanChi ? nhatCanChi.split(/\s+/)[1] : "";
    const isNgayDuong = ["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"].includes(nhatChi);

    let danhGiaCung = isCungDuong ? "Cung Dương" : "Cung Âm";
    let danhGiaNgay = isNgayDuong ? "Ngày Dương" : "Ngày Âm";
    let ghiChuNuocBieu = "";

    if (tenTinh === "Thiên Xung") {
        if (cungCu === "Dần" && isNgayDuong) {
            ghiChuNuocBieu = "🌟 ĐẮC CÁCH TRỌN VẸN: Cư Cung Dương (Dần) + Ngày Dương -> Khôi phục tối đa năng lượng cứu giải tai ách, biến nguy thành an!";
        } else if (cungCu === "Mão") {
            ghiChuNuocBieu = "⚡ THỨ CÁCH: Cư Cung Âm (Mão) -> Dù là Cung Mộc Vượng nhưng chỉ đạt Thứ Cách, lực cứu giải bị hạn chế.";
        } else if (!isNgayDuong) {
            ghiChuNuocBieu = "⚠️ GIẢM KHÍ: Chiêm vào Ngày Âm -> Giảm đi độ thanh thoát tốt lành của Thiên Xung.";
        }
    } else if (tenTinh === "Thiên Bồng") {
        if (!isNgayDuong) {
            ghiChuNuocBieu = "🌟 ĐẮC CÁCH: Thiên Bồng Thủy Dương rất ưa Ngày Âm -> Dễ phát huy tài lộc, uy quyền.";
        } else {
            ghiChuNuocBieu = "⚠️ HẠN CHẾ: Thiên Bồng gặp Ngày Dương -> Dễ phát sinh tính chất tranh chấp, hao tốn.";
        }
    }

    return { danhGiaCung, danhGiaNgay, ghiChuNuocBieu };
}

// Hàm Vượng Suy theo Nguyệt Lệnh
function ctlTinhVuongSuy(tenTinh, chiNguyet) {
    if (!CTL_FULL_DATA[tenTinh] || !chiNguyet) return { trangThai: "Chưa xác định", moTa: "" };
    
    const hanh = CTL_FULL_DATA[tenTinh].nguHanh;
    const NGU_HANH_CHI = {
        "Dần":"Mộc", "Mão":"Mộc", "Tỵ":"Hỏa", "Ngọ":"Hỏa",
        "Thân":"Kim", "Dậu":"Kim", "Tý":"Thủy", "Hợi":"Thủy",
        "Thìn":"Thổ", "Tuất":"Thổ", "Sửu":"Thổ", "Mùi":"Thổ"
    };
    
    const hanhNguyet = NGU_HANH_CHI[chiNguyet];
    const SINH = { "Thủy":"Mộc", "Mộc":"Hỏa", "Hỏa":"Thổ", "Thổ":"Kim", "Kim":"Thủy" };
    const KHAC = { "Thủy":"Hỏa", "Hỏa":"Kim", "Kim":"Mộc", "Mộc":"Thổ", "Thổ":"Thủy" };
    
    if (SINH[hanhNguyet] === hanh) return { trangThai: "VƯỢNG (Sinh Khí)", moTa: "Tháng sinh trợ -> Cực Vượng, phát huy tối đa cát tính." };
    if (hanhNguyet === hanh) return { trangThai: "TƯỚNG (Đồng Khí)", moTa: "Tương đồng Ngũ Hành -> Tướng khí, rất tốt." };
    if (SINH[hanh] === hanhNguyet) return { trangThai: "PHẾ (Tiết Khí)", moTa: "Sao phải sinh cho Tháng -> Tiết hao sức lực." };
    if (KHAC[hanh] === hanhNguyet) return { trangThai: "HƯU (Khắc Xuất)", moTa: "Sao đi khắc Tháng -> Mệt mỏi, hưu trí." };
    if (KHAC[hanhNguyet] === hanh) return { trangThai: "TÙ (Thất Sát)", moTa: "Tháng khắc Tinh -> Bị giam hãm, suy tuyệt, dễ lộ tính hung." };
    return { trangThai: "Bình Hòa", moTa: "" };
}

// Logic Luận Giải Tổng Hợp
function ctlPhanTichChiTiet(tenTinh, cungCu, nhatCanChi, chiSocVong, chiTietKhi) {
    const data = CTL_FULL_DATA[tenTinh];
    if (!data) return "Không tìm thấy dữ liệu Thiên Tinh.";

    const xetAD = ctlXetAmDuongAmDuoi(tenTinh, cungCu, nhatCanChi);
    const isTrungThang = (chiSocVong === chiTietKhi);

    let res = `=== BẢO TOÀN PHÂN TÍCH CỬU TINH CHUYÊN SÂU: ${tenTinh.toUpperCase()} ===\n`;
    res += `• Phân Cấp Thuộc Tính : ${data.capSao}\n`;
    res += `• Ngũ Hành & Tinh Khí  : Hành ${data.nguHanh} (${data.amDuong}) | ${data.thuocTinh}\n`;
    res += `• Vị Trí Cư & Ngày     : Cung ${cungCu} (${xetAD.danhGiaCung}) | Ngày Chiêm: ${nhatCanChi || "Chưa rõ"} (${xetAD.danhGiaNgay})\n`;
    if (xetAD.ghiChuNuocBieu) {
        res += `• ĐẮC CÁCH DỊCH LÝ     : ${xetAD.ghiChuNuocBieu}\n`;
    }
    res += `\n`;

    if (isTrungThang) {
        const vs = ctlTinhVuongSuy(tenTinh, chiSocVong);
        res += `--- I. VƯỢNG SUY THEO NGUYỆT LỆNH (Tháng ${chiSocVong}) ---\n`;
        res += `• Trạng Thái: ${vs.trangThai} — ${vs.moTa}\n`;
        res += `• Tác Động Thực Tế: ${vs.trangThai.includes("VƯỢNG") || vs.trangThai.includes("TƯỚNG") ? data.dacCach : data.suyTuyet}\n\n`;
    } else {
        res += `⚠️ CẢNH BÁO TẠO KHÍ GIAO THỜI (Tháng Sóc Vọng ≠ Tháng Tiết Khí)\n`;
        res += `• Tháng Sóc Vọng (Lịch Âm) : Chi ${chiSocVong}\n`;
        res += `• Nguyệt Lệnh (Tiết Khí Thực): Chi ${chiTietKhi}\n\n`;

        const vsSV = ctlTinhVuongSuy(tenTinh, chiSocVong);
        res += `[MẶT CẮT A - Theo Tháng Sóc Vọng (${chiSocVong})]:\n`;
        res += `  + Trạng Thái: ${vsSV.trangThai}\n`;
        res += `  + Luận Giải : ${vsSV.trangThai.includes("VƯỢNG") || vsSV.trangThai.includes("TƯỚNG") ? data.dacCach : data.suyTuyet}\n\n`;

        const vsTK = ctlTinhVuongSuy(tenTinh, chiTietKhi);
        res += `[MẶT CẮT B - Theo Lệnh Tiết Khí (${chiTietKhi})]:\n`;
        res += `  + Trạng Thái: ${vsTK.trangThai}\n`;
        res += `  + Luận Giải : ${vsTK.trangThai.includes("VƯỢNG") || vsTK.trangThai.includes("TƯỚNG") ? data.dacCach : data.suyTuyet}\n\n`;
        res += `=> TỔNG HỢP GIAO THỜI: Khí cũ (${chiSocVong}) thoái, Khí mới (${chiTietKhi}) tiến. Người luận cần đánh giá độ trễ để không bị ngộ nhận tốt/xấu quá đà.\n\n`;
    }

    res += `--- II. BẢN NĂNG & ỨNG DỤNG MƯU SỰ ---\n`;
    res += `• Phạm Vi Ứng Dụng: ${data.ungDung}\n`;

    return res;
}
