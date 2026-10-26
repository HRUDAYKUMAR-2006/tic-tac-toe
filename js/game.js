import { TicTacToeAI } from './ai.js';
import { StorageManager } from './storage.js';
import { sound } from './audio.js';

export const WIN_LINES = [
  { line: [0, 1, 2], type: 'row-0' },
  { line: [3, 4, 5], type: 'row-1' },
  { line: [6, 7, 8], type: 'row-2' },
  { line: [0, 3, 6], type: 'col-0' },
  { line: [1, 4, 7], type: 'col-1' },
  { line: [2, 5, 8], type: 'col-2' },
  { line: [0, 4, 8], type: 'diag-0' },
  { line: [2, 4, 6], type: 'diag-1' }
];

export class GameEngine {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    this.winningType = null;
    this.mode = 'ai'; // 'ai' | 'offline' | 'online'
    this.difficulty = 'master'; // 'easy' | 'medium' | 'master'
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

    // In Online mode, player can only move when it is their symbol's turn
    if (this.mode === 'online' && this.currentTurn !== this.myOnlineSymbol) {
      return false;
    }

    const moveMade = this.executeMove(index, this.currentTurn);
    if (!moveMade) return false;

    if (this.mode === 'online') {
      this.emit('onlineMoveBroadcast', { cell: index, symbol: moveMade.symbol });
    }

    // If game continues and mode is AI and it's O's turn
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

    // Check game condition
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

    // Check for draw
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

    // Switch turn
    this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
    this.emit('turnChanged', this.currentTurn);
    return { cell: index, symbol };
  }

  triggerAIMove() {
    this.isAIThinking = true;
    this.emit('aiThinkingStart');

    // Human-like thinking latency (between 350ms - 550ms)
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

    // Save match to storage ledger
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

    // Update Daily Streak and Stats
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

export const game = new GameEngine();
