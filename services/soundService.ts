// Using Web Audio API to generate sounds without external file dependencies
export const playAlertSound = (type: 'beep' | 'siren' | 'none') => {
  if (type === 'none') return;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  if (type === 'beep') {
    // Yellow Alert - Simple Beep
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } 
  else if (type === 'siren') {
    // Red Alert - Siren
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
    oscillator.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.6);
    
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.0);
  }
};