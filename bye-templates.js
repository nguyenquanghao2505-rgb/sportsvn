// =========================================================
// SPORTSVN - BẢNG BYE CHUẨN
// Vị trí BYE cho từng số VĐV (theo chuẩn Excel)
// =========================================================

window.BYE_TEMPLATES = {

    // ============ BRACKET 8 ============
    5:  [2, 7],
    6:  [2, 7],
    7:  [2],

    // ============ BRACKET 16 ============
    9:  [2, 6, 10, 14, 15],
    10: [2, 6, 10, 14],
    11: [2, 6, 10],
    12: [2, 6, 15],
    13: [2, 6],
    14: [2, 15],
    15: [2],

    // ============ BRACKET 32 ============
    17: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    18: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
    19: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
    20: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
    21: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    22: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    23: [2, 4, 6, 8, 10, 12, 14, 16, 18],
    24: [2, 4, 6, 8, 10, 12, 14, 16],
    25: [2, 6, 10, 14, 18, 22, 26],
    26: [2, 6, 10, 15, 18, 22, 26, 31],
    27: [2, 6, 10, 15, 18, 22, 26],
    28: [2, 6, 10, 15, 18, 22],
    29: [2, 6, 10, 15, 18],
    30: [2, 6, 10, 15],
    31: [2],

    // ============ BRACKET 64 ============
    33: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62],
    35: [2, 4, 6, 8, 10, 13, 15, 18, 20, 22, 24, 26, 29, 31, 34, 36, 38, 40, 42, 45, 47, 50, 52, 54, 56, 58, 60, 62, 64],
    37: [2, 5, 7, 10, 13, 15, 18, 20, 23, 25, 27, 30, 31, 34, 36, 39, 41, 43, 46, 47, 50, 52, 55, 57, 59, 62, 63],
    47: [2, 6, 10, 15, 18, 22, 26, 31, 34, 38, 42, 47, 50, 55, 58, 60, 63],
    58: [2, 15, 18, 34, 47, 50],

    // ============ BRACKET 128 ============
    76: [2, 4, 7, 10, 13, 15, 18, 20, 23, 26, 29, 31, 34, 36, 39, 42, 45, 47, 50, 52, 55, 58, 61, 63, 66, 68, 70, 73, 76, 78, 79, 82, 84, 86, 89, 92, 94, 95, 98, 100, 102, 105, 108, 110, 111, 114, 116, 118, 121, 124, 126, 127],
    93: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 85, 89, 92, 94, 98, 101, 105, 108, 110, 114, 117, 121, 124, 126]
};


// =========================================================
// HELPER - Lấy BYE cho số VĐV
// =========================================================

window.getByeSlots = function(numPlayers) {
    if (window.BYE_TEMPLATES[numPlayers]) {
        return window.BYE_TEMPLATES[numPlayers];
    }
    return window.generateAutoByes(numPlayers);
};


// =========================================================
// CÔNG THỨC TỰ ĐỘNG SINH BYE
// Ưu tiên: Nhánh đầu → Nhánh cuối → Nhánh giữa (đối xứng)
// =========================================================

window.generateAutoByes = function(numPlayers) {
    // Bước 1: Tính bracket size
    let bracketSize = 2;
    while (bracketSize < numPlayers) bracketSize *= 2;

    const totalByes = bracketSize - numPlayers;
    if (totalByes === 0) return [];

    // Bước 2: Chia nhánh 8 slot
    const sectionSize = 8;
    const numSections = bracketSize / sectionSize;

    // Bước 3: Tính BYE mỗi nhánh
    const teamsPerSection = Math.floor(numPlayers / numSections);
    const remainder = numPlayers % numSections;

    const sectionByes = [];
    for (let s = 0; s < numSections; s++) {
        const teamsInSection = teamsPerSection + (s < remainder ? 1 : 0);
        const byesInSection = sectionSize - teamsInSection;
        sectionByes.push({
            sectionIdx: s,
            byes: byesInSection,
            slotStart: s * sectionSize
        });
    }

    // Bước 4: Ưu tiên nhánh: 1 → N → 2 → N-1 → 3 → N-2 ...
    const sectionOrder = [];
    let left = 0, right = numSections - 1;
    while (left <= right) {
        sectionOrder.push(left);
        if (left !== right) sectionOrder.push(right);
        left++;
        right--;
    }

    // Ưu tiên vị trí trong nhánh: đầu → cuối → giữa
    const slotPriority = [1, 8, 4, 5, 2, 7, 3, 6];

    const byeSlots = [];

    for (const sectionIdx of sectionOrder) {
        const info = sectionByes[sectionIdx];
        if (info.byes <= 0) continue;

        for (let i = 0; i < info.byes; i++) {
            const slotInSection = slotPriority[i];
            const absoluteSlot = info.slotStart + slotInSection;
            byeSlots.push(absoluteSlot);
        }
    }

    return byeSlots.sort((a, b) => a - b);
};

console.log('✅ bye-templates.js loaded -', Object.keys(window.BYE_TEMPLATES).length, 'mẫu BYE');
