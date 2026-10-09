// ============================================================
// bracket-renderer.js — Render bracket đẹp + zoom/pan
// Đã tối ưu hóa xử lý BYE và hiển thị VĐV được đặc cách
// ============================================================

/**
 * Render bracket ra DOM element
 * @param {Object} bracket - từ bracket-engine.js
 * @param {HTMLElement} container - element chứa
 * @param {Object} options - { onMatchClick, editable, showThirdPlace }
 */
export function renderBracket(bracket, container, options = {}) {
  if (!bracket || !container) {
    console.error('[renderBracket] Thiếu bracket hoặc container');
    return;
  }

  const {
    onMatchClick = null,
    editable = false,
    showThirdPlace = true,
  } = options;

  // Layout constants
  const SLOT_HEIGHT = 40;
  const MATCH_HEIGHT = 88;
  const MATCH_GAP = 12;
  const COL_WIDTH = 240;
  const CONNECTOR_WIDTH = 50;

  // Tính chiều cao mỗi vòng
  const firstRoundMatchCount = bracket.rounds[0].length;
  const totalHeight = firstRoundMatchCount * (MATCH_HEIGHT + MATCH_GAP) + 60;

  // Tính vị trí Y cho từng match ở từng vòng
  const matchPositions = calculatePositions(bracket, MATCH_HEIGHT, MATCH_GAP);

  // HTML cho từng vòng
  let html = `
    <div class="bracket-wrapper">
      <div class="bracket-zoom-controls">
        <button class="bracket-zoom-btn" data-action="zoom-in" title="Phóng to">+</button>
        <button class="bracket-zoom-btn" data-action="zoom-out" title="Thu nhỏ">−</button>
        <button class="bracket-zoom-btn" data-action="zoom-reset" title="Về mặc định">⌂</button>
      </div>
      <div class="bracket-scroll-container">
        <div class="bracket-canvas" style="width:${calculateCanvasWidth(bracket, COL_WIDTH, CONNECTOR_WIDTH)}px;height:${totalHeight}px;">
  `;

  // Vẽ từng vòng
  bracket.rounds.forEach((round, rIdx) => {
    const leftOffset = rIdx * (COL_WIDTH + CONNECTOR_WIDTH);

    // Round header
    html += `
      <div class="bracket-round-label" style="left:${leftOffset}px;width:${COL_WIDTH}px;">
        ${bracket.roundNames[rIdx]}
      </div>
    `;

    // Matches
    round.forEach((match, mIdx) => {
      const topPos = matchPositions[rIdx][mIdx];
      html += renderMatchCard(match, {
        left: leftOffset,
        top: topPos,
        width: COL_WIDTH,
        height: MATCH_HEIGHT,
        editable,
        onMatchClick,
      });
    });
  });

  // Vẽ connectors (SVG)
  html += `<svg class="bracket-connectors" style="width:100%;height:${totalHeight}px;">`;

  for (let rIdx = 0; rIdx < bracket.rounds.length - 1; rIdx++) {
    const fromRound = bracket.rounds[rIdx];
    const toRound = bracket.rounds[rIdx + 1];

    const fromLeft = rIdx * (COL_WIDTH + CONNECTOR_WIDTH) + COL_WIDTH;
    const toLeft = (rIdx + 1) * (COL_WIDTH + CONNECTOR_WIDTH);

    fromRound.forEach((fromMatch, mIdx) => {
      const toMatchIdx = Math.floor(mIdx / 2);
      const toMatch = toRound[toMatchIdx];
      if (!toMatch) return;

      const fromY = matchPositions[rIdx][mIdx] + MATCH_HEIGHT / 2;
      const toY = matchPositions[rIdx + 1][toMatchIdx] + MATCH_HEIGHT / 2;
      const midX = fromLeft + CONNECTOR_WIDTH / 2;

      html += `
        <path
          d="M ${fromLeft} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toLeft} ${toY}"
          stroke="#3b82f6"
          stroke-width="1.5"
          fill="none"
          opacity="0.5"
          class="bracket-connector-line"
        />
      `;
    });
  }

  html += `</svg>`;

  // Tranh hạng 3
  if (showThirdPlace && bracket.thirdPlaceMatch && bracket.rounds.length >= 2) {
    const thirdTop = totalHeight + 20;
    const thirdLeft = (bracket.rounds.length - 2) * (COL_WIDTH + CONNECTOR_WIDTH);
    html += `
      <div class="bracket-round-label third-place-label" style="left:${thirdLeft}px;width:${COL_WIDTH}px;top:${thirdTop - 30}px;">
        🥉 TRANH HẠNG 3
      </div>
      ${renderMatchCard(bracket.thirdPlaceMatch, {
        left: thirdLeft,
        top: thirdTop,
        width: COL_WIDTH,
        height: MATCH_HEIGHT,
        editable,
        onMatchClick,
        isThirdPlace: true,
      })}
    `;
  }

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Bind sự kiện zoom/pan
  bindZoomPan(container);

  // Bind click vào match
  if (onMatchClick) {
    container.querySelectorAll('.bracket-match').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.bracket-zoom-controls')) return;
        const matchId = el.dataset.matchId;
        const found = findMatchInBracket(bracket, matchId);
        if (found) onMatchClick(found.match, found.roundIndex, found.matchIndex);
      });
    });
  }
}

