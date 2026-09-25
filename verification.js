// ============================================================
// verification.js — Sinh & xác thực mã OTP
// Hỗ trợ 3 chế độ: DEMO | EMAIL (EmailJS) | API (backend)
// ============================================================

import { writeLog } from './audit.js';

// ============================================================
// ⚙️ CẤU HÌNH — CHỈ SỬA PHẦN NÀY
// ============================================================

const CONFIG = {
  // Chọn chế độ: 'demo' | 'email' | 'api'
  // - 'demo'  : hiện mã trên UI (test local)
  // - 'email' : gửi qua EmailJS (cần đăng ký EmailJS)
  // - 'api'   : gửi qua backend riêng (cần server)
  MODE: 'demo',

  // Cấu hình EmailJS (chỉ dùng khi MODE = 'email')
  // Đăng ký miễn phí tại https://www.emailjs.com
  EMAILJS: {
    PUBLIC_KEY:  'YOUR_PUBLIC_KEY',   // Account → API Keys
    SERVICE_ID:  'YOUR_SERVICE_ID',   // Email Services → Service ID
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID',  // Email Templates → Template ID
  },

  // Cấu hình API backend (chỉ dùng khi MODE = 'api')
  API: {
    BASE_URL: 'https://your-backend.com/api',
    SEND_ENDPOINT: '/verify/send',
  },

  // Thời gian & giới hạn
  CODE_TTL_MS:  5 * 60 * 1000,  // 5 phút
  MAX_ATTEMPTS: 5,               // số lần nhập sai tối đa
  RESEND_COOLDOWN_MS: 60 * 1000, // 60 giây mới được gửi lại
};

// ============================================================
// 🗄️ LƯU TRỮ LOCAL
// ============================================================

const KEY = 'verification_codes_v2';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// ============================================================
// 🔢 SINH MÃ
// ============================================================

/**
 * Sinh mã 6 số ngẫu nhiên bằng crypto (an toàn hơn Math.random)
 */
function genCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1000000).padStart(6, '0');
}

// ============================================================
// ✅ VALIDATE
// ============================================================

function validateContact(method, contact) {
  if (!contact) throw new Error('Thiếu thông tin liên hệ');

  if (method === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))
      throw new Error('Email không hợp lệ');
  }

  if (method === 'sms') {
    if (!/^0\d{9,10}$/.test(contact))
      throw new Error('SĐT không hợp lệ (VD: 0901234567)');
  }

  if (method === 'zalo') {
    if (!/^\d{8,15}$/.test(contact))
      throw new Error('Zalo ID không hợp lệ (8-15 chữ số)');
  }
}

/**
 * Kiểm tra cooldown gửi lại (chống spam)
 */
function checkCooldown(userId) {
  const list = load();
  const lastCode = list
    .filter(c => c.user_id === userId)
    .sort((a, b) => b.created_at - a.created_at)[0];

  if (!lastCode) return;

  const elapsed = Date.now() - lastCode.created_at;
  if (elapsed < CONFIG.RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((CONFIG.RESEND_COOLDOWN_MS - elapsed) / 1000);
    throw new Error(`Vui lòng chờ ${remaining} giây trước khi gửi lại`);
  }
}

// ============================================================
// 📤 GỬI MÃ — 3 chế độ
// ============================================================

/**
 * Gửi email qua EmailJS (không cần backend)
 */
async function sendViaEmailJS(contact, username, code) {
  if (CONFIG.EMAILJS.PUBLIC_KEY === 'YOUR_PUBLIC_KEY')
    throw new Error('Chưa cấu hình EmailJS. Xem hướng dẫn trong verification.js');

  // Load EmailJS nếu chưa có
  if (typeof emailjs === 'undefined') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Không tải được EmailJS'));
      document.head.appendChild(script);
    });
    emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
  }

  const result = await emailjs.send(
    CONFIG.EMAILJS.SERVICE_ID,
    CONFIG.EMAILJS.TEMPLATE_ID,
    {
      to_email: contact,
      user_name: username,
      code: code,
      expires_in: '5 phút',
    }
  );

  if (result.status !== 200)
    throw new Error('EmailJS trả về lỗi: ' + result.text);

  console.log(`✅ Đã gửi email tới ${contact}`);
}

/**
 * Gửi qua API backend (dùng cho SMS/Zalo production)
 */
