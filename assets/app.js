/* ============================================
   NCAA MARCH MADNESS BRACKET LEADERBOARD
   Main application logic — v2 with prizes,
   Final Four, regional scoring, real names
   ============================================ */

(function () {
  'use strict';

  // ---- State ----
  let data = null;
  let comparisonData = null;
  let filteredParticipants = [];
  let currentFilter = 'all';
  let currentSort = 'rank';
  let searchQuery = '';
  let activeView = 'leaderboard';
  let compareSearchQuery = '';
  let selectedComparisonName = '';

  // ---- Color palette for avatars ----
  const AVATAR_COLORS = [
    '#FF6B35', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C',
    '#2ECC71', '#F39C12', '#E67E22', '#16A085', '#2980B9',
    '#8E44AD', '#D35400', '#27AE60', '#C0392B', '#7F8C8D',
    '#2C3E50', '#F1C40F', '#1F77B4', '#FF7F0E', '#2CA02C',
  ];

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    loadData();
  });

  // ---- Background Particles ----
  function initParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['#FF6B35', '#4DA8DA', '#FFD700', '#2ECC71', '#9B59B6'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      const size = Math.random() * 20 + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = color;
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 20 + 15) + 's';
      p.style.animationDelay = (Math.random() * 20) + 's';
      container.appendChild(p);
    }
  }

  // ---- Load Data ----
  function loadData() {
    Promise.all([
      fetchJson('data/leaderboard.json'),
      fetchJson('data/bracket_comparisons.json')
    ])
      .then(([leaderboardJson, comparisonJson]) => {
        data = leaderboardJson;
        comparisonData = comparisonJson;
        filteredParticipants = [...data.participants];
        if (!selectedComparisonName) {
          const defaultParticipant = comparisonData.participants.find(p => p.name === 'Yash') || comparisonData.participants[0];
          selectedComparisonName = defaultParticipant ? defaultParticipant.name : '';
        }
        render();
      })
      .catch(err => {
        console.error(err);
        document.getElementById('leaderboardBody').innerHTML =
          '<tr><td colspan="12" class="no-results"><div class="emoji">⚠️</div>Failed to load data. Make sure data/leaderboard.json exists.</td></tr>';
      });
  }

  function fetchJson(path) {
    return fetch(path).then(res => {
      if (!res.ok) throw new Error('Failed to load ' + path);
      return res.json();
    });
  }

  // ---- Render Everything ----
  function render() {
    renderViewTabs();
    renderStatus();
    renderStats();
    renderFinalFour();
    renderPrizes();
    renderPodium();
    renderRounds();
    renderComparisonView();
    applyFilters();
    syncViewState();
    bindEvents();
  }

  function renderViewTabs() {
    document.querySelectorAll('.view-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === activeView);
    });
  }

  function syncViewState() {
    document.querySelectorAll('section[data-view]').forEach(section => {
      section.classList.toggle('is-hidden', section.dataset.view !== activeView);
    });
  }

  // ---- Tournament Status ----
  function renderStatus() {
    const t = data.tournament;
    document.getElementById('statusText').textContent = t.status;
    const badge = document.querySelector('.status-badge');
    if (t.roundsCompleted >= 6) {
      badge.classList.remove('live');
      badge.classList.add('completed');
    }
  }

  // ---- Stats Bar ----
  function renderStats() {
    const p = data.participants;
    const totalScores = p.map(x => x.totalPoints);
    const avg = Math.round(totalScores.reduce((a, b) => a + b, 0) / p.length);

    document.getElementById('statPlayers').textContent = p.length;
    document.getElementById('statGamesPlayed').textContent =
      data.tournament.gamesPlayed + '/' + data.tournament.totalGames;
    document.getElementById('statAvgScore').textContent = avg;
    document.getElementById('statTopScore').textContent = Math.max(...totalScores);
    document.getElementById('statMaxPossible').textContent = data.scoring.maxScore;

    // Animate numbers
    document.querySelectorAll('.stat-number').forEach(el => {
      animateNumber(el, 0, parseInt(el.textContent) || 0, 1000);
    });
  }

  function animateNumber(el, start, end, duration) {
    const originalText = el.textContent;
    // Only animate pure numbers
    if (originalText.includes('/')) return;

    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ---- Podium ----
  function renderPodium() {
    const top3 = data.participants.slice(0, 3);
    const spots = [
      document.getElementById('podium1'),
      document.getElementById('podium2'),
      document.getElementById('podium3'),
    ];

    top3.forEach((player, i) => {
      const spot = spots[i];
      spot.querySelector('.podium-avatar').textContent = player.avatar;
      spot.querySelector('.podium-name').textContent = player.name;
      spot.querySelector('.podium-score').textContent = player.totalPoints + ' pts';
      const champEl = spot.querySelector('.podium-champion');
      champEl.textContent = '\u{1F3C6} ' + player.champion;
      champEl.style.color = player.championAlive ? '#2ECC71' : '#E74C3C';
      // Prize amount
      if (data.prizes && data.prizes.placement[i]) {
        const existing = spot.querySelector('.podium-prize');
        if (!existing) {
          const prizeEl = document.createElement('div');
          prizeEl.className = 'podium-prize';
          prizeEl.textContent = '$' + data.prizes.placement[i].amount;
          prizeEl.style.cssText = 'color:#2ECC71;font-family:Oswald,sans-serif;font-size:1.1rem;font-weight:700;margin-top:4px';
          champEl.after(prizeEl);
        }
      }
    });
  }

  // ---- Final Four Banner ----
  function renderFinalFour() {
    const ff = data.finalFour;
    if (!ff) return;
    const container = document.getElementById('ffMatchups');
    const title = document.getElementById('finalFourTitle');
    if (!container) return;
    if (title && ff.title) {
      title.textContent = '🏟️ ' + ff.title;
    }

    function parseBracketTeam(raw, fallbackSeed) {
      if (!raw) return { seed: fallbackSeed || '', name: 'TBD' };
      const match = String(raw).match(/^(.+?)\s*\(([^)]+)\)$/);
      if (!match) return { seed: fallbackSeed || '', name: String(raw) };
      return {
        name: match[1].trim(),
        seed: match[2].replace(', #', '').replace('#', ''),
      };
    }

    function renderGame(game, fallbackLeftSeed, fallbackRightSeed) {
      const team1 = parseBracketTeam(game.team1, fallbackLeftSeed);
      const team2 = parseBracketTeam(game.team2, fallbackRightSeed);
      const center = game.score1 != null && game.score2 != null
        ? '<div class="ff-vs">Final</div><div class="ff-time">' + escapeHtml(String(game.score1)) + ' - ' + escapeHtml(String(game.score2)) + '</div>'
        : '<div class="ff-vs">VS</div><div class="ff-time">' + escapeHtml(game.time || '') + '</div>';

      return '<div class="ff-game">' +
        '<div class="ff-team">' +
          '<span class="ff-seed">' + escapeHtml(team1.seed) + '</span>' +
          '<span class="ff-name">' + escapeHtml(team1.name) + '</span>' +
        '</div>' +
        '<div style="text-align:center">' + center + '</div>' +
        '<div class="ff-team right">' +
          '<span class="ff-seed">' + escapeHtml(team2.seed) + '</span>' +
          '<span class="ff-name">' + escapeHtml(team2.name) + '</span>' +
        '</div>' +
      '</div>';
    }

    container.innerHTML =
      renderGame(ff.semifinal1, 'E2', 'S3') +
      renderGame(ff.semifinal2, 'MW1', 'W1') +
      '<div class="ff-label">Championship: ' + escapeHtml(ff.championship.date) +
        ' &middot; ' + escapeHtml(ff.championship.time) +
        ' &middot; ' + escapeHtml(ff.championship.team1 + ' vs ' + ff.championship.team2) +
        ' &middot; ' + escapeHtml(ff.venue) + '</div>';
  }

  // ---- Prizes Section ----
  function renderPrizes() {
    var prizes = data.prizes;
    if (!prizes) return;
    var container = document.getElementById('prizesGrid');
    if (!container) return;

    var html = '<div class="prize-card"><h3>\u{1F3C6} Top Finishers</h3>';
    prizes.placement.forEach(function(p) {
      html += '<div class="prize-row">' +
        '<span class="prize-label">' + escapeHtml(p.place) + '</span>' +
        '<span class="prize-amount">$' + p.amount + '</span></div>';
    });
    html += '</div>';

    html += '<div class="prize-card"><h3>\u{1F3AF} Round Bonuses</h3>';
    if (prizes.roundBonuses) prizes.roundBonuses.forEach(function(b) {
      var winnerText = b.winners && b.winners.length === 1
        ? escapeHtml(b.winners[0]) + ' (' + b.value + ')'
        : b.winners ? b.winners.length + '-way tie (' + b.value + ') — $' + b.splitAmount + ' each' : 'TBD';
      html += '<div class="prize-row"><div><span class="prize-label">Best ' + escapeHtml(b.round) + '</span><br>' +
        '<span class="prize-winner">' + winnerText + '</span></div>' +
        '<span class="prize-amount">$' + b.amount + '</span></div>';
    });
    html += '</div>';

    html += '<div class="prize-card"><h3>\u{1F30E} Region Bonuses</h3>';
    if (prizes.regionBonuses) prizes.regionBonuses.forEach(function(b) {
      var winnerText = b.winners && b.winners.length === 1
        ? escapeHtml(b.winners[0]) + ' (' + b.value + ' pts)'
        : b.winners ? b.winners.length + '-way tie (' + b.value + ' pts) — $' + b.splitAmount + ' each' : 'TBD';
      html += '<div class="prize-row"><div><span class="prize-label">Best ' + escapeHtml(b.region) + '</span><br>' +
        '<span class="prize-winner">' + winnerText + '</span></div>' +
        '<span class="prize-amount">$' + b.amount + '</span></div>';
    });
    html += '</div>';

    html += '<div class="prize-card"><h3>\u{1F480} Booby Prizes</h3>';
    if (prizes.roundBoobyPrizes) prizes.roundBoobyPrizes.forEach(function(b) {
      var winnerText = b.winners && b.winners.length === 1
        ? escapeHtml(b.winners[0]) + ' (' + b.value + ')'
        : b.winners ? b.winners.length + '-way tie (' + b.value + ')' : 'TBD';
      html += '<div class="prize-row booby"><div><span class="prize-label">Worst ' + escapeHtml(b.round) + '</span><br>' +
        '<span class="prize-winner">' + winnerText + '</span></div>' +
        '<span class="prize-amount">$' + b.amount + '</span></div>';
    });
    if (prizes.consolationPrizes) prizes.consolationPrizes.forEach(function(b) {
      html += '<div class="prize-row booby"><div><span class="prize-label">' + escapeHtml(b.category) + '</span><br>' +
        '<span class="prize-winner">' + escapeHtml(b.winner) + '</span></div>' +
        '<span class="prize-amount">$' + b.amount + '</span></div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  // ---- Rounds Breakdown ----
  function renderRounds() {
    const container = document.getElementById('roundsBar');
    container.innerHTML = '';

    data.rounds.forEach(round => {
      const card = document.createElement('div');
      card.className = 'round-card ' + (round.completed ? 'completed' : 'upcoming');
      card.innerHTML = `
        <div class="round-name">${round.shortName}</div>
        <div class="round-points">${round.pointsPer} pts</div>
        <div class="round-detail">${round.games} game${round.games > 1 ? 's' : ''}</div>
        <div class="round-status">${round.completed ? '✓ Complete' : '◦ Upcoming'}</div>
      `;
      container.appendChild(card);
    });
  }

  function renderComparisonView() {
    if (!comparisonData) return;
    renderComparisonPicker();
    renderBracketBoard(document.getElementById('actualBracketPanel'), comparisonData.actual, true);
    renderComparisonSummary(document.getElementById('actualBracketSummary'), comparisonData.actual, true);

    const selected = getSelectedComparisonParticipant();
    document.getElementById('selectedBracketTitle').textContent = selected ? selected.name : 'Participant Bracket';
    document.getElementById('selectedBracketMeta').textContent = selected
      ? `Rank #${selected.rank} · ${selected.totalPoints} pts${selected.available ? '' : ' · comparison unavailable'}`
      : (compareSearchQuery ? 'No participants match that search.' : 'Select a participant to compare.');

    renderComparisonSummary(document.getElementById('selectedBracketSummary'), selected, false);

    renderBracketBoard(document.getElementById('selectedBracketPanel'), selected, false);
  }

  function renderComparisonPicker() {
    const select = document.getElementById('compareSelect');
    if (!select || !comparisonData) return;

    const filtered = comparisonData.participants.filter(participant =>
      participant.name.toLowerCase().includes(compareSearchQuery.toLowerCase())
    );

    if (!filtered.some(participant => participant.name === selectedComparisonName)) {
      selectedComparisonName = filtered.length ? filtered[0].name : '';
    }

    if (!filtered.length) {
      select.innerHTML = '<option value="">No matching participants</option>';
      return;
    }

    select.innerHTML = filtered.map(participant => {
      const suffix = participant.available ? `#${participant.rank} · ${participant.totalPoints} pts` : 'R1+R2 only';
      const selected = participant.name === selectedComparisonName ? ' selected' : '';
      return `<option value="${escapeHtml(participant.name)}"${selected}>${escapeHtml(participant.name)} — ${escapeHtml(suffix)}</option>`;
    }).join('');
  }

  function getSelectedComparisonParticipant() {
    if (!comparisonData) return null;
    return comparisonData.participants.find(participant => participant.name === selectedComparisonName) || comparisonData.participants[0] || null;
  }

  function renderBracketBoard(container, bracket, isActual) {
    if (!container) return;
    if (!bracket) {
      container.innerHTML = '<div class="comparison-unavailable"><div class="comparison-unavailable-title">Comparison unavailable</div><div class="comparison-unavailable-copy">Bracket data could not be loaded.</div></div>';
      return;
    }

    if (!bracket.available) {
      container.innerHTML = `
        <div class="comparison-unavailable">
          <div class="comparison-unavailable-title">No bracket sheet available</div>
          <div class="comparison-unavailable-copy">${escapeHtml(bracket.message || 'Only Round of 64 and Round of 32 totals were available for this participant.')}</div>
        </div>`;
      return;
    }

    const regionCards = comparisonData.regionOrder.map(region => renderRegionCard(region, bracket.regions[region])).join('');
    const futureCards = (bracket.futureGroups || []).map(group => renderFutureCard(group, isActual)).join('');

    container.innerHTML = `
      <div class="comparison-region-grid">${regionCards}</div>
      <div class="comparison-future-strip">${futureCards}</div>
    `;
  }

  function renderRegionCard(region, regionData) {
    const roundColumns = comparisonData.roundOrder.map(round => {
      const entries = ((regionData || {})[round.key] || []).map((entry, index) =>
        renderPickChip(entry, {
          roundKey: round.key,
          index,
          columnSize: ((regionData || {})[round.key] || []).length,
        })
      ).join('');
      return `
        <div class="comparison-round-column comparison-round-column-${round.key.toLowerCase()}">
          <div class="comparison-round-heading">${round.label}<span>${round.points} pt${round.points === 1 ? '' : 's'}</span></div>
          <div class="comparison-round-stack">${entries}</div>
        </div>`;
    }).join('');

    return `
      <div class="comparison-region-card">
        <div class="comparison-region-header">${escapeHtml(region)}</div>
        <div class="comparison-round-columns comparison-round-columns-tree">${roundColumns}</div>
      </div>`;
  }

  function renderFutureCard(group) {
    const entries = (group.entries || []).map((entry, index) =>
      renderPickChip(entry, {
        roundKey: entry.round || 'future',
        index,
        columnSize: (group.entries || []).length,
      })
    ).join('');
    return `
      <div class="comparison-future-card">
        <div class="comparison-future-title">${escapeHtml(group.title)}</div>
        <div class="comparison-future-entries">${entries}</div>
      </div>`;
  }

  function renderPickChip(entry, options) {
    const status = entry && entry.status ? entry.status : 'empty';
    const team = entry && entry.team ? entry.team : '—';
    const points = entry && typeof entry.pointsAwarded === 'number' ? entry.pointsAwarded : 0;
    const title = entry && entry.actualTeam ? ` title="Actual: ${escapeHtml(entry.actualTeam)}"` : '';
    const roundKey = options && options.roundKey ? options.roundKey.toLowerCase() : 'generic';
    return `
      <div class="comparison-pick-chip comparison-pick-chip-${roundKey} ${status}"${title}>
        <span class="comparison-pick-points">+${points}</span>
        <span class="comparison-pick-name">${escapeHtml(team)}</span>
      </div>`;
  }

  function getBracketStats(bracket) {
    if (!comparisonData || !bracket || !bracket.available) return null;

    let correct = 0;
    let incorrect = 0;
    let pending = 0;
    let totalPoints = 0;

    comparisonData.regionOrder.forEach(region => {
      const regionData = bracket.regions && bracket.regions[region] ? bracket.regions[region] : {};
      comparisonData.roundOrder.forEach(round => {
        const entries = regionData[round.key] || [];
        entries.forEach(entry => {
          totalPoints += entry.pointsAwarded || 0;
          if (entry.status === 'correct') correct += 1;
          else if (entry.status === 'incorrect') incorrect += 1;
          else if (entry.status === 'pending') pending += 1;
        });
      });
    });

    (bracket.futureGroups || []).forEach(group => {
      (group.entries || []).forEach(entry => {
        totalPoints += entry.pointsAwarded || 0;
        if (entry.status === 'correct') correct += 1;
        else if (entry.status === 'incorrect') incorrect += 1;
        else if (entry.status === 'pending') pending += 1;
      });
    });

    const decided = correct + incorrect;
    const accuracy = decided ? Math.round((correct / decided) * 100) : 0;

    return {
      correct,
      incorrect,
      pending,
      decided,
      accuracy,
      totalPoints,
    };
  }

  function renderComparisonSummary(container, bracket, isActual) {
    if (!container) return;

    const stats = getBracketStats(bracket);
    if (!bracket) {
      container.innerHTML = '<span class="comparison-summary-pill muted">Search to load a bracket</span>';
      return;
    }

    if (!bracket.available || !stats) {
      container.innerHTML = '<span class="comparison-summary-pill muted">R1 and R2 totals only</span>';
      return;
    }

    if (isActual) {
      container.innerHTML = [
        `<span class="comparison-summary-pill strong">${stats.correct} decided slots</span>`,
        `<span class="comparison-summary-pill">${stats.totalPoints} points locked</span>`,
        '<span class="comparison-summary-pill">Blue cards are the truth board</span>'
      ].join('');
      return;
    }

    container.innerHTML = [
      `<span class="comparison-summary-pill strong">${stats.accuracy}% accuracy</span>`,
      `<span class="comparison-summary-pill">${stats.correct} right</span>`,
      `<span class="comparison-summary-pill danger">${stats.incorrect} missed</span>`,
      `<span class="comparison-summary-pill">${stats.totalPoints} points banked</span>`
    ].join('');
  }

  // ---- Leaderboard Table ----
  function renderTable() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    if (filteredParticipants.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" class="no-results">
            <div class="emoji">🔍</div>
            No players match your search
          </td>
        </tr>`;
      document.getElementById('playerCount').textContent = '(0 shown)';
      return;
    }

    document.getElementById('playerCount').textContent =
      `(${filteredParticipants.length} of ${data.participants.length})`;

    filteredParticipants.forEach((player, i) => {
      const tr = document.createElement('tr');
      if (player.rank <= 3) tr.classList.add('top-3');
      tr.style.animationDelay = (i * 0.03) + 's';

      const avatarColor = AVATAR_COLORS[hashCode(player.name) % AVATAR_COLORS.length];
      const pct = Math.round((player.totalPoints / data.scoring.maxScore) * 100);
      const tier = player.rank <= 10 ? 'top-tier' : player.rank <= 30 ? 'mid-tier' : 'low-tier';

      const rankClass = player.rank <= 3 ? `rank-${player.rank}` : 'rank-other';

      let roundCells = '';
      player.roundScores.forEach((score) => {
        const cls = score === 0 ? 'zero' : '';
        roundCells += `<td class="col-round"><span class="round-score ${cls}">${score}</span></td>`;
      });

      // Prize indicator for top 7
      let prizeTag = '';
      if (player.rank <= 7 && data.prizes) {
        const prizeAmt = data.prizes.placement[player.rank - 1].amount;
        prizeTag = `<span class="prize-tag" style="display:inline-block;background:#2ECC71;color:#fff;font-size:0.65rem;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:6px">$${prizeAmt}</span>`;
      }

      // Incomplete data indicator
      let incompleteTag = '';
      if (player.hasSheet === false) {
        incompleteTag = `<span style="display:inline-block;background:rgba(243,156,18,0.2);color:#F39C12;font-size:0.6rem;font-weight:600;padding:2px 5px;border-radius:8px;margin-left:4px" title="S16/E8 picks unavailable">R1+R2 only</span>`;
      }

      tr.innerHTML = `
        <td class="col-rank">
          <span class="rank-badge ${rankClass}">${player.rank}</span>
        </td>
        <td class="col-player">
          <div class="player-cell">
            <div class="player-avatar" style="background:${avatarColor}">${escapeHtml(player.avatar)}</div>
            <div>
              <span class="player-name">${escapeHtml(player.name)}</span>${prizeTag}${incompleteTag}
            </div>
          </div>
        </td>
        <td class="col-total">
          <span class="total-score">${player.totalPoints}</span>
        </td>
        ${roundCells}
        <td class="col-champion">
          <div class="champion-cell ${player.championAlive ? 'champion-alive' : 'champion-eliminated'}">
            <span class="alive-dot ${player.championAlive ? 'alive' : 'dead'}"></span>
            ${escapeHtml(player.champion)}
          </div>
        </td>
        <td class="col-max">
          <span class="max-possible">${player.maxPossible}</span>
        </td>
        <td class="col-bar">
          <div class="score-bar-wrapper">
            <div class="score-bar">
              <div class="score-bar-fill ${tier}" style="width:${pct}%"></div>
            </div>
            <span class="score-bar-pct">${pct}%</span>
          </div>
        </td>
      `;

      tr.addEventListener('click', () => openModal(player));
      tbody.appendChild(tr);
    });
  }

  // ---- Filters & Sort ----
  function applyFilters() {
    let list = [...data.participants];

    // Filter
    if (currentFilter === 'alive') {
      list = list.filter(p => p.championAlive);
    } else if (currentFilter === 'eliminated') {
      list = list.filter(p => !p.championAlive);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.champion.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (currentSort) {
      case 'rank':
        list.sort((a, b) => a.rank - b.rank);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'maxPossible':
        list.sort((a, b) => b.maxPossible - a.maxPossible);
        break;
      case 'champion':
        list.sort((a, b) => a.champion.localeCompare(b.champion));
        break;
    }

    filteredParticipants = list;
    renderTable();
  }

  // ---- Modal ----
  function openModal(player) {
    const overlay = document.getElementById('modalOverlay');
    const avatarColor = AVATAR_COLORS[hashCode(player.name) % AVATAR_COLORS.length];

    document.getElementById('modalAvatar').textContent = player.avatar;
    document.getElementById('modalAvatar').style.background = avatarColor;
    document.getElementById('modalName').textContent = player.name;
    document.getElementById('modalRank').textContent =
      `Rank #${player.rank} of ${data.participants.length}`;
    document.getElementById('modalScore').textContent = player.totalPoints;

    // Stats grid
    const statsGrid = document.getElementById('modalStats');
    const totalCorrect = player.roundCorrect.reduce((a, b) => a + b, 0);
    const rs = player.regionScores || {};

    // Prize money for this player
    let prizeMoney = 0;
    if (data.prizes) {
      if (player.rank <= 7) prizeMoney += data.prizes.placement[player.rank - 1].amount;
      if (data.prizes.roundBonuses) data.prizes.roundBonuses.forEach(b => {
        if (b.winners && b.winners.includes(player.name)) prizeMoney += (b.splitAmount || b.amount);
      });
      if (data.prizes.regionBonuses) data.prizes.regionBonuses.forEach(b => {
        if (b.winners && b.winners.includes(player.name)) prizeMoney += (b.splitAmount || b.amount);
      });
      if (data.prizes.roundBoobyPrizes) data.prizes.roundBoobyPrizes.forEach(b => {
        if (b.winners && b.winners.includes(player.name)) prizeMoney += b.amount;
      });
      if (data.prizes.consolationPrizes) data.prizes.consolationPrizes.forEach(b => {
        if (b.winner === player.name) prizeMoney += b.amount;
      });
    }

    statsGrid.innerHTML = `
      <div class="modal-stat">
        <div class="label">Total Points</div>
        <div class="value">${player.totalPoints}</div>
      </div>
      <div class="modal-stat">
        <div class="label">Max Possible</div>
        <div class="value">${player.maxPossible}</div>
      </div>
      <div class="modal-stat">
        <div class="label">Correct Picks</div>
        <div class="value">${totalCorrect}</div>
      </div>
      <div class="modal-stat">
        <div class="label">Champion</div>
        <div class="value" style="color:${player.championAlive ? '#2ECC71' : '#E74C3C'};font-size:1rem">
          ${escapeHtml(player.champion)} ${player.championAlive ? '\u2705' : '\u274C'}
        </div>
      </div>
      <div class="modal-stat">
        <div class="label">Tiebreaker</div>
        <div class="value">${player.tiebreaker}</div>
      </div>
      <div class="modal-stat">
        <div class="label">Winnings</div>
        <div class="value" style="color:${prizeMoney > 0 ? '#2ECC71' : '#ADB5BD'}">${prizeMoney > 0 ? '$' + prizeMoney : '\u2014'}</div>
      </div>
      <div class="modal-stat">
        <div class="label">East Region</div>
        <div class="value">${rs.East || 0}</div>
      </div>
      <div class="modal-stat">
        <div class="label">West Region</div>
        <div class="value">${rs.West || 0}</div>
      </div>
      <div class="modal-stat">
        <div class="label">South Region</div>
        <div class="value">${rs.South || 0}</div>
      </div>
      <div class="modal-stat">
        <div class="label">Midwest Region</div>
        <div class="value">${rs.Midwest || 0}</div>
      </div>
    `;

    // Round chart
    const chartContainer = document.getElementById('modalRoundChart');
    chartContainer.innerHTML = '';
    const roundNames = ['R64', 'R32', 'S16', 'E8', 'F4', 'NCG'];
    const maxRoundScore = [32, 32, 32, 32, 20, 12];
    const barColors = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#FF6B35'];

    player.roundScores.forEach((score, i) => {
      const maxS = maxRoundScore[i];
      const heightPct = maxS > 0 ? (score / maxS) * 100 : 0;
      const group = document.createElement('div');
      group.className = 'modal-round-bar-group';
      group.innerHTML = `
        <div class="modal-round-value">${score}</div>
        <div class="modal-round-bar" style="height:${Math.max(heightPct, 3)}%;background:${barColors[i]}"></div>
        <div class="modal-round-label">${roundNames[i]}</div>
      `;
      chartContainer.appendChild(group);
    });

    overlay.classList.add('active');
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  }

  // ---- Bind Events ----
  function bindEvents() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      applyFilters();
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    // Sort
    document.getElementById('sortSelect').addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
    });

    document.querySelectorAll('.view-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeView = btn.dataset.view;
        renderViewTabs();
        syncViewState();
      });
    });

    document.getElementById('compareSearchInput').addEventListener('input', (e) => {
      compareSearchQuery = e.target.value.trim();
      renderComparisonView();
    });

    document.getElementById('compareSelect').addEventListener('change', (e) => {
      selectedComparisonName = e.target.value;
      renderComparisonView();
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ---- Helpers ----
  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
