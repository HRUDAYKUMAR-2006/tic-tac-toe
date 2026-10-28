# 🎮 Nexus Tic-Tac-Toe

[![Deploy to GitHub Pages](https://github.com/HRUDAYKUMAR-2006/nexus-tic-tac-toe/actions/workflows/deploy.yml/badge.svg)](https://github.com/HRUDAYKUMAR-2006/nexus-tic-tac-toe/actions/workflows/deploy.yml)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/HRUDAYKUMAR-2006/nexus-tic-tac-toe)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Experience modern Tic-Tac-Toe featuring unbeatable AI (Minimax), offline 2-player pass & play, live WebRTC online multiplayer rooms, match history with visual step-by-step replays, daily streak tracking, and Web Audio sound synthesizer.**

---

## 🌟 Instant Play & Run Options

| Method | Description | Link |
| :--- | :--- | :--- |
| 🌐 **GitHub Pages (Web)** | Play directly in your browser on phone, tablet, or desktop with 0 installation | **[Play Live Web App](https://hrudaykumar-2006.github.io/nexus-tic-tac-toe/)** |
| ☁️ **GitHub Codespaces** | Launch full cloud development environment & auto-run server with 1-click | **[Open in Codespaces](https://codespaces.new/HRUDAYKUMAR-2006/nexus-tic-tac-toe)** |
| 💻 **Local / Offline** | Double-click `Launch Game.bat` or open `index.html` | Runs completely offline |

---

## 🚀 Features

### 1. Game Modes
- **🤖 vs AI**:
  - **Casual (Easy)**: Relaxed, randomized moves.
  - **Challenger (Medium)**: Tactical heuristics with occasional defensive blocks.
  - **Unbeatable (Master)**: Pure Minimax algorithm with depth-weighting — mathematically impossible to defeat!
  - Realistic "AI is calculating optimal move..." status indicator.
- **👥 Offline Friends**:
  - Pass & Play on the same screen with dynamic player spotlights and turn indicators.
- **🌐 Online Friends**:
  - Real-time peer-to-peer multiplayer using WebRTC (PeerJS) with BroadcastChannel fallback for multi-tab testing.
  - 6-character room codes (e.g. `ABC123`) and shareable direct URLs (`#room=...`).
  - Move synchronization and rematch requests.

### 2. Daily Streak & Career Wins Tracking
- **🔥 Daily Streak**:
  - Tracks consecutive days played using local storage.
  - Interactive 7-Day Flame Calendar modal showing past week activity and all-time best streak record.
- **🏆 Total Wins & Career Stats**:
  - Complete career ledger displaying Total Battles, Wins, Losses, Draws, and Win Rate %.
  - Breakdown by game mode: AI victories, Offline 2P victories, Online victories.

### 3. Previous Matches & Visual Replay Engine
- Match history logging mode, winner, player names, battle duration, and moves sequence.
- **▶ Visual Replay Engine**:
  - Select any past match to launch a move-by-move interactive board replay.
  - Controls include Play/Pause, Step Backward, Step Forward, and move counters.
- Filter matches by mode (All, AI, Offline, Online) or clear history.

### 4. Account-Gated Sharing with Free Guest Play
- **Unrestricted Guest Play**: Users can immediately play any mode without logging in.
- **Sharing Gate**:
  - Guest users clicking "Share" can Log In or Register (with custom avatar, username, and email).
  - Includes a "Continue Playing as Guest" skip option.
  - Authenticated players receive a personalized Share Card, 1-click clipboard copy, and direct links for Web Share, WhatsApp, and X/Twitter.

### 5. Glassmorphism Aesthetics & Web Audio
- Dark cosmic background with animated glow grid.
- Neon Cyan (`#00f5d4`) for X, Electric Magenta (`#ff007f`) for O, Warm Amber (`#ffd166`) for Streaks.
- Interactive phantom mark hover previews on board cells.
- Dynamic animated SVG winning strike line.
- Web Audio API custom synthesizer (moves, victory fanfare, draw chords, mute toggle).
- Fullscreen canvas confetti celebration on victory.

---

## 📢 How to Publish on GitHub (So Anyone Can Click & Play)

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes your game to GitHub Pages automatically whenever you push.

### Step 1: Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Enter a repository name (e.g. `nexus-tic-tac-toe` or `tic-tac-toe`).
3. Choose **Public** (so anyone can view and play it).
4. Click **Create repository**.

### Step 2: Push Your Code
Open your terminal in this project directory and run:
```bash
git remote add origin https://github.com/HRUDAYKUMAR-2006/nexus-tic-tac-toe.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages in 1 Click
1. In your GitHub repository, click **Settings** (top tab bar).
2. Click **Pages** in the left sidebar menu.
3. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
4. That's it! GitHub Actions will run automatically. In about 30 seconds, your game is live at:
   ```
   https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>/
   ```

### Step 4: Add the Live Link to Your Repository Header
To make it effortlessly clickable right on your GitHub repo's homepage:
1. Go to the front page of your repository.
2. In the right-hand sidebar under **About**, click the ⚙️ gear icon.
3. Check the box for **Use your GitHub Pages website** (or paste your Pages URL).
4. Click **Save changes**. Now a clickable link will be shown prominently to every visitor!

---

## 💻 Local Development

### 1-Click Offline Launch
Double-click:
- **`Launch Game.bat`** (or open **`index.html`** in any web browser)

### Local Node.js Server
```bash
npm start
# or: node server.js
```
Then visit: `http://localhost:3000`

### Run Test Suite
```bash
npm test
# or: node test-runner.js
```

### Rebuild Bundle (if editing modules in `/js`)
```bash
npm run build
# or: node build.js
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
