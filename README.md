# Nexus Tic-Tac-Toe

A modern, feature-packed Tic-Tac-Toe web application featuring competition against AI, offline friends, and online friends, complete with match history & move-by-move replays, daily streak tracking, career statistics, Web Audio API sound synthesis, and account-gated sharing while maintaining 100% free guest play.

---

## 🚀 Features

### 1. Game Modes
- **🤖 vs AI**:
  - **Casual (Easy)**: Random relaxed moves.
  - **Challenger (Medium)**: Tactical moves with human-like heuristics.
  - **Unbeatable (Master)**: Pure Minimax algorithm with depth weighting — mathematically impossible to defeat!
  - Realistic "AI is calculating optimal move..." status with realistic thinking delay.
- **👥 Offline Friends**:
  - Pass & Play on the same screen with dynamic player spotlights and turn indicators.
- **🌐 Online Friends**:
  - Real-time peer-to-peer multiplayer using WebRTC (PeerJS) with BroadcastChannel fallback for multi-tab testing.
  - Room generation with 6-character codes (e.g. `ABC123`) and shareable direct URLs (`#room=...`).
  - Move synchronization and rematch requests.

### 2. Daily Streak & Career Wins Tracking
- **🔥 Daily Streak**:
  - Tracks consecutive days played.
  - Interactive 7-Day Flame Calendar modal showing activity over the past week and all-time best streak.
- **🏆 Total Wins & Statistics**:
  - Career ledger displaying Total Battles, Wins, Losses, Draws, and Win Rate %.
  - Breakdown by mode: AI victories, Offline 2P victories, Online victories.

### 3. Previous Matches Data & Interactive Replays
- Detailed match history ledger logging mode, winner, player names, duration in seconds, and moves count.
- **▶ Visual Replay Engine**:
  - Select any past match to launch a move-by-move interactive board replay.
  - Controls include Play/Pause, Step Backward, Step Forward, and Move indicators.
- Filter matches by mode (All, AI, Offline, Online) or clear history.

### 4. Account-Gated Sharing with Unrestricted Guest Play
- **Unrestricted Guest Play**: Users can immediately play any game mode without logging in or signing up.
- **Sharing Gate**:
  - Clicking any "Share" button (`Header`, `In-Game`, or `Post-Match`) as a guest displays the **"Account Required to Share"** modal.
  - Allows the user to **Log In** to an existing account or **Create a New Account** (with custom display name, username, email, password, and avatar selection).
  - Includes a "Continue Playing as Guest" skip option.
  - Upon logging in or registering, automatically transitions into the **Share Hub** with a personalized Share Card, 1-click clipboard copy, and links for Native Web Share, WhatsApp, and X/Twitter.

### 5. Rich Aesthetics & Tactile Feedback
- Modern glassmorphism UI with dark cosmic background and subtle animated grid.
- Neon Cyan (`#00f5d4`) for X, Electric Magenta (`#ff007f`) for O, and Warm Gold Amber (`#ffd166`) for Streaks & Trophies.
- Interactive phantom mark hover preview on board cells.
- Dynamic animated SVG winning strike line overlay.
- Web Audio API custom synthesizer for moves, chimes, victory fanfare, and draw chords (with mute toggle).
- Fullscreen canvas confetti celebration on win.

---

## 💻 Running Locally

1. Open a terminal in `c:\hrudaykumar\tic tac toe`.
2. Start the lightweight local server:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
4. To run the automated test suite:
   ```bash
   node test-runner.js
   ```
