// ============================================================
// bracket-engine.js — Bracket engine chuẩn (cây đấu)
// Version 2.1 — Fix lỗi Bye nhảy cóc + tối ưu logic tạo vòng
// Hỗ trợ: BYE, tranh hạng 3, validate, ghi kết quả
// ============================================================

/**
 * Tạo bracket từ danh sách đội
 * @param {Array} teams - [{ name, club }, ...]
 * @param {Object} options - { customByes: [2,15,...] }
 * @returns {Object} bracket object
 */
export function createBracket(teams, options = {}) {
  if (!Array.isArray(teams) || teams.length < 2) {
    throw new Error('Cần ít nhất 2 đội');
  }

  const teamCount = teams.length;
  let bracketSize = 2;
  while (bracketSize < teamCount) bracketSize *= 2;
  const numByes = bracketSize - teamCount;

  // Validate customByes
  let customByes = null;
  if (options.customByes && options.customByes.length > 0) {
    const unique = [...new Set(options.customByes)].sort((a, b) => a - b);
    if (unique.length !== numByes) {
      throw new Error(
        `Số BYE nhập (${unique.length}) không khớp với bracket (cần ${numByes})`
      );
    }
    if (unique.some((s) => s < 1 || s > bracketSize)) {
      throw new Error(`Slot BYE phải từ 1 đến ${bracketSize}`);
    }
    customByes = unique;
  }

  // ============================================================
  // BƯỚC 1: Build vòng 1 (ghép cặp + chèn BYE)
  // ============================================================
  const firstRound = buildFirstRound(teams, bracketSize, numByes, customByes);

  // ============================================================
  // BƯỚC 2: Build các vòng sau (FIX LỖI BYE NHẢY CÓC)
  // ============================================================
  const rounds = [firstRound];
  
  // Số VĐV ở Vòng 2 = bracketSize / 2 (vì mỗi trận Vòng 1 chọn ra 1 người)
  // Đây là điểm mấu chốt: Vòng 2 luôn có đủ số VĐV, bất kể có bao nhiêu Bye.
  let currentRoundPlayerCount = bracketSize / 2; 
  let roundIdx = 2;

  while (currentRoundPlayerCount > 1) {
    const matchCount = currentRoundPlayerCount / 2;
    const matches = [];
    const prevRound = rounds[roundIdx - 2];

    for (let i = 0; i < matchCount; i++) {
      // Lấy 2 trận từ vòng trước để ghép thành 1 trận vòng này
      const fromMatchA = prevRound[i * 2];
      const fromMatchB = prevRound[i * 2 + 1];

      matches.push({
        id: `R${roundIdx}_M${i + 1}`,
        roundIndex: roundIdx - 1,
        matchIndex: i,
        teamA: null,
        teamB: null,
        scoreA: null,
        scoreB: null,
        winner: null,
        status: 'pending',
        fromA: fromMatchA ? fromMatchA.id : null,
        fromB: fromMatchB ? fromMatchB.id : null,
        isBye: false,
        isPlaceholder: true,
      });
    }

    matches.forEach((m) => updateMatchStatus(m, rounds));
    rounds.push(matches);
    
    // Cập nhật số VĐV cho vòng tiếp theo
    currentRoundPlayerCount = matchCount;
    roundIdx++;
  }

  return {
    bracketSize,
    numByes,
    teamCount,
    rounds,
    roundNames: getRoundNames(rounds.length),
    thirdPlaceMatch: {
      id: 'THIRD',
      teamA: null,
      teamB: null,
      scoreA: null,
      scoreB: null,
      winner: null,
      status: 'pending',
      fromA: null,
      fromB: null,
      isThirdPlace: true,
    },
    createdAt: Date.now(),
  };
}

/**
 * Build vòng 1 (ghép cặp + chèn BYE theo chuẩn thể thao)
 */
