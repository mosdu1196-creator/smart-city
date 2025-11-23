import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';
import { ThreatLevel, User } from '../types';
import AlertBanner from '../components/AlertBanner';
import { ApiService } from '../services/apiService';

interface AudioAnalysisProps {
  user: User;
}

const AudioAnalysis: React.FC<AudioAnalysisProps> = ({ user }) => {
  const [isListening, setIsListening] = useState(false);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);
  const intervalRef = useRef<any>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      setThreatLevel(ThreatLevel.SAFE);

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 512;
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      drawVisualizer();
      
      // Start polling backend for inference
      intervalRef.current = setInterval(sendAudioDataToBackend, 2000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopListening = () => {
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsListening(false);
    setThreatLevel(null);
  };

  const sendAudioDataToBackend = async () => {
    if (!analyserRef.current) return;

    // In a full production app, you would record a Blob and send formData.
    // For this prototype, we send feature data (Volume) to let Python mock the logic or use a simple model input.
    const array = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(array);
    const average = array.reduce((a, b) => a + b) / array.length;

    // Send to Python Backend
    const level = await ApiService.analyzeAudio(user.id, average);
    setThreatLevel(level);
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#111827'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Color based on intensity
        const r = barHeight + 20;
        const g = 100 - (barHeight / 2);
        const b = 255;
        
        // If dangerous
        if (threatLevel === ThreatLevel.WEAPON) ctx.fillStyle = `rgb(255, 0, 0)`;
        else ctx.fillStyle = `rgb(${r},${g},${b})`;

        ctx.fillRect(x, canvas.height - barHeight / 1.5, barWidth, barHeight / 1.5);

        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    return () => stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">City Acoustic Monitor</h2>
        <p className="text-gray-400">Linked to <code className="text-blue-400">sound_model_advanced.h5</code> via Python Backend.</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-900/80 px-3 py-1 rounded-full border border-gray-700">
            <Activity className={`w-4 h-4 ${isListening ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
            <span className="text-xs text-gray-300 font-mono uppercase tracking-wider">
              {isListening ? 'Server Connected' : 'Standby'}
            </span>
        </div>

        <div className="h-64 bg-gray-950 rounded-xl border border-gray-800 mb-6 flex items-center justify-center relative shadow-inner">
            <canvas ref={canvasRef} width="800" height="256" className="w-full h-full rounded-xl" />
            {!isListening && <p className="absolute text-gray-500 font-mono">MICROPHONE OFF - START MONITORING</p>}
        </div>

        <div className="flex justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl ${
              isListening 
                ? 'bg-red-500/10 text-red-500 border-2 border-red-500 shadow-red-500/20' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                Activate Acoustic Sensor
              </>
            )}
          </button>
        </div>
      </div>

       <AlertBanner 
         level={threatLevel} 
         message={threatLevel === ThreatLevel.WEAPON ? "Critical: Gunshot acoustic signature detected by H5 model." : undefined}
       />
    </div>
  );
};

export default AudioAnalysis;