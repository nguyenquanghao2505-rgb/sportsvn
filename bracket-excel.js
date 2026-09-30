// ============================================================
// bracket-excel.js — Export bracket ra Excel đồng bộ web
// Layout: bracket cây + merge cells + border (giống referee.vn)
// ============================================================

/**
 * Export bracket ra file Excel
 * Yêu cầu: ExcelJS đã được load trước
 * @param {Object} bracket - từ bracket-engine.js
 * @param {Object} options
 * @returns {Promise<Blob>}
 */
export async function exportBracketToExcel(bracket, options = {}) {
  if (typeof ExcelJS === 'undefined') {
    throw new Error('ExcelJS chưa được load. Thêm: <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"></script>');
  }

  const {
    categoryName = 'Bốc thăm',
    tournamentName = '',
    includeTeamList = true,
    includeSchedule = false,
    scheduleConfig = null,
  } = options;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'SportsVN';
  wb.created = new Date();

  // Sheet 1: Bracket cây
  const wsBracket = wb.addWorksheet('Sơ đồ thi đấu', {
    pageSetup: {
      paperSize: 9,           // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  drawBracketSheet(wsBracket, bracket, { categoryName, tournamentName });

  // Sheet 2: Danh sách đội
  if (includeTeamList) {
    const wsTeams = wb.addWorksheet('Danh sách đội');
    drawTeamListSheet(wsTeams, bracket);
  }

  // Sheet 3: Lịch thi đấu (tùy chọn)
  if (includeSchedule && scheduleConfig) {
    const wsSchedule = wb.addWorksheet('Lịch thi đấu');
    drawScheduleSheet(wsSchedule, bracket, scheduleConfig);
  }

  // Xuất file
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Vẽ sheet bracket dạng cây
 */
function drawBracketSheet(ws, bracket, options) {
  const { categoryName, tournamentName } = options;
  const totalRounds = bracket.rounds.length;
  const firstRoundMatchCount = bracket.rounds[0].length;

  // ═══════════════════════════════════════════════════════════
  // Bước 1: Cấu hình cột
  // Mỗi vòng chiếm 3 cột (Đội A | VS | Đội B) + 1 cột khoảng cách
  // ═══════════════════════════════════════════════════════════
  const COLS_PER_ROUND = 3;
  const GAP_COLS = 1;
  const ROW_PER_MATCH = 2;      // mỗi match chiếm 2 rows (đội A + đội B)
  const ROW_GAP = 1;            // 1 row khoảng cách giữa các match

  // Tính tổng số cột
  const totalDataCols = totalRounds * COLS_PER_ROUND + (totalRounds - 1) * GAP_COLS;
  const totalCols = totalDataCols + 1; // thêm 1 cột số thứ tự

  // Set độ rộng cột
  ws.getColumn(1).width = 6;   // Cột STT
  for (let r = 0; r < totalRounds; r++) {
    const baseCol = 2 + r * (COLS_PER_ROUND + GAP_COLS);
    ws.getColumn(baseCol).width = 22;      // Đội A
    ws.getColumn(baseCol + 1).width = 5;   // VS
    ws.getColumn(baseCol + 2).width = 22;  // Đội B
    if (r < totalRounds - 1) {
      ws.getColumn(baseCol + 3).width = 3; // Cột khoảng cách
    }
  }

  let currentRow = 1;

  // ═══════════════════════════════════════════════════════════
  // Bước 2: Tiêu đề
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(currentRow, 1, currentRow, totalCols);
  const titleCell = ws.getCell(currentRow, 1);
  titleCell.value = tournamentName
    ? `${tournamentName.toUpperCase()} — ${categoryName.toUpperCase()}`
    : `${categoryName.toUpperCase()} — SƠ ĐỒ THI ĐẤU`;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1B3E' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = mediumBorder('FF0D1B3E');
  ws.getRow(currentRow).height = 40;
  currentRow++;

  // Dòng phụ: thông tin
  ws.mergeCells(currentRow, 1, currentRow, totalCols);
  const subCell = ws.getCell(currentRow, 1);
  subCell.value = `${bracket.teamCount} đội · Bracket ${bracket.bracketSize} · ${bracket.numByes} BYE · ${bracket.rounds.length} vòng`;
  subCell.font = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(currentRow).height = 20;
  currentRow++;

  // Dòng trống
  currentRow++;

  // ═══════════════════════════════════════════════════════════
  // Bước 3: Header các vòng
  // ═══════════════════════════════════════════════════════════
  const headerRow = currentRow;
  for (let r = 0; r < totalRounds; r++) {
    const startCol = 2 + r * (COLS_PER_ROUND + GAP_COLS);
    ws.mergeCells(headerRow, startCol, headerRow, startCol + COLS_PER_ROUND - 1);
    const cell = ws.getCell(headerRow, startCol);
    cell.value = bracket.roundNames[r].toUpperCase();
    cell.font = { bold: true, size: 11, color: { argb: 'FFC4F82A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A7A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = mediumBorder('FF1A3A7A');
  }
  ws.getRow(headerRow).height = 28;
  currentRow++;

  // ═══════════════════════════════════════════════════════════
  // Bước 4: Tính vị trí các match
  // ═══════════════════════════════════════════════════════════
  const matchPositions = calculateMatchPositions(bracket, ROW_PER_MATCH, ROW_GAP);
  const bracketStartRow = currentRow;

  // Vẽ bracket
  let maxRow = bracketStartRow;

  bracket.rounds.forEach((round, rIdx) => {
    const baseCol = 2 + rIdx * (COLS_PER_ROUND + GAP_COLS);

    round.forEach((match, mIdx) => {
      const startRow = bracketStartRow + matchPositions[rIdx][mIdx];

      // Vẽ match box
      drawMatchBox(ws, startRow, baseCol, match, {
        isThirdPlace: false,
      });

      // Ghi nhớ row cuối cùng
      const endRow = startRow + ROW_PER_MATCH - 1;
      if (endRow > maxRow) maxRow = endRow;
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Bước 5: Vẽ tranh hạng 3 (nếu có)
  // ═══════════════════════════════════════════════════════════
  if (bracket.thirdPlaceMatch && totalRounds >= 2) {
    const thirdRow = maxRow + 3;
    const thirdCol = 2 + (totalRounds - 1) * (COLS_PER_ROUND + GAP_COLS);

    // Label
    ws.mergeCells(thirdRow - 1, thirdCol, thirdRow - 1, thirdCol + COLS_PER_ROUND - 1);
    const labelCell = ws.getCell(thirdRow - 1, thirdCol);
    labelCell.value = '🥉 TRANH HẠNG 3';
    labelCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE67E22' } };
    labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    labelCell.border = mediumBorder('FFE67E22');

    drawMatchBox(ws, thirdRow, thirdCol, bracket.thirdPlaceMatch, {
      isThirdPlace: true,
    });
  }
}

/**
 * Tính vị trí Y (row) cho từng match
 */
function calculateMatchPositions(bracket, rowPerMatch, rowGap) {
  const positions = [];
  const firstRoundCount = bracket.rounds[0].length;
  const rowHeight = rowPerMatch + rowGap;

  // Vòng 1: xếp đều
  const firstPositions = [];
  for (let i = 0; i < firstRoundCount; i++) {
    firstPositions.push(i * rowHeight);
  }
  positions.push(firstPositions);

  // Các vòng sau: nằm giữa 2 match vòng trước
  for (let r = 1; r < bracket.rounds.length; r++) {
    const prevPositions = positions[r - 1];
    const currPositions = [];
    for (let i = 0; i < bracket.rounds[r].length; i++) {
      const posA = prevPositions[i * 2];
      const posB = prevPositions[i * 2 + 1];
      currPositions.push(Math.floor((posA + posB) / 2));
    }
    positions.push(currPositions);
  }

  return positions;
}

/**
 * Vẽ 1 match box (2 rows: đội A + đội B)
 */
function drawMatchBox(ws, startRow, baseCol, match, options) {
  const { isThirdPlace = false } = options;

  const isBye = match.isBye;
  const isDone = match.status === 'done';
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  // ═══════════════════════════════════════════════════════════
  // Đội A — Row 1
  // ═══════════════════════════════════════════════════════════
  const cellA = ws.getCell(startRow, baseCol);
  cellA.value = match.teamA ? match.teamA.name : (isBye ? '⭐ BYE' : '—');
  cellA.font = {
    size: 10,
    bold: isWinnerA,
    color: { argb: isWinnerA ? 'FF16A34A' : isBye ? 'FFB45309' : 'FF1A1A2E' },
  };
  cellA.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  cellA.border = thinBorder();
  if (isWinnerA) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  } else if (isBye) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
  } else if (isThirdPlace) {
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
  }

  // Score A — cột VS (thực ra hiển thị tỷ số)
  const scoreCellA = ws.getCell(startRow, baseCol + 1);
  scoreCellA.value = match.scoreA !== null && match.scoreA !== undefined ? match.scoreA : '';
  scoreCellA.font = { size: 11, bold: true, color: { argb: isWinnerA ? 'FF16A34A' : 'FF6C757D' } };
  scoreCellA.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreCellA.border = thinBorder();
  if (isWinnerA) {
    scoreCellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  }

  // ═══════════════════════════════════════════════════════════
  // Đội B — Row 2
  // ═══════════════════════════════════════════════════════════
  const cellB = ws.getCell(startRow + 1, baseCol);
  cellB.value = match.teamB ? match.teamB.name : (isBye ? '⭐ BYE' : '—');
  cellB.font = {
    size: 10,
    bold: isWinnerB,
    color: { argb: isWinnerB ? 'FF16A34A' : isBye ? 'FFB45309' : 'FF1A1A2E' },
  };
  cellB.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  cellB.border = thinBorder();
  if (isWinnerB) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  } else if (isBye) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
  } else if (isThirdPlace) {
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
  }

  // Score B — cột VS
  const scoreCellB = ws.getCell(startRow + 1, baseCol + 1);
  scoreCellB.value = match.scoreB !== null && match.scoreB !== undefined ? match.scoreB : '';
  scoreCellB.font = { size: 11, bold: true, color: { argb: isWinnerB ? 'FF16A34A' : 'FF6C757D' } };
  scoreCellB.alignment = { horizontal: 'center', vertical: 'middle' };
  scoreCellB.border = thinBorder();
  if (isWinnerB) {
    scoreCellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  }

  // Cột VS bên phải (cột thứ 3 của block) — hiện "VS" hoặc mã trận
  const vsCellA = ws.getCell(startRow, baseCol + 2);
  vsCellA.value = match.id;
  vsCellA.font = { size: 8, italic: true, color: { argb: 'FF94A3B8' } };
  vsCellA.alignment = { horizontal: 'center', vertical: 'middle' };
  vsCellA.border = thinBorder();

  const vsCellB = ws.getCell(startRow + 1, baseCol + 2);
  vsCellB.value = match.status === 'done' ? '✓' : match.status === 'ready' ? '🎯' : '';
  vsCellB.font = { size: 9, color: { argb: 'FF94A3B8' } };
  vsCellB.alignment = { horizontal: 'center', vertical: 'middle' };
  vsCellB.border = thinBorder();

  // Set row heights
  ws.getRow(startRow).height = 22;
  ws.getRow(startRow + 1).height = 22;
}

/**
 * Vẽ sheet danh sách đội
 */
function drawTeamListSheet(ws, bracket) {
  // Cấu hình cột
  ws.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Tên đội / VĐV', key: 'name', width: 30 },
    { header: 'CLB / Đơn vị', key: 'club', width: 25 },
    { header: 'Vị trí vòng 1', key: 'position', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 15 },
  ];

  // Header style
  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A7A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder();
  });

  // Liệt kê đội
  const firstRound = bracket.rounds[0];
  let stt = 1;
  firstRound.forEach((match, mIdx) => {
    const matchId = match.id;

    if (match.teamA) {
      const row = ws.addRow({
        stt: stt++,
        name: match.teamA.name,
        club: match.teamA.club || '—',
        position: `${matchId} — Slot A`,
        status: match.isBye ? '⭐ BYE (đi tiếp)' : (match.status === 'done' ? '✓ Đã đấu' : '🎯 Chờ đấu'),
      });
      styleTeamRow(row);
    }

    if (match.teamB) {
      const row = ws.addRow({
        stt: stt++,
        name: match.teamB.name,
        club: match.teamB.club || '—',
        position: `${matchId} — Slot B`,
        status: match.isBye ? '⭐ BYE (đi tiếp)' : (match.status === 'done' ? '✓ Đã đấu' : '🎯 Chờ đấu'),
      });
      styleTeamRow(row);
    }
  });

  // Border toàn bộ
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = thinBorder();
    });
  });
}

