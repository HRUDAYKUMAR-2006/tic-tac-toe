import { game } from './game.js';
import { auth } from './auth.js';
import { ui } from './ui.js';
import { sound } from './audio.js';
import { multiplayer } from './multiplayer.js';
import { StorageManager } from './storage.js';

let pendingShareAction = false;

document.addEventListener('DOMContentLoaded', () => {
  ui.init();
  setupEventListeners();
  setupGameEngine();
  setupMultiplayer();
  checkUrlRoomHash();
});

function setupEventListeners() {
  // --- Board Cell Clicks ---
  const cells = document.querySelectorAll('.board-cell');
  cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
      const idx = parseInt(cell.getAttribute('data-index'), 10);
      game.handleCellClick(idx);
    });

    // Hover phantom preview
    cell.addEventListener('mouseenter', () => {
      if (game.isGameOver || game.board[parseInt(cell.getAttribute('data-index'), 10)] !== null) return;
      if (game.mode === 'online' && game.currentTurn !== game.myOnlineSymbol) return;
      cell.setAttribute('data-hover-symbol', game.currentTurn);
    });

    cell.addEventListener('mouseleave', () => {
      cell.removeAttribute('data-hover-symbol');
    });
  });

  // --- Controls & In-Game Actions ---
  document.getElementById('restartBtn')?.addEventListener('click', () => {
    sound.playClick();
    if (game.mode === 'online' && multiplayer.isConnected) {
      multiplayer.requestRematch();
      ui.showToast('Rematch request sent to opponent!', 'info');
    } else {
      game.resetBoard();
      ui.showToast('Board reset. New game started!', 'info');
    }
  });

  document.getElementById('resetScoresBtn')?.addEventListener('click', () => {
    sound.playClick();
    game.resetScores();
    ui.showToast('Scores reset to 0.', 'info');
  });

  // --- Sound Toggle ---
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    const updateSoundIcon = () => {
      soundBtn.textContent = sound.isMuted() ? '🔇' : '🔊';
      soundBtn.setAttribute('title', sound.isMuted() ? 'Unmute Audio' : 'Mute Audio');
    };
    updateSoundIcon();
    soundBtn.addEventListener('click', () => {
      sound.toggleMute();
      updateSoundIcon();
      if (!sound.isMuted()) sound.playClick();
    });
  }

  // --- Mode Selection Pills ---
  const modeButtons = document.querySelectorAll('.mode-btn');
  const aiDifficultySelector = document.getElementById('aiDifficultySelector');

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedMode = btn.getAttribute('data-mode');
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sound.playClick();

      if (selectedMode === 'ai') {
        if (aiDifficultySelector) aiDifficultySelector.classList.remove('hidden');
        const diff = document.getElementById('aiDifficulty')?.value || 'master';
        game.setMode('ai', diff);
      } else if (selectedMode === 'offline') {
        if (aiDifficultySelector) aiDifficultySelector.classList.add('hidden');
        game.setMode('offline');
      } else if (selectedMode === 'online') {
        if (aiDifficultySelector) aiDifficultySelector.classList.add('hidden');
        game.setMode('online');
        ui.openModal('onlineModal');
      }
    });
  });

  document.getElementById('aiDifficulty')?.addEventListener('change', (e) => {
    const diff = e.target.value;
    game.setMode('ai', diff);
    sound.playClick();
    ui.showToast(`AI difficulty set to ${diff.toUpperCase()}`, 'info');
  });

  // --- Critical Requirement: Sharing Action & Auth Gate ---
  const triggerShareFlow = () => {
    sound.playClick();
    if (!auth.isLoggedIn()) {
      pendingShareAction = true;
      ui.openModal('authModal');
      ui.showToast('Log in or create an account to share your achievements!', 'warning');
    } else {
      ui.renderShareHub();
      ui.openModal('shareModal');
    }
  };

  document.getElementById('shareHeaderBtn')?.addEventListener('click', triggerShareFlow);
  document.getElementById('gameShareBtn')?.addEventListener('click', triggerShareFlow);
  document.getElementById('modalWinShareBtn')?.addEventListener('click', triggerShareFlow);

  // --- Streak & Wins Header Click to View Details ---
  document.getElementById('streakBadge')?.addEventListener('click', () => {
    sound.playClick();
    ui.renderStreakDetails();
    ui.openModal('streakModal');
  });

  document.getElementById('winsBadge')?.addEventListener('click', () => {
    sound.playClick();
    ui.renderStatsModal();
    ui.openModal('statsModal');
  });

  document.getElementById('historyBtn')?.addEventListener('click', () => {
    sound.playClick();
    ui.renderMatchHistory('all');
    ui.openModal('historyModal');
  });

  document.getElementById('profileBtn')?.addEventListener('click', () => {
    sound.playClick();
    if (auth.isLoggedIn()) {
      ui.openModal('profileModal');
      renderProfileDetails();
    } else {
      pendingShareAction = false;
      ui.openModal('authModal');
    }
  });

  // --- Modal Close Handlers ---
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      ui.closeModal(modalId);
    });
  });

  // Close modals clicking on backdrop
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        ui.closeModal(modal.id);
      }
    });
  });

  // --- Auth Tabs (Login vs Register) ---
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (target === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
      }
      sound.playClick();
    });
  });

  // Avatar picker in register form
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const input = document.getElementById('registerAvatar');
      if (input) input.value = opt.getAttribute('data-avatar');
      sound.playClick();
    });
  });

  // Login Form Submission
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier')?.value;
    const pass = document.getElementById('loginPassword')?.value;

    const res = auth.login(identifier, pass);
    if (res.success) {
      ui.showToast(`Welcome back, ${res.user.name}!`, 'success');
      ui.closeModal('authModal');
      ui.renderUserBadge();

      if (pendingShareAction) {
        pendingShareAction = false;
        setTimeout(() => {
          ui.renderShareHub();
          ui.openModal('shareModal');
        }, 200);
      }
    } else {
      ui.showToast(res.message, 'error');
    }
  });

  // Register Form Submission
  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName')?.value;
    const username = document.getElementById('registerUsername')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const pass = document.getElementById('registerPassword')?.value;
    const avatar = document.getElementById('registerAvatar')?.value || '🎮';

    const res = auth.register({ name, username, email, password: pass, avatar });
    if (res.success) {
      ui.showToast(`Account created! Welcome, ${res.user.name}!`, 'success');
      ui.closeModal('authModal');
      ui.renderUserBadge();

      if (pendingShareAction) {
        pendingShareAction = false;
        setTimeout(() => {
          ui.renderShareHub();
          ui.openModal('shareModal');
        }, 200);
      }
    } else {
      ui.showToast(res.message, 'error');
    }
  });

  // Guest Continue button in Auth modal
  document.getElementById('guestContinueBtn')?.addEventListener('click', () => {
    ui.closeModal('authModal');
    ui.showToast('Continuing as Guest. You can play without limits!', 'info');
  });

  // Profile Modal Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    auth.logout();
    ui.closeModal('profileModal');
    ui.renderUserBadge();
    ui.showToast('Logged out successfully.', 'info');
  });

  // --- Match History Filter Pills & Clear ---
  document.querySelectorAll('.history-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.history-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      ui.renderMatchHistory(filter);
      sound.playClick();
    });
  });

  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your match history?')) {
      StorageManager.clearHistory();
      ui.renderMatchHistory('all');
      ui.showToast('Match history cleared.', 'info');
    }
  });

  // Delegated click for "Watch Replay" on match items
  document.getElementById('historyList')?.addEventListener('click', (e) => {
    const replayBtn = e.target.closest('.btn-replay');
    if (replayBtn) {
      const matchId = replayBtn.getAttribute('data-match-id');
      ui.startReplay(matchId);
    }
  });

  // --- Replay Controls ---
  document.getElementById('replayPlayBtn')?.addEventListener('click', () => {
    if (ui.isReplayPlaying) {
      ui.pauseReplay();
    } else {
      ui.playReplay();
    }
  });

  document.getElementById('replayPrevBtn')?.addEventListener('click', () => {
    ui.stepReplayBackward();
  });

  document.getElementById('replayNextBtn')?.addEventListener('click', () => {
    ui.stepReplayForward();
  });

  // --- Share Hub Interactions ---
  document.getElementById('copyShareUrlBtn')?.addEventListener('click', () => {
    const input = document.getElementById('shareUrlInput');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        ui.showToast('Link copied to clipboard!', 'success');
      }).catch(() => {
        ui.showToast('Could not copy link.', 'error');
      });
    }
  });

  document.getElementById('webShareNativeBtn')?.addEventListener('click', () => {
    const user = auth.getCurrentUser();
    const streak = StorageManager.getStreakData();
    const shareData = {
      title: 'Nexus Tic Tac Toe Challenge',
      text: `Can you beat my ${streak.currentStreak}-day streak on Nexus Tic Tac Toe? Play now!`,
      url: window.location.href.split('#')[0]
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.url);
      ui.showToast('Web Share not supported on this browser. Link copied!', 'info');
    }
  });

  document.getElementById('shareWhatsAppBtn')?.addEventListener('click', () => {
    const streak = StorageManager.getStreakData();
    const text = encodeURIComponent(`Can you beat my ${streak.currentStreak}-day streak on Nexus Tic Tac Toe? Play with me here: ${window.location.href.split('#')[0]}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  });

  document.getElementById('shareTwitterBtn')?.addEventListener('click', () => {
    const streak = StorageManager.getStreakData();
    const text = encodeURIComponent(`Checking out Nexus Tic Tac Toe! Currently on a ${streak.currentStreak}-day streak 🔥 Play with me:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href.split('#')[0])}`, '_blank');
  });

  // --- Online Multiplayer Modal Controls ---
  const onlineTabs = document.querySelectorAll('.online-tab');
  const hostTabContent = document.getElementById('onlineHostContent');
  const joinTabContent = document.getElementById('onlineJoinContent');

  onlineTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      onlineTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (target === 'host') {
        hostTabContent.classList.remove('hidden');
        joinTabContent.classList.add('hidden');
      } else {
        hostTabContent.classList.add('hidden');
        joinTabContent.classList.remove('hidden');
      }
      sound.playClick();
    });
  });

  // Host Room Button
  document.getElementById('createRoomBtn')?.addEventListener('click', async () => {
    sound.playClick();
    const user = auth.getCurrentUser();
    const hostName = user ? user.name : 'Host Player';
    const avatar = user ? user.avatar : '👑';

    const btn = document.getElementById('createRoomBtn');
    btn.disabled = true;
    btn.textContent = 'Generating Room...';

    const roomCode = await multiplayer.hostRoom(hostName, avatar);
    btn.disabled = false;
    btn.textContent = 'Host New Room';

    document.getElementById('roomCodeDisplay').textContent = roomCode;
    const joinLink = `${window.location.origin}${window.location.pathname}#room=${roomCode}`;
    document.getElementById('roomLinkInput').value = joinLink;
    document.getElementById('roomCreatedSection').classList.remove('hidden');

    ui.showToast(`Room created: ${roomCode}! Share with your friend.`, 'success');
  });

  // Copy Room Link Button
  document.getElementById('copyRoomLinkBtn')?.addEventListener('click', () => {
    const input = document.getElementById('roomLinkInput');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        ui.showToast('Room link copied to clipboard!', 'success');
      });
    }
  });

  // Join Room Button
  document.getElementById('joinRoomBtn')?.addEventListener('click', async () => {
    const code = document.getElementById('joinRoomCodeInput')?.value;
    if (!code || code.trim().length < 4) {
      ui.showToast('Please enter a valid 6-character room code.', 'warning');
      return;
    }

    sound.playClick();
    const user = auth.getCurrentUser();
    const guestName = user ? user.name : 'Challenger';
    const avatar = user ? user.avatar : '⚡';

    const btn = document.getElementById('joinRoomBtn');
    btn.disabled = true;
    btn.textContent = 'Connecting...';

    await multiplayer.joinRoom(code, guestName, avatar);
    btn.disabled = false;
    btn.textContent = 'Join Room';

    ui.showToast(`Connecting to room ${code.toUpperCase()}...`, 'info');
  });
}

