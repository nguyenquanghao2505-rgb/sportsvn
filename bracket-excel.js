// ============================================================
// bracket-excel.js v8 — Đường nối liền mạch như hình vẽ tay
// Kỹ thuật: 2 cột SPACER mỗi vòng để vẽ đường
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
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.2, right: 0.2, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }],
  });

  drawBracket(ws, bracket, { categoryName, tournamentName });

  if (includeTeamList) {
    const wsTeams = wb.addWorksheet('Danh sách VĐV');
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
  headerBg:   'FF1A3A7A',
  headerFg:   'FFFFFFFF',
  titleBg:    'FF0D1B3E',
  winnerBg:   'FFD1FAE5',
  winnerFg:   'FF16A34A',
  byeBg:      'FFFFF3CD',
  byeFg:      'FFB45309',
  border:     'FFCBD5E1',
  lineColor:  'FF1E3A8A',
  thirdBg:    'FFE67E22',
};

// ─── Cấu trúc cột ───
// Vòng 1:  A(TT)  | B(Tên) | C(Điểm) | D(SPACER)
// Vòng 2:  E(SPACER) | F(Tên) | G(Điểm) | H(SPACER)
// Vòng 3:  I(SPACER) | J(Tên) | K(Điểm) | L(SPACER)
// ...
// Mỗi vòng = 4 cột: [SPACER] Tên Điểm [SPACER]
// Riêng vòng 1: TT Tên Điểm [SPACER]

const COL_W = {
  TT:     5,   // Cột A
  TEAM:   22,  // Tên VĐV
  SCORE:  5,   // Điểm
  SPACER: 3,   // Cột spacer để vẽ đường (3 ký tự)
};

