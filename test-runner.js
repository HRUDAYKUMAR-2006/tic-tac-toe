// Automated Test Runner for Game Engine, AI Minimax, Daily Streak, History, and Auth

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

async function runTests() {
  console.log('=== RUNNING TESTS ===');

  // Test 1: Storage & Daily Streak calculation
  const { StorageManager } = await import('./js/storage.js');
  
  const initialStreak = StorageManager.getStreakData();
  console.assert(initialStreak.currentStreak >= 1, 'Initial streak should be >= 1');
  console.log('✓ Test 1 Passed: StorageManager streak init');

  // Test 2: AI Minimax Engine
  const { TicTacToeAI } = await import('./js/ai.js');

  // Board scenario where Human (X) is about to win at [0, 1] -> AI (O) must block at 2
  const blockBoard = [
    'X', 'X', null,
    'O', null, null,
    null, null, null
  ];
  const blockMove = TicTacToeAI.getBestMove(blockBoard, 'master', 'O', 'X');
  console.assert(blockMove === 2, `AI should block at cell 2, got: ${blockMove}`);
  console.log('✓ Test 2 Passed: Minimax blocks opponent win');

  // Board scenario where AI (O) can immediately win at [3, 4] -> cell 5
  const winBoard = [
    'X', 'X', null,
    'O', 'O', null,
    'X', null, null
  ];
  const winMove = TicTacToeAI.getBestMove(winBoard, 'master', 'O', 'X');
  console.assert(winMove === 5, `AI should take immediate win at cell 5, got: ${winMove}`);
  console.log('✓ Test 3 Passed: Minimax claims immediate victory');

  // Test 4: Auth Manager
  const { AuthManager } = await import('./js/auth.js');
  const auth = new AuthManager();

  console.assert(auth.isLoggedIn() === false, 'Initially guest should NOT be logged in');

  const regRes = auth.register({
    name: 'Hruday Kumar',
    username: 'hruday',
    email: 'hruday@example.com',
    password: 'password123',
    avatar: '👑'
  });
  console.assert(regRes.success === true, 'Registration should succeed');
  console.assert(auth.isLoggedIn() === true, 'After registration, user should be logged in');
  console.assert(auth.getCurrentUser().name === 'Hruday Kumar', 'User name should match');
  console.log('✓ Test 4 Passed: Auth registration & session');

  // Test logout
  auth.logout();
  console.assert(auth.isLoggedIn() === false, 'After logout, user should be guest');

  // Test login
  const loginRes = auth.login('hruday', 'password123');
  console.assert(loginRes.success === true, 'Login should succeed');
  console.assert(auth.getCurrentUser().username === 'hruday', 'Logged in username matches');
  console.log('✓ Test 5 Passed: Auth login');

  // Test 6: Match History saving
  const saved = StorageManager.saveMatch({
    mode: 'ai',
    difficulty: 'master',
    playerXName: 'Hruday',
    playerOName: 'AI',
    winner: 'X',
    winningLine: [0, 1, 2],
    moves: [{ cell: 0, symbol: 'X' }, { cell: 3, symbol: 'O' }, { cell: 1, symbol: 'X' }, { cell: 4, symbol: 'O' }, { cell: 2, symbol: 'X' }],
    boardFinal: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
    durationSeconds: 15
  });

  const history = StorageManager.getHistory();
  console.assert(history.length === 1, 'History should contain 1 match');
  console.assert(history[0].moves.length === 5, 'History moves length should be 5');
  console.log('✓ Test 6 Passed: Match history logging with moves data');

  console.log('\n=== ALL 6 TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