function styleTeamRow(row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.border = thinBorder();
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
  row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  row.getCell(2).font = { bold: true, color: { argb: 'FF0F172A' } };
}

/**
 * Vẽ sheet lịch thi đấu (nếu có scheduleConfig)
 */
function drawScheduleSheet(ws, bracket, scheduleConfig) {
  ws.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Trận', key: 'matchId', width: 12 },
    { header: 'Vòng', key: 'round', width: 15 },
    { header: 'Đội A', key: 'teamA', width: 25 },
    { header: 'Đội B', key: 'teamB', width: 25 },
    { header: 'Ngày', key: 'date', width: 12 },
    { header: 'Giờ', key: 'time', width: 10 },
    { header: 'Sân', key: 'court', width: 10 },
  ];

  // Header style
  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A7A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder();
  });

  // Liệt kê tất cả match ready + done
  let stt = 1;
  bracket.rounds.forEach((round, rIdx) => {
    round.forEach((match) => {
      if (match.isBye) return; // Bỏ qua BYE

      const row = ws.addRow({
        stt: stt++,
        matchId: match.id,
        round: bracket.roundNames[rIdx],
        teamA: match.teamA?.name || '—',
        teamB: match.teamB?.name || '—',
        date: '',
        time: '',
        court: '',
      });
      row.height = 22;
      row.eachCell((cell) => {
        cell.border = thinBorder();
        cell.alignment = { vertical: 'middle' };
      });
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(4).font = { bold: true };
      row.getCell(5).font = { bold: true };
    });
  });
}

/**
 * Border helpers
 */
function thinBorder() {
  return {
    top: { style: 'thin', color: { argb: 'FFDEE2E6' } },
    left: { style: 'thin', color: { argb: 'FFDEE2E6' } },
    bottom: { style: 'thin', color: { argb: 'FFDEE2E6' } },
    right: { style: 'thin', color: { argb: 'FFDEE2E6' } },
  };
}

function mediumBorder(color = 'FF1A3A7A') {
  return {
    top: { style: 'medium', color: { argb: color } },
    left: { style: 'medium', color: { argb: color } },
    bottom: { style: 'medium', color: { argb: color } },
    right: { style: 'medium', color: { argb: color } },
  };
}

/**
 * Tải file Excel về máy
 */
export async function downloadBracketExcel(bracket, options = {}) {
  const { filename = null } = options;

  const blob = await exportBracketToExcel(bracket, options);

  const safeName = (options.categoryName || 'BocTham')
    .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
  const name = filename || `Bracket_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return name;
}
