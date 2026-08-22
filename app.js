/* =========================================================
   SPORTSVN - APP.JS
   Trang chủ + Đăng ký + Đăng nhập + Tài khoản
   ========================================================= */

const CONFIG = window.SPORTSVN_CONFIG || {};

const SUPABASE_READY =
  CONFIG.SUPABASE_URL &&
  CONFIG.SUPABASE_ANON_KEY &&
  !String(CONFIG.SUPABASE_URL).includes("YOUR_") &&
  !String(CONFIG.SUPABASE_ANON_KEY).includes("YOUR_");

const supabaseClient =
  SUPABASE_READY && window.supabase
    ? window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
      )
    : null;


/* =========================================================
   STATE
   ========================================================= */

let currentUser = null;
let currentProfile = null;


/* =========================================================
   HELPERS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return [...document.querySelectorAll(selector)];
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function showMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className = "form-message";

  if (type) {
    element.classList.add(type);
  }
}

function clearMessage(element) {
  if (!element) return;
  element.textContent = "";
  element.className = "form-message";
}


/* =========================================================
   AUTH MODAL
   ========================================================= */

function openAuth(mode = "login") {
  const modal = $("#auth-modal");

  if (!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  switchAuthMode(mode);

  document.body.style.overflow = "hidden";
}

function closeAuth() {
  const modal = $("#auth-modal");

  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  clearMessage($("#login-message"));
  clearMessage($("#register-message"));
}

function switchAuthMode(mode = "login") {
  const loginForm = $("#login-form");
  const registerForm = $("#register-form");

  const tabs = $all("[data-auth-tab]");

  if (!loginForm || !registerForm) return;

  if (mode === "register") {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  } else {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  }

  tabs.forEach(tab => {
    tab.classList.toggle(
      "active",
      tab.dataset.authTab === mode
    );
  });

  clearMessage($("#login-message"));
  clearMessage($("#register-message"));
}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfile() {
  if (!supabaseClient || !currentUser) {
    currentProfile = null;
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Không tải được profile:", error);
      currentProfile = null;
      return null;
    }

    currentProfile = data || null;

    return currentProfile;
  } catch (error) {
    console.error(error);
    currentProfile = null;
    return null;
  }
}


/* =========================================================
   CREATE PROFILE
   ========================================================= */

async function createProfile({
  id,
  fullName,
  phone,
  email
}) {
  if (!supabaseClient) return;

  try {
    const { error } = await supabaseClient
      .from("profiles")
      .upsert(
        {
          id,
          full_name: fullName,
          phone: phone || "",
          email: email || "",
          role: "organizer"
        },
        {
          onConflict: "id"
        }
      );

    if (error) {
      console.error("Không tạo được profile:", error);
    }
  } catch (error) {
    console.error(error);
  }
}


/* =========================================================
   REGISTER
   ========================================================= */

async function registerUser(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const name = $("#register-name")?.value.trim() || "";
  const email = normalizeEmail(
    $("#register-email")?.value || ""
  );
  const phone = $("#register-phone")?.value.trim() || "";
  const password = $("#register-password")?.value || "";

  const message = $("#register-message");

  clearMessage(message);

  if (!name) {
    showMessage(
      message,
      "Vui lòng nhập họ và tên.",
      "error"
    );
    return;
  }

  if (!email) {
    showMessage(
      message,
      "Vui lòng nhập email.",
      "error"
    );
    return;
  }

  if (password.length < 8) {
    showMessage(
      message,
      "Mật khẩu phải có ít nhất 8 ký tự.",
      "error"
    );
    return;
  }

  if (!supabaseClient) {
    showMessage(
      message,
      "Supabase chưa được cấu hình trong config.js.",
      "error"
    );
    return;
  }

  const submitButton =
    form.querySelector('button[type="submit"]');

  const oldText = submitButton?.textContent;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "ĐANG TẠO TÀI KHOẢN...";
  }

  try {
    const { data, error } =
      await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone
          }
        }
      });

    if (error) {
      console.error(error);

      showMessage(
        message,
        error.message ||
          "Không thể tạo tài khoản.",
        "error"
      );

      return;
    }

    /*
      Nếu Supabase đang yêu cầu xác nhận email,
      data.session có thể chưa tồn tại.
    */

    if (data?.user) {
      await createProfile({
        id: data.user.id,
        fullName: name,
        phone,
        email
      });
    }

    if (data?.session) {
      showMessage(
        message,
        "Đăng ký thành công. Đang đăng nhập...",
        "success"
      );

      currentUser = data.user;

      await loadProfile();

      setTimeout(() => {
        closeAuth();
        updateHeader();
      }, 700);

    } else {
      showMessage(
        message,
        "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
        "success"
      );

      form.reset();
    }

  } catch (error) {
    console.error(error);

    showMessage(
      message,
      "Có lỗi xảy ra khi đăng ký tài khoản.",
      "error"
    );

  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent =
        oldText || "ĐĂNG KÝ TÀI KHOẢN";
    }
  }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const email = normalizeEmail(
    $("#login-email")?.value || ""
  );

  const password =
    $("#login-password")?.value || "";

  const message = $("#login-message");

  clearMessage(message);

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
      "Supabase chưa được cấu hình trong config.js.",
      "error"
    );
    return;
  }

  const submitButton =
    form.querySelector('button[type="submit"]');

  const oldText = submitButton?.textContent;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "ĐANG ĐĂNG NHẬP...";
  }

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

    showMessage(
      message,
      "Đăng nhập thành công.",
      "success"
    );

    setTimeout(() => {
      closeAuth();
      updateHeader();
    }, 500);

  } catch (error) {
    console.error(error);

    showMessage(
      message,
      "Không thể đăng nhập. Vui lòng thử lại.",
      "error"
    );

  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent =
        oldText || "ĐĂNG NHẬP";
    }
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {
  if (!supabaseClient) {
    currentUser = null;
    currentProfile = null;
    updateHeader();
    return;
  }

  try {
    await supabaseClient.auth.signOut();
  } catch (error) {
    console.error(error);
  }

  currentUser = null;
  currentProfile = null;

  closeUserMenu();
  updateHeader();
}


