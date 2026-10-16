// ============================================================
// rbac.js — Role-Based Access Control
// Định nghĩa roles và permissions cho hệ thống SportsVN
// ============================================================

export const ROLES = {
    ADMIN:    'admin',
    MANAGER:  'manager',
    EMPLOYEE: 'employee',
    EDITOR:   'editor',
};

export const ROLE_LABELS = {
    admin:    { name: 'Giám đốc',      icon: '👑', color: '#dc2626', bg: '#fee2e2' },
    manager:  { name: 'Trưởng phòng',  icon: '🎖️', color: '#d97706', bg: '#fef3c7' },
    employee: { name: 'Nhân viên',     icon: '👤', color: '#1769ff', bg: '#dbeafe' },
    editor:   { name: 'Cộng tác viên', icon: '✍️', color: '#059669', bg: '#d1fae5' },
};

export const PERMISSIONS = {
    // --- Quản lý người dùng ---
    USER_CREATE:          ['admin'],
    USER_EDIT:            ['admin'],
    USER_DELETE:          ['admin'],
    USER_VIEW_ALL:        ['admin', 'manager'],
    USER_CHANGE_ROLE:     ['admin'],

    // --- Giải đấu ---
    TOURNAMENT_CREATE:    ['admin', 'manager', 'employee'],
    TOURNAMENT_EDIT_ALL:  ['admin', 'manager'],
    TOURNAMENT_EDIT_OWN:  ['admin', 'manager', 'employee'],
    TOURNAMENT_DELETE:    ['admin'],
    TOURNAMENT_VIEW_ALL:  ['admin', 'manager'],

    // --- Tin tức / Bài viết ---
    NEWS_CREATE:          ['admin', 'manager', 'editor'],
    NEWS_EDIT_ALL:        ['admin', 'manager'],
    NEWS_EDIT_OWN:        ['admin', 'manager', 'editor'],
    NEWS_DELETE:          ['admin', 'manager'],

    // --- Video ---
    VIDEO_CREATE:         ['admin', 'manager', 'editor'],
    VIDEO_DELETE:         ['admin', 'manager'],

    // --- Shop ---
    SHOP_APPROVE:         ['admin', 'manager'],
    SHOP_DELETE:          ['admin'],

    // --- Đơn hàng ---
    ORDER_VIEW:           ['admin', 'manager'],
    ORDER_UPDATE:         ['admin', 'manager'],
    ORDER_DELETE:         ['admin'],

    // --- Analytics ---
    ANALYTICS_VIEW:       ['admin', 'manager'],

    // --- Hệ thống ---
    SYSTEM_SETTINGS:      ['admin'],
};

/**
 * Kiểm tra user có quyền thực hiện action không
 * @param {Object} user - { role: 'admin' | 'manager' | ... }
 * @param {string} action - Tên quyền (VD: 'USER_CREATE')
 */
export function hasPermission(user, action) {
    if (!user || !user.role) return false;
    const allowed = PERMISSIONS[action];
    if (!allowed) return false;
    return allowed.includes(user.role);
}

/**
 * Kiểm tra user có role trong danh sách không
 */
export function hasRole(user, roles) {
    if (!user || !user.role) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(user.role);
}

/**
 * Cấp bậc (cao hơn = quyền cao hơn)
 */
export function getRoleLevel(role) {
    const levels = { admin: 4, manager: 3, employee: 2, editor: 1 };
    return levels[role] || 0;
}
