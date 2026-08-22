(() => {
  "use strict";

  /* =====================================================
     SPORTS VN - APP.JS
     Phiên bản nền tảng mới
     ===================================================== */

  const config = window.SPORTSVN_CONFIG || {};

  const SUPABASE_URL = config.SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY || "";

  let supabaseClient = null;
  let currentUser = null;
  let currentProfile = null;

  /* =====================================================
     KHỞI TẠO SUPABASE
     ===================================================== */

  function initSupabase() {
    if (
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      SUPABASE_URL.includes("URL_SUPABASE") ||
      SUPABASE_ANON_KEY.includes("YOUR_")
    ) {
      console.warn("SportsVN: Chưa cấu hình Supabase.");
      return false;
    }

    if (!window.supabase) {
      console.error("SportsVN: Không tải được thư viện Supabase.");
      return false;
    }

    try {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

      return true;
    } catch (error) {
      console.error("SportsVN Supabase error:", error);
      return false;
    }
  }

  /* =====================================================
     TIỆN ÍCH
     ===================================================== */

  function escapeHTML(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(date) {
    if (!date) return "";

    try {
      return new Date(date).toLocaleDateString("vi-VN");
    } catch {
      return date;
    }
  }

  function getInitials(name = "") {
    const words = name.trim().split(/\s+/);

    if (!words.length) {
      return "SV";
    }

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  function showMessage(element, message, type = "") {
    if (!element) return;

    element.textContent = message;
    element.className = "form-message";

    if (type) {
      element.classList.add(type);
    }
  }

  /* =====================================================
     DỮ LIỆU TRANG CHỦ
     ===================================================== */

  const NEWS = [
    {
      category: "Bóng đá",
      title: "Những giải đấu thể thao đáng chú ý trong năm 2026",
      date: "22/08/2026",
      image:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80"
    },
    {
      category: "Cầu lông",
      title: "Phong trào cầu lông ngày càng phát triển mạnh",
      date: "21/08/2026",
      image:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80"
    },
    {
      category: "Bóng rổ",
      title: "Sôi động các giải bóng rổ phong trào",
      date: "20/08/2026",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80"
    },
    {
      category: "Pickleball",
      title: "Pickleball tiếp tục thu hút người chơi tại Việt Nam",
      date: "19/08/2026",
      image:
        "https://images.unsplash.com/photo-1617083279464-9f7b3f8f7a6d?auto=format&fit=crop&w=1000&q=80"
    },
    {
      category: "Thể thao",
      title: "Công nghệ đang thay đổi cách tổ chức giải đấu",
      date: "18/08/2026",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80"
    },
    {
      category: "Thể thao Việt Nam",
      title: "SportsVN hướng tới nền tảng quản lý thể thao toàn diện",
      date: "17/08/2026",
      image:
        "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const TOURNAMENTS = [
    {
      sport: "🏸",
      name: "Giải Cầu lông Đại hội TDTT",
      place: "Đà Nẵng",
      date: "2026"
    },
    {
      sport: "🏀",
      name: "Giải Bóng rổ Đại hội TDTT",
      place: "Đà Nẵng",
      date: "24 - 28/08/2026"
    },
    {
      sport: "🏊",
      name: "Giải Bơi Đại hội TDTT",
      place: "Đà Nẵng",
      date: "27 - 29/08/2026"
    },
    {
      sport: "🥋",
      name: "Giải Taekwondo",
      place: "Đà Nẵng",
      date: "2026"
    },
    {
      sport: "🎾",
      name: "Giải Pickleball",
      place: "Đà Nẵng",
      date: "2026"
    },
    {
      sport: "🚣",
      name: "Giải Đua thuyền truyền thống",
      place: "Đà Nẵng",
      date: "2026"
    }
  ];

  const SPORTS = [
    ["⚽", "Bóng đá", "Football"],
    ["🏀", "Bóng rổ", "Basketball"],
    ["🏸", "Cầu lông", "Badminton"],
    ["🎾", "Pickleball", "Pickleball"],
    ["🏊", "Bơi", "Swimming"],
    ["🥋", "Taekwondo", "Taekwondo"],
    ["♟️", "Cờ vua", "Chess"],
    ["♟️", "Cờ tướng", "Chinese Chess"],
    ["🏐", "Bóng chuyền", "Volleyball"],
    ["🚣", "Đua thuyền", "Rowing"]
  ];

  /* =====================================================
     HTML TRANG CHỦ
     ===================================================== */

  function renderHome() {
    const app = document.getElementById("app");

    if (!app) {
      console.error("SportsVN: Không tìm thấy #app.");
      return;
    }

    app.innerHTML = `
      <header class="site-header">

        <div class="container header-inner">

          <a href="#" class="brand">
            <div class="brand-mark">SV</div>

            <div>
              <strong>SPORTSVN</strong>
              <small>Nền tảng thể thao Việt Nam</small>
            </div>
          </a>

          <nav class="main-nav" id="main-nav">

            <a href="#" class="active">Trang chủ</a>

            <a href="#news">Tin tức</a>

            <a href="#tournaments">
              Giải đấu
            </a>

            <a href="#sports">
              Môn thể thao
            </a>

            <a href="#about">
              Về SportsVN
            </a>

          </nav>

          <div class="header-actions" id="header-actions">

            <button
              type="button"
              class="btn btn-outline"
              id="login-button"
            >
              Đăng nhập
            </button>

            <button
              type="button"
              class="btn btn-primary"
              id="register-button"
            >
              Đăng ký
            </button>

            <button
              type="button"
              class="mobile-menu"
              id="mobile-menu"
              aria-label="Menu"
            >
              ☰
            </button>

          </div>

        </div>

      </header>


      <div class="hotbar">

        <div class="container hotbar-inner">

          <b>🔥 ĐANG DIỄN RA</b>

          <span>Đại hội TDTT Đà Nẵng 2026</span>
          <span>Giải Bóng rổ</span>
          <span>Giải Bơi</span>
          <span>Giải Đua thuyền</span>

        </div>

      </div>


      <main>

        <!-- HERO -->

        <section class="hero">

          <div class="container">

            <div class="hero-grid">

              <article
                class="hero-main"
                style="background-image:url('${NEWS[0].image}')"
              >

                <div class="hero-overlay"></div>

                <div class="hero-content">

                  <span class="tag">
                    ${escapeHTML(NEWS[0].category)}
                  </span>

                  <h1>
                    ${escapeHTML(NEWS[0].title)}
                  </h1>

                  <p>
                    Cập nhật những thông tin mới nhất
                    từ thế giới thể thao Việt Nam.
                  </p>

                </div>

              </article>


              <div class="hero-side">

                ${NEWS.slice(1, 4)
                  .map(
                    (item) => `
                      <article class="side-news">

                        <img
                          src="${item.image}"
                          alt="${escapeHTML(item.title)}"
                        >

                        <div>

                          <span>
                            ${escapeHTML(item.category)}
                          </span>

                          <h3>
                            ${escapeHTML(item.title)}
                          </h3>

                          <small>
                            ${escapeHTML(item.date)}
                          </small>

                        </div>

                      </article>
                    `
                  )
                  .join("")}

              </div>

            </div>

          </div>

        </section>


        <!-- NEWS -->

        <section
          class="section"
          id="news"
        >

          <div class="container">

            <div class="section-head">

              <div>
                <div class="eyebrow">
                  SPORTS NEWS
                </div>

                <h2>
                  Tin tức thể thao
                </h2>
              </div>

              <a href="#news">
                Xem tất cả →
              </a>

            </div>


            <div class="category-tabs">

              <button
                class="active"
                type="button"
              >
                Tất cả
              </button>

              <button type="button">
                Bóng đá
              </button>

              <button type="button">
                Cầu lông
              </button>

              <button type="button">
                Bóng rổ
              </button>

              <button type="button">
                Pickleball
              </button>

              <button type="button">
                Võ thuật
              </button>

              <button type="button">
                Thể thao Việt Nam
              </button>

            </div>


            <div class="news-grid">

              ${NEWS.map(
                (item) => `
                  <article class="news-card">

                    <img
                      src="${item.image}"
                      alt="${escapeHTML(item.title)}"
                    >

                    <div class="news-body">

                      <span>
                        ${escapeHTML(item.category)}
                      </span>

                      <h3>
                        ${escapeHTML(item.title)}
                      </h3>

                      <small>
                        ${escapeHTML(item.date)}
                      </small>

                    </div>

                  </article>
                `
              ).join("")}

            </div>

          </div>

        </section>


        <!-- TOURNAMENT -->

        <section
          class="section section-soft"
          id="tournaments"
        >

          <div class="container">

            <div class="section-head">

              <div>
                <div class="eyebrow">
                  TOURNAMENTS
                </div>

                <h2>
                  Giải đấu nổi bật
                </h2>
              </div>

              <a href="#tournaments">
                Xem tất cả →
              </a>

            </div>


            <div class="tournament-grid">

              ${TOURNAMENTS.map(
                (item) => `
                  <article class="tournament-card">

                    <div class="trophy">
                      ${item.sport}
                    </div>

                    <div>

                      <div class="eyebrow">
                        ${escapeHTML(item.date)}
                      </div>

                      <h3>
                        ${escapeHTML(item.name)}
                      </h3>

                      <p>
                        📍 ${escapeHTML(item.place)}
                      </p>

                    </div>

                  </article>
                `
              ).join("")}

            </div>

          </div>

        </section>


        <!-- SPORTS -->

        <section
          class="section"
          id="sports"
        >

          <div class="container">

            <div class="section-head">

              <div>
                <div class="eyebrow">
                  SPORTS
                </div>

                <h2>
                  Môn thể thao
                </h2>
              </div>

            </div>


            <div class="sport-grid">

              ${SPORTS.map(
                (sport) => `
                  <article class="sport-tile">

                    <span>
                      ${sport[0]}
                    </span>

                    <strong>
                      ${escapeHTML(sport[1])}
                    </strong>

                    <small>
                      ${escapeHTML(sport[2])}
                    </small>

                  </article>
                `
              ).join("")}

            </div>

          </div>

        </section>


        <!-- CTA -->

        <section class="cta-section">

          <div class="container cta-inner">

            <div>

              <div class="eyebrow">
                SPORTS MANAGEMENT
              </div>

              <h2>
                Bạn đang tổ chức một giải đấu?
              </h2>

              <p>
                Tạo tài khoản SportsVN để quản lý giải đấu,
                vận động viên, đội tuyển, bốc thăm,
                lịch thi đấu và kết quả trên một nền tảng.
              </p>

            </div>

            <button
              type="button"
              class="btn btn-light"
              id="cta-register"
            >
              Tạo tài khoản miễn phí
            </button>

          </div>

        </section>


        <!-- ABOUT -->

        <section
          class="section"
          id="about"
        >

          <div class="container">

            <div class="section-head">

              <div>

                <div class="eyebrow">
                  SPORTSVN
                </div>

                <h2>
                  Nền tảng thể thao Việt Nam
                </h2>

              </div>

            </div>

            <p style="
              max-width:850px;
              color:#667085;
              line-height:1.8;
            ">
              SportsVN hướng tới xây dựng một hệ sinh thái thể thao
              trực tuyến dành cho vận động viên, câu lạc bộ,
              đơn vị tổ chức và người hâm mộ thể thao Việt Nam.
            </p>

          </div>

        </section>

      </main>


      <!-- FOOTER -->

      <footer class="site-footer">

        <div class="container footer-grid">

          <div>

            <div class="footer-brand">
              SPORTSVN
            </div>

            <p>
              Nền tảng thể thao Việt Nam.
              Tin tức, giải đấu, vận động viên,
              lịch thi đấu và kết quả.
            </p>

          </div>


          <div>

            <h4>
              Khám phá
            </h4>

            <a href="#news">
              Tin tức
            </a>

            <a href="#tournaments">
              Giải đấu
            </a>

            <a href="#sports">
              Môn thể thao
            </a>

          </div>


          <div>

            <h4>
              Tài khoản
            </h4>

            <a href="#" id="footer-login">
              Đăng nhập
            </a>

            <a href="#" id="footer-register">
              Đăng ký
            </a>

          </div>


          <div>

            <h4>
              Liên hệ
            </h4>

            <p>
              Email: Nguyenquanghao2505@gmail.com
              <br>
              Điện thoại: 0905771177
            </p>

          </div>

        </div>


        <div class="footer-bottom">

          <div class="container">

            © 2026 SportsVN. All rights reserved.

          </div>

        </div>

      </footer>
    `;

    bindHomeEvents();
    updateHeader();
  }

  /* =====================================================
     AUTH MODAL
     ===================================================== */

  function openAuth(mode = "login") {
    const modal = document.getElementById("auth-modal");

    if (!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    switchAuthMode(mode);
  }

  function closeAuth() {
    const modal = document.getElementById("auth-modal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    clearMessages();
  }

  function switchAuthMode(mode) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");

    if (!loginForm || !registerForm) return;

    if (mode === "register") {
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");

      loginTab?.classList.remove("active");
      registerTab?.classList.add("active");
    } else {
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");

      registerTab?.classList.remove("active");
      loginTab?.classList.add("active");
    }

    clearMessages();
  }

  function clearMessages() {
    const loginMessage =
      document.getElementById("login-message");

    const registerMessage =
      document.getElementById("register-message");

    if (loginMessage) {
      loginMessage.textContent = "";
      loginMessage.className = "form-message";
    }

    if (registerMessage) {
      registerMessage.textContent = "";
      registerMessage.className = "form-message";
    }
  }

  /* =====================================================
     LOGIN
     ===================================================== */

  async function loginUser(event) {
    event.preventDefault();

    const email =
      document.getElementById("login-email")?.value
        .trim()
        .toLowerCase();

    const password =
      document.getElementById("login-password")?.value;

    const message =
      document.getElementById("login-message");

    if (!email || !password) {
      showMessage(
        message,
        "Vui lòng nhập đầy đủ email và mật khẩu.",
        "error"
      );

      return;
    }

    if (!supabaseClient) {
      showMessage(
        message,
        "SportsVN chưa kết nối được Supabase. Kiểm tra config.js.",
        "error"
      );

      return;
    }

    showMessage(
      message,
      "Đang đăng nhập...",
      ""
    );

    try {

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        console.error(error);

        showMessage(
          message,
          "Email hoặc mật khẩu không chính xác.",
          "error"
        );

        return;
      }

      currentUser = data.user;

      await loadProfile();

      closeAuth();

      updateHeader();

      showToast(
        "Đăng nhập thành công.",
        "success"
      );

    } catch (error) {

      console.error(error);

      showMessage(
        message,
        "Không thể đăng nhập. Vui lòng thử lại.",
        "error"
      );
    }
  }

  /* =====================================================
     REGISTER
     ===================================================== */

  async function registerUser(event) {
    event.preventDefault();

    const name =
      document.getElementById("register-name")?.value.trim();

    const email =
      document
        .getElementById("register-email")
        ?.value.trim()
        .toLowerCase();

    const password =
      document.getElementById("register-password")?.value;

    const confirmPassword =
      document.getElementById(
        "register-password-confirm"
      )?.value;

    const message =
      document.getElementById("register-message");

    if (!name || !email || !password || !confirmPassword) {
      showMessage(
        message,
        "Vui lòng nhập đầy đủ thông tin.",
        "error"
      );

      return;
    }

    if (password.length < 6) {
      showMessage(
        message,
        "Mật khẩu phải có ít nhất 6 ký tự.",
        "error"
      );

      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        message,
        "Mật khẩu nhập lại không giống nhau.",
        "error"
      );

      return;
    }

    if (!supabaseClient) {
      showMessage(
        message,
        "SportsVN chưa kết nối được Supabase. Kiểm tra config.js.",
        "error"
      );

      return;
    }

    showMessage(
      message,
      "Đang tạo tài khoản...",
      ""
    );

    try {

      const { data, error } =
        await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });

      if (error) {
        console.error(error);

        showMessage(
          message,
          error.message || "Không thể tạo tài khoản.",
          "error"
        );

        return;
      }

      if (data.session) {

        currentUser = data.user;

        await createProfile(name);

        showMessage(
          message,
          "Tạo tài khoản thành công.",
          "success"
        );

        setTimeout(() => {
          closeAuth();
          updateHeader();
        }, 800);

      } else {

        showMessage(
          message,
          "Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.",
          "success"
        );
      }

    } catch (error) {

      console.error(error);

      showMessage(
        message,
        "Có lỗi xảy ra khi đăng ký.",
        "error"
      );
    }
  }

  /* =====================================================
     PROFILE
     ===================================================== */

  async function createProfile(name) {

    if (!supabaseClient || !currentUser) {
      return;
    }

    try {

      const { error } =
        await supabaseClient
          .from("profiles")
          .upsert({
            id: currentUser.id,
            full_name: name,
            phone: null,
            role: "manager"
          });

      if (error) {
        console.warn(
          "Không tạo được profile:",
          error
        );
      }

    } catch (error) {

      console.warn(
        "Profile error:",
        error
      );
    }
  }

  async function loadProfile() {

    if (!supabaseClient || !currentUser) {
      return null;
    }

    try {

      const { data, error } =
        await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

      if (error) {
        console.warn(
          "Không đọc được profile:",
          error
        );

        return null;
      }

      currentProfile = data;

      return data;

    } catch (error) {

      console.warn(
        "Profile loading error:",
        error
      );

      return null;
    }
  }

  /* =====================================================
     LOGOUT
     ===================================================== */

  async function logoutUser() {

    if (!supabaseClient) {
      return;
    }

    try {

      await supabaseClient.auth.signOut();

      currentUser = null;
      currentProfile = null;

      updateHeader();

      showToast(
        "Đã đăng xuất.",
        "success"
      );

    } catch (error) {

      console.error(error);

      showToast(
        "Không thể đăng xuất.",
        "error"
      );
    }
  }

  /* =====================================================
     HEADER SAU KHI ĐĂNG NHẬP
     ===================================================== */

  function updateHeader() {

    const actions =
      document.getElementById("header-actions");

    if (!actions) return;

    if (!currentUser) {

      actions.innerHTML = `
        <button
          type="button"
          class="btn btn-outline"
          id="login-button"
        >
          Đăng nhập
        </button>

        <button
          type="button"
          class="btn btn-primary"
          id="register-button"
        >
          Đăng ký
        </button>

        <button
          type="button"
          class="mobile-menu"
          id="mobile-menu"
        >
          ☰
        </button>
      `;

      bindHeaderEvents();

      return;
    }

    const name =
      currentProfile?.full_name ||
      currentUser.email ||
      "Tài khoản";

    actions.innerHTML = `
      <div class="user-menu">

        <button
          type="button"
          class="user-btn"
          id="user-button"
        >
          👤 ${escapeHTML(name)}
        </button>

        <div
          class="user-dropdown"
          id="user-dropdown"
        >

          <a href="#">
            👤 Hồ sơ cá nhân
          </a>

          <a href="#tournaments">
            🏆 Giải đấu của tôi
          </a>

          <a href="#">
            ⚙️ Cài đặt
          </a>

          <button
            type="button"
            id="logout-button"
          >
            🚪 Đăng xuất
          </button>

        </div>

      </div>

      <button
        type="button"
        class="mobile-menu"
        id="mobile-menu"
      >
        ☰
      </button>
    `;

    bindHeaderEvents();
  }

  /* =====================================================
     EVENTS
     ===================================================== */

  function bindHeaderEvents() {

    document
      .getElementById("login-button")
      ?.addEventListener(
        "click",
        () => openAuth("login")
      );

    document
      .getElementById("register-button")
      ?.addEventListener(
        "click",
        () => openAuth("register")
      );

    document
      .getElementById("mobile-menu")
      ?.addEventListener(
        "click",
        () => {
          document
            .getElementById("main-nav")
            ?.classList.toggle("open");
        }
      );

    const userButton =
      document.getElementById("user-button");

    const userDropdown =
      document.getElementById("user-dropdown");

    userButton?.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        userDropdown?.classList.toggle("show");
      }
    );

    document
      .getElementById("logout-button")
      ?.addEventListener(
        "click",
        logoutUser
      );
  }

  function bindHomeEvents() {

    bindHeaderEvents();

    document
      .getElementById("cta-register")
      ?.addEventListener(
        "click",
        () => openAuth("register")
      );

    document
      .getElementById("footer-login")
      ?.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          openAuth("login");
        }
      );

    document
      .getElementById("footer-register")
      ?.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          openAuth("register");
        }
      );

    document
      .querySelectorAll(".category-tabs button")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(".category-tabs button")
              .forEach((item) =>
                item.classList.remove("active")
              );

            button.classList.add("active");

          }
        );

      });
  }

  /* =====================================================
     AUTH MODAL EVENTS
     ===================================================== */

  function bindAuthEvents() {

    document
      .querySelectorAll("[data-close-auth]")
      .forEach((element) => {

        element.addEventListener(
          "click",
          closeAuth
        );

      });

    document
      .getElementById("login-tab")
      ?.addEventListener(
        "click",
        () => switchAuthMode("login")
      );

    document
      .getElementById("register-tab")
      ?.addEventListener(
        "click",
        () => switchAuthMode("register")
      );

    document
      .getElementById("login-form")
      ?.addEventListener(
        "submit",
        loginUser
      );

    document
      .getElementById("register-form")
      ?.addEventListener(
        "submit",
        registerUser
      );

    document.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Escape") {
          closeAuth();
        }

      }
    );

    document.addEventListener(
      "click",
      () => {

        document
          .getElementById("user-dropdown")
          ?.classList.remove("show");

      }
    );
  }

  /* =====================================================
     TOAST
     ===================================================== */

  function showToast(message, type = "") {

    let toast =
      document.getElementById("sportsvn-toast");

    if (!toast) {

      toast =
        document.createElement("div");

      toast.id = "sportsvn-toast";

      toast.style.position = "fixed";
      toast.style.right = "20px";
      toast.style.bottom = "20px";
      toast.style.zIndex = "2000";
      toast.style.padding = "13px 18px";
      toast.style.borderRadius = "10px";
      toast.style.background = "#101820";
      toast.style.color = "#fff";
      toast.style.fontSize = "14px";
      toast.style.fontWeight = "700";
      toast.style.boxShadow =
        "0 12px 30px rgba(0,0,0,.18)";

      document.body.appendChild(toast);
    }

    toast.textContent = message;

    if (type === "success") {
      toast.style.background = "#067647";
    }

    if (type === "error") {
      toast.style.background = "#d92d20";
    }

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(() => {
        toast.remove();
      }, 3000);
  }

  /* =====================================================
     SESSION
     ===================================================== */

  async function loadSession() {

    if (!supabaseClient) {
      return;
    }

    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.getSession();

      if (error) {
        console.warn(
          "Session error:",
          error
        );

        return;
      }

      currentUser =
        data?.session?.user || null;

      if (currentUser) {
        await loadProfile();
      }

      updateHeader();

    } catch (error) {

      console.warn(
        "Không thể kiểm tra session:",
        error
      );
    }

    supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {

        currentUser =
          session?.user || null;

        if (currentUser) {
          await loadProfile();
        } else {
          currentProfile = null;
        }

        updateHeader();
      }
    );
  }

  /* =====================================================
     KHỞI ĐỘNG APP
     ===================================================== */

  async function startApp() {

    console.log(
      "SportsVN đang khởi động..."
    );

    initSupabase();

    renderHome();

    bindAuthEvents();

    await loadSession();

    console.log(
      "SportsVN đã khởi động."
    );
  }

  /* =====================================================
     START
     ===================================================== */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      startApp
    );

  } else {

    startApp();

  }

})();
