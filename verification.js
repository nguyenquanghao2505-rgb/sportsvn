// ============================================================
// verification.js — Sinh & xác thực mã OTP
// DEMO: in mã ra console/UI. PRODUCTION: gọi backend.
// ============================================================

import { writeLog } from './audit.js';

const KEY = 'verification_codes';
const CODE_TTL_MS = 5 * 60 * 1000; // 5 phút
const MAX_ATTEMPTS = 5;

function load() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

function genCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1000000).padStart(6, '0');
}

/**
 * Gửi mã xác thực (DEMO)
 * @param {Object} user    - { id, username }
 * @param {string} method  - 'email' | 'zalo' | 'sms'
 * @param {string} contact - email/sđt/zalo_id
 */
export async function sendVerificationCode(user, method, contact) {
  if (!contact) throw new Error('Thiếu thông tin liên hệ');

  if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))
    throw new Error('Email không hợp lệ');
  if (method === 'sms'   && !/^0\d{9,10}$/.test(contact))
    throw new Error('SĐT không hợp lệ (VD: 0901234567)');
  if (method === 'zalo'  && !/^\d{8,15}$/.test(contact))
    throw new Error('Zalo ID không hợp lệ');

  const code = genCode();
  const entry = {
    id: 'vc_' + Date.now(),
    user_id: user.id,
    method, contact, code,
    expires_at: Date.now() + CODE_TTL_MS,
    attempts: 0,
    used: false,
    created_at: Date.now(),
  };

  const list = load().filter(c => !c.used);
  list.push(entry);
  save(list);

  console.log(`📨 [DEMO] Mã gửi tới ${contact} qua ${method}: ${code}`);
  writeLog(user, 'send_verification', 'verification', entry.id, { method, contact });

  return { id: entry.id, ttl: CODE_TTL_MS, demoCode: code };
}

/**
 * Xác thực mã
 */
export function verifyCode(userId, codeInput) {
  const list = load();
  const candidates = list
    .filter(c => c.user_id === userId && !c.used)
    .sort((a, b) => b.created_at - a.created_at);

  const entry = candidates[0];
  if (!entry) throw new Error('Không có mã nào đang chờ. Vui lòng gửi lại.');
  if (Date.now() > entry.expires_at) throw new Error('Mã đã hết hạn.');
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.used = true;
    save(list);
    throw new Error('Nhập sai quá nhiều lần. Vui lòng gửi mã mới.');
  }

  entry.attempts += 1;

  if (entry.code !== codeInput) {
    save(list);
    writeLog({ id: userId }, 'verify_failed', 'verification', entry.id, {
      attempts: entry.attempts,
    });
    throw new Error(`Mã không đúng. Còn ${MAX_ATTEMPTS - entry.attempts} lần thử.`);
  }

  entry.used = true;
  save(list);

  writeLog({ id: userId }, 'verify_success', 'verification', entry.id, {
    method: entry.method, contact: entry.contact,
  });

  return { method: entry.method, contact: entry.contact };
}
