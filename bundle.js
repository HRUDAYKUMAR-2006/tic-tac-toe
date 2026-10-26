(() => {
  'use strict';
  
// --- AUDIO MODULE ---
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('nexus_ttt_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('nexus_ttt_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playMove(symbol) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = symbol === 'X' ? 'triangle' : 'sine';
    const startFreq = symbol === 'X' ? 440 : 587.33;
    const endFreq = symbol === 'X' ? 660 : 880;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  playDraw() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 392, 349.23];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playStreak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.09;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }
}
const sound = new SoundFX();

  
// --- STORAGE MODULE ---
const KEYS = {
  MATCH_HISTORY: 'nexus_ttt_history_v2',
  STATS: 'nexus_ttt_stats_v2',
  STREAK: 'nexus_ttt_streak_v2',
  USERS: 'nexus_ttt_registered_users_v2',
  CURRENT_USER: 'nexus_ttt_current_user_v2'
};

class StorageManager {
  static getStreakData() {
    const raw = localStorage.getItem(KEYS.STREAK);
    if (!raw) {
      return {
        currentStreak: 1,
        bestStreak: 1,
        lastPlayedDate: new Date().toISOString().slice(0, 10),
        historyDays: [new Date().toISOString().slice(0, 10)]
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        currentStreak: 1,
        bestStreak: 1,
        lastPlayedDate: new Date().toISOString().slice(0, 10),
        historyDays: [new Date().toISOString().slice(0, 10)]
      };
    }
  }

  static recordDailyPlay() {
    const data = this.getStreakData();
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = data.lastPlayedDate;

    if (lastDate === today) {
      if (!data.historyDays.includes(today)) {
        data.historyDays.push(today);
      }
      localStorage.setItem(KEYS.STREAK, JSON.stringify(data));
      return { streak: data.currentStreak, isNewMilestone: false, streakData: data };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let isNewMilestone = false;
    if (lastDate === yesterday) {
      data.currentStreak += 1;
      if (data.currentStreak > (data.bestStreak || 1)) {
        data.bestStreak = data.currentStreak;
        isNewMilestone = true;
      }
    } else {
      data.currentStreak = 1;
    }

    data.lastPlayedDate = today;
    if (!data.historyDays) data.historyDays = [];
    if (!data.historyDays.includes(today)) {
      data.historyDays.push(today);
    }
    if (data.historyDays.length > 30) {
      data.historyDays = data.historyDays.slice(-30);
    }

    localStorage.setItem(KEYS.STREAK, JSON.stringify(data));
    return { streak: data.currentStreak, isNewMilestone, streakData: data };
  }

  static getStats() {
    const raw = localStorage.getItem(KEYS.STATS);
    const defaults = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      aiWins: 0,
      offlineWins: 0,
      onlineWins: 0
    };
    if (!raw) return defaults;
    try {
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return defaults;
    }
  }

  static recordGameResult({ mode, winner, playerSymbol = 'X' }) {
    const stats = this.getStats();
    stats.totalGames += 1;

    if (winner === 'draw') {
      stats.draws += 1;
    } else if (winner === playerSymbol) {
      stats.wins += 1;
      if (mode === 'ai') stats.aiWins += 1;
      else if (mode === 'offline') stats.offlineWins += 1;
      else if (mode === 'online') stats.onlineWins += 1;
    } else {
      stats.losses += 1;
    }

    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    return stats;
  }

