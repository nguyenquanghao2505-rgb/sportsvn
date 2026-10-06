// ============================================================
// banner-slider.js — Khớp với CSS mẫu của bạn
// Hỗ trợ: slider auto, nút prev/next, dots, modal upload ảnh
// ============================================================

(function () {
  'use strict';

  // ─── CẤU HÌNH ───
  const CONFIG = {
    AUTO_DELAY: 5000,        // 5 giây chuyển ảnh
    STORAGE_KEY: 'sportsvn_banners',
    BUCKET_NAME: 'banners',  // Supabase Storage bucket
  };

  // ─── STATE ───
  let banners = [];           // Danh sách ảnh
  let currentIndex = 0;
  let autoTimer = null;
  let isAdmin = false;

  // ─── KHỞI TẠO ───
  window.initBanner = async function () {
    // 1. Kiểm tra user có phải admin không
    isAdmin = checkIsAdmin();

    // 2. Load danh sách ảnh
    await loadBanners();

    // 3. Render banner
    renderBanner();

    // 4. Bắt đầu auto slide
    startAutoSlide();

    console.log('✅ Banner đã khởi tạo với', banners.length, 'ảnh');
  };

  // ─── KIỂM TRA ADMIN ───
  function checkIsAdmin() {
    try {
      const session = JSON.parse(localStorage.getItem('demo_session_v2') || 'null');
      if (session && session.global_role === 'admin') return true;

      // Fallback: kiểm tra localStorage khác
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user && (user.role === 'admin' || user.global_role === 'admin')) return true;

      return false;
    } catch {
      return false;
    }
  }

  // ─── LOAD BANNERS ───
  async function loadBanners() {
    banners = [];

    // 1. Ưu tiên load từ Supabase (tournaments có banner_url)
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('tournaments')
          .select('id, name, banner_url, start_date, location')
          .not('banner_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8);

        if (!error && data && data.length > 0) {
          data.forEach((t) => {
            banners.push({
              url: t.banner_url,
              title: t.name,
              subtitle: [t.start_date, t.location].filter(Boolean).join(' · '),
              tournamentId: t.id,
            });
          });
        }
      } catch (err) {
        console.warn('Không load được tournaments:', err);
      }
    }

    // 2. Load ảnh custom từ localStorage
    try {
      const localBanners = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      localBanners.forEach((b) => banners.push(b));
    } catch {}

    // 3. Nếu không có gì → dùng ảnh mặc định
    if (banners.length === 0) {
      banners = [
        {
          url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600',
          title: 'SportsVN',
          subtitle: 'Nền tảng quản lý thể thao',
        },
        {
          url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600',
          title: 'Kết nối đam mê',
          subtitle: 'Từ giải đấu nhỏ đến chuyên nghiệp',
        },
      ];
    }
  }

  // ─── RENDER BANNER ───
  function renderBanner() {
    const container = document.getElementById('banner-container');
    if (!container) {
      console.warn('Không tìm thấy #banner-container');
      return;
    }

    const slidesHtml = banners.map((b, i) => `
      <div class="banner-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${esc(b.url)}" alt="${esc(b.title || '')}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="banner-slide-fallback" style="display:none;">
          ${esc(b.title || 'SportsVN')}
        </div>
      </div>
    `).join('');

    const dotsHtml = banners.map((_, i) => `
      <button class="banner-dot ${i === 0 ? 'active' : ''}"
              data-index="${i}" aria-label="Slide ${i + 1}"></button>
    `).join('');

    const editBtnHtml = isAdmin ? `
      <button class="banner-edit-btn" onclick="openBannerModal()">
        ✏️ Chỉnh sửa
      </button>
    ` : '';

    const navHtml = banners.length > 1 ? `
      <button class="banner-nav-btn prev" onclick="bannerPrev()">‹</button>
      <button class="banner-nav-btn next" onclick="bannerNext()">›</button>
      <div class="banner-dots">${dotsHtml}</div>
    ` : '';

    container.innerHTML = `
      <div class="banner-section">
        <div class="banner-slides">${slidesHtml}</div>
        ${navHtml}
        ${editBtnHtml}
      </div>
    `;

    // Bind dots
    container.querySelectorAll('.banner-dot').forEach((dot) => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });

    // Bind click slide có tournamentId
    container.querySelectorAll('.banner-slide').forEach((el) => {
      const idx = parseInt(el.dataset.index);
      const b = banners[idx];
      if (b && b.tournamentId) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          if (e.target.closest('.banner-edit-btn')) return;
          window.location.href = `tournament-detail.html?id=${b.tournamentId}`;
        });
      }
    });

    // Pause on hover
    const section = container.querySelector('.banner-section');
    section.addEventListener('mouseenter', stopAutoSlide);
    section.addEventListener('mouseleave', startAutoSlide);

    // Touch swipe
    bindTouchSwipe(section);
  }

  // ─── CHUYỂN SLIDE ───
  window.bannerNext = function () {
    goToSlide((currentIndex + 1) % banners.length);
  };

  window.bannerPrev = function () {
    goToSlide((currentIndex - 1 + banners.length) % banners.length);
  };

  function goToSlide(index) {
    if (index < 0 || index >= banners.length || index === currentIndex) return;

    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');

    slides.forEach((el, i) => {
      el.classList.remove('active', 'exit-left');
      if (i === index) {
        el.classList.add('active');
      } else if (i === currentIndex) {
        el.classList.add('exit-left');
      }
    });

    dots.forEach((el, i) => el.classList.toggle('active', i === index));
    currentIndex = index;

    // Reset timer
    stopAutoSlide();
    startAutoSlide();
  }

  // ─── AUTO SLIDE ───
  function startAutoSlide() {
    if (banners.length <= 1) return;
    stopAutoSlide();
    autoTimer = setInterval(() => {
      const next = (currentIndex + 1) % banners.length;
      goToSlide(next);
    }, CONFIG.AUTO_DELAY);
  }

  function stopAutoSlide() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // ─── TOUCH SWIPE ───
  function bindTouchSwipe(el) {
    let startX = 0, startY = 0, dragging = false;

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) window.bannerNext();
      else window.bannerPrev();
    }, { passive: true });
  }

  // ─── MODAL QUẢN LÝ ẢNH ───
  window.openBannerModal = function () {
    const modalHtml = `
      <div class="banner-modal-overlay" id="banner-modal" onclick="if(event.target===this)closeBannerModal()">
        <div class="banner-modal">
          <div class="banner-modal-header">
            <h3>🖼️ Quản lý ảnh bìa</h3>
            <button class="banner-modal-close" onclick="closeBannerModal()">✕</button>
          </div>
          <div class="banner-modal-body">
            <!-- Upload area -->
            <div class="banner-upload-area" id="banner-upload-area"
                 onclick="document.getElementById('banner-file-input').click()">
              <div class="banner-upload-inner">
                <span class="banner-upload-icon">📤</span>
                <p><strong>Kéo thả ảnh vào đây</strong> hoặc click để chọn</p>
                <small>Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)</small>
              </div>
            </div>
            <input type="file" id="banner-file-input"
                   accept="image/*" style="display:none"
                   onchange="handleBannerFile(event)">

            <!-- URL input -->
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:6px;">
                Hoặc nhập URL ảnh:
              </label>
              <div style="display:flex;gap:8px;">
                <input type="url" id="banner-url-input"
                       placeholder="https://example.com/image.jpg"
                       style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;">
                <button onclick="addBannerFromUrl()"
                        style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">
                  Thêm
                </button>
              </div>
            </div>

            <!-- Danh sách ảnh -->
            <h4 style="margin:16px 0 8px;font-size:0.95rem;">Danh sách ảnh (${banners.length})</h4>
            <div class="banner-list" id="banner-list">
              ${renderBannerList()}
            </div>
          </div>
          <div class="banner-modal-footer">
            <button class="banner-btn-close" onclick="closeBannerModal()">Đóng</button>
          </div>
        </div>
      </div>
    `;

    // Xóa modal cũ nếu có
    const old = document.getElementById('banner-modal');
    if (old) old.remove();

    // Chèn modal mới
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind drag-drop upload
    bindDragDrop();
  };

  window.closeBannerModal = function () {
    const modal = document.getElementById('banner-modal');
    if (modal) modal.remove();
  };

  function renderBannerList() {
    if (banners.length === 0) {
      return '<div class="banner-list-empty">Chưa có ảnh nào</div>';
    }

    return banners.map((b, i) => `
      <div class="banner-list-item">
        <img src="${esc(b.url)}" alt="${esc(b.title || '')}">
        <div class="banner-list-info">
          <div class="banner-list-name">${esc(b.title || 'Ảnh ' + (i + 1))}</div>
          <div class="banner-list-index">Vị trí: ${i + 1}</div>
        </div>
        <button class="banner-list-delete" onclick="deleteBanner(${i})" title="Xóa">🗑️</button>
      </div>
    `).join('');
  }

  // ─── UPLOAD FILE ───
  window.handleBannerFile = async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    await uploadBanner(file);
    event.target.value = ''; // reset
  };

  async function uploadBanner(file) {
    // Validate
    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh quá lớn (tối đa 5MB)');
      return;
    }

    try {
      let url = null;

      // Nếu có Supabase → upload lên Storage
      if (window.supabaseClient) {
        const fileName = `banner_${Date.now()}_${file.name}`;
        const { data, error } = await window.supabaseClient.storage
          .from(CONFIG.BUCKET_NAME)
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data: urlData } = window.supabaseClient.storage
          .from(CONFIG.BUCKET_NAME)
          .getPublicUrl(fileName);

        url = urlData.publicUrl;
      } else {
        // Fallback: dùng base64
        url = await fileToBase64(file);
      }

      // Thêm vào danh sách
      banners.push({
        url,
        title: file.name.replace(/\.[^.]+$/, ''),
        uploadedAt: Date.now(),
      });

      saveBanners();
      refreshModal();
      renderBanner();
      alert('✅ Đã thêm ảnh!');
    } catch (err) {
      console.error(err);
      alert('Lỗi upload: ' + err.message);
    }
  }

  window.addBannerFromUrl = function () {
    const input = document.getElementById('banner-url-input');
    const url = input.value.trim();
    if (!url) {
      alert('Vui lòng nhập URL');
      return;
    }

    banners.push({
      url,
      title: 'Ảnh từ URL',
      addedAt: Date.now(),
    });

    saveBanners();
    refreshModal();
    renderBanner();
    input.value = '';
    alert('✅ Đã thêm ảnh từ URL!');
  };

  window.deleteBanner = function (index) {
    if (!confirm('Xóa ảnh này?')) return;
    banners.splice(index, 1);
    saveBanners();
    refreshModal();
    renderBanner();
  };

  // ─── SAVE / LOAD LOCAL ───
  function saveBanners() {
    try {
      // Chỉ lưu các banner do user thêm (không phải từ tournament)
      const customBanners = banners.filter((b) => !b.tournamentId);
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(customBanners));
    } catch (err) {
      console.error('Không save được:', err);
    }
  }

  function refreshModal() {
    const list = document.getElementById('banner-list');
    if (list) list.innerHTML = renderBannerList();
  }

  // ─── BIND DRAG & DROP ───
  function bindDragDrop() {
    const area = document.getElementById('banner-upload-area');
    if (!area) return;

    ['dragenter', 'dragover'].forEach((evt) => {
      area.addEventListener(evt, (e) => {
        e.preventDefault();
        area.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((evt) => {
      area.addEventListener(evt, (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
      });
    });

    area.addEventListener('drop', async (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        await uploadBanner(file);
      }
    });
  }

  // ─── HELPERS ───
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ─── AUTO INIT ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.initBanner());
  } else {
    window.initBanner();
  }
})();
