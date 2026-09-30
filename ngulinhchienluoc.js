/* ============================================================
   NGŨ LINH CHIẾN LƯỢC — QUÉT KHOẢNG THỜI GIAN THEO ĐIỀU KIỆN
   ------------------------------------------------------------
   Đây KHÔNG phải 1 thuật toán đăng ký qua NguLinhEngine.register
   (vì flow đó bắt buộc chọn 1 ngày trên lịch trước). Module này
   tự chèn 1 nút nổi (floating button) + modal riêng, độc lập với
   modal "Lập Quẻ Ngũ Linh" theo-ngày.

   PHỤ THUỘC (phải nạp SAU các file này, đúng thứ tự):
     ngulinh-dontoan-data.js   -> NDT_CHI, NDT_STARS, NDT_HAUTHIEN_GROUPS...
     ngulinh-dontoan-core.js   -> ndtHauThien, ndtTienThien, ndtLapQueGoc,
                                   ndtNguyenDuong, ndtHaoDong, ndtQueBien,
                                   ndtNameFromLines, ndtBienKhiKep...
     ngulinh-engine.js         -> (không bắt buộc, chỉ dùng chung style)
     calendar-core.js          -> NL_getDayContext, NL_GIO_LIST
     mnl01.js                  -> nctThuThapDauVao (gom input 1 thời điểm)
                                   + (tuỳ chọn) nctTinhDiemTongHop để hiện
                                     thêm vượng/suy Thiên Tinh cho mỗi kết quả

   Thuật toán lập quẻ (Quẻ Chính, Hào Động, Quẻ Biến, Biến Khí Kép) lấy
   ĐÚNG NGUYÊN các hàm thuần trong ngulinh-dontoan-core.js — không tự
   suy diễn/viết lại công thức nào ở đây.

   PHẠM VI DỮ LIỆU: lịch âm + tiết khí chỉ có 2023–2046 (theo
   solarTermsDB của calendar-core.js). Ngày ngoài phạm vi này sẽ bị bỏ
   qua khi quét (đếm số ngày bỏ qua, báo cho người dùng).
   ============================================================ */

