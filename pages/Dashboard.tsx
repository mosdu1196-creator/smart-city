import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisRecord, ThreatLevel, User } from '../types';
import { Shield, Activity, AlertOctagon } from 'lucide-react';

interface DashboardProps {
  user: User;
  records: AnalysisRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, records }) => {
  // Process data for charts
  const userRecords = records.filter(r => r.userId === user.id);
  
  const stats = {
    total: userRecords.length,
    safe: userRecords.filter(r => r.threatLevel === ThreatLevel.SAFE).length,
    violence: userRecords.filter(r => r.threatLevel === ThreatLevel.VIOLENCE).length,
    weapon: userRecords.filter(r => r.threatLevel === ThreatLevel.WEAPON).length,
  };

  // Mock timeline data if no records exist yet
  const chartData = userRecords.length > 0 
    ? userRecords.slice(0, 10).reverse().map((r, i) => ({
        name: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        level: r.threatLevel === ThreatLevel.SAFE ? 0 : r.threatLevel === ThreatLevel.VIOLENCE ? 50 : 100,
        desc: r.threatLevel
      }))
    : [
        { name: '10:00', level: 0 },
        { name: '10:05', level: 0 },
        { name: '10:10', level: 50 },
        { name: '10:15', level: 0 },
        { name: '10:20', level: 100 },
        { name: '10:25', level: 0 },
      ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Safety Score</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-2">
                {stats.total === 0 ? '100%' : `${Math.round((stats.safe / stats.total) * 100)}%`}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${stats.total === 0 ? 100 : (stats.safe / stats.total) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Incidents Detected</p>
              <h3 className="text-3xl font-bold text-amber-400 mt-2">{stats.violence}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${stats.total === 0 ? 0 : (stats.violence / stats.total) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Critical Threats</p>
              <h3 className="text-3xl font-bold text-red-500 mt-2">{stats.weapon}</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertOctagon className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${stats.total === 0 ? 0 : (stats.weapon / stats.total) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm h-[400px]">
        <h2 className="text-xl font-bold text-white mb-6">Threat Level Timeline</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="level" stroke="#ef4444" fillOpacity={1} fill="url(#colorLevel)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity List */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {userRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No activity recorded yet.</p>
          ) : (
            userRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    record.threatLevel === ThreatLevel.SAFE ? 'bg-emerald-500' :
                    record.threatLevel === ThreatLevel.VIOLENCE ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">{record.type} ANALYSIS</p>
                    <p className="text-xs text-gray-400">{new Date(record.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    record.threatLevel === ThreatLevel.SAFE ? 'bg-emerald-500/10 text-emerald-500' :
                    record.threatLevel === ThreatLevel.VIOLENCE ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {record.threatLevel}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;