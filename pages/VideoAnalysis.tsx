import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, ScanFace } from 'lucide-react';
import { ThreatLevel, User } from '../types';
import AlertBanner from '../components/AlertBanner';
import { analyzeFrame } from '../services/geminiService';
import { ApiService } from '../services/apiService';

interface VideoAnalysisProps {
  user: User;
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ user }) => {
  const [isActive, setIsActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setThreatLevel(ThreatLevel.SAFE);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access failed");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setThreatLevel(null);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || analyzing) return;

    setAnalyzing(true);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      try {
        // Step 1: Analyze using Gemini (Vision)
        const result = await analyzeFrame(base64);
        setThreatLevel(result.level);

        // Step 2: Send Result to Python Backend for Logging/Action
        await ApiService.saveVideoIncident(user.id, result.level, result.reason);

      } catch (e) {
        console.error("Analysis failed", e);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // Auto-analyze every 5 seconds if active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(captureAndAnalyze, 5000);
    }
    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">City Visual Surveillance</h2>
        <p className="text-gray-400">Computer Vision system detecting weapons and violence in real-time.</p>
      </div>

      <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl aspect-video">
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <CameraOff className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-mono">FEED DISCONNECTED</p>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-0'}`} 
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* HUD Overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning Line */}
            <div className="w-full h-1 bg-blue-500/50 absolute top-0 animate-scan shadow-[0_0_15px_#3b82f6]"></div>
            
            {/* Corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-blue-500/50 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-blue-500/50 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-blue-500/50 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg"></div>

            {/* Status Pill */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700">
                <div className={`w-2 h-2 rounded-full ${analyzing ? 'bg-yellow-400 animate-bounce' : 'bg-green-500'}`}></div>
                <span className="text-xs font-mono text-white">
                  {analyzing ? 'PROCESSING FRAME...' : 'SYSTEM SECURE'}
                </span>
            </div>
            
            {/* Tech details */}
            <div className="absolute bottom-6 left-6 font-mono text-xs text-blue-400/80">
                <p>LATENCY: 12ms</p>
                <p>FPS: 60</p>
                <p>BACKEND: CONNECTED</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
            isActive 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
          }`}
        >
          {isActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          {isActive ? 'Stop Feed' : 'Start Camera'}
        </button>
      </div>

      <AlertBanner level={threatLevel} />
    </div>
  );
};

export default VideoAnalysis;