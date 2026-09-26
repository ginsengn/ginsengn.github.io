/* ============================================================
   NGŨ LINH ĐỘN TOÁN — LỚP DỰNG VĂN BẢN (format)
   ------------------------------------------------------------
   Các hàm ở đây nhận object kết quả đã tính từ core.js, trả về
   CHUỖI (HTML diễn giải từng bước, hoặc text thuần để copy) —
   không tự ý document.getElementById gì cả. Lớp adapter sẽ là
   nơi gán các chuỗi này vào đúng chỗ trong container.
   ============================================================ */

// ---------- QUẺ GỐC ----------

function ndtFmtStepsHT(yearChi, month, day, hourChi, ht) {
    return `
        <p><span class="lbl">Nguyệt kiến:</span> tháng ${month} kiến <b>${ht.kienChi}</b>.</p>
        <p>Coi ${ht.kienChi} là ngày mùng 1, đếm thuận tới ngày ${day} → dừng tại cung <b>${ht.dayCung}</b>.</p>
        <p>Coi cung ${ht.dayCung} là giờ Tý, đếm thuận tới giờ ${hourChi} → dừng tại cung <b>${ht.chuThoiLenh}</b> — đây là <span class="lbl">cung Chủ thời lệnh</span>.</p>
        <p>Năm ${yearChi} thuộc tam hợp <b>${NDT_GROUP_LABEL[ht.group]}</b>. Tra Hình 15: cung ${ht.chuThoiLenh} ra quẻ <span class="res">${ht.que}</span>.</p>
        <p>→ Quẻ đơn <b>Hậu thiên</b> = <span class="res">${ht.que}</span>.</p>
    `;
}

function ndtFmtStepsTT(dayCan, hourChi, tt, ht) {
    return `
        <p><span class="lbl">Can giờ:</span> (gợi ý theo Ngũ Thử Độn: ngày Can ${dayCan} → giờ Tý khởi Can <b>${ndtZiCanFromDayCan(dayCan)}</b>, đếm tới giờ ${hourChi} → gợi ý <b>${ndtHourCan(dayCan, hourChi)}</b>) — Can giờ đã dùng: <b>${tt.hCan}</b>. Vậy giờ lấy quẻ là giờ <b>${tt.hCan} ${hourChi}</b>.</p>
        <p><span class="lbl">Nạp âm:</span> giờ ${tt.hCan} ${hourChi} nạp âm Hành <b>${tt.hanh} ${tt.parity === 'D' ? 'dương' : 'âm'}</b>.</p>
        <p>Hành ${tt.hanh} ${tt.parity === 'D' ? 'dương' : 'âm'} ứng sao <b>${tt.startStar.name}</b> (số ${tt.startStar.num}) — đây là <span class="lbl">Chủ tinh sa địa bàn</span>, an tại cung Tý.</p>
        <p>An thuận các sao còn lại quanh 12 cung (bỏ qua Mùi, Tuất) → tới cung Chủ thời lệnh (<b>${ht.chuThoiLenh}</b>) gặp sao <b>${tt.chuThienTinh.name}</b> (số ${tt.chuThienTinh.num}) — đây là <span class="lbl">Chủ thiên tinh</span>.</p>
        <p>Sao số ${tt.chuThienTinh.num} ứng quẻ <span class="res">${tt.que}</span>.</p>
        <p>→ Quẻ đơn <b>Tiên thiên</b> = <span class="res">${tt.que}</span>.</p>
        <p>→ <b>Chủ Thiên Tinh ${tt.chuThienTinh.name} cư tại cung ${ht.chuThoiLenh}</b>.</p>
    `;
}