  static getHistory() {
    const raw = localStorage.getItem(KEYS.MATCH_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveMatch(match) {
    const history = this.getHistory();
    const entry = {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      mode: match.mode,
      difficulty: match.difficulty || null,
      playerXName: match.playerXName || 'Player X',
      playerOName: match.playerOName || 'Player O',
      winner: match.winner,
      winningLine: match.winningLine || null,
      moves: match.moves || [],
      boardFinal: match.boardFinal || [],
      durationSeconds: match.durationSeconds || 0
    };

    history.unshift(entry);
    if (history.length > 50) history.pop();
    localStorage.setItem(KEYS.MATCH_HISTORY, JSON.stringify(history));
    return entry;
  }

  static clearHistory() {
    localStorage.removeItem(KEYS.MATCH_HISTORY);
  }

  static getUsers() {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveUsers(users) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  static getCurrentUser() {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user) {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }
}

  
// --- AUTH MODULE ---
class AuthManager {
  constructor() {
    this.currentUser = StorageManager.getCurrentUser();
    this.onAuthChangeCallbacks = [];
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  onAuthChange(callback) {
    this.onAuthChangeCallbacks.push(callback);
  }

  notifyAuthChange() {
    this.onAuthChangeCallbacks.forEach(cb => cb(this.currentUser));
  }

  login(identifier, password) {
    const users = StorageManager.getUsers();
    const cleanId = identifier.trim().toLowerCase();

    const user = users.find(u => 
      (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) && 
      u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid username/email or password.' };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar || '⚡',
      joinedAt: user.joinedAt
    };

    this.currentUser = sessionUser;
    StorageManager.setCurrentUser(sessionUser);
    this.notifyAuthChange();
    return { success: true, user: sessionUser };
  }

  register({ name, username, email, password, avatar }) {
    if (!name || !username || !email || !password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const users = StorageManager.getUsers();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Username is already taken.' };
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email is already registered.' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password: password,
      avatar: avatar || '🎮',
      joinedAt: new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    };

    users.push(newUser);
    StorageManager.saveUsers(users);

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      joinedAt: newUser.joinedAt
    };

    this.currentUser = sessionUser;
    StorageManager.setCurrentUser(sessionUser);
    this.notifyAuthChange();
    return { success: true, user: sessionUser };
  }

  logout() {
    this.currentUser = null;
    StorageManager.setCurrentUser(null);
    this.notifyAuthChange();
  }
}
const auth = new AuthManager();

  
// --- AI MODULE ---
const WIN_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

class TicTacToeAI {
  static getBestMove(board, difficulty = 'master', aiSymbol = 'O', humanSymbol = 'X') {
    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (emptyIndices.length === 0) return null;

    if (difficulty === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (difficulty === 'medium') {
      for (const idx of emptyIndices) {
        board[idx] = aiSymbol;
        if (this.checkWin(board, aiSymbol)) {
          board[idx] = null;
          return idx;
        }
        board[idx] = null;
      }

      for (const idx of emptyIndices) {
        board[idx] = humanSymbol;
        if (this.checkWin(board, humanSymbol)) {
          board[idx] = null;
          return idx;
        }
        board[idx] = null;
      }

      if (Math.random() > 0.45) {
        return this.minimaxBestMove(board, aiSymbol, humanSymbol);
      } else {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }

    return this.minimaxBestMove(board, aiSymbol, humanSymbol);
  }

  static minimaxBestMove(board, aiSymbol, humanSymbol) {
    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (board[4] === null && (emptyIndices.length >= 8 || Math.random() < 0.7)) {
      return 4;
    }

    let bestScore = -Infinity;
    let bestMove = emptyIndices[0];

    for (const idx of emptyIndices) {
      board[idx] = aiSymbol;
      const score = this.minimax(board, 0, false, -Infinity, Infinity, aiSymbol, humanSymbol);
      board[idx] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    return bestMove;
  }

  static minimax(board, depth, isMaximizing, alpha, beta, aiSymbol, humanSymbol) {
    if (this.checkWin(board, aiSymbol)) {
      return 10 - depth;
    }
    if (this.checkWin(board, humanSymbol)) {
      return depth - 10;
    }
    if (board.every(cell => cell !== null)) {
      return 0;
    }

    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of emptyIndices) {
        board[idx] = aiSymbol;
        const evaluation = this.minimax(board, depth + 1, false, alpha, beta, aiSymbol, humanSymbol);
        board[idx] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of emptyIndices) {
        board[idx] = humanSymbol;
        const evaluation = this.minimax(board, depth + 1, true, alpha, beta, aiSymbol, humanSymbol);
        board[idx] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  static checkWin(board, symbol) {
    return WIN_COMBINATIONS.some(combo => 
      combo.every(index => board[index] === symbol)
    );
  }
}

  
// --- MULTIPLAYER MODULE ---
class MultiplayerManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.broadcastChannel = null;
    this.roomCode = null;
    this.isHost = false;
    this.mySymbol = 'X';
    this.opponentName = 'Opponent';
    this.opponentAvatar = '👤';
    this.callbacks = {};
    this.isConnected = false;
    this.useBroadcastFallback = false;
  }

  on(event, callback) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(callback);
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  initBroadcastFallback(roomCode) {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('nexus_ttt_room_' + roomCode);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported', err);
      }
    }
  }

  hostRoom(playerName, avatar) {
    return new Promise((resolve) => {
      this.isHost = true;
      this.mySymbol = 'X';
      this.roomCode = this.generateRoomCode();
      const peerId = 'nexus-ttt-' + this.roomCode.toLowerCase();

      this.initBroadcastFallback(this.roomCode);

      if (typeof window.Peer !== 'undefined') {
        try {
          this.peer = new window.Peer(peerId, {
            debug: 0,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
              ]
            }
          });

          this.peer.on('open', () => resolve(this.roomCode));

          this.peer.on('connection', (conn) => {
            this.conn = conn;
            this.setupConnectionHandlers(playerName, avatar);
          });

          this.peer.on('error', (err) => {
            console.warn('PeerJS server error, activating local broadcast fallback:', err);
            this.useBroadcastFallback = true;
            resolve(this.roomCode);
          });
        } catch (e) {
          this.useBroadcastFallback = true;
          resolve(this.roomCode);
        }
      } else {
        this.useBroadcastFallback = true;
        resolve(this.roomCode);
      }

      setTimeout(() => resolve(this.roomCode), 500);
    });
  }

  joinRoom(code, playerName, avatar) {
    return new Promise((resolve) => {
      this.isHost = false;
      this.mySymbol = 'O';
      this.roomCode = code.toUpperCase().trim();
      const targetPeerId = 'nexus-ttt-' + this.roomCode.toLowerCase();

      this.initBroadcastFallback(this.roomCode);

      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'JOIN_REQ',
          name: playerName,
          avatar: avatar
        });
      }

      if (typeof window.Peer !== 'undefined') {
        try {
          const myId = 'nexus-ttt-guest-' + Math.random().toString(36).substring(2, 9);
          this.peer = new window.Peer(myId, {
            debug: 0,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
              ]
            }
          });

          this.peer.on('open', () => {
            const conn = this.peer.connect(targetPeerId);
            this.conn = conn;
            this.setupConnectionHandlers(playerName, avatar);

            conn.on('open', () => {
              this.sendMessage({
                type: 'JOIN_REQ',
                name: playerName,
                avatar: avatar
              });
              resolve(true);
            });
          });

          this.peer.on('error', (err) => {
            console.warn('Peer join failed, relying on BroadcastChannel fallback:', err);
            resolve(true);
          });
        } catch (e) {
          resolve(true);
        }
      } else {
        resolve(true);
      }

      setTimeout(() => resolve(true), 600);
    });
  }

  setupConnectionHandlers(playerName, avatar) {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.isConnected = true;
      if (this.isHost) {
        this.sendMessage({
          type: 'HOST_WELCOME',
          name: playerName,
          avatar: avatar
        });
      }
    });

    this.conn.on('data', (data) => {
      this.handleIncomingMessage(data);
    });

    this.conn.on('close', () => {
      this.isConnected = false;
      this.emit('opponentLeft');
    });

    this.conn.on('error', (err) => {
      console.warn('Connection error:', err);
    });
  }

  handleIncomingMessage(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'JOIN_REQ':
        this.isConnected = true;
        this.opponentName = data.name || 'Friend';
        this.opponentAvatar = data.avatar || '👥';
        if (this.isHost) {
          this.sendMessage({
            type: 'HOST_WELCOME',
            name: this.myProfileName || 'Host',
            avatar: this.myProfileAvatar || '👑'
          });
        }
        this.emit('connected', {
          opponentName: this.opponentName,
          opponentAvatar: this.opponentAvatar,
          mySymbol: this.mySymbol
        });
        break;

      case 'HOST_WELCOME':
        this.isConnected = true;
        this.opponentName = data.name || 'Host';
        this.opponentAvatar = data.avatar || '👑';
        this.emit('connected', {
          opponentName: this.opponentName,
          opponentAvatar: this.opponentAvatar,
          mySymbol: this.mySymbol
        });
        break;

      case 'MOVE':
        this.emit('move', { cell: data.cell, symbol: data.symbol });
        break;

      case 'REMATCH_REQ':
        this.emit('rematchRequested');
        break;

      case 'REMATCH_ACCEPT':
        this.emit('rematchAccepted');
        break;

      case 'LEAVE':
        this.isConnected = false;
        this.emit('opponentLeft');
        break;
    }
  }

  sendMessage(payload) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (e) {
        console.warn('Peer send error:', e);
      }
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {
        console.warn('Broadcast send error:', e);
      }
    }
  }

  sendMove(cell, symbol) {
    this.sendMessage({
      type: 'MOVE',
      cell,
      symbol
    });
  }

  requestRematch() {
    this.sendMessage({ type: 'REMATCH_REQ' });
  }

  acceptRematch() {
    this.sendMessage({ type: 'REMATCH_ACCEPT' });
  }

  disconnect() {
    this.sendMessage({ type: 'LEAVE' });
    if (this.conn) {
      try { this.conn.close(); } catch {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch {}
      this.broadcastChannel = null;
    }
    this.isConnected = false;
    this.roomCode = null;
  }
}
const multiplayer = new MultiplayerManager();

  
// --- GAME ENGINE MODULE ---
const WIN_LINES = [
  { line: [0, 1, 2], type: 'row-0' },
  { line: [3, 4, 5], type: 'row-1' },
  { line: [6, 7, 8], type: 'row-2' },
  { line: [0, 3, 6], type: 'col-0' },
  { line: [1, 4, 7], type: 'col-1' },
  { line: [2, 5, 8], type: 'col-2' },
  { line: [0, 4, 8], type: 'diag-0' },
  { line: [2, 4, 6], type: 'diag-1' }
];

