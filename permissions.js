// ============================================================
// permissions.js — Helper kiểm tra quyền dùng chung
// Nhúng vào mọi trang để ẩn/hiện UI theo role
// ============================================================

import { hasPermission, hasRole, ROLES, ROLE_LABELS } from './rbac.js';

let cachedProfile = null;

/**
 * Lấy profile hiện tại (từ cache localStorage)
 */
export function getProfile() {
    if (cachedProfile) return cachedProfile;
    const raw = localStorage.getItem('userProfile');
    cachedProfile = raw ? JSON.parse(raw) : null;
    return cachedProfile;
}

/**
 * Refresh profile từ Supabase
 */
export async function refreshProfile() {
    const supabase = window.supabaseClient;
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (profile) {
        cachedProfile = profile;
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('userRole', profile.role);
    }
    return profile;
}

/**
 * Kiểm tra quyền
 */
export function can(action) {
    return hasPermission(getProfile(), action);
}

export function isRole(roles) {
    return hasRole(getProfile(), roles);
}

export function isAdmin()    { return getProfile()?.role === ROLES.ADMIN; }
export function isManager()  { return getProfile()?.role === ROLES.MANAGER; }
export function isEmployee() { return getProfile()?.role === ROLES.EMPLOYEE; }
export function isEditor()   { return getProfile()?.role === ROLES.EDITOR; }

/**
 * Ẩn/hiện element theo quyền
 * Cách dùng: <div data-require="USER_CREATE">...</div>
 */
export function applyPermissions() {
    document.querySelectorAll('[data-require]').forEach(el => {
        const action = el.getAttribute('data-require');
        el.style.display = can(action) ? '' : 'none';
    });

    document.querySelectorAll('[data-require-role]').forEach(el => {
        const roles = el.getAttribute('data-require-role').split(',');
        el.style.display = isRole(roles) ? '' : 'none';
    });
}

/**
 * Render badge role
 */
export function renderRoleBadge(role) {
    const info = ROLE_LABELS[role] || { name: role, icon: '?', color: '#666', bg: '#eee' };
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:800;background:${info.bg};color:${info.color};">${info.icon} ${info.name}</span>`;
}

/**
 * Hiển thị thông tin user lên UI
 */
export function renderUserInfo() {
    const profile = getProfile();
    if (!profile) return;

    const name = profile.full_name || profile.email?.split('@')[0] || 'User';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    document.querySelectorAll('.top-avatar, .avatar').forEach(el => el.textContent = initials);
    document.querySelectorAll('.top-user-info strong, .user-info strong').forEach(el => el.textContent = name);
    document.querySelectorAll('.top-user-info span, .user-info span').forEach(el => {
        const info = ROLE_LABELS[profile.role];
        el.textContent = info ? info.name : profile.role;
    });
}

// Auto-apply khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    applyPermissions();
    renderUserInfo();
});
