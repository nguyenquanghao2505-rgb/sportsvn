// ============================================================
// auth.js — Xác thực & Quản lý phiên (Supabase Auth + RBAC)
// ============================================================

import { hasPermission, hasRole, ROLES } from './rbac.js';

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;

// ============================================================
// KHỞI TẠO
// ============================================================
export function initAuth() {
    const config = window.SPORTSVN_CONFIG || {};
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
        throw new Error('Chưa cấu hình Supabase trong config.js');
    }
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(
            config.SUPABASE_URL,
            config.SUPABASE_ANON_KEY
        );
        window.supabaseClient = supabaseClient;
    }
    return supabaseClient;
}

export function getSupabase() {
    if (!supabaseClient) initAuth();
    return supabaseClient;
}

// ============================================================
// LOAD PROFILE
// ============================================================
export async function loadUserProfile() {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        currentUser = null;
        currentProfile = null;
        return null;
    }

    currentUser = session.user;

    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        // Fallback nếu chưa có profile trong bảng users
        currentProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email,
            role: 'employee',
            status: 'active',
        };
    } else {
        currentProfile = profile;
    }

    // Cache vào localStorage
    localStorage.setItem('userRole', currentProfile.role);
    localStorage.setItem('userId', currentProfile.id);
    localStorage.setItem('userProfile', JSON.stringify(currentProfile));

    return currentProfile;
}

// ============================================================
// GETTERS
// ============================================================
export function getCurrentUser()    { return currentUser; }
export function getCurrentProfile() { return currentProfile; }
export function getCurrentRole()    { return currentProfile?.role || null; }
export function isLoggedIn()        { return !!currentUser; }

// ============================================================
// ĐĂNG NHẬP / ĐĂNG XUẤT / ĐĂNG KÝ
// ============================================================
export async function login(email, password) {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
    });

    if (error) throw new Error(error.message);

    await loadUserProfile();

    if (currentProfile.status === 'suspended') {
        await supabase.auth.signOut();
        throw new Error('Tài khoản đã bị khóa. Liên hệ admin.');
    }

    return currentProfile;
}

export async function logout() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    currentUser = null;
    currentProfile = null;
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfile');
}

export async function register({ email, password, fullName, phone }) {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
            data: {
                full_name: fullName || '',
                phone: phone || '',
            }
        }
    });

    if (error) throw new Error(error.message);
    return data.user;
}

// ============================================================
// BẢO VỆ TRANG
// ============================================================
export async function requireLogin() {
    const profile = await loadUserProfile();
    if (!profile) {
        window.location.href = 'login.html';
        return null;
    }
    return profile;
}

export async function requireRole(roles) {
    const profile = await requireLogin();
    if (!profile) return null;

    if (!hasRole(profile, roles)) {
        alert('⛔ Bạn không có quyền truy cập trang này');
        window.location.href = 'index.html';
        return null;
    }
    return profile;
}

export async function requirePermission(action) {
    const profile = await requireLogin();
    if (!profile) return null;

    if (!hasPermission(profile, action)) {
        alert('⛔ Bạn không có quyền thực hiện hành động này');
        return null;
    }
    return profile;
}

// ============================================================
// LẮNG NGHE THAY ĐỔI AUTH
// ============================================================
export function onAuthChange(callback) {
    const supabase = getSupabase();
    return supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await loadUserProfile();
            if (callback) callback(currentProfile);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            currentProfile = null;
            if (callback) callback(null);
        }
    });
}

export { hasPermission, hasRole, ROLES };
