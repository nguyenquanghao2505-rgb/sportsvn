// ============================================================
// bracket-excel.js — Export Excel với bracket layout + đường nối
// Layout giống file Excel mẫu (bracket cây có đường kẻ)
// ============================================================

/**
 * Export bracket ra file Excel
 * Yêu cầu: ExcelJS đã load trước
 */
export async function exportBracketToExcel(bracket, options = {}) {
  if (typeof ExcelJS === 'undefined') {
    throw new Error('ExcelJS chưa được load. Thêm script ExcelJS vào <head>');
  }

  const {
    categoryName = 'Bốc thăm',
    tournamentName = '',
    includeTeamList = true,
  } = options;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'SportsVN';
  wb.created = new Date();

  const wsBracket = wb.addWorksheet('Sơ đồ thi đấu', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.2, right: 0.2, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
  });

  drawBracketSheet(wsBracket, bracket, { categoryName, tournamentName });

  if (includeTeamList) {
    const wsTeams = wb.addWorksheet('Danh sách đội');
    drawTeamListSheet(wsTeams, bracket);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ============================================================
// LAYOUT CONSTANTS
// ============================================================
const LAYOUT = {
  COL_TT:       1,   // Cột A: Số TT nhánh
  COL_TEAM:     2,   // Cột B: Tên đội
  COL_SCORE:    3,   // Cột C: Điểm
  COL_LINE:     4,   // Cột D: Đường nối ─ (width nhỏ)
  COL_GAP:      1,   // Cột E: Khoảng cách giữa các vòng (width 2)

  ROW_HEIGHT_TEAM: 20,  // Chiều cao 1 row đội
  ROW_GAP: 1,           // Số row trống giữa các match (1 = không có, sẽ merge)
};

const COL_WIDTHS = {
  TT: 5,
  TEAM: 26,
  SCORE: 6,
  LINE: 3,
  GAP: 2,
};

const COLORS = {
  headerBg:   'FF1A3A7A',
  headerFg:   'FFFFFFFF',
  winnerBg:   'FFD1FAE5',
  winnerFg:   'FF16A34A',
  byeBg:      'FFFFF3CD',
  byeFg:      'FFB45309',
  borderLine: 'FF1A3A7A',
  borderSoft: 'FFDEE2E6',
  sectionBg:  'FF0D1B3E',
  lineColor:  'FF3B82F6',
};

// ============================================================
// MAIN DRAW FUNCTION
// ============================================================
function drawBracketSheet(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;
  const firstRoundMatchCount = bracket.rounds[0].length;

  // ------------------------------------------------------------
  // Bước 1: Cấu hình cột
  // Mỗi vòng = 4 cột (Team + Score + Line + Gap)
  // ------------------------------------------------------------
  const COLS_PER_ROUND = 4;

  // Cột số TT vòng 1
  ws.getColumn(LAYOUT.COL_TT).width = COL_WIDTHS.TT;

  // Cấu hình cột cho từng vòng
  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.getColumn(baseCol).width = COL_WIDTHS.TEAM;       // Tên đội
    ws.getColumn(baseCol + 1).width = COL_WIDTHS.SCORE;  // Điểm
    ws.getColumn(baseCol + 2).width = COL_WIDTHS.LINE;   // Đường nối
    if (r < totalRounds - 1) {
      ws.getColumn(baseCol + 3).width = COL_WIDTHS.GAP;  // Khoảng cách
    }
  }

  const totalCols = 1 + totalRounds * COLS_PER_ROUND;

  let currentRow = 1;

  // ------------------------------------------------------------
  // Bước 2: Tiêu đề
  // ------------------------------------------------------------
  ws.mergeCells(currentRow, 1, currentRow, totalCols);
  const titleCell = ws.getCell(currentRow, 1);
  titleCell.value = tournamentName
    ? `${tournamentName.toUpperCase()} — ${categoryName.toUpperCase()}`
    : `${categoryName.toUpperCase()} — SƠ ĐỒ THI ĐẤU`;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = mediumBorder(COLORS.sectionBg);
  ws.getRow(currentRow).height = 40;
  currentRow++;

  // Sub-title
  ws.mergeCells(currentRow, 1, currentRow, totalCols);
  const subCell = ws.getCell(currentRow, 1);
  subCell.value = `${bracket.teamCount} đội · Bracket ${bracket.bracketSize} · ${bracket.numByes} BYE · ${bracket.rounds.length} vòng`;
  subCell.font = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(currentRow).height = 20;
  currentRow++;

  // Row trống
  currentRow++;

  // ------------------------------------------------------------
  // Bước 3: Header các vòng
  // ------------------------------------------------------------
  const headerRow = currentRow;

  // Header cột TT
  ws.getCell(headerRow, LAYOUT.COL_TT).value = 'TT';
  styleHeaderCell(ws.getCell(headerRow, LAYOUT.COL_TT));

  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * COLS_PER_ROUND;
    ws.mergeCells(headerRow, baseCol, headerRow, baseCol + 2); // merge 3 cột (Team+Score+Line)
    const cell = ws.getCell(headerRow, baseCol);
    cell.value = bracket.roundNames[r].toUpperCase();
    styleHeaderCell(cell);
  }
  ws.getRow(headerRow).height = 28;
  currentRow++;

  // ------------------------------------------------------------
  // Bước 4: Vẽ bracket
  // Mỗi match = 2 rows (đội A + đội B)
  // Vị trí Y của match được tính để vòng sau nằm giữa 2 match vòng trước
  // ------------------------------------------------------------
  const bracketStartRow = currentRow;
  const rowPerMatch = 2;      // 2 rows cho 1 match
  const rowGap = 2;            // 2 rows trống giữa các match

  // Tính vị trí Y cho mỗi match ở mỗi vòng
  const matchPositions = computeMatchPositions(
    bracket,
    rowPerMatch,
    rowGap
  );

  // Vẽ từng vòng
  let maxRow = bracketStartRow;

  for (let rIdx = 0; rIdx < totalRounds; rIdx++) {
    const round = bracket.rounds[rIdx];
    const baseCol = 2 + rIdx * COLS_PER_ROUND;

    round.forEach((match, mIdx) => {
      const startRow = bracketStartRow + matchPositions[rIdx][mIdx];

      // Vẽ match box
      drawMatchBox(ws, startRow, baseCol, match, {
        rowPerMatch,
        isThirdPlace: false,
        showTeamA: true,
        showTeamB: true,
      });

      // Vẽ đường nối sang vòng sau
      if (rIdx < totalRounds - 1) {
        const isLastInPair = mIdx % 2 === 1; // Chỉ vẽ đường nối cho cặp (0,1), (2,3), ...
        drawConnector(
          ws,
          startRow,
          baseCol + 3, // Cột đường nối (sau cột Score)
          rowPerMatch,
          matchPositions[rIdx][mIdx],
          matchPositions[rIdx + 1][Math.floor(mIdx / 2)],
          bracketStartRow,
          isLastInPair
        );
      }

      const endRow = startRow + rowPerMatch - 1;
      if (endRow > maxRow) maxRow = endRow;
    });
  }

  // ------------------------------------------------------------
  // Bước 5: Tranh hạng 3
  // ------------------------------------------------------------
  if (bracket.thirdPlaceMatch && totalRounds >= 2) {
    const thirdRow = maxRow + 3;
    const thirdCol = 2 + (totalRounds - 1) * COLS_PER_ROUND;

    // Label
    ws.mergeCells(thirdRow - 1, thirdCol, thirdRow - 1, thirdCol + 2);
    const labelCell = ws.getCell(thirdRow - 1, thirdCol);
    labelCell.value = '🥉 TRANH HẠNG 3';
    labelCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE67E22' } };
    labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    labelCell.border = mediumBorder('FFE67E22');

    drawMatchBox(ws, thirdRow, thirdCol, bracket.thirdPlaceMatch, {
      rowPerMatch,
      isThirdPlace: true,
      showTeamA: true,
      showTeamB: true,
    });
  }
}

