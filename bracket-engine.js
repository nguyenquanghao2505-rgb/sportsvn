// ============================================================
// bracket-engine.js — Bracket engine chuẩn (cây đấu)
// Fix bug: đội thắng không đẩy lên vòng sau
// Hỗ trợ: BYE, tranh hạng 3, validate, ghi kết quả
// ============================================================

/**
 * Tạo bracket từ danh sách đội
 * @param {Array} teams - [{ name, club }, ...]
 * @param {Object} options - { customByes: [2,15,...], seedOrder: [] }
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

  // Build vòng 1
  const firstRound = buildFirstRound(teams, bracketSize, numByes, customByes);

  // Build các vòng sau
  const rounds = [firstRound];
  let prevMatchCount = firstRound.length;
  let roundIdx = 2;

  while (prevMatchCount > 1) {
    const matchCount = prevMatchCount / 2;
    const matches = [];

    for (let i = 0; i < matchCount; i++) {
      const fromMatchA = rounds[roundIdx - 2][i * 2];
      const fromMatchB = rounds[roundIdx - 2][i * 2 + 1];

      matches.push({
        id: `R${roundIdx}_M${i + 1}`,
        roundIndex: roundIdx - 1,
        matchIndex: i,
        teamA: null,
        teamB: null,
        scoreA: null,
        scoreB: null,
        winner: null, // 'A' | 'B' | null
        status: 'pending', // 'pending' | 'ready' | 'done'
        fromA: fromMatchA.id,
        fromB: fromMatchB.id,
        isBye: false,
        isPlaceholder: true,
      });
    }

    // Set status 'ready' nếu cả 2 nguồn đã done
    matches.forEach((m) => updateMatchStatus(m, rounds));

    rounds.push(matches);
    prevMatchCount = matchCount;
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
 * Build vòng 1 (ghép cặp + chèn BYE)
 */
function buildFirstRound(teams, bracketSize, numByes, customByes) {
  const matches = [];
  const matchCount = bracketSize / 2;
  let players = [...teams];

  if (customByes) {
    // Ghép theo slot chỉ định
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
  } else {
    // Sinh BYE tự động — theo chuẩn thể thao
    const byes = players.slice(0, numByes);
    const playing = players.slice(numByes);

    for (let i = 0; i < matchCount; i++) {
      if (byes.length > 0 && playing.length <= (matchCount - i - 1) * 2) {
        matches.push(makeMatch(i, byes.shift(), null, true, false));
      } else {
        const a = playing.shift() || null;
        const b = playing.shift() || null;
        if (a && !b) {
          matches.push(makeMatch(i, a, null, true, false));
        } else if (!a && !b) {
          matches.push(makeMatch(i, null, null, false, true));
        } else {
          matches.push(makeMatch(i, a, b, false, false));
        }
      }
    }

    // Nếu còn BYE → thay vào các match placeholder
    for (let i = 0; i < matches.length && byes.length > 0; i++) {
      if (matches[i].isPlaceholder) {
        matches[i] = makeMatch(i, byes.shift(), null, true, false);
      }
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

  // Validate
  if (match.isPlaceholder) {
    throw new Error('Trận chưa có đủ 2 đội');
  }
  const winnerTeam = winnerSlot === 'A' ? match.teamA : match.teamB;
  if (!winnerTeam) {
    throw new Error(`Slot ${winnerSlot} không có đội`);
  }

  // Ghi kết quả
  match.scoreA = scoreA !== undefined ? scoreA : null;
  match.scoreB = scoreB !== undefined ? scoreB : null;
  match.winner = winnerSlot;
  match.status = 'done';

  // Đẩy winner lên vòng sau
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

  // Xử lý tranh hạng 3 (đội thua bán kết)
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

/**
 * Cập nhật status của match dựa vào nguồn gốc
 */
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

/**
 * Tìm match theo ID
 */
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

/**
 * Validate bracket — phát hiện lỗi
 */
export function validateBracket(bracket) {
  const issues = [];
  const teamLocations = new Map();

  bracket.rounds.forEach((round, rIdx) => {
    round.forEach((match, mIdx) => {
      const location = `${bracket.roundNames[rIdx]} - Trận ${mIdx + 1}`;

      // Check nguồn gốc
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

      // Track vị trí đội
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

  // Phát hiện đội xuất hiện nhiều lần không hợp lệ
  teamLocations.forEach((locs, key) => {
    const [name] = key.split('|');
    if (locs.length > 1) {
      // Đội xuất hiện nhiều lần → check xem có hợp lệ không
      // Hợp lệ: đội thắng ở vòng trước xuất hiện ở vòng sau
      const sortedLocs = locs.sort((a, b) => {
        const rA = getRoundIndexFromMatchId(bracket, a.matchId);
        const rB = getRoundIndexFromMatchId(bracket, b.matchId);
        return rA - rB;
      });

      // Kiểm tra mỗi cặp liên tiếp có hợp lệ không
      let valid = true;
      for (let i = 1; i < sortedLocs.length; i++) {
        const prevMatch = findMatch(bracket, sortedLocs[i - 1].matchId);
        const currMatch = findMatch(bracket, sortedLocs[i].matchId);
        if (!prevMatch || !currMatch) continue;

        // Match sau phải là next của match trước
        if (
          currMatch.match.fromA !== prevMatch.match.id &&
          currMatch.match.fromB !== prevMatch.match.id
        ) {
          valid = false;
          break;
        }

        // Đội phải là winner của match trước
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

/**
 * Lấy tên các vòng
 */
export function getRoundNames(totalRounds) {
  const standard = ['Chung kết', 'Bán kết', 'Tứ kết', 'Vòng 1/8', 'Vòng 1/16', 'Vòng 1/32'];
  const names = [];
  for (let i = 0; i < totalRounds; i++) {
    const fromEnd = totalRounds - 1 - i;
    names.push(standard[fromEnd] || `Vòng ${i + 1}`);
  }
  return names;
}

/**
 * Lấy danh sách match đang chờ (ready) có thể đấu
 */
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

/**
 * Thống kê bracket
 */
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

/**
 * Reset toàn bộ bracket (xóa kết quả, giữ đội)
 */
export function resetBracket(bracket) {
  bracket.rounds.forEach((round, rIdx) => {
    round.forEach((match) => {
      if (rIdx === 0) {
        // Vòng 1 giữ nguyên đội
        match.scoreA = null;
        match.scoreB = null;
        match.winner = null;
        match.status = match.isBye ? 'done' : (match.teamA && match.teamB ? 'ready' : 'pending');
      } else {
        // Vòng sau reset sạch
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

/**
 * Export bracket thành JSON gọn để lưu DB
 */
export function serializeBracket(bracket) {
  return JSON.stringify(bracket);
}

/**
 * Import bracket từ JSON
 */
export function deserializeBracket(json) {
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch (err) {
    throw new Error('Không đọc được bracket: ' + err.message);
  }
}