function ndtFmtStepsGoc(dayCan, goc, ht, tt) {
    return `
        <p><span class="lbl">Ngày ${dayCan}</span> là ngày <b>${goc.amDuongNgay}</b>.</p>
        <p>${goc.amDuongNgay === 'dương'
            ? `Ngày dương → quẻ Tiên thiên (${tt.que}) nằm trên, quẻ Hậu thiên (${ht.que}) nằm dưới.`
            : `Ngày âm → quẻ Hậu thiên (${ht.que}) nằm trên, quẻ Tiên thiên (${tt.que}) nằm dưới.`}</p>
        <p>Chồng <b>${goc.thuong}</b> (trên) lên <b>${goc.ha}</b> (dưới) → quẻ Ngũ linh: <span class="res">${goc.name}</span>.</p>
    `;
}

function ndtFmtStepsHaoBien(ht, tt, nd, hd, goc, bien, ho, hourChi) {
    return `
        <p><span class="lbl">Hào Nguyên đường:</span> số hiệu quẻ Hậu thiên (${ht.que}=${ndtHauThienSoHieu(ht.que)}) + số hiệu Chủ thiên tinh (${tt.chuThienTinh.name}=${tt.chuThienTinh.num}) = ${ndtHauThienSoHieu(ht.que) + tt.chuThienTinh.num}. → Nguyên đường = hào <span class="res">${nd}</span>.</p>
        <p><span class="lbl">Hào Động:</span> từ hào ${nd} coi là giờ Tý, đếm thuận tới giờ ${hourChi} → hào Động = hào <span class="res">${hd}</span>.</p>
        <p>Hào ${hd} động, biến ${goc.lines[hd - 1] === 'D' ? 'dương → âm' : 'âm → dương'} → quẻ Biến: <span class="res">${bien.name}</span>.</p>
        <p><span class="lbl">Quẻ Hỗ (quy nạp):</span> lấy hào 2,3,4 làm quẻ Hạ; hào 3,4,5 làm quẻ Thượng → quẻ Hỗ: <span class="res">${ho.name}</span>.</p>
    `;
}

function ndtFmtStepsHoDD(hoDD, hoDDBien) {
    return `
        <p>Quẻ Hỗ Diễn dịch (Nhất Hỗ → Nhị Hỗ → Tam Hỗ), công thức cố định không phụ thuộc vị trí hào Động:</p>
        <div class="ndt-ho-grid">
            ${hoDD.map(h => `<div class="ndt-ho-item"><b>${h.label} (Chính)</b>${h.name}</div>`).join('')}
            ${hoDDBien.map(h => `<div class="ndt-ho-item"><b>${h.label} (Biến)</b>${h.name}</div>`).join('')}
        </div>
    `;
}

function ndtFmtStepsKhiKep(tt, ht, kk, goc) {
    return `
        <p><span class="lbl">Chủ Thiên Tinh:</span> ${tt.chuThienTinh.name} (số ${tt.chuThienTinh.num}) — cư tại cung <b>${ht.chuThoiLenh}</b> (cung Chủ thời lệnh).</p>
        <p><span class="lbl">Thể / Dụng của quẻ Biến:</span> hào Động thuộc quẻ ${kk.dungBien === goc.thuong ? 'Thượng' : 'Hạ'} → <b>${kk.dungBien}</b> là <b>Dụng</b>; <b>${kk.theBien}</b> (không đổi) là <b>Thể</b>.</p>
        <p>Tra Đại Du Niên: <b>${kk.theBien}</b> (Thể) phối <b>${kk.dungBien}</b> (Dụng) → Khí gốc = <span class="res">${kk.khiGoc}</span>.</p>
        <p><span class="lbl">Họ quẻ (bản cung) của quẻ Chủ:</span> quẻ ${goc.name} thuộc cung <b>${kk.hoQueChinh}</b>.</p>
        <p>Đặt Khí gốc (${kk.khiGoc}) vào cung ${kk.hoQueChinh}, thuận theo Hà Đồ phối Tiên thiên bát quái chuyển đến quẻ Dụng của quẻ Biến (${kk.dungBien}) → được <b>${kk.soBuoc}</b> bước.</p>
        <p>Từ Khí gốc (${kk.khiGoc}) biến tiếp ${kk.soBuoc} lần → ra <span class="lbl">Biến Khí Kép</span> = <span class="res">${kk.khiKep}</span>.</p>
    `;
}

