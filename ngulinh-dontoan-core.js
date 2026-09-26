/* ============================================================
   NGŨ LINH ĐỘN TOÁN — LỚP LÕI TÍNH TOÁN (core)
   ------------------------------------------------------------
   Toàn bộ hàm ở đây là HÀM THUẦN (pure function): nhận tham số,
   trả về giá trị/object — KHÔNG đọc/ghi DOM, KHÔNG đọc biến
   window toàn cục. Logic giữ nguyên 100% so với file gốc
   "Lập Quẻ Ngũ Linh" (đã kiểm chứng khớp các ví dụ mẫu).

   Điểm khác duy nhất so với bản gốc: hoanChain() ở cuối file
   không còn đọc window.GOC_STATE / window.HOAN_CACHE nữa — nó
   nhận "seed" (điểm khởi đầu) và "cache" (mảng lưu kết quả) làm
   tham số, để mỗi lượt lập quẻ (mỗi lần mở modal) có trạng thái
   Hoán Thời Pháp riêng, độc lập, không lẫn giữa các lần bấm khác
   nhau — và không cần biến toàn cục nào cả.
   ============================================================ */

const ndtChiIdx = c => NDT_CHI.indexOf(c);
const ndtCanIdx = c => NDT_CAN.indexOf(c);
const ndtIsDuongChi = c => ndtChiIdx(c) % 2 === 0;
const ndtIsDuongCan = c => ndtCanIdx(c) % 2 === 0;

function ndtJiaziIndex(cIdx, chIdx) {
    for (let x = 0; x < 60; x++) { if (x % 10 === cIdx && x % 12 === chIdx) return x; }
}
function ndtNayinHanh(can, chi) {
    const x = ndtJiaziIndex(ndtCanIdx(can), ndtChiIdx(chi));
    return NDT_NAYIN_HANH[Math.floor(x / 2)];
}

function ndtZiCanFromDayCan(dayCan) {
    const map = {"Giáp":"Giáp","Kỷ":"Giáp","Ất":"Bính","Canh":"Bính","Bính":"Mậu","Tân":"Mậu",
                 "Đinh":"Canh","Nhâm":"Canh","Mậu":"Nhâm","Quý":"Nhâm"};
    return map[dayCan];
}
function ndtHourCan(dayCan, hourChi) {
    const ziCan = ndtZiCanFromDayCan(dayCan);
    const idx = (ndtCanIdx(ziCan) + ndtChiIdx(hourChi)) % 10;
    return NDT_CAN[idx];
}

const ndtFindStarByHanhParity = (hanh, parity) => NDT_STARS.find(s => s.hanh === hanh && s.parity === parity);

function ndtPlaceStars(startStarNum) {
    const map = {};
    NDT_ACTIVE_BRANCHES.forEach((b, p) => {
        const n = ((startStarNum - 1 + p) % 10) + 1;
        map[b] = NDT_STARS[n - 1];
    });
    map["Mùi"] = map["Sửu"];
    map["Tuất"] = map["Thìn"];
    return map;
}

const ndtQueFromStarNum = n => NDT_BATQUAI[n <= 8 ? n : n - 8];
const ndtHauThienSoHieu = que => NDT_BATQUAI.indexOf(que);

function ndtYearGroup(yearChi) {
    if (["Dần","Ngọ","Tuất"].includes(yearChi)) return "DanNgoTuat";
    if (["Thân","Tý","Thìn"].includes(yearChi)) return "ThanTyThin";
    if (["Hợi","Mão","Mùi"].includes(yearChi)) return "HoiMaoMui";
    if (["Tỵ","Dậu","Sửu"].includes(yearChi)) return "TyDauSuu";
}

function ndtHauThien(yearChi, month, day, hourChi) {
    const kienIdx = (month + 1) % 12;
    const dayCungIdx = (kienIdx + (day - 1)) % 12;
    const hourCungIdx = (dayCungIdx + ndtChiIdx(hourChi)) % 12;
    const chuThoiLenh = NDT_CHI[hourCungIdx];
    const group = ndtYearGroup(yearChi);
    const que = NDT_HAUTHIEN_GROUPS[group][chuThoiLenh];
    return { kienChi: NDT_CHI[kienIdx], dayCung: NDT_CHI[dayCungIdx], chuThoiLenh, group, que };
}

// Lõi đặt sao Thiên bàn — dùng chung cho quẻ Gốc (Tiên thiên) và quẻ
// Khách của Hoán thời pháp.
function ndtTienThienCore(can, chi, atCung) {
    const hanh = ndtNayinHanh(can, chi);
    const parity = ndtIsDuongChi(chi) ? "D" : "A";
    const startStar = ndtFindStarByHanhParity(hanh, parity);
    const starMap = ndtPlaceStars(startStar.num);
    const chuThienTinh = starMap[atCung];
    const que = ndtQueFromStarNum(chuThienTinh.num);
    return { hanh, parity, startStar, starMap, chuThienTinh, que };
}
function ndtTienThien(hCan, hourChi, chuThoiLenh) {
    const core = ndtTienThienCore(hCan, hourChi, chuThoiLenh);
    return { hCan, ...core };
}

