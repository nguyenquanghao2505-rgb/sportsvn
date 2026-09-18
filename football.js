            // ==========================================
            // 5. LOAD KẾT QUẢ BÓNG ĐÁ TỪ THESPORTSDB
            // ==========================================
            let currentLeague = '4328';
            let currentStatus = 'upcoming';

            async function loadFootballMatches() {
                const container = document.getElementById('footballMatches');
                if (!container) return;

                container.innerHTML = `
                    <div style="text-align:center;padding:30px;color:#6b7280;font-size:12px;">
                        ⏳ Đang tải...
                    </div>
                `;

                try {
                    let matches = [];
                    
                    if (currentStatus === 'upcoming') {
                        matches = await window.FootballAPI.getUpcomingMatches(currentLeague);
                    } else {
                        matches = await window.FootballAPI.getRecentMatches(currentLeague);
                    }

                    if (!matches || matches.length === 0) {
                        container.innerHTML = `
                            <div style="text-align:center;padding:30px;color:#9ca3af;font-size:12px;">
                                📅 Không có trận đấu nào
                            </div>
                        `;
                        return;
                    }

                    // Sắp xếp theo ngày
                    matches.sort((a, b) => new Date(a.dateEvent) - new Date(b.dateEvent));
                    
                    // Chỉ lấy 5 trận
                    const displayMatches = matches.slice(0, 5);

                    container.innerHTML = displayMatches.map(match => {
                        const homeScore = match.intHomeScore ?? '-';
                        const awayScore = match.intAwayScore ?? '-';
                        const isFinished = match.intHomeScore !== null && match.intHomeScore !== undefined;
                        
                        const statusText = isFinished 
                            ? 'KT' 
                            : (match.strTime ? window.FootballAPI.formatMatchTime(match.strTime) : '—');
                        
                        const statusColor = isFinished ? '#6b7280' : '#1769ff';

                        return `
                            <div class="result-item">
                                <div class="result-team" title="${match.strHomeTeam}">${match.strHomeTeam}</div>
                                <div class="result-score">${homeScore} - ${awayScore}</div>
                                <div class="result-team" style="text-align:right;" title="${match.strAwayTeam}">${match.strAwayTeam}</div>
                                <div class="result-status" style="color:${statusColor};font-weight:700;">${statusText}</div>
                            </div>
                        `;
                    }).join('');

                    console.log(`✅ Đã load ${displayMatches.length} trận ${currentLeague}`);

                } catch (error) {
                    console.error('Lỗi load bóng đá:', error);
                    container.innerHTML = `
                        <div style="text-align:center;padding:30px;color:#dc2626;font-size:12px;">
                            ❌ Không thể tải dữ liệu
                        </div>
                    `;
                }
            }

            // Gắn sự kiện cho League tabs
            document.querySelectorAll('#footballLeagueTabs .result-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('#footballLeagueTabs .result-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    currentLeague = tab.dataset.league;
                    loadFootballMatches();
                });
            });

            // Gắn sự kiện cho Status tabs
            document.querySelectorAll('#footballStatusTabs .result-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('#footballStatusTabs .result-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    currentStatus = tab.dataset.status;
                    loadFootballMatches();
                });
            });

            // Load lần đầu
            loadFootballMatches();
