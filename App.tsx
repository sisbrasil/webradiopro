import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music, MessageCircle, Volume2, VolumeX, Radio } from "lucide-react";
import { STREAMS, WHATSAPP_NUMBER } from "./constants";

export default function App() {
  const [currentStreamIdx, setCurrentStreamIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [requestText, setRequestText] = useState("");
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentStream = STREAMS[currentStreamIdx];

  // Handle Volume Changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Stream Switching
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      // Small timeout to allow the audio element to reset its source
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Auto-play prevented by browser policy:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentStreamIdx]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err);
        alert("Não foi possível iniciar a reprodução. Verifique sua conexão.");
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const switchStream = (index: number) => {
    if (index === currentStreamIdx) return;
    setIsPlaying(false); // Pause before switch to avoid overlapping audio if lag occurs
    setCurrentStreamIdx(index);
    // We rely on the useEffect above to auto-play after switch if it was already playing,
    // actually we decided to force it to 'false' initially to be safe, 
    // but let's try to keep it playing for smooth UX if possible.
    // Actually, let's set isPlaying true immediately so the effect picks it up.
    setTimeout(() => setIsPlaying(true), 50);
  };

  const sendWhatsAppRequest = () => {
    if (!requestText.trim()) {
      alert("Por favor, digite o nome da música ou artista.");
      return;
    }
    const message = `Olá! Gostaria de pedir a música: ${requestText}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setRequestText("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="text-indigo-500 w-6 h-6 md:w-8 md:h-8" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              WebRadio<span className="text-indigo-500">Pro</span>
            </h1>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors px-4 py-2 rounded-full text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp da Rádio
          </a>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Hero Player Section */}
        <section className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Player Card */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
            {/* Background Blur Effect */}
            <div 
              className="absolute inset-0 opacity-20 bg-cover bg-center blur-3xl scale-125 pointer-events-none transition-all duration-1000"
              style={{ backgroundImage: `url(${currentStream.cover})` }}
            />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              {/* Cover Art with Pulse when playing */}
              <motion.div 
                animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10"
              >
                <img 
                  src={currentStream.cover} 
                  alt={currentStream.name} 
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Player Controls & Info */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium uppercase tracking-wider mb-4">
                  <span className={`block w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  {isPlaying ? 'Ao Vivo' : 'Pausado'}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{currentStream.name}</h2>
                <p className="text-indigo-200/80 text-lg mb-8">{currentStream.desc}</p>

                {/* Audio Visualizer (Fake) */}
                <div className="w-full h-16 flex items-end gap-1 mb-8 px-4 md:px-0 justify-center md:justify-start">
                  {Array.from({ length: 24 }).map((_, i) => (
                     <motion.div
                       key={i}
                       className="w-1.5 bg-indigo-400/80 rounded-t-full"
                       animate={{
                         height: isPlaying ? [`${10 + Math.random() * 30}%`, `${30 + Math.random() * 70}%`, `${10 + Math.random() * 30}%`] : '10%'
                       }}
                       transition={{
                         repeat: Infinity,
                         duration: 0.5 + Math.random() * 0.5,
                         ease: "easeInOut",
                         delay: i * 0.05
                       }}
                     />
                  ))}
                </div>

                {/* Controls Row */}
                <div className="w-full flex flex-wrap items-center gap-6 justify-center md:justify-start">
                  <button
                    onClick={togglePlay}
                    className={`w-16 h-16 flex items-center justify-center rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 ${isPlaying ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-white text-slate-900 hover:bg-gray-200'}`}
                    aria-label={isPlaying ? "Pausar" : "Tocar"}
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>

                  <div className="flex items-center gap-3 bg-slate-900/40 px-4 py-2 rounded-full border border-white/5">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 md:w-32 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      aria-label="Volume"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Channels & Requests */}
          <div className="flex flex-col gap-6">
            {/* Channels */}
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-indigo-400" />
                Canais Disponíveis
              </h3>
              <div className="space-y-2">
                {STREAMS.map((stream, idx) => (
                  <button
                    key={stream.id}
                    onClick={() => switchStream(idx)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left ${
                      currentStreamIdx === idx
                        ? "bg-indigo-600/20 border-indigo-500/50 border"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <img src={stream.cover} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div className={`font-medium ${currentStreamIdx === idx ? 'text-indigo-300' : 'text-gray-200'}`}>
                        {stream.name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{stream.desc}</div>
                    </div>
                    {currentStreamIdx === idx && isPlaying && (
                       <div className="ml-auto flex gap-0.5 items-end h-4">
                          <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-indigo-500" />
                          <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-indigo-500" />
                          <motion.div animate={{ height: [6, 10, 4] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-indigo-500" />
                       </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Box */}
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-green-400" />
                Peça sua Música
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Envie seu pedido diretamente para nosso WhatsApp.
              </p>
              <div className="flex flex-col gap-3">
                <textarea
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="Ex: Nome da Música - Artista"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none h-24"
                />
                <button
                  onClick={sendWhatsAppRequest}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar Pedido
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentStream.url}
        crossOrigin="anonymous"
        onError={(e) => {
            console.error("Audio Error:", e);
            setIsPlaying(false);
        }}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <footer className="py-6 text-center text-gray-500 text-sm border-t border-white/5 bg-slate-950/30">
        <p>© {new Date().getFullYear()} WebRadio Pro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