function ndtTrigramFromLines(l3) {
    const key = l3.join("");
    for (const [name, l] of Object.entries(NDT_TRIGRAM_LINES)) { if (l.join("") === key) return name; }
}
const ndtHexLines = (thuong, ha) => NDT_TRIGRAM_LINES[ha].concat(NDT_TRIGRAM_LINES[thuong]);
const ndtHexName = (thuong, ha) => NDT_HEXNAMES[thuong + "_" + ha];
const ndtNgayAmDuong = dayCan => ndtIsDuongCan(dayCan) ? "dương" : "âm";

// Chồng quẻ đơn Hậu thiên + Tiên thiên thành quẻ kép Ngũ linh — ngày
// dương: Tiên thiên trên / Hậu thiên dưới; ngày âm: ngược lại.
function ndtGhepQueKep(hauThienQue, tienThienQue, amDuongNgay) {
    let thuong, ha;
    if (amDuongNgay === "dương") { thuong = tienThienQue; ha = hauThienQue; }
    else { thuong = hauThienQue; ha = tienThienQue; }
    return { thuong, ha, lines: ndtHexLines(thuong, ha), name: ndtHexName(thuong, ha) };
}
function ndtLapQueGoc(ht, tt, dayCan) {
    const amDuongNgay = ndtNgayAmDuong(dayCan);
    const q = ndtGhepQueKep(ht.que, tt.que, amDuongNgay);
    return { amDuongNgay, ...q };
}

function ndtNguyenDuong(hauThienQue, starNum) {
    const sum = ndtHauThienSoHieu(hauThienQue) + starNum;
    if (sum <= 6) return sum;
    const r = sum % 6;
    return r === 0 ? 6 : r;
}
function ndtHaoDong(nd, hourChi) { return ((nd - 1 + ndtChiIdx(hourChi)) % 6) + 1; }
const ndtFlip = l => l === "D" ? "A" : "D";
function ndtQueBien(lines, hd) { const n = lines.slice(); n[hd - 1] = ndtFlip(n[hd - 1]); return n; }
function ndtQueHoQuyNap(lines) {
    const ha = [lines[1], lines[2], lines[3]];
    const thuong = [lines[2], lines[3], lines[4]];
    return ha.concat(thuong);
}
function ndtNameFromLines(lines) {
    const ha = ndtTrigramFromLines(lines.slice(0, 3));
    const thuong = ndtTrigramFromLines(lines.slice(3, 6));
    return { ha, thuong, name: ndtHexName(thuong, ha) };
}
// Hỗ Diễn dịch: một công thức cố định duy nhất, KHÔNG rẽ nhánh theo vị
// trí hào Động. Tam Hỗ luôn trùng Hỗ quy nạp (ndtQueHoQuyNap).
function ndtHoDienDich(lines, hd) {
    const defs = [
        { label: "Nhất Hỗ", ha: [2, 3, 4], thuong: [3, 4, 5] },
        { label: "Nhị Hỗ", ha: [1, 2, 3], thuong: [3, 4, 5] },
        { label: "Tam Hỗ (= Hỗ quy nạp)", ha: [1, 2, 3], thuong: [2, 3, 4] },
    ];
    return defs.map(d => {
        const haLines = d.ha.map(i => lines[i]);
        const thuongLines = d.thuong.map(i => lines[i]);
        const full = haLines.concat(thuongLines);
        const info = ndtNameFromLines(full);
        return { label: d.label, lines: full, name: info.name };
    });
}

// Bảng "Họ quẻ / Bản cung" (Kinh Phòng Bát cung), dựng từ quy luật biến
// hào (Nhất thế..Quy hồn) trên chính NDT_TRIGRAM_LINES.
function ndtBuildPalaceTable() {
    const table = {};
    Object.keys(NDT_TRIGRAM_LINES).forEach(P => {
        const p = NDT_TRIGRAM_LINES[P];
        const f = ndtFlip;
        const members = [
            { ha: [p[0], p[1], p[2]], thuong: p },
            { ha: [f(p[0]), p[1], p[2]], thuong: p },
            { ha: [f(p[0]), f(p[1]), p[2]], thuong: p },
            { ha: [f(p[0]), f(p[1]), f(p[2])], thuong: p },
            { ha: [f(p[0]), f(p[1]), f(p[2])], thuong: [f(p[0]), p[1], p[2]] },
            { ha: [f(p[0]), f(p[1]), f(p[2])], thuong: [f(p[0]), f(p[1]), p[2]] },
            { ha: [f(p[0]), f(p[1]), f(p[2])], thuong: [p[0], f(p[1]), p[2]] },
            { ha: [p[0], p[1], p[2]], thuong: [p[0], f(p[1]), p[2]] },
        ];
        members.forEach(m => {
            const key = ndtTrigramFromLines(m.thuong) + "_" + ndtTrigramFromLines(m.ha);
            table[key] = P;
        });
    });
    return table;
}
const NDT_PALACE_TABLE = ndtBuildPalaceTable();
const ndtHoQue = (thuong, ha) => NDT_PALACE_TABLE[thuong + "_" + ha];

