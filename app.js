/*
============================================================
SPORTSVN - APP.JS
Trang chủ + điều hướng + đăng nhập + đăng ký + tài khoản
Bản an toàn: không làm trang trắng nếu Supabase/config chưa sẵn sàng.
============================================================
*/

(function () {
  'use strict';

  // ----------------------------------------------------------
  // 1. CẤU HÌNH
  // ----------------------------------------------------------
  const CONFIG = window.SPORTSVN_CONFIG || {};

  const SUPABASE_URL = String(CONFIG.SUPABASE_URL || '').trim();
  const SUPABASE_ANON_KEY = String(CONFIG.SUPABASE_ANON_KEY || '').trim();

  const supabaseReady = Boolean(
    window.supabase &&
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('URL_SUPABASE')
  );

  let supabaseClient = null;
  let currentUser = null;
  let tournamentUtils = null;

  if (supabaseReady) {
    try {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    } catch (error) {
      console.error('SportsVN: Không khởi tạo được Supabase.', error);
      supabaseClient = null;
    }
  }

  // ----------------------------------------------------------
  // 2. DỮ LIỆU MẪU - TRANG CHỦ
  // ----------------------------------------------------------
  const SPORTS = [
    ['⚽', 'Bóng đá', 'Tin tức & giải đấu'],
    ['🏀', 'Bóng rổ', 'Lịch thi đấu & kết quả'],
    ['🏐', 'Bóng chuyền', 'Giải đấu trong nước'],
    ['🏸', 'Cầu lông', 'Vận động viên & giải'],
    ['🎾', 'Tennis', 'Kết quả & bảng xếp hạng'],
    ['🏓', 'Pickleball', 'Giải đấu mới nhất'],
    ['🥋', 'Taekwondo', 'Võ thuật & thi đấu'],
    ['♟️', 'Cờ tướng', 'Giải trẻ & vô địch'],
    ['🏊', 'Bơi', 'Thành tích & giải đấu'],
    ['🚣', 'Đua thuyền', 'Sự kiện thể thao'],
  ];

  const NEWS = [
    {
      sport: 'Bóng rổ',
      title: 'Những giải đấu thể thao đang được quan tâm',
      time: '10 phút trước',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'
    },
    {
      sport: 'Thể thao',
      title: 'Những khoảnh khắc ấn tượng trên sân đấu',
      time: '25 phút trước',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80'
    },
    {
      sport: 'Thể thao quốc tế',
      title: 'Cập nhật những tin tức thể thao quốc tế',
      time: '1 giờ trước',
      image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80'
    },
    {
      sport: 'Cầu lông',
      title: 'Các vận động viên chuẩn bị cho ngày thi đấu mới',
      time: '2 giờ trước',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80'
    },
    {
      sport: 'Bóng chuyền',
      title: 'Những diễn biến đáng chú ý tại các giải đấu',
      time: '3 giờ trước',
      image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80'
    },
    {
      sport: 'Pickleball',
      title: 'Pickleball tiếp tục phát triển mạnh tại Việt Nam',
      time: 'Hôm nay',
      image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be0?auto=format&fit=crop&w=900&q=80'
    }
  ];

  const TOURNAMENTS = [
    {
      sport: '🏀',
      title: 'Đại hội Thể dục thể thao thành phố Đà Nẵng lần thứ X',
      date: 'Năm 2026',
      location: 'Đà Nẵng'
    },
    {
      sport: '🏸',
      title: 'Giải Cầu lông thể thao thành phố',
      date: 'Đang cập nhật',
      location: 'Đà Nẵng'
    },
    {
      sport: '🏓',
      title: 'Giải Pickleball mở rộng',
      date: 'Đang cập nhật',
      location: 'Đà Nẵng'
    },
    {
      sport: '🚣',
      title: 'Giải Đua thuyền truyền thống thành phố Đà Nẵng mở rộng',
      date: 'Năm 2026',
      location: 'Sông Hàn'
    },
    {
      sport: '🥋',
      title: 'Giải Taekwondo Đại hội TDTT thành phố',
      date: 'Năm 2026',
      location: 'Đà Nẵng'
    },
    {
      sport: '🏊',
      title: 'Giải Bơi thành phố Đà Nẵng',
      date: 'Năm 2026',
      location: 'Đà Nẵng'
    }
  ];

  // ----------------------------------------------------------
  // 3. TIỆN ÍCH
  // ----------------------------------------------------------
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getName(user) {
    if (!user) return '';
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Tài khoản'
    );
  }

  function getInitials(name) {
    const parts = String(name || 'SV').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'SV';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function setMessage(id, message, type = '') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message || '';
    el.className = 'form-message' + (type ? ' ' + type : '');
  }

  function friendlyAuthError(error) {
    const message = String(error?.message || error || 'Có lỗi xảy ra.');
    const lower = message.toLowerCase();

    if (lower.includes('invalid login credentials')) return 'Email hoặc mật khẩu không chính xác.';
    if (lower.includes('email not confirmed')) return 'Email chưa được xác nhận. Hãy kiểm tra hộp thư email.';
    if (lower.includes('user already registered')) return 'Email này đã được đăng ký.';
    if (lower.includes('password should be at least')) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (lower.includes('rate limit')) return 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.';
    return message;
  }

  function image(url, alt = '') {
    return `<img src="${escapeHTML(url)}" alt="${escapeHTML(alt)}" loading="lazy" onerror="this.style.display='none'">`;
  }

  // ----------------------------------------------------------
  // 4. HEADER
  // ----------------------------------------------------------
  function renderHeader(active = 'home') {
    const name = getName(currentUser);
    const loggedIn = Boolean(currentUser);

    return `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="#home" data-route="home" aria-label="SportsVN">
            <span class="brand-mark">SV</span>
            <span>
              <strong>SPORTSVN</strong>
              <small>Nền tảng thể thao Việt Nam</small>
            </span>
          </a>

          <button class="mobile-menu" id="mobile-menu" type="button" aria-label="Mở menu">☰</button>

          <nav class="main-nav" id="main-nav">
            <a href="#home" data-route="home" class="${active === 'home' ? 'active' : ''}">Trang chủ</a>
            <a href="#news" data-route="news" class="${active === 'news' ? 'active' : ''}">Tin tức</a>
            <a href="#tournaments" data-route="tournaments" class="${active === 'tournaments' ? 'active' : ''}">Giải đấu</a>
            <a href="#schedule" data-route="schedule" class="${active === 'schedule' ? 'active' : ''}">Lịch thi đấu</a>
            <a href="#results" data-route="results" class="${active === 'results' ? 'active' : ''}">Kết quả</a>
            <a href="#athletes" data-route="athletes" class="${active === 'athletes' ? 'active' : ''}">Vận động viên</a>
            <a href="#standings" data-route="standings" class="${active === 'standings' ? 'active' : ''}">BXH</a>
          </nav>

          <div class="header-actions">
            <button class="icon-btn" id="search-btn" type="button" aria-label="Tìm kiếm">⌕</button>
            ${loggedIn ? `
              <div class="user-menu">
                <button class="user-btn" id="user-btn" type="button">
                  ${escapeHTML(getInitials(name))} · ${escapeHTML(name)} ▾
                </button>
                <div class="user-dropdown" id="user-dropdown">
                  <a href="#account" data-route="account">👤 Tài khoản</a>
                  <a href="#my-tournaments" data-route="my-tournaments">🏆 Giải đấu của tôi</a>
                  <a href="#account" data-route="account">⚙️ Cài đặt</a>
                  <button type="button" id="logout-btn">🚪 Đăng xuất</button>
                </div>
              </div>
            ` : `
              <button class="btn btn-outline" id="header-login" type="button">Đăng nhập</button>
              <button class="btn btn-primary" id="header-register" type="button">Đăng ký</button>
            `}
          </div>
        </div>
      </header>

      <div class="hotbar">
        <div class="container hotbar-inner">
          <b>🔥 ĐANG HOT</b>
          <span>#Bóngđá</span>
          <span>#Pickleball</span>
          <span>#Bóngchuyền</span>
          <span>#Bóngrổ</span>
          <span>#Cầulông</span>
          <span>#Tennis</span>
          <span>#ĐạihộiTDTT</span>
          <span>#ThểthaoViệtNam</span>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------------
  // 5. TRANG CHỦ
  // ----------------------------------------------------------
  function renderHome() {
    return `
      ${renderHero()}

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">SPORTS NEWS</div>
              <h2>Tin tức thể thao</h2>
            </div>
            <a href="#news" data-route="news">Xem tất cả →</a>
          </div>

          <div class="category-tabs">
            <button class="active" type="button">Tất cả</button>
            <button type="button">Bóng đá</button>
            <button type="button">Bóng rổ</button>
            <button type="button">Cầu lông</button>
            <button type="button">Pickleball</button>
            <button type="button">Bóng chuyền</button>
            <button type="button">Thể thao khác</button>
          </div>

          <div class="news-grid">
            ${NEWS.slice(0, 3).map(renderNewsCard).join('')}
          </div>
        </div>
      </section>

      <section class="section section-soft">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">TOURNAMENTS</div>
              <h2>Giải đấu nổi bật</h2>
            </div>
            <a href="#tournaments" data-route="tournaments">Xem tất cả →</a>
          </div>
          <div class="tournament-grid">
            ${TOURNAMENTS.slice(0, 3).map(renderTournamentCard).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">SPORTS</div>
              <h2>Khám phá môn thể thao</h2>
            </div>
          </div>
          <div class="sport-grid">
            ${SPORTS.map(renderSportTile).join('')}
          </div>
        </div>
      </section>

      <section class="section cta-section">
        <div class="container cta-inner">
          <div>
            <div class="eyebrow">SPORTSVN TOURNAMENT</div>
            <h2>Tạo và quản lý giải đấu thể thao của bạn</h2>
            <p>Đăng ký tài khoản để lưu hồ sơ giải đấu, vận động viên, lịch thi đấu, kết quả và sử dụng hệ thống bốc thăm.</p>
          </div>
          <button class="btn btn-light" id="cta-register" type="button">Bắt đầu ngay →</button>
        </div>
      </section>
    `;
  }

  function renderHero() {
    const main = NEWS[5];
    const side = NEWS.slice(0, 3);

    return `
      <section class="container hero">
        <article class="hero-main" style="background-image:url('${escapeHTML(main.image)}')">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <span class="tag">TIN NỔI BẬT</span>
            <h1>Cập nhật những thông tin thể thao mới nhất</h1>
            <p>Tin tức, giải đấu, lịch thi đấu, kết quả và những câu chuyện thể thao đáng chú ý tại Việt Nam.</p>
            <a class="hero-link" href="#news" data-route="news">Xem tin mới nhất →</a>
          </div>
        </article>

        <aside class="hero-side">
          ${side.map(item => `
            <article class="side-news">
              ${image(item.image, item.title)}
              <div>
                <span>${escapeHTML(item.sport)}</span>
                <h3>${escapeHTML(item.title)}</h3>
                <small>${escapeHTML(item.time)}</small>
              </div>
            </article>
          `).join('')}
        </aside>
      </section>
    `;
  }

  function renderNewsCard(item) {
    return `
      <article class="news-card">
        ${image(item.image, item.title)}
        <div class="news-body">
          <span>${escapeHTML(item.sport)}</span>
          <h3>${escapeHTML(item.title)}</h3>
          <small>SportsVN · ${escapeHTML(item.time)}</small>
        </div>
      </article>
    `;
  }

  function renderTournamentCard(item) {
    return `
      <article class="tournament-card">
        <div class="trophy">${item.sport}</div>
        <div>
          <div class="sport-label">GIẢI ĐẤU</div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>📅 ${escapeHTML(item.date)} · 📍 ${escapeHTML(item.location)}</p>
          <button class="text-btn" type="button" data-toast="Tính năng chi tiết giải đấu đang được phát triển.">Xem chi tiết →</button>
        </div>
      </article>
    `;
  }

  function renderSportTile(item) {
    return `
      <button class="sport-tile" type="button" data-sport="${escapeHTML(item[1])}">
        <span>${item[0]}</span>
        <strong>${escapeHTML(item[1])}</strong>
        <small>${escapeHTML(item[2])}</small>
      </button>
    `;
  }

  // ----------------------------------------------------------
  // 6. CÁC TRANG
  // ----------------------------------------------------------
  function renderNewsPage() {
    return `
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><div class="eyebrow">SPORTS NEWS</div><h2>Tin tức thể thao</h2></div>
          </div>
          <div class="category-tabs">
            <button class="active" type="button">Tất cả</button>
            ${SPORTS.slice(0, 7).map(s => `<button type="button">${escapeHTML(s[1])}</button>`).join('')}
          </div>
          <div class="news-grid">
            ${NEWS.map(renderNewsCard).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderTournamentPage() {
    return `
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><div class="eyebrow">SPORTSVN</div><h2>Giải đấu</h2></div>
            ${currentUser ? '<button class="btn btn-primary" id="create-tournament" type="button">+ Tạo giải đấu</button>' : '<button class="btn btn-primary" id="login-for-tournament" type="button">Đăng nhập để tạo giải</button>'}
          </div>
          <div class="tournament-grid">
            ${TOURNAMENTS.map(renderTournamentCard).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderCreateTournamentPage() {
    if (!currentUser) {
      return renderSimplePage('Tạo giải đấu', 'CREATE TOURNAMENT', 'Bạn cần đăng nhập để tạo và quản lý giải đấu.');
    }

    return `
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">SPORTSVN TOURNAMENT</div>
              <h2>Tạo giải đấu mới</h2>
            </div>
            <a class="btn btn-outline" href="#my-tournaments" data-route="my-tournaments">← Quay lại</a>
          </div>

          <div class="news-card" style="padding:30px;max-width:900px;margin:0 auto;">
            <form id="tournament-create-form" novalidate>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div style="grid-column:1/-1;">
                  <label for="tournament-name" style="display:block;font-weight:800;margin-bottom:8px;">Tên giải đấu <span style="color:#d92d20;">*</span></label>
                  <input id="tournament-name" name="name" type="text" required placeholder="Ví dụ: Giải Pickleball Đà Nẵng mở rộng 2026" style="width:100%;padding:13px 14px;border:1px solid #d0d5dd;border-radius:10px;font:inherit;box-sizing:border-box;">
                </div>

                <div>
                  <label for="tournament-sport" style="display:block;font-weight:800;margin-bottom:8px;">Môn thể thao <span style="color:#d92d20;">*</span></label>
                  <select id="tournament-sport" name="sport" required style="width:100%;padding:13px 14px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;font:inherit;box-sizing:border-box;">
                    <option value="">-- Chọn môn --</option>
                    ${SPORTS.map(s => `<option value="${escapeHTML(s[1])}">${escapeHTML(s[1])}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label for="tournament-location" style="display:block;font-weight:800;margin-bottom:8px;">Địa điểm <span style="color:#d92d20;">*</span></label>
                  <input id="tournament-location" name="location" type="text" required placeholder="Ví dụ: Đà Nẵng" style="width:100%;padding:13px 14px;border:1px solid #d0d5dd;border-radius:10px;font:inherit;box-sizing:border-box;">
                </div>

                <div>
                  <label for="tournament-start" style="display:block;font-weight:800;margin-bottom:8px;">Ngày bắt đầu <span style="color:#d92d20;">*</span></label>
                  <input id="tournament-start" name="start_date" type="date" required style="width:100%;padding:13px 14px;border:1px solid #d0d5dd;border-radius:10px;font:inherit;box-sizing:border-box;">
                </div>

                <div>
                  <label for="tournament-end" style="display:block;font-weight:800;margin-bottom:8px;">Ngày kết thúc</label>
                  <input id="tournament-end" name="end_date" type="date" style="width:100%;padding:13px 14px;border:1px solid #d0d5dd;border-radius:10px;font:inherit;box-sizing:border-box;">
                </div>

                <div>
                  <label for="tournament-status" style="display:block;font-weight:800;margin-bottom:8px;">Trạng thái</label>
                  <select id="tournament-status" name="status" style="width:100%;padding:13px 14px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;font:inherit;box-sizing:border-box;">
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="active">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                    <option value="draft" selected>Bản nháp</option>
                  </select>
                </div>

                <div style="grid-column:1/-1;">
                  <label for="tournament-description" style="display:block;font-weight:800;margin-bottom:8px;">Mô tả giải đấu</label>
                  <textarea id="tournament-description" name="description" rows="5" placeholder="Thông tin giới thiệu, đối tượng tham dự, nội dung thi đấu..." style="width:100%;padding:13px 14px;border:1px solid #d0d5dd;border-radius:10px;font:inherit;resize:vertical;box-sizing:border-box;"></textarea>
                </div>
              </div>

              <div id="tournament-form-message" class="form-message" style="margin-top:18px;"></div>

              <div style="display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;margin-top:22px;">
                <a class="btn btn-outline" href="#my-tournaments" data-route="my-tournaments">Hủy</a>
                <button class="btn btn-primary" id="save-tournament" type="submit">Lưu giải đấu</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  function getTournamentFormData(form) {
    const data = new FormData(form);
    return {
      name: String(data.get('name') || '').trim(),
      sport: String(data.get('sport') || '').trim(),
      start_date: String(data.get('start_date') || '').trim(),
      end_date: String(data.get('end_date') || '').trim(),
      location: String(data.get('location') || '').trim(),
      status: String(data.get('status') || 'draft').trim(),
      description: String(data.get('description') || '').trim()
    };
  }

  async function handleCreateTournament(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = getTournamentFormData(form);
    const validation = tournamentUtils?.validateTournamentForm
      ? tournamentUtils.validateTournamentForm(formData)
      : { ok: Boolean(formData.name && formData.sport && formData.start_date && formData.location), message: 'Vui lòng nhập đầy đủ các trường bắt buộc.' };

    if (!validation.ok) {
      setMessage('tournament-form-message', validation.message, 'error');
      return;
    }

    if (!supabaseClient || !currentUser) {
      setMessage('tournament-form-message', 'Phiên đăng nhập hoặc kết nối Supabase không sẵn sàng. Vui lòng đăng nhập lại.', 'error');
      return;
    }

    const button = $('#save-tournament');
    if (button) {
      button.disabled = true;
      button.textContent = 'ĐANG LƯU...';
    }

    try {
      const payload = {
        name: formData.name,
        sport: formData.sport,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        location: formData.location,
        status: formData.status,
        description: formData.description || null,
        organizer_id: currentUser.id
      };

      const { error } = await supabaseClient
        .from('tournaments')
        .insert(payload);

      if (error) throw error;

      showToast('Tạo giải đấu thành công!');
      routeTo('my-tournaments');
    } catch (error) {
      console.error('SportsVN create tournament error:', error);
      setMessage(
        'tournament-form-message',
        'Không thể lưu giải đấu. ' + String(error?.message || 'Vui lòng kiểm tra cấu trúc bảng tournaments và quyền RLS.'),
        'error'
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Lưu giải đấu';
      }
    }
  }

  function renderSimplePage(title, eyebrow, text) {
    return `
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><div class="eyebrow">${escapeHTML(eyebrow)}</div><h2>${escapeHTML(title)}</h2></div>
          </div>
          <div class="news-card" style="padding:28px;">
            <h3>${escapeHTML(title)}</h3>
            <p style="color:#667085;line-height:1.7;margin-bottom:20px;">${escapeHTML(text)}</p>
            <button class="btn btn-primary" type="button" data-toast="Dữ liệu đang được xây dựng trên SportsVN.">Cập nhật hệ thống</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderAccountPage() {
    if (!currentUser) {
      return renderSimplePage('Tài khoản', 'ACCOUNT', 'Vui lòng đăng nhập để xem thông tin tài khoản.');
    }

    const name = getName(currentUser);
    const email = currentUser.email || '';
    const created = currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('vi-VN') : '—';

    return `
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><div class="eyebrow">MY ACCOUNT</div><h2>Tài khoản SportsVN</h2></div>
          </div>
          <div class="news-card" style="padding:28px;max-width:760px;">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
              <div class="brand-mark" style="width:60px;height:60px;font-size:22px;">${escapeHTML(getInitials(name))}</div>
              <div>
                <h3 style="margin:0 0 5px;font-size:21px;">${escapeHTML(name)}</h3>
                <p style="margin:0;color:#667085;">${escapeHTML(email)}</p>
              </div>
            </div>
            <p><strong>Ngày tạo tài khoản:</strong> ${escapeHTML(created)}</p>
            <p><strong>Trạng thái:</strong> <span style="color:#067647;font-weight:800;">Đang hoạt động</span></p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px;">
              <button class="btn btn-primary" id="account-logout" type="button">Đăng xuất</button>
              <a class="btn btn-outline" href="#my-tournaments" data-route="my-tournaments">Giải đấu của tôi</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderMyTournamentsPage() {
    if (!currentUser) {
      return renderSimplePage('Giải đấu của tôi', 'MY TOURNAMENTS', 'Bạn cần đăng nhập để quản lý giải đấu của mình.');
    }

    return `
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><div class="eyebrow">MY TOURNAMENTS</div><h2>Giải đấu của tôi</h2></div>
            <button class="btn btn-primary" id="create-tournament" type="button">+ Tạo giải đấu</button>
          </div>
          <div class="tournament-grid">
            <article class="tournament-card" style="grid-column:1/-1;">
              <div class="trophy">🏆</div>
              <div>
                <h3>Chưa có giải đấu</h3>
                <p>Hãy tạo giải đấu đầu tiên. Sau này khu vực này sẽ lưu hồ sơ giải, vận động viên, bốc thăm, lịch đấu và kết quả của bạn.</p>
                <button class="btn btn-primary" id="create-tournament-2" type="button">Tạo giải đấu đầu tiên</button>
              </div>
            </article>
          </div>
        </div>
      </section>
    `;
  }

  // ----------------------------------------------------------
  // 7. FOOTER
  // ----------------------------------------------------------
  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <div class="footer-brand">SPORTSVN</div>
            <p>Nền tảng thể thao Việt Nam kết nối tin tức, giải đấu, vận động viên, lịch thi đấu, kết quả và bảng xếp hạng.</p>
          </div>
          <div>
            <h4>SportsVN</h4>
            <a href="#news" data-route="news">Tin tức</a>
            <a href="#tournaments" data-route="tournaments">Giải đấu</a>
            <a href="#schedule" data-route="schedule">Lịch thi đấu</a>
          </div>
          <div>
            <h4>Thể thao</h4>
            <a href="#athletes" data-route="athletes">Vận động viên</a>
            <a href="#results" data-route="results">Kết quả</a>
            <a href="#standings" data-route="standings">Bảng xếp hạng</a>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <p>Email: support@sportsvn.com</p>
            <p>© 2026 SportsVN</p>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="container">SportsVN · Nền tảng thể thao Việt Nam</div>
        </div>
      </footer>
    `;
  }

  // ----------------------------------------------------------
  // 8. AUTH MODAL
  // ----------------------------------------------------------
  function openAuth(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    switchAuthMode(mode);
  }

  function closeAuth() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setMessage('login-message', '');
    setMessage('register-message', '');
  }

  function switchAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const title = document.getElementById('auth-title');

    if (!loginForm || !registerForm) return;

    const login = mode !== 'register';
    loginForm.classList.toggle('hidden', !login);
    registerForm.classList.toggle('hidden', login);
    loginTab?.classList.toggle('active', login);
    registerTab?.classList.toggle('active', !login);
    if (title) title.textContent = login ? 'Đăng nhập' : 'Đăng ký';
  }

  async function handleLogin(event) {
    event.preventDefault();

    const email = String($('#login-email')?.value || '').trim();
    const password = String($('#login-password')?.value || '');

    if (!email || !password) {
      setMessage('login-message', 'Vui lòng nhập đầy đủ email và mật khẩu.', 'error');
      return;
    }

    if (!supabaseClient) {
      setMessage('login-message', 'Supabase chưa được kết nối. Kiểm tra file config.js.', 'error');
      return;
    }

    const submit = $('#login-form button[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'ĐANG ĐĂNG NHẬP...';
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      currentUser = data.user || null;
      closeAuth();
      renderApp();
      showToast('Đăng nhập thành công!');
    } catch (error) {
      console.error(error);
      setMessage('login-message', friendlyAuthError(error), 'error');
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'ĐĂNG NHẬP';
      }
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    const name = String($('#register-name')?.value || '').trim();
    const email = String($('#register-email')?.value || '').trim();
    const password = String($('#register-password')?.value || '');
    const confirm = String($('#register-password-confirm')?.value || '');

    if (!name || !email || !password || !confirm) {
      setMessage('register-message', 'Vui lòng nhập đầy đủ thông tin.', 'error');
      return;
    }

    if (password.length < 6) {
      setMessage('register-message', 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
      return;
    }

    if (password !== confirm) {
      setMessage('register-message', 'Mật khẩu nhập lại không khớp.', 'error');
      return;
    }

    if (!supabaseClient) {
      setMessage('register-message', 'Supabase chưa được kết nối. Kiểm tra file config.js.', 'error');
      return;
    }

    const submit = $('#register-form button[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'ĐANG TẠO TÀI KHOẢN...';
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        currentUser = data.user || null;
        closeAuth();
        renderApp();
        showToast('Tạo tài khoản thành công!');
      } else {
        setMessage(
          'register-message',
          'Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.',
          'success'
        );
      }
    } catch (error) {
      console.error(error);
      setMessage('register-message', friendlyAuthError(error), 'error');
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'TẠO TÀI KHOẢN';
      }
    }
  }

  async function logout() {
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (error) {
        console.error('SportsVN logout error:', error);
      }
    }
    currentUser = null;
    closeAuth();
    renderApp();
    showToast('Đã đăng xuất.');
  }

  // ----------------------------------------------------------
  // 9. TOAST
  // ----------------------------------------------------------
  function showToast(message) {
    let toast = document.getElementById('sportsvn-toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sportsvn-toast';
      toast.style.cssText = [
        'position:fixed',
        'left:50%',
        'bottom:28px',
        'transform:translateX(-50%)',
        'background:#101820',
        'color:#fff',
        'padding:12px 18px',
        'border-radius:10px',
        'font-weight:700',
        'font-size:14px',
        'z-index:9999',
        'box-shadow:0 10px 30px rgba(0,0,0,.2)'
      ].join(';');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // ----------------------------------------------------------
  // 10. ROUTER
  // ----------------------------------------------------------
  function getRoute() {
    const raw = window.location.hash.replace(/^#/, '').trim();
    return raw || 'home';
  }

  function routeTo(route) {
    const target = route || 'home';
    window.location.hash = target === 'home' ? '#home' : '#' + target;
  }

  function renderApp() {
    const app = document.getElementById('app');

    if (!app) {
      console.error('SportsVN: Không tìm thấy #app trong index.html.');
      return;
    }

    const route = getRoute();
    let active = route;

    if (['account', 'my-tournaments', 'create-tournament'].includes(route)) active = 'home';

    let content = '';

    switch (route) {
      case 'news':
        content = renderNewsPage();
        break;
      case 'tournaments':
        content = renderTournamentPage();
        break;
      case 'schedule':
        content = renderSimplePage('Lịch thi đấu', 'SCHEDULE', 'Lịch thi đấu của các giải sẽ được cập nhật trên SportsVN.');
        break;
      case 'results':
        content = renderSimplePage('Kết quả', 'RESULTS', 'Kết quả các trận đấu và thành tích sẽ được cập nhật trên SportsVN.');
        break;
      case 'athletes':
        content = renderSimplePage('Vận động viên', 'ATHLETES', 'Hồ sơ vận động viên, thành tích và lịch sử thi đấu sẽ được xây dựng tại đây.');
        break;
      case 'standings':
        content = renderSimplePage('Bảng xếp hạng', 'STANDINGS', 'Bảng xếp hạng theo từng môn thể thao và giải đấu sẽ được cập nhật tại đây.');
        break;
      case 'account':
        content = renderAccountPage();
        break;
      case 'my-tournaments':
        content = renderMyTournamentsPage();
        break;
      case 'create-tournament':
        content = renderCreateTournamentPage();
        break;
      case 'home':
      default:
        active = 'home';
        content = renderHome();
        break;
    }

    app.innerHTML = `
      ${renderHeader(active)}
      <main>${content}</main>
      ${renderFooter()}
    `;

    bindUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----------------------------------------------------------
  // 11. SỰ KIỆN GIAO DIỆN
  // ----------------------------------------------------------
  function bindUI() {
    // Điều hướng
    $$('[data-route]').forEach(link => {
      link.addEventListener('click', () => {
        const route = link.getAttribute('data-route');
        if (route) routeTo(route);
      });
    });

    // Mobile menu
    $('#mobile-menu')?.addEventListener('click', () => {
      $('#main-nav')?.classList.toggle('open');
    });

    // Auth header
    $('#header-login')?.addEventListener('click', () => openAuth('login'));
    $('#header-register')?.addEventListener('click', () => openAuth('register'));
    $('#cta-register')?.addEventListener('click', () => openAuth(currentUser ? 'login' : 'register'));

    // User menu
    $('#user-btn')?.addEventListener('click', event => {
      event.stopPropagation();
      $('#user-dropdown')?.classList.toggle('show');
    });

    $('#logout-btn')?.addEventListener('click', logout);
    $('#account-logout')?.addEventListener('click', logout);

    // Search
    $('#search-btn')?.addEventListener('click', () => {
      const query = window.prompt('Bạn muốn tìm gì trên SportsVN?');
      if (query && query.trim()) {
        showToast('SportsVN đang tìm: ' + query.trim());
      }
    });

    // Tournament actions
    $('#login-for-tournament')?.addEventListener('click', () => openAuth('login'));
    $('#create-tournament')?.addEventListener('click', () => routeTo('create-tournament'));
    $('#create-tournament-2')?.addEventListener('click', () => routeTo('create-tournament'));
    $('#tournament-create-form')?.addEventListener('submit', handleCreateTournament);

    // Sport tiles
    $$('[data-sport]').forEach(button => {
      button.addEventListener('click', () => {
        showToast('Bạn đã chọn môn ' + button.getAttribute('data-sport'));
      });
    });

    // Các nút thông báo
    $$('[data-toast]').forEach(button => {
      button.addEventListener('click', () => showToast(button.getAttribute('data-toast')));
    });
  }

  // ----------------------------------------------------------
  // 12. AUTH EVENTS
  // ----------------------------------------------------------
  function bindAuthUI() {
    $('#login-tab')?.addEventListener('click', () => switchAuthMode('login'));
    $('#register-tab')?.addEventListener('click', () => switchAuthMode('register'));

    $$('[data-close-auth]').forEach(element => {
      element.addEventListener('click', closeAuth);
    });

    $('#login-form')?.addEventListener('submit', handleLogin);
    $('#register-form')?.addEventListener('submit', handleRegister);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeAuth();
    });

    document.addEventListener('click', event => {
      const menu = $('#user-dropdown');
      const button = $('#user-btn');
      if (menu && !menu.contains(event.target) && button && !button.contains(event.target)) {
        menu.classList.remove('show');
      }
    });
  }

  // ----------------------------------------------------------
  // 13. LẤY SESSION SUPABASE
  // ----------------------------------------------------------
  async function initAuth() {
    if (!supabaseClient) return;

    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;

      currentUser = data.session?.user || null;
      renderApp();

      supabaseClient.auth.onAuthStateChange((_event, session) => {
        currentUser = session?.user || null;
        renderApp();
      });
    } catch (error) {
      console.error('SportsVN: Không đọc được session.', error);
      currentUser = null;
      renderApp();
    }
  }

  // ----------------------------------------------------------
  // 14. KHỞI ĐỘNG
  // ----------------------------------------------------------
  async function start() {
    try {
      tournamentUtils = await import('./tournament-utils.mjs');
    } catch (error) {
      console.warn('SportsVN: Không tải được tournament-utils.mjs.', error);
    }

    // Render giao diện NGAY CẢ KHI SUPABASE CHƯA CẤU HÌNH.
    renderApp();
    bindAuthUI();

    if (!supabaseReady) {
      console.warn(
        'SportsVN: Supabase chưa sẵn sàng. Kiểm tra config.js và SUPABASE_URL.'
      );
      return;
    }

    initAuth();
  }

  window.addEventListener('hashchange', renderApp);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  // Một vài hàm hữu ích cho việc kiểm tra từ Console.
  window.SPORTSVN = {
    openLogin: () => openAuth('login'),
    openRegister: () => openAuth('register'),
    logout,
    getUser: () => currentUser,
    supabaseReady: () => Boolean(supabaseClient)
  };
})();
