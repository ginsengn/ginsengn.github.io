/* ============================================================
   MODULE LUẬN GIẢI CỬU TINH — ADAPTER
   Tự động trích xuất thông tin Tứ Trị / Thiên Tinh từ Lịch nền & Module trước.
   ============================================================ */

(function () {

    function injectStyleOnce() {
        if (document.getElementById('ctl-luan-style')) return;
        const css = `
            .ctl-box { background: var(--paper-alt); border: 1px solid #e8e2d6; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
            .ctl-title { font-size: .85rem; font-weight: 700; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
            .ctl-row { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
            .ctl-field { flex: 1; min-width: 120px; }
            .ctl-field label { display: block; font-size: .72rem; font-weight: 700; color: var(--ink-soft); text-transform: uppercase; margin-bottom: 4px; }
            .ctl-field select, .ctl-field input { width: 100%; padding: 6px; font-size: .82rem; border: 1px solid #ddd6c8; border-radius: 6px; background: white; }
            .ctl-btn-run { width: 100%; padding: 10px; background: var(--ink); color: var(--gold-lt); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 6px; }
            .ctl-btn-run:hover { background: #2c2c4e; }
            .ctl-out { width: 100%; min-height: 260px; font-family: inherit; font-size: .82rem; padding: 10px; border: 1px solid #ddd6c8; border-radius: 8px; background: white; margin-top: 10px; white-space: pre-wrap; line-height: 1.5; }
        `;
        const style = document.createElement('style');
        style.id = 'ctl-luan-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    const DANH_SACH_TINH = ["Thiên Bồng", "Thiên Nhuế", "Thiên Xung", "Thiên Phụ", "Thiên Cầm", "Thiên Tâm", "Thiên Trụ", "Thiên Nhậm", "Thiên Anh", "Thiên Không"];
    const DANH_SACH_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

    NguLinhEngine.register({
        id: 'ngu-linh-cuu-tinh-luan-giai',
        name: 'Luận Giải Cửu Tinh (Thiên Tinh)',
        render: function (ctx, container) {
            injectStyleOnce();

            let autoTinh = "";
            let autoCung = "";
            let autoNhat = ctx.socVong ? ctx.socVong.canChiNgay : "";
            let autoChiSocVong = "";
            let autoChiTietKhi = "";

            if (ctx.socVong && ctx.socVong.canChiThang) {
                autoChiSocVong = ctx.socVong.canChiThang.split(/\s+/)[1] || "";
            }
            if (ctx.tietKhi && ctx.tietKhi.canChiThang) {
                autoChiTietKhi = ctx.tietKhi.canChiThang.split(/\s+/)[1] || autoChiSocVong;
            } else {
                autoChiTietKhi = autoChiSocVong;
            }

            if (window.M_CUU_TINH_RESULT) {
                autoTinh = window.M_CUU_TINH_RESULT.tenTinh || "";
                autoCung = window.M_CUU_TINH_RESULT.cungCu || "";
            }

            const autoSuccess = (autoTinh && autoCung && autoChiSocVong);

            let html = `
                <div class="ctl-box">
                    <div class="ctl-title">🔮 THAM CHIẾU CỬU TINH CHI TIẾT (1:1 SÁCH CỔ)</div>
                    <div style="font-size:.78rem; color:${autoSuccess ? 'green' : 'var(--red)'}; margin-bottom:10px;">
                        ${autoSuccess ? '✅ Tự động trích xuất dữ liệu thành công!' : '⚠️ Vui lòng kiểm tra/chọn thủ công thông tin tham chiếu:'}
                    </div>

                    <div class="ctl-row">
                        <div class="ctl-field">
                            <label>1. Tên Thiên Tinh</label>
                            <select id="ctl_selTinh">
                                ${DANH_SACH_TINH.map(t => `<option value="${t}" ${t === autoTinh ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="ctl-field">
                            <label>2. Cung Cư (Địa Bàn)</label>
                            <select id="ctl_selCung">
                                ${DANH_SACH_CHI.map(c => `<option value="${c}" ${c === autoCung ? 'selected' : ''}>Cung ${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="ctl-row">
                        <div class="ctl-field">
                            <label>3. Ngày Chiêm Quẻ (Nhật Can Chi)</label>
                            <input type="text" id="ctl_txtNhat" value="${autoNhat}" placeholder="Ví dụ: Giáp Tý, Nhâm Sửu...">
                        </div>
                    </div>

                    <div class="ctl-row">
                        <div class="ctl-field">
                            <label>4. Tháng Sóc Vọng (Âm Lịch)</label>
                            <select id="ctl_selSocVong">
                                ${DANH_SACH_CHI.map(c => `<option value="${c}" ${c === autoChiSocVong ? 'selected' : ''}>Tháng ${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="ctl-field">
                            <label>5. Tháng Tiết Khí (Thực Tế)</label>
                            <select id="ctl_selTietKhi">
                                ${DANH_SACH_CHI.map(c => `<option value="${c}" ${c === autoChiTietKhi ? 'selected' : ''}>Tháng ${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <button class="ctl-btn-run" id="ctl_btnThucThi">⚡ PHÂN TÍCH LUẬN GIẢI CỬU TINH</button>
                </div>

                <textarea id="ctl_outText" class="ctl-out" readonly placeholder="Kết quả luận giải sẽ hiển thị tại đây..."></textarea>
                <button class="btn-primary" style="width:100%; margin-top:8px;" id="ctl_btnCopy">📋 Sao Chép Luận Giải (Text Thuần)</button>
            `;

            container.innerHTML = html;

            function chayLuanGiai() {
                const tinh = document.getElementById("ctl_selTinh").value;
                const cung = document.getElementById("ctl_selCung").value;
                const nhat = document.getElementById("ctl_txtNhat").value.trim();
                const socVong = document.getElementById("ctl_selSocVong").value;
                const tietKhi = document.getElementById("ctl_selTietKhi").value;

                const resText = ctlPhanTichChiTiet(tinh, cung, nhat, socVong, tietKhi);
                document.getElementById("ctl_outText").value = resText;
            }

            document.getElementById("ctl_btnThucThi").addEventListener("click", chayLuanGiai);
            document.getElementById("ctl_btnCopy").addEventListener("click", function () {
                const ta = document.getElementById("ctl_outText");
                if (!ta.value) return;
                ta.select();
                document.execCommand("copy");
                this.textContent = "✅ Đã Copy!";
                setTimeout(() => { this.textContent = "📋 Sao Chép Luận Giải (Text Thuần)"; }, 1500);
            });

            chayLuanGiai();
        }
    });

})();