/**
 * Render HTML cho 1 match card
 * ĐÃ SỬA: Xử lý hiển thị Bye chính xác hơn
 */
function renderMatchCard(match, opts) {
  const {
    left, top, width, height, editable, isThirdPlace = false,
  } = opts;

  const cls = [
    'bracket-match',
    match.isBye ? 'is-bye' : '',
    match.status === 'done' ? 'is-done' : '',
    match.status === 'ready' ? 'is-ready' : '',
    match.isPlaceholder ? 'is-placeholder' : '',
    isThirdPlace ? 'is-third-place' : '',
  ].filter(Boolean).join(' ');

  const teamA = match.teamA;
  const teamB = match.teamB;
  const isWinnerA = match.winner === 'A';
  const isWinnerB = match.winner === 'B';

  // Status badge
  let statusBadge = '';
  if (match.status === 'done') statusBadge = '<span class="match-status-done">✓ Đã xong</span>';
  else if (match.status === 'ready') statusBadge = '<span class="match-status-ready">🎯 Chưa đấu</span>';
  else if (match.isBye) statusBadge = '<span class="match-status-bye">⭐ BYE</span>';

  // === XỬ LÝ HIỂN THỊ TÊN VĐV (SỬA LỖI SỐ 4) ===
  // Logic: Nếu có tên VĐV -> hiển thị tên. Nếu không có tên nhưng là trận Bye -> hiển thị "Đặc cách".
  // Nếu không có gì -> hiển thị "—"
  
  const displayTeamA = teamA 
    ? escapeHtml(teamA.name) 
    : (match.isBye ? '<span style="color:#f59e0b; font-weight:800;">⭐ Đặc cách</span>' : '—');
    
  const displayTeamB = teamB 
    ? escapeHtml(teamB.name) 
    : (match.isBye ? '<span style="color:#f59e0b; font-weight:800;">⭐ Đặc cách</span>' : '—');

  return `
    <div
      class="${cls}"
      data-match-id="${match.id}"
      style="left:${left}px;top:${top}px;width:${width}px;height:${height}px;"
    >
      <div class="match-header">
        <span class="match-id">${match.id}</span>
        ${statusBadge}
      </div>
      <div class="match-team ${isWinnerA ? 'winner' : match.winner ? 'loser' : ''} ${!teamA && !match.isBye ? 'empty' : ''}">
        <span class="team-name">${displayTeamA}</span>
        ${match.scoreA !== null && match.scoreA !== undefined
          ? `<span class="team-score ${isWinnerA ? 'win' : ''}">${match.scoreA}</span>`
          : ''}
      </div>
      <div class="match-vs">VS</div>
      <div class="match-team ${isWinnerB ? 'winner' : match.winner ? 'loser' : ''} ${!teamB && !match.isBye ? 'empty' : ''}">
        <span class="team-name">${displayTeamB}</span>
        ${match.scoreB !== null && match.scoreB !== undefined
          ? `<span class="team-score ${isWinnerB ? 'win' : ''}">${match.scoreB}</span>`
          : ''}
      </div>
    </div>
  `;
}

/**
 * Tính vị trí Y cho từng match
 */
