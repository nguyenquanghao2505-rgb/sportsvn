// =========================================================
// SPORTSVN - FOOTBALL API (TheSportsDB - Miễn phí)
// =========================================================

const FOOTBALL_API_KEY = '123';
const FOOTBALL_API_BASE = 'https://www.thesportsdb.com/api/v1/json';

const footballCache = {
    data: {},
    timestamps: {},
    CACHE_DURATION: 5 * 60 * 1000
};

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

async function getUpcomingMatches(leagueId = '4328') {
    const data = await fetchFootballAPI(`/eventsnextleague.php?id=${leagueId}`);
    return data.events || [];
}

async function getRecentMatches(leagueId = '4328') {
    const data = await fetchFootballAPI(`/eventspastleague.php?id=${leagueId}`);
    return data.events || [];
}

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

const LEAGUES = {
    '4328': { name: 'Ngoại hạng Anh', flag: '🏴' },
    '4335': { name: 'La Liga', flag: '🇪🇸' },
    '4331': { name: 'Bundesliga', flag: '🇩🇪' },
    '4332': { name: 'Serie A', flag: '🇮🇹' },
    '4334': { name: 'Ligue 1', flag: '🇫🇷' },
    '4480': { name: 'Champions League', flag: '🏆' },
    '4564': { name: 'V.League 1', flag: '🇻🇳' }
};

window.FootballAPI = {
    fetchFootballAPI,
    getUpcomingMatches,
    getRecentMatches,
    formatMatchTime,
    formatMatchDate,
    LEAGUES
};

console.log('✅ TheSportsDB Football API sẵn sàng');
