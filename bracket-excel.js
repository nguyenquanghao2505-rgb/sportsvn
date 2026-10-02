// ============================================================
// bracket-excel.js v6 — Layout khớp file Excel mẫu TP.HCM
// Cấu trúc: Mỗi match = 4 rows (A + GAP + B + GAP)
// Đường nối xuất phát từ row Đội B, hội tụ giữa cặp
// ============================================================

export async function exportBracketToExcel(bracket, options = {}) {
  if (typeof ExcelJS === 'undefined') {
    throw new Error('ExcelJS chưa được load');
  }

  const {
    categoryName = 'Bốc thăm',
    tournamentName = '',
    includeTeamList = true,
  } = options;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'SportsVN';
  wb.created = new Date();

  const ws = wb.addWorksheet('Sơ đồ thi đấu', {
    pageSetup: {
      paperSize: 9, orientation: 'landscape',
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.2, right: 0.2, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
  });

  drawBracket(ws, bracket, { categoryName, tournamentName });

  if (includeTeamList) {
    const wsTeams = wb.addWorksheet('Danh sách đội');
    drawTeamList(wsTeams, bracket);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ============================================================
// CONSTANTS
// ============================================================
const C = {
  headerBg:  'FF1A3A7A',
  headerFg:  'FFFFFFFF',
  winnerBg:  'FFD1FAE5',
  winnerFg:  'FF16A34A',
  byeBg:     'FFFFF3CD',
  byeFg:     'FFB45309',
  border:    'FFCBD5E1',
  line:      'FF1E3A8A',
  titleBg:   'FF0D1B3E',
  thirdBg:   'FFE67E22',
};

const W = {
  TT:     5,
  TEAM:   22,
  SCORE:  5,
  LINE:   3,
};

// ─── Cấu trúc rows ───
// Mỗi match = 4 rows:
//   Row 0: Đội A
//   Row 1: GAP (dùng vẽ đường ngang)
//   Row 2: Đội B
//   Row 3: GAP (dùng vẽ đường ngang)
// + 1 row trống sau mỗi match = 5 rows total
//
// ĐƯỜNG NỐI xuất phát từ ROW 2 (row Đội B) của mỗi match.
// 2 match liên tiếp (M1, M2) → 2 đường ngang ở row B → nối bằng đường dọc
// → Đường dọc từ row B của M1 xuống row B của M2
// → Đường ngang vào vòng sau ở row giữa = (rowB_M1 + rowB_M2) / 2

const ROWS_PER_MATCH = 4;
const ROW_SEP = 1;   // row trống sau mỗi match
const ROW_HEIGHT_TEAM = 18;
const ROW_HEIGHT_GAP = 10;

// ============================================================
// MAIN
// ============================================================
function drawBracket(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;

  const COLS_PER_ROUND = 3;

  ws.getColumn(1).width = W.TT;

  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.getColumn(baseCol).width = W.TEAM;
    ws.getColumn(baseCol + 1).width = W.SCORE;
    ws.getColumn(baseCol + 2).width = W.LINE;
  }

  const totalCols = 1 + totalRounds * COLS_PER_ROUND;

  let row = 1;

  // ─── Tiêu đề ───
  ws.mergeCells(row, 1, row, totalCols);
  const titleCell = ws.getCell(row, 1);
  titleCell.value = tournamentName
    ? `${tournamentName.toUpperCase()} — ${categoryName.toUpperCase()}`
    : `${categoryName.toUpperCase()} — SƠ ĐỒ THI ĐẤU`;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.titleBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 38;
  row++;

  ws.mergeCells(row, 1, row, totalCols);
  const subCell = ws.getCell(row, 1);
  subCell.value = `${bracket.teamCount} đội · Bracket ${bracket.bracketSize} · ${bracket.numByes} BYE · ${bracket.rounds.length} vòng`;
  subCell.font = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 18;
  row++;

  row++;

  // ─── Header ───
  const headerRow = row;

  const ttHeader = ws.getCell(headerRow, 1);
  ttHeader.value = 'TT';
  styleHeader(ttHeader);

  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.mergeCells(headerRow, baseCol, headerRow, baseCol + 1);
    const cell = ws.getCell(headerRow, baseCol);
    cell.value = bracket.roundNames[r].toUpperCase();
    styleHeader(cell);

    const lineHeader = ws.getCell(headerRow, baseCol + 2);
    lineHeader.border = border(C.headerBg);
    lineHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  }
  ws.getRow(headerRow).height = 26;
  row++;

  // ─── Vẽ bracket ───
  const bracketStartRow = row;
  const positions = computePositions(bracket, ROWS_PER_MATCH, ROW_SEP);

  let maxRow = bracketStartRow;

  // Vẽ tất cả match trước
  for (let rIdx = 0; rIdx < totalRounds; rIdx++) {
    const round = bracket.rounds[rIdx];
    const baseCol = 2 + rIdx * COLS_PER_ROUND;

    round.forEach((match, mIdx) => {
      const startRow = bracketStartRow + positions[rIdx][mIdx];
      drawMatch(ws, startRow, baseCol, match, {
        showTT: rIdx === 0,
      });
      const endRow = startRow + ROWS_PER_MATCH + ROW_SEP - 1;
      if (endRow > maxRow) maxRow = endRow;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // VẼ ĐƯỜNG NỐI
  // ═══════════════════════════════════════════════════════════
  for (let rIdx = 0; rIdx < totalRounds - 1; rIdx++) {
    const lineCol = 2 + rIdx * COLS_PER_ROUND + 2;
    const nextTeamCol = lineCol + 1;

    const round = bracket.rounds[rIdx];
    const nextRound = bracket.rounds[rIdx + 1];

    nextRound.forEach((_, nMIdx) => {
      const topIdx = nMIdx * 2;
      const botIdx = nMIdx * 2 + 1;

      if (topIdx >= round.length || botIdx >= round.length) return;

      const posTop = positions[rIdx][topIdx];
      const posBot = positions[rIdx][botIdx];
      const posNext = positions[rIdx + 1][nMIdx];

      // Row tuyệt đối
      const topA = bracketStartRow + posTop;
      const topGap1 = topA + 1;
      const topB = topA + 2;
      const topGap2 = topA + 3;

      const botA = bracketStartRow + posBot;
      const botGap1 = botA + 1;
      const botB = botA + 2;
      const botGap2 = botA + 3;

      // Match đích
      const nextA = bracketStartRow + posNext;
      const nextGap1 = nextA + 1;
      const nextB = nextA + 2;

      // ─── 1. Đường ngang từ Đội B match trên ───
      // Đi từ cột SCORE (baseCol + 1) qua cột LINE (baseCol + 2)
      // Vẽ ở row topB
      const scoreTopB = ws.getCell(topB, lineCol - 1);
      scoreTopB.border = {
        ...(scoreTopB.border || {}),
        right: { style: 'medium', color: { argb: C.line } },
      };

      const lineTopB = ws.getCell(topB, lineCol);
      lineTopB.border = {
        ...(lineTopB.border || {}),
        top: { style: 'medium', color: { argb: C.line } },
        right: { style: 'medium', color: { argb: C.line } },
      };

      // ─── 2. Đường ngang từ Đội B match dưới ───
      // Vẽ ở row botB
      const scoreBotB = ws.getCell(botB, lineCol - 1);
      scoreBotB.border = {
        ...(scoreBotB.border || {}),
        right: { style: 'medium', color: { argb: C.line } },
      };

      const lineBotB = ws.getCell(botB, lineCol);
      lineBotB.border = {
        ...(lineBotB.border || {}),
        bottom: { style: 'medium', color: { argb: C.line } },
        right: { style: 'medium', color: { argb: C.line } },
      };

      // ─── 3. Đường dọc từ topB xuống botB ở cột LINE ───
      for (let r = topB + 1; r < botB; r++) {
        const cell = ws.getCell(r, lineCol);
        cell.border = {
          ...(cell.border || {}),
          right: { style: 'medium', color: { argb: C.line } },
        };
      }

      // ─── 4. Đường ngang vào match đích ───
      // Đường này ở row giữa cặp = (topB + botB) / 2
      // Nhưng để đẹp, chọn row = nextGap1 (hoặc nextA)
      const midRow = Math.floor((topB + botB) / 2);

      // Đường ở cột LINE kéo sang cột TEAM của vòng sau
      const lineMid = ws.getCell(midRow, lineCol);
      lineMid.border = {
        ...(lineMid.border || {}),
        right: { style: 'medium', color: { argb: C.line } },
        top: { style: 'medium', color: { argb: C.line } },
        bottom: { style: 'medium', color: { argb: C.line } },
      };

      // Đường từ cột LINE sang cột TEAM vòng sau (ở row midRow)
      const nextTeamCell = ws.getCell(midRow, nextTeamCol);
      nextTeamCell.border = {
        ...(nextTeamCell.border || {}),
        left: { style: 'medium', color: { argb: C.line } },
      };
    });
  }

  // ─── Tranh hạng 3 ───
  if (bracket.thirdPlaceMatch && totalRounds >= 2) {
    const thirdRow = maxRow + 3;
    const thirdCol = 2 + (totalRounds - 1) * COLS_PER_ROUND;

    ws.mergeCells(thirdRow - 1, thirdCol, thirdRow - 1, thirdCol + 1);
    const labelCell = ws.getCell(thirdRow - 1, thirdCol);
    labelCell.value = '🥉 TRANH HẠNG 3';
    labelCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.thirdBg } };
    labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    labelCell.border = border(C.thirdBg);

    drawMatch(ws, thirdRow, thirdCol, bracket.thirdPlaceMatch, {
      showTT: false,
      isThird: true,
    });
  }
}

// ============================================================
// COMPUTE POSITIONS
// ============================================================
function computePositions(bracket, rowsPerMatch, rowSep) {
  const positions = [];
  const firstRoundCount = bracket.rounds[0].length;
  const rowHeight = rowsPerMatch + rowSep;

  const firstPos = [];
  for (let i = 0; i < firstRoundCount; i++) {
    firstPos.push(i * rowHeight);
  }
  positions.push(firstPos);

  for (let r = 1; r < bracket.rounds.length; r++) {
    const prev = positions[r - 1];
    const curr = [];
    for (let i = 0; i < bracket.rounds[r].length; i++) {
      const posA = prev[i * 2];
      const posB = prev[i * 2 + 1];
      curr.push(Math.floor((posA + posB) / 2));
    }
    positions.push(curr);
  }

  return positions;
}

// ============================================================
// DRAW MATCH (4 rows)
// ============================================================
function drawMatch(ws, startRow, baseCol, match, options = {}) {
  const { showTT = false, isThird = false } = options;

  const isBye = match.isBye;
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  const rowA = startRow;
  const rowGap1 = startRow + 1;
  const rowB = startRow + 2;
  const rowGap2 = startRow + 3;

  // ─── Đội A ───
  const cellA = ws.getCell(rowA, baseCol);
  cellA.value = match.teamA ? match.teamA.name : (isBye && match.teamB ? '' : '—');
  cellA.font = {
    size: 10, bold: isWinnerA,
    color: { argb: isWinnerA ? C.winnerFg : (isBye ? C.byeFg : 'FF0F172A') },
  };
  cellA.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  cellA.border = border(C.border);
  if (isWinnerA) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.winnerBg } };
  } else if (isBye && match.teamA) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.byeBg } };
  } else if (isThird) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
  }

  const scoreA = ws.getCell(rowA, baseCol + 1);
  scoreA.value = match.scoreA !== null && match.scoreA !== undefined ? match.scoreA : '';
  scoreA.font = {
    size: 11, bold: true,
    color: { argb: isWinnerA ? C.winnerFg : 'FF6C757D' },
  };
  scoreA.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreA.border = border(C.border);
  if (isWinnerA) {
    scoreA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.winnerBg } };
  }

  // ─── GAP1 (không border left/right ở cột TEAM/SCORE để thông với đường nối) ───
  const gap1Team = ws.getCell(rowGap1, baseCol);
  gap1Team.value = '';
  gap1Team.border = {
    left: { style: 'thin', color: { argb: C.border } },
    right: { style: 'thin', color: { argb: C.border } },
  };
  const gap1Score = ws.getCell(rowGap1, baseCol + 1);
  gap1Score.value = '';
  gap1Score.border = {
    left: { style: 'thin', color: { argb: C.border } },
    right: { style: 'thin', color: { argb: C.border } },
  };

  // ─── Đội B ───
  const cellB = ws.getCell(rowB, baseCol);
  cellB.value = match.teamB ? match.teamB.name : (isBye && match.teamA ? '⭐ BYE' : '—');
  cellB.font = {
    size: 10, bold: isWinnerB,
    color: { argb: isWinnerB ? C.winnerFg : (isBye ? C.byeFg : 'FF0F172A') },
  };
  cellB.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  cellB.border = border(C.border);
  if (isWinnerB) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.winnerBg } };
  } else if (isBye && match.teamB) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.byeBg } };
  } else if (isBye && match.teamA) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.byeBg } };
  } else if (isThird) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
  }

  const scoreB = ws.getCell(rowB, baseCol + 1);
  scoreB.value = match.scoreB !== null && match.scoreB !== undefined ? match.scoreB : '';
  scoreB.font = {
    size: 11, bold: true,
    color: { argb: isWinnerB ? C.winnerFg : 'FF6C757D' },
  };
  scoreB.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreB.border = border(C.border);
  if (isWinnerB) {
    scoreB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.winnerBg } };
  }

  // ─── GAP2 ───
  const gap2Team = ws.getCell(rowGap2, baseCol);
  gap2Team.value = '';
  const gap2Score = ws.getCell(rowGap2, baseCol + 1);
  gap2Score.value = '';

  // ─── Cột LINE (baseCol + 2) — để trống cho vẽ ───
  for (const r of [rowA, rowGap1, rowB, rowGap2]) {
    const cell = ws.getCell(r, baseCol + 2);
    cell.value = '';
  }

  // ─── TT ───
  if (showTT) {
    ws.mergeCells(rowA, 1, rowB, 1);
    const tt = ws.getCell(rowA, 1);
    tt.value = match.matchIndex + 1;
    tt.font = { size: 9, color: { argb: 'FF94A3B8' }, bold: true };
    tt.alignment = { horizontal: 'center', vertical: 'middle' };
    tt.border = border(C.border);
  }

  // Row heights
  ws.getRow(rowA).height = ROW_HEIGHT_TEAM;
  ws.getRow(rowGap1).height = ROW_HEIGHT_GAP;
  ws.getRow(rowB).height = ROW_HEIGHT_TEAM;
  ws.getRow(rowGap2).height = ROW_HEIGHT_GAP;
}

