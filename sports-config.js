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

        drawType: 'knockout',
        allowedDrawTypes: [
            'knockout',
            'round-robin-single',
            'round-robin-even',
            'round-robin-custom'
        ],

        scoringType: 'set',
        bestOf: 3,
        pointsPerSet: 21,
        maxPointsPerSet: 30,
        winByTwo: true,
        changeEndsAt: 11,

        matchDuration: 45,
        breakBetweenSets: 60,
        breakBetweenSets23: 120,

        defaultTeamCount: 16,

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
    },

    // ================================================================
    // 🏓 BÓNG BÀN
    // ================================================================
    table_tennis: {
        name: 'Bóng bàn',
        icon: '🏓',
        category: 'racket',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single', 'round-robin-even', 'round-robin-custom'],

        hasDraw: false,
        scoringType: 'set',
        bestOf: 5,
        pointsPerSet: 11,
        winByTwo: true,
        matchDuration: 30,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Đơn nam', 'Đơn nữ',
            'Đôi nam', 'Đôi nữ', 'Đôi nam nữ',
            'Đồng đội nam', 'Đồng đội nữ',
            'U11 Đơn nam', 'U11 Đơn nữ',
            'U13 Đơn nam', 'U13 Đơn nữ',
            'U15 Đơn nam', 'U15 Đơn nữ',
            'U18 Đơn nam', 'U18 Đơn nữ',
            'U35 Đơn nam', 'U35 Đơn nữ',
            'U45 Đơn nam', 'U45 Đơn nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'set_diff', 'point_diff']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: true
        },

        scheduleRules: {
            minRestBetweenMatches: 45,
            finalRoundsDay: 'last'
        },

        displayFields: ['drawType', 'bestOf', 'pointsPerSet', 'matchDuration']
    },

    // ================================================================
    // 🥋 TAEKWONDO
    // ================================================================
    taekwondo: {
        name: 'Taekwondo',
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
            'Quyền Nam', 'Quyền Nữ',
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
    // 🥋 KARATE
    // ================================================================
    karate: {
        name: 'Karate',
        icon: '🥋',
        category: 'combat',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 6,
        periods: 1,

        hasWeightClasses: true,
        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam 55kg', 'Nam 60kg', 'Nam 65kg', 'Nam 70kg',
            'Nam 75kg', 'Nam 80kg',
            'Nữ 50kg', 'Nữ 55kg', 'Nữ 60kg', 'Nữ 65kg',
            'Kata Nam', 'Kata Nữ',
            'Kumite Nam', 'Kumite Nữ',
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

        displayFields: ['drawType', 'matchDuration', 'hasWeightClasses']
    },

    // ================================================================
    // 🥋 VOVINAM
    // ================================================================
    vovinam: {
        name: 'Vovinam',
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
            'Nam 65kg', 'Nam 70kg',
            'Nữ 45kg', 'Nữ 50kg', 'Nữ 55kg', 'Nữ 60kg',
            'Quyền Nam', 'Quyền Nữ',
            'Đối kháng Nam', 'Đối kháng Nữ',
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
    // 🥋 JUDO
    // ================================================================
    judo: {
        name: 'Judo',
        icon: '🥋',
        category: 'combat',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 5,

        hasWeightClasses: true,
        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam 60kg', 'Nam 66kg', 'Nam 73kg', 'Nam 81kg',
            'Nam 90kg', 'Nam 100kg',
            'Nữ 48kg', 'Nữ 52kg', 'Nữ 57kg', 'Nữ 63kg',
            'Nữ 70kg', 'Nữ 78kg',
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

        displayFields: ['drawType', 'matchDuration', 'hasWeightClasses']
    },

    // ================================================================
    // 🥊 BOXING
    // ================================================================
    boxing: {
        name: 'Boxing',
        icon: '🥊',
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
            'Nam 48kg', 'Nam 51kg', 'Nam 54kg', 'Nam 57kg',
            'Nam 60kg', 'Nam 63kg', 'Nam 67kg', 'Nam 71kg',
            'Nam 75kg', 'Nam 80kg', 'Nam 86kg', 'Nam 92kg',
            'Nữ 48kg', 'Nữ 51kg', 'Nữ 54kg', 'Nữ 57kg',
            'Nữ 60kg', 'Nữ 64kg', 'Nữ 69kg', 'Nữ 75kg'
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
    // 🥊 MUAY THÁI
    // ================================================================
    muay_thai: {
        name: 'Muay Thái',
        icon: '🥊',
        category: 'combat',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 9,
        periods: 3,
        periodDuration: 3,
        breakDuration: 2,

        hasWeightClasses: true,
        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam 45kg', 'Nam 48kg', 'Nam 51kg', 'Nam 54kg',
            'Nam 57kg', 'Nam 60kg', 'Nam 63kg', 'Nam 67kg',
            'Nam 71kg', 'Nam 75kg', 'Nam 81kg',
            'Nữ 45kg', 'Nữ 48kg', 'Nữ 51kg', 'Nữ 54kg',
            'Nữ 57kg', 'Nữ 60kg', 'Nữ 63kg'
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
    // 🤼 VẬT
    // ================================================================
    wrestling: {
        name: 'Vật',
        icon: '🤼',
        category: 'combat',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 6,
        periods: 2,
        periodDuration: 3,
        breakDuration: 1,

        hasWeightClasses: true,
        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam 57kg', 'Nam 61kg', 'Nam 65kg', 'Nam 70kg',
            'Nam 74kg', 'Nam 79kg', 'Nam 86kg', 'Nam 92kg',
            'Nam 97kg', 'Nam 125kg',
            'Nữ 50kg', 'Nữ 53kg', 'Nữ 57kg', 'Nữ 62kg',
            'Nữ 68kg', 'Nữ 76kg'
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
    // 🎱 BI SẮT (PETANQUE)
    // ================================================================
    petanque: {
        name: 'Bi sắt',
        icon: '🎱',
        category: 'precision',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single', 'round-robin-even'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 60,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Đơn nam', 'Đơn nữ',
            'Đôi nam', 'Đôi nữ', 'Đôi nam nữ',
            'Ba nam', 'Ba nữ',
            'Đồng đội nam', 'Đồng đội nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'point_diff']
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

        displayFields: ['drawType', 'matchDuration']
    },

    // ================================================================
    // 🎱 BILLIARDS
    // ================================================================
    billiards: {
        name: 'Billiards',
        icon: '🎱',
        category: 'precision',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single', 'round-robin-even'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 60,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Pool 8-ball Nam', 'Pool 8-ball Nữ',
            'Pool 9-ball Nam', 'Pool 9-ball Nữ',
            'Snooker Nam', 'Snooker Nữ',
            'Carom Nam', 'Carom Nữ',
            'Đồng đội Nam', 'Đồng đội Nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'point_diff']
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

        displayFields: ['drawType', 'matchDuration']
    },

    // ================================================================
    // 🎮 THỂ THAO ĐIỆN TỬ
    // ================================================================
    esports: {
        name: 'Thể thao điện tử',
        icon: '🎮',
        category: 'electronic',
        teamBased: true,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-knockout'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 60,
        periods: 3,
        periodDuration: 20,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Liên Quân Mobile',
            'LMHT (League of Legends)',
            'PUBG Mobile',
            'Dota 2',
            'CS:GO',
            'Valorant',
            'FIFA Online 4',
            'Free Fire',
            'Call of Duty Mobile',
            'Đấu trường chân lý (TFT)'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: false,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'wins']
            }
        },

        bracketRules: {
            sizeFormula: 'power-of-2',
            thirdPlaceMatch: false
        },

        scheduleRules: {
            minRestBetweenMatches: 60,
            finalRoundsDay: 'last'
        },

        displayFields: ['drawType', 'matchDuration']
    },

    // ================================================================
    // 🚣 ĐUA THUYỀN
    // ================================================================
    rowing: {
        name: 'Đua thuyền',
        icon: '🚣',
        category: 'water',
        teamBased: true,

        drawType: 'time-based',
        allowedDrawTypes: [],

        hasDraw: false,
        hasBracket: false,
        scoringType: 'time',
        matchDuration: 10,

        defaultTeamCount: 12,

        suggestedCategories: [
            'Thuyền đơn Nam', 'Thuyền đơn Nữ',
            'Thuyền đôi Nam', 'Thuyền đôi Nữ',
            'Thuyền 4 Nam', 'Thuyền 4 Nữ',
            'Thuyền 8 Nam', 'Thuyền 8 Nữ',
            'Rowing 500m Nam', 'Rowing 500m Nữ',
            'Rowing 1000m Nam', 'Rowing 1000m Nữ',
            'Rowing 2000m Nam', 'Rowing 2000m Nữ'
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
    // 🚴 ĐẠP XE
    // ================================================================
    cycling: {
        name: 'Đạp xe',
        icon: '🚴',
        category: 'track',
        teamBased: false,

        drawType: 'time-based',
        allowedDrawTypes: [],

        hasDraw: false,
        hasBracket: false,
        scoringType: 'time',
        matchDuration: 60,

        defaultTeamCount: 20,

        suggestedCategories: [
            'Road Race Nam', 'Road Race Nữ',
            'Time Trial Nam', 'Time Trial Nữ',
            'Criterium Nam', 'Criterium Nữ',
            'Mountain Bike Nam', 'Mountain Bike Nữ',
            'BMX Nam', 'BMX Nữ',
            'Track Cycling Nam', 'Track Cycling Nữ'
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
            minRestBetweenMatches: 60,
            finalRoundsDay: 'last'
        },

        displayFields: []
    },

    // ================================================================
    // 🏋️ CỬ TẠ
    // ================================================================
    weightlifting: {
        name: 'Cử tạ',
        icon: '🏋️',
        category: 'strength',
        teamBased: false,

        drawType: 'time-based',
        allowedDrawTypes: [],

        hasDraw: false,
        hasBracket: false,
        scoringType: 'weight',
        matchDuration: 30,

        hasWeightClasses: true,
        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam 55kg', 'Nam 61kg', 'Nam 67kg', 'Nam 73kg',
            'Nam 81kg', 'Nam 89kg', 'Nam 96kg', 'Nam 102kg',
            'Nam 109kg', 'Nam +109kg',
            'Nữ 45kg', 'Nữ 49kg', 'Nữ 55kg', 'Nữ 59kg',
            'Nữ 64kg', 'Nữ 71kg', 'Nữ 76kg', 'Nữ 81kg',
            'Nữ 87kg', 'Nữ +87kg'
        ],

        qualifyRules: {
            timeBased: {
                advanceTop: 8,
                tieBreaker: ['weight']
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

        displayFields: ['hasWeightClasses']
    },

    // ================================================================
    // 🏹 BẮN CUNG
    // ================================================================
    archery: {
        name: 'Bắn cung',
        icon: '🏹',
        category: 'precision',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'time-based'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 30,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Cung 1 dây Nam', 'Cung 1 dây Nữ',
            'Cung 3 dây Nam', 'Cung 3 dây Nữ',
            'Cung truyền thống Nam', 'Cung truyền thống Nữ',
            'Đồng đội Nam', 'Đồng đội Nữ',
            'Đôi nam nữ'
        ],

        qualifyRules: {
            roundRobin: {
                champion: true,
                runnerUp: true,
                thirdPlace: false,
                bestRunnersUp: 0,
                tieBreaker: ['head_to_head', 'point_diff']
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

        displayFields: ['drawType', 'matchDuration']
    },

    // ================================================================
    // 🎯 BẮN SÚNG
    // ================================================================
    shooting: {
        name: 'Bắn súng',
        icon: '🎯',
        category: 'precision',
        teamBased: false,

        drawType: 'time-based',
        allowedDrawTypes: [],

        hasDraw: false,
        hasBracket: false,
        scoringType: 'point',
        matchDuration: 60,

        defaultTeamCount: 20,

        suggestedCategories: [
            'Súng trường hơi 10m Nam', 'Súng trường hơi 10m Nữ',
            'Súng ngắn hơi 10m Nam', 'Súng ngắn hơi 10m Nữ',
            'Súng trường 50m Nam', 'Súng trường 50m Nữ',
            'Súng ngắn 25m Nam', 'Súng ngắn 25m Nữ',
            'Đồng đội Nam', 'Đồng đội Nữ'
        ],

        qualifyRules: {
            timeBased: {
                advanceTop: 8,
                tieBreaker: ['point']
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
    // ♚ CỜ VUA
    // ================================================================
    chess_international: {
        name: 'Cờ vua',
        icon: '♚',
        category: 'mind',
        teamBased: false,

        drawType: 'swiss',
        allowedDrawTypes: ['swiss', 'round-robin-single', 'round-robin-even', 'round-robin-custom'],

        hasDraw: true,
        scoringType: 'point',
        winPoints: 1,
        drawPoints: 0.5,
        lossPoints: 0,
        matchDuration: 90,
        extraTime: 30,

        defaultTeamCount: 32,

        suggestedCategories: [
            'Nam', 'Nữ',
            'Đồng đội nam', 'Đồng đội nữ',
            'U8 Nam', 'U8 Nữ',
            'U10 Nam', 'U10 Nữ',
            'U12 Nam', 'U12 Nữ',
            'U14 Nam', 'U14 Nữ',
            'U16 Nam', 'U16 Nữ',
            'U18 Nam', 'U18 Nữ',
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
    // 📦 MÔN KHÁC
    // ================================================================
    other: {
        name: 'Môn khác',
        icon: '📦',
        category: 'other',
        teamBased: false,

        drawType: 'knockout',
        allowedDrawTypes: ['knockout', 'round-robin-single', 'round-robin-even', 'round-robin-custom', 'swiss', 'time-based'],

        hasDraw: false,
        scoringType: 'point',
        matchDuration: 45,

        defaultTeamCount: 16,

        suggestedCategories: [
            'Nam', 'Nữ',
            'Đồng đội nam', 'Đồng đội nữ',
            'Đôi nam', 'Đôi nữ', 'Đôi nam nữ'
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
            minRestBetweenMatches: 45,
            finalRoundsDay: 'last'
        },

        displayFields: ['drawType', 'matchDuration']
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


// =========================================================
// ✅ TỰ ĐỘNG NHẬN DIỆN MÔN TỪ TIÊU ĐỀ VIDEO
// =========================================================

window.detectSportFromText = function(text) {
    if (!text) return null;
    const lower = text.toLowerCase().trim();

    // Mapping từ khóa → mã môn
    const keywords = {
        'football': [
            'bóng đá', 'bong da', 'highlight bóng đá', 'nha', 'laliga', 'la liga',
            'c1', 'champions league', 'v.league', 'vleague', 'epl', 'ngoại hạng anh',
            'manchester', 'arsenal', 'chelsea', 'liverpool', 'real madrid', 'barcelona',
            'atletico', 'juventus', 'milan', 'inter', 'psg', 'bayern', 'world cup',
            'world cup 2026', 'euro', 'sea games', 'aff cup', 'asian cup'
        ],
        'badminton': [
            'cầu lông', 'cau long', 'badminton', 'vợt cầu lông', 'yonex', 'victor', 'lin dan',
            'axelsen', 'tai tzu ying', 'all england', 'vietnam open'
        ],
        'pickleball': ['pickleball', 'pickle ball', 'pickleball tournament'],
        'table_tennis': ['bóng bàn', 'bong ban', 'table tennis', 'ping pong'],
        'tennis': [
            'tennis', 'quần vợt', 'quan vot', 'wimbledon', 'us open',
            'roland garros', 'australian open', 'atp', 'wta', 'djokovic', 'nadal'
        ],
        'basketball': ['bóng rổ', 'bong ro', 'basketball', 'nba', 'vba', '3x3'],
        'volleyball': ['bóng chuyền', 'bong chuyen', 'volleyball', 'bóng chuyền bãi biển'],
        'swimming': ['bơi', 'boi', 'lặn', 'lan', 'swimming', 'swim', 'bơi lội', 'bơi lặn'],
        'athletics': [
            'điền kinh', 'dien kinh', 'chạy', 'chay', 'marathon',
            'nhảy cao', 'nhảy xa', 'nhảy ba bước', 'ném lao', 'đẩy tạ', 'ném đĩa',
            'athletics', 'running', 'sprint'
        ],
        'taekwondo': ['taekwondo', 'tae kwon do', 'taekwon'],
        'karate': ['karate', 'kata', 'kumite'],
        'vovinam': ['vovinam', 'vovinam việt võ đạo'],
        'judo': ['judo'],
        'boxing': ['boxing', 'quyền anh', 'quyen anh'],
        'muay_thai': ['muay thái', 'muay thai', 'muay'],
        'wrestling': ['vật', 'vat', 'wrestling'],
        'martial_arts': ['võ thuật', 'vo thuat', 'võ', 'vo', 'martial arts'],
        'chess': ['cờ tướng', 'co tuong', 'cờ tướng việt nam'],
        'chess_international': ['cờ vua', 'co vua', 'chess', 'fide', 'cờ quốc tế'],
        'petanque': ['bi sắt', 'bi sat', 'petanque', 'pétanque'],
        'billiards': ['billiards', 'bida', 'bi-a', 'pool', 'snooker', 'carom'],
        'rowing': ['đua thuyền', 'dua thuyen', 'rowing', 'boat', 'chèo thuyền'],
        'cycling': ['đạp xe', 'dap xe', 'cycling', 'xe đạp', 'tour de france'],
        'esports': [
            'esports', 'thể thao điện tử', 'the thao dien tu',
            'liên quân', 'lien quan', 'pubg', 'lol', 'league of legends',
            'dota', 'valorant', 'fifa online', 'free fire', 'call of duty'
        ],
        'weightlifting': ['cử tạ', 'cu ta', 'weightlifting', 'cử tạ'],
        'archery': ['bắn cung', 'ban cung', 'archery'],
        'shooting': ['bắn súng', 'ban sung', 'shooting']
    };

    // Kiểm tra từng môn
    for (const sportCode in keywords) {
        const words = keywords[sportCode];
        for (const word of words) {
            if (lower.includes(word)) {
                console.log('🎯 Nhận diện môn:', sportCode, '(từ khóa:', word + ')');
                return sportCode;
            }
        }
    }

    return null;
};

console.log('✅ sports-config.js loaded -', Object.keys(window.SPORTS_CONFIG).length, 'môn thể thao');