function setupGameEngine() {
  // Sync UI when move occurs
  game.on('moveExecuted', ({ cell, symbol }) => {
    const cellEl = document.querySelector(`.board-cell[data-index="${cell}"]`);
    if (cellEl) {
      cellEl.innerHTML = symbol === 'X' ? ui.getXSVG() : ui.getOSVG();
      cellEl.classList.add('filled', `filled-${symbol.toLowerCase()}`);
    }
  });

  // Turn changed
  game.on('turnChanged', (turn) => {
    updateTurnUI(turn);
  });

  // Board reset
  game.on('boardReset', () => {
    document.querySelectorAll('.board-cell').forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('filled', 'filled-x', 'filled-o', 'win-cell');
      cell.removeAttribute('data-hover-symbol');
    });
    ui.clearWinningLine();
    updateTurnUI(game.currentTurn);
    hideGameOverBanner();
  });

  // Game over
  game.on('gameOver', ({ winner, winningLine, winningType, scores }) => {
    updateScoresUI(scores);

    if (winner !== 'draw') {
      ui.triggerConfetti();
      if (winningType) ui.renderWinningLine(winningType);

      if (winningLine) {
        winningLine.forEach(idx => {
          document.querySelector(`.board-cell[data-index="${idx}"]`)?.classList.add('win-cell');
        });
      }
    }

    showGameOverBanner(winner);
  });

  // AI Thinking states
  game.on('aiThinkingStart', () => {
    const banner = document.getElementById('turnBanner');
    if (banner) {
      banner.innerHTML = `<span class="thinking-spinner"></span> AI is calculating optimal move...`;
      banner.classList.add('thinking');
    }
  });

  game.on('aiThinkingEnd', () => {
    const banner = document.getElementById('turnBanner');
    if (banner) {
      banner.classList.remove('thinking');
    }
  });

  // Online move broadcast
  game.on('onlineMoveBroadcast', ({ cell, symbol }) => {
    multiplayer.sendMove(cell, symbol);
  });

  // Match finalized: update streak & wins widgets
  game.on('matchFinalized', ({ streak, stats }) => {
    ui.renderStreakWidget();
    ui.renderWinsWidget();
    if (streak.isNewMilestone) {
      sound.playStreak();
      ui.showToast(`🔥 Fantastic! You reached a new record: ${streak.streak} Day Streak!`, 'success', 4000);
    }
  });

  // Initial render
  updateTurnUI(game.currentTurn);
  updateScoresUI(game.scores);
}