// ============================================================
// TEAM LIST
// ============================================================
function drawTeamList(ws, bracket) {
  ws.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Tên đội / VĐV', key: 'name', width: 30 },
    { header: 'CLB / Đơn vị', key: 'club', width: 25 },
    { header: 'Vị trí vòng 1', key: 'position', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 18 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => styleHeader(cell));

  const firstRound = bracket.rounds[0];
  let stt = 1;
  firstRound.forEach((match) => {
    if (match.teamA) {
      ws.addRow({
        stt: stt++,
        name: match.teamA.name,
        club: match.teamA.club || '—',
        position: `${match.id} — Slot A`,
        status: match.isBye ? '⭐ BYE' : (match.status === 'done' ? '✓ Đã đấu' : '🎯 Chờ'),
      });
    }
    if (match.teamB) {
      ws.addRow({
        stt: stt++,
        name: match.teamB.name,
        club: match.teamB.club || '—',
        position: `${match.id} — Slot B`,
        status: match.isBye ? '⭐ BYE' : (match.status === 'done' ? '✓ Đã đấu' : '🎯 Chờ'),
      });
    }
  });

  ws.eachRow((r, n) => {
    if (n === 1) return;
    r.height = 20;
    r.eachCell((cell) => {
      cell.border = border(C.border);
      cell.alignment = { vertical: 'middle' };
    });
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).font = { bold: true };
  });
}

// ============================================================
// STYLE HELPERS
// ============================================================
function styleHeader(cell) {
  cell.font = { bold: true, size: 10, color: { argb: C.headerFg } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = border(C.headerBg);
}

function border(color) {
  return {
    top: { style: 'thin', color: { argb: color } },
    left: { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    right: { style: 'thin', color: { argb: color } },
  };
}

// ============================================================
// DOWNLOAD
// ============================================================
export async function downloadBracketExcel(bracket, options = {}) {
  const blob = await exportBracketToExcel(bracket, options);
  const safeName = (options.categoryName || 'BocTham')
    .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
  const filename = options.filename
    || `Bracket_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return filename;
}
