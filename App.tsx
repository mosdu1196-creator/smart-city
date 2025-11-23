import React, { useState, useEffect } from 'react';
import { User, AnalysisRecord } from './types';
import { ApiService } from './services/apiService';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TextAnalysis from './pages/TextAnalysis';
import AudioAnalysis from './pages/AudioAnalysis';
import VideoAnalysis from './pages/VideoAnalysis';
import { Building2, UserPlus, LogIn, Mail, Lock, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Auth State
  const [isLoginView, setIsLoginView] = useState(true);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data State
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    // Check if user is stored in session (Basic persistence)
    const storedUser = sessionStorage.getItem('safecity_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      loadUserData(user.id);
    }
    setLoading(false);
  }, []);

  const loadUserData = async (userId: string) => {
    const data = await ApiService.getRecords(userId);
    setRecords(data);
  };

  // Refresh records when switching to dashboard
  useEffect(() => {
    if (currentUser && currentPage === 'dashboard') {
        loadUserData(currentUser.id);
    }
  }, [currentPage, currentUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isLoginView) {
      // LOGIN
      if (!authName.trim() || !authPassword.trim()) {
        setAuthError("Please enter username and password.");
        return;
      }

      const response = await ApiService.login(authName, authPassword);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        sessionStorage.setItem('safecity_user', JSON.stringify(response.user));
        loadUserData(response.user.id);
      } else {
        setAuthError(response.message || 'Login failed.');
      }
    } else {
      // REGISTER
      if (!authName.trim() || !authPassword.trim() || !authEmail.trim()) {
        setAuthError("All fields are required.");
        return;
      }

      const response = await ApiService.register(authName, authEmail, authPassword);
      if (response.success && response.user) {
        // Auto login after register
        setCurrentUser(response.user);
        sessionStorage.setItem('safecity_user', JSON.stringify(response.user));
        loadUserData(response.user.id);
      } else {
        setAuthError(response.message || 'Registration failed.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('safecity_user');
    setCurrentUser(null);
    setRecords([]);
    setAuthName('');
    setAuthPassword('');
    setAuthEmail('');
  };

  const toggleAuthMode = () => {
    setIsLoginView(!isLoginView);
    setAuthError('');
    setAuthName('');
    setAuthPassword('');
    setAuthEmail('');
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500 font-mono">INITIALIZING SYSTEM...</div>;

  // -- AUTH SCREEN --
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/10">
              <Building2 className="text-white w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Safe<span className="text-blue-500">City</span></h1>
          <p className="text-gray-400 text-center mb-8 font-mono text-sm uppercase tracking-wide">Secure Access Terminal</p>

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Username Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text" 
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600"
                placeholder="Username"
                autoComplete="username"
              />
            </div>

            {/* Email Field (Register Only) */}
            {!isLoginView && (
              <div className="relative group animate-in slide-in-from-top-2 duration-300">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600"
                  placeholder="Official Email"
                  autoComplete="email"
                />
              </div>
            )}

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600"
                placeholder="Secure Password"
                autoComplete={isLoginView ? "current-password" : "new-password"}
              />
            </div>
            
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center animate-in fade-in">
                <p className="text-red-400 text-sm font-medium">{authError}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 mt-4"
            >
              {isLoginView ? 'Authenticate' : 'Register Credentials'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-800 pt-4">
            <button 
              onClick={toggleAuthMode}
              className="text-gray-500 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto font-medium"
            >
              {isLoginView ? <UserPlus className="w-4 h-4"/> : <LogIn className="w-4 h-4"/>}
              {isLoginView ? 'Create New Account' : 'Back to Login'}
            </button>
          </div>
          
          <div className="absolute bottom-[-40px] left-0 w-full text-center">
             <p className="text-[10px] text-gray-700 font-mono">SECURE CONNECTION | V 2.4.0</p>
          </div>
        </div>
      </div>
    );
  }

  // -- MAIN APP --
  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout}
        username={currentUser.username}
      />
      
      <main className="flex-1 ml-64 p-8 relative overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/3 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto h-full relative z-10">
           {currentPage === 'dashboard' && <Dashboard user={currentUser} records={records} />}
           {currentPage === 'text' && <TextAnalysis user={currentUser} />}
           {currentPage === 'audio' && <AudioAnalysis user={currentUser} />}
           {currentPage === 'video' && <VideoAnalysis user={currentUser} />}
        </div>
      </main>
    </div>
  );
};

export default App;