(function () {

    // ------------------------------------------------------------
    // A. DANH SÁCH CHO DROPDOWN
    // ------------------------------------------------------------
    const NLC_QUE_NAMES = Array.from(new Set(Object.values(NDT_HEXNAMES))).sort((a, b) => a.localeCompare(b, 'vi'));
    const NLC_STAR_NAMES = NDT_STARS.map(s => s.name);
    const NLC_BIEN_KHI = NDT_KHI_CYCLE.slice(); // Sinh Khí, Ngũ Quỷ, Diên Niên, Lục Sát, Họa Hại, Thiên Y, Tuyệt Mệnh, Phục Vị
    const NLC_MAX_NGAY = 1100; // ~3 năm — chặn quét quá dài làm treo trình duyệt

    function nlcChuanHoa(s) {
        return (s || '').normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ')
            .replace(/hỏa/g, 'hoả').replace(/hóa/g, 'hoá');
    }

    // ------------------------------------------------------------
    // B. TÍNH 1 THỜI ĐIỂM (ngày Dương + giờ Chi) -> bản ghi đầy đủ
    //    Trả về null nếu ngoài phạm vi dữ liệu (không lập được Âm lịch).
    // ------------------------------------------------------------
    function nlcTinhMotThoiDiem(year, month, day, chiGio) {
        const ctx = NL_getDayContext(year, month, day, chiGio);
        if (!ctx.socVong || !ctx.gio) return null;
        const input = nctThuThapDauVao(ctx);
        if (!input) return null;

        const queGoc = ndtLapQueGoc(input.hauThien, input.tienThien, input.dayCan);
        const nd = ndtNguyenDuong(input.hauThien.que, input.tienThien.chuThienTinh.num);
        const hd = ndtHaoDong(nd, input.hourChi);
        const bienLines = ndtQueBien(queGoc.lines, hd);
        const bienInfo = ndtNameFromLines(bienLines);
        const hoDienDich = ndtHoDienDich(queGoc.lines, hd);
        const khiKep = ndtBienKhiKep(queGoc.thuong, queGoc.ha, bienInfo.thuong, bienInfo.ha, hd);

        let tinhDiem = null;
        if (typeof nctTinhDiemTongHop === 'function') {
            try {
                tinhDiem = nctTinhDiemTongHop(input.thienTinh.name, input.cuCung, input.dayChi, nctChiTuCanChi(input.thangSocVong.canChi));
            } catch (e) { tinhDiem = null; }
        }

        return {
            year, month, day, thu: input.duong.thu,
            gio: { chi: input.hourChi, canChi: input.hCan + ' ' + input.hourChi },
            ngayCC: input.dayCan + ' ' + input.dayChi,
            thangCC: input.thangSocVong.canChi,
            namCC: ctx.socVong.canChiNam,
            cungCu: input.cuCung,
            thienTinh: input.thienTinh.name,
            queChinh: queGoc.name,
            haoDong: hd,
            queBien: bienInfo.name,
            hoDienDich,
            khiGoc: khiKep.khiGoc,
            khiKep: khiKep.khiKep,
            tinhDiem,
        };
    }

    // ------------------------------------------------------------
    // C. QUÉT KHOẢNG THỜI GIAN — áp bộ lọc, bỏ qua tiêu chí để trống
    // ------------------------------------------------------------
    function nlcNgayKeTiep(y, m, d) {
        const dt = new Date(y, m - 1, d + 1);
        return { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
    }
    function nlcSoNgay(y1, m1, d1, y2, m2, d2) {
        return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000) + 1;
    }

    function nlcQuet(filter, onDone) {
        const { tu, den, queChinh, haoDong, cungCu, thienTinh, bienKhi } = filter;
        const tong = nlcSoNgay(tu.year, tu.month, tu.day, den.year, den.month, den.day);
        if (tong <= 0) { onDone({ loi: 'Ngày kết thúc phải sau ngày bắt đầu.' }); return; }
        if (tong > NLC_MAX_NGAY) { onDone({ loi: `Khoảng quét quá dài (${tong} ngày). Giới hạn ${NLC_MAX_NGAY} ngày (~3 năm) để tránh treo trình duyệt — hãy thu hẹp lại.` }); return; }

        const queChinhN = queChinh ? nlcChuanHoa(queChinh) : null;
        const ketQua = [];
        let daQuetNgay = 0, boQuaNgoaiPhamVi = 0;
        let cur = { ...tu };

        for (let i = 0; i < tong; i++) {
            let coDuLieuNgay = false;
            for (const g of NL_GIO_LIST) {
                const rec = nlcTinhMotThoiDiem(cur.year, cur.month, cur.day, g.chi);
                if (!rec) continue;
                coDuLieuNgay = true;
                if (queChinhN && nlcChuanHoa(rec.queChinh) !== queChinhN) continue;
                if (haoDong && rec.haoDong !== Number(haoDong)) continue;
                if (cungCu && rec.cungCu !== cungCu) continue;
                if (thienTinh && rec.thienTinh !== thienTinh) continue;
                if (bienKhi && rec.khiKep !== bienKhi) continue;
                ketQua.push(rec);
            }
            daQuetNgay++;
            if (!coDuLieuNgay) boQuaNgoaiPhamVi++;
            cur = nlcNgayKeTiep(cur.year, cur.month, cur.day);
        }
        onDone({ ketQua, tongNgayQuet: daQuetNgay, boQuaNgoaiPhamVi, tongGioXet: daQuetNgay * 12 });
    }

    // ------------------------------------------------------------
    // D. GIAO DIỆN — nút nổi + modal (tự tạo, không phụ thuộc DOM có sẵn)
    // ------------------------------------------------------------
    function style() {
        if (document.getElementById('nlc-style')) return;
        const css = `
            #nlc-fab{position:fixed;right:18px;bottom:18px;z-index:9999;background:#5a3f8a;color:#fff;
                border:none;border-radius:999px;padding:13px 18px;font-size:.85rem;font-weight:700;
                box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer;font-family:inherit;}
            #nlc-fab:hover{background:#4a3270;}
            #nlc-overlay{position:fixed;inset:0;background:rgba(20,10,30,.55);z-index:10000;
                display:none;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;}
            #nlc-overlay.active{display:flex;}
            #nlc-modal{background:#fdfaf5;border-radius:12px;max-width:760px;width:100%;padding:20px;
                font-family:inherit;color:#2b2320;}
            #nlc-modal h2{margin:0 0 4px;font-size:1.15rem;color:#5a3f8a;font-family:'Playfair Display',serif;}
            #nlc-modal .nlc-close{float:right;background:none;border:none;font-size:1.3rem;cursor:pointer;color:#888;}
            .nlc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;margin:14px 0;}
            .nlc-grid label{display:flex;flex-direction:column;font-size:.72rem;font-weight:700;color:#7a6f63;
                text-transform:uppercase;letter-spacing:.3px;gap:4px;}
            .nlc-grid select,.nlc-grid input{font-size:.88rem;padding:7px 8px;border-radius:6px;border:1px solid #cfc3e6;
                background:#fff;font-family:inherit;color:#2b2320;text-transform:none;letter-spacing:0;font-weight:500;}
            .nlc-span2{grid-column:1 / -1;}
            .nlc-daterow{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
            .nlc-note{font-size:.76rem;color:#7a6f63;line-height:1.5;margin:8px 0;}
            .nlc-btn{padding:10px 16px;border-radius:8px;font-size:.85rem;font-weight:700;cursor:pointer;
                border:1.5px solid #5a3f8a;background:#5a3f8a;color:#fff;font-family:inherit;width:100%;}
            .nlc-btn.secondary{background:#fff;color:#5a3f8a;}
            #nlc-out{margin-top:16px;}
            .nlc-summary{font-size:.82rem;background:#eee6f7;border-radius:8px;padding:10px 12px;margin-bottom:10px;}
            .nlc-row{border:1px solid #e8e2d6;background:#fff;border-radius:8px;padding:10px 12px;margin-bottom:6px;font-size:.83rem;line-height:1.6;}
            .nlc-row b{color:#5a3f8a;}
            .nlc-empty{font-size:.85rem;color:#7a6f63;font-style:italic;}
            .nlc-actions{display:flex;gap:8px;margin-top:10px;}
            .nlc-copied{background:#2f8f7a !important;border-color:#2f8f7a !important;color:#fff !important;}
            @media (max-width:520px){.nlc-grid{grid-template-columns:1fr;}.nlc-daterow{grid-template-columns:1fr;}}
        `;
        const st = document.createElement('style');
        st.id = 'nlc-style'; st.textContent = css;
        document.head.appendChild(st);
    }

    function opt(list, ph) {
        return `<option value="">${ph}</option>` + list.map(v => `<option value="${v}">${v}</option>`).join('');
    }

    function xuatDong(r) {
        return `Giờ ${r.gio.chi} (${r.gio.canChi}), ngày ${r.ngayCC}, tháng ${r.thangCC}, năm ${r.namCC} — ` +
               `Dương lịch: ${String(r.day).padStart(2, '0')}.${String(r.month).padStart(2, '0')}.${r.year} (${r.thu}) — ` +
               `Cung Cư ${r.cungCu}, Thiên Tinh ${r.thienTinh}, Quẻ Chính ${r.queChinh} (Hào ${r.haoDong} động → ${r.queBien}), ` +
               `Biến Khí ${r.khiKep}` + (r.khiGoc !== r.khiKep ? ` (Khí gốc ${r.khiGoc})` : '') +
               (r.tinhDiem ? `, Thiên Tinh ${r.tinhDiem.phanLoai.muc} (${r.tinhDiem.diemCuoi.toFixed(2)})` : '');
    }

    function copy(text, btn) {
        const done = () => {
            const old = btn.textContent; btn.textContent = '✅ Đã copy'; btn.classList.add('nlc-copied');
            setTimeout(() => { btn.textContent = old; btn.classList.remove('nlc-copied'); }, 1500);
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
        document.body.removeChild(ta); done();
    }

    function render() {
        style();

        const fab = document.createElement('button');
        fab.id = 'nlc-fab'; fab.type = 'button'; fab.textContent = '🧭 Ngũ Linh Chiến Lược';
        document.body.appendChild(fab);

        const overlay = document.createElement('div');
        overlay.id = 'nlc-overlay';
        overlay.innerHTML = `
            <div id="nlc-modal">
                <button type="button" class="nlc-close" id="nlc-close">✕</button>
                <h2>🧭 Ngũ Linh Chiến Lược</h2>
                <div class="nlc-note">Quét một khoảng thời gian (Dương lịch), tìm giờ/ngày thoả các điều kiện đã chọn. Tiêu chí nào để trống sẽ bị bỏ qua. Dữ liệu Âm lịch/Tiết khí chỉ có 2023–2046; khoảng quét tối đa ~3 năm (${NLC_MAX_NGAY} ngày) mỗi lần.</div>

                <div class="nlc-grid">
                    <label class="nlc-span2">Mốc thời gian cần quét
                        <div class="nlc-daterow">
                            <input type="date" id="nlc-tu" />
                            <div style="align-self:center;text-align:center;font-weight:700;color:#7a6f63;">đến</div>
                            <input type="date" id="nlc-den" />
                        </div>
                    </label>
                    <label>Quẻ Chính<select id="nlc-que">${opt(NLC_QUE_NAMES, '— bất kỳ —')}</select></label>
                    <label>Hào Động
                        <select id="nlc-hao">${opt(['1','2','3','4','5','6'], '— bất kỳ —')}</select>
                    </label>
                    <label>Cung Cư<select id="nlc-cung">${opt(NDT_CHI, '— bất kỳ —')}</select></label>
                    <label>Thiên Tinh<select id="nlc-tinh">${opt(NLC_STAR_NAMES, '— bất kỳ —')}</select></label>
                    <label class="nlc-span2">Biến Khí<select id="nlc-khi">${opt(NLC_BIEN_KHI, '— bất kỳ —')}</select></label>
                </div>

                <button type="button" class="nlc-btn" id="nlc-go">⚙️ Quét tìm</button>
                <div id="nlc-out"></div>
            </div>`;
        document.body.appendChild(overlay);

        fab.addEventListener('click', () => overlay.classList.add('active'));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
        overlay.querySelector('#nlc-close').addEventListener('click', () => overlay.classList.remove('active'));

        overlay.querySelector('#nlc-go').addEventListener('click', function () {
            const btn = this;
            const parse = (id) => {
                const v = overlay.querySelector(id).value; // yyyy-mm-dd
                if (!v) return null;
                const [y, m, d] = v.split('-').map(Number);
                return { year: y, month: m, day: d };
            };
            const tu = parse('#nlc-tu'), den = parse('#nlc-den');
            const out = overlay.querySelector('#nlc-out');
            if (!tu || !den) { out.innerHTML = '<p class="nlc-empty">Chọn đủ ngày bắt đầu và ngày kết thúc.</p>'; return; }

            const filter = {
                tu, den,
                queChinh: overlay.querySelector('#nlc-que').value || null,
                haoDong: overlay.querySelector('#nlc-hao').value || null,
                cungCu: overlay.querySelector('#nlc-cung').value || null,
                thienTinh: overlay.querySelector('#nlc-tinh').value || null,
                bienKhi: overlay.querySelector('#nlc-khi').value || null,
            };

            btn.textContent = '⏳ Đang quét...'; btn.disabled = true;
            setTimeout(() => {
                nlcQuet(filter, (res) => {
                    btn.textContent = '⚙️ Quét tìm'; btn.disabled = false;
                    if (res.loi) { out.innerHTML = `<p class="nlc-empty">${res.loi}</p>`; return; }
                    const tieuChiDaChon = Object.entries({
                        'Quẻ Chính': filter.queChinh, 'Hào Động': filter.haoDong, 'Cung Cư': filter.cungCu,
                        'Thiên Tinh': filter.thienTinh, 'Biến Khí': filter.bienKhi,
                    }).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ') || '(không chọn tiêu chí nào — liệt kê mọi giờ)';

                    let html = `<div class="nlc-summary">Đã quét ${res.tongNgayQuet} ngày (${res.tongGioXet} giờ), bỏ qua ${res.boQuaNgoaiPhamVi} ngày ngoài phạm vi dữ liệu.<br>Tiêu chí: ${tieuChiDaChon}.<br><b>${res.ketQua.length} kết quả thoả mãn.</b></div>`;
                    if (!res.ketQua.length) {
                        html += '<p class="nlc-empty">Không có thời điểm nào thoả mãn trong khoảng đã chọn.</p>';
                    } else {
                        const max = 200;
                        res.ketQua.slice(0, max).forEach(r => { html += `<div class="nlc-row">${xuatDong(r)}</div>`; });
                        if (res.ketQua.length > max) html += `<p class="nlc-empty">... và ${res.ketQua.length - max} kết quả nữa (dùng "Copy toàn bộ" để lấy đủ).</p>`;
                        html += `<div class="nlc-actions"><button type="button" class="nlc-btn secondary" id="nlc-copy">📋 Copy toàn bộ kết quả</button></div>`;
                    }
                    out.innerHTML = html;
                    const cp = out.querySelector('#nlc-copy');
                    if (cp) cp.addEventListener('click', function () {
                        const text = `NGŨ LINH CHIẾN LƯỢC — KẾT QUẢ QUÉT\nTừ ${tu.day}/${tu.month}/${tu.year} đến ${den.day}/${den.month}/${den.year}\nTiêu chí: ${tieuChiDaChon}\nSố kết quả: ${res.ketQua.length}\n\n` +
                            res.ketQua.map(xuatDong).join('\n');
                        copy(text, this);
                    });
                });
            }, 10);
        });
    }

    function boot() {
        if (typeof NguLinhEngine === 'undefined' || typeof NL_getDayContext !== 'function' ||
            typeof ndtLapQueGoc !== 'function' || typeof nctThuThapDauVao !== 'function') {
            console.error('Ngũ Linh Chiến Lược: thiếu phụ thuộc (cần nạp sau ngulinh-dontoan-data.js, ngulinh-dontoan-core.js, calendar-core.js, mnl01.js).');
            return;
        }
        render();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

})();