function ndtBienKhiKep(gocThuong, gocHa, bienThuong, bienHa, hd) {
    const theBien = hd <= 3 ? bienThuong : bienHa;
    const dungBien = hd <= 3 ? bienHa : bienThuong;
    const khiGoc = NDT_DAI_DU_NIEN[theBien][dungBien];

    const hoQueChinh = ndtHoQue(gocThuong, gocHa);
    const soBuoc = ((ndtHauThienSoHieu(dungBien) - ndtHauThienSoHieu(hoQueChinh)) + 8) % 8;

    const idxKhi = NDT_KHI_CYCLE.indexOf(khiGoc);
    const khiKep = NDT_KHI_CYCLE[(idxKhi + soBuoc) % 8];

    const theGoc = theBien;
    const dungGoc = hd <= 3 ? gocHa : gocThuong;

    return { theBien, dungBien, theGoc, dungGoc, khiGoc, hoQueChinh, soBuoc, khiKep };
}

// =====================================================================
// HOÁN THỜI PHÁP — sinh chuỗi quẻ Khách từ quẻ Chủ, tối đa 60 lần
// =====================================================================

// Bước 1 (hàng Chi): Ngày dương giờ dương thoái 4 vị, giờ âm tiến 6 vị;
// Ngày âm giờ dương tiến 4 vị, giờ âm thoái 6 vị.
function ndtHoanChiKhach(chiChu, amDuongNgay) {
    const idx = ndtChiIdx(chiChu);
    const chiDuong = ndtIsDuongChi(chiChu);
    let step;
    if (amDuongNgay === "dương") {
        step = chiDuong ? (4 - 1) : -(6 - 1);
    } else {
        step = chiDuong ? -(4 - 1) : (6 - 1);
    }
    const newIdx = ((idx + step) % 12 + 12) % 12;
    return NDT_CHI[newIdx];
}

// Bước 2: từ cung Chủ thời lệnh hiện tại, coi là Tý, đếm thuận tới Chi
// giờ Khách vừa tìm → ra cung Khách thời lệnh.
function ndtCungKhachThoiLenh(cungChuTL, chiKhach) {
    return NDT_CHI[(ndtChiIdx(cungChuTL) + ndtChiIdx(chiKhach)) % 12];
}

// Tính MỘT lần Hoán thời pháp từ một cặp (Can,Chi,cung) "Chủ" hiện tại.
function ndtHoanMotLan(canChu, chiChu, cungChuTL, group, amDuongNgay) {
    const canKhach = NDT_HOAN_CAN_MAP[canChu];
    const chiKhach = ndtHoanChiKhach(chiChu, amDuongNgay);
    const cungKhachTL = ndtCungKhachThoiLenh(cungChuTL, chiKhach);
    const hauThienQue = NDT_HAUTHIEN_GROUPS[group][cungKhachTL];
    const tt = ndtTienThienCore(canKhach, chiKhach, cungKhachTL);
    const que = ndtGhepQueKep(hauThienQue, tt.que, amDuongNgay);

    return {
        canChu, chiChu, cungChuTL,
        canKhach, chiKhach, cungKhachTL,
        hauThienQue, tt, tienThienQue: tt.que,
        que,
    };
}

/**
 * Sinh (hoặc lấy từ cache) toàn bộ chuỗi 1..upTo lần Hoán thời pháp.
 * seed = { can, chi, cung, group, amDuongNgay } — điểm khởi đầu (Giờ Chủ
 * của quẻ Gốc). cache = mảng do người gọi tự giữ (vd trong closure của
 * 1 lần mở modal) — hàm này ĐỌC/GHI vào mảng đó (mutate), không dùng
 * biến window nào cả, nên nhiều lần lập quẻ khác nhau không lẫn cache.
 */
function ndtHoanChain(seed, upTo, cache) {
    if (!cache) cache = [];
    let can = cache.length ? cache[cache.length - 1].canKhach : seed.can;
    let chi = cache.length ? cache[cache.length - 1].chiKhach : seed.chi;
    let cung = cache.length ? cache[cache.length - 1].cungKhachTL : seed.cung;
    while (cache.length < upTo) {
        const r = ndtHoanMotLan(can, chi, cung, seed.group, seed.amDuongNgay);
        cache.push(r);
        can = r.canKhach; chi = r.chiKhach; cung = r.cungKhachTL;
    }
    return cache;
}