/* =========================================================
   USER MENU
   ========================================================= */

function getUserName() {
  if (currentProfile?.full_name) {
    return currentProfile.full_name;
  }

  if (currentUser?.user_metadata?.full_name) {
    return currentUser.user_metadata.full_name;
  }

  if (currentUser?.email) {
    return currentUser.email;
  }

  return "Tài khoản";
}

function getUserRole() {
  return currentProfile?.role ||
    currentUser?.user_metadata?.role ||
    "organizer";
}

function updateHeader() {
  const guestActions = $("#guest-actions");
  const userMenu = $("#user-menu");
  const userName = $("#user-name");

  if (!guestActions || !userMenu) return;

  if (currentUser) {
    guestActions.classList.add("hidden");
    userMenu.classList.remove("hidden");

    if (userName) {
      userName.textContent = getUserName();
    }

    const roleElement = $("#user-role");

    if (roleElement) {
      roleElement.textContent =
        getUserRole() === "admin"
          ? "Quản trị viên"
          : "Ban tổ chức";
    }

  } else {
    guestActions.classList.remove("hidden");
    userMenu.classList.add("hidden");
  }
}

function toggleUserMenu() {
  const dropdown = $("#user-dropdown");

  if (!dropdown) return;

  dropdown.classList.toggle("show");
}

function closeUserMenu() {
  $("#user-dropdown")?.classList.remove("show");
}


/* =========================================================
   TOURNAMENT ACCESS
   ========================================================= */

function openTournamentManager() {
  if (!currentUser) {
    openAuth("login");
    return;
  }

  /*
    Sau này đây sẽ là trang trung tâm điều hành.
  */

  window.location.href = "admin.html";
}

function createTournament() {
  if (!currentUser) {
    openAuth("register");
    return;
  }

  window.location.href = "admin.html#tournaments";
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
  const searchButton = $("#search-btn");
  const searchInput = $("#search-input");
  const searchBox = $("#search-box");

  if (!searchButton) return;

  searchButton.addEventListener("click", () => {
    if (!searchBox) return;

    searchBox.classList.toggle("show");

    if (searchBox.classList.contains("show")) {
      searchInput?.focus();
    }
  });

  searchInput?.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const keyword =
      searchInput.value.trim().toLowerCase();

    if (!keyword) return;

    const cards = $all(
      ".news-card, .tournament-card, .side-news"
    );

    let found = false;

    cards.forEach(card => {
      const text =
        card.textContent.toLowerCase();

      const match = text.includes(keyword);

      card.style.display = match ? "" : "none";

      if (match) found = true;
    });

    if (!found) {
      alert(
        `Không tìm thấy nội dung phù hợp với "${searchInput.value}".`
      );
    }
  });
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {
  const menuButton = $(".mobile-menu");
  const nav = $(".main-nav");

  if (!menuButton || !nav) return;

  menuButton.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  $all(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}


/* =========================================================
   AUTH BUTTONS
   ========================================================= */

function setupAuthButtons() {

  /*
    Đăng nhập
  */

  $all('[data-open-auth="login"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openAuth("login");
    });
  });

  /*
    Đăng ký
  */

  $all('[data-open-auth="register"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openAuth("register");
    });
  });

  /*
    Đóng modal
  */

  $all("[data-close-auth]").forEach(element => {
    element.addEventListener("click", closeAuth);
  });

  /*
    Chuyển tab đăng nhập / đăng ký
  */

  $all("[data-auth-tab]").forEach(button => {
    button.addEventListener("click", () => {
      switchAuthMode(button.dataset.authTab);
    });
  });

  /*
    Form
  */

  $("#login-form")?.addEventListener(
    "submit",
    loginUser
  );

  $("#register-form")?.addEventListener(
    "submit",
    registerUser
  );
}