class GameEngine {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    this.winningType = null;
    this.mode = 'ai';
    this.difficulty = 'master';
    this.scores = { X: 0, O: 0, draws: 0 };
    this.moves = [];
    this.startTime = Date.now();
    this.playerXName = 'Player X';
    this.playerOName = 'Nexus AI';
    this.myOnlineSymbol = 'X';
    this.isAIThinking = false;
    this.eventListeners = {};
  }

  on(event, cb) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(cb);
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(cb => cb(data));
    }
  }

  setMode(mode, difficulty = 'master') {
    this.mode = mode;
    this.difficulty = difficulty;
    if (mode === 'ai') {
      this.playerXName = 'You (X)';
      const diffTitle = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      this.playerOName = `AI (${diffTitle})`;
    } else if (mode === 'offline') {
      this.playerXName = 'Player 1 (X)';
      this.playerOName = 'Player 2 (O)';
    } else if (mode === 'online') {
      this.playerXName = 'Player 1 (X)';
      this.playerOName = 'Player 2 (O)';
    }
    this.resetBoard();
    this.emit('modeChanged', { mode, difficulty, playerX: this.playerXName, playerO: this.playerOName });
  }

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    this.winningType = null;
    this.moves = [];
    this.startTime = Date.now();
    this.isAIThinking = false;
    this.emit('boardReset');
  }

  resetScores() {
    this.scores = { X: 0, O: 0, draws: 0 };
    this.emit('scoresUpdated', this.scores);
  }

  handleCellClick(index) {
    if (this.isGameOver || this.isAIThinking) return false;
    if (this.board[index] !== null) return false;

    if (this.mode === 'online' && this.currentTurn !== this.myOnlineSymbol) {
      return false;
    }

    const moveMade = this.executeMove(index, this.currentTurn);
    if (!moveMade) return false;

    if (this.mode === 'online') {
      this.emit('onlineMoveBroadcast', { cell: index, symbol: moveMade.symbol });
    }

    if (!this.isGameOver && this.mode === 'ai' && this.currentTurn === 'O') {
      this.triggerAIMove();
    }

    return true;
  }

  handleRemoteMove(index, symbol) {
    if (this.isGameOver || this.board[index] !== null) return;
    this.executeMove(index, symbol);
  }

  executeMove(index, symbol) {
    this.board[index] = symbol;
    this.moves.push({ cell: index, symbol, timestamp: Date.now() });

    sound.playMove(symbol);
    this.emit('moveExecuted', { cell: index, symbol, board: [...this.board] });

    const winResult = this.checkWinCondition(symbol);

    if (winResult) {
      this.isGameOver = true;
      this.winner = symbol;
      this.winningLine = winResult.line;
      this.winningType = winResult.type;
      this.scores[symbol] += 1;

      sound.playWin();
      this.finalizeGame(symbol);
      this.emit('gameOver', {
        winner: symbol,
        winningLine: winResult.line,
        winningType: winResult.type,
        scores: { ...this.scores }
      });
      return { cell: index, symbol };
    }

    if (this.board.every(cell => cell !== null)) {
      this.isGameOver = true;
      this.winner = 'draw';
      this.scores.draws += 1;

      sound.playDraw();
      this.finalizeGame('draw');
      this.emit('gameOver', {
        winner: 'draw',
        scores: { ...this.scores }
      });
      return { cell: index, symbol };
    }

    this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
    this.emit('turnChanged', this.currentTurn);
    return { cell: index, symbol };
  }

  triggerAIMove() {
    this.isAIThinking = true;
    this.emit('aiThinkingStart');

    const thinkingDelay = Math.floor(Math.random() * 200) + 350;

    setTimeout(() => {
      if (this.isGameOver) {
        this.isAIThinking = false;
        return;
      }

      const bestMove = TicTacToeAI.getBestMove(
        [...this.board],
        this.difficulty,
        'O',
        'X'
      );

      this.isAIThinking = false;
      this.emit('aiThinkingEnd');

      if (bestMove !== null && this.board[bestMove] === null) {
        this.executeMove(bestMove, 'O');
      }
    }, thinkingDelay);
  }

  checkWinCondition(symbol) {
    for (const item of WIN_LINES) {
      const [a, b, c] = item.line;
      if (
        this.board[a] === symbol &&
        this.board[b] === symbol &&
        this.board[c] === symbol
      ) {
        return item;
      }
    }
    return null;
  }

  finalizeGame(winner) {
    const duration = Math.round((Date.now() - this.startTime) / 1000);

    const savedMatch = StorageManager.saveMatch({
      mode: this.mode,
      difficulty: this.difficulty,
      playerXName: this.playerXName,
      playerOName: this.playerOName,
      winner: winner,
      winningLine: this.winningLine,
      moves: [...this.moves],
      boardFinal: [...this.board],
      durationSeconds: duration
    });

    const streakResult = StorageManager.recordDailyPlay();
    const updatedStats = StorageManager.recordGameResult({
      mode: this.mode,
      winner: winner,
      playerSymbol: this.mode === 'online' ? this.myOnlineSymbol : 'X'
    });

    this.emit('matchFinalized', {
      match: savedMatch,
      streak: streakResult,
      stats: updatedStats
    });
  }
}
const game = new GameEngine();

  
// --- UI MODULE ---
class UIManager {
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
      p.vy += 0.45;
      p.vx *= 0.98;
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

