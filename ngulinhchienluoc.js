/**
 * ngulinh-chienluoc.js
 * Module tìm kiếm mốc thời gian thỏa mãn tiêu chí Ngũ Linh Chiến Lược
 * Yêu cầu: Nạp sau các file calendar-core.js, ngulinh-dontoan-data.js, ngulinh-dontoan-core.js
 */

(function () {
    // 1. Tạo CSS dạng nhúng cho Modal Chiến Lược
    const style = document.createElement('style');
    style.textContent = `
        .nlcl-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); display: flex; align-items: center;
            justify-content: center; z-index: 10000; font-family: sans-serif;
        }
        .nlcl-modal {
            background: #fff; width: 90%; max-width: 600px; max-height: 90vh;
            border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex; flex-direction: column; overflow: hidden;
        }
        .nlcl-modal-header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;
        }
        .nlcl-modal-header h3 { margin: 0; color: #8b0000; }
        .nlcl-close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
        .nlcl-modal-body { overflow-y: auto; flex: 1; padding-right: 5px; }
        .nlcl-form-group { margin-bottom: 12px; }
        .nlcl-form-group label { display: block; font-weight: bold; margin-bottom: 4px; font-size: 14px; }
        .nlcl-form-group input, .nlcl-form-group select {
            width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;
        }
        .nlcl-form-row { display: flex; gap: 10px; }
        .nlcl-form-row .nlcl-form-group { flex: 1; }
        .nlcl-btn-search {
            width: 100%; padding: 10px; background: #8b0000; color: #fff;
            border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 10px;
        }
        .nlcl-btn-search:hover { background: #a00000; }
        .nlcl-results { margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px; }
        .nlcl-result-item {
            background: #f9f9f9; border-left: 4px solid #8b0000;
            padding: 8px 12px; margin-bottom: 8px; border-radius: 2px; font-size: 14px;
        }
    `;
    document.head.appendChild(style);

    // 2. Danh sách 12 Chi cho Cung cư
    const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

    // 3. Render Modal HTML
    function createModalHTML() {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'nlcl-modal-container';
        modalDiv.className = 'nlcl-modal-overlay';
        modalDiv.style.display = 'none';

        // Lấy danh sách Thiên Tinh từ NguLinhDonToanData nếu có
        const thienTinhList = (typeof NguLinhDonToanData !== 'undefined' && NguLinhDonToanData.THIEN_TINH) 
            ? Object.values(NguLinhDonToanData.THIEN_TINH) 
            : ["Thiên Bồng", "Thiên Anh", "Thiên Xung", "Thiên Nhậm", "Thiên Tâm", "Thiên Nhuế", "Thiên Phụ", "Thiên Cầm", "Thiên Không"];

        // Danh sách Biến Khí
        const bienKhiList = ["Sinh Khí", "Thiên Y", "Diên Niên", "Phục Vị", "Tuyệt Mệnh", "Ngũ Quỷ", "Lục Sát", "Họa Hại"];

        modalDiv.innerHTML = `
            <div class="nlcl-modal">
                <div class="nlcl-modal-header">
                    <h3>Ngũ Linh Chiến Lược - Lọc Thời Gian</h3>
                    <button class="nlcl-close-btn" onclick="NguLinhChienLuoc.closeModal()">&times;</button>
                </div>
                <div class="nlcl-modal-body">
                    <div class="nlcl-form-group">
                        <label>Quẻ Chính cần chọn (Tên quẻ đầy đủ):</label>
                        <input type="text" id="nlcl-que-chinh" placeholder="Ví dụ: Thiên Hỏa Đồng Nhân">
                    </div>

                    <div class="nlcl-form-row">
                        <div class="nlcl-form-group">
                            <label>Hào động (1 - 6):</label>
                            <select id="nlcl-hao-dong">
                                <option value="">-- Bỏ qua --</option>
                                <option value="1">Hào 1</option>
                                <option value="2">Hào 2</option>
                                <option value="3">Hào 3</option>
                                <option value="4">Hào 4</option>
                                <option value="5">Hào 5</option>
                                <option value="6">Hào 6</option>
                            </select>
                        </div>
                        <div class="nlcl-form-group">
                            <label>Cung cư (Địa Chi):</label>
                            <select id="nlcl-cung-cu">
                                <option value="">-- Bỏ qua --</option>
                                ${DIA_CHI.map(chi => `<option value="${chi}">${chi}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="nlcl-form-row">
                        <div class="nlcl-form-group">
                            <label>Thiên Tinh:</label>
                            <select id="nlcl-thien-tinh">
                                <option value="">-- Bỏ qua --</option>
                                ${thienTinhList.map(tt => `<option value="${tt}">${tt}</option>`).join('')}
                            </select>
                        </div>
                        <div class="nlcl-form-group">
                            <label>Biến Khí:</label>
                            <select id="nlcl-bien-khi">
                                <option value="">-- Bỏ qua --</option>
                                ${bienKhiList.map(bk => `<option value="${bk}">${bk}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="nlcl-form-row">
                        <div class="nlcl-form-group">
                            <label>Từ ngày (Dương lịch):</label>
                            <input type="date" id="nlcl-start-date">
                        </div>
                        <div class="nlcl-form-group">
                            <label>Đến ngày (Dương lịch):</label>
                            <input type="date" id="nlcl-end-date">
                        </div>
                    </div>

                    <button class="nlcl-btn-search" onclick="NguLinhChienLuoc.timKiem()">Tìm Mốc Thời Gian Thỏa Mãn</button>

                    <div class="nlcl-results" id="nlcl-results-list">
                        <!-- Kết quả hiển thị tại đây -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        // Đặt ngày mặc định (Hiện tại -> 30 ngày sau)
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        document.getElementById('nlcl-start-date').valueAsDate = today;
        document.getElementById('nlcl-end-date').valueAsDate = nextMonth;
    }

    // 4. Thuật toán tìm kiếm quy quét theo mốc giờ
    function timKiemChienLuoc() {
        const queChinhFilter = document.getElementById('nlcl-que-chinh').value.trim().toLowerCase();
        const haoDongFilter = document.getElementById('nlcl-hao-dong').value;
        const cungCuFilter = document.getElementById('nlcl-cung-cu').value;
        const thienTinhFilter = document.getElementById('nlcl-thien-tinh').value;
        const bienKhiFilter = document.getElementById('nlcl-bien-khi').value;

        const startDateStr = document.getElementById('nlcl-start-date').value;
        const endDateStr = document.getElementById('nlcl-end-date').value;

        if (!startDateStr || !endDateStr) {
            alert("Vui lòng chọn khoảng thời gian tìm kiếm!");
            return;
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59);

        const resultsContainer = document.getElementById('nlcl-results-list');
        resultsContainer.innerHTML = '<p>Đang tính toán và quét dữ liệu...</p>';

        let matchedResults = [];

        // Mỗi ngày có 12 giờ Âm lịch (khung giờ môt tả từ Tý đến Hợi, đại diện các mốc giờ Dương lịch 1, 3, 5, 7...)
        const gioGioiHan = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];

        let curDate = new Date(startDate);

        setTimeout(() => {
            while (curDate <= endDate) {
                for (let h of gioGioiHan) {
                    let checkTime = new Date(curDate);
                    checkTime.setHours(h, 0, 0, 0);

                    // Gọi hàm tính quẻ core của Ngũ Linh Độn Toán
                    let queData = null;
                    if (typeof NguLinhDonToanCore !== 'undefined' && NguLinhDonToanCore.tinhQue) {
                        queData = NguLinhDonToanCore.tinhQue(checkTime);
                    } else if (typeof tinhQueNgulinh === 'function') {
                        queData = tinhQueNgulinh(checkTime);
                    }

                    if (!queData) continue;

                    // Kiểm tra tiêu chí (Điều kiện bỏ trống = bỏ qua)
                    // 1. Tên quẻ chính
                    if (queChinhFilter) {
                        const tenQue = (queData.queChinh?.tenQue || queData.tenQueChinh || "").toLowerCase();
                        if (!tenQue.includes(queChinhFilter)) continue;
                    }

                    // 2. Hào động
                    if (haoDongFilter) {
                        const hao = queData.haoDong || queData.queChinh?.haoDong;
                        if (String(hao) !== String(haoDongFilter)) continue;
                    }

                    // 3. Cung cư
                    if (cungCuFilter) {
                        const cung = queData.cungCu || queData.cungAn || "";
                        if (cung !== cungCuFilter) continue;
                    }

                    // 4. Thiên Tinh
                    if (thienTinhFilter) {
                        const tinh = queData.thienTinh || queData.saoThienTinh || "";
                        if (tinh !== thienTinhFilter) continue;
                    }

                    // 5. Biến khí
                    if (bienKhiFilter) {
                        const bk = queData.bienKhi || queData.bienKhiKhau || "";
                        if (bk !== bienKhiFilter) continue;
                    }

                    // Nếu qua hết lọc -> Lưu mốc thời gian thỏa mãn
                    matchedResults.push({
                        time: checkTime,
                        data: queData
                    });
                }
                curDate.setDate(curDate.getDate() + 1);
            }

            // Hiển thị kết quả
            hienThiKetQua(matchedResults);
        }, 50);
    }

    // 5. Hiển thị kết quả ra HTML
    function hienThiKetQua(list) {
        const resultsContainer = document.getElementById('nlcl-results-list');
        if (list.length === 0) {
            resultsContainer.innerHTML = '<b>Không tìm thấy giờ nào thỏa mãn tiêu chí trong khoảng thời gian đã chọn.</b>';
            return;
        }

        let html = `<b>Tìm thấy ${list.length} mốc thời gian thỏa mãn:</b><br><br>`;
        list.forEach(item => {
            const dt = item.time;
            const d = item.data;

            // Lấy thông tin Can Chi và Dương Lịch
            const gioChi = d.gioChi || d.canChiGio || "";
            const ngayChi = d.ngayChi || d.canChiNgay || "";
            const thangChi = d.thangChi || d.canChiThang || "";
            const namChi = d.namChi || d.canChiNam || "";

            const day = String(dt.getDate()).padStart(2, '0');
            const month = String(dt.getMonth() + 1).padStart(2, '0');
            const year = dt.getFullYear();
            const hour = String(dt.getHours()).padStart(2, '0');

            html += `
                <div class="nlcl-result-item">
                    📍 <b>Giờ ${gioChi}, ngày ${ngayChi}, tháng ${thangChi}, năm ${namChi}</b><br>
                    🗓️ Dương lịch: <b>${day}.${month}.${year}</b> (${hour}:00)<br>
                    🔮 Quẻ: <b>${d.queChinh?.tenQue || d.tenQueChinh}</b> (Động hào ${d.haoDong || d.queChinh?.haoDong}) 
                    | Cung: <b>${d.cungCu || d.cungAn || 'N/A'}</b> 
                    | Tinh: <b>${d.thienTinh || d.saoThienTinh || 'N/A'}</b> 
                    | Biến khí: <b>${d.bienKhi || 'N/A'}</b>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    // Expose các API ra bên ngoài global
    window.NguLinhChienLuoc = {
        openModal: function () {
            if (!document.getElementById('nlcl-modal-container')) {
                createModalHTML();
            }
            document.getElementById('nlcl-modal-container').style.display = 'flex';
        },
        closeModal: function () {
            const modal = document.getElementById('nlcl-modal-container');
            if (modal) modal.style.display = 'none';
        },
        timKiem: timKiemChienLuoc
    };
})();