function buildFirstRound(teams, bracketSize, numByes, customByes) {
  const matches = [];
  const matchCount = bracketSize / 2;
  let players = [...teams];

  if (customByes) {
    // ═══════════════════════════════════════════════════════════
    // Trường hợp 1: Người dùng CHỈ ĐỊNH vị trí BYE
    // ═══════════════════════════════════════════════════════════
    const byeSet = new Set(customByes);
    let playerIdx = 0;

    for (let i = 0; i < matchCount; i++) {
      const slotA = i * 2 + 1;
      const slotB = i * 2 + 2;
      const isByeA = byeSet.has(slotA);
      const isByeB = byeSet.has(slotB);

      if (isByeA && isByeB) {
        matches.push(makeMatch(i, null, null, false, true));
      } else if (isByeA) {
        matches.push(makeMatch(i, players[playerIdx++] || null, null, true, false));
      } else if (isByeB) {
        matches.push(makeMatch(i, null, players[playerIdx++] || null, true, false));
      } else {
        matches.push(
          makeMatch(i, players[playerIdx++] || null, players[playerIdx++] || null, false, false)
        );
      }
    }
  } else if (numByes > 0) {
    // ═══════════════════════════════════════════════════════════
    // Trường hợp 2: TỰ ĐỘNG sinh BYE theo chuẩn thể thao
    // ═══════════════════════════════════════════════════════════

    // Bước 1: Lấy vị trí BYE chuẩn
    const byeSlots = getStandardByeSlots(bracketSize, numByes);

    // Bước 2: Xáo trộn đội để công bằng
    players = shuffleArray(players);

    // Bước 3: Gán đội vào các slot KHÔNG phải BYE
    let playerIdx = 0;
    for (let i = 0; i < matchCount; i++) {
      const slotA = i * 2 + 1;
      const slotB = i * 2 + 2;
      const isByeA = byeSlots.has(slotA);
      const isByeB = byeSlots.has(slotB);

      if (isByeA && isByeB) {
        matches.push(makeMatch(i, null, null, false, true));
      } else if (isByeA) {
        matches.push(makeMatch(i, null, players[playerIdx++] || null, true, false));
      } else if (isByeB) {
        matches.push(makeMatch(i, players[playerIdx++] || null, null, true, false));
      } else {
        matches.push(
          makeMatch(i, players[playerIdx++] || null, players[playerIdx++] || null, false, false)
        );
      }
    }
  } else {
    // ═══════════════════════════════════════════════════════════
    // Trường hợp 3: Không có BYE → ghép cặp thẳng
    // ═══════════════════════════════════════════════════════════
    players = shuffleArray(players);
    let playerIdx = 0;

    for (let i = 0; i < matchCount; i++) {
      matches.push(
        makeMatch(i, players[playerIdx++] || null, players[playerIdx++] || null, false, false)
      );
    }
  }

  // Set status ban đầu
  matches.forEach((m) => {
    if (m.isBye) {
      m.status = 'done';
      m.winner = m.teamA ? 'A' : 'B';
    } else if (m.teamA && m.teamB) {
      m.status = 'ready';
    }
  });

  return matches;
}

/**
 * ⚠️ HÀM QUAN TRỌNG — Sinh BYE theo chuẩn thể thao quốc tế
 *
 * Quy tắc:
 * - BYE 1, 2: đặt ở 2 đầu nhánh (slot 2 và slot bracketSize - 1)
 * - BYE tiếp theo: đặt xen kẽ, ưu tiên nhánh TRÊN trước
 * - Kết quả: phân bố đều, không dồn cục
 *
 * Tham khảo chuẩn: Olympic, BWF (cầu lông), ITTF (bóng bàn)
 */
