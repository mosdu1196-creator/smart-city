import React from 'react';
import { LayoutDashboard, MessageSquareText, Mic, Video, LogOut, Building2 } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  username: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, username }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'text', label: 'Text Analysis', icon: MessageSquareText },
    { id: 'audio', label: 'Audio Monitor', icon: Mic },
    { id: 'video', label: 'Video Surveillance', icon: Video },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full fixed left-0 top-0 z-20 shadow-2xl">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800 bg-gray-950/50">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
          <Building2 className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">Safe<span className="text-blue-500">City</span></h1>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1 font-mono">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                active 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
              <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="font-medium relative z-10">{item.label}</span>
              {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-pulse"></div>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 bg-gray-950/30">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg mb-3 border border-gray-700/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{username}</p>
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-green-400 font-mono tracking-wide">ONLINE</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2.5 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;