// =========================================================
// SPORTSVN - CẤU HÌNH MÔN THỂ THAO
// Mỗi môn có cách thức thi đấu riêng
// =========================================================

window.SPORTS_CONFIG = {

    // ================================================================
    // 🏸 CẦU LÔNG
    // ================================================================
    badminton: {
        name: 'Cầu lông',
        icon: '🏸',
        category: 'racket',
        teamBased: false,

        // Thể thức
        drawType: 'knockout',
        allowedDrawTypes: [
            'knockout',
            'round-robin-single',
            'round-robin-even',
            'round-robin-custom'
        ],

        // Luật thi đấu
        scoringType: 'set',
        bestOf: 3,
        pointsPerSet: 21,
        maxPointsPerSet: 30,
        winByTwo: true,
        changeEndsAt: 11,

        // Thời gian
        matchDuration: 45,
        breakBetweenSets: 60,
        breakBetweenSets23: 120,

        // Số VĐV mặc định
        defaultTeamCount: 16,

        // Nội dung gợi ý (CHỈ LÀ GỢI Ý — admin có thể bỏ qua và tự thêm)
        suggestedCategories: [
            'Đơn nam', 'Đơn nữ',
            'Đôi nam', 'Đôi nữ', 'Đôi nam nữ',
            'Đồng đội nam', 'Đồng đội nữ',
            'U10 Đơn nam', 'U10 Đơn nữ',
            'U11 Đơn nam', 'U11 Đơn nữ',
            'U13 Đơn nam', 'U13 Đơn nữ',
            'U15 Đơn nam', 'U15 Đơn nữ',
            'U17 Đơn nam', 'U17 Đơn nữ',
            'U18 Đơn nam', 'U18 Đơn nữ',
            'U21 Đơn nam', 'U21 Đơn nữ',
            'U35 Đơn nam', 'U35 Đơn nữ',
            'U35 Đôi nam', 'U35 Đôi nữ',
            'U40 Đôi nam', 'U40 Đôi nữ',
            'U45 Đôi nam nữ',
            'U50 Đôi nam nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                bestThirds: 0,
                tieBreaker: ['head_to_head', 'point_diff', 'points_for', 'wins']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: true,
            byeForSeeds: true
        },

        scheduleRules: {
            minRestBetweenMatches: 90,
            finalRoundsDay: 'last',
            semiFinalSession: 'morning',
            finalSession: 'afternoon',
            thirdPlaceSession: 'afternoon',
            thirdPlaceBeforeFinal: true
        },

        displayFields: ['drawType', 'bestOf', 'pointsPerSet', 'matchDuration']
    },

    // ================================================================
    // ⚽ BÓNG ĐÁ
    // ================================================================
    football: {
        name: 'Bóng đá',
        icon: '⚽',
        category: 'ball',
        teamBased: true,

        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['round-robin-even', 'round-robin-custom', 'knockout'],

        hasDraw: true,
        hasExtraTime: true,
        hasPenalty: true,
        scoringType: 'goal',
        matchDuration: 90,
        breakDuration: 15,
        periods: 2,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam', 'Nữ',
            'U15 Nam', 'U15 Nữ',
            'U17 Nam', 'U17 Nữ',
            'U18 Nam', 'U18 Nữ',
            'U21 Nam', 'U21 Nữ',
            'Futsal Nam', 'Futsal Nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'goal_diff', 'goals_for', 'fair_play']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: true
        },

        scheduleRules: {
            minRestBetweenMatches: 120,
            finalRoundsDay: 'last',
            semiFinalSession: 'morning',
            finalSession: 'afternoon'
        },

        displayFields: ['drawType', 'periods', 'matchDuration', 'hasExtraTime', 'hasPenalty']
    },

    // ================================================================
    // 🏀 BÓNG RỔ
    // ================================================================
    basketball: {
        name: 'Bóng rổ',
        icon: '🏀',
        category: 'ball',
        teamBased: true,

        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['round-robin-even', 'round-robin-custom', 'knockout'],

        hasDraw: false,
        hasOvertime: true,
        scoringType: 'point',
        matchDuration: 40,
        periods: 4,
        periodDuration: 10,

        defaultTeamCount: 12,

        suggestedCategories: [
            'Nam 5x5', 'Nữ 5x5',
            'Nam 3x3', 'Nữ 3x3',
            'U16 Nam', 'U16 Nữ',
            'U18 Nam', 'U18 Nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: false,
                thirdPlace: false,
                bestRunnersUp: 2,
                tieBreaker: ['point_diff', 'points_for', 'head_to_head']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: false
        },

        scheduleRules: {
            minRestBetweenMatches: 120,
            finalRoundsDay: 'last',
            semiFinalSession: 'morning',
            finalSession: 'afternoon'
        },

        displayFields: ['drawType', 'periods', 'matchDuration']
    },

    // ================================================================
    // 🎾 QUẦN VỢT
    // ================================================================
    tennis: {
        name: 'Quần vợt',
        icon: '🎾',
        category: 'racket',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single', 'round-robin-even', 'round-robin-custom'],

        hasDraw: false,
        scoringType: 'set',
        bestOf: 3,
        gamesPerSet: 6,
        tieBreak: true,
        matchDuration: 90,

        defaultTeamCount: 32,

        suggestedCategories: [
            'Đơn nam', 'Đơn nữ',
            'Đôi nam', 'Đôi nữ', 'Đôi nam nữ',
            'Đồng đội nam', 'Đồng đội nữ',
            'U14 Đơn nam', 'U14 Đơn nữ',
            'U16 Đơn nam', 'U16 Đơn nữ',
            'U18 Đơn nam', 'U18 Đơn nữ',
            'U35 Đơn nam', 'U35 Đơn nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'set_diff', 'game_diff']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: true
        },

        scheduleRules: {
            minRestBetweenMatches: 90,
            finalRoundsDay: 'last',
            semiFinalSession: 'morning',
            finalSession: 'afternoon'
        },

        displayFields: ['drawType', 'bestOf', 'gamesPerSet', 'matchDuration']
    },

    // ================================================================
    // 🏐 BÓNG CHUYỀN
    // ================================================================
    volleyball: {
        name: 'Bóng chuyền',
        icon: '🏐',
        category: 'ball',
        teamBased: true,

        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['round-robin-even', 'round-robin-custom', 'knockout'],

        hasDraw: false,
        scoringType: 'set',
        bestOf: 5,
        pointsPerSet: 25,
        matchDuration: 90,

        defaultTeamCount: 12,

        suggestedCategories: [
            'Nam', 'Nữ',
            'Nam trẻ', 'Nữ trẻ',
            'U18 Nam', 'U18 Nữ',
            'Bãi biển Nam', 'Bãi biển Nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'set_ratio', 'point_ratio']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: true
        },

        scheduleRules: {
            minRestBetweenMatches: 90,
            finalRoundsDay: 'last'
        },

        displayFields: ['drawType', 'bestOf', 'pointsPerSet', 'matchDuration']
    },

    // ================================================================
    // ◉ PICKLEBALL
    // ================================================================
    pickleball: {
        name: 'Pickleball',
        icon: '◉',
        category: 'racket',
        teamBased: false,

        drawType: 'round-robin-knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single', 'round-robin-even', 'round-robin-custom'],

        hasDraw: false,
        scoringType: 'point',
        pointsPerSet: 11,
        bestOf: 3,
        winByTwo: true,
        matchDuration: 45,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Đơn nam', 'Đơn nữ',
            'Đôi nam', 'Đôi nữ', 'Đôi nam nữ',
            'U16 Đơn nam', 'U16 Đơn nữ',
            'U35 Đôi nam', 'U35 Đôi nữ',
            'U45 Đôi nam', 'U45 Đôi nữ',
            'U50 Đôi nam nữ',
            'Đồng đội nam', 'Đồng đội nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'point_diff', 'points_for']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: true
        },

        scheduleRules: {
            minRestBetweenMatches: 60,
            finalRoundsDay: 'last'
        },

        displayFields: ['drawType', 'bestOf', 'pointsPerSet', 'matchDuration']
    },

    // ================================================================
    // ♟️ CỜ TƯỚNG
    // ================================================================
    chess: {
        name: 'Cờ tướng',
        icon: '♟️',
        category: 'mind',
        teamBased: false,

        drawType: 'round-robin-single',
        allowedDrawTypes: ['round-robin-single', 'round-robin-even', 'round-robin-custom', 'swiss'],

        hasDraw: true,
        scoringType: 'point',
        winPoints: 1,
        drawPoints: 0.5,
        lossPoints: 0,
        matchDuration: 60,
        extraTime: 30,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam', 'Nữ',
            'Đồng đội nam', 'Đồng đội nữ',
            'U12 Nam', 'U12 Nữ',
            'U15 Nam', 'U15 Nữ',
            'U18 Nam', 'U18 Nữ',
            'U35 Nam', 'U35 Nữ',
            'U50 Nam', 'U50 Nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: true,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'wins', 'buchholz']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: false
        },

        scheduleRules: {
            minRestBetweenMatches: 30,
            finalRoundsDay: 'last'
        },

        displayFields: ['drawType', 'winPoints', 'drawPoints', 'matchDuration']
    },

    // ================================================================
    // 🥋 VÕ THUẬT
    // ================================================================
    martial_arts: {
        name: 'Võ thuật',
        icon: '🥋',
        category: 'combat',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 9,
        periods: 3,
        periodDuration: 3,
        breakDuration: 1,

        hasWeightClasses: true,
        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam 45kg', 'Nam 50kg', 'Nam 55kg', 'Nam 60kg',
            'Nam 65kg', 'Nam 70kg', 'Nam 75kg', 'Nam 80kg',
            'Nữ 45kg', 'Nữ 50kg', 'Nữ 55kg', 'Nữ 60kg',
            'Nữ 65kg', 'Nữ 70kg',
            'U16 Nam', 'U16 Nữ',
            'U18 Nam', 'U18 Nữ',
            'Đồng đội Nam', 'Đồng đội Nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: false,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'wins', 'point_diff']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: true
        },

        scheduleRules: {
            minRestBetweenMatches: 30,
            finalRoundsDay: 'last'
        },

        displayFields: ['drawType', 'periods', 'periodDuration', 'hasWeightClasses']
    },

    // ================================================================
    // 🏊 BƠI
    // ================================================================
    swimming: {
        name: 'Bơi',
        icon: '🏊',
        category: 'water',
        teamBased: false,

        drawType: 'time-based',
        allowedDrawTypes: [],

        hasDraw: false,
        hasBracket: false,
        scoringType: 'time',
        matchDuration: 5,

        defaultTeamCount: 8,

        suggestedCategories: [
            '50m tự do Nam', '50m tự do Nữ',
            '100m tự do Nam', '100m tự do Nữ',
            '200m tự do Nam', '200m tự do Nữ',
            '400m tự do Nam', '400m tự do Nữ',
            '50m ếch Nam', '50m ếch Nữ',
            '100m ếch Nam', '100m ếch Nữ',
            '50m bướm Nam', '50m bướm Nữ',
            '100m bướm Nam', '100m bướm Nữ',
            '50m ngửa Nam', '50m ngửa Nữ',
            '100m ngửa Nam', '100m ngửa Nữ',
            'Tiếp sức 4x50m Nam', 'Tiếp sức 4x50m Nữ',
            'Tiếp sức 4x100m Nam', 'Tiếp sức 4x100m Nữ'
        ],

        qualifyRules: {
            timeBased: {
                advanceTop: 8,
                tieBreaker: ['time']
            }
        },

        bracketRules: {
            sizeFormula: 'none',
            thirdPlaceMatch: false
        },

        scheduleRules: {
            minRestBetweenMatches: 30,
            finalRoundsDay: 'last'
        },

        displayFields: []
    },

    // ================================================================
    // 🏃 ĐIỀN KINH
    // ================================================================
    athletics: {
        name: 'Điền kinh',
        icon: '🏃',
        category: 'track',
        teamBased: false,

        drawType: 'time-based',
        allowedDrawTypes: [],

        hasDraw: false,
        hasBracket: false,
        scoringType: 'time',
        matchDuration: 10,

        defaultTeamCount: 8,

        suggestedCategories: [
            '100m Nam', '100m Nữ',
            '200m Nam', '200m Nữ',
            '400m Nam', '400m Nữ',
            '800m Nam', '800m Nữ',
            '1500m Nam', '1500m Nữ',
            '5000m Nam', '5000m Nữ',
            'Nhảy cao Nam', 'Nhảy cao Nữ',
            'Nhảy xa Nam', 'Nhảy xa Nữ',
            'Nhảy ba bước Nam', 'Nhảy ba bước Nữ',
            'Ném lao Nam', 'Ném lao Nữ',
            'Đẩy tạ Nam', 'Đẩy tạ Nữ',
            'Ném đĩa Nam', 'Ném đĩa Nữ',
            'Tiếp sức 4x100m Nam', 'Tiếp sức 4x100m Nữ'
        ],

        qualifyRules: {
            timeBased: {
                advanceTop: 8,
                tieBreaker: ['time', 'distance']
            }
        },

        bracketRules: {
            sizeFormula: 'none',
            thirdPlaceMatch: false
        },

        scheduleRules: {
            minRestBetweenMatches: 30,
            finalRoundsDay: 'last'
        },

        displayFields: []
    }
};


// =========================================================
// HELPER FUNCTIONS
// =========================================================

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

// ✅ Tính bracket size (lũy thừa 2 gần nhất ≥ số đội)
window.calculateBracketSize = function(numTeams) {
    if (numTeams <= 1) return 2;
    let bracket = 2;
    while (bracket < numTeams) bracket *= 2;
    return bracket;
};

// ✅ Tính số BYE
window.calculateByes = function(numTeams) {
    return window.calculateBracketSize(numTeams) - numTeams;
};

// ✅ Format hiển thị cấu hình môn
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

// ✅ Lấy danh sách nội dung gợi ý cho môn
window.getSuggestedCategories = function(sportCode) {
    const config = window.getSportConfig(sportCode);
    if (!config) return [];
    return config.suggestedCategories || [];
};

console.log('✅ sports-config.js loaded -', Object.keys(window.SPORTS_CONFIG).length, 'môn thể thao');