// ============================================================
// MAIN
// ============================================================
function drawBracket(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;

  // Cấu trúc cột cho mỗi vòng: [SPACER] [TÊN] [ĐIỂM] [SPACER]
  // 4 cột cho mỗi vòng (riêng vòng 1 thay SPACER trái = TT)
  const COLS_PER_ROUND = 4;

  // ─── Cấu hình cột ───
  // Vòng 1: A=TT, B=Tên, C=Điểm, D=Spacer
  ws.getColumn(1).width = COL_W.TT;
  ws.getColumn(2).width = COL_W.TEAM;
  ws.getColumn(3).width = COL_W.SCORE;
  ws.getColumn(4).width = COL_W.SPACER;

  // Các vòng tiếp theo: [Spacer][Tên][Điểm][Spacer]
  for (let r = 1; r < totalRounds; r++) {
    const baseCol = 1 + r * COLS_PER_ROUND;
    ws.getColumn(baseCol).width     = COL_W.SPACER;  // Spacer trái (vẽ đường dọc)
    ws.getColumn(baseCol + 1).width = COL_W.TEAM;    // Tên
    ws.getColumn(baseCol + 2).width = COL_W.SCORE;   // Điểm
    ws.getColumn(baseCol + 3).width = COL_W.SPACER;  // Spacer phải (vẽ đường ngang)
  }

  const bracketCols = 1 + totalRounds * COLS_PER_ROUND;

  // Cột tham chiếu bên phải
  const REF_COL = bracketCols + 1;
  ws.getColumn(REF_COL).width     = 5;   // TT
  ws.getColumn(REF_COL + 1).width = 6;   // Mã
  ws.getColumn(REF_COL + 2).width = 30;  // Tên
  const totalCols = REF_COL + 2;

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

  // ─── Sub-title ───
  ws.mergeCells(row, 1, row, totalCols);
  const subCell = ws.getCell(row, 1);
  subCell.value = `${bracket.teamCount} VĐV · Bracket ${bracket.bracketSize} · ${bracket.numByes} BYE · ${bracket.rounds.length} vòng`;
  subCell.font = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 18;
  row++;

  row++; // trống

  // ─── Header ───
  const headerRow = row;

  // Header vòng 1
  ws.getCell(headerRow, 1).value = 'TT';
  styleHeader(ws.getCell(headerRow, 1));

  ws.mergeCells(headerRow, 2, headerRow, 3);
  const h1 = ws.getCell(headerRow, 2);
  h1.value = bracket.roundNames[0].toUpperCase();
  styleHeader(h1);
  // Cột D vẫn để header style
  styleHeader(ws.getCell(headerRow, 4));

  // Header các vòng tiếp theo
  for (let r = 1; r < totalRounds; r++) {
    const baseCol = 1 + r * COLS_PER_ROUND;
    ws.getCell(headerRow, baseCol).border = border(C.headerBg);
    ws.getCell(headerRow, baseCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };

    ws.mergeCells(headerRow, baseCol + 1, headerRow, baseCol + 2);
    const cell = ws.getCell(headerRow, baseCol + 1);
    cell.value = bracket.roundNames[r].toUpperCase();
    styleHeader(cell);

    ws.getCell(headerRow, baseCol + 3).border = border(C.headerBg);
    ws.getCell(headerRow, baseCol + 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  }

  // Header cột tham chiếu
  ws.getCell(headerRow, REF_COL).value = 'TT';
  styleHeader(ws.getCell(headerRow, REF_COL));
  ws.getCell(headerRow, REF_COL + 1).value = 'Mã';
  styleHeader(ws.getCell(headerRow, REF_COL + 1));
  ws.getCell(headerRow, REF_COL + 2).value = 'Tên VĐV';
  styleHeader(ws.getCell(headerRow, REF_COL + 2));

  ws.getRow(headerRow).height = 26;
  row++;

  // ─── Vẽ bracket ───
  const bracketStartRow = row;
  const ROWS_PER_MATCH = 2;   // Đội A + Đội B
  const ROW_GAP = 1;          // Row trống giữa các match

  const positions = computePositions(bracket, ROWS_PER_MATCH, ROW_GAP);
  let maxRow = bracketStartRow;

  // ─── Vẽ tất cả match ───
  for (let rIdx = 0; rIdx < totalRounds; rIdx++) {
    const round = bracket.rounds[rIdx];
    const teamCol = 1 + rIdx * COLS_PER_ROUND + (rIdx === 0 ? 1 : 1); // Cột Tên
    const scoreCol = teamCol + 1;

    round.forEach((match, mIdx) => {
      const startRow = bracketStartRow + positions[rIdx][mIdx];
      drawMatch(ws, startRow, teamCol, scoreCol, match, {
        showTT: rIdx === 0,
        ttCol: 1,
      });
      const endRow = startRow + ROWS_PER_MATCH - 1;
      if (endRow > maxRow) maxRow = endRow;
    });
  }

  // ─── Vẽ đường nối ───
  for (let rIdx = 0; rIdx < totalRounds - 1; rIdx++) {
    // Cột spacer phải của vòng hiện tại (vẽ đường ngang)
    const rightSpacerCol = 1 + rIdx * COLS_PER_ROUND + 3;
    // Cột spacer trái của vòng sau (vẽ đường dọc)
    const leftSpacerCol = 1 + (rIdx + 1) * COLS_PER_ROUND;
    // Cột Tên vòng sau (đích đường ngang cuối)
    const nextTeamCol = leftSpacerCol + 1;

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
      const rowTopA = bracketStartRow + posTop;
      const rowTopB = rowTopA + 1;
      const rowBotA = bracketStartRow + posBot;
      const rowBotB = rowBotA + 1;

      // ─── Đường ngang từ ĐỘI B match trên → cột Spacer phải ───
      // Chọn đội B match trên: rowTopB
      setBorderRight(ws, rowTopB, rightSpacerCol - 1, C.lineColor);
      setBorderRight(ws, rowTopB, rightSpacerCol, C.lineColor);

      // ─── Đường ngang từ ĐỘI B match dưới → cột Spacer phải ───
      setBorderRight(ws, rowBotB, rightSpacerCol - 1, C.lineColor);
      setBorderRight(ws, rowBotB, rightSpacerCol, C.lineColor);

      // ─── Đường dọc ở cột Spacer phải (từ rowTopB xuống rowBotB) ───
      for (let r = rowTopB; r <= rowBotB; r++) {
        setBorderRight(ws, r, rightSpacerCol, C.lineColor);
      }

      // ─── Đường ngang vào match đích ───
      // Nằm ở row giữa 2 match nguồn = (rowTopB + rowBotB) / 2
      const midRow = Math.floor((rowTopB + rowBotB) / 2);

      // Từ cột Spacer phải → cột Spacer trái của vòng sau
      // Vẽ border-top ở cột Spacer trái (đường ngang dài)
      setBorderRight(ws, midRow, rightSpacerCol, C.lineColor);

      // Vẽ đường ngang giữa 2 cột Spacer
      // (Dùng border-top của các ô giữa)
      // Đơn giản: ghi border-top cho row midRow ở cột Spacer trái + cột Tên
      setBorderTop(ws, midRow, leftSpacerCol, C.lineColor);
      setBorderTop(ws, midRow, nextTeamCol, C.lineColor);
      setBorderTop(ws, midRow, nextTeamCol + 1, C.lineColor);
    });
  }

  // ─── Vẽ cột tham chiếu ───
  drawReferenceColumn(ws, bracket, bracketStartRow, REF_COL, maxRow);

  // ─── Tranh hạng 3 ───
  if (bracket.thirdPlaceMatch && totalRounds >= 2) {
    const thirdRow = maxRow + 3;
    const thirdTeamCol = 1 + (totalRounds - 1) * COLS_PER_ROUND + 1;
    const thirdScoreCol = thirdTeamCol + 1;

    ws.mergeCells(thirdRow - 1, thirdTeamCol, thirdRow - 1, thirdScoreCol);
    const labelCell = ws.getCell(thirdRow - 1, thirdTeamCol);
    labelCell.value = '🥉 TRANH HẠNG 3';
    labelCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.thirdBg } };
    labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    labelCell.border = border(C.thirdBg);

    drawMatch(ws, thirdRow, thirdTeamCol, thirdScoreCol, bracket.thirdPlaceMatch, {
      showTT: false,
      isThird: true,
    });
  }
}

