/* =========================================================
   SPORTSVN - ACCOUNT / USER DASHBOARD
   Kết nối Supabase Auth
   ========================================================= */

(function () {
  "use strict";

  let supabaseClient = null;
  let currentUser = null;

  /* =========================================================
     KHỞI TẠO SUPABASE
     ========================================================= */

  function initSupabase() {
    try {
      const config = window.SPORTSVN_CONFIG || {};

      if (
        !window.supabase ||
        !config.SUPABASE_URL ||
        !config.SUPABASE_ANON_KEY
      ) {
        console.error("SportsVN: Chưa cấu hình Supabase.");
        return false;
      }

      supabaseClient = window.supabase.createClient(
        config.SUPABASE_URL,
        config.SUPABASE_ANON_KEY
      );

      return true;
    } catch (error) {
      console.error("SportsVN Supabase:", error);
      return false;
    }
  }

  /* =========================================================
     CSS GIAO DIỆN TÀI KHOẢN
     ========================================================= */

  function addAccountStyles() {
    if (document.getElementById("sportsvn-account-style")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "sportsvn-account-style";

    style.textContent = `
      .sv-account-menu {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .sv-user-button {
        border: 0;
        background: #0869df;
        color: #fff;
        border-radius: 10px;
        padding: 11px 16px;
        font-weight: 700;
        cursor: pointer;
        font-size: 14px;
      }

      .sv-user-button:hover {
        background: #0759bd;
      }

      .sv-account-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 300px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 15px 40px rgba(0,0,0,.15);
        z-index: 99999;
        overflow: hidden;
        display: none;
      }

      .sv-account-dropdown.show {
        display: block;
      }

      .sv-account-head {
        padding: 20px;
        background: linear-gradient(135deg,#0869df,#0757b8);
        color: white;
      }

      .sv-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: white;
        color: #0869df;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 800;
        margin-bottom: 10px;
      }

      .sv-account-name {
        font-size: 16px;
        font-weight: 800;
        margin-bottom: 4px;
      }

      .sv-account-email {
        font-size: 12px;
        opacity: .9;
        word-break: break-word;
      }

      .sv-account-links {
        padding: 8px;
      }

      .sv-account-link {
        width: 100%;
        border: 0;
        background: transparent;
        padding: 12px 14px;
        text-align: left;
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        color: #172033;
      }

      .sv-account-link:hover {
        background: #f1f5f9;
      }

      .sv-account-link.logout {
        color: #dc2626;
      }

      .sv-dashboard {
        display: none;
        position: fixed;
        inset: 0;
        background: #f5f7fb;
        z-index: 99990;
        overflow-y: auto;
      }

      .sv-dashboard.show {
        display: block;
      }

      .sv-dashboard-header {
        height: 70px;
        background: white;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30px;
        position: sticky;
        top: 0;
        z-index: 5;
      }

      .sv-dashboard-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        font-size: 20px;
        color: #0b1830;
      }

      .sv-dashboard-logo span {
        width: 38px;
        height: 38px;
        background: #0869df;
        color: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
      }

      .sv-dashboard-close {
        border: 1px solid #dbe2ea;
        background: white;
        padding: 9px 14px;
        border-radius: 9px;
        cursor: pointer;
        font-weight: 700;
      }

      .sv-dashboard-body {
        max-width: 1250px;
        margin: 0 auto;
        padding: 30px 20px 60px;
      }

      .sv-dashboard-title {
        margin-bottom: 25px;
      }

      .sv-dashboard-title h1 {
        margin: 0 0 6px;
        font-size: 30px;
        color: #0f172a;
      }

      .sv-dashboard-title p {
        margin: 0;
        color: #64748b;
      }

      .sv-dashboard-grid {
        display: grid;
        grid-template-columns: repeat(4,1fr);
        gap: 18px;
        margin-bottom: 28px;
      }

      .sv-stat {
        background: white;
        border: 1px solid #e6eaf0;
        border-radius: 16px;
        padding: 22px;
      }

      .sv-stat-icon {
        font-size: 25px;
        margin-bottom: 12px;
      }

      .sv-stat-number {
        font-size: 30px;
        font-weight: 800;
        color: #0f172a;
      }

      .sv-stat-label {
        color: #64748b;
        font-size: 13px;
        margin-top: 4px;
      }

      .sv-dashboard-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
      }

      .sv-panel {
        background: white;
        border: 1px solid #e6eaf0;
        border-radius: 16px;
        padding: 22px;
      }

      .sv-panel h2 {
        margin: 0 0 18px;
        font-size: 18px;
        color: #0f172a;
      }

      .sv-action-grid {
        display: grid;
        grid-template-columns: repeat(2,1fr);
        gap: 12px;
      }

      .sv-action {
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 12px;
        padding: 18px;
        text-align: left;
        cursor: pointer;
      }

      .sv-action:hover {
        border-color: #0869df;
        background: #f8fbff;
      }

      .sv-action strong {
        display: block;
        margin-bottom: 5px;
        color: #0f172a;
      }

      .sv-action small {
        color: #64748b;
      }

      .sv-empty {
        padding: 30px;
        text-align: center;
        color: #64748b;
        background: #f8fafc;
        border-radius: 12px;
      }

      @media(max-width:900px) {
        .sv-dashboard-grid {
          grid-template-columns: repeat(2,1fr);
        }

        .sv-dashboard-content {
          grid-template-columns: 1fr;
        }
      }

      @media(max-width:600px) {
        .sv-dashboard-header {
          padding: 0 15px;
        }

        .sv-dashboard-body {
          padding: 20px 12px 40px;
        }

        .sv-dashboard-title h1 {
          font-size: 24px;
        }

        .sv-dashboard-grid {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .sv-stat {
          padding: 15px;
        }

        .sv-stat-number {
          font-size: 24px;
        }

        .sv-action-grid {
          grid-template-columns: 1fr;
        }

        .sv-account-dropdown {
          width: calc(100vw - 25px);
          right: -5px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     TẠO GIAO DIỆN DASHBOARD
     ========================================================= */

  function createDashboard() {
    if (document.getElementById("sv-dashboard")) {
      return;
    }

    const dashboard = document.createElement("div");

    dashboard.id = "sv-dashboard";

    dashboard.className = "sv-dashboard";

    dashboard.innerHTML = `
      <header class="sv-dashboard-header">

        <div class="sv-dashboard-logo">
          <span>SV</span>
          <div>
            SportsVN
          </div>
        </div>

        <button
          type="button"
          class="sv-dashboard-close"
          id="sv-dashboard-close"
        >
          ← Về trang chủ
        </button>

      </header>

      <main class="sv-dashboard-body">

        <div class="sv-dashboard-title">

          <h1 id="sv-dashboard-welcome">
            Xin chào!
          </h1>

          <p>
            Trung tâm quản lý tài khoản SportsVN
          </p>

        </div>

        <div class="sv-dashboard-grid">

          <div class="sv-stat">
            <div class="sv-stat-icon">🏆</div>
            <div
              class="sv-stat-number"
              id="sv-stat-events"
            >
              0
            </div>
            <div class="sv-stat-label">
              Giải đấu của tôi
            </div>
          </div>

          <div class="sv-stat">
            <div class="sv-stat-icon">👥</div>
            <div
              class="sv-stat-number"
              id="sv-stat-athletes"
            >
              0
            </div>
            <div class="sv-stat-label">
              Vận động viên
            </div>
          </div>

          <div class="sv-stat">
            <div class="sv-stat-icon">🎲</div>
            <div
              class="sv-stat-number"
              id="sv-stat-draws"
            >
              0
            </div>
            <div class="sv-stat-label">
              Lần bốc thăm
            </div>
          </div>

          <div class="sv-stat">
            <div class="sv-stat-icon">📅</div>
            <div
              class="sv-stat-number"
              id="sv-stat-matches"
            >
              0
            </div>
            <div class="sv-stat-label">
              Trận đấu
            </div>
          </div>

        </div>

        <div class="sv-dashboard-content">

          <section class="sv-panel">

            <h2>
              Quản lý giải đấu
            </h2>

            <div class="sv-action-grid">

              <button
                class="sv-action"
                data-dashboard-action="create-event"
              >
                <strong>➕ Tạo giải đấu</strong>
                <small>
                  Tạo giải đấu thể thao mới
                </small>
              </button>

              <button
                class="sv-action"
                data-dashboard-action="events"
              >
                <strong>🏆 Giải đấu của tôi</strong>
                <small>
                  Xem và quản lý các giải đấu
                </small>
              </button>

              <button
                class="sv-action"
                data-dashboard-action="athletes"
              >
                <strong>👥 Vận động viên</strong>
                <small>
                  Quản lý danh sách vận động viên
                </small>
              </button>

              <button
                class="sv-action"
                data-dashboard-action="draw"
              >
                <strong>🎲 Bốc thăm tự động</strong>
                <small>
                  Tạo bảng đấu và bốc thăm
                </small>
              </button>

              <button
                class="sv-action"
                data-dashboard-action="schedule"
              >
                <strong>📅 Lịch thi đấu</strong>
                <small>
                  Quản lý lịch và sân thi đấu
                </small>
              </button>

              <button
                class="sv-action"
                data-dashboard-action="results"
              >
                <strong>🏅 Kết quả</strong>
                <small>
                  Cập nhật kết quả thi đấu
                </small>
              </button>

            </div>

          </section>

          <section class="sv-panel">

            <h2>
              Tài khoản
            </h2>

            <div
              id="sv-account-information"
              class="sv-empty"
            >
              Đang tải thông tin...
            </div>

          </section>

        </div>

      </main>
    `;

    document.body.appendChild(dashboard);

    document
      .getElementById("sv-dashboard-close")
      .addEventListener("click", closeDashboard);

    document
      .querySelectorAll("[data-dashboard-action]")
      .forEach(function (button) {

        button.addEventListener("click", function () {

          const action = button.dataset.dashboardAction;

          handleDashboardAction(action);

        });

      });
  }

  /* =========================================================
     HIỂN THỊ THÔNG TIN USER
     ========================================================= */

  function updateDashboardUser() {

    if (!currentUser) {
      return;
    }

    const metadata = currentUser.user_metadata || {};

    const name =
      metadata.full_name ||
      metadata.name ||
      currentUser.email?.split("@")[0] ||
      "Người dùng";

    const welcome =
      document.getElementById("sv-dashboard-welcome");

    if (welcome) {
      welcome.textContent =
        "Xin chào, " + name + "!";
    }

    const information =
      document.getElementById("sv-account-information");

    if (information) {

      information.innerHTML = `
        <div
          style="
            font-size:36px;
            margin-bottom:10px;
          "
        >
          👤
        </div>

        <strong
          style="
            display:block;
            color:#0f172a;
            margin-bottom:6px;
          "
        >
          ${escapeHtml(name)}
        </strong>

        <div
          style="
            font-size:13px;
            word-break:break-word;
          "
        >
          ${escapeHtml(currentUser.email || "")}
        </div>
      `;
    }
  }

  /* =========================================================
     ESCAPE HTML
     ========================================================= */

  function escapeHtml(value) {

    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     MỞ DASHBOARD
     ========================================================= */

  function openDashboard() {

    if (!currentUser) {
      return;
    }

    createDashboard();

    updateDashboardUser();

    document
      .getElementById("sv-dashboard")
      .classList.add("show");

    document.body.style.overflow = "hidden";
  }

  /* =========================================================
     ĐÓNG DASHBOARD
     ========================================================= */

  function closeDashboard() {

    const dashboard =
      document.getElementById("sv-dashboard");

    if (dashboard) {
      dashboard.classList.remove("show");
    }

    document.body.style.overflow = "";
  }

  /* =========================================================
     XỬ LÝ CÁC CHỨC NĂNG
     ========================================================= */

  function handleDashboardAction(action) {

    switch (action) {

      case "create-event":

        alert(
          "SportsVN: Chức năng Tạo giải đấu sẽ được kết nối ở bước tiếp theo."
        );

        break;

      case "events":

        alert(
          "SportsVN: Đang chuẩn bị module Quản lý giải đấu."
        );

        break;

      case "athletes":

        alert(
          "SportsVN: Đang chuẩn bị module Quản lý vận động viên."
        );

        break;

      case "draw":

        alert(
          "SportsVN: Module Bốc thăm tự động sẽ được tích hợp tiếp theo."
        );

        break;

      case "schedule":

        alert(
          "SportsVN: Module Lịch thi đấu sẽ được tích hợp tiếp theo."
        );

        break;

      case "results":

        alert(
          "SportsVN: Module Kết quả sẽ được tích hợp tiếp theo."
        );

        break;

    }
  }

  /* =========================================================
     TẠO NÚT TÀI KHOẢN
     ========================================================= */

  function createUserMenu() {

    if (!currentUser) {
      return;
    }

    if (
      document.getElementById("sv-account-menu")
    ) {
      return;
    }

    const buttons =
      document.querySelectorAll("button, a");

    let target = null;

    buttons.forEach(function (element) {

      const text =
        (element.textContent || "")
          .trim()
          .toLowerCase();

      if (
        !target &&
        (
          text === "đăng nhập" ||
          text === "dang nhap"
        )
      ) {
        target = element;
      }

    });

    if (!target) {

      console.warn(
        "SportsVN: Không tìm thấy nút Đăng nhập."
      );

      return;
    }

    const menu =
      document.createElement("div");

    menu.id = "sv-account-menu";

    menu.className = "sv-account-menu";

    menu.innerHTML = `

      <button
        type="button"
        class="sv-user-button"
        id="sv-user-button"
      >
        👤 Tài khoản
      </button>

      <div
        class="sv-account-dropdown"
        id="sv-account-dropdown"
      >

        <div class="sv-account-head">

          <div class="sv-avatar">
            👤
          </div>

          <div
            class="sv-account-name"
            id="sv-menu-name"
          >
            Người dùng
          </div>

          <div
            class="sv-account-email"
            id="sv-menu-email"
          >
          </div>

        </div>

        <div class="sv-account-links">

          <button
            class="sv-account-link"
            id="sv-open-dashboard"
          >
            🏠 Trung tâm quản lý
          </button>

          <button
            class="sv-account-link"
            id="sv-open-events"
          >
            🏆 Giải đấu của tôi
          </button>

          <button
            class="sv-account-link"
            id="sv-open-profile"
          >
            👤 Hồ sơ cá nhân
          </button>

          <button
            class="sv-account-link logout"
            id="sv-logout"
          >
            🚪 Đăng xuất
          </button>

        </div>

      </div>
    `;

    target.replaceWith(menu);

    document
      .getElementById("sv-user-button")
      .addEventListener("click", function () {

        document
          .getElementById("sv-account-dropdown")
          .classList.toggle("show");

      });

    document
      .getElementById("sv-open-dashboard")
      .addEventListener("click", function () {

        document
          .getElementById("sv-account-dropdown")
          .classList.remove("show");

        openDashboard();

      });

    document
      .getElementById("sv-open-events")
      .addEventListener("click", function () {

        document
          .getElementById("sv-account-dropdown")
          .classList.remove("show");

        openDashboard();

        alert(
          "Module Giải đấu sẽ được kết nối với cơ sở dữ liệu ở bước tiếp theo."
        );

      });

    document
      .getElementById("sv-open-profile")
      .addEventListener("click", function () {

        document
          .getElementById("sv-account-dropdown")
          .classList.remove("show");

        openDashboard();

      });

    document
      .getElementById("sv-logout")
      .addEventListener("click", logout);

    updateUserMenu();
  }

  /* =========================================================
     CẬP NHẬT USER MENU
     ========================================================= */

  function updateUserMenu() {

    if (!currentUser) {
      return;
    }

    const metadata =
      currentUser.user_metadata || {};

    const name =
      metadata.full_name ||
      metadata.name ||
      currentUser.email?.split("@")[0] ||
      "Người dùng";

    const nameElement =
      document.getElementById("sv-menu-name");

    const emailElement =
      document.getElementById("sv-menu-email");

    if (nameElement) {
      nameElement.textContent = name;
    }

    if (emailElement) {
      emailElement.textContent =
        currentUser.email || "";
    }
  }

  /* =========================================================
     ĐĂNG XUẤT
     ========================================================= */

  async function logout() {

    if (!supabaseClient) {
      return;
    }

    try {

      const result =
        await supabaseClient.auth.signOut();

      if (result.error) {
        throw result.error;
      }

      currentUser = null;

      closeDashboard();

      const menu =
        document.getElementById("sv-account-menu");

      if (menu) {
        menu.remove();
      }

      window.location.reload();

    } catch (error) {

      console.error(
        "SportsVN logout:",
        error
      );

      alert(
        "Không thể đăng xuất. Vui lòng thử lại."
      );
    }
  }

  /* =========================================================
     KIỂM TRA SESSION
     ========================================================= */

  async function loadSession() {

    if (!supabaseClient) {
      return;
    }

    try {

      const result =
        await supabaseClient.auth.getSession();

      if (result.error) {
        throw result.error;
      }

      currentUser =
        result.data.session?.user || null;

      if (currentUser) {

        createUserMenu();

      }

    } catch (error) {

      console.error(
        "SportsVN session:",
        error
      );

    }
  }

  /* =========================================================
     THEO DÕI ĐĂNG NHẬP / ĐĂNG XUẤT
     ========================================================= */

  function listenAuthChanges() {

    if (!supabaseClient) {
      return;
    }

    supabaseClient.auth.onAuthStateChange(
      function (event, session) {

        currentUser =
          session?.user || null;

        if (event === "SIGNED_IN") {

          setTimeout(function () {

            createUserMenu();

          }, 100);

        }

        if (event === "SIGNED_OUT") {

          currentUser = null;

        }

      }
    );
  }

  /* =========================================================
     KHỞI ĐỘNG
     ========================================================= */

  async function start() {

    addAccountStyles();

    createDashboard();

    if (!initSupabase()) {
      return;
    }

    listenAuthChanges();

    await loadSession();
  }

  /* =========================================================
     CHỜ TRANG TẢI XONG
     ========================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();

  }

})();
