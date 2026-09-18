// =========================================================
// SPORTSVN - FOOTBALL API (TheSportsDB - Miễn phí)
// API Key V1: 123 (mặc định, miễn phí)
// =========================================================

const FOOTBALL_API_KEY = '123';
const FOOTBALL_API_BASE = 'https://www.thesportsdb.com/api/v1/json';

// Cache tránh gọi API nhiều lần (5 phút)
const footballCache = {
    data: {},
    timestamps: {},
    CACHE_DURATION: 5 * 60 * 1000
};

// =========================================================
// HÀM GỌI API CHUNG
// =========================================================
async function fetchFootballAPI(endpoint) {
    const cacheKey = endpoint;
    const now = Date.now();
    
    if (footballCache.data[cacheKey] && 
        (now - footballCache.timestamps[cacheKey]) < footballCache.CACHE_DURATION) {
        console.log('📦 Cache:', endpoint);
        return footballCache.data[cacheKey];
    }
    
    try {
        const response = await fetch(`${FOOTBALL_API_BASE}/${FOOTBALL_API_KEY}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        footballCache.data[cacheKey] = data;
        footballCache.timestamps[cacheKey] = now;
        
        console.log('✅ API:', endpoint);
        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

// =========================================================
// LẤY TRẬN SẮP TỚI CỦA GIẢI
// =========================================================
async function getUpcomingMatches(leagueId = '4328') {
    const data = await fetchFootballAPI(`/eventsnextleague.php?id=${leagueId}`);
    return data.events || [];
}

// =========================================================
// LẤY TRẬN GẦN ĐÂY CỦA GIẢI
// =========================================================
async function getRecentMatches(leagueId = '4328') {
    const data = await fetchFootballAPI(`/eventspastleague.php?id=${leagueId}`);
    return data.events || [];
}

// =========================================================
// LẤY TRẬN THEO NGÀY
// =========================================================
async function getMatchesByDate(dateStr) {
    const data = await fetchFootballAPI(`/eventsday.php?d=${dateStr}&s=Soccer`);
    return data.events || [];
}

// =========================================================
// LẤY CHI TIẾT TRẬN
// =========================================================
async function getMatchDetail(eventId) {
    const data = await fetchFootballAPI(`/lookupevent.php?id=${eventId}`);
    return data.events ? data.events[0] : null;
}

// =========================================================
// LẤY BẢNG XẾP HẠNG
// =========================================================
async function getStandings(leagueId = '4328', season = '2026-2027') {
    const data = await fetchFootballAPI(`/lookuptable.php?l=${leagueId}&s=${season}`);
    return data.table || [];
}

// =========================================================
// DANH SÁCH GIẢI ĐẤU
// =========================================================
const LEAGUES = {
    '4328': { name: 'Ngoại hạng Anh', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    '4335': { name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
    '4331': { name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
    '4332': { name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
    '4334': { name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
    '4480': { name: 'Champions League', country: 'Europe', flag: '🏆' },
    '4564': { name: 'V.League 1', country: 'Vietnam', flag: '🇻🇳' }
};

// =========================================================
// HELPER: FORMAT NGÀY/GIỜ
// =========================================================
function formatMatchTime(timeStr) {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
}

function formatMatchDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

// =========================================================
// EXPORT
// =========================================================
window.FootballAPI = {
    fetchFootballAPI,
    getUpcomingMatches,
    getRecentMatches,
    getMatchesByDate,
    getMatchDetail,
    getStandings,
    formatMatchTime,
    formatMatchDate,
    LEAGUES
};

console.log('✅ TheSportsDB Football API sẵn sàng');
