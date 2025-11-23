export enum ThreatLevel {
  SAFE = 'SAFE',
  VIOLENCE = 'VIOLENCE',
  WEAPON = 'WEAPON',
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; 
  role: 'admin' | 'user';
  created_at?: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  timestamp: number;
  type: 'TEXT' | 'AUDIO' | 'VIDEO';
  threatLevel: ThreatLevel;
  contentSnippet: string;
  confidence: number;
  details: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export interface AlertConfig {
  message: string;
  color: string;
  soundType: 'none' | 'beep' | 'siren';
}