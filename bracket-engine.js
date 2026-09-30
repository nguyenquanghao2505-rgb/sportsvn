<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Bracket Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: #0a0e1a;
      color: #e2e8f0;
      padding: 24px;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      color: #c4f82a;
      margin-bottom: 8px;
      font-size: 24px;
    }
    h2 {
      color: #c4f82a;
      margin: 24px 0 12px;
      font-size: 18px;
      border-bottom: 2px solid #1c2333;
      padding-bottom: 8px;
    }
    .subtitle { color: #8b92a4; margin-bottom: 24px; }
    .btn {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn-primary { background: #c4f82a; color: #0a0e1a; }
    .btn-primary:hover { background: #a8d91e; }
    .btn-success { background: #22c55e; color: white; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-secondary { background: #1c2333; color: #e2e8f0; border: 1px solid #2a3142; }
    .btn-secondary:hover { background: #2a3142; }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin: 16px 0 24px;
    }
    .stat-card {
      background: #131823;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #2a3142;
    }
    .stat-label { color: #8b92a4; font-size: 12px; text-transform: uppercase; }
    .stat-value { font-size: 22px; font-weight: 800; color: #c4f82a; margin-top: 4px; }

    .bracket-view {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding: 16px 0;
      min-height: 400px;
    }
    .round {
      flex-shrink: 0;
      min-width: 240px;
    }
    .round-title {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: #c4f82a;
      padding: 10px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      text-align: center;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .match {
      background: #131823;
      border: 1px solid #2a3142;
      border-left: 3px solid #3b82f6;
      border-radius: 8px;
      padding: 8px;
      margin-bottom: 8px;
      transition: all 0.15s;
    }
    .match.bye { border-left-color: #f59e0b; background: #1c1706; }
    .match.done { border-left-color: #22c55e; }
    .match.ready { border-left-color: #c4f82a; }
    .match:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
    .match-id {
      font-size: 10px;
      color: #8b92a4;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .team {
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }
    .team-name { font-weight: 600; }
    .team.winner { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .team.loser { color: #8b92a4; }
    .team.empty { color: #4b5563; font-style: italic; }
    .team.bye { color: #f59e0b; font-weight: 700; }
    .score {
      background: #1c2333;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 12px;
      min-width: 32px;
      text-align: center;
    }
    .team.winner .score { background: #22c55e; color: white; }
    .vs-divider {
      text-align: center;
      color: #4b5563;
      font-size: 10px;
      font-weight: 700;
      margin: 2px 0;
    }

    .log {
      background: #0d1117;
      border: 1px solid #2a3142;
      border-radius: 8px;
      padding: 12px;
      font-family: 'SF Mono', monospace;
      font-size: 12px;
      color: #8b92a4;
      max-height: 300px;
      overflow-y: auto;
      margin-top: 16px;
    }
    .log-entry { padding: 4px 0; border-bottom: 1px solid #161b22; }
    .log-entry.ok { color: #22c55e; }
    .log-entry.err { color: #ef4444; }
    .log-entry.warn { color: #f59e0b; }

    .test-section {
      background: #131823;
      border: 1px solid #2a3142;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .test-section h3 {
      color: #c4f82a;
      font-size: 15px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>

<div class="container">
  <h1>🧪 Test Bracket Engine</h1>
  <p class="subtitle">Kiểm tra: tạo bracket, ghi kết quả, đẩy winner lên vòng sau</p>

  <!-- TEST 1: 8 đội -->
  <div class="test-section">
    <h3>Test 1: 8 đội — Knockout thuần</h3>
    <button class="btn btn-primary" onclick="test8Teams()">▶ Chạy test 8 đội</button>
    <button class="btn btn-success" onclick="simulateAll8()">⚡ Mô phỏng tất cả vòng</button>
  </div>

  <!-- TEST 2: 16 đội + BYE -->
  <div class="test-section">
    <h3>Test 2: 16 đội — Không có BYE</h3>
    <button class="btn btn-primary" onclick="test16Teams()">▶ Chạy test 16 đội</button>
    <button class="btn btn-success" onclick="simulateAll16()">⚡ Mô phỏng tất cả vòng</button>
  </div>

  <!-- TEST 3: 13 đội + 3 BYE -->
  <div class="test-section">
    <h3>Test 3: 13 đội — Có 3 BYE tự động</h3>
    <button class="btn btn-primary" onclick="test13Teams()">▶ Chạy test 13 đội</button>
    <button class="btn btn-success" onclick="simulateAll13()">⚡ Mô phỏng tất cả vòng</button>
  </div>

  <!-- Stats -->
  <div id="stats-container"></div>

  <!-- Bracket View -->
  <h2>📊 Sơ đồ bracket</h2>
  <div id="bracket-view" class="bracket-view"></div>

  <!-- Log -->
  <h2>📋 Log</h2>
  <div id="log" class="log"></div>

  <!-- Validation -->
  <h2>✅ Validate</h2>
  <div id="validation"></div>
</div>

<script type="module">
  import {
    createBracket,
    recordWinner,
    validateBracket,
    getBracketStats,
    getReadyMatches,
    resetBracket,
  } from './bracket-engine.js';

  let currentBracket = null;

  const logEl = document.getElementById('log');
  const bracketViewEl = document.getElementById('bracket-view');
  const statsEl = document.getElementById('stats-container');
  const validationEl = document.getElementById('validation');

  function log(msg, type = '') {
    const div = document.createElement('div');
    div.className = 'log-entry ' + type;
    div.textContent = `[${new Date().toLocaleTimeString('vi-VN')}] ${msg}`;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  // ===== Tạo đội mẫu =====
  function makeTeams(n, prefix = 'Đội') {
    const teams = [];
    for (let i = 1; i <= n; i++) {
      teams.push({
        name: `${prefix} ${i}`,
        club: `CLB ${Math.ceil(i / 4)}`,
      });
    }
    return teams;
  }

  // ===== TEST 1: 8 đội =====
  window.test8Teams = function () {
    clearLog();
    log('=== TEST 8 ĐỘI ===', 'ok');
    const teams = makeTeams(8, 'VĐV');
    currentBracket = createBracket(teams);
    log(`✅ Tạo bracket: ${currentBracket.bracketSize} slots, ${currentBracket.numByes} BYE`, 'ok');
    render();
  };

  window.simulateAll8 = function () {
    if (!currentBracket) return test8Teams();
    simulateAll();
  };

  // ===== TEST 2: 16 đội =====
  window.test16Teams = function () {
    clearLog();
    log('=== TEST 16 ĐỘI ===', 'ok');
    const teams = makeTeams(16, 'VĐV');
    currentBracket = createBracket(teams);
    log(`✅ Tạo bracket: ${currentBracket.bracketSize} slots, ${currentBracket.numByes} BYE`, 'ok');
    render();
  };

  window.simulateAll16 = function () {
    if (!currentBracket) return test16Teams();
    simulateAll();
  };

  // ===== TEST 3: 13 đội + 3 BYE =====
  window.test13Teams = function () {
    clearLog();
    log('=== TEST 13 ĐỘI (3 BYE tự động) ===', 'ok');
    const teams = makeTeams(13, 'VĐV');
    currentBracket = createBracket(teams);
    log(`✅ Tạo bracket: ${currentBracket.bracketSize} slots, ${currentBracket.numByes} BYE`, 'ok');
    render();
  };

  window.simulateAll13 = function () {
    if (!currentBracket) return test13Teams();
    simulateAll();
  };

  // ===== Mô phỏng tất cả vòng =====
  function simulateAll() {
    let round = 0;
    let safety = 0;

    while (safety < 100) {
      safety++;
      const ready = getReadyMatches(currentBracket);

      if (ready.length === 0) {
        log('🎉 Không còn trận nào cần đấu', 'ok');
        break;
      }

      log(`--- Vòng ${round + 1}: ${ready.length} trận ---`);

      ready.forEach((m) => {
        const scoreA = Math.floor(Math.random() * 11) + 1;
        const scoreB = Math.floor(Math.random() * 11) + 1;
        const winner = scoreA > scoreB ? 'A' : 'B';

        const winnerTeam = winner === 'A' ? m.teamA : m.teamB;
        const loserTeam = winner === 'A' ? m.teamB : m.teamA;

        try {
          recordWinner(currentBracket, m.id, winner, scoreA, scoreB);
          log(`  ✅ ${m.id}: ${m.teamA.name} ${scoreA} - ${scoreB} ${m.teamB.name} → ${winnerTeam.name} thắng`, 'ok');
        } catch (err) {
          log(`  ❌ ${m.id}: ${err.message}`, 'err');
        }
      });

      round++;
    }

    render();
    const v = validateBracket(currentBracket);
    if (v.valid) {
      log(`✅ Bracket HỢP LỆ — 0 lỗi, ${v.warningCount} cảnh báo`, 'ok');
    } else {
      log(`❌ Bracket có ${v.errorCount} LỖI, ${v.warningCount} cảnh báo`, 'err');
    }
  }

  // ===== Render =====
  function render() {
    if (!currentBracket) return;

    // Stats
    const stats = getBracketStats(currentBracket);
    statsEl.innerHTML = `
      <div class="stats">
        <div class="stat-card"><div class="stat-label">Đội</div><div class="stat-value">${stats.teamCount}</div></div>
        <div class="stat-card"><div class="stat-label">Bracket size</div><div class="stat-value">${stats.bracketSize}</div></div>
        <div class="stat-card"><div class="stat-label">BYE</div><div class="stat-value">${stats.numByes}</div></div>
        <div class="stat-card"><div class="stat-label">Vòng</div><div class="stat-value">${stats.totalRounds}</div></div>
        <div class="stat-card"><div class="stat-label">Trận xong</div><div class="stat-value">${stats.doneMatches}/${stats.totalMatches}</div></div>
        <div class="stat-card"><div class="stat-label">Tiến độ</div><div class="stat-value">${stats.progress}%</div></div>
      </div>
    `;

    // Bracket
    bracketViewEl.innerHTML = currentBracket.rounds.map((round, rIdx) => `
      <div class="round">
        <div class="round-title">${currentBracket.roundNames[rIdx]}</div>
        ${round.map((m) => renderMatch(m)).join('')}
      </div>
    `).join('');

    // Validation
    const v = validateBracket(currentBracket);
    if (v.valid && v.warningCount === 0) {
      validationEl.innerHTML = `<div class="stat-card" style="border-color:#22c55e;">
        <div class="stat-value" style="color:#22c55e;">✅ Bracket hợp lệ</div>
        <div class="stat-label">Không có lỗi, không có cảnh báo</div>
      </div>`;
    } else {
      validationEl.innerHTML = `<div class="stat-card" style="border-color:${v.valid ? '#f59e0b' : '#ef4444'};">
        <div class="stat-value" style="color:${v.valid ? '#f59e0b' : '#ef4444'};">
          ${v.valid ? '⚠️' : '❌'} ${v.errorCount} lỗi, ${v.warningCount} cảnh báo
        </div>
        <ul style="margin-top:8px;font-size:12px;color:#8b92a4;">
          ${v.issues.map((i) => `<li>${i.location ? i.location + ': ' : ''}${i.message}</li>`).join('')}
        </ul>
      </div>`;
    }
  }

  function renderMatch(m) {
    const cls = m.isBye ? 'bye' : m.status === 'done' ? 'done' : m.status === 'ready' ? 'ready' : '';
    const isWinnerA = m.winner === 'A';
    const isWinnerB = m.winner === 'B';

    return `
      <div class="match ${cls}">
        <div class="match-id">${m.id} ${m.status === 'done' ? '✓' : m.status === 'ready' ? '🎯' : ''}</div>
        <div class="team ${isWinnerA ? 'winner' : m.teamA ? (m.winner ? 'loser' : '') : 'empty'}">
          <span class="team-name">${m.teamA ? m.teamA.name : '—'}</span>
          ${m.scoreA !== null ? `<span class="score">${m.scoreA}</span>` : ''}
        </div>
        <div class="vs-divider">VS</div>
        <div class="team ${isWinnerB ? 'winner' : m.teamB ? (m.winner ? 'loser' : '') : 'empty'}">
          <span class="team-name">${m.teamB ? m.teamB.name : (m.isBye ? '⭐ BYE' : '—')}</span>
          ${m.scoreB !== null ? `<span class="score">${m.scoreB}</span>` : ''}
        </div>
      </div>
    `;
  }

  log('🚀 Sẵn sàng test. Bấm nút "Chạy test" để bắt đầu.');
</script>

</body>
</html>
