import { StorageManager } from './storage.js';

export class AuthManager {
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

    // Auto log in after registration
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

export const auth = new AuthManager();
