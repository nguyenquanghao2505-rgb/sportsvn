// ==========================================
// SPORTSVN - CẤU HÌNH MÔN THỂ THAO
// Mỗi môn có cách thức thi đấu riêng
// ==========================================

window.SPORTS_CONFIG = {

    // ⚽ BÓNG ĐÁ
    football: {
        name: 'Bóng đá',
        icon: '⚽',
        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['round-robin-even', 'round-robin-custom', 'knockout'],
        hasDraw: true,
        hasExtraTime: true,
        hasPenalty: true,
        scoringType: 'goal',
        matchDuration: 90,
        breakDuration: 15,
        periods: 2,
        teamBased: true,
        defaultTeamCount: 16,
        displayFields: ['drawType', 'hasExtraTime', 'hasPenalty', 'matchDuration']
    },

    // 🏀 BÓNG RỔ
    basketball: {
        name: 'Bóng rổ',
        icon: '🏀',
        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['round-robin-even', 'round-robin-custom', 'knockout'],
        hasDraw: false,
        hasOvertime: true,
        scoringType: 'point',
        matchDuration: 40,
        periods: 4,
        periodDuration: 10,
        teamBased: true,
        defaultTeamCount: 12,
        displayFields: ['drawType', 'hasOvertime', 'matchDuration', 'periods']
    },

    // 🏸 CẦU LÔNG
    badminton: {
        name: 'Cầu lông',
        icon: '🏸',
        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single'],
        hasDraw: false,
        scoringType: 'set',
        bestOf: 3,
        pointsPerSet: 21,
        matchDuration: 45,
        teamBased: false,
        defaultTeamCount: 16,
        categories: ['Đơn nam', 'Đơn nữ', 'Đôi nam', 'Đôi nữ', 'Đôi nam nữ'],
        displayFields: ['drawType', 'bestOf', 'pointsPerSet', 'matchDuration']
    },

    // 🎾 QUẦN VỢT
    tennis: {
        name: 'Quần vợt',
        icon: '🎾',
        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single'],
        hasDraw: false,
        scoringType: 'set',
        bestOf: 3,
        gamesPerSet: 6,
        tieBreak: true,
        matchDuration: 90,
        teamBased: false,
        defaultTeamCount: 32,
        categories: ['Đơn nam', 'Đơn nữ', 'Đôi nam', 'Đôi nữ', 'Đôi nam nữ'],
        displayFields: ['drawType', 'bestOf', 'gamesPerSet', 'tieBreak', 'matchDuration']
    },

    // 🏐 BÓNG CHUYỀN
    volleyball: {
        name: 'Bóng chuyền',
        icon: '🏐',
        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['round-robin-even', 'round-robin-custom', 'knockout'],
        hasDraw: false,
        scoringType: 'set',
        bestOf: 5,
        pointsPerSet: 25,
        matchDuration: 90,
        teamBased: true,
        defaultTeamCount: 12,
        displayFields: ['drawType', 'bestOf', 'pointsPerSet', 'matchDuration']
    },

    // 🏊 BƠI
    swimming: {
        name: 'Bơi',
        icon: '🏊',
        drawType: 'time-based',
        allowedDrawTypes: [],           // Không có bốc thăm
        hasDraw: false,
        scoringType: 'time',
        matchDuration: 5,
        teamBased: false,
        hasBracket: false,              // Không có sơ đồ đấu
        categories: ['50m tự do', '100m tự do', '200m tự do', '50m ếch', '100m ếch', '50m bướm', '50m ngửa'],
        displayFields: []
    },

    // ◉ PICKLEBALL
    pickleball: {
        name: 'Pickleball',
        icon: '◉',
        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['round-robin-even', 'round-robin-custom', 'knockout'],
        hasDraw: false,
        scoringType: 'point',
        pointsPerSet: 11,
        bestOf: 3,
        matchDuration: 45,
        teamBased: false,
        defaultTeamCount: 16,
        categories: ['Đơn nam', 'Đơn nữ', 'Đôi nam', 'Đôi nữ', 'Đôi nam nữ'],
        displayFields: ['drawType', 'bestOf', 'pointsPerSet', 'matchDuration']
    },

    // ♟️ CỜ TƯỚNG
    chess: {
        name: 'Cờ tướng',
        icon: '♟️',
        drawType: 'round-robin-single',
        allowedDrawTypes: ['round-robin-single', 'round-robin-even', 'round-robin-custom'],
        hasDraw: true,
        scoringType: 'point',
        winPoints: 1,
        drawPoints: 0.5,
        lossPoints: 0,
        matchDuration: 60,
        extraTime: 30,
        teamBased: false,
        defaultTeamCount: 16,
        displayFields: ['drawType', 'winPoints', 'drawPoints', 'matchDuration']
    },

    // 🥋 VÕ THUẬT
    martial_arts: {
        name: 'Võ thuật',
        icon: '🥋',
        drawType: 'knockout',
        allowedDrawTypes: ['knockout'],
        hasDraw: false,
        scoringType: 'point',
        matchDuration: 9,
        periods: 3,
        periodDuration: 3,
        breakDuration: 1,
        teamBased: false,
        hasWeightClasses: true,
        defaultTeamCount: 16,
        displayFields: ['drawType', 'periods', 'periodDuration', 'hasWeightClasses']
    },

    // 🏃 ĐIỀN KINH
    athletics: {
        name: 'Điền kinh',
        icon: '🏃',
        drawType: 'multi-round',
        allowedDrawTypes: [],           // Không có bốc thăm kiểu đối kháng
        hasDraw: false,
        scoringType: 'time',
        matchDuration: 10,
        teamBased: false,
        hasBracket: false,
        categories: ['100m', '200m', '400m', '800m', '1500m', 'Nhảy cao', 'Nhảy xa', 'Ném lao', 'Đẩy tạ'],
        displayFields: []
    }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Lấy config của môn
window.getSportConfig = function(sportCode) {
    if (!sportCode) return null;
    return window.SPORTS_CONFIG[sportCode] || null;
};

// Lấy danh sách môn
window.getAllSports = function() {
    return Object.keys(window.SPORTS_CONFIG).map(code => ({
        code: code,
        ...window.SPORTS_CONFIG[code]
    }));
};

// Kiểm tra thể thức có được phép không
window.isDrawTypeAllowed = function(sportCode, drawType) {
    const config = window.getSportConfig(sportCode);
    if (!config) return true;
    if (!config.allowedDrawTypes) return true;
    if (config.allowedDrawTypes.length === 0) return false;
    return config.allowedDrawTypes.includes(drawType);
};

// Format hiển thị cấu hình của môn
window.formatSportConfig = function(sportCode) {
    const config = window.getSportConfig(sportCode);
    if (!config) return '';

    const lines = [];
    lines.push(`${config.icon} ${config.name}`);

    if (config.bestOf) lines.push(`Best of ${config.bestOf}`);
    if (config.pointsPerSet) lines.push(`${config.pointsPerSet} điểm/set`);
    if (config.gamesPerSet) lines.push(`${config.gamesPerSet} game/set`);
    if (config.matchDuration) lines.push(`${config.matchDuration} phút/trận`);
    if (config.periods) lines.push(`${config.periods} hiệp`);
    if (config.hasDraw) lines.push(`Có hòa`);
    if (config.hasPenalty) lines.push(`Luân lưu`);
    if (config.hasExtraTime) lines.push(`Hiệp phụ`);

    return lines.join(' · ');
};

console.log('✅ sports-config.js loaded -', Object.keys(window.SPORTS_CONFIG).length, 'môn thể thao');
