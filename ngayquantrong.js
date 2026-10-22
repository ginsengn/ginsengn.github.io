/* =========================================================
   NGÀY QUAN TRỌNG — ngayquantrong.js
   Đọc data từ ngayquantrong.html (cùng thư mục / cùng repo),
   rồi hiển thị khi bấm vào ngày tương ứng trên lịch tổng.

   - Không sửa lich_add_module_chiến_lược.html / calendar-core.js
   - Chỉ cần thêm 1 dòng:  <script src="ngayquantrong.js"></script>
     (đặt SAU calendar-core.js)
   - Ngày có data sẽ có dấu ★ nhỏ ở góc ô lịch.
   - Trong hộp chi tiết ngày: khối "Ngày quan trọng" có thể thu gọn / mở rộng.
   ========================================================= */
(function () {
    'use strict';
    if (window.NgayQuanTrong) return;

    // ---------- Cấu hình ----------
    var scriptEl = document.currentScript;
    var DATA_URL = window.NGAYQUANTRONG_URL ||
        new URL('ngayquantrong.html', (scriptEl && scriptEl.src) ? scriptEl.src : location.href).href;
    var LS_KEY = 'nqt_section_open';

    var DB = {};          // { "2026-12-31": [ {time, d, m, y, lines:[...]} ] }
    var loaded = false;

    // ---------- Parse ----------
    // Dòng tiêu đề mục:  [giờ]  Ngày.Tháng.Năm   (giờ có thể bỏ trống)
    // Giờ chỉ gồm số, h, :, gạch nối, khoảng trắng, "giờ".
    var HEAD_RE = /^\s*([0-9hH:giờ\s\-–—~→>]*?)\s*(\d{1,2})\s*[.\/\-•·]\s*(\d{1,2})\s*[.\/\-•·]\s*(\d{4})\s*$/;

    function keyOf(y, m, d) { return y + '-' + m + '-' + d; }

    function htmlToText(raw) {
        var s = String(raw)
            .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|tr|h[1-6]|pre|blockquote)>/gi, '\n');
        var doc = new DOMParser().parseFromString(s, 'text/html');   // bỏ <!-- ghi chú -->, giải mã &amp;...
        var root = doc.body || doc.documentElement;
        return (root.textContent || '').replace(/\r/g, '');
    }

    function timeSortKey(t) {
        var m = /(\d{1,2})\s*[hH:]\s*(\d{2})?/.exec(t || '');
        return m ? (+m[1]) * 60 + (+(m[2] || 0)) : -1;
    }

    function parseText(text) {
        var db = {};
        var blocks = text.split(/^[ \t]*\*{3,}[ \t]*$/m);          // *** ngăn cách các mục

        blocks.forEach(function (block) {
            var cur = null;

            function flush() {
                if (!cur) return;
                var L = cur.lines;
                while (L.length && !L[0].trim()) L.shift();
                while (L.length && !L[L.length - 1].trim()) L.pop();
                if (L.length) {                                      // bỏ dấu " bao quanh nội dung
                    L[0] = L[0].replace(/^\s*["“”]\s*/, '');
                    L[L.length - 1] = L[L.length - 1].replace(/\s*["“”]\s*$/, '');
                }
                var dt = new Date(cur.y, cur.m - 1, cur.d);
                var valid = cur.m >= 1 && cur.m <= 12 && dt.getMonth() === cur.m - 1 && dt.getDate() === cur.d;
                if (valid) {
                    var k = keyOf(cur.y, cur.m, cur.d);
                    (db[k] = db[k] || []).push(cur);
                }
                cur = null;
            }

            block.split('\n').forEach(function (line) {
                var m = HEAD_RE.exec(line);
                if (m) {
                    flush();
                    cur = {
                        time: m[1].trim().replace(/\s+/g, ' '),
                        d: +m[2], m: +m[3], y: +m[4], lines: []
                    };
                } else if (cur) {
                    cur.lines.push(line.replace(/\s+$/, ''));
                }
            });
            flush();
        });

        Object.keys(db).forEach(function (k) {                       // sắp theo giờ trong cùng 1 ngày
            db[k] = db[k].map(function (e, i) { return { e: e, i: i }; })
                .sort(function (a, b) {
                    return (timeSortKey(a.e.time) - timeSortKey(b.e.time)) || (a.i - b.i);
                })
                .map(function (x) { return x.e; });
        });
        return db;
    }

    // ---------- Render ----------
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function pad(n) { return String(n).padStart(2, '0'); }

    function renderLines(lines) {
        var out = '', seenBullet = false, first = true, gap = false;
        lines.forEach(function (raw) {
            var t = raw.trim();
            if (!t) { gap = true; return; }
            var b = /^[•·*\-–]\s*(.*)$/.exec(t);
            var cls, txt;
            if (b) { cls = 'nqt-b'; txt = b[1]; seenBullet = true; }
            else if (first && !seenBullet) { cls = 'nqt-title'; txt = t; }
            else { cls = 'nqt-line'; txt = t; }
            out += '<div class="' + cls + (gap ? ' nqt-gap' : '') + '">' + esc(txt) + '</div>';
            first = false; gap = false;
        });
        return out;
    }

    function renderBlock(list, sectionOpen) {
        var many = list.length > 1;
        var entries = list.map(function (e) {
            return '' +
                '<div class="nqt-entry">' +
                  '<button type="button" class="nqt-time" data-nqt="entry" aria-expanded="true">' +
                    '<span class="nqt-clock">🕐</span>' +
                    '<span class="nqt-time-t">' + esc(e.time || 'Cả ngày') + '</span>' +
                    '<span class="nqt-date">' + pad(e.d) + '.' + pad(e.m) + '.' + e.y + '</span>' +
                    '<span class="nqt-chev">▾</span>' +
                  '</button>' +
                  '<div class="nqt-text">' + (renderLines(e.lines) || '<div class="nqt-line">(chưa có nội dung)</div>') + '</div>' +
                '</div>';
        }).join('');

        return '' +
            '<div class="nqt-wrap' + (sectionOpen ? '' : ' nqt-collapsed') + '" id="nqt-block">' +
              '<button type="button" class="nqt-head" data-nqt="sec" aria-expanded="' + (sectionOpen ? 'true' : 'false') + '">' +
                '<span class="nqt-star">★</span>' +
                '<span class="nqt-head-t">Ngày quan trọng</span>' +
                '<span class="nqt-count">' + list.length + ' mốc</span>' +
                '<span class="nqt-chev">▾</span>' +
              '</button>' +
              '<div class="nqt-body">' +
                (many ? '<div class="nqt-tools"><button type="button" class="nqt-link" data-nqt="all-close">Thu gọn tất cả</button>' +
                        '<button type="button" class="nqt-link" data-nqt="all-open">Mở rộng tất cả</button></div>' : '') +
                '<div class="nqt-scroll">' + entries + '</div>' +
              '</div>' +
            '</div>';
    }

    // ---------- Gắn vào hộp chi tiết ngày ----------
    function sectionOpenPref() {
        try { return localStorage.getItem(LS_KEY) !== '0'; } catch (e) { return true; }
    }
    function saveSectionPref(open) {
        try { localStorage.setItem(LS_KEY, open ? '1' : '0'); } catch (e) { /* bỏ qua */ }
    }

    function injectIntoModal() {
        var box = document.getElementById('modal-detail-content');
        if (!box || box.querySelector('#nqt-block')) return;
        var badge = box.querySelector('.detail-date-badge');
        if (!badge) return;
        var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(badge.textContent || '');
        if (!m) return;
        var list = DB[keyOf(+m[3], +m[2], +m[1])];
        if (!list || !list.length) return;                           // không có data → không hiện gì
        var holder = document.createElement('div');
        holder.innerHTML = renderBlock(list, sectionOpenPref());
        badge.insertAdjacentElement('afterend', holder.firstElementChild);
    }

    // ---------- Đánh dấu ★ trên ô lịch ----------
    function markCalendar() {
        var cal = document.getElementById('calendar');
        if (!cal) return;
        var cells = cal.querySelectorAll('td[onclick]');
        for (var i = 0; i < cells.length; i++) {
            var td = cells[i];
            var m = /showDayDetail\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(td.getAttribute('onclick') || '');
            if (!m) continue;
            var list = DB[keyOf(+m[1], +m[2], +m[3])];
            if (list && list.length) {
                td.classList.add('nqt-has');
                td.title = '★ ' + list.map(function (e) { return e.time || 'Cả ngày'; }).join(' | ');
            } else if (td.classList.contains('nqt-has')) {
                td.classList.remove('nqt-has');
                td.removeAttribute('title');
            }
        }
    }

    // ---------- CSS ----------
    function injectStyle() {
        if (document.getElementById('nqt-style')) return;
        var css = '' +
        'td.nqt-has{position:relative}' +
        'td.nqt-has::after{content:"★";position:absolute;top:2px;right:4px;font-size:.78rem;line-height:1;color:#f76707;text-shadow:0 0 4px rgba(255,169,77,.55);pointer-events:none}' +

        '.nqt-wrap{margin:0 0 14px;border:1.5px solid #ffd2b3;border-radius:12px;background:#fffaf5;overflow:hidden;box-shadow:0 2px 10px rgba(247,103,7,.08)}' +
        '.nqt-head{width:100%;display:flex;align-items:center;gap:8px;padding:10px 12px;border:none;cursor:pointer;text-align:left;' +
            'background:linear-gradient(90deg,#fff0e3,#fff7ec);color:#d9480f;font-family:inherit;font-size:.9rem;font-weight:700}' +
        '.nqt-head:hover{background:linear-gradient(90deg,#ffe8d4,#fff3e2)}' +
        '.nqt-star{color:#f76707;font-size:1rem}' +
        '.nqt-head-t{flex:1;letter-spacing:.2px}' +
        '.nqt-count{font-size:.7rem;font-weight:700;color:#0b7a5a;background:#d3f9e8;border-radius:20px;padding:2px 9px}' +
        '.nqt-chev{display:inline-block;transition:transform .18s;color:#d9480f;font-size:.9rem}' +
        '.nqt-collapsed>.nqt-head .nqt-chev{transform:rotate(-90deg)}' +
        '.nqt-collapsed>.nqt-body{display:none}' +

        '.nqt-body{padding:8px 10px 10px}' +
        '.nqt-tools{display:flex;justify-content:flex-end;gap:12px;margin:0 2px 6px}' +
        '.nqt-link{background:none;border:none;padding:0;cursor:pointer;font-family:inherit;font-size:.72rem;font-weight:600;color:#7048e8;text-decoration:underline;text-underline-offset:2px}' +
        '.nqt-scroll{max-height:42vh;overflow-y:auto;padding-right:2px;-webkit-overflow-scrolling:touch}' +

        '.nqt-entry{margin-bottom:8px;border-radius:10px;border:1px solid #bdeedd;background:#f3fcf8;overflow:hidden}' +
        '.nqt-entry:last-child{margin-bottom:0}' +
        '.nqt-time{width:100%;display:flex;align-items:center;flex-wrap:wrap;gap:4px 10px;padding:8px 10px;border:none;cursor:pointer;text-align:left;' +
            'background:#fff1e6;font-family:inherit}' +
        '.nqt-time:hover{background:#ffe8d4}' +
        '.nqt-clock{font-size:.85rem}' +
        '.nqt-time-t{font-size:.95rem;font-weight:800;color:#d9480f;letter-spacing:.2px}' +
        '.nqt-date{font-size:.95rem;font-weight:800;color:#d6336c;margin-left:auto}' +
        '.nqt-entry.nqt-off>.nqt-text{display:none}' +
        '.nqt-entry.nqt-off .nqt-time .nqt-chev{transform:rotate(-90deg)}' +

        '.nqt-text{padding:9px 12px 11px;font-size:.88rem;line-height:1.6;color:#0b7a5a}' +
        '.nqt-title{font-weight:700;color:#087f5b;margin-bottom:3px}' +
        '.nqt-b{position:relative;padding-left:16px;margin:2px 0;font-weight:500}' +
        '.nqt-b::before{content:"";position:absolute;left:3px;top:.62em;width:6px;height:6px;border-radius:50%;background:#fab005}' +
        '.nqt-line{margin:2px 0}' +
        '.nqt-gap{margin-top:8px}' +

        '@media (max-width:480px){.nqt-date{margin-left:0}.nqt-scroll{max-height:46vh}}';
        var st = document.createElement('style');
        st.id = 'nqt-style';
        st.textContent = css;
        document.head.appendChild(st);
    }

    // ---------- Sự kiện thu gọn / mở rộng ----------
    document.addEventListener('click', function (ev) {
        var t = ev.target.closest && ev.target.closest('[data-nqt]');
        if (!t) return;
        var act = t.getAttribute('data-nqt');
        var wrap = t.closest('.nqt-wrap');
        if (!wrap) return;

        if (act === 'sec') {
            var collapsed = wrap.classList.toggle('nqt-collapsed');
            t.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            saveSectionPref(!collapsed);
        } else if (act === 'entry') {
            var en = t.closest('.nqt-entry');
            var off = en.classList.toggle('nqt-off');
            t.setAttribute('aria-expanded', off ? 'false' : 'true');
        } else if (act === 'all-close' || act === 'all-open') {
            var closeAll = act === 'all-close';
            wrap.querySelectorAll('.nqt-entry').forEach(function (en) {
                en.classList.toggle('nqt-off', closeAll);
                var b = en.querySelector('.nqt-time');
                if (b) b.setAttribute('aria-expanded', closeAll ? 'false' : 'true');
            });
        }
    });

    // ---------- Tải data ----------
    function load() {
        var url = DATA_URL + (DATA_URL.indexOf('?') < 0 ? '?' : '&') + '_=' + Date.now();   // tránh cache cũ
        return fetch(url, { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
            .then(function (txt) {
                DB = parseText(htmlToText(txt));
                loaded = true;
                markCalendar();
                injectIntoModal();
            })
            .catch(function (err) {
                console.warn('[ngayquantrong] Không đọc được ' + DATA_URL + ' —', err && err.message);
            });
    }

    // ---------- Khởi động ----------
    function init() {
        injectStyle();
        var box = document.getElementById('modal-detail-content');
        if (box) new MutationObserver(injectIntoModal).observe(box, { childList: true });
        var cal = document.getElementById('calendar');
        if (cal) new MutationObserver(markCalendar).observe(cal, { childList: true });
        load();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    // ---------- API nhỏ (tuỳ chọn dùng) ----------
    window.NgayQuanTrong = {
        reload: load,
        get: function (y, m, d) { return DB[keyOf(y, m, d)] || []; },
        all: function () { return DB; },
        isLoaded: function () { return loaded; },
        _parse: parseText
    };
})();