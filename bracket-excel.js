// ============================================================
// bracket-excel.js v10 — Excel bracket với đầy đủ border
// Đặc điểm:
//   - Bracket: Tên + Điểm cho mỗi vòng
//   - Cột tham chiếu bên phải: TT | Mã | Tên | Đơn vị | Trạng thái
//   - Kẻ border cho TẤT CẢ các dòng (kể cả trống)
//   - Đường nối bằng border (best effort)
// ============================================================

export async function exportBracketToExcel(bracket, options = {}) {
  if (typeof ExcelJS === 'undefined') {
    throw new Error('ExcelJS chưa được load. Kiểm tra <script src="...exceljs...">');
  }

  const {
    categoryName = 'Bốc thăm',
    tournamentName = '',
    includeTeamList = true,
  } = options;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'SportsVN';
  wb.created = new Date();

  // ─── Sheet 1: Sơ đồ thi đấu ───
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

  drawBracketSheet(ws, bracket, { categoryName, tournamentName });

  // ─── Sheet 2: Danh sách VĐV ───
  if (includeTeamList) {
    const wsTeams = wb.addWorksheet('Danh sách VĐV');
    drawTeamListSheet(wsTeams, bracket);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ============================================================
// COLOR PALETTE
// ============================================================
const C = {
  titleBg:      'FF0D1B3E',
  headerBg:     'FF1A3A7A',
  headerFg:     'FFFFFFFF',
  winnerBg:     'FFD1FAE5',
  winnerFg:     'FF16A34A',
  byeBg:        'FFFFF3CD',
  byeFg:        'FFB45309',
  borderSoft:   'FFCBD5E1',
  borderStrong: 'FF1E3A8A',
  lineColor:    'FF1E3A8A',
  thirdBg:      'FFE67E22',
  refHeaderBg:  'FF1E40AF',
  refTTBg:      'FFEFF6FF',
  refAltBg:     'FFF8FAFC',
  refByeBg:     'FFFFF3CD',
};

// ============================================================
// COLUMN WIDTHS
// ============================================================
const W = {
  TT:        5,
  TEAM:      22,
  SCORE:     5,
  SPACER:    3,
  REF_TT:    5,
  REF_CODE:  6,
  REF_NAME:  22,
  REF_CLUB:  20,
  REF_STATUS: 14,
};

// ============================================================
// MAIN — DRAW BRACKET SHEET
// ============================================================
function drawBracketSheet(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;
  const COLS_PER_ROUND = 4; // [SPACER hoặc TT] [TÊN] [ĐIỂM] [SPACER]

  // ─── Bước 1: Cấu hình cột cho bracket ───
  // Vòng 1: A=TT, B=Tên, C=Điểm, D=Spacer
  ws.getColumn(1).width = W.TT;
  ws.getColumn(2).width = W.TEAM;
  ws.getColumn(3).width = W.SCORE;
  ws.getColumn(4).width = W.SPACER;

  // Vòng 2+: [Spacer][Tên][Điểm][Spacer]
  for (let r = 1; r < totalRounds; r++) {
    const baseCol = 1 + r * COLS_PER_ROUND;
    ws.getColumn(baseCol).width     = W.SPACER;
    ws.getColumn(baseCol + 1).width = W.TEAM;
    ws.getColumn(baseCol + 2).width = W.SCORE;
    ws.getColumn(baseCol + 3).width = W.SPACER;
  }

  const bracketCols = 1 + totalRounds * COLS_PER_ROUND;

  // ─── Bước 2: Cột tham chiếu bên phải (5 cột) ───
  const REF_COL = bracketCols + 1;
  ws.getColumn(REF_COL).width     = W.REF_TT;
  ws.getColumn(REF_COL + 1).width = W.REF_CODE;
  ws.getColumn(REF_COL + 2).width = W.REF_NAME;
  ws.getColumn(REF_COL + 3).width = W.REF_CLUB;
  ws.getColumn(REF_COL + 4).width = W.REF_STATUS;
  const totalCols = REF_COL + 4;

  // ─── Bước 3: Tiêu đề ───
  let row = 1;

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
  subCell.value = `${bracket.teamCount} VĐV · Bracket ${bracket.bracketSize} · ${bracket.numByes} BYE · ${bracket.rounds.length} vòng`;
  subCell.font = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 18;
  row++;

  row++; // Row trống

  // ─── Bước 4: Header các vòng ───
  const headerRow = row;

  // Header vòng 1 (TT + Tên + Điểm)
  ws.getCell(headerRow, 1).value = 'TT';
  styleHeader(ws.getCell(headerRow, 1));

  ws.mergeCells(headerRow, 2, headerRow, 3);
  const h1 = ws.getCell(headerRow, 2);
  h1.value = bracket.roundNames[0].toUpperCase();
  styleHeader(h1);

  styleHeader(ws.getCell(headerRow, 4));

  // Header vòng 2+
  for (let r = 1; r < totalRounds; r++) {
    const baseCol = 1 + r * COLS_PER_ROUND;
    styleHeader(ws.getCell(headerRow, baseCol));

    ws.mergeCells(headerRow, baseCol + 1, headerRow, baseCol + 2);
    const cell = ws.getCell(headerRow, baseCol + 1);
    cell.value = bracket.roundNames[r].toUpperCase();
    styleHeader(cell);

    styleHeader(ws.getCell(headerRow, baseCol + 3));
  }

  // Header cột tham chiếu
  const refHeaders = ['TT', 'Mã', 'Tên VĐV', 'Đơn vị', 'Trạng thái'];
  refHeaders.forEach((h, i) => {
    const cell = ws.getCell(headerRow, REF_COL + i);
    cell.value = h;
    styleRefHeader(cell);
  });

  ws.getRow(headerRow).height = 26;
  row++;

  // ─── Bước 5: Vẽ bracket chính ───
  const bracketStartRow = row;
  const ROWS_PER_MATCH = 2;
  const ROW_GAP = 1;

  const positions = computePositions(bracket, ROWS_PER_MATCH, ROW_GAP);

  let maxRow = bracketStartRow;

  for (let rIdx = 0; rIdx < totalRounds; rIdx++) {
    const round = bracket.rounds[rIdx];
    const teamCol  = rIdx === 0 ? 2 : 1 + rIdx * COLS_PER_ROUND + 1;
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

  // ─── Bước 6: Vẽ đường nối ───
  for (let rIdx = 0; rIdx < totalRounds - 1; rIdx++) {
    const rightSpacerCol = 1 + rIdx * COLS_PER_ROUND + 3;
    const leftSpacerCol  = 1 + (rIdx + 1) * COLS_PER_ROUND;
    const nextTeamCol    = leftSpacerCol + 1;

    const round = bracket.rounds[rIdx];
    const nextRound = bracket.rounds[rIdx + 1];

    nextRound.forEach((_, nMIdx) => {
      const topIdx = nMIdx * 2;
      const botIdx = nMIdx * 2 + 1;
      if (topIdx >= round.length || botIdx >= round.length) return;

      const posTop = positions[rIdx][topIdx];
      const posBot = positions[rIdx][botIdx];

      const rowTopB = bracketStartRow + posTop + 1;
      const rowBotB = bracketStartRow + posBot + 1;

      // Đường ngang từ Đội B match trên
      setBorderRight(ws, rowTopB, rightSpacerCol - 1);
      setBorderRight(ws, rowTopB, rightSpacerCol);

      // Đường ngang từ Đội B match dưới
      setBorderRight(ws, rowBotB, rightSpacerCol - 1);
      setBorderRight(ws, rowBotB, rightSpacerCol);

      // Đường dọc
      for (let r = rowTopB; r <= rowBotB; r++) {
        setBorderRight(ws, r, rightSpacerCol);
      }

      // Đường ngang vào match đích
      const midRow = Math.floor((rowTopB + rowBotB) / 2);
      setBorderRight(ws, midRow, rightSpacerCol);
      setBorderTop(ws, midRow, leftSpacerCol);
      setBorderTop(ws, midRow, nextTeamCol);
      setBorderTop(ws, midRow, nextTeamCol + 1);
    });
  }

  // ─── Bước 7: Vẽ cột tham chiếu (danh sách VĐV) ───
  drawReferenceColumn(ws, bracket, bracketStartRow, REF_COL, maxRow);

  // ─── Bước 8: Tranh hạng 3 ───
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
// DRAW MATCH (2 rows: Đội A + Đội B)
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
  cellA.border = border(C.borderSoft);
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
  scoreA.border = border(C.borderSoft);
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
  cellB.border = border(C.borderSoft);
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
  scoreB.border = border(C.borderSoft);
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
    tt.border = border(C.borderSoft);
  }

  ws.getRow(rowA).height = 20;
  ws.getRow(rowB).height = 20;
}

// ============================================================
// DRAW REFERENCE COLUMN — Kẻ border cho TẤT CẢ các dòng
// ============================================================
function drawReferenceColumn(ws, bracket, startRow, refCol, maxRow) {
  // ─── Lấy danh sách VĐV từ vòng 1 ───
  const allTeams = [];
  bracket.rounds[0].forEach((match) => {
    if (match.teamA) {
      allTeams.push({
        name: match.teamA.name,
        club: match.teamA.club,
        isBye: match.isBye && !match.teamB,
        slot: 'A',
        matchId: match.id,
      });
    }
    if (match.teamB) {
      allTeams.push({
        name: match.teamB.name,
        club: match.teamB.club,
        isBye: false,
        slot: 'B',
        matchId: match.id,
      });
    }
  });

  // ─── Số dòng: = số VĐV + 5 dòng dự phòng ───
  const numRows = allTeams.length;
  const extraRows = 5;
  const totalRows = numRows + extraRows;

  // ─── Kẻ ô cho TẤT CẢ các dòng ───
  for (let i = 0; i < totalRows; i++) {
    const r = startRow + i;
    const team = allTeams[i];
    const isAlt = i % 2 === 1;

    // ─── KẺ BORDER CHO 5 CỘT ───
    for (let c = 0; c < 5; c++) {
      const cell = ws.getCell(r, refCol + c);
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FF1E3A8A' } },
        left:   { style: 'thin', color: { argb: 'FF1E3A8A' } },
        bottom: { style: 'thin', color: { argb: 'FF1E3A8A' } },
        right:  { style: 'thin', color: { argb: 'FF1E3A8A' } },
      };
    }

    // ─── CỘT 1: TT ───
    const ttCell = ws.getCell(r, refCol);
    if (team) {
      ttCell.value = i + 1;
      ttCell.font = { size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
    } else {
      ttCell.value = '';
    }
    ttCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ttCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };

    // ─── CỘT 2: Mã ───
    const codeCell = ws.getCell(r, refCol + 1);
    if (team) {
      codeCell.value = i + 1;
      codeCell.font = { size: 10, color: { argb: 'FF1E3A8A' } };
    } else {
      codeCell.value = '';
    }
    codeCell.alignment = { horizontal: 'center', vertical: 'middle' };
    codeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };

    // ─── CỘT 3: Tên VĐV ───
    const nameCell = ws.getCell(r, refCol + 2);
    if (team) {
      nameCell.value = team.name || '—';
      nameCell.font = {
        size: 11,
        bold: true,
        color: { argb: team.isBye ? 'FFB45309' : 'FF0F172A' },
      };
      nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      if (team.isBye) {
        nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
      } else if (isAlt) {
        nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    } else {
      nameCell.value = '';
      nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }

    // ─── CỘT 4: Đơn vị ───
    const clubCell = ws.getCell(r, refCol + 3);
    if (team) {
      clubCell.value = team.club || '—';
      clubCell.font = {
        size: 10,
        color: { argb: team.club ? 'FF1E3A8A' : 'FF94A3B8' },
        italic: !team.club,
      };
      clubCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      if (team.isBye) {
        clubCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
      } else if (isAlt) {
        clubCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    } else {
      clubCell.value = '';
      clubCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }

    // ─── CỘT 5: Trạng thái ───
    const statusCell = ws.getCell(r, refCol + 4);
    if (team) {
      const statusText = team.isBye ? '⭐ BYE' : `Slot ${team.slot}`;
      statusCell.value = statusText;
      statusCell.font = {
        size: 9,
        bold: team.isBye,
        color: { argb: team.isBye ? 'FFB45309' : 'FF64748B' },
      };
      statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (team.isBye) {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
      } else if (isAlt) {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    } else {
      statusCell.value = '';
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }

    ws.getRow(r).height = 20;
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
      curr.push(Math.floor((posA + posB) / 2));
    }
    positions.push(curr);
  }

  return positions;
}

// ============================================================
// SHEET 2: DANH SÁCH VĐV
// ============================================================
function drawTeamListSheet(ws, bracket) {
  ws.columns = [
    { header: 'STT',        key: 'stt',      width: 8 },
    { header: 'Tên VĐV',    key: 'name',     width: 28 },
    { header: 'Đơn vị',     key: 'club',     width: 22 },
    { header: 'Vị trí',     key: 'position', width: 18 },
    { header: 'Trạng thái', key: 'status',   width: 16 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => styleRefHeader(cell));

  const firstRound = bracket.rounds[0];
  let stt = 1;

  firstRound.forEach((match) => {
    if (match.teamA) {
      const isByeA = match.isBye && !match.teamB;
      ws.addRow({
        stt: stt++,
        name: match.teamA.name,
        club: match.teamA.club || '—',
        position: `${match.id} — Slot A`,
        status: isByeA ? '⭐ BYE' : 'Chờ đấu',
      });
    }
    if (match.teamB) {
      ws.addRow({
        stt: stt++,
        name: match.teamB.name,
        club: match.teamB.club || '—',
        position: `${match.id} — Slot B`,
        status: 'Chờ đấu',
      });
    }
  });

  ws.eachRow((r, n) => {
    if (n === 1) return;
    r.height = 20;
    r.eachCell((cell) => {
      cell.border = border(C.borderSoft);
      cell.alignment = { vertical: 'middle' };
    });
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).font = { bold: true, color: { argb: 'FF0F172A' } };
    r.getCell(3).font = { color: { argb: 'FF1E3A8A' } };
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).font = { size: 9, color: { argb: 'FF64748B' } };
    r.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
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

function styleRefHeader(cell) {
  cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.refHeaderBg } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = border(C.refHeaderBg);
}

function border(color) {
  return {
    top:    { style: 'thin', color: { argb: color } },
    left:   { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    right:  { style: 'thin', color: { argb: color } },
  };
}

function setBorderRight(ws, row, col, color = C.lineColor) {
  const cell = ws.getCell(row, col);
  cell.border = {
    ...(cell.border || {}),
    right: { style: 'medium', color: { argb: color } },
  };
}

function setBorderTop(ws, row, col, color = C.lineColor) {
  const cell = ws.getCell(row, col);
  cell.border = {
    ...(cell.border || {}),
    top: { style: 'medium', color: { argb: color } },
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