function ndtFmtSummary(goc, bien, nd, hd, tt, ht, kk) {
    return `
        <p><span class="lbl">Quẻ Chủ:</span> <span class="res">${goc.name}</span> (động hào ${hd})</p>
        <p><span class="lbl">Quẻ Biến:</span> <span class="res">${bien.name}</span></p>
        <p><span class="lbl">Hào Nguyên Đường:</span> hào ${nd}</p>
        <p><span class="lbl">Chủ Thiên Tinh:</span> ${tt.chuThienTinh.name} — cư tại cung <b>${ht.chuThoiLenh}</b></p>
        <p><span class="lbl">Biến Khí Kép:</span> <span class="res">${kk.khiKep}</span></p>
    `;
}

function ndtFmtFullText(ht, tt, goc, bien, hd, kk, hoDD, hoDDBien) {
    const L = [];
    L.push('LẬP QUẺ NGŨ LINH (Quẻ Gốc)');
    L.push(`Quẻ Hậu Thiên (đơn quái): ${ht.que}`);
    L.push(`Quẻ Tiên Thiên (đơn quái): ${tt.que}`);
    L.push(`Quẻ Chủ: ${goc.name} — động hào ${hd}`);
    L.push(`Quẻ Biến: ${bien.name}`);
    L.push(`Sao Chủ Tinh: ${tt.chuThienTinh.name} — cư tại cung ${ht.chuThoiLenh}`);
    L.push(`Biến Khí Kép: ${kk.khiKep}`);
    L.push(`Thể: ${kk.theGoc} · Dụng (quẻ Chính): ${kk.dungGoc} · Dụng (quẻ Biến): ${kk.dungBien}`);
    L.push(`Quẻ Hỗ (Chính): Nhất Hỗ ${hoDD[0].name} / Nhị Hỗ ${hoDD[1].name} / Tam Hỗ ${hoDD[2].name}`);
    L.push(`Quẻ Hỗ (Biến): Nhất Hỗ ${hoDDBien[0].name} / Nhị Hỗ ${hoDDBien[1].name} / Tam Hỗ ${hoDDBien[2].name}`);
    return L.join('\n');
}

// ---------- HOÁN THỜI PHÁP ----------

function ndtFmtHoanStep1(amDuongNgay, r) {
    return `
        <p><span class="lbl">Can:</span> Can giờ Chủ <b>${r.canChu}</b> đổi (khắc, âm dương hỗ hoán) → Can giờ Khách = <span class="res">${r.canKhach}</span>.</p>
        <p><span class="lbl">Chi:</span> ngày ${amDuongNgay}, Chi giờ Chủ <b>${r.chiChu}</b> là Chi ${ndtIsDuongChi(r.chiChu) ? 'dương' : 'âm'} → ${
            amDuongNgay === 'dương'
                ? (ndtIsDuongChi(r.chiChu) ? 'lùi 4 vị' : 'tiến 6 vị')
                : (ndtIsDuongChi(r.chiChu) ? 'tiến 4 vị' : 'lùi 6 vị')
        } → Chi giờ Khách = <span class="res">${r.chiKhach}</span>.</p>
        <p>→ Can Chi giờ Khách cần tìm: <span class="res">${r.canKhach} ${r.chiKhach}</span>.</p>
    `;
}

function ndtFmtHoanStep2(r, groupLabel) {
    return `
        <p>Từ cung Chủ thời lệnh <b>${r.cungChuTL}</b> coi là giờ Tý, đếm thuận tới Chi giờ Khách <b>${r.chiKhach}</b> → dừng tại cung <span class="res">${r.cungKhachTL}</span> — đây là cung Khách thời lệnh.</p>
        <p>Tra Hình 15 (theo nhóm năm sinh <b>${groupLabel}</b>): cung ${r.cungKhachTL} ra quẻ <span class="res">${r.hauThienQue}</span>.</p>
        <p>→ Quẻ đơn <b>Hậu thiên</b> (Khách) = <span class="res">${r.hauThienQue}</span>.</p>
    `;
}