function getStandardByeSlots(bracketSize, numByes) {
  if (numByes === 0) return new Set();
  if (numByes >= bracketSize) return new Set();

  // Bảng tra cứu chuẩn cho bracket phổ biến
  const STANDARD_BYE_POSITIONS = {
    4: {
      1: [4],
      2: [2, 3],
    },
    8: {
      1: [8],
      2: [2, 7],
      3: [2, 4, 7],
      4: [2, 3, 4, 7],
    },
    16: {
      1: [16],
      2: [2, 15],
      3: [2, 7, 15],
      4: [2, 7, 10, 15],
      5: [2, 5, 7, 10, 15],
      6: [2, 5, 7, 10, 12, 15],
      7: [2, 4, 5, 7, 10, 12, 15],
      8: [2, 4, 5, 7, 10, 12, 13, 15],
      9: [2, 3, 4, 5, 7, 10, 12, 13, 15],
      10: [2, 3, 4, 5, 7, 10, 11, 12, 13, 15],
      11: [2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 15],
      12: [2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15],
      13: [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15],
      14: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    32: {
      1: [32],
      2: [2, 31],
      3: [2, 15, 31],
      4: [2, 15, 18, 31],
      5: [2, 15, 18, 23, 31],
      6: [2, 11, 15, 18, 23, 31],
      7: [2, 11, 15, 18, 23, 26, 31],
      8: [2, 11, 15, 18, 23, 26, 28, 31],
      9: [2, 7, 11, 15, 18, 23, 26, 28, 31],
      10: [2, 7, 11, 15, 18, 20, 23, 26, 28, 31],
      11: [2, 7, 11, 15, 17, 18, 20, 23, 26, 28, 31],
      12: [2, 7, 11, 15, 17, 18, 20, 23, 25, 26, 28, 31],
      13: [2, 5, 7, 11, 15, 17, 18, 20, 23, 25, 26, 28, 31],
      14: [2, 4, 5, 7, 11, 15, 17, 18, 20, 23, 25, 26, 28, 31],
      15: [2, 4, 5, 7, 11, 13, 15, 17, 18, 20, 23, 25, 26, 28, 31],
      16: [2, 4, 5, 7, 11, 13, 15, 16, 17, 18, 20, 23, 25, 26, 28, 31],
    },
    64: {
      1: [64],
      2: [2, 63],
      3: [2, 31, 63],
      4: [2, 31, 34, 63],
      5: [2, 31, 34, 47, 63],
      6: [2, 23, 31, 34, 47, 63],
      7: [2, 23, 31, 34, 47, 50, 63],
      8: [2, 23, 31, 34, 47, 50, 55, 63],
      9: [2, 15, 23, 31, 34, 47, 50, 55, 63],
      10: [2, 15, 23, 31, 34, 42, 47, 50, 55, 63],
      11: [2, 15, 23, 31, 34, 42, 47, 50, 55, 60, 63],
      12: [2, 15, 23, 31, 34, 42, 47, 50, 53, 55, 60, 63],
      13: [2, 15, 20, 23, 31, 34, 42, 47, 50, 53, 55, 60, 63],
      14: [2, 15, 20, 23, 31, 34, 38, 42, 47, 50, 53, 55, 60, 63],
      15: [2, 15, 20, 23, 31, 34, 38, 42, 45, 47, 50, 53, 55, 60, 63],
      16: [2, 15, 20, 23, 31, 34, 38, 42, 45, 47, 50, 53, 55, 58, 60, 63],
    },
  };

  // Nếu có bảng tra cứu → dùng luôn
  if (STANDARD_BYE_POSITIONS[bracketSize]?.[numByes]) {
    return new Set(STANDARD_BYE_POSITIONS[bracketSize][numByes]);
  }

  // Nếu không có → tự sinh theo thuật toán
  return generateByeSlotsFallback(bracketSize, numByes);
}

/**
 * Thuật toán sinh BYE dự phòng (cho bracket 128, 256, ...)
 */
function generateByeSlotsFallback(bracketSize, numByes) {
  const slots = new Set();
  if (numByes === 0) return slots;

  // BYE 1: slot 2
  slots.add(2);
  if (numByes === 1) return slots;

  // BYE 2: slot bracketSize - 1
  slots.add(bracketSize - 1);
  if (numByes === 2) return slots;

  // Các BYE tiếp: chia đôi từng khoảng, ưu tiên trái
  const segments = [[2, bracketSize - 1]];

  while (slots.size < numByes && segments.length > 0) {
    segments.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));

    const seg = segments.shift();
    if (!seg || seg[1] - seg[0] <= 2) continue;

    const mid = Math.floor((seg[0] + seg[1]) / 2);

    let candidate = mid;
    while (slots.has(candidate) && candidate < seg[1]) candidate++;

    if (candidate < seg[1] && !slots.has(candidate)) {
      slots.add(candidate);
      segments.push([seg[0], candidate]);
      segments.push([candidate, seg[1]]);
    }
  }

  return slots;
}

/**
 * Xáo trộn mảng (Fisher-Yates)
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeMatch(idx, teamA, teamB, isBye, isPlaceholder) {
  return {
    id: `R1_M${idx + 1}`,
    roundIndex: 0,
    matchIndex: idx,
    teamA,
    teamB,
    scoreA: null,
    scoreB: null,
    winner: null,
    status: 'pending',
    fromA: null,
    fromB: null,
    isBye,
    isPlaceholder,
  };
}

/**
 * ⚠️ HÀM QUAN TRỌNG NHẤT — Ghi kết quả + đẩy winner lên vòng sau
 */
