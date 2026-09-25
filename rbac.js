// ============================================================
// rbac.js — Role-Based Access Control (Ma trận phân quyền)
// File này ĐỊNH NGHĨA luật chơi. Không chứa logic nghiệp vụ.
// ============================================================

// ---------- 1. ĐỊNH NGHĨA ROLE TOÀN CỤC ----------
export const GLOBAL_ROLES = {
  GUEST: 'guest',   // khách chưa đăng nhập
  USER:  'user',    // user đã xác thực
  ADMIN: 'admin',   // quản trị hệ thống
};

// ---------- 2. PERMISSION TOÀN CỤC ----------
// Mỗi role có danh sách permission. '*' = toàn quyền.
export const PERMISSIONS = {
  [GLOBAL_ROLES.GUEST]: [
    'view_tournaments',
    'view_articles',
  ],
  [GLOBAL_ROLES.USER]: [
    'view_tournaments',
    'view_articles',
    'create_tournament',     // tạo giải → tự thành OWNER
    'create_article',        // đăng bài
  ],
  [GLOBAL_ROLES.ADMIN]: [
    '*',                     // wildcard = mọi quyền
  ],
};

/**
 * Kiểm tra user có permission toàn cục không
 * @param {Object|null} user - { id, username, global_role }
 * @param {string} permission
 * @returns {boolean}
 */
export function can(user, permission) {
  if (!user) return false;
  const role = user.global_role || GLOBAL_ROLES.GUEST;
  const perms = PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
}

/**
 * Có phải admin toàn hệ thống?
 */
export function isAdmin(user) {
  return !!user && user.global_role === GLOBAL_ROLES.ADMIN;
}

/**
 * Đã đăng nhập chưa?
 */
export function isLoggedIn(user) {
  return !!user && !!user.id;
}

// ---------- 3. RE-EXPORT từ tournament-members ----------
// (sẽ có sau ở GĐ 5). Tạm để comment.
// export { canInTournament, getRoleInTournament } from './tournament-members.js';