function setupMultiplayer() {
  multiplayer.on('connected', ({ opponentName, opponentAvatar, mySymbol }) => {
    game.myOnlineSymbol = mySymbol;
    game.playerXName = mySymbol === 'X' ? (auth.getCurrentUser()?.name || 'You (Host)') : opponentName;
    game.playerOName = mySymbol === 'O' ? (auth.getCurrentUser()?.name || 'You (Challenger)') : opponentName;

    document.getElementById('playerXLabel').textContent = game.playerXName;
    document.getElementById('playerOLabel').textContent = game.playerOName;

    ui.closeModal('onlineModal');
    ui.showToast(`Connected with ${opponentName}! Game on!`, 'success');

    game.resetBoard();
    updateTurnUI(game.currentTurn);
  });

  multiplayer.on('move', ({ cell, symbol }) => {
    game.handleRemoteMove(cell, symbol);
  });

  multiplayer.on('rematchRequested', () => {
    const accept = confirm(`${multiplayer.opponentName} wants a rematch! Accept?`);
    if (accept) {
      multiplayer.acceptRematch();
      game.resetBoard();
      ui.showToast('Rematch accepted!', 'info');
    }
  });

  multiplayer.on('rematchAccepted', () => {
    game.resetBoard();
    ui.showToast('Opponent accepted the rematch!', 'success');
  });

  multiplayer.on('opponentLeft', () => {
    ui.showToast('Opponent left the room.', 'warning');
  });
}