/* =========================================================
   HEADER ACCOUNT BUTTON
   ========================================================= */

function setupUserMenu() {

  $("#user-btn")?.addEventListener(
    "click",
    event => {
      event.stopPropagation();
      toggleUserMenu();
    }
  );

  $("#logout-btn")?.addEventListener(
    "click",
    async event => {
      event.preventDefault();
      await logoutUser();
    }
  );

  $("#manage-tournaments")?.addEventListener(
    "click",
    event => {
      event.preventDefault();
      openTournamentManager();
    }
  );

  $("#create-tournament")?.addEventListener(
    "click",
    event => {
      event.preventDefault();
      createTournament();
    }
  );

  document.addEventListener("click", event => {
    const menu = $("#user-menu");

    if (!menu) return;

    if (!menu.contains(event.target)) {
      closeUserMenu();
    }
  });
}


/* =========================================================
   CTA BUTTONS
   ========================================================= */

function setupCTA() {

  $all("[data-create-tournament]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      createTournament();
    });
  });

  /*
    Các nút "Xem tất cả"
  */

  $all("[data-go-tournaments]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      const section =
        document.querySelector("#tournaments");

      section?.scrollIntoView({
        behavior: "smooth"
      });
    });
  });
}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function setupCategoryTabs() {

  const tabs =
    $all(".category-tabs button");

  if (!tabs.length) return;

  tabs.forEach(tab => {

    tab.addEventListener("click", () => {

      tabs.forEach(item =>
        item.classList.remove("active")
      );

      tab.classList.add("active");

      const category =
        tab.textContent.trim().toLowerCase();

      const cards =
        $all(".news-card");

      cards.forEach(card => {

        if (
          category === "tất cả" ||
          category === "mới nhất"
        ) {
          card.style.display = "";
          return;
        }

        const cardText =
          card.textContent.toLowerCase();

        card.style.display =
          cardText.includes(category)
            ? ""
            : "none";
      });
    });

  });
}


/* =========================================================
   ESC KEY
   ========================================================= */

function setupKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {
        closeAuth();
        closeUserMenu();
      }

    }
  );
}


/* =========================================================
   SUPABASE SESSION
   ========================================================= */

async function restoreSession() {

  if (!supabaseClient) {
    currentUser = null;
    currentProfile = null;
    updateHeader();
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.error(
        "Không lấy được session:",
        error
      );

      return;
    }

    currentUser =
      data?.session?.user || null;

    if (currentUser) {
      await loadProfile();
    } else {
      currentProfile = null;
    }

    updateHeader();

  } catch (error) {
    console.error(error);
  }
}


/* =========================================================
   AUTH STATE CHANGE
   ========================================================= */

function setupAuthState() {

  if (!supabaseClient) return;

  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      currentUser =
        session?.user || null;

      if (currentUser) {
        /*
          PROFILE được tải sau khi auth thay đổi.
        */
        setTimeout(async () => {
          await loadProfile();
          updateHeader();
        }, 0);

      } else {
        currentProfile = null;
        updateHeader();
      }
    }
  );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initSportsVN() {

  /*
    Các chức năng giao diện
  */

  setupAuthButtons();
  setupUserMenu();
  setupMobileMenu();
  setupSearch();
  setupCTA();
  setupCategoryTabs();
  setupKeyboard();

  /*
    Khôi phục tài khoản
  */

  await restoreSession();

  /*
    Theo dõi đăng nhập/đăng xuất
  */

  setupAuthState();

  /*
    Đảm bảo header đúng trạng thái
  */

  updateHeader();

  console.log(
    "SportsVN đã khởi động.",
    SUPABASE_READY
      ? "Supabase: OK"
      : "Supabase: CHƯA CẤU HÌNH"
  );
}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initSportsVN
  );
} else {
  initSportsVN();
}