export function recordWinner(bracket, matchId, winnerSlot, scoreA, scoreB) {
  if (!['A', 'B'].includes(winnerSlot)) {
    throw new Error('winnerSlot phải là "A" hoặc "B"');
  }

  const found = findMatch(bracket, matchId);
  if (!found) throw new Error(`Không tìm thấy trận ${matchId}`);

  const { match, roundIndex, matchIndex } = found;

  if (match.isPlaceholder) {
    throw new Error('Trận chưa có đủ 2 đội');
  }
  const winnerTeam = winnerSlot === 'A' ? match.teamA : match.teamB;
  if (!winnerTeam) {
    throw new Error(`Slot ${winnerSlot} không có đội`);
  }

  match.scoreA = scoreA !== undefined ? scoreA : null;
  match.scoreB = scoreB !== undefined ? scoreB : null;
  match.winner = winnerSlot;
  match.status = 'done';

  if (roundIndex < bracket.rounds.length - 1) {
    const nextRound = bracket.rounds[roundIndex + 1];
    const nextMatch = nextRound.find(
      (m) => m.fromA === match.id || m.fromB === match.id
    );

    if (!nextMatch) {
      throw new Error(`Không tìm thấy trận tiếp theo của ${match.id}`);
    }

    if (nextMatch.fromA === match.id) {
      nextMatch.teamA = winnerTeam;
    } else {
      nextMatch.teamB = winnerTeam;
    }

    updateMatchStatus(nextMatch, bracket.rounds);
  }

  const semiRoundIndex = bracket.rounds.length - 2;
  if (roundIndex === semiRoundIndex) {
    const loserTeam = winnerSlot === 'A' ? match.teamB : match.teamA;
    if (loserTeam && bracket.thirdPlaceMatch) {
      if (!bracket.thirdPlaceMatch.teamA) {
        bracket.thirdPlaceMatch.teamA = loserTeam;
      } else {
        bracket.thirdPlaceMatch.teamB = loserTeam;
      }
      if (bracket.thirdPlaceMatch.teamA && bracket.thirdPlaceMatch.teamB) {
        bracket.thirdPlaceMatch.status = 'ready';
      }
    }
  }

  return bracket;
}

function updateMatchStatus(match, rounds) {
  if (match.status === 'done') return;

  if (match.teamA && match.teamB) {
    match.status = 'ready';
    match.isPlaceholder = false;
  } else if (match.teamA || match.teamB) {
    match.status = 'pending';
    match.isPlaceholder = false;
  } else {
    match.status = 'pending';
    match.isPlaceholder = true;
  }
}

export function findMatch(bracket, matchId) {
  for (let r = 0; r < bracket.rounds.length; r++) {
    for (let m = 0; m < bracket.rounds[r].length; m++) {
      if (bracket.rounds[r][m].id === matchId) {
        return {
          match: bracket.rounds[r][m],
          roundIndex: r,
          matchIndex: m,
        };
      }
    }
  }
  return null;
}