function ndtFmtHoanStep3(r) {
    return `
        <p><span class="lbl">Nạp âm:</span> Can Chi giờ Khách ${r.canKhach} ${r.chiKhach} nạp âm Hành <b>${r.tt.hanh} ${r.tt.parity === 'D' ? 'dương' : 'âm'}</b>.</p>
        <p>Hành ${r.tt.hanh} ${r.tt.parity === 'D' ? 'dương' : 'âm'} ứng sao <b>${r.tt.startStar.name}</b> (số ${r.tt.startStar.num}) — Chủ tinh trực thời, an tại cung Tý.</p>
        <p>An thuận các sao còn lại quanh 12 cung (bỏ qua Mùi, Tuất) → tới cung Khách thời lệnh (<b>${r.cungKhachTL}</b>) gặp sao <b>${r.tt.chuThienTinh.name}</b> (số ${r.tt.chuThienTinh.num}) — sao Khách thời lệnh.</p>
        <p>Sao số ${r.tt.chuThienTinh.num} ứng quẻ <span class="res">${r.tienThienQue}</span>.</p>
        <p>→ Quẻ đơn <b>Tiên thiên</b> (Khách) = <span class="res">${r.tienThienQue}</span>.</p>
    `;
}

function ndtFmtHoanStep4(amDuongNgay, r) {
    return `
        <p>Ngày ${amDuongNgay} → ${
            amDuongNgay === 'dương'
                ? `quẻ Tiên thiên (${r.tienThienQue}) nằm trên, quẻ Hậu thiên (${r.hauThienQue}) nằm dưới.`
                : `quẻ Hậu thiên (${r.hauThienQue}) nằm trên, quẻ Tiên thiên (${r.tienThienQue}) nằm dưới.`
        }</p>
        <p>Chồng <b>${r.que.thuong}</b> (trên) lên <b>${r.que.ha}</b> (dưới) → quẻ Ngũ linh Hoán thời pháp: <span class="res">${r.que.name}</span>.</p>
    `;
}

function ndtFmtHoanStepHaoBien(r, nd, hd, bien, ho) {
    return `
        <p><span class="lbl">Hào Nguyên đường:</span> số hiệu quẻ Hậu thiên (${r.hauThienQue}=${ndtHauThienSoHieu(r.hauThienQue)}) + số hiệu Chủ thiên tinh (${r.tt.chuThienTinh.name}=${r.tt.chuThienTinh.num}) = ${ndtHauThienSoHieu(r.hauThienQue) + r.tt.chuThienTinh.num}. → Nguyên đường = hào <span class="res">${nd}</span>.</p>
        <p><span class="lbl">Hào Động:</span> từ hào ${nd} coi là giờ Tý, đếm thuận tới giờ (Chi giờ Khách) ${r.chiKhach} → hào Động = hào <span class="res">${hd}</span>.</p>
        <p>Hào ${hd} động, biến ${r.que.lines[hd - 1] === 'D' ? 'dương → âm' : 'âm → dương'} → quẻ Biến: <span class="res">${bien.name}</span>.</p>
        <p><span class="lbl">Quẻ Hỗ (quy nạp):</span> lấy hào 2,3,4 làm quẻ Hạ; hào 3,4,5 làm quẻ Thượng → quẻ Hỗ: <span class="res">${ho.name}</span>.</p>
    `;
}