// ============================================================
// BORDER HELPERS
// ============================================================
function setBorderRight(ws, row, col, color) {
  const cell = ws.getCell(row, col);
  cell.border = {
    ...(cell.border || {}),
    right: { style: 'medium', color: { argb: color } },
  };
}

function setBorderTop(ws, row, col, color) {
  const cell = ws.getCell(row, col);
  cell.border = {
    ...(cell.border || {}),
    top: { style: 'medium', color: { argb: color } },
  };
}

// ============================================================
// DRAW MATCH
// ============================================================
function drawMatch(ws, startRow, teamCol, scoreCol, match, options = {}) {
  const { showTT = false, ttCol = 1, isThird = false } = options;

  const isBye = match.isBye;
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  const rowA = startRow;
  const rowB = startRow + 1;

  // ─── Đội A ───
  const cellA = ws.getCell(rowA, teamCol);
  cellA.value = match.teamA ? match.teamA.name : (isBye && match.teamB ? '' : '—');
  cellA.font = {
    size: 10,
    bold: isWinnerA,
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

  const scoreA = ws.getCell(rowA, scoreCol);
  scoreA.value = match.scoreA !== null && match.scoreA !== undefined ? match.scoreA : '';
  scoreA.font = {
    size: 11,
    bold: true,
    color: { argb: isWinnerA ? C.winnerFg : 'FF6C757D' },
  };
  scoreA.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreA.border = border(C.border);
  if (isWinnerA) {
    scoreA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.winnerBg } };
  }

  // ─── Đội B ───
  const cellB = ws.getCell(rowB, teamCol);
  cellB.value = match.teamB ? match.teamB.name : (isBye && match.teamA ? '⭐ BYE' : '—');
  cellB.font = {
    size: 10,
    bold: isWinnerB,
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

  const scoreB = ws.getCell(rowB, scoreCol);
  scoreB.value = match.scoreB !== null && match.scoreB !== undefined ? match.scoreB : '';
  scoreB.font = {
    size: 11,
    bold: true,
    color: { argb: isWinnerB ? C.winnerFg : 'FF6C757D' },
  };
  scoreB.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreB.border = border(C.border);
  if (isWinnerB) {
    scoreB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.winnerBg } };
  }

  // ─── TT ───
  if (showTT) {
    ws.mergeCells(rowA, ttCol, rowB, ttCol);
    const tt = ws.getCell(rowA, ttCol);
    tt.value = match.matchIndex + 1;
    tt.font = { size: 9, color: { argb: 'FF94A3B8' }, bold: true };
    tt.alignment = { horizontal: 'center', vertical: 'middle' };
    tt.border = border(C.border);
  }

  ws.getRow(rowA).height = 20;
  ws.getRow(rowB).height = 20;
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
      curr.push(Math.floor((posA + posB) / 2));
    }
    positions.push(curr);
  }

  return positions;
}

// ============================================================
// REFERENCE COLUMN
// ============================================================
function drawReferenceColumn(ws, bracket, startRow, refCol, maxRow) {
  const allTeams = [];
  bracket.rounds[0].forEach((match) => {
    if (match.teamA) allTeams.push(match.teamA);
    if (match.teamB) allTeams.push(match.teamB);
  });

  allTeams.forEach((team, i) => {
    const r = startRow + i;
    if (r > maxRow + 10) return;

    const ttCell = ws.getCell(r, refCol);
    ttCell.value = i + 1;
    ttCell.font = { size: 9, color: { argb: 'FF94A3B8' } };
    ttCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ttCell.border = border(C.border);

    const codeCell = ws.getCell(r, refCol + 1);
    codeCell.value = i + 1;
    codeCell.font = { size: 9 };
    codeCell.alignment = { horizontal: 'center', vertical: 'middle' };
    codeCell.border = border(C.border);

    const nameCell = ws.getCell(r, refCol + 2);
    nameCell.value = `${team.name}${team.club ? ` (${team.club})` : ''}`;
    nameCell.font = { size: 10, color: { argb: 'FF0F172A' } };
    nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    nameCell.border = border(C.border);

    ws.getRow(r).height = 18;
  });
}

// ============================================================
// TEAM LIST
// ============================================================
function drawTeamList(ws, bracket) {
  ws.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Tên VĐV / Đội', key: 'name', width: 32 },
    { header: 'CLB / Đơn vị', key: 'club', width: 25 },
    { header: 'Vị trí vòng 1', key: 'position', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 18 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.height = 28;
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
    top:    { style: 'thin', color: { argb: color } },
    left:   { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    right:  { style: 'thin', color: { argb: color } },
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