export function validateBracket(bracket) {
  const issues = [];
  const teamLocations = new Map();

  bracket.rounds.forEach((round, rIdx) => {
    round.forEach((match, mIdx) => {
      const location = `${bracket.roundNames[rIdx]} - Trận ${mIdx + 1}`;

      if (rIdx > 0) {
        if (!match.fromA || !match.fromB) {
          issues.push({
            level: 'error',
            location,
            message: `Thiếu nguồn gốc (fromA/fromB)`,
          });
        } else {
          const hasA = findMatch(bracket, match.fromA);
          const hasB = findMatch(bracket, match.fromB);
          if (!hasA) issues.push({
            level: 'error',
            location,
            message: `fromA="${match.fromA}" không tồn tại`,
          });
          if (!hasB) issues.push({
            level: 'error',
            location,
            message: `fromB="${match.fromB}" không tồn tại`,
          });
        }
      }

      [match.teamA, match.teamB].forEach((team, slot) => {
        if (!team) return;
        const key = `${team.name}|${team.club || ''}`;
        if (!teamLocations.has(key)) teamLocations.set(key, []);
        teamLocations.get(key).push({
          location,
          slot: slot === 0 ? 'A' : 'B',
          matchId: match.id,
        });
      });
    });
  });

  teamLocations.forEach((locs, key) => {
    const [name] = key.split('|');
    if (locs.length > 1) {
      const sortedLocs = locs.sort((a, b) => {
        const rA = getRoundIndexFromMatchId(bracket, a.matchId);
        const rB = getRoundIndexFromMatchId(bracket, b.matchId);
        return rA - rB;
      });

      let valid = true;
      for (let i = 1; i < sortedLocs.length; i++) {
        const prevMatch = findMatch(bracket, sortedLocs[i - 1].matchId);
        const currMatch = findMatch(bracket, sortedLocs[i].matchId);
        if (!prevMatch || !currMatch) continue;

        if (
          currMatch.match.fromA !== prevMatch.match.id &&
          currMatch.match.fromB !== prevMatch.match.id
        ) {
          valid = false;
          break;
        }

        const winnerTeam = prevMatch.match.winner === 'A'
          ? prevMatch.match.teamA
          : prevMatch.match.teamB;
        if (!winnerTeam || winnerTeam.name !== name) {
          valid = false;
          break;
        }
      }

      if (!valid) {
        issues.push({
          level: 'warning',
          team: name,
          locations: locs.map((l) => l.location),
          message: `Đội "${name}" xuất hiện ở ${locs.length} vị trí không hợp lệ`,
        });
      }
    }
  });

  return {
    valid: issues.filter((i) => i.level === 'error').length === 0,
    issues,
    errorCount: issues.filter((i) => i.level === 'error').length,
    warningCount: issues.filter((i) => i.level === 'warning').length,
  };
}

function getRoundIndexFromMatchId(bracket, matchId) {
  const found = findMatch(bracket, matchId);
  return found ? found.roundIndex : -1;
}

export function getRoundNames(totalRounds) {
  const standard = ['Chung kết', 'Bán kết', 'Tứ kết', 'Vòng 1/8', 'Vòng 1/16', 'Vòng 1/32'];
  const names = [];
  for (let i = 0; i < totalRounds; i++) {
    const fromEnd = totalRounds - 1 - i;
    names.push(standard[fromEnd] || `Vòng ${i + 1}`);
  }
  return names;
}

export function getReadyMatches(bracket) {
  const list = [];
  bracket.rounds.forEach((round, rIdx) => {
    round.forEach((m) => {
      if (m.status === 'ready' && m.teamA && m.teamB) {
        list.push({
          ...m,
          roundName: bracket.roundNames[rIdx],
        });
      }
    });
  });
  return list;
}

export function getBracketStats(bracket) {
  let totalMatches = 0;
  let doneMatches = 0;
  let pendingMatches = 0;

  bracket.rounds.forEach((round) => {
    round.forEach((m) => {
      totalMatches++;
      if (m.status === 'done') doneMatches++;
      else pendingMatches++;
    });
  });

  return {
    bracketSize: bracket.bracketSize,
    teamCount: bracket.teamCount,
    numByes: bracket.numByes,
    totalRounds: bracket.rounds.length,
    totalMatches,
    doneMatches,
    pendingMatches,
    progress: totalMatches > 0 ? Math.round((doneMatches / totalMatches) * 100) : 0,
  };
}

export function resetBracket(bracket) {
  bracket.rounds.forEach((round, rIdx) => {
    round.forEach((match) => {
      if (rIdx === 0) {
        match.scoreA = null;
        match.scoreB = null;
        match.winner = null;
        match.status = match.isBye ? 'done' : (match.teamA && match.teamB ? 'ready' : 'pending');
      } else {
        match.teamA = null;
        match.teamB = null;
        match.scoreA = null;
        match.scoreB = null;
        match.winner = null;
        match.status = 'pending';
        match.isPlaceholder = true;
      }
    });
  });

  bracket.thirdPlaceMatch = {
    id: 'THIRD',
    teamA: null,
    teamB: null,
    scoreA: null,
    scoreB: null,
    winner: null,
    status: 'pending',
    isThirdPlace: true,
  };

  return bracket;
}

export function serializeBracket(bracket) {
  return JSON.stringify(bracket);
}

export function deserializeBracket(json) {
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch (err) {
    throw new Error('Không đọc được bracket: ' + err.message);
  }
}

/**
 * ⚠️ DEBUG — Lấy danh sách BYE slots (để test)
 */
export function debugByeSlots(bracketSize, numByes) {
  const slots = getStandardByeSlots(bracketSize, numByes);
  return [...slots].sort((a, b) => a - b);
}