function updateTurnUI(turn) {
  const cardX = document.getElementById('playerCardX');
  const cardO = document.getElementById('playerCardO');
  const banner = document.getElementById('turnBanner');

  if (turn === 'X') {
    cardX?.classList.add('active-turn');
    cardO?.classList.remove('active-turn');
  } else {
    cardO?.classList.add('active-turn');
    cardX?.classList.remove('active-turn');
  }

  if (banner && !game.isGameOver) {
    const isOnlineTurn = game.mode === 'online' 
      ? (turn === game.myOnlineSymbol ? 'Your Turn' : `${multiplayer.opponentName}'s Turn`)
      : null;

    const name = isOnlineTurn || (turn === 'X' ? game.playerXName : game.playerOName);
    banner.innerHTML = `<span class="turn-symbol-badge turn-${turn.toLowerCase()}">${turn}</span> <strong>${name}</strong>'s Turn`;
  }
}

function updateScoresUI(scores) {
  document.getElementById('scoreX').textContent = scores.X;
  document.getElementById('scoreO').textContent = scores.O;
  document.getElementById('scoreDraw').textContent = scores.draws;
}

function showGameOverBanner(winner) {
  const overlay = document.getElementById('gameOverBanner');
  const title = document.getElementById('gameOverTitle');
  const subtitle = document.getElementById('gameOverSubtitle');
  if (!overlay) return;

  if (winner === 'draw') {
    title.innerHTML = `🤝 It's a Draw!`;
    subtitle.textContent = `A fiercely contested tie. Nobody gave an inch!`;
  } else {
    const winnerName = winner === 'X' ? game.playerXName : game.playerOName;
    title.innerHTML = `🎉 ${winnerName} Wins!`;
    subtitle.textContent = `Brilliant victory by ${winner}!`;
  }

  overlay.classList.remove('hidden');
}

