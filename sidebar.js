// =========================================================
// SPORTSVN - SIDEBAR CHUNG CHO TẤT CẢ CÁC TRANG
// Tự động render sidebar dựa trên activePage
// =========================================================

(function() {
    'use strict';

    // Hàm render sidebar
    window.renderSidebar = function(activePage) {
        // Xác định trang hiện tại
        const currentPage = activePage || window.location.pathname.split('/').pop() || 'index.html';
        
        // Helper: kiểm tra active
        function isActive(page) {
            if (page === currentPage) return 'active';
            // Xử lý các trang con
            if (page === 'tournaments.html' && currentPage.startsWith('tournament')) return 'active';
            if (page === 'news-list.html' && (currentPage === 'news-list.html' || currentPage === 'news-detail.html')) return 'active';
            if (page === 'videos.html' && currentPage.startsWith('video')) return 'active';
            if (page === 'shop.html' && currentPage.startsWith('shop')) return 'active';
            return '';
        }

        const sidebarHTML = `
        <aside class="sidebar">

            <div class="brand">
                <div class="brand-mark">S</div>
                <div class="brand-text">
                    <strong>SportsVN</strong>
                    <span>Nền tảng thể thao</span>
                </div>
            </div>

            <nav class="main-nav">

                <!-- NHÓM 1: CHÍNH -->
                <div class="nav-title">📌 CHÍNH</div>

                <a href="index.html" class="nav-item ${isActive('index.html')}">
                    <span class="nav-icon">🏠</span>
                    <span>Trang chủ</span>
                </a>

                <a href="tournaments.html" class="nav-item ${isActive('tournaments.html')}">
                    <span class="nav-icon">🏆</span>
                    <span>Giải đấu</span>
                </a>

                <a href="news-list.html" class="nav-item ${isActive('news-list.html')}">
                    <span class="nav-icon">📰</span>
                    <span>Tin thể thao</span>
                </a>

                <a href="videos.html" class="nav-item ${isActive('videos.html')}">
                    <span class="nav-icon">🎬</span>
                    <span>Video</span>
                </a>

                <a href="photos.html" class="nav-item ${isActive('photos.html')}">
                    <span class="nav-icon">📸</span>
                    <span>Hình ảnh</span>
                </a>

                <!-- NHÓM 2: QUẢN LÝ GIẢI -->
                <div class="nav-title">🎯 QUẢN LÝ GIẢI</div>

                <a href="tournaments.html" class="nav-item" data-action="create-tournament">
                    <span class="nav-icon">➕</span>
                    <span>Tạo giải đấu</span>
                </a>

                <a href="registrations.html" class="nav-item ${isActive('registrations.html')}">
                    <span class="nav-icon">☷</span>
                    <span>Danh sách đăng ký</span>
                </a>

                <a href="draw.html" class="nav-item ${isActive('draw.html')}">
                    <span class="nav-icon">◇</span>
                    <span>Bốc thăm</span>
                </a>

                <a href="schedule.html" class="nav-item ${isActive('schedule.html')}">
                    <span class="nav-icon">📅</span>
                    <span>Xếp lịch thi đấu</span>
                </a>

                <a href="results.html" class="nav-item ${isActive('results.html')}">
                    <span class="nav-icon">✓</span>
                    <span>Kết quả</span>
                </a>

                <a href="booking.html" class="nav-item ${isActive('booking.html')}">
                    <span class="nav-icon">🏟️</span>
                    <span>Đặt sân</span>
                </a>

                <!-- NHÓM 3: DỊCH VỤ -->
                <div class="nav-title">🛒 DỊCH VỤ</div>

                <a href="shop.html" class="nav-item ${isActive('shop.html')}">
                    <span class="nav-icon">🛍️</span>
                    <span>Mua sắm</span>
                </a>

                <a href="payment.html" class="nav-item ${isActive('payment.html')}">
                    <span class="nav-icon">💳</span>
                    <span>Thanh toán</span>
                </a>

                <a href="lucky-wheel.html" class="nav-item ${isActive('lucky-wheel.html')}">
                    <span class="nav-icon">🎰</span>
                    <span>Vòng quay may mắn</span>
                </a>

                <a href="ads.html" class="nav-item ${isActive('ads.html')}">
                    <span class="nav-icon">📢</span>
                    <span>Quảng cáo</span>
                </a>

                <a href="register-shop.html" class="nav-item ${isActive('register-shop.html')}">
                    <span class="nav-icon">🏪</span>
                    <span>Đăng ký Shop</span>
                </a>

                <!-- NHÓM 4: HỖ TRỢ -->
                <div class="nav-title">📚 HỖ TRỢ</div>

                <a href="guide.html" class="nav-item ${isActive('guide.html')}">
                    <span class="nav-icon">📖</span>
                    <span>Hướng dẫn tổ chức giải</span>
                </a>

                <a href="sponsors.html" class="nav-item ${isActive('sponsors.html')}">
                    <span class="nav-icon">🤝</span>
                    <span>Nhà tài trợ</span>
                </a>

                <a href="contact.html" class="nav-item ${isActive('contact.html')}">
                    <span class="nav-icon">📞</span>
                    <span>Liên hệ</span>
                </a>

                <a href="ranking.html" class="nav-item ${isActive('ranking.html')}">
                    <span class="nav-icon">📊</span>
                    <span>Bảng thành tích</span>
                </a>

            </nav>

            <div class="sidebar-bottom">

                <div class="help-box">
                    <div class="help-icon">?</div>
                    <div>
                        <strong>Cần hỗ trợ?</strong>
                        <span>Liên hệ SportsVN</span>
                    </div>
                </div>

                <div class="user-mini">
                    <div class="avatar" id="sidebarAvatar">H</div>
                    <div class="user-info">
                        <strong id="sidebarUserName">Quản trị viên</strong>
                        <span>SportsVN</span>
                    </div>
                    <button class="more-button">⋮</button>
                </div>

            </div>

        </aside>
        `;

        // Tìm vị trí render sidebar
        const app = document.querySelector('.app');
        if (!app) {
            console.warn('Không tìm thấy .app');
            return;
        }

        // Kiểm tra sidebar cũ tồn tại
        const oldSidebar = app.querySelector('.sidebar');
        if (oldSidebar) {
            // Thay thế
            oldSidebar.outerHTML = sidebarHTML;
        } else {
            // Chèn vào đầu
            app.insertAdjacentHTML('afterbegin', sidebarHTML);
        }

        console.log('✅ Sidebar đã render - Active: ' + currentPage);
    };

    // Tự động render khi DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        // Lấy activePage từ attribute data-page của body (nếu có)
        const activePage = document.body.getAttribute('data-page');
        window.renderSidebar(activePage);
    });

    console.log('✅ Sidebar.js đã sẵn sàng');
})();
