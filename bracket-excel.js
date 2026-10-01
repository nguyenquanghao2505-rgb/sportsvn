// ============================================================
// bracket-excel.js v2 — Excel export với bracket chuẩn
// Fix: đường nối, winner flow, đội thắng đẩy lên vòng sau
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
  line:      'FF3B82F6',
  titleBg:   'FF0D1B3E',
  thirdBg:   'FFE67E22',
};

// ============================================================
// MAIN DRAW
// ============================================================
function drawBracket(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;

  // Mỗi vòng chiếm 3 cột: Tên | Điểm | Đường
  // Cột A = TT
  // Vòng 1: cột B, C, D
  // Vòng 2: cột E, F, G
  // Vòng 3: cột H, I, J
  // ...
  const COLS_PER_ROUND = 3;

  // ═══════════════════════════════════════════════════════════
  // Cấu hình cột
  // ═══════════════════════════════════════════════════════════
  ws.getColumn(1).width = 5;  // TT

  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.getColumn(baseCol).width = 24;      // Tên đội
    ws.getColumn(baseCol + 1).width = 5;   // Điểm
    ws.getColumn(baseCol + 2).width = 4;   // Đường nối (mỏng)
  }

  const totalCols = 1 + totalRounds * COLS_PER_ROUND;

  let row = 1;

  // ═══════════════════════════════════════════════════════════
  // Tiêu đề
  // ═══════════════════════════════════════════════════════════
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

  row++; // trống

  // ═══════════════════════════════════════════════════════════
  // Header các vòng
  // ═══════════════════════════════════════════════════════════
  const headerRow = row;

  // TT
  const ttHeader = ws.getCell(headerRow, 1);
  ttHeader.value = 'TT';
  styleHeader(ttHeader);

  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.mergeCells(headerRow, baseCol, headerRow, baseCol + 1);
    const cell = ws.getCell(headerRow, baseCol);
    cell.value = bracket.roundNames[r].toUpperCase();
    styleHeader(cell);

    // Cột đường nối — không header
    const lineHeader = ws.getCell(headerRow, baseCol + 2);
    lineHeader.border = border(C.headerBg);
    lineHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  }
  ws.getRow(headerRow).height = 26;
  row++;

  // ═══════════════════════════════════════════════════════════
  // Tính vị trí các match
  // Mỗi match = 2 rows (đội A + đội B)
  // Khoảng cách giữa các match cùng vòng = 1 row trống
  // ═══════════════════════════════════════════════════════════
  const bracketStartRow = row;
  const ROWS_PER_MATCH = 2;  // 2 đội
  const ROW_GAP = 1;          // 1 row trống giữa các match

  // Tính vị trí Y cho mỗi match ở mỗi vòng
  const positions = computePositions(bracket, ROWS_PER_MATCH, ROW_GAP);

  // ═══════════════════════════════════════════════════════════
  // Vẽ từng match
  // ═══════════════════════════════════════════════════════════
  let maxRow = bracketStartRow;

  for (let rIdx = 0; rIdx < totalRounds; rIdx++) {
    const round = bracket.rounds[rIdx];
    const baseCol = 2 + rIdx * COLS_PER_ROUND;

    round.forEach((match, mIdx) => {
      const startRow = bracketStartRow + positions[rIdx][mIdx];

      // Vẽ match (2 rows: đội A + đội B)
      drawMatch(ws, startRow, baseCol, match, {
        showTT: rIdx === 0,
      });

      const endRow = startRow + ROWS_PER_MATCH - 1;
      if (endRow > maxRow) maxRow = endRow;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Vẽ đường nối giữa các vòng
  // ═══════════════════════════════════════════════════════════
  for (let rIdx = 0; rIdx < totalRounds - 1; rIdx++) {
    const lineCol = 2 + rIdx * COLS_PER_ROUND + 2; // Cột đường nối
    const round = bracket.rounds[rIdx];
    const nextRound = bracket.rounds[rIdx + 1];

    // Mỗi cặp match vòng này → 1 match vòng sau
    nextRound.forEach((nextMatch, nMIdx) => {
      const matchA = round[nMIdx * 2];      // Match trên
      const matchB = round[nMIdx * 2 + 1];  // Match dưới

      if (!matchA || !matchB) return;

      const posA = positions[rIdx][nMIdx * 2];
      const posB = positions[rIdx][nMIdx * 2 + 1];
      const posNext = positions[rIdx + 1][nMIdx];

      // Vẽ connector cho cặp này
      drawConnector(
        ws,
        bracketStartRow,
        lineCol,
        posA, posB, posNext,
        ROWS_PER_MATCH
      );
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Tranh hạng 3
  // ═══════════════════════════════════════════════════════════
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

  // Vòng 1
  const firstPos = [];
  for (let i = 0; i < firstRoundCount; i++) {
    firstPos.push(i * rowHeight);
  }
  positions.push(firstPos);

  // Vòng sau: nằm giữa 2 match vòng trước
  for (let r = 1; r < bracket.rounds.length; r++) {
    const prev = positions[r - 1];
    const curr = [];
    for (let i = 0; i < bracket.rounds[r].length; i++) {
      const posA = prev[i * 2];
      const posB = prev[i * 2 + 1];
      // Vị trí = giữa 2 match, căn giữa theo rowsPerMatch
      curr.push(Math.floor((posA + posB) / 2));
    }
    positions.push(curr);
  }

  return positions;
}

// ============================================================
// DRAW MATCH
// ============================================================
function drawMatch(ws, startRow, baseCol, match, options = {}) {
  const { showTT = false, isThird = false } = options;

  const isBye = match.isBye;
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  // ─── Đội A (row 1) ───
  const cellA = ws.getCell(startRow, baseCol);
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

  // Điểm A
  const scoreA = ws.getCell(startRow, baseCol + 1);
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

  // ─── Đội B (row 2) ───
  const cellB = ws.getCell(startRow + 1, baseCol);
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

  // Điểm B
  const scoreB = ws.getCell(startRow + 1, baseCol + 1);
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

  // ─── Cột đường nối (baseCol + 2) ───
  const lineA = ws.getCell(startRow, baseCol + 2);
  lineA.value = '';
  lineA.border = border(C.border);

  const lineB = ws.getCell(startRow + 1, baseCol + 2);
  lineB.value = '';
  lineB.border = border(C.border);

  // ─── Cột TT (chỉ vòng 1) ───
  if (showTT) {
    ws.mergeCells(startRow, 1, startRow + 1, 1);
    const tt = ws.getCell(startRow, 1);
    tt.value = match.matchIndex + 1;
    tt.font = { size: 9, color: { argb: 'FF94A3B8' }, bold: true };
    tt.alignment = { horizontal: 'center', vertical: 'middle' };
    tt.border = border(C.border);
  }

  ws.getRow(startRow).height = 20;
  ws.getRow(startRow + 1).height = 20;
}

// ============================================================
// DRAW CONNECTOR — Vẽ đường nối giữa 2 match vòng trước → 1 match vòng sau
// ============================================================
function drawConnector(ws, bracketStartRow, lineCol, posA, posB, posNext, rowsPerMatch) {
  // posA, posB, posNext là index tương đối so với bracketStartRow
  // Chuyển sang row tuyệt đối
  const rowA_start = bracketStartRow + posA;          // Đội A của match trên
  const rowA_end = rowA_start + rowsPerMatch - 1;      // Đội B của match trên
  const rowB_start = bracketStartRow + posB;           // Đội A của match dưới
  const rowB_end = rowB_start + rowsPerMatch - 1;      // Đội B của match dưới

  // Vị trí "giữa" của mỗi match (để vẽ đường dọc)
  const midA = rowA_end;  // Giữa 2 đội = row dưới cùng của match A
  const midB = rowB_end;  // row dưới cùng của match B

  // Vị trí match đích (vòng sau) — căn giữa
  const targetRow = bracketStartRow + posNext + rowsPerMatch - 1;

  // ═══════════════════════════════════════════════════════════
  // Vẽ đường cho MATCH TRÊN (match A):
  // - Đường ngang từ cột Tên → cột Đường (đi qua cột Điểm)
  // - Đường dọc xuống giữa 2 match
  // ═══════════════════════════════════════════════════════════
  // Đường ngang: ở row cuối của match A, border-top trên cột đường nối
  const lineA = ws.getCell(midA, lineCol);
  lineA.border = {
    ...(lineA.border || {}),
    top: { style: 'medium', color: { argb: C.line } },
    right: { style: 'medium', color: { argb: C.line } },
  };

  // Đường dọc: từ midA xuống targetRow
  const startCol = lineCol;
  for (let r = midA + 1; r < targetRow; r++) {
    const cell = ws.getCell(r, startCol);
    cell.border = {
      ...(cell.border || {}),
      right: { style: 'medium', color: { argb: C.line } },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // Vẽ đường cho MATCH DƯỚI (match B):
  // - Đường ngang từ cột Tên → cột Đường
  // - Đường dọc lên targetRow
  // ═══════════════════════════════════════════════════════════
  // Đường ngang ở row cuối của match B
  const lineB = ws.getCell(midB, lineCol);
  lineB.border = {
    ...(lineB.border || {}),
    bottom: { style: 'medium', color: { argb: C.line } },
    right: { style: 'medium', color: { argb: C.line } },
  };

  // Đường dọc từ midB lên targetRow
  for (let r = targetRow + 1; r < midB; r++) {
    const cell = ws.getCell(r, startCol);
    cell.border = {
      ...(cell.border || {}),
      right: { style: 'medium', color: { argb: C.line } },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // Vẽ đường ngang cuối cùng: từ cột Đường → cột Tên của match đích
  // ═══════════════════════════════════════════════════════════
  const targetCell = ws.getCell(targetRow, lineCol);
  targetCell.border = {
    ...(targetCell.border || {}),
    right: { style: 'medium', color: { argb: C.line } },
  };

  // Đường ngang từ lineCol → cột Tên của vòng sau
  const nextTeamCol = lineCol + 1;
  const targetTeamCell = ws.getCell(targetRow, nextTeamCol);
  targetTeamCell.border = {
    ...(targetTeamCell.border || {}),
    left: { style: 'medium', color: { argb: C.line } },
  };
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