// ============================================================
// COMPUTE MATCH POSITIONS
// ============================================================
function computeMatchPositions(bracket, rowPerMatch, rowGap) {
  const positions = [];
  const firstRoundCount = bracket.rounds[0].length;
  const rowHeight = rowPerMatch + rowGap;

  // Vòng 1
  const firstPositions = [];
  for (let i = 0; i < firstRoundCount; i++) {
    firstPositions.push(i * rowHeight);
  }
  positions.push(firstPositions);

  // Các vòng sau
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
// DRAW MATCH BOX
// ============================================================
function drawMatchBox(ws, startRow, baseCol, match, options) {
  const { rowPerMatch = 2, isThirdPlace = false } = options;

  const isBye = match.isBye;
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  // ------------------------------------------------------------
  // Đội A — Row 1
  // ------------------------------------------------------------
  const cellA = ws.getCell(startRow, baseCol);
  cellA.value = match.teamA ? match.teamA.name : (isBye && match.teamB ? '' : '—');
  cellA.font = {
    size: 10,
    bold: isWinnerA,
    color: { argb: isWinnerA ? COLORS.winnerFg : isBye ? COLORS.byeFg : 'FF1A1A2E' },
  };
  cellA.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  cellA.border = thinBorder();
  if (isWinnerA) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.winnerBg } };
  } else if (isBye && match.teamA) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.byeBg } };
  } else if (isThirdPlace) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
  }

  // Điểm A
  const scoreA = ws.getCell(startRow, baseCol + 1);
  scoreA.value = match.scoreA !== null && match.scoreA !== undefined ? match.scoreA : '';
  scoreA.font = {
    size: 11,
    bold: true,
    color: { argb: isWinnerA ? COLORS.winnerFg : 'FF6C757D' },
  };
  scoreA.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreA.border = thinBorder();
  if (isWinnerA) {
    scoreA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.winnerBg } };
  }

  // Cột đường nối (giữa) — dùng để vẽ đường
  const lineA = ws.getCell(startRow, baseCol + 2);
  lineA.value = '';
  lineA.border = thinBorder();

  // ------------------------------------------------------------
  // Đội B — Row 2
  // ------------------------------------------------------------
  const cellB = ws.getCell(startRow + 1, baseCol);
  cellB.value = match.teamB ? match.teamB.name : (isBye && match.teamA ? '⭐ BYE' : '—');
  cellB.font = {
    size: 10,
    bold: isWinnerB,
    color: { argb: isWinnerB ? COLORS.winnerFg : isBye ? COLORS.byeFg : 'FF1A1A2E' },
  };
  cellB.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  cellB.border = thinBorder();
  if (isWinnerB) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.winnerBg } };
  } else if (isBye && match.teamB) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.byeBg } };
  } else if (isBye && match.teamA) {
    // BYE case: đội A có BYE
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.byeBg } };
  } else if (isThirdPlace) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
  }

  // Điểm B
  const scoreB = ws.getCell(startRow + 1, baseCol + 1);
  scoreB.value = match.scoreB !== null && match.scoreB !== undefined ? match.scoreB : '';
  scoreB.font = {
    size: 11,
    bold: true,
    color: { argb: isWinnerB ? COLORS.winnerFg : 'FF6C757D' },
  };
  scoreB.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreB.border = thinBorder();
  if (isWinnerB) {
    scoreB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.winnerBg } };
  }

  // Cột đường nối
  const lineB = ws.getCell(startRow + 1, baseCol + 2);
  lineB.value = '';
  lineB.border = thinBorder();

  // Set row heights
  ws.getRow(startRow).height = LAYOUT.ROW_HEIGHT_TEAM;
  ws.getRow(startRow + 1).height = LAYOUT.ROW_HEIGHT_TEAM;

  // ------------------------------------------------------------
  // Ghi mã trận vào cột TT nếu là vòng 1
  // ------------------------------------------------------------
  if (match.roundIndex === 0 && !isThirdPlace) {
    const ttCell = ws.getCell(startRow, LAYOUT.COL_TT);
    ws.mergeCells(startRow, LAYOUT.COL_TT, startRow + 1, LAYOUT.COL_TT);
    ttCell.value = match.matchIndex + 1;
    ttCell.font = { size: 9, color: { argb: 'FF94A3B8' } };
    ttCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ttCell.border = thinBorder();
  }
}

