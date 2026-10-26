// LocalStorage Manager for Game Data, Daily Streak, Stats, and Match History

const KEYS = {
  MATCH_HISTORY: 'nexus_ttt_history_v2',
  STATS: 'nexus_ttt_stats_v2',
  STREAK: 'nexus_ttt_streak_v2',
  USERS: 'nexus_ttt_registered_users_v2',
  CURRENT_USER: 'nexus_ttt_current_user_v2'
};

export class StorageManager {
  // --- Daily Streak System ---
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
      // Already played today, maintain streak
      if (!data.historyDays.includes(today)) {
        data.historyDays.push(today);
      }
      localStorage.setItem(KEYS.STREAK, JSON.stringify(data));
      return { streak: data.currentStreak, isNewMilestone: false, streakData: data };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let isNewMilestone = false;
    if (lastDate === yesterday) {
      // Consecutive day!
      data.currentStreak += 1;
      if (data.currentStreak > (data.bestStreak || 1)) {
        data.bestStreak = data.currentStreak;
        isNewMilestone = true;
      }
    } else {
      // Streak broken, reset to 1
      data.currentStreak = 1;
    }

    data.lastPlayedDate = today;
    if (!data.historyDays) data.historyDays = [];
    if (!data.historyDays.includes(today)) {
      data.historyDays.push(today);
    }
    // Keep last 30 days
    if (data.historyDays.length > 30) {
      data.historyDays = data.historyDays.slice(-30);
    }

    localStorage.setItem(KEYS.STREAK, JSON.stringify(data));
    return { streak: data.currentStreak, isNewMilestone, streakData: data };
  }

  // --- Overall Statistics ---
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

  // --- Match History Ledger & Interactive Replays ---
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
      mode: match.mode, // 'ai' | 'offline' | 'online'
      difficulty: match.difficulty || null,
      playerXName: match.playerXName || 'Player X',
      playerOName: match.playerOName || 'Player O',
      winner: match.winner, // 'X', 'O', or 'draw'
      winningLine: match.winningLine || null, // [a, b, c]
      moves: match.moves || [], // [{ cell: 4, symbol: 'X' }, ...]
      boardFinal: match.boardFinal || [],
      durationSeconds: match.durationSeconds || 0
    };

    history.unshift(entry);
    // Keep last 50 matches
    if (history.length > 50) history.pop();
    localStorage.setItem(KEYS.MATCH_HISTORY, JSON.stringify(history));
    return entry;
  }

  static clearHistory() {
    localStorage.removeItem(KEYS.MATCH_HISTORY);
  }

  // --- Registered Users & Guest Mode ---
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
