// ============================================================
// bracket-excel.js v7 — Excel bracket với đường nối border
// Hỗ trợ tới 164 VĐV (bracket 256)
// Có cột tham chiếu TT/Mã/Tên đầy đủ
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

  // Sheet 1: Bracket
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

  // Sheet 2: Danh sách VĐV
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
  lineColor:  'FF1E3A8A',   // Xanh đậm cho đường nối
  thirdBg:    'FFE67E22',
  sectionBg:  'FF1E293B',
};

// ============================================================
// CẤU TRÚC CỘT
// ============================================================
// Mỗi vòng = 4 cột: TT | Tên | Điểm | Line
// Sau đó 1 cột GAP nhỏ
//
// Vòng 1:  A=TT | B=Tên | C=Điểm | D=Line
// Vòng 2:  E=Tên | F=Điểm | G=Line
// Vòng 3:  H=Tên | I=Điểm | J=Line
// ...
//
// Riêng vòng 1 có thêm cột A=TT
// ============================================================

const COL = {
  TT:    5,    // Cột A: Số TT
  TEAM:  24,   // Cột tên VĐV
  SCORE: 5,    // Cột điểm
  LINE:  2,    // Cột đường nối (mỏng)
};

// ============================================================
// MAIN
// ============================================================
function drawBracket(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;
  const COLS_PER_ROUND = 3; // Tên + Điểm + Line

  // ─── Cấu hình cột ───
  // Cột A: TT
  ws.getColumn(1).width = COL.TT;

  // Mỗi vòng chiếm 3 cột (Tên + Điểm + Line)
  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.getColumn(baseCol).width     = COL.TEAM;   // Tên
    ws.getColumn(baseCol + 1).width = COL.SCORE;  // Điểm
    ws.getColumn(baseCol + 2).width = COL.LINE;   // Line (mỏng)
  }

  const bracketCols = 1 + totalRounds * COLS_PER_ROUND;

  // Cột tham chiếu (bên phải): TT | Mã | Tên
  const REF_START_COL = bracketCols + 2;
  ws.getColumn(REF_START_COL).width     = 5;   // TT
  ws.getColumn(REF_START_COL + 1).width = 5;   // Mã số
  ws.getColumn(REF_START_COL + 2).width = 30;  // Tên VĐV
  const totalCols = REF_START_COL + 2;

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

  row++; // Trống

  // ─── Header các vòng ───
  const headerRow = row;

  // Cột TT header
  const ttHeader = ws.getCell(headerRow, 1);
  ttHeader.value = 'TT';
  styleHeader(ttHeader);

  // Header mỗi vòng (merge 2 cột: Tên + Điểm)
  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.mergeCells(headerRow, baseCol, headerRow, baseCol + 1);
    const cell = ws.getCell(headerRow, baseCol);
    cell.value = bracket.roundNames[r].toUpperCase();
    styleHeader(cell);
  }

  // Header cột Line (không có chữ, chỉ màu)
  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND + 2;
    const cell = ws.getCell(headerRow, baseCol);
    cell.border = border(C.headerBg);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  }

  // Header cột tham chiếu
  const refHeaderTT = ws.getCell(headerRow, REF_START_COL);
  refHeaderTT.value = 'TT';
  styleHeader(refHeaderTT);

  const refHeaderCode = ws.getCell(headerRow, REF_START_COL + 1);
  refHeaderCode.value = 'Mã';
  styleHeader(refHeaderCode);

  const refHeaderName = ws.getCell(headerRow, REF_START_COL + 2);
  refHeaderName.value = 'Tên VĐV';
  styleHeader(refHeaderName);

  ws.getRow(headerRow).height = 26;
  row++;

  // ─── Vẽ bracket ───
  const bracketStartRow = row;
  const ROWS_PER_MATCH = 2;
  const ROW_GAP = 1;

  const positions = computePositions(bracket, ROWS_PER_MATCH, ROW_GAP);

  let maxRow = bracketStartRow;

  // Vẽ tất cả match
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

  // ─── Vẽ cột tham chiếu (danh sách VĐV gốc) ───
  drawReferenceColumn(ws, bracket, bracketStartRow, REF_START_COL, maxRow);

  // ─── Vẽ đường nối giữa các vòng ───
  for (let rIdx = 0; rIdx < totalRounds - 1; rIdx++) {
    const lineCol = 2 + rIdx * COLS_PER_ROUND + 2;
    const nextTeamCol = 2 + (rIdx + 1) * COLS_PER_ROUND;

    const round = bracket.rounds[rIdx];
    const nextRound = bracket.rounds[rIdx + 1];

    nextRound.forEach((_, nMIdx) => {
      const topIdx = nMIdx * 2;
      const botIdx = nMIdx * 2 + 1;

      if (topIdx >= round.length || botIdx >= round.length) return;

      const posTop = positions[rIdx][topIdx];
      const posBot = positions[rIdx][botIdx];
      const posNext = positions[rIdx + 1][nMIdx];

      const rowTopA = bracketStartRow + posTop;
      const rowTopB = rowTopA + 1;
      const rowBotA = bracketStartRow + posBot;
      const rowBotB = rowBotA + 1;
      const rowNextA = bracketStartRow + posNext;
      const rowNextB = rowNextA + 1;

      // ═══════════════════════════════════════════════════════
      // VẼ ĐƯỜNG NỐI
      // ═══════════════════════════════════════════════════════

      // ─── Đường ngang từ Đội A match trên ───
      // Vẽ border-right ở cột SCORE (điểm) và LINE
      const scoreTopA = ws.getCell(rowTopA, lineCol - 1);
      scoreTopA.border = {
        ...(scoreTopA.border || {}),
        right: { style: 'medium', color: { argb: C.lineColor } },
      };

      // ─── Đường ngang từ Đội B match trên ───
      const scoreTopB = ws.getCell(rowTopB, lineCol - 1);
      scoreTopB.border = {
        ...(scoreTopB.border || {}),
        right: { style: 'medium', color: { argb: C.lineColor } },
      };

      // ─── Đường dọc ở cột Line (nối 2 đội match trên) ───
      for (let r = rowTopA; r <= rowTopB; r++) {
        const cell = ws.getCell(r, lineCol);
        cell.border = {
          ...(cell.border || {}),
          right: { style: 'medium', color: { argb: C.lineColor } },
        };
      }

      // ─── Đường dọc giữa 2 match (từ rowTopB đến rowBotA) ───
      for (let r = rowTopB + 1; r < rowBotA; r++) {
        const cell = ws.getCell(r, lineCol);
        cell.border = {
          ...(cell.border || {}),
          right: { style: 'medium', color: { argb: C.lineColor } },
        };
      }

      // ─── Đường ngang từ Đội A match dưới ───
      const scoreBotA = ws.getCell(rowBotA, lineCol - 1);
      scoreBotA.border = {
        ...(scoreBotA.border || {}),
        right: { style: 'medium', color: { argb: C.lineColor } },
      };

      // ─── Đường ngang từ Đội B match dưới ───
      const scoreBotB = ws.getCell(rowBotB, lineCol - 1);
      scoreBotB.border = {
        ...(scoreBotB.border || {}),
        right: { style: 'medium', color: { argb: C.lineColor } },
      };

      // ─── Đường dọc ở cột Line (nối 2 đội match dưới) ───
      for (let r = rowBotA; r <= rowBotB; r++) {
        const cell = ws.getCell(r, lineCol);
        cell.border = {
          ...(cell.border || {}),
          right: { style: 'medium', color: { argb: C.lineColor } },
        };
      }

      // ─── Đường ngang vào match đích ───
      // Đường này chạy ở giữa 2 match = row giữa của cặp match
      const midRow = Math.floor((rowTopB + rowBotA) / 2);
      const lineMidCell = ws.getCell(midRow, lineCol);
      lineMidCell.border = {
        ...(lineMidCell.border || {}),
        top: { style: 'medium', color: { argb: C.lineColor } },
        bottom: { style: 'medium', color: { argb: C.lineColor } },
        right: { style: 'medium', color: { argb: C.lineColor } },
      };

      // ─── Đường ngang sang cột Tên của vòng sau ───
      const nextTeamCell = ws.getCell(midRow, nextTeamCol);
      nextTeamCell.border = {
        ...(nextTeamCell.border || {}),
        left: { style: 'medium', color: { argb: C.lineColor } },
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
// DRAW MATCH (2 rows: Đội A + Đội B)
// ============================================================
function drawMatch(ws, startRow, baseCol, match, options = {}) {
  const { showTT = false, isThird = false } = options;

  const isBye = match.isBye;
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  const rowA = startRow;
  const rowB = startRow + 1;

  // ─── Đội A (row A) ───
  const cellA = ws.getCell(rowA, baseCol);
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

  // ─── Điểm A ───
  const scoreA = ws.getCell(rowA, baseCol + 1);
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

  // ─── Đội B (row B) ───
  const cellB = ws.getCell(rowB, baseCol);
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

  // ─── Điểm B ───
  const scoreB = ws.getCell(rowB, baseCol + 1);
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
  ws.getRow(rowA).height = 20;
  ws.getRow(rowB).height = 20;
}

// ============================================================
// DRAW REFERENCE COLUMN
// ============================================================
function drawReferenceColumn(ws, bracket, startRow, refCol, maxRow) {
  // Lấy tất cả VĐV từ vòng 1
  const allTeams = [];
  bracket.rounds[0].forEach((match) => {
    if (match.teamA) allTeams.push(match.teamA);
    if (match.teamB) allTeams.push(match.teamB);
  });

  // Ghi vào cột tham chiếu
  allTeams.forEach((team, i) => {
    const r = startRow + i;
    if (r > maxRow + 10) return;

    // TT
    const ttCell = ws.getCell(r, refCol);
    ttCell.value = i + 1;
    ttCell.font = { size: 9, color: { argb: 'FF94A3B8' } };
    ttCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ttCell.border = border(C.border);

    // Mã số (dùng index làm mã tạm)
    const codeCell = ws.getCell(r, refCol + 1);
    codeCell.value = i + 1;
    codeCell.font = { size: 9 };
    codeCell.alignment = { horizontal: 'center', vertical: 'middle' };
    codeCell.border = border(C.border);

    // Tên
    const nameCell = ws.getCell(r, refCol + 2);
    nameCell.value = `${team.name}${team.club ? ` (${team.club})` : ''}`;
    nameCell.font = { size: 10, color: { argb: 'FF0F172A' } };
    nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    nameCell.border = border(C.border);

    ws.getRow(r).height = 18;
  });
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
// TEAM LIST SHEET
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
