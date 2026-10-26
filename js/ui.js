import { auth } from './auth.js';
import { StorageManager } from './storage.js';
import { sound } from './audio.js';

export class UIManager {
  constructor() {
    this.confettiCanvas = null;
    this.confettiCtx = null;
    this.particles = [];
    this.confettiAnimId = null;
    this.replayInterval = null;
    this.currentReplayMatch = null;
    this.replayStep = 0;
    this.isReplayPlaying = false;
  }

  init() {
    this.setupConfetti();
    this.renderStreakWidget();
    this.renderWinsWidget();
    this.renderUserBadge();
  }

  // --- SVG Icons & Symbols ---
  getXSVG() {
    return `
      <svg class="symbol-svg symbol-x" viewBox="0 0 100 100">
        <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="14" stroke-linecap="round" />
        <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" stroke-width="14" stroke-linecap="round" />
      </svg>
    `;
  }

  getOSVG() {
    return `
      <svg class="symbol-svg symbol-o" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="32" stroke="currentColor" stroke-width="14" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  // --- Header Widgets ---
  renderStreakWidget() {
    const streakEl = document.getElementById('streakBadge');
    if (!streakEl) return;
    const data = StorageManager.getStreakData();
    streakEl.innerHTML = `
      <span class="badge-icon">🔥</span>
      <span class="badge-text"><strong>${data.currentStreak}</strong> Day Streak</span>
    `;
  }

  renderWinsWidget() {
    const winsEl = document.getElementById('winsBadge');
    if (!winsEl) return;
    const stats = StorageManager.getStats();
    winsEl.innerHTML = `
      <span class="badge-icon">🏆</span>
      <span class="badge-text"><strong>${stats.wins}</strong> Wins</span>
    `;
  }

  renderUserBadge() {
    const userBtn = document.getElementById('profileBtn');
    if (!userBtn) return;
    const user = auth.getCurrentUser();
    if (user) {
      userBtn.innerHTML = `
        <span class="avatar-icon">${user.avatar || '⚡'}</span>
        <span class="user-name">${user.name}</span>
      `;
      userBtn.classList.add('logged-in');
    } else {
      userBtn.innerHTML = `
        <span class="avatar-icon">👤</span>
        <span class="user-name">Guest</span>
      `;
      userBtn.classList.remove('logged-in');
    }
  }

  // --- Toast Notifications ---
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;

    container.appendChild(toast);
    sound.playClick();

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- Modal Helpers ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      if (!document.querySelector('.modal.active')) {
        document.body.classList.remove('modal-open');
      }
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    document.body.classList.remove('modal-open');
  }

  // --- Confetti Animation ---
  setupConfetti() {
    this.confettiCanvas = document.getElementById('confettiCanvas');
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext('2d');
    this.resizeConfetti();
    window.addEventListener('resize', () => this.resizeConfetti());
  }

  resizeConfetti() {
    if (!this.confettiCanvas) return;
    this.confettiCanvas.width = window.innerWidth;
    this.confettiCanvas.height = window.innerHeight;
  }

  triggerConfetti() {
    if (!this.confettiCanvas || !this.confettiCtx) return;
    this.particles = [];
    const colors = ['#00f5d4', '#ff007f', '#ffd166', '#00bbf9', '#9b5de5', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    if (this.confettiAnimId) cancelAnimationFrame(this.confettiAnimId);
    this.animateConfetti();
  }

  animateConfetti() {
    if (!this.confettiCtx) return;
    this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    let activeParticles = 0;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // Gravity
      p.vx *= 0.98; // Air drag
      p.rot += p.rotSpeed;
      p.alpha -= 0.012;

      if (p.alpha > 0 && p.y < window.innerHeight) {
        activeParticles++;
        this.confettiCtx.save();
        this.confettiCtx.globalAlpha = Math.max(0, p.alpha);
        this.confettiCtx.translate(p.x, p.y);
        this.confettiCtx.rotate((p.rot * Math.PI) / 180);
        this.confettiCtx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else {
          this.confettiCtx.beginPath();
          this.confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.confettiCtx.fill();
        }
        this.confettiCtx.restore();
      }
    }

    if (activeParticles > 0) {
      this.confettiAnimId = requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
      this.confettiAnimId = null;
    }
  }

  // --- Winning Line Overlay Calculation ---
  renderWinningLine(winningType) {
    const lineSvg = document.getElementById('winningLineSvg');
    if (!lineSvg) return;

    lineSvg.classList.remove('hidden');
    lineSvg.innerHTML = '';

    const coords = {
      'row-0': { x1: 5, y1: 16.66, x2: 95, y2: 16.66 },
      'row-1': { x1: 5, y1: 50, x2: 95, y2: 50 },
      'row-2': { x1: 5, y1: 83.33, x2: 95, y2: 83.33 },
      'col-0': { x1: 16.66, y1: 5, x2: 16.66, y2: 95 },
      'col-1': { x1: 50, y1: 5, x2: 50, y2: 95 },
      'col-2': { x1: 83.33, y1: 5, x2: 83.33, y2: 95 },
      'diag-0': { x1: 8, y1: 8, x2: 92, y2: 92 },
      'diag-1': { x1: 92, y1: 8, x2: 8, y2: 92 }
    };

    const target = coords[winningType];
    if (!target) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${target.x1}%`);
    line.setAttribute('y1', `${target.y1}%`);
    line.setAttribute('x2', `${target.x2}%`);
    line.setAttribute('y2', `${target.y2}%`);
    line.setAttribute('class', 'winning-strike');

