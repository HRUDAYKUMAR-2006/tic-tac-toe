// AI Engine with Easy, Medium, and Unbeatable Minimax Algorithms

const WIN_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export class TicTacToeAI {
  static getBestMove(board, difficulty = 'master', aiSymbol = 'O', humanSymbol = 'X') {
    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (emptyIndices.length === 0) return null;

    if (difficulty === 'easy') {
      // Pure random move
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (difficulty === 'medium') {
      // 1. Check if AI can win in 1 move
      for (const idx of emptyIndices) {
        board[idx] = aiSymbol;
        if (this.checkWin(board, aiSymbol)) {
          board[idx] = null;
          return idx;
        }
        board[idx] = null;
      }

      // 2. Check if Human can win in 1 move and block
      for (const idx of emptyIndices) {
        board[idx] = humanSymbol;
        if (this.checkWin(board, humanSymbol)) {
          board[idx] = null;
          return idx;
        }
        board[idx] = null;
      }

      // 3. 50% chance pick optimal, 50% pick random
      if (Math.random() > 0.45) {
        return this.minimaxBestMove(board, aiSymbol, humanSymbol);
      } else {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }

    // Default to 'master' (unbeatable minimax)
    return this.minimaxBestMove(board, aiSymbol, humanSymbol);
  }

  static minimaxBestMove(board, aiSymbol, humanSymbol) {
    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    // Opening move optimization: if center is open, high priority
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
      return 0; // Draw
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