function ndtFmtHoanStepKhiKep(r, lan, kk) {
    return `
        <p><span class="lbl">Chủ Thiên Tinh:</span> ${r.tt.chuThienTinh.name} (số ${r.tt.chuThienTinh.num}) — cư tại cung <b>${r.cungKhachTL}</b> (cung Khách thời lệnh).</p>
        <p><span class="lbl">Thể / Dụng của quẻ Biến:</span> <b>${kk.dungBien}</b> là <b>Dụng</b>; <b>${kk.theBien}</b> (không đổi) là <b>Thể</b>.</p>
        <p>Tra Đại Du Niên: <b>${kk.theBien}</b> (Thể) phối <b>${kk.dungBien}</b> (Dụng) → Khí gốc = <span class="res">${kk.khiGoc}</span>.</p>
        <p><span class="lbl">Họ quẻ (bản cung) của quẻ Chủ (Hoán thời pháp lần ${lan}):</span> quẻ ${r.que.name} thuộc cung <b>${kk.hoQueChinh}</b>.</p>
        <p>Đặt Khí gốc (${kk.khiGoc}) vào cung ${kk.hoQueChinh}, thuận theo Hà Đồ phối Tiên thiên bát quái chuyển đến quẻ Dụng của quẻ Biến (${kk.dungBien}) → được <b>${kk.soBuoc}</b> bước.</p>
        <p>Từ Khí gốc (${kk.khiGoc}) biến tiếp ${kk.soBuoc} lần → ra <span class="lbl">Biến Khí Kép</span> = <span class="res">${kk.khiKep}</span>.</p>
    `;
}

function ndtFmtHoanSummary(r, lan, bien, nd, hd, kk) {
    return `
        <p><span class="lbl">Giờ Chủ (lần này):</span> <b>${r.canChu} ${r.chiChu}</b> — cung Chủ thời lệnh <b>${r.cungChuTL}</b></p>
        <p><span class="lbl">Giờ Khách tìm được:</span> <b>${r.canKhach} ${r.chiKhach}</b> — cung Khách thời lệnh <b>${r.cungKhachTL}</b></p>
        <p><span class="lbl">Quẻ Chủ (Hoán thời pháp lần ${lan}):</span> <span class="res">${r.que.name}</span> (động hào ${hd})</p>
        <p><span class="lbl">Quẻ Biến:</span> <span class="res">${bien.name}</span></p>
        <p><span class="lbl">Chủ Thiên Tinh:</span> ${r.tt.chuThienTinh.name} — cư tại cung <b>${r.cungKhachTL}</b></p>
        <p><span class="lbl">Biến Khí Kép:</span> <span class="res">${kk.khiKep}</span></p>
    `;
}

function ndtFmtHoanFullText(lan, r, bien, hd, kk, hoDD, hoDDBien) {
    const L = [];
    L.push(`HOÁN THỜI PHÁP — lần ${lan}`);
    L.push(`Quẻ Hậu Thiên (đơn quái): ${r.hauThienQue}`);
    L.push(`Quẻ Tiên Thiên (đơn quái): ${r.tienThienQue}`);
    L.push(`Quẻ Chủ: ${r.que.name} — động hào ${hd}`);
    L.push(`Quẻ Biến: ${bien.name}`);
    L.push(`Sao Chủ Tinh: ${r.tt.chuThienTinh.name} — cư tại cung ${r.cungKhachTL}`);
    L.push(`Biến Khí Kép: ${kk.khiKep}`);
    L.push(`Thể: ${kk.theGoc} · Dụng (quẻ Chính): ${kk.dungGoc} · Dụng (quẻ Biến): ${kk.dungBien}`);
    L.push(`Quẻ Hỗ (Chính): Nhất Hỗ ${hoDD[0].name} / Nhị Hỗ ${hoDD[1].name} / Tam Hỗ ${hoDD[2].name}`);
    L.push(`Quẻ Hỗ (Biến): Nhất Hỗ ${hoDDBien[0].name} / Nhị Hỗ ${hoDDBien[1].name} / Tam Hỗ ${hoDDBien[2].name}`);
    return L.join('\n');
}