  startReplay(matchId) {
    const history = StorageManager.getHistory();
    const match = history.find(m => m.id === matchId);
    if (!match) return;

    this.currentReplayMatch = match;
    this.replayStep = 0;
    this.isReplayPlaying = false;
    clearInterval(this.replayInterval);

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

  renderStreakDetails() {
    const streakData = StorageManager.getStreakData();
    const stats = StorageManager.getStats();

    document.getElementById('streakModalCount').textContent = streakData.currentStreak;
    document.getElementById('streakModalBest').textContent = streakData.bestStreak || streakData.currentStreak;
    document.getElementById('streakModalTotal').textContent = stats.totalGames;

    const calendarEl = document.getElementById('streakWeekCalendar');
    if (!calendarEl) return;

    calendarEl.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  renderShareHub() {
    const user = auth.getCurrentUser();
    if (!user) return;

    const stats = StorageManager.getStats();
    const streak = StorageManager.getStreakData();
    const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

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
const ui = new UIManager();

  
// --- APP ORCHESTRATION ---
let pendingShareAction = false;

document.addEventListener('DOMContentLoaded', () => {
  ui.init();
  setupEventListeners();
  setupGameEngine();
  setupMultiplayer();
  checkUrlRoomHash();
});

function setupEventListeners() {
  const cells = document.querySelectorAll('.board-cell');
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = parseInt(cell.getAttribute('data-index'), 10);
      game.handleCellClick(idx);
    });

    cell.addEventListener('mouseenter', () => {
      if (game.isGameOver || game.board[parseInt(cell.getAttribute('data-index'), 10)] !== null) return;
      if (game.mode === 'online' && game.currentTurn !== game.myOnlineSymbol) return;
      cell.setAttribute('data-hover-symbol', game.currentTurn);
    });

    cell.addEventListener('mouseleave', () => {
      cell.removeAttribute('data-hover-symbol');
    });
  });

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

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      ui.closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        ui.closeModal(modal.id);
      }
    });
  });

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

  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const input = document.getElementById('registerAvatar');
      if (input) input.value = opt.getAttribute('data-avatar');
      sound.playClick();
    });
  });

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

  document.getElementById('guestContinueBtn')?.addEventListener('click', () => {
    ui.closeModal('authModal');
    ui.showToast('Continuing as Guest. You can play without limits!', 'info');
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    auth.logout();
    ui.closeModal('profileModal');
    ui.renderUserBadge();
    ui.showToast('Logged out successfully.', 'info');
  });

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

  document.getElementById('historyList')?.addEventListener('click', (e) => {
    const replayBtn = e.target.closest('.btn-replay');
    if (replayBtn) {
      const matchId = replayBtn.getAttribute('data-match-id');
      ui.startReplay(matchId);
    }
  });

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

  document.getElementById('copyRoomLinkBtn')?.addEventListener('click', () => {
    const input = document.getElementById('roomLinkInput');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        ui.showToast('Room link copied to clipboard!', 'success');
      });
    }
  });

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
  game.on('moveExecuted', ({ cell, symbol }) => {
    const cellEl = document.querySelector(`.board-cell[data-index="${cell}"]`);
    if (cellEl) {
      cellEl.innerHTML = symbol === 'X' ? ui.getXSVG() : ui.getOSVG();
      cellEl.classList.add('filled', `filled-${symbol.toLowerCase()}`);
    }
  });

  game.on('turnChanged', (turn) => {
    updateTurnUI(turn);
  });

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

  game.on('onlineMoveBroadcast', ({ cell, symbol }) => {
    multiplayer.sendMove(cell, symbol);
  });

  game.on('matchFinalized', ({ streak, stats }) => {
    ui.renderStreakWidget();
    ui.renderWinsWidget();
    if (streak.isNewMilestone) {
      sound.playStreak();
      ui.showToast(`🔥 Fantastic! You reached a new record: ${streak.streak} Day Streak!`, 'success', 4000);
    }
  });

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

})();