// ============================================================
// DRAW CONNECTOR — Vẽ đường nối giữa 2 match
// ============================================================
function drawConnector(ws, startRow, lineCol, rowPerMatch, fromPos, toPos, bracketStartRow, isLastInPair) {
  // lineCol = cột ngay sau cột Score (để vẽ đường ngang + dọc)
  const fromRow = bracketStartRow + fromPos;
  const toRow = bracketStartRow + toPos + Math.floor(rowPerMatch / 2);

  // Nếu là match lẻ trong cặp (mIdx % 2 === 0) → vẽ đường ngang sang phải
  // Nếu là match chẵn trong cặp (mIdx % 2 === 1) → vẽ đường dọc + ngang vào match đích

  if (!isLastInPair) {
    // Match trên của cặp: vẽ đường ngang từ cột Team->Score->Line
    // Border: gạch ngang ở giữa row đầu
    for (let i = 0; i < rowPerMatch; i++) {
      const cell = ws.getCell(fromRow + i, lineCol);
      if (i === 0) {
        cell.border = {
          ...cell.border,
          top: { style: 'thin', color: { argb: COLORS.lineColor } },
          right: { style: 'thin', color: { argb: COLORS.lineColor } },
        };
      }
    }
  } else {
    // Match dưới của cặp: vẽ đường dọc ở cột Line kéo lên giữa 2 match
    // Vẽ đường dọc + ngang
    for (let i = 0; i < rowPerMatch; i++) {
      const cell = ws.getCell(fromRow + i, lineCol);
      cell.border = {
        ...cell.border,
        right: { style: 'thin', color: { argb: COLORS.lineColor } },
      };
    }

    // Vẽ đường ngang từ cột Line sang cột Team của vòng sau
    const targetCell = ws.getCell(toRow, lineCol + 1);
    targetCell.border = {
      ...targetCell.border,
      left: { style: 'thin', color: { argb: COLORS.lineColor } },
    };
  }
}

