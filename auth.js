// ============================================================
// auth.js — Đăng nhập / Đăng ký / Session
// Dùng LocalStorage. Sau này đổi sang Firebase Auth.
// ============================================================

import { writeLog } from './audit.js';
import { GLOBAL_ROLES } from './rbac.js';

const USERS_KEY   = 'demo_users_v2';    // ⚠️ v2 để tránh xung đột cũ
const SESSION_KEY = 'demo_session_v2';

// ---------- Seed dữ liệu demo ----------
export function seedDemoUsers() {
  if (localStorage.getItem(USERS_KEY)) return;
  const users = [
    {
      id: 'u1', username: 'admin', password: '123',
      fullName: 'Quản trị viên',
      email: 'admin@sport.vn', phone: '0900000001',
      global_role: GLOBAL_ROLES.ADMIN,
      verified: true,
      verification: { method: 'email', verified_at: Date.now() },
      status: 'active',
      createdAt: Date.now(),
    },
    {
      id: 'u2', username: 'nhanvien', password: '123',
      fullName: 'Nguyễn Văn A',
      email: 'a@sport.vn', phone: '0900000002',
      global_role: GLOBAL_ROLES.USER,
      verified: true,
      verification: { method: 'sms', verified_at: Date.now() },
      status: 'active',
      createdAt: Date.now(),
    },
    {
      id: 'u3', username: 'bientap', password: '123',
      fullName: 'Trần Thị B',
      email: 'b@sport.vn', phone: '0900000003',
      global_role: GLOBAL_ROLES.USER,
      verified: true,
      verification: { method: 'zalo', verified_at: Date.now() },
      status: 'active',
      createdAt: Date.now(),
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ---------- CRUD user ----------
export function getAllUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

export function getUserById(id) {
  return getAllUsers().find(u => u.id === id) || null;
}

export function getUserByUsername(username) {
  return getAllUsers().find(u => u.username === username) || null;
}

// ---------- Đăng ký ----------
export function register({ username, password, fullName, email, phone }) {
  const users = getAllUsers();

  if (!username || username.length < 3)
    throw new Error('Tên đăng nhập phải từ 3 ký tự');
  if (users.find(u => u.username === username))
    throw new Error('Tên đăng nhập đã tồn tại');
  if (email && users.find(u => u.email === email))
    throw new Error('Email đã được đăng ký');
  if (phone && users.find(u => u.phone === phone))
    throw new Error('SĐT đã được đăng ký');
  if (!password || password.length < 6)
    throw new Error('Mật khẩu phải từ 6 ký tự');

  const newUser = {
    id: 'u' + Date.now(),
    username, password,
    fullName: fullName || '',
    email: email || '', phone: phone || '',
    global_role: GLOBAL_ROLES.USER,
    verified: false,
    verification: null,
    status: 'pending',  // chờ xác thực
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);

  writeLog(
    { id: newUser.id, username: newUser.username },
    'register', 'user', newUser.id, { email, phone }
  );
  return newUser;
}

/**
 * Kích hoạt tài khoản sau khi verify thành công
 */
export function activateUser(userId, verification) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx].verified = true;
  users[idx].status = 'active';
  users[idx].verification = { ...verification, verified_at: Date.now() };
  saveUsers(users);
  return users[idx];
}

// ---------- Đăng nhập ----------
export function login(username, password) {
  const user = getUserByUsername(username);

  if (!user || user.password !== password) {
    writeLog(
      { username: username || 'unknown' },
      'login_failed', 'user', null,
      { attempted_username: username }
    );
    return null;
  }

  if (user.status === 'pending')
    throw new Error('Tài khoản chưa xác thực. Vui lòng nhập mã OTP đã gửi.');
  if (user.status === 'banned')
    throw new Error('Tài khoản đã bị khóa. Liên hệ admin.');

  const session = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    global_role: user.global_role,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  writeLog(session, 'login', 'user', user.id);
  return session;
}

export function logout() {
  const u = getCurrentUser();
  if (u) writeLog(u, 'logout', 'user', u.id);
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Bắt buộc đăng nhập — chuyển hướng nếu chưa
 */
export function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Bắt buộc admin — chặn nếu không phải
 */
export function requireAdmin() {
  const u = getCurrentUser();
  if (!u || u.global_role !== GLOBAL_ROLES.ADMIN) {
    alert('Chỉ admin truy cập được trang này');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}
