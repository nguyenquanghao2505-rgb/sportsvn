/* =========================================================
   SPORTSVN - BANNER SLIDESHOW CHUNG
   Tự động load banner từ Supabase → chia đôi → 2 banner song song
   Đổi ảnh tự động sau 5 giây
   ========================================================= */

(function() {
    'use strict';

    const BANNER_INTERVAL = 5000; // 5 giây

    let supabaseClient = null;

    // Banner trái
    let leftBannerUrls = [];
    let leftBannerIndex = 0;
    let leftBannerTimer = null;

    // Banner phải
    let rightBannerUrls = [];
    let rightBannerIndex = 0;
    let rightBannerTimer = null;

    // Đợi DOM ready
    document.addEventListener('DOMContentLoaded', async function() {
        const config = window.SPORTSVN_CONFIG || {};
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
            console.warn('⚠️ banner.js: Chưa cấu hình Supabase');
            return;
        }
        if (!window.supabase) {
            console.warn('⚠️ banner.js: Supabase library chưa load');
            return;
        }

        supabaseClient = window.supabase.createClient(
            config.SUPABASE_URL,
            config.SUPABASE_ANON_KEY
        );

        await loadBanners();
    });

    // ==========================================
    // LOAD BANNERS TỪ SUPABASE STORAGE
    // ==========================================
    async function loadBanners() {
        // Kiểm tra HTML có sẵn không
        const bannerSection = document.getElementById('bannerSection');
        if (!bannerSection) {
            console.log('ℹ️ banner.js: Trang này không có banner');
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .storage
                .from('banners')
                .list('', { limit: 100, sortBy: { column: 'name', order: 'desc' } });

            if (error) throw error;

            const imageFiles = (data || []).filter(f =>
                f.name &&
                !f.name.startsWith('.') &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
            );

            if (imageFiles.length === 0) {
                renderEmptyBanners();
                return;
            }

            // Sắp xếp mới nhất trước
            imageFiles.sort((a, b) => {
                const aTime = parseInt((a.name.match(/banner-(\d+)/) || [])[1] || 0);
                const bTime = parseInt((b.name.match(/banner-(\d+)/) || [])[1] || 0);
                return bTime - aTime;
            });

            // Lấy tất cả URLs
            const allUrls = imageFiles.map(f => {
                const { data: urlData } = supabaseClient.storage
                    .from('banners')
                    .getPublicUrl(f.name);
                return urlData.publicUrl;
            });

            // Chia đôi: trái = ảnh lẻ (0,2,4...), phải = ảnh chẵn (1,3,5...)
            leftBannerUrls = allUrls.filter((_, i) => i % 2 === 0);
            rightBannerUrls = allUrls.filter((_, i) => i % 2 === 1);

            // Nếu 1 bên không có ảnh → dùng lại ảnh của bên kia
            if (leftBannerUrls.length === 0) leftBannerUrls = allUrls;
            if (rightBannerUrls.length === 0) rightBannerUrls = allUrls;

            console.log('✅ banner.js: Trái =', leftBannerUrls.length, '| Phải =', rightBannerUrls.length);

            renderBannerHalf('left');
            renderBannerHalf('right');

        } catch (err) {
            console.error('❌ banner.js lỗi:', err);
            renderEmptyBanners();
        }
    }

    // ==========================================
    // RENDER 1 BANNER (TRÁI HOẶC PHẢI)
    // ==========================================
    function renderBannerHalf(side) {
        const slidesEl = document.getElementById(side === 'left' ? 'bannerLeftSlides' : 'bannerRightSlides');
        const dotsEl = document.getElementById(side === 'left' ? 'bannerLeftDots' : 'bannerRightDots');
        const urls = side === 'left' ? leftBannerUrls : rightBannerUrls;

        if (!slidesEl || !dotsEl) {
            console.warn('⚠️ banner.js: Không tìm thấy container cho banner', side);
            return;
        }

        if (urls.length === 0) {
            slidesEl.innerHTML = `
                <div class="banner-half-slide active">
                    <div class="banner-half-slide-fallback">🏆 SPORTSVN</div>
                </div>
            `;
            dotsEl.innerHTML = '';
            return;
        }

        // Render slides
        slidesEl.innerHTML = urls.map((url, idx) => `
            <div class="banner-half-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                <img src="${url}?t=${Date.now()}" 
                     alt="Banner ${side} ${idx + 1}" 
                     ${idx === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}>
            </div>
        `).join('');

        // Render dots
        dotsEl.innerHTML = urls.map((_, idx) => `
            <button class="banner-half-dot ${idx === 0 ? 'active' : ''}" 
                    onclick="goToBanner('${side}', ${idx})" 
                    aria-label="Banner ${idx + 1}"></button>
        `).join('');

        // Thêm nút prev/next
        const halfEl = document.getElementById(side === 'left' ? 'bannerLeft' : 'bannerRight');
        if (halfEl && !halfEl.querySelector('.banner-nav-btn')) {
            halfEl.insertAdjacentHTML('beforeend', `
                <button class="banner-nav-btn prev" onclick="prevBanner('${side}')" aria-label="Ảnh trước">‹</button>
                <button class="banner-nav-btn next" onclick="nextBanner('${side}')" aria-label="Ảnh sau">›</button>
            `);
        }

        // Auto slide
        if (urls.length > 1) {
            startAutoSlide(side);
        }

        // Pause khi hover
        halfEl?.addEventListener('mouseenter', () => stopAutoSlide(side));
        halfEl?.addEventListener('mouseleave', () => {
            if (urls.length > 1) startAutoSlide(side);
        });

        // Swipe mobile
        let touchStartX = 0;
        halfEl?.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        halfEl?.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) prevBanner(side);
                else nextBanner(side);
            }
        }, { passive: true });
    }

    // ==========================================
    // ĐIỀU HƯỚNG
    // ==========================================
    window.goToBanner = function(side, index) {
        const containerId = side === 'left' ? 'bannerLeft' : 'bannerRight';
        const currentIndex = side === 'left' ? leftBannerIndex : rightBannerIndex;
        const slides = document.querySelectorAll(`#${containerId} .banner-half-slide`);
        const dots = document.querySelectorAll(`#${containerId} .banner-half-dot`);

        // Slide cũ → exit-left
        slides.forEach((s, i) => {
            s.classList.remove('active', 'exit-left');
            if (i === currentIndex) s.classList.add('exit-left');
        });

        // Slide mới → active (sau 50ms)
        setTimeout(() => {
            slides.forEach((s, i) => {
                s.classList.remove('exit-left');
                if (i === index) s.classList.add('active');
            });
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }, 50);

        if (side === 'left') leftBannerIndex = index;
        else rightBannerIndex = index;
    };

    window.nextBanner = function(side) {
        const urls = side === 'left' ? leftBannerUrls : rightBannerUrls;
        const currentIndex = side === 'left' ? leftBannerIndex : rightBannerIndex;
        goToBanner(side, (currentIndex + 1) % urls.length);
        if (urls.length > 1) {
            stopAutoSlide(side);
            startAutoSlide(side);
        }
    };

    window.prevBanner = function(side) {
        const urls = side === 'left' ? leftBannerUrls : rightBannerUrls;
        const currentIndex = side === 'left' ? leftBannerIndex : rightBannerIndex;
        goToBanner(side, (currentIndex - 1 + urls.length) % urls.length);
        if (urls.length > 1) {
            stopAutoSlide(side);
            startAutoSlide(side);
        }
    };

    // ==========================================
    // AUTO SLIDE
    // ==========================================
    function startAutoSlide(side) {
        stopAutoSlide(side);
        const urls = side === 'left' ? leftBannerUrls : rightBannerUrls;
        if (urls.length < 2) return;

        const timer = setInterval(() => {
            const currentIndex = side === 'left' ? leftBannerIndex : rightBannerIndex;
            goToBanner(side, (currentIndex + 1) % urls.length);
        }, BANNER_INTERVAL);

        if (side === 'left') leftBannerTimer = timer;
        else rightBannerTimer = timer;
    }

    function stopAutoSlide(side) {
        if (side === 'left' && leftBannerTimer) {
            clearInterval(leftBannerTimer);
            leftBannerTimer = null;
        } else if (side === 'right' && rightBannerTimer) {
            clearInterval(rightBannerTimer);
            rightBannerTimer = null;
        }
    }

    // ==========================================
    // FALLBACK
    // ==========================================
    function renderEmptyBanners() {
        ['Left', 'Right'].forEach(side => {
            const slidesEl = document.getElementById(`banner${side}Slides`);
            const dotsEl = document.getElementById(`banner${side}Dots`);
            if (slidesEl) {
                slidesEl.innerHTML = `
                    <div class="banner-half-slide active">
                        <div class="banner-half-slide-fallback">🏆 SPORTSVN</div>
                    </div>
                `;
            }
            if (dotsEl) dotsEl.innerHTML = '';
        });
    }

    console.log('✅ banner.js đã sẵn sàng');
})();