function calculatePositions(bracket, matchHeight, matchGap) {
  const positions = [];
  const firstRoundCount = bracket.rounds[0].length;
  const rowHeight = matchHeight + matchGap;

  const firstPositions = [];
  for (let i = 0; i < firstRoundCount; i++) {
    firstPositions.push(30 + i * rowHeight);
  }
  positions.push(firstPositions);

  for (let r = 1; r < bracket.rounds.length; r++) {
    const prevPositions = positions[r - 1];
    const currPositions = [];
    for (let i = 0; i < bracket.rounds[r].length; i++) {
      const posA = prevPositions[i * 2];
      const posB = prevPositions[i * 2 + 1];
      currPositions.push((posA + posB) / 2);
    }
    positions.push(currPositions);
  }

  return positions;
}

/**
 * Tính chiều rộng canvas
 */
function calculateCanvasWidth(bracket, colWidth, connectorWidth) {
  return bracket.rounds.length * (colWidth + connectorWidth) + colWidth + 100;
}

/**
 * Tìm match trong bracket
 */
function findMatchInBracket(bracket, matchId) {
  for (let r = 0; r < bracket.rounds.length; r++) {
    for (let m = 0; m < bracket.rounds[r].length; m++) {
      if (bracket.rounds[r][m].id === matchId) {
        return { match: bracket.rounds[r][m], roundIndex: r, matchIndex: m };
      }
    }
  }
  if (bracket.thirdPlaceMatch && bracket.thirdPlaceMatch.id === matchId) {
    return { match: bracket.thirdPlaceMatch, roundIndex: -1, matchIndex: -1 };
  }
  return null;
}

/**
 * Bind zoom/pan gestures
 */
