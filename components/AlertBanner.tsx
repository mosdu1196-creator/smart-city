import React, { useEffect } from 'react';
import { ThreatLevel } from '../types';
import { CheckCircle2, AlertTriangle, Siren } from 'lucide-react';
import { playAlertSound } from '../services/soundService';

interface AlertBannerProps {
  level: ThreatLevel | null;
  message?: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ level, message }) => {
  useEffect(() => {
    if (level === ThreatLevel.VIOLENCE) {
      playAlertSound('beep');
    } else if (level === ThreatLevel.WEAPON) {
      playAlertSound('siren');
    }
  }, [level]);

  if (!level) return null;

  const config = {
    [ThreatLevel.SAFE]: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      icon: CheckCircle2,
      title: 'SAFE',
      desc: 'No threats detected. Situation normal.',
      shadow: 'shadow-emerald-500/20'
    },
    [ThreatLevel.VIOLENCE]: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      icon: AlertTriangle,
      title: 'VIOLENCE DETECTED',
      desc: 'Potential aggression or physical conflict identified.',
      shadow: 'shadow-amber-500/20'
    },
    [ThreatLevel.WEAPON]: {
      bg: 'bg-red-600/10',
      border: 'border-red-500',
      text: 'text-red-500',
      icon: Siren,
      title: 'WEAPON DETECTED',
      desc: 'Lethal weapon signature identified. Immediate action required.',
      shadow: 'shadow-red-500/40 animate-pulse'
    }
  };

  const current = config[level];
  const Icon = current.icon;

  return (
    <div className={`mt-6 p-6 rounded-2xl border ${current.bg} ${current.border} ${current.shadow} transition-all duration-500 transform scale-100 opacity-100`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${current.bg} border ${current.border}`}>
          <Icon className={`w-8 h-8 ${current.text}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${current.text} tracking-wide mb-1`}>{current.title}</h3>
          <p className="text-gray-300 text-lg">{message || current.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;