<div class="modal-overlay" id="addCategoryModal">
    <div class="modal-content" style="max-width: 640px;">
        <div class="modal-header">
            <h2>➕ Thêm nội dung thi đấu</h2>
            <button class="modal-close" onclick="closeAddCategoryModal()">×</button>
        </div>
        <div class="modal-body">
            <form id="addCategoryForm">

                <!-- ✅ THÔNG BÁO LINH HOẠT -->
                <div style="background: #e7f3ff; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 13px; color: #1a3a7a;">
                    💡 <strong>Linh hoạt:</strong> Bạn có thể thêm <strong>bất kỳ nội dung nào</strong> — không bắt buộc phải có đủ 5 nội dung. Mỗi giải đấu có thể có số lượng nội dung khác nhau.
                </div>

                <!-- 3 TAB CHỌN LOẠI NỘI DUNG -->
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 700; margin-bottom: 10px; display: block;">
                        Chọn cách thêm nội dung:
                    </label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <button type="button" class="category-type-btn active" onclick="selectCategoryType('suggested', this)">
                            📋 Từ gợi ý
                        </button>
                        <button type="button" class="category-type-btn" onclick="selectCategoryType('custom', this)">
                            ✏️ Tự nhập
                        </button>
                        <button type="button" class="category-type-btn" onclick="selectCategoryType('agegroup', this)">
                            👶 Nhóm tuổi
                        </button>
                    </div>
                </div>

                <!-- TAB 1: GỢI Ý -->
                <div id="typeSuggested" style="display: block;">
                    <div class="form-group">
                        <label>Chọn nội dung <span style="color: #e94560;">*</span></label>
                        <select id="categorySuggested" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 15px;">
                            <option value="">-- Chọn nội dung --</option>
                            <!-- Sinh động từ suggestedCategories -->
                        </select>
                        <small style="color: #6c757d; font-size: 12px; margin-top: 6px; display: block;">
                            📝 Danh sách này là <strong>gợi ý</strong> — bạn có thể bỏ qua và tự nhập nội dung khác.
                        </small>
                    </div>
                </div>

                <!-- TAB 2: TỰ NHẬP -->
                <div id="typeCustom" style="display: none;">
                    <div class="form-group">
                        <label>Tên nội dung <span style="color: #e94560;">*</span></label>
                        <input type="text" id="categoryCustomName" 
                               placeholder="VD: Đồng đội hỗn hợp, Đôi nam nữ 45+, Đôi lãnh đạo..." 
                               style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 15px;"
                               autocomplete="off">
                        <small style="color: #6c757d; font-size: 12px; margin-top: 6px; display: block;">
                            💡 Bạn có thể nhập bất kỳ tên nội dung nào — hệ thống chấp nhận hết.
                        </small>
                    </div>
                </div>

                <!-- TAB 3: NHÓM TUỔI -->
                <div id="typeAgegroup" style="display: none;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>Nhóm tuổi</label>
                            <select id="categoryAgegroup" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 15px;">
                                <option value="U8">U8</option>
                                <option value="U10" selected>U10</option>
                                <option value="U11">U11</option>
                                <option value="U12">U12</option>
                                <option value="U13">U13</option>
                                <option value="U15">U15</option>
                                <option value="U17">U17</option>
                                <option value="U18">U18</option>
                                <option value="U21">U21</option>
                                <option value="U23">U23</option>
                                <option value="U35">U35</option>
                                <option value="U40">U40</option>
                                <option value="U45">U45</option>
                                <option value="U50">U50</option>
                                <option value="U55">U55</option>
                                <option value="U60">U60</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Hình thức</label>
                            <select id="categoryFormat" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 15px;">
                                <option value="Đơn nam">Đơn nam</option>
                                <option value="Đơn nữ">Đơn nữ</option>
                                <option value="Đôi nam">Đôi nam</option>
                                <option value="Đôi nữ">Đôi nữ</option>
                                <option value="Đôi nam nữ">Đôi nam nữ</option>
                                <option value="Đồng đội nam">Đồng đội nam</option>
                                <option value="Đồng đội nữ">Đồng đội nữ</option>
                            </select>
                        </div>
                    </div>
                    <div style="background: #e7f3ff; padding: 12px 16px; border-radius: 8px; margin-top: 12px; font-size: 13px;">
                        <strong>📝 Xem trước:</strong> <span id="agePreview" style="color: #1a3a7a; font-weight: 700;">U10 Đơn nam</span>
                    </div>
                </div>

                <!-- CẤU HÌNH CHI TIẾT -->
                <div style="background: #f8f9fa; padding: 16px; border-radius: 10px; margin-top: 20px;">
                    <div style="font-weight: 700; color: #1a3a7a; margin-bottom: 12px;">
                        ⚙️ Cấu hình riêng cho nội dung này (tùy chọn)
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label style="font-size: 13px;">Best of</label>
                            <select id="categoryBestOf" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 14px;">
                                <option value="3" selected>3 set</option>
                                <option value="5">5 set</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-size: 13px;">Điểm/set</label>
                            <select id="categoryPointsPerSet" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 14px;">
                                <option value="21" selected>21 điểm</option>
                                <option value="15">15 điểm</option>
                                <option value="11">11 điểm</option>
                                <option value="7">7 điểm</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-size: 13px;">Thời gian/trận</label>
                            <input type="number" id="categoryMatchDuration" value="45" min="15" max="180" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 14px;">
                        </div>
                    </div>
                </div>

                <!-- NÚT HÀNH ĐỘNG -->
                <div class="modal-actions" style="margin-top: 24px;">
                    <button type="button" class="btn btn-cancel" onclick="closeAddCategoryModal()">Hủy</button>
                    <button type="submit" class="btn btn-success">➕ Thêm nội dung</button>
                </div>
            </form>
        </div>
    </div>
</div>