    lineSvg.appendChild(line);
  }

  clearWinningLine() {
    const lineSvg = document.getElementById('winningLineSvg');
    if (lineSvg) {
      lineSvg.classList.add('hidden');
      lineSvg.innerHTML = '';
    }
  }

  // --- Match History Rendering ---
  renderMatchHistory(filter = 'all') {
    const listEl = document.getElementById('historyList');
    if (!listEl) return;

    let history = StorageManager.getHistory();
    if (filter !== 'all') {
      history = history.filter(item => item.mode === filter);
    }

    if (history.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h4>No Matches Recorded Yet</h4>
          <p>Play games in AI, Offline, or Online mode to see match statistics and view instant move replays!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = history.map(item => {
      const isDraw = item.winner === 'draw';
      const winnerName = isDraw 
        ? 'Draw' 
        : item.winner === 'X' 
          ? item.playerXName 
          : item.playerOName;
      const winnerColor = isDraw ? 'draw' : item.winner.toLowerCase();
      const modeLabel = item.mode === 'ai' ? `vs AI (${item.difficulty || 'Master'})` : item.mode === 'offline' ? 'Offline 2P' : 'Online Friend';

      return `
        <div class="history-item" data-id="${item.id}">
          <div class="history-main">
            <div class="history-header">
              <span class="mode-tag mode-${item.mode}">${modeLabel}</span>
              <span class="history-time">${item.dateStr}</span>
            </div>
            <div class="history-matchup">
              <span class="player-x"><span class="badge-mini x">X</span> ${item.playerXName}</span>
              <span class="vs-text">vs</span>
              <span class="player-o"><span class="badge-mini o">O</span> ${item.playerOName}</span>
            </div>
            <div class="history-details">
              <span class="outcome-pill outcome-${winnerColor}">
                ${isDraw ? '🤝 Draw' : `🏆 Winner: ${winnerName}`}
              </span>
              <span class="moves-count">${item.moves.length} moves • ${item.durationSeconds}s</span>
            </div>
          </div>
          <div class="history-actions">
            <button class="btn btn-sm btn-replay" data-match-id="${item.id}" title="Watch visual replay">
              ▶ Replay
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Interactive Move-by-Move Replay Engine ---
  startReplay(matchId) {
    const history = StorageManager.getHistory();
    const match = history.find(m => m.id === matchId);
    if (!match) return;

    this.currentReplayMatch = match;
    this.replayStep = 0;
    this.isReplayPlaying = false;
    clearInterval(this.replayInterval);

    // Populate Replay Modal Info
    document.getElementById('replayTitle').textContent = `Match Replay: ${match.playerXName} vs ${match.playerOName}`;
    document.getElementById('replayInfo').textContent = `${match.dateStr} • ${match.mode.toUpperCase()} • Result: ${match.winner === 'draw' ? 'Draw' : match.winner + ' Won'}`;
    
    this.renderReplayBoard();
    this.openModal('replayModal');
    this.playReplay();
  }

  renderReplayBoard() {
    const boardEl = document.getElementById('replayBoard');
    const stepLabel = document.getElementById('replayStepLabel');
    if (!boardEl || !this.currentReplayMatch) return;

    const moves = this.currentReplayMatch.moves;
    const currentMoves = moves.slice(0, this.replayStep);
    
    // Build board representation up to current step
    const boardState = Array(9).fill(null);
    currentMoves.forEach(m => {
      boardState[m.cell] = m.symbol;
    });

    stepLabel.textContent = `Move ${this.replayStep} of ${moves.length}`;

    boardEl.innerHTML = boardState.map((val, idx) => {
      const isLastMove = currentMoves.length > 0 && currentMoves[currentMoves.length - 1].cell === idx;
      let content = '';
      if (val === 'X') content = this.getXSVG();
      else if (val === 'O') content = this.getOSVG();

      return `
        <div class="replay-cell ${val ? 'filled' : ''} ${isLastMove ? 'last-move' : ''}" data-index="${idx}">
          ${content}
        </div>
      `;
    }).join('');

    // Toggle Play/Pause icon
    const playBtn = document.getElementById('replayPlayBtn');
    if (playBtn) {
      playBtn.textContent = this.isReplayPlaying ? '⏸ Pause' : '▶ Play';
    }
  }

  playReplay() {
    if (!this.currentReplayMatch) return;
    this.isReplayPlaying = true;
    clearInterval(this.replayInterval);

    if (this.replayStep >= this.currentReplayMatch.moves.length) {
      this.replayStep = 0;
    }

    this.renderReplayBoard();

    this.replayInterval = setInterval(() => {
      if (this.replayStep < this.currentReplayMatch.moves.length) {
        this.replayStep++;
        sound.playClick();
        this.renderReplayBoard();
      } else {
        this.pauseReplay();
      }
    }, 750);
  }

  pauseReplay() {
    this.isReplayPlaying = false;
    clearInterval(this.replayInterval);
    const playBtn = document.getElementById('replayPlayBtn');
    if (playBtn) playBtn.textContent = '▶ Play';
  }

  stepReplayForward() {
    this.pauseReplay();
    if (this.currentReplayMatch && this.replayStep < this.currentReplayMatch.moves.length) {
      this.replayStep++;
      sound.playClick();
      this.renderReplayBoard();
    }
  }

  stepReplayBackward() {
    this.pauseReplay();
    if (this.currentReplayMatch && this.replayStep > 0) {
      this.replayStep--;
      sound.playClick();
      this.renderReplayBoard();
    }
  }

  // --- Daily Streak & Calendar Modal Details ---
  renderStreakDetails() {
    const streakData = StorageManager.getStreakData();
    const stats = StorageManager.getStats();

    document.getElementById('streakModalCount').textContent = streakData.currentStreak;
    document.getElementById('streakModalBest').textContent = streakData.bestStreak || streakData.currentStreak;
    document.getElementById('streakModalTotal').textContent = stats.totalGames;

    // Render 7-day visual calendar
    const calendarEl = document.getElementById('streakWeekCalendar');
    if (!calendarEl) return;

    calendarEl.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = days[d.getDay()];
      const isPlayed = streakData.historyDays && streakData.historyDays.includes(dateStr);
      const isToday = i === 0;

      const dayCard = document.createElement('div');
      dayCard.className = `streak-day-card ${isPlayed ? 'active' : ''} ${isToday ? 'is-today' : ''}`;
      dayCard.innerHTML = `
        <span class="day-name">${dayName}</span>
        <span class="day-flame">${isPlayed ? '🔥' : '⚪'}</span>
        <span class="day-num">${d.getDate()}</span>
      `;
      calendarEl.appendChild(dayCard);
    }
  }

  // --- Complete Stats Modal Details ---
  renderStatsModal() {
    const stats = StorageManager.getStats();
    const streak = StorageManager.getStreakData();

    document.getElementById('statTotalGames').textContent = stats.totalGames;
    document.getElementById('statWins').textContent = stats.wins;
    document.getElementById('statLosses').textContent = stats.losses;
    document.getElementById('statDraws').textContent = stats.draws;

    const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
    document.getElementById('statWinRate').textContent = `${winRate}%`;
    document.getElementById('statAiWins').textContent = stats.aiWins || 0;
    document.getElementById('statOfflineWins').textContent = stats.offlineWins || 0;
    document.getElementById('statOnlineWins').textContent = stats.onlineWins || 0;
    document.getElementById('statBestStreak').textContent = streak.bestStreak || streak.currentStreak;
  }

  // --- Share Hub Generator ---
  renderShareHub() {
    const user = auth.getCurrentUser();
    if (!user) return;

    const stats = StorageManager.getStats();
    const streak = StorageManager.getStreakData();
    const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

    // Personalized visual share card
    document.getElementById('shareCardAvatar').textContent = user.avatar || '⚡';
    document.getElementById('shareCardName').textContent = user.name;
    document.getElementById('shareCardStreak').textContent = `🔥 ${streak.currentStreak} Day Streak`;
    document.getElementById('shareCardWins').textContent = `🏆 ${stats.wins} Total Wins (${winRate}% Win Rate)`;
    document.getElementById('shareCardGames').textContent = `🎮 ${stats.totalGames} Battles Fought`;

    const shareUrl = window.location.href.split('#')[0];
    const shareInput = document.getElementById('shareUrlInput');
    if (shareInput) shareInput.value = shareUrl;
  }
}

export const ui = new UIManager();
