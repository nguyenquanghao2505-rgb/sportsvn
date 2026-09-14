/*
============================================================
SPORTSVN - CONFIG.JS
Cấu hình Supabase cho toàn bộ hệ thống SportsVN
============================================================
*/

window.SPORTSVN_CONFIG = {
    // ==========================================
    // URL Supabase - ĐÚNG 100% (không sửa)
    // 3 ký tự cuối là "kggk" - KHÔNG phải "kgkg"
    // ==========================================
    SUPABASE_URL: 'https://bqzjksmsdtnodcfykggk.supabase.co',

    // ==========================================
    // Legacy anon key (KHÔNG phải publishable key)
    // ==========================================
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxemprc21zZHRub2RjZnlrZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzkwNTYsImV4cCI6MjEwMjk1NTA1Nn0.nmIhW8qg547V9vcoUCuX8alDIrxH14hkr8nKMRPwLhE',

    // ==========================================
    // Thông tin liên hệ
    // ==========================================
    CONTACT_NAME: 'Nguyễn Quang Hảo',
    CONTACT_PHONE: '0905.771.177',
    CONTACT_EMAIL: 'nguyenquanghao2505@gmail.com',
    WEBSITE: 'https://sportsvn.com',

    // ==========================================
    // Thông tin ngân hàng
    // ==========================================
    BANK_NAME: 'Vietcombank',
    BANK_ACCOUNT_NAME: 'Nguyễn Quang Hảo',
    BANK_ACCOUNT_NUMBER: '1234567890',
    BANK_BRANCH: '',

    // ==========================================
    // Thông tin khác
    // ==========================================
    SITE_NAME: 'SportsVN',
    SITE_DESCRIPTION: 'Nền tảng quản lý giải thể thao Việt Nam',
    VERSION: '1.0.0'
};

console.log('✅ SportsVN config loaded:', {
    url: window.SPORTSVN_CONFIG.SUPABASE_URL,
    hasKey: Boolean(window.SPORTSVN_CONFIG.SUPABASE_ANON_KEY)
});