function bindZoomPan(container) {
  const canvas = container.querySelector('.bracket-canvas');
  const scrollContainer = container.querySelector('.bracket-scroll-container');
  if (!canvas || !scrollContainer) return;

  let scale = 1;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let startScrollTop = 0;

  scrollContainer.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      scale = Math.min(2, Math.max(0.3, scale + delta));
      applyScale();
    }
  }, { passive: false });

  scrollContainer.addEventListener('mousedown', (e) => {
    if (e.target.closest('.bracket-match')) return;
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    startScrollLeft = scrollContainer.scrollLeft;
    startScrollTop = scrollContainer.scrollTop;
    scrollContainer.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    scrollContainer.scrollLeft = startScrollLeft - dx;
    scrollContainer.scrollTop = startScrollTop - dy;
  });

  document.addEventListener('mouseup', () => {
    isPanning = false;
    scrollContainer.style.cursor = 'grab';
  });

  let touchStartDist = 0;
  let touchStartScale = 1;
  let touchStartMid = null;
  let touchStartScroll = null;

  scrollContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartScale = scale;
      touchStartMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    } else if (e.touches.length === 1 && !e.target.closest('.bracket-match')) {
      touchStartScroll = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        scrollLeft: scrollContainer.scrollLeft,
        scrollTop: scrollContainer.scrollTop,
      };
    }
  }, { passive: true });

  scrollContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / touchStartDist;
      scale = Math.min(2, Math.max(0.3, touchStartScale * ratio));
      applyScale();
    } else if (e.touches.length === 1 && touchStartScroll) {
      const dx = touchStartScroll.x - e.touches[0].clientX;
      const dy = touchStartScroll.y - e.touches[0].clientY;
      scrollContainer.scrollLeft = touchStartScroll.scrollLeft + dx;
      scrollContainer.scrollTop = touchStartScroll.scrollTop + dy;
    }
  }, { passive: false });

  scrollContainer.addEventListener('touchend', () => {
    touchStartScroll = null;
  });

  container.querySelectorAll('.bracket-zoom-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'zoom-in') scale = Math.min(2, scale + 0.15);
      else if (action === 'zoom-out') scale = Math.max(0.3, scale - 0.15);
      else if (action === 'zoom-reset') scale = 1;
      applyScale();
    });
  });

  function applyScale() {
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = 'top left';
    canvas.style.width = canvas.offsetWidth * scale + 'px';
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Inject CSS cho bracket (gọi 1 lần khi khởi động)
 */
export function injectBracketStyles() {
  if (document.getElementById('bracket-styles')) return;

  const style = document.createElement('style');
  style.id = 'bracket-styles';
  style.textContent = `
    /* ============ BRACKET WRAPPER ============ */
    .bracket-wrapper {
      position: relative;
      background: #0a0e1a;
      border-radius: 12px;
      padding: 12px;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    }

    .bracket-scroll-container {
      overflow: auto;
      cursor: grab;
      border-radius: 8px;
      max-height: 600px;
      background: #0d1117;
      padding: 20px;
      -webkit-overflow-scrolling: touch;
    }

    .bracket-scroll-container::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .bracket-scroll-container::-webkit-scrollbar-track {
      background: #131823;
    }
    .bracket-scroll-container::-webkit-scrollbar-thumb {
      background: #2a3142;
      border-radius: 5px;
    }
    .bracket-scroll-container::-webkit-scrollbar-thumb:hover {
      background: #3b4559;
    }

    .bracket-canvas {
      position: relative;
      transition: transform 0.1s ease-out;
    }

    /* ============ ZOOM CONTROLS ============ */
    .bracket-zoom-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 6px;
      z-index: 100;
      background: rgba(19, 24, 35, 0.9);
      padding: 6px;
      border-radius: 8px;
      border: 1px solid #2a3142;
    }

    .bracket-zoom-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #1c2333;
      color: #c4f82a;
      border-radius: 6px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }

    .bracket-zoom-btn:hover {
      background: #c4f82a;
      color: #0a0e1a;
    }

    /* ============ ROUND LABEL ============ */
    .bracket-round-label {
      position: absolute;
      top: 0;
      padding: 8px 12px;
      background: linear-gradient(135deg, #1e293b, #334155);
      color: #c4f82a;
      font-weight: 800;
      font-size: 12px;
      text-align: center;
      border-radius: 6px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .bracket-round-label.third-place-label {
      background: linear-gradient(135deg, #78350f, #92400e);
      color: #fbbf24;
      position: absolute;
    }

    /* ============ MATCH CARD ============ */
    .bracket-match {
      position: absolute;
      background: #131823;
      border: 1px solid #2a3142;
      border-left: 3px solid #3b82f6;
      border-radius: 8px;
      padding: 6px 8px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      flex-direction: column;
      justify-content: center;
      user-select: none;
    }

    .bracket-match:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      border-left-color: #c4f82a;
    }

    .bracket-match.is-bye {
      border-left-color: #f59e0b;
      background: #1c1706;
    }

    .bracket-match.is-done {
      border-left-color: #22c55e;
    }

    .bracket-match.is-ready {
      border-left-color: #c4f82a;
    }

    .bracket-match.is-placeholder {
      opacity: 0.5;
      border-left-color: #4b5563;
    }

    .bracket-match.is-third-place {
      border-left-color: #f59e0b;
      background: #1c1706;
    }

    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      font-size: 9px;
      color: #64748b;
      font-weight: 700;
    }

    .match-id {
      text-transform: uppercase;
    }

    .match-status-done { color: #22c55e; }
    .match-status-ready { color: #c4f82a; }
    .match-status-bye { color: #f59e0b; }

    .match-team {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
      min-height: 20px;
    }

    .match-team.winner {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      font-weight: 800;
    }

    .match-team.loser {
      color: #64748b;
    }

    .match-team.empty {
      color: #4b5563;
      font-style: italic;
      font-weight: 400;
    }

    .team-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .team-score {
      background: #1c2333;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      margin-left: 6px;
      min-width: 22px;
      text-align: center;
    }

    .team-score.win {
      background: #22c55e;
      color: white;
    }

    .match-vs {
      text-align: center;
      color: #4b5563;
      font-size: 8px;
      font-weight: 700;
      margin: 1px 0;
      letter-spacing: 1px;
    }

    /* ============ CONNECTORS ============ */
    .bracket-connectors {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 0;
    }

    .bracket-connector-line {
      transition: stroke 0.15s;
    }

    /* ============ RESPONSIVE ============ */
    @media (max-width: 768px) {
      .bracket-scroll-container {
        max-height: 500px;
        padding: 12px;
      }

      .bracket-zoom-controls {
        top: 8px;
        right: 8px;
      }

      .bracket-zoom-btn {
        width: 28px;
        height: 28px;
        font-size: 16px;
      }
    }
  `;
  document.head.appendChild(style);
}