async function sendViaAPI(method, contact, code, userId) {
  const res = await fetch(CONFIG.API.BASE_URL + CONFIG.API.SEND_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, contact, code, userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Lỗi máy chủ (${res.status})`);
  }

  console.log(`✅ Đã gửi qua ${method} tới ${contact}`);
}

// ============================================================
// 🚀 API CHÍNH: sendVerificationCode
// ============================================================

/**
 * Gửi mã xác thực
 * @param {Object} user    - { id, username }
 * @param {string} method  - 'email' | 'zalo' | 'sms'
 * @param {string} contact - email / sđt / zalo_id
 * @returns {Promise<Object>} { id, ttl, demoCode? }
 */
export async function sendVerificationCode(user, method, contact) {
  // 1. Validate
  validateContact(method, contact);
  checkCooldown(user.id);

  // 2. Sinh mã
  const code = genCode();
  const entry = {
    id: 'vc_' + Date.now(),
    user_id: user.id,
    method,
    contact,
    code,
    expires_at: Date.now() + CONFIG.CODE_TTL_MS,
    attempts: 0,
    used: false,
    created_at: Date.now(),
  };

  // 3. Lưu vào LocalStorage
  const list = load().filter(c => !c.used); // dọn mã cũ đã dùng
  list.push(entry);
  save(list);

  // 4. Gửi theo chế độ
  let demoCode = null;

  try {
    switch (CONFIG.MODE) {
      case 'email':
        if (method !== 'email')
          throw new Error('Chế độ EMAIL chỉ hỗ trợ gửi qua email');
        await sendViaEmailJS(contact, user.username, code);
        break;

      case 'api':
        await sendViaAPI(method, contact, code, user.id);
        break;

      case 'demo':
      default:
        demoCode = code;
        console.log(`📨 [DEMO] Mã gửi tới ${contact} qua ${method}: ${code}`);
        break;
    }
  } catch (err) {
    // Gửi thất bại → xóa entry vừa lưu
    save(load().filter(c => c.id !== entry.id));
    throw err;
  }

  // 5. Ghi audit log
  writeLog(user, 'send_verification', 'verification', entry.id, {
    method,
    contact,
    mode: CONFIG.MODE,
  });

  // 6. Trả về
  return {
    id: entry.id,
    ttl: CONFIG.CODE_TTL_MS,
    demoCode, // ⚠️ CHỈ có giá trị khi MODE='demo'
  };
}

// ============================================================
// 🔐 API CHÍNH: verifyCode
// ============================================================

/**
 * Xác thực mã
 * @param {string} userId    - ID của user
 * @param {string} codeInput - mã người dùng nhập
 * @returns {Object} { method, contact }
 */
export function verifyCode(userId, codeInput) {
  if (!codeInput || codeInput.length !== 6)
    throw new Error('Mã phải có 6 chữ số');

  const list = load();
  const candidates = list
    .filter(c => c.user_id === userId && !c.used)
    .sort((a, b) => b.created_at - a.created_at);

  const entry = candidates[0];

  // 1. Không có mã nào đang chờ
  if (!entry)
    throw new Error('Không có mã nào đang chờ. Vui lòng gửi lại.');

  // 2. Mã hết hạn
  if (Date.now() > entry.expires_at) {
    entry.used = true;
    save(list);
    throw new Error('Mã đã hết hạn. Vui lòng gửi mã mới.');
  }

  // 3. Vượt quá số lần thử
  if (entry.attempts >= CONFIG.MAX_ATTEMPTS) {
    entry.used = true;
    save(list);
    writeLog({ id: userId }, 'verify_blocked', 'verification', entry.id, {
      reason: 'too_many_attempts',
    });
    throw new Error('Nhập sai quá nhiều lần. Vui lòng gửi mã mới.');
  }

  // 4. Tăng số lần thử
  entry.attempts += 1;

  // 5. Sai mã
  if (entry.code !== codeInput.trim()) {
    save(list);
    writeLog({ id: userId }, 'verify_failed', 'verification', entry.id, {
      attempts: entry.attempts,
      remaining: CONFIG.MAX_ATTEMPTS - entry.attempts,
    });
    throw new Error(
      `Mã không đúng. Còn ${CONFIG.MAX_ATTEMPTS - entry.attempts} lần thử.`
    );
  }

  // 6. Thành công
  entry.used = true;
  save(list);

  writeLog({ id: userId }, 'verify_success', 'verification', entry.id, {
    method: entry.method,
    contact: entry.contact,
  });

  return {
    method: entry.method,
    contact: entry.contact,
  };
}

// ============================================================
// 🧹 TIỆN ÍCH
// ============================================================

/**
 * Xóa mã cũ của user (khi cần reset)
 */
export function clearCodesOfUser(userId) {
  save(load().filter(c => c.user_id !== userId));
}

/**
 * Kiểm tra user có đang chờ xác thực không
 */
export function hasPendingCode(userId) {
  return load().some(c => c.user_id === userId && !c.used);
}
