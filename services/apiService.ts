import { User, AuthResponse, AnalysisRecord, ThreatLevel } from '../types';

const API_URL = 'http://localhost:5000/api';

export const ApiService = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      return await res.json();
    } catch (e) {
      console.error("Backend Error", e);
      return { success: false, message: "Server connection failed. Is server.py running?" };
    }
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (e) {
      console.error("Backend Error", e);
      return { success: false, message: "Server connection failed. Is server.py running?" };
    }
  },

  async getRecords(userId: string): Promise<AnalysisRecord[]> {
    try {
      const res = await fetch(`${API_URL}/records/${userId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp).getTime() || Date.now()
      }));
    } catch (e) {
      return [];
    }
  },

  async analyzeAudio(userId: string, averageVolume: number): Promise<ThreatLevel> {
    try {
        const res = await fetch(`${API_URL}/analyze/audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, average_volume: averageVolume })
        });
        const data = await res.json();
        return data.level as ThreatLevel;
    } catch (e) {
        return ThreatLevel.SAFE;
    }
  },

  async saveVideoIncident(userId: string, level: ThreatLevel, reason: string) {
    try {
        await fetch(`${API_URL}/analyze/video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, level, reason })
        });
    } catch (e) {
        console.error(e);
    }
  }
};