function hideGameOverBanner() {
  document.getElementById('gameOverBanner')?.classList.add('hidden');
}

function renderProfileDetails() {
  const user = auth.getCurrentUser();
  if (!user) return;
  const stats = StorageManager.getStats();
  const streak = StorageManager.getStreakData();

  document.getElementById('profileAvatarDisplay').textContent = user.avatar || '⚡';
  document.getElementById('profileNameDisplay').textContent = user.name;
  document.getElementById('profileUsernameDisplay').textContent = `@${user.username}`;
  document.getElementById('profileEmailDisplay').textContent = user.email;
  document.getElementById('profileJoinedDisplay').textContent = `Member since ${user.joinedAt || 'Recently'}`;

  document.getElementById('profileStatsSummary').innerHTML = `
    <div class="stat-box"><strong>${streak.currentStreak}</strong><span>Streak 🔥</span></div>
    <div class="stat-box"><strong>${stats.wins}</strong><span>Wins 🏆</span></div>
    <div class="stat-box"><strong>${stats.totalGames}</strong><span>Games 🎮</span></div>
  `;
}

function checkUrlRoomHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#room=')) {
    const roomCode = hash.replace('#room=', '').toUpperCase();
    if (roomCode) {
      const modeBtn = document.querySelector('.mode-btn[data-mode="online"]');
      if (modeBtn) modeBtn.click();
      const codeInput = document.getElementById('joinRoomCodeInput');
      if (codeInput) codeInput.value = roomCode;
      const joinTab = document.querySelector('.online-tab[data-tab="join"]');
      if (joinTab) joinTab.click();
    }
  }
}
