/* ============================================================
   ANALYTICS TRACKER — Đếm lượt xem + người truy cập
   Dùng chung cho mọi trang: index.html, news.html, news-detail.html...
   ============================================================ */

(function () {
    'use strict';

    // ---------- 1. SESSION ID ẨN DANH (lưu localStorage) ----------
    function getSessionId() {
        const KEY = 'sportsvn_sid';
        let sid = localStorage.getItem(KEY);
        if (!sid) {
            sid = 'sid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12);
            localStorage.setItem(KEY, sid);
        }
        return sid;
    }

    // ---------- 2. HASH IP ĐƠN GIẢN (không lưu IP gốc) ----------
    async function hashIP() {
        try {
            // Dùng API công khai để lấy IP, sau đó hash
            const res  = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
            const data = await res.json();
            const raw  = (data.ip || '') + 'sportsvn_salt_2026';

            // Hash đơn giản bằng SubtleCrypto
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
            const arr = Array.from(new Uint8Array(buf));
            return arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
        } catch (e) {
            return null;
        }
    }

    // ---------- 3. XÁC ĐỊNH TÊN TRANG ----------
    function getPageName() {
        const path = window.location.pathname.toLowerCase();
        const file = path.split('/').pop() || 'index.html';

        if (file.includes('index'))       return 'home';
        if (file.includes('news-detail')) return 'news-detail';
        if (file.includes('news'))        return 'news-list';
        if (file.includes('admin'))       return 'admin';
        if (file.includes('tournament'))  return 'tournaments';
        if (file.includes('booking'))     return 'booking';
        if (file.includes('shop'))        return 'shop';
        return file.replace('.html', '');
    }

    // ---------- 4. TRACK PAGE VISIT ----------
    async function trackVisit(supabaseClient) {
        if (!supabaseClient) return;

        const sessionId = getSessionId();
        const page      = getPageName();

        // Tránh double-count trong cùng 1 tab/refresh liên tục trong 30s
        const throttleKey = 'sportsvn_lastvisit_' + page;
        const last = parseInt(localStorage.getItem(throttleKey) || '0', 10);
        if (Date.now() - last < 30000) {
            console.log('⏭️ Bỏ qua tracking (vừa track < 30s)');
            return;
        }
        localStorage.setItem(throttleKey, String(Date.now()));

        try {
            const ipHash = await hashIP();

            const { error } = await supabaseClient.rpc('log_visit', {
                p_session_id: sessionId,
                p_page:       page,
                p_path:       window.location.pathname + window.location.search,
                p_user_agent: navigator.userAgent.slice(0, 200),
                p_referrer:   (document.referrer || '').slice(0, 200),
                p_ip_hash:    ipHash
            });

            if (error) console.warn('Lỗi log_visit:', error.message);
            else console.log('✅ Đã ghi nhận lượt truy cập:', page);

        } catch (err) {
            console.warn('Lỗi tracking:', err);
        }
    }

    // ---------- 5. TRACK NEWS VIEW ----------
    async function trackNewsView(supabaseClient, newsId) {
        if (!supabaseClient || !newsId) return;

        // 1 người chỉ tính 1 view / bài / 24h
        const key = 'sportsvn_viewed_' + newsId;
        const last = parseInt(localStorage.getItem(key) || '0', 10);
        if (Date.now() - last < 24 * 60 * 60 * 1000) {
            console.log('⏭️ Bỏ qua (đã xem bài này < 24h)');
            return;
        }

        try {
            const { error } = await supabaseClient.rpc('increment_news_view', {
                news_id: newsId
            });

            if (error) console.warn('Lỗi increment_news_view:', error.message);
            else {
                localStorage.setItem(key, String(Date.now()));
                console.log('✅ Đã tăng lượt xem bài:', newsId);
            }
        } catch (err) {
            console.warn('Lỗi đếm view:', err);
        }
    }

    // ---------- 6. EXPORT ----------
    window.SportsVNAnalytics = {
        trackVisit,
        trackNewsView,
        getSessionId
    };
})();
