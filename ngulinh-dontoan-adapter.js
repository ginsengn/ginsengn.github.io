/* ============================================================
   NGŨ LINH ĐỘN TOÁN — ADAPTER (nối vào NguLinhEngine)
   ------------------------------------------------------------
   File DUY NHẤT trong bộ 4 file (data / core / format / adapter)
   biết đến NguLinhEngine. Nó:
     1. Đọc ctx do Lịch Dụng Sự truyền vào (Ngày/Tháng/Năm Can Chi,
        Tháng-Ngày âm lịch số, Giờ Chi người dùng chọn).
     2. Gọi các hàm thuần trong core.js theo đúng trình tự.
     3. Vẽ giao diện kết quả (dùng render(), không phải run())
        ngay trong khung modal của engine — vì phương pháp này có
        bảng Hoán Thời Pháp tương tác (bấm 1..60), không thể gói
        gọn thành 1 chuỗi text tĩnh như thuật toán đơn giản.
     4. Toàn bộ trạng thái (cache Hoán Thời Pháp) nằm trong closure
        của lần render() này — không dùng biến window toàn cục,
        nên mở lại/mở nhiều lần không lẫn dữ liệu vào nhau.
   ============================================================ */

(function () {

    // ---- CSS riêng cho khối kết quả Ngũ Linh, chèn 1 lần duy nhất ----
    function injectStyleOnce() {
        if (document.getElementById('ndt-style')) return;
        const css = `
            .ndt-infobar{font-size:.8rem;color:var(--ink-soft);background:var(--paper-alt);
                border:1px solid #e8e2d6;border-radius:8px;padding:8px 12px;margin-bottom:14px;line-height:1.6;}
            .ndt-hero{background:var(--violet-lt);border:1px solid #d8c8ec;border-radius:10px;
                padding:18px 16px;text-align:center;margin-bottom:14px;}
            .ndt-hero .ndt-tag{font-size:.72rem;color:var(--violet);font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;}
            .ndt-hero .ndt-name{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--ink);margin-bottom:2px;}
            .ndt-hero .ndt-sub{font-size:.85rem;color:var(--ink-soft);}
            .ndt-kv-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-top:12px;text-align:left;font-size:.83rem;}
            .ndt-kv-grid .k{color:var(--ink-soft);font-weight:600;font-size:.68rem;text-transform:uppercase;letter-spacing:.4px;}
            .ndt-kv-grid .v{color:var(--gold);font-weight:700;}
            .ndt-ho-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0;}
            .ndt-ho-item{background:var(--paper);border:1px solid #e8e2d6;border-radius:7px;padding:8px 10px;font-size:.78rem;}
            .ndt-ho-item b{display:block;color:var(--teal);font-size:.66rem;text-transform:uppercase;margin-bottom:3px;}
            .ndt-actions{display:flex;gap:8px;margin:12px 0 18px;flex-wrap:wrap;}
            .ndt-btn{flex:1;min-width:120px;padding:9px 14px;border-radius:8px;font-size:.82rem;font-weight:600;
                cursor:pointer;border:1.5px solid var(--violet);background:white;color:var(--violet);transition:all .15s;font-family:inherit;}
            .ndt-btn:hover{background:var(--violet-lt);}
            .ndt-btn.primary{background:var(--violet);color:#fff;}
            .ndt-btn.primary:hover{background:#5a3f8a;}
            .ndt-detail{border:1px solid #e8e2d6;background:var(--paper-alt);border-radius:8px;margin-bottom:8px;}
            .ndt-detail summary{cursor:pointer;padding:10px 14px;font-weight:600;font-size:.8rem;color:var(--ink);list-style:none;}
            .ndt-detail summary::-webkit-details-marker{display:none;}
            .ndt-detail .ndt-steps{padding:0 14px 14px;font-size:.79rem;line-height:1.7;color:var(--ink);}
            .ndt-detail .ndt-steps p{margin:0 0 8px;}
            .ndt-detail .ndt-steps .lbl{color:var(--violet);font-weight:600;}
            .ndt-detail .ndt-steps .res{font-weight:700;color:var(--gold);}
            .ndt-section-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;
                color:var(--violet);margin:18px 0 8px;padding-top:14px;border-top:1px solid #e8e2d6;}
            .ndt-hoan-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin-bottom:14px;}
            .ndt-hoan-btn{aspect-ratio:1;border:1px solid #e8e2d6;background:var(--paper);color:var(--ink);
                font-size:.72rem;font-weight:600;cursor:pointer;border-radius:5px;font-family:inherit;}
            .ndt-hoan-btn:hover{background:var(--gold-lt);}
            .ndt-hoan-btn.selected{background:var(--violet);color:#fff;border-color:var(--violet);}
            .ndt-copied{background:var(--teal) !important;color:#fff !important;border-color:var(--teal) !important;}
            @media (max-width:480px){.ndt-hoan-grid{grid-template-columns:repeat(6,1fr);}.ndt-kv-grid{grid-template-columns:1fr;}}
        `;
        const style = document.createElement('style');
        style.id = 'ndt-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ---- Sao chép text thuần ----
    function ndtCopy(text, btn) {
        const done = () => {
            if (!btn) return;
            const old = btn.textContent;
            btn.textContent = '✅ Đã copy';
            btn.classList.add('ndt-copied');
            setTimeout(() => { btn.textContent = old; btn.classList.remove('ndt-copied'); }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => ndtFallbackCopy(text, done));
        } else {
            ndtFallbackCopy(text, done);
        }
    }
    function ndtFallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
    }

    // ---- Lưu ảnh 1 khối DOM về máy (cần html2canvas.min.js — xem hướng dẫn khi thiếu) ----
    function ndtSaveImage(el, filename, btn) {
        if (typeof html2canvas === 'undefined') {
            alert(
                'Chưa có thư viện chụp ảnh (html2canvas).\n\n' +
                'Cách bật tính năng "Lưu ảnh" (chỉ cần làm 1 lần, dùng offline được sau đó):\n' +
                '1. Tải file html2canvas.min.js tại:\n' +
                '   https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js\n' +
                '2. Đặt file này cùng thư mục với lich-am-duong.html.\n' +
                '3. Thêm dòng <script src="html2canvas.min.js"></script> vào lich-am-duong.html,\n' +
                '   trước dòng nạp ngulinh-engine.js.'
            );
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

    // ---- Tách "Giáp Tý" -> {can:'Giáp', chi:'Tý'} ----
    function splitCanChi(text) {
        if (!text) return null;
        const parts = text.trim().split(/\s+/);
        if (parts.length < 2) return null;
        return { can: parts[0], chi: parts[1] };
    }
    // ---- Tách "15/8" hoặc "15/8 nhuận" -> {day:15, month:8} ----
    function parseAmLich(text) {
        if (!text) return null;
        const m = text.match(/^(\d+)\s*\/\s*(\d+)/);
        if (!m) return null;
        return { day: parseInt(m[1], 10), month: parseInt(m[2], 10) };
    }

    // ---- Render 1 "khối kết quả quẻ" dùng chung cho cả Gốc và mỗi lần Hoán ----
    // data = { tag, name, hd, bienName, thienTinh, cungThienTinh, khiKep, hoDD, hoDDBien }
    function renderQueBlock(data) {
        const hoItems = data.hoDD.map(h => `<div class="ndt-ho-item"><b>${h.label} (Chính)</b>${h.name}</div>`)
            .concat(data.hoDDBien.map(h => `<div class="ndt-ho-item"><b>${h.label} (Biến)</b>${h.name}</div>`))
            .join('');
        return `
            <div class="ndt-hero">
                <div class="ndt-tag">${data.tag}</div>
                <div class="ndt-name">${data.name}</div>
                <div class="ndt-sub">Động hào ${data.hd} · Quẻ Biến: <b>${data.bienName}</b></div>
                <div class="ndt-kv-grid">
                    <div><div class="k">Thiên Tinh cư Cung</div><div class="v">${data.thienTinh} — ${data.cungThienTinh}</div></div>
                    <div><div class="k">Biến Khí Kép</div><div class="v">${data.khiKep}</div></div>
                </div>
            </div>
            <div class="ndt-ho-grid">${hoItems}</div>
        `;
    }

    function detailsHtml(id, summary, bodyHtml, open) {
        return `<details class="ndt-detail" id="${id}"${open ? ' open' : ''}>
            <summary>${summary}</summary>
            <div class="ndt-steps">${bodyHtml}</div>
        </details>`;
    }

    // =====================================================================
    // ĐĂNG KÝ VÀO ENGINE
    // =====================================================================
    NguLinhEngine.register({
        id: 'ngu-linh-don-toan',
        name: 'Ngũ Linh Độn Toán',
        render: function (ctx, container) {
            injectStyleOnce();

            // ---- 1. Đọc & kiểm tra ctx ----
            if (!ctx.socVong || !ctx.gio) {
                container.innerHTML = '<p style="color:var(--red)">Thiếu dữ liệu Sóc Vọng hoặc Giờ — không thể lập quẻ.</p>';
                return;
            }
            const namCC = splitCanChi(ctx.socVong.canChiNam);
            const ngayCC = splitCanChi(ctx.socVong.canChiNgay);
            const amLich = parseAmLich(ctx.socVong.amLich);
            const hourChi = ctx.gio.chi;

            if (!namCC || !ngayCC || !amLich || !hourChi) {
                container.innerHTML = '<p style="color:var(--red)">Dữ liệu Can Chi / Âm lịch của ngày này không hợp lệ (có thể do thư viện lịch âm chưa tải được — cần internet ít nhất 1 lần).</p>';
                return;
            }

            const yearChi = namCC.chi;
            const dayCan = ngayCC.can;
            const month = amLich.month;
            const day = amLich.day;
            const hCan = ndtHourCan(dayCan, hourChi);

            // ---- 2. Tính quẻ Gốc (y hệt logic gốc đã kiểm chứng) ----
            const ht = ndtHauThien(yearChi, month, day, hourChi);
            const tt = ndtTienThien(hCan, hourChi, ht.chuThoiLenh);
            const goc = ndtLapQueGoc(ht, tt, dayCan);
            const nd = ndtNguyenDuong(ht.que, tt.chuThienTinh.num);
            const hd = ndtHaoDong(nd, hourChi);
            const bienLines = ndtQueBien(goc.lines, hd);
            const bien = ndtNameFromLines(bienLines);
            const hoLines = ndtQueHoQuyNap(goc.lines);
            const ho = ndtNameFromLines(hoLines);
            const hoDD = ndtHoDienDich(goc.lines, hd);
            const hoDDBien = ndtHoDienDich(bienLines, hd);
            const kk = ndtBienKhiKep(goc.thuong, goc.ha, bien.thuong, bien.ha, hd);

            // ---- 3. Dựng khung HTML ----
            const fileSafeDate = `${String(ctx.duong.ngay).padStart(2,'0')}-${String(ctx.duong.thang).padStart(2,'0')}-${ctx.duong.nam}`;

            const infoBarHtml = `
                <div class="ndt-infobar">
                    🕐 Giờ lập quẻ: <b>${hCan} ${hourChi}</b> (${ctx.gio.khoangGio || ''})<br>
                    📅 ${ctx.duong.ngay}/${ctx.duong.thang}/${ctx.duong.nam} (${ctx.duong.thu}) — Âm lịch mồng ${day} tháng ${month}<br>
                    ${ngayCC.can} ${ngayCC.chi} · ${ctx.socVong.canChiThang} · ${ctx.socVong.canChiNam}
                    ${ctx.tietKhi ? ' · Tiết ' + ctx.tietKhi.tietHienHanh : ''}
                </div>
            `;

            const gocBlockHtml = renderQueBlock({
                tag: 'Quẻ Ngũ Linh (Gốc)',
                name: goc.name, hd: hd, bienName: bien.name,
                thienTinh: tt.chuThienTinh.name, cungThienTinh: ht.chuThoiLenh,
                khiKep: kk.khiKep, hoDD: hoDD, hoDDBien: hoDDBien
            });

            const gocDetailsHtml = [
                detailsHtml('ndt-d-ht', 'I. Xác lập quẻ đơn Hậu thiên', ndtFmtStepsHT(yearChi, month, day, hourChi, ht)),
                detailsHtml('ndt-d-tt', 'II. Xác lập quẻ đơn Tiên thiên', ndtFmtStepsTT(dayCan, hourChi, tt, ht)),
                detailsHtml('ndt-d-goc', 'III. Thành lập quẻ Ngũ linh (chồng quẻ)', ndtFmtStepsGoc(dayCan, goc, ht, tt)),
                detailsHtml('ndt-d-haobien', 'IV. Hào Nguyên đường · hào Động · quẻ Biến · quẻ Hỗ', ndtFmtStepsHaoBien(ht, tt, nd, hd, goc, bien, ho, hourChi)),
                detailsHtml('ndt-d-hodd', 'Quẻ Hỗ Diễn dịch (Nhất/Nhị/Tam Hỗ)', ndtFmtStepsHoDD(hoDD, hoDDBien)),
                detailsHtml('ndt-d-khikep', 'V. Chủ Thiên Tinh cư cung · Biến Khí Kép', ndtFmtStepsKhiKep(tt, ht, kk, goc)),
            ].join('');

            container.innerHTML = `
                ${infoBarHtml}
                <div id="ndt-goc-save-target">${gocBlockHtml}</div>
                <div class="ndt-actions">
                    <button type="button" class="ndt-btn primary" id="ndt-goc-btn-save">📷 Lưu ảnh</button>
                    <button type="button" class="ndt-btn" id="ndt-goc-btn-copy">📋 Copy text</button>
                </div>
                ${gocDetailsHtml}

                <div class="ndt-section-title">🔄 Hoán Thời Pháp (bấm 1 số để xem quẻ Khách lần đó)</div>
                <div class="ndt-infobar">
                    Quẻ Chủ gốc: <b>${goc.name}</b> · Giờ Chủ: <b>${hCan} ${hourChi}</b> · Cung Chủ thời lệnh: <b>${ht.chuThoiLenh}</b>
                </div>
                <div class="ndt-hoan-grid" id="ndt-hoan-grid"></div>
                <div id="ndt-hoan-result" style="display:none;"></div>
            `;

            // ---- 4. Gắn sự kiện cho khối Gốc ----
            const gocSaveTarget = container.querySelector('#ndt-goc-save-target');
            container.querySelector('#ndt-goc-btn-save').addEventListener('click', function () {
                ndtSaveImage(gocSaveTarget, 'nguLinh_' + fileSafeDate + '_' + hCan + hourChi, this);
            });
            container.querySelector('#ndt-goc-btn-copy').addEventListener('click', function () {
                ndtCopy(ndtFmtFullText(ht, tt, goc, bien, hd, kk, hoDD, hoDDBien), this);
            });

            // ---- 5. Hoán Thời Pháp — 60 nút, cache riêng cho lần mở này ----
            const hoanCache = [];
            const seed = { can: hCan, chi: hourChi, cung: ht.chuThoiLenh, group: ht.group, amDuongNgay: goc.amDuongNgay };
            const groupLabel = NDT_GROUP_LABEL[ht.group];

            const hoanGrid = container.querySelector('#ndt-hoan-grid');
            for (let i = 1; i <= 60; i++) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'ndt-hoan-btn';
                b.textContent = String(i);
                b.addEventListener('click', function () { selectHoanLan(i, b); });
                hoanGrid.appendChild(b);
            }

            function selectHoanLan(lan, btnEl) {
                hoanGrid.querySelectorAll('.ndt-hoan-btn').forEach(b => b.classList.toggle('selected', b === btnEl));
                const chain = ndtHoanChain(seed, lan, hoanCache);
                const r = chain[lan - 1];

                const rnd = ndtNguyenDuong(r.hauThienQue, r.tt.chuThienTinh.num);
                const rhd = ndtHaoDong(rnd, r.chiKhach);
                const rBienLines = ndtQueBien(r.que.lines, rhd);
                const rBien = ndtNameFromLines(rBienLines);
                const rHoLines = ndtQueHoQuyNap(r.que.lines);
                const rHo = ndtNameFromLines(rHoLines);
                const rHoDD = ndtHoDienDich(r.que.lines, rhd);
                const rHoDDBien = ndtHoDienDich(rBienLines, rhd);
                const rKk = ndtBienKhiKep(r.que.thuong, r.que.ha, rBien.thuong, rBien.ha, rhd);

                const blockHtml = renderQueBlock({
                    tag: 'Hoán Thời Pháp — lần ' + lan,
                    name: r.que.name, hd: rhd, bienName: rBien.name,
                    thienTinh: r.tt.chuThienTinh.name, cungThienTinh: r.cungKhachTL,
                    khiKep: rKk.khiKep, hoDD: rHoDD, hoDDBien: rHoDDBien
                });

                const detailsBlockHtml = [
                    detailsHtml('ndt-h-1', 'Bước 1 · Đổi Can Chi giờ Chủ → giờ Khách', ndtFmtHoanStep1(goc.amDuongNgay, r)),
                    detailsHtml('ndt-h-2', 'Bước 2 · Cung Khách thời lệnh · quẻ Hậu thiên', ndtFmtHoanStep2(r, groupLabel)),
                    detailsHtml('ndt-h-3', 'Bước 3 · Chủ tinh trực thời · quẻ Tiên thiên', ndtFmtHoanStep3(r)),
                    detailsHtml('ndt-h-4', 'Bước 4 · Ghép quẻ kép Ngũ Linh (Khách)', ndtFmtHoanStep4(goc.amDuongNgay, r)),
                    detailsHtml('ndt-h-hb', 'Hào Nguyên đường · hào Động · quẻ Biến · quẻ Hỗ', ndtFmtHoanStepHaoBien(r, rnd, rhd, rBien, rHo)),
                    detailsHtml('ndt-h-kk', 'Chủ Thiên Tinh cư cung · Biến Khí Kép', ndtFmtHoanStepKhiKep(r, lan, rKk)),
                ].join('');

                const resultBox = container.querySelector('#ndt-hoan-result');
                resultBox.innerHTML = `
                    <div id="ndt-hoan-save-target">${blockHtml}</div>
                    <div class="ndt-actions">
                        <button type="button" class="ndt-btn primary" id="ndt-hoan-btn-save">📷 Lưu ảnh</button>
                        <button type="button" class="ndt-btn" id="ndt-hoan-btn-copy">📋 Copy text</button>
                    </div>
                    ${detailsBlockHtml}
                `;
                resultBox.style.display = 'block';

                const hoanSaveTarget = resultBox.querySelector('#ndt-hoan-save-target');
                resultBox.querySelector('#ndt-hoan-btn-save').addEventListener('click', function () {
                    ndtSaveImage(hoanSaveTarget, 'nguLinh_hoan' + lan + '_' + fileSafeDate, this);
                });
                resultBox.querySelector('#ndt-hoan-btn-copy').addEventListener('click', function () {
                    ndtCopy(ndtFmtHoanFullText(lan, r, rBien, rhd, rKk, rHoDD, rHoDDBien), this);
                });

                resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

})();
