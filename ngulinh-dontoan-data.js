/* ============================================================
   NGŨ LINH ĐỘN TOÁN — LỚP DỮ LIỆU (data)
   ------------------------------------------------------------
   File này CHỈ chứa các bảng tra cứu cố định, chép nguyên vẹn
   từ file gốc "Lập Quẻ Ngũ Linh" (đã kiểm chứng đúng — khớp các
   ví dụ mẫu trong tài liệu). Không có logic tính toán, không có
   gì phụ thuộc DOM hay NguLinhEngine ở đây.

   Nếu sau này bạn có thêm phương pháp Ngũ Linh khác cần bảng
   tra khác, tạo file -data.js riêng cho phương pháp đó, KHÔNG
   sửa file này.
   ============================================================ */

const NDT_CHI = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const NDT_CAN = ["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];

const NDT_NAYIN_HANH = ["Kim","Hỏa","Mộc","Thổ","Kim","Hỏa","Thủy","Thổ","Kim","Mộc",
                         "Thủy","Thổ","Hỏa","Mộc","Thủy","Kim","Hỏa","Mộc","Thổ","Kim",
                         "Hỏa","Thủy","Thổ","Kim","Mộc","Thủy","Thổ","Hỏa","Mộc","Thủy"];

const NDT_STARS = [
  {num:1,name:"Thiên Bồng",hanh:"Thủy",parity:"D"},
  {num:2,name:"Thiên Nhuế",hanh:"Thổ",parity:"A"},
  {num:3,name:"Thiên Xung",hanh:"Mộc",parity:"D"},
  {num:4,name:"Thiên Phụ",hanh:"Mộc",parity:"A"},
  {num:5,name:"Thiên Cầm",hanh:"Hỏa",parity:"D"},
  {num:6,name:"Thiên Tâm",hanh:"Kim",parity:"D"},
  {num:7,name:"Thiên Trụ",hanh:"Kim",parity:"A"},
  {num:8,name:"Thiên Nhậm",hanh:"Thổ",parity:"D"},
  {num:9,name:"Thiên Anh",hanh:"Hỏa",parity:"A"},
  {num:10,name:"Thiên Không",hanh:"Thủy",parity:"A"},
];

const NDT_ACTIVE_BRANCHES = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Thân","Dậu","Hợi"];

const NDT_BATQUAI = ["","Càn","Đoài","Ly","Chấn","Tốn","Khảm","Cấn","Khôn"];

const NDT_HAUTHIEN_GROUPS = {
  "DanNgoTuat": {"Tý":"Khôn","Sửu":"Chấn","Dần":"Chấn","Mão":"Ly","Thìn":"Đoài","Tỵ":"Đoài",
                 "Ngọ":"Càn","Mùi":"Tốn","Thân":"Tốn","Dậu":"Khảm","Tuất":"Cấn","Hợi":"Cấn"},
  "ThanTyThin": {"Tý":"Càn","Sửu":"Tốn","Dần":"Tốn","Mão":"Khảm","Thìn":"Cấn","Tỵ":"Cấn",
                 "Ngọ":"Khôn","Mùi":"Chấn","Thân":"Chấn","Dậu":"Ly","Tuất":"Đoài","Hợi":"Đoài"},
  "HoiMaoMui": {"Tý":"Ly","Sửu":"Đoài","Dần":"Đoài","Mão":"Càn","Thìn":"Tốn","Tỵ":"Tốn",
                "Ngọ":"Khảm","Mùi":"Cấn","Thân":"Cấn","Dậu":"Khôn","Tuất":"Chấn","Hợi":"Chấn"},
  "TyDauSuu": {"Tý":"Khảm","Sửu":"Cấn","Dần":"Cấn","Mão":"Khôn","Thìn":"Chấn","Tỵ":"Chấn",
               "Ngọ":"Ly","Mùi":"Đoài","Thân":"Đoài","Dậu":"Càn","Tuất":"Tốn","Hợi":"Tốn"},
};
const NDT_GROUP_LABEL = {"DanNgoTuat":"Dần, Ngọ, Tuất","ThanTyThin":"Thân, Tý, Thìn","HoiMaoMui":"Hợi, Mão, Mùi","TyDauSuu":"Tỵ, Dậu, Sửu"};

const NDT_TRIGRAM_LINES = {
  "Càn":["D","D","D"], "Đoài":["D","D","A"], "Ly":["D","A","D"], "Chấn":["D","A","A"],
  "Tốn":["A","D","D"], "Khảm":["A","D","A"], "Cấn":["A","A","D"], "Khôn":["A","A","A"],
};

const NDT_HEXNAMES = {
"Càn_Càn":"Bát Thuần Càn","Càn_Khảm":"Thiên Thủy Tụng","Càn_Cấn":"Thiên Sơn Độn","Càn_Chấn":"Thiên Lôi Vô Vọng",
"Càn_Tốn":"Thiên Phong Cấu","Càn_Ly":"Thiên Hỏa Đồng Nhân","Càn_Khôn":"Thiên Địa Bĩ","Càn_Đoài":"Thiên Trạch Lý",
"Khảm_Càn":"Thủy Thiên Nhu","Khảm_Khảm":"Bát Thuần Khảm","Khảm_Cấn":"Thủy Sơn Kiển","Khảm_Chấn":"Thủy Lôi Truân",
"Khảm_Tốn":"Thủy Phong Tỉnh","Khảm_Ly":"Thủy Hỏa Ký Tế","Khảm_Khôn":"Thủy Địa Tỷ","Khảm_Đoài":"Thủy Trạch Tiết",
"Cấn_Càn":"Sơn Thiên Đại Súc","Cấn_Khảm":"Sơn Thủy Mông","Cấn_Cấn":"Bát Thuần Cấn","Cấn_Chấn":"Sơn Lôi Di",
"Cấn_Tốn":"Sơn Phong Cổ","Cấn_Ly":"Sơn Hỏa Bí","Cấn_Khôn":"Sơn Địa Bác","Cấn_Đoài":"Sơn Trạch Tổn",
"Chấn_Càn":"Lôi Thiên Đại Tráng","Chấn_Khảm":"Lôi Thủy Giải","Chấn_Cấn":"Lôi Sơn Tiểu Quá","Chấn_Chấn":"Bát Thuần Chấn",
"Chấn_Tốn":"Lôi Phong Hằng","Chấn_Ly":"Lôi Hỏa Phong","Chấn_Khôn":"Lôi Địa Dự","Chấn_Đoài":"Lôi Trạch Quy Muội",
"Tốn_Càn":"Phong Thiên Tiểu Súc","Tốn_Khảm":"Phong Thủy Hoán","Tốn_Cấn":"Phong Sơn Tiệm","Tốn_Chấn":"Phong Lôi Ích",
"Tốn_Tốn":"Bát Thuần Tốn","Tốn_Ly":"Phong Hỏa Gia Nhân","Tốn_Khôn":"Phong Địa Quan","Tốn_Đoài":"Phong Trạch Trung Phu",
"Ly_Càn":"Hỏa Thiên Đại Hữu","Ly_Khảm":"Hỏa Thủy Vị Tế","Ly_Cấn":"Hỏa Sơn Lữ","Ly_Chấn":"Hỏa Lôi Phệ Hạp",
"Ly_Tốn":"Hỏa Phong Đỉnh","Ly_Ly":"Bát Thuần Ly","Ly_Khôn":"Hỏa Địa Tấn","Ly_Đoài":"Hỏa Trạch Khuê",
"Khôn_Càn":"Địa Thiên Thái","Khôn_Khảm":"Địa Thủy Sư","Khôn_Cấn":"Địa Sơn Khiêm","Khôn_Chấn":"Địa Lôi Phục",
"Khôn_Tốn":"Địa Phong Thăng","Khôn_Ly":"Địa Hỏa Minh Di","Khôn_Khôn":"Bát Thuần Khôn","Khôn_Đoài":"Địa Trạch Lâm",
"Đoài_Càn":"Trạch Thiên Quải","Đoài_Khảm":"Trạch Thủy Khốn","Đoài_Cấn":"Trạch Sơn Hàm","Đoài_Chấn":"Trạch Lôi Tùy",
"Đoài_Tốn":"Trạch Phong Đại Quá","Đoài_Ly":"Trạch Hỏa Cách","Đoài_Khôn":"Trạch Địa Tụy","Đoài_Đoài":"Bát Thuần Đoài",
};

const NDT_DAI_DU_NIEN = {
  "Càn":  {"Càn":"Phục Vị","Khảm":"Lục Sát","Cấn":"Thiên Y","Chấn":"Ngũ Quỷ","Tốn":"Họa Hại","Ly":"Tuyệt Mệnh","Khôn":"Diên Niên","Đoài":"Sinh Khí"},
  "Khảm": {"Khảm":"Phục Vị","Cấn":"Ngũ Quỷ","Chấn":"Thiên Y","Tốn":"Sinh Khí","Ly":"Diên Niên","Khôn":"Tuyệt Mệnh","Đoài":"Họa Hại","Càn":"Lục Sát"},
  "Cấn":  {"Cấn":"Phục Vị","Chấn":"Lục Sát","Tốn":"Tuyệt Mệnh","Ly":"Họa Hại","Khôn":"Sinh Khí","Đoài":"Diên Niên","Càn":"Thiên Y","Khảm":"Ngũ Quỷ"},
  "Chấn": {"Chấn":"Phục Vị","Tốn":"Diên Niên","Ly":"Sinh Khí","Khôn":"Họa Hại","Đoài":"Tuyệt Mệnh","Càn":"Ngũ Quỷ","Khảm":"Thiên Y","Cấn":"Lục Sát"},
  "Tốn":  {"Tốn":"Phục Vị","Ly":"Thiên Y","Khôn":"Ngũ Quỷ","Đoài":"Lục Sát","Càn":"Họa Hại","Khảm":"Sinh Khí","Cấn":"Tuyệt Mệnh","Chấn":"Diên Niên"},
  "Ly":   {"Ly":"Phục Vị","Khôn":"Lục Sát","Đoài":"Ngũ Quỷ","Càn":"Tuyệt Mệnh","Khảm":"Diên Niên","Cấn":"Họa Hại","Chấn":"Sinh Khí","Tốn":"Thiên Y"},
  "Khôn": {"Khôn":"Phục Vị","Đoài":"Thiên Y","Càn":"Diên Niên","Khảm":"Tuyệt Mệnh","Cấn":"Sinh Khí","Chấn":"Họa Hại","Tốn":"Ngũ Quỷ","Ly":"Lục Sát"},
  "Đoài": {"Đoài":"Phục Vị","Càn":"Sinh Khí","Khảm":"Họa Hại","Cấn":"Diên Niên","Chấn":"Tuyệt Mệnh","Tốn":"Lục Sát","Ly":"Ngũ Quỷ","Khôn":"Thiên Y"},
};
// Thứ tự cố định để "biến tiếp N lần" kể từ Khí gốc
const NDT_KHI_CYCLE = ["Sinh Khí","Ngũ Quỷ","Diên Niên","Lục Sát","Họa Hại","Thiên Y","Tuyệt Mệnh","Phục Vị"];

// Hoán Thời Pháp — bảng khắc Can cố định, âm dương hỗ hoán
const NDT_HOAN_CAN_MAP = {
  "Giáp":"Kỷ","Ất":"Mậu","Bính":"Tân","Đinh":"Canh","Mậu":"Quý",
  "Kỷ":"Nhâm","Canh":"Ất","Tân":"Giáp","Nhâm":"Đinh","Quý":"Bính",
};