// ============================================================
// TEAM LIST SHEET
// ============================================================
function drawTeamListSheet(ws, bracket) {
  ws.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Tên đội / VĐV', key: 'name', width: 30 },
    { header: 'CLB / Đơn vị', key: 'club', width: 25 },
    { header: 'Vị trí vòng 1', key: 'position', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 18 },
  ];

  // Header style
  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder();
  });

  // Data
  const firstRound = bracket.rounds[0];
  let stt = 1;
  firstRound.forEach((match) => {
    if (match.teamA) {
      ws.addRow({
        stt: stt++,
        name: match.teamA.name,
        club: match.teamA.club || '—',
        position: `${match.id} — Slot A`,
        status: match.isBye ? '⭐ BYE (đi tiếp)' : (match.status === 'done' ? '✓ Đã đấu' : '🎯 Chờ đấu'),
      });
    }
    if (match.teamB) {
      ws.addRow({
        stt: stt++,
        name: match.teamB.name,
        club: match.teamB.club || '—',
        position: `${match.id} — Slot B`,
        status: match.isBye ? '⭐ BYE (đi tiếp)' : (match.status === 'done' ? '✓ Đã đấu' : '🎯 Chờ đấu'),
      });
    }
  });

  // Style rows
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.height = 22;
    row.eachCell((cell) => {
      cell.border = thinBorder();
      cell.alignment = { vertical: 'middle' };
    });
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).font = { bold: true };
  });
}

// ============================================================
// STYLE HELPERS
// ============================================================
function styleHeaderCell(cell) {
  cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = {
    top: { style: 'medium', color: { argb: COLORS.headerBg } },
    left: { style: 'medium', color: { argb: COLORS.headerBg } },
    bottom: { style: 'medium', color: { argb: COLORS.headerBg } },
    right: { style: 'medium', color: { argb: COLORS.headerBg } },
  };
}

function thinBorder() {
  return {
    top: { style: 'thin', color: { argb: COLORS.borderSoft } },
    left: { style: 'thin', color: { argb: COLORS.borderSoft } },
    bottom: { style: 'thin', color: { argb: COLORS.borderSoft } },
    right: { style: 'thin', color: { argb: COLORS.borderSoft } },
  };
}

function mediumBorder(color = COLORS.borderLine) {
  return {
    top: { style: 'medium', color: { argb: color } },
    left: { style: 'medium', color: { argb: color } },
    bottom: { style: 'medium', color: { argb: color } },
    right: { style: 'medium', color: { argb: color } },
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
