// ============================================================
// bracket-excel.js v4 — 3 rows per match, gap ở giữa để vẽ đường
// Layout khớp với file Excel mẫu
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
  line:      'FF1E3A8A',  // Xanh đậm cho đường nối
  titleBg:   'FF0D1B3E',
  thirdBg:   'FFE67E22',
};

const W = {
  TT:     5,
  TEAM:   22,
  SCORE:  5,
  LINE:   3,   // Cột đường nối (mỏng)
};

// ─── Số rows cho mỗi match ───
// 3 rows: Đội A | GAP | Đội B
const ROWS_PER_MATCH = 3;
const ROW_GAP = 1;  // 1 row trống giữa các match

// ============================================================
// MAIN
// ============================================================
function drawBracket(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;

  // Mỗi vòng = 3 cột: TEAM | SCORE | LINE
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
  const positions = computePositions(bracket, ROWS_PER_MATCH, ROW_GAP);

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
      const endRow = startRow + ROWS_PER_MATCH - 1;
      if (endRow > maxRow) maxRow = endRow;
    });
  }

  // Vẽ đường nối
  for (let rIdx = 0; rIdx < totalRounds - 1; rIdx++) {
    const lineCol = 2 + rIdx * COLS_PER_ROUND + 2;
    const nextTeamCol = lineCol + 1;
    const round = bracket.rounds[rIdx];
    const nextRound = bracket.rounds[rIdx + 1];

    nextRound.forEach((_, nMIdx) => {
      const matchTopIdx = nMIdx * 2;
      const matchBotIdx = nMIdx * 2 + 1;

      if (matchTopIdx >= round.length || matchBotIdx >= round.length) return;

      const posTop = positions[rIdx][matchTopIdx];
      const posBot = positions[rIdx][matchBotIdx];
      const posNext = positions[rIdx + 1][nMIdx];

      // Row tuyệt đối (0-index trong bracket)
      const rowTopA = bracketStartRow + posTop;           // Đội A match trên
      const rowTopGap = rowTopA + 1;                       // GAP của match trên
      const rowTopB = rowTopA + 2;                         // Đội B match trên

      const rowBotA = bracketStartRow + posBot;           // Đội A match dưới
      const rowBotGap = rowBotA + 1;                       // GAP của match dưới
      const rowBotB = rowBotA + 2;                         // Đội B match dưới

      // Match đích: nằm giữa 2 match nguồn
      const rowNextA = bracketStartRow + posNext;         // Đội A match đích
      const rowNextGap = rowNextA + 1;                     // GAP của match đích
      const rowNextB = rowNextA + 2;                       // Đội B match đích

      // ═══════════════════════════════════════════════════════
      // VẼ ĐƯỜNG NỐI
      // ═══════════════════════════════════════════════════════

      // ─── Bước 1: Đường ngang từ ĐỘI A match trên ───
      // Ở row GAP của match trên: vẽ border-top (đường trên) + border-right
      const gapTop = ws.getCell(rowTopGap, lineCol);
      gapTop.border = {
        ...(gapTop.border || {}),
        top: { style: 'medium', color: { argb: C.line } },
        right: { style: 'medium', color: { argb: C.line } },
      };

      // ─── Bước 2: Đường dọc từ GAP match trên xuống GAP match dưới ───
      for (let r = rowTopGap + 1; r < rowBotGap; r++) {
        const cell = ws.getCell(r, lineCol);
        cell.border = {
          ...(cell.border || {}),
          right: { style: 'medium', color: { argb: C.line } },
        };
      }

      // ─── Bước 3: Đường ngang từ ĐỘI B match dưới (ở GAP) ───
      const gapBot = ws.getCell(rowBotGap, lineCol);
      gapBot.border = {
        ...(gapBot.border || {}),
        bottom: { style: 'medium', color: { argb: C.line } },
        right: { style: 'medium', color: { argb: C.line } },
      };

      // ─── Bước 4: Đường ngang cuối cùng từ cột LINE → cột TEAM vòng sau ───
      // Đặt ở GAP của match đích (rowNextGap)
      const gapNext = ws.getCell(rowNextGap, lineCol);
      gapNext.border = {
        ...(gapNext.border || {}),
        right: { style: 'medium', color: { argb: C.line } },
        top: { style: 'medium', color: { argb: C.line } },
        bottom: { style: 'medium', color: { argb: C.line } },
      };

      // Đường ngang sang cột TEAM vòng sau
      const nextTeamCell = ws.getCell(rowNextGap, nextTeamCol);
      nextTeamCell.border = {
        ...(nextTeamCell.border || {}),
        left: { style: 'medium', color: { argb: C.line } },
      };

      // ─── Bước 5: Vẽ ở GAP của match trên (từ cột TEAM/SCORE sang LINE) ───
      // Đường ngang từ Điểm đội A → LINE (ở row A)
      const scoreTopA = ws.getCell(rowTopA, lineCol - 1);
      scoreTopA.border = {
        ...(scoreTopA.border || {}),
        right: { style: 'medium', color: { argb: C.line } },
      };

      const scoreBotB = ws.getCell(rowBotB, lineCol - 1);
      scoreBotB.border = {
        ...(scoreBotB.border || {}),
        right: { style: 'medium', color: { argb: C.line } },
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
function computePositions(bracket, rowsPerMatch, rowGap) {
  const positions = [];
  const firstRoundCount = bracket.rounds[0].length;
  const rowHeight = rowsPerMatch + rowGap;

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
      // Match đích nằm giữa 2 match nguồn
      curr.push(Math.floor((posA + posB) / 2));
    }
    positions.push(curr);
  }

  return positions;
}

// ============================================================
// DRAW MATCH (3 rows: Đội A | GAP | Đội B)
// ============================================================
function drawMatch(ws, startRow, baseCol, match, options = {}) {
  const { showTT = false, isThird = false } = options;

  const isBye = match.isBye;
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  const rowA = startRow;
  const rowGap = startRow + 1;
  const rowB = startRow + 2;

  // ─── Đội A (rowA) ───
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

  // ─── GAP row (rowGap) — chỉ vẽ viền nhẹ ───
  const gapCellTeam = ws.getCell(rowGap, baseCol);
  gapCellTeam.value = '';
  gapCellTeam.border = {
    left: { style: 'thin', color: { argb: C.border } },
    right: { style: 'thin', color: { argb: C.border } },
  };

  const gapCellScore = ws.getCell(rowGap, baseCol + 1);
  gapCellScore.value = '';
  gapCellScore.border = {
    left: { style: 'thin', color: { argb: C.border } },
    right: { style: 'thin', color: { argb: C.border } },
  };

  const gapCellLine = ws.getCell(rowGap, baseCol + 2);
  gapCellLine.value = '';
  // KHÔNG set border ở đây — để cho phần vẽ đường nối tự do

  // ─── Đội B (rowB) ───
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

  // ─── Cột LINE (baseCol + 2) — không set border, để vẽ đường nối ───
  // Chỉ vẽ viền trên/dưới nhẹ
  const lineA = ws.getCell(rowA, baseCol + 2);
  lineA.value = '';
  lineA.border = {
    top: { style: 'thin', color: { argb: C.border } },
    bottom: { style: 'thin', color: { argb: C.border } },
  };

  const lineB = ws.getCell(rowB, baseCol + 2);
  lineB.value = '';
  lineB.border = {
    top: { style: 'thin', color: { argb: C.border } },
    bottom: { style: 'thin', color: { argb: C.border } },
  };

  // ─── TT (chỉ vòng 1) ───
  if (showTT) {
    ws.mergeCells(rowA, 1, rowB, 1);
    const tt = ws.getCell(rowA, 1);
    tt.value = match.matchIndex + 1;
    tt.font = { size: 9, color: { argb: 'FF94A3B8' }, bold: true };
    tt.alignment = { horizontal: 'center', vertical: 'middle' };
    tt.border = border(C.border);
  }

  // Row heights
  ws.getRow(rowA).height = 18;
  ws.getRow(rowGap).height = 8;    // ← GAP row thấp hơn
  ws.getRow(rowB).height = 18;
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
