import { User, AnalysisRecord } from '../types';

const USERS_KEY = 'safecity_users';
const CURRENT_USER_KEY = 'safecity_current_user';
const RECORDS_KEY = 'safecity_records';

export const StorageService = {
  // User Management
  saveUser: (user: User) => {
    const users = StorageService.getUsers();
    // Check if user exists to avoid duplicates
    if (!users.find(u => u.username === user.username)) {
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  login: (username: string, password?: string): User | null => {
    const users = StorageService.getUsers();
    const user = users.find(u => u.username === username);
    
    // If password is provided, check it
    if (user && password && user.password === password) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    
    // Fallback for legacy dev mode if needed, though strictly we want passwords now
    if (user && !password) {
       // Only allow password-less login if the user record has no password (legacy)
       if (!user.password) {
         localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
         return user;
       }
    }

    return null;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Record Management
  addRecord: (record: AnalysisRecord) => {
    const records = StorageService.getRecords();
    records.unshift(record); // Add to beginning
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },

  getRecords: (): AnalysisRecord[] => {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getUserRecords: (userId: string): AnalysisRecord[] => {
    return StorageService.getRecords().filter(r => r.userId === userId);
  }
};