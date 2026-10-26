// Online Multiplayer via PeerJS WebRTC & BroadcastChannel Dual Engine

export class MultiplayerManager {
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
    return new Promise((resolve, reject) => {
      this.isHost = true;
      this.mySymbol = 'X';
      this.roomCode = this.generateRoomCode();
      const peerId = 'nexus-ttt-' + this.roomCode.toLowerCase();

      this.initBroadcastFallback(this.roomCode);

      // Check if PeerJS is available in global scope
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

          this.peer.on('open', (id) => {
            resolve(this.roomCode);
          });

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

      // Also listen on BroadcastChannel for same-device cross-tab pairing
      setTimeout(() => {
        resolve(this.roomCode);
      }, 500);
    });
  }

  joinRoom(code, playerName, avatar) {
    return new Promise((resolve, reject) => {
      this.isHost = false;
      this.mySymbol = 'O';
      this.roomCode = code.toUpperCase().trim();
      const targetPeerId = 'nexus-ttt-' + this.roomCode.toLowerCase();

      this.initBroadcastFallback(this.roomCode);

      // Announce presence on broadcast channel
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

export const multiplayer = new MultiplayerManager();
