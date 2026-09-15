import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Keys } from './types';
import { createInitialState, update } from './engine';
import { render } from './renderer';
import { initAudio, playHuhSound, startBgm, setBgmVolume, getBgmVolume, isBgmMuted, toggleBgmMute } from './audio';

const OFFICIAL_CA = 'A9AHYeqb7nQk7LZUraw7rBCzYRjy2DRvE6NqWfFHKRdH';
const TELEGRAM_URL = 'https://t.me/+Bzr4QWDYuMo3ZmVh';
const WEBSITE_URL = 'https://jmthomasofficial.github.io/huhcat/';
const DEXSCREENER_URL = 'https://dexscreener.com/solana/3wx6X4WVbyo59hCBuYozaWscdDkbbJo6cX28FKWFMxbS';
const PUMPFUN_URL = `https://pump.fun/coin/${OFFICIAL_CA}`;

const baseUrl = import.meta.env.BASE_URL || './';
const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

export default function HuhcatGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const keysRef = useRef<Keys>({ left: false, right: false, up: false, jump: false });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [gameScreen, setGameScreen] = useState<'title' | 'playing' | 'gameover' | 'win'>('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('huhcat_highscore') || '0'));
  const [huhCount, setHuhCount] = useState(0);
  const [copiedCA, setCopiedCA] = useState(false);
  const [bgmVol, setBgmVol] = useState<number>(() => Math.round(getBgmVolume() * 100));
  const [isMuted, setIsMuted] = useState<boolean>(() => isBgmMuted());

  const copyCA = () => {
    navigator.clipboard.writeText(OFFICIAL_CA);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  // Preload authentic Ben Cat audio buffers on mount
  useEffect(() => {
    initAudio();
  }, []);

  const handleTestHuh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await initAudio();
    startBgm();
    playHuhSound(1);
    setHuhCount(c => c + 1);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    initAudio();
    const muted = toggleBgmMute();
    setIsMuted(muted);
    if (!muted) {
      startBgm();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBgmVol(val);
    setBgmVolume(val / 100);
    if (isMuted && val > 0) {
      toggleBgmMute();
      setIsMuted(false);
    }
    startBgm();
  };

  const handleShareOnX = () => {
    const gameUrl = 'https://jmthomasofficial.github.io/huhcatgame/';
    const shareScore = score > 0 ? score : highScore;
    const text = shareScore > 0 
      ? `I just scored ${shareScore} PTS in the official $HUHCAT arcade game! 🐾🎮\n\nCan you beat my score? Jump, meow, smash bricks & stomp robo-mice with legendary Ben Cat!\n\nPlay free in your browser (mobile & desktop):\n${gameUrl}\n\nCA: ${OFFICIAL_CA}\n#HUHCAT #Solana #BenCat #Gaming`
      : `Playing the official $HUHCAT arcade game on Solana! 🐾🎮\n\nJump, meow, smash bricks & stomp robo-mice with legendary Ben Cat!\n\nPlay free in your browser (mobile & desktop):\n${gameUrl}\n\nCA: ${OFFICIAL_CA}\n#HUHCAT #Solana #BenCat #Gaming`;
      
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  const startGame = useCallback(() => {
    initAudio();
    startBgm();
    gameStateRef.current = createInitialState();
    setGameScreen('playing');
    setHuhCount(0);
  }, []);

  const restartGame = useCallback(() => {
    initAudio();
    startBgm();
    gameStateRef.current = createInitialState();
    setGameScreen('playing');
    setHuhCount(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keys = keysRef.current;
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keys.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          keys.up = true;
          keys.jump = true;
          break;
      }
      
      if (gameScreen === 'title' && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
      }
      if ((gameScreen === 'gameover' || gameScreen === 'win') && (e.code === 'Space' || e.code === 'Enter')) {
        restartGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = keysRef.current;
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keys.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          keys.up = false;
          keys.jump = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameScreen, startGame, restartGame]);

  // Touch controls on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Allow natural page scrolling when not in active gameplay
      if (gameScreen !== 'playing') return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const halfWidth = rect.width / 2;
      
      keysRef.current.up = true;
      keysRef.current.jump = true;
      
      if (x < halfWidth * 0.45) {
        keysRef.current.left = true;
      } else if (x > halfWidth * 1.55) {
        keysRef.current.right = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameScreen !== 'playing') return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const halfWidth = rect.width / 2;
      
      keysRef.current.left = false;
      keysRef.current.right = false;
      
      if (x < halfWidth * 0.45) {
        keysRef.current.left = true;
      } else if (x > halfWidth * 1.55) {
        keysRef.current.right = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameScreen !== 'playing') return;
      e.preventDefault();
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.up = false;
      keysRef.current.jump = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameScreen]);

  // Game loop
  useEffect(() => {
    if (gameScreen !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      // Update
      const state = gameStateRef.current;
      update(state, keysRef.current, dt, canvas.width, canvas.height);

      const stompedCount = state.mice.filter(m => !m.isAlive).length;
      if (stompedCount !== huhCount) {
        setHuhCount(stompedCount);
      }

      // Check game state changes
      if (state.gameOver) {
        setScore(state.player.score);
        setHighScore(state.highScore);
        setGameScreen('gameover');
        return;
      }
      if (state.gameWon) {
        setScore(state.player.score);
        setHighScore(state.highScore);
        setGameScreen('win');
        return;
      }

      // Render
      render(ctx, state, canvas.width, canvas.height);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = 0;
    };
  }, [gameScreen]);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = canvas.parentElement;
      if (!container) return;
      const w = Math.min(940, container.clientWidth);
      canvas.width = w;
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        canvas.height = Math.min(460, Math.max(340, Math.round(w * 0.95)));
      } else {
        canvas.height = Math.min(540, Math.max(420, window.innerHeight - 380));
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between bg-[#04050a] text-[#eef2f6] overflow-x-hidden relative select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(57,255,136,0.08)_0%,_transparent_60%)] pointer-events-none" />

      {/* TOP CYBER HEADER */}
      <header className="w-full z-30 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0d111c]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
            <img src={`${cleanBase}cat_idle.png`} alt="HUHCAT" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#39ff88]" />
            <span className="font-syne font-extrabold text-sm sm:text-base tracking-wider grad-text">$HUHCAT</span>
          </a>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono uppercase bg-[#39ff88]/10 text-[#39ff88] border border-[#39ff88]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-ping" />
            Solana V1 Inscription
          </span>
        </div>

        {/* Middle/Right: Audio BGM & CA Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* BGM Looping Audio Slider & Mute Toggle */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 border border-[#39ff88]/30 backdrop-blur-md shadow-sm">
            <button
              onClick={handleToggleMute}
              className="text-sm hover:scale-110 active:scale-95 transition-transform text-zinc-300 hover:text-[#39ff88] focus:outline-none"
              title={isMuted ? "Unmute BGM (LifeLegend Loop)" : "Mute BGM"}
            >
              {isMuted || bgmVol === 0 ? '🔇' : bgmVol < 40 ? '🔉' : '🔊'}
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : bgmVol}
                onChange={handleVolumeChange}
                className="w-16 md:w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#39ff88]"
                title={`BGM Volume: ${isMuted ? 0 : bgmVol}%`}
              />
              <span className="text-[10px] font-mono text-[#39ff88] w-6 text-right font-bold">
                {isMuted ? '0%' : `${bgmVol}%`}
              </span>
            </div>
          </div>

          {/* Copy CA Pill */}
          <button
            onClick={copyCA}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-lg bg-black/40 border border-[#39ff88]/30 hover:border-[#39ff88] text-xs font-mono text-zinc-300 transition-all hover:bg-[#39ff88]/10"
            title="Click to copy verified Contract Address"
          >
            <span className="text-[#39ff88] font-bold">CA:</span>
            <span className="hidden lg:inline">{OFFICIAL_CA.slice(0, 6)}...{OFFICIAL_CA.slice(-6)}</span>
            <span className="text-[10px] uppercase font-bold text-[#39ff88]">
              {copiedCA ? '✓ COPIED' : '📋 COPY'}
            </span>
          </button>

          {/* Social Links */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="px-2 sm:px-2.5 py-1 rounded-lg bg-[#229ed9]/20 hover:bg-[#229ed9]/30 text-[#229ed9] border border-[#229ed9]/40 text-xs font-mono font-bold flex items-center gap-1 transition-all"
            >
              <span>✈️</span>
              <span className="hidden sm:inline">TG CHAT</span>
            </a>
            <a
              href={DEXSCREENER_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all"
            >
              CHART
            </a>
          </div>
        </div>
      </header>

      {/* MAIN GAME CONTAINER */}
      <main className="relative w-full max-w-[940px] flex-1 flex items-center justify-center p-2">
        {/* Canvas Screen */}
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full max-h-[580px] rounded-xl border border-white/10 shadow-[0_0_50px_rgba(57,255,136,0.15)] bg-[#04050a]"
            style={{ imageRendering: 'auto' }}
          />

          {/* TITLE SCREEN / SPLASH SCREEN */}
          {gameScreen === 'title' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-6 rounded-xl overflow-y-auto sm:overflow-hidden border border-[#39ff88]/30 shadow-[0_0_60px_rgba(57,255,136,0.2)]">
              {/* Background Splash Image with Cinematic Ambient Zoom */}
              <img
                src={`${cleanBase}splash.jpg`}
                alt="HUHCAT: Mice & Mayhem"
                className="absolute inset-0 w-full h-full object-cover object-center animate-subtle-zoom pointer-events-none"
              />
              
              {/* Vignette & Scanline Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#04050a] via-[#04050a]/65 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#04050a_95%)] pointer-events-none" />
              <div className="absolute inset-0 scanline opacity-25 pointer-events-none" />

              {/* Title Screen Foreground Content */}
              <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center my-auto">
                
                {/* TOP CENTER STEAM-QUALITY HERO ACTION ARTWORK */}
                <div className="relative w-full max-w-[260px] sm:max-w-md mb-1.5 sm:mb-2 rounded-xl overflow-hidden border-2 border-[#39ff88]/50 shadow-[0_0_35px_rgba(57,255,136,0.35)] group bg-black/80 flex-shrink-0">
                  <img
                    src={`${cleanBase}hero-pounce.jpg`}
                    alt="HUHCAT Pouncing on Robo-Mouse"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('jmthomasofficial.github.io')) {
                        target.src = 'https://jmthomasofficial.github.io/huhcatgame/hero-pounce.jpg';
                      }
                    }}
                    className="w-full h-24 sm:h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04050a] via-transparent to-black/20" />
                  <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full bg-black/85 border border-[#39ff88]/60 text-[9px] sm:text-[10px] font-mono font-bold text-[#39ff88] backdrop-blur-md">
                      🐾 BEN CAT vs ROBO-MICE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#9945ff]/85 border border-purple-400/50 text-[9px] sm:text-[10px] font-mono font-bold text-white backdrop-blur-md">
                      SOLANA ARCADE
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/60 border border-[#39ff88]/50 backdrop-blur-md text-[9px] sm:text-[11px] font-mono text-[#39ff88] uppercase tracking-widest mb-1 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-ping" />
                  Official Solana V1 Arcade Experience
                </div>

                {/* Main 3D Title */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-syne tracking-tight text-white drop-shadow-[0_0_25px_rgba(57,255,136,0.8)] mb-0.5">
                  HUHCAT
                </h1>
                <p className="text-[11px] sm:text-sm font-mono font-bold tracking-wider grad-text uppercase mb-1.5 drop-shadow-md">
                  ⚔️ MICE &amp; MAYHEM ⚔️
                </p>

                {/* Briefing Mini-Card */}
                <div className="w-full bg-[#0d111c]/85 border border-white/15 backdrop-blur-md rounded-xl p-1.5 sm:p-2.5 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs text-zinc-300 shadow-2xl">
                  <div className="grid grid-cols-2 gap-1 sm:gap-1.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">MOVE:</span>
                      <span className="text-white font-bold">A / D or ⬅️ ➡️</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">JUMP:</span>
                      <span className="text-[#39ff88] font-bold">SPACE / TAP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">SMASH BRICKS:</span>
                      <span className="text-[#39ff88] font-bold">Jump From Below</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">STOMP MICE:</span>
                      <span className="text-yellow-400 font-bold">HUH! (9 LIVES)</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
                  <button
                    onClick={startGame}
                    className="flex-1 py-2.5 sm:py-3 px-5 rounded-xl bg-gradient-to-r from-[#39ff88] via-[#00ff87] to-[#00d15c] text-[#001a0a] font-black font-syne text-xs sm:text-base tracking-widest hover:shadow-[0_0_35px_rgba(57,255,136,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>▶</span>
                    <span>START GAME</span>
                  </button>

                  <button
                    onClick={handleTestHuh}
                    className="py-2.5 sm:py-3 px-3.5 rounded-xl bg-black/60 hover:bg-black/80 border border-[#39ff88]/40 hover:border-[#39ff88] text-[#39ff88] font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md shadow-lg"
                    title="Trigger the iconic Ben Cat vocalization"
                  >
                    <span>🔊</span>
                    <span>TEST REAL "HUH"</span>
                  </button>
                </div>

                {/* Score & Start Notice */}
                <div className="flex items-center justify-between w-full px-2 mt-2 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                  <span>{highScore > 0 ? `🏆 RECORD: ${highScore} PTS` : 'READY PLAYER ONE'}</span>
                  <span className="text-[#39ff88] animate-pulse">PRESS SPACE TO PLAY</span>
                </div>

                {/* Bottom Center Title Screen Quick Links */}
                <div className="w-full mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
                  <a
                    href={PUMPFUN_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#14F195]/20 hover:bg-[#14F195]/30 text-[#14F195] border border-[#14F195]/40 font-bold transition-all flex items-center gap-1"
                  >
                    <span>🚀</span>
                    <span>BUY ON PUMPFUN (+FREE SOL)</span>
                  </a>
                  <a
                    href={WEBSITE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold transition-all flex items-center gap-1"
                  >
                    <span>🌐</span>
                    <span>WEBSITE</span>
                  </a>
                  <button
                    onClick={copyCA}
                    className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-[#39ff88] border border-[#39ff88]/40 font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{copiedCA ? '✓' : '📋'}</span>
                    <span>{copiedCA ? 'COPIED!' : 'COPY CA'}</span>
                  </button>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#229ed9]/20 hover:bg-[#229ed9]/30 text-[#229ed9] border border-[#229ed9]/40 font-bold transition-all flex items-center gap-1"
                  >
                    <span>✈️</span>
                    <span>TG CHAT</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER SCREEN */}
          {gameScreen === 'gameover' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#04050a]/90 backdrop-blur-md p-6 rounded-xl border border-red-500/30 overflow-hidden">
              <img
                src={`${cleanBase}splash.jpg`}
                alt="HUHCAT"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-20 blur-sm pointer-events-none"
              />
              <div className="relative z-10 max-w-sm w-full text-center">
                <div className="w-20 h-20 mx-auto rounded-full p-1 bg-red-500/20 border-2 border-red-500 mb-3 flex items-center justify-center shadow-[0_0_30px_rgba(255,59,92,0.4)]">
                  <img src={`${cleanBase}cat_dead.png`} alt="Defeated" className="w-full h-full rounded-full object-cover" />
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold font-syne text-red-500 mb-1 tracking-tight">
                  MISSION FAILED
                </h2>
                <p className="text-xs font-mono text-zinc-400 mb-4">Ben Cat overloaded by robo-mice swarm.</p>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#0d111c]/90 border border-white/10 rounded-xl p-3 mb-5 font-mono text-xs backdrop-blur-md">
                  <div className="p-2 bg-black/50 rounded-lg">
                    <span className="text-zinc-500 block">FINAL SCORE</span>
                    <span className="text-lg font-bold text-[#39ff88]">{score}</span>
                  </div>
                  <div className="p-2 bg-black/50 rounded-lg">
                    <span className="text-zinc-500 block">DISTANCE</span>
                    <span className="text-lg font-bold text-purple-400">{Math.floor(gameStateRef.current.distance)}m</span>
                  </div>
                  <div className="p-2 bg-black/50 rounded-lg">
                    <span className="text-zinc-500 block">MICE DELETED</span>
                    <span className="text-lg font-bold text-cyan-400">{gameStateRef.current.mice.filter(m => !m.isAlive).length}</span>
                  </div>
                  <div className="p-2 bg-black/50 rounded-lg">
                    <span className="text-zinc-500 block">TOTAL "HUH"s</span>
                    <span className="text-lg font-bold text-yellow-400">{huhCount}</span>
                  </div>
                </div>

                {score >= highScore && score > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-mono text-xs py-1.5 px-3 rounded-lg mb-4 animate-pulse">
                    🏆 NEW HIGH SCORE RECORD! 🏆
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    onClick={restartGame}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39ff88] to-[#00d15c] text-[#001a0a] font-extrabold font-syne text-sm tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    🔄 RETRY MISSION
                  </button>

                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#229ed9]/20 hover:bg-[#229ed9]/30 text-[#229ed9] border border-[#229ed9]/40 font-mono text-xs font-bold transition-all text-center"
                  >
                    POST SCORE IN TELEGRAM
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* WIN SCREEN */}
          {gameScreen === 'win' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#04050a]/90 backdrop-blur-md p-6 rounded-xl border border-[#39ff88]/40 overflow-hidden">
              <img
                src={`${cleanBase}splash.jpg`}
                alt="HUHCAT"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-25 blur-sm pointer-events-none"
              />
              <div className="relative z-10 max-w-sm w-full text-center">
                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#39ff88] to-yellow-400 pulse-emerald mb-3">
                  <img src={`${cleanBase}cat_idle.png`} alt="Victory" className="w-full h-full rounded-full object-cover" />
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold font-syne grad-text mb-1">
                  ON-CHAIN LEGEND!
                </h2>
                <p className="text-xs font-mono text-[#39ff88] mb-4">Mice cleared. Blockchain secured in Ben Cat's name.</p>

                <div className="bg-[#0d111c]/90 border border-white/10 rounded-xl p-3 mb-5 font-mono text-xs text-left space-y-1 backdrop-blur-md">
                  <div className="flex justify-between"><span className="text-zinc-400">SCORE:</span><span className="text-[#39ff88] font-bold">{score}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">TOTAL HUHs:</span><span className="text-yellow-400 font-bold">{huhCount} 🗣️</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">STATUS:</span><span className="text-cyan-400 font-bold">100% INSCRIBED</span></div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={restartGame}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39ff88] to-[#00d15c] text-[#001a0a] font-extrabold font-syne text-sm tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    🎮 PLAY AGAIN
                  </button>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#229ed9]/20 hover:bg-[#229ed9]/30 text-[#229ed9] border border-[#229ed9]/40 font-mono text-xs font-bold text-center"
                  >
                    CELEBRATE IN TELEGRAM
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE TOUCH CONTROLS OVERLAY */}
          {gameScreen === 'playing' && (
            <div className="md:hidden absolute bottom-2.5 left-2.5 right-2.5 flex justify-between pointer-events-none z-10">
              <div className="flex gap-2 pointer-events-auto">
                <button
                  className="w-13 h-13 rounded-xl bg-[#0d111c]/85 border border-white/20 active:border-[#39ff88] active:bg-[#39ff88]/25 flex items-center justify-center text-xl font-bold font-mono text-white backdrop-blur-md shadow-lg select-none"
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current.left = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current.left = false; }}
                >
                  ◀
                </button>
                <button
                  className="w-13 h-13 rounded-xl bg-[#0d111c]/85 border border-white/20 active:border-[#39ff88] active:bg-[#39ff88]/25 flex items-center justify-center text-xl font-bold font-mono text-white backdrop-blur-md shadow-lg select-none"
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current.right = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current.right = false; }}
                >
                  ▶
                </button>
              </div>

              <button
                className="w-16 h-13 rounded-xl bg-gradient-to-r from-[#39ff88] to-[#00d15c] active:opacity-80 flex flex-col items-center justify-center text-[#001a0a] font-syne font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,136,0.5)] pointer-events-auto select-none"
                onTouchStart={(e) => {
                  e.preventDefault();
                  keysRef.current.up = true;
                  keysRef.current.jump = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  keysRef.current.up = false;
                  keysRef.current.jump = false;
                }}
              >
                <span>🐾</span>
                <span>JUMP</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* VIRAL TOKEN & COMMUNITY CONVERSION HUB (BELOW IN-GAME SCREEN) */}
      <section className="w-full max-w-[940px] px-3 py-3 flex flex-col items-center gap-3 z-20">
        
        {/* ROW 1: DUAL HIGH-CONVERSION ACTION BUTTONS */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Button 1: Buy $HUHCAT on Pumpfun */}
          <a
            href={PUMPFUN_URL}
            target="_blank"
            rel="noreferrer"
            className="group relative flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#14F195]/20 via-[#9945ff]/20 to-[#14F195]/20 hover:from-[#14F195]/30 hover:to-[#9945ff]/30 border border-[#14F195]/50 hover:border-[#14F195] transition-all hover:scale-[1.02] active:scale-[0.99] shadow-[0_0_25px_rgba(20,241,149,0.15)] overflow-hidden cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14F195]/20 border border-[#14F195]/40 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🚀
              </div>
              <div className="text-left">
                <div className="font-syne font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-1.5">
                  <span>BUY $HUHCAT ON PUMPFUN</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#14F195] text-black font-bold font-mono uppercase animate-pulse">
                    HOT
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-[#14F195] tracking-tight">
                  🎁 Get FREE Solana Just for Holding!
                </div>
              </div>
            </div>
            <span className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all text-base font-bold">
              ➔
            </span>
          </a>

          {/* Button 2: Official Website */}
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noreferrer"
            className="group relative flex items-center justify-between p-3.5 rounded-xl bg-[#0d111c]/90 hover:bg-[#111728] border border-white/15 hover:border-[#39ff88]/60 transition-all hover:scale-[1.02] active:scale-[0.99] shadow-lg overflow-hidden backdrop-blur-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#39ff88]/15 border border-[#39ff88]/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🌐
              </div>
              <div className="text-left">
                <div className="font-syne font-extrabold text-sm sm:text-base text-white tracking-wide">
                  OFFICIAL WEBSITE
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  Explore Lore, Videos &amp; Tokenomics
                </div>
              </div>
            </div>
            <span className="text-zinc-400 group-hover:text-[#39ff88] group-hover:translate-x-1 transition-all text-base font-bold">
              ➔
            </span>
          </a>
        </div>

        {/* ROW 2: CENTERED CONTRACT ADDRESS (CA) CARD */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0d111c]/90 border border-[#39ff88]/35 backdrop-blur-md shadow-xl">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#39ff88]/20 text-[#39ff88] border border-[#39ff88]/40">
              SOLANA V1 CA
            </span>
            <span className="font-mono text-xs text-zinc-200 select-all font-semibold tracking-wider">
              {OFFICIAL_CA}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCA}
              className="px-3 py-1 rounded-lg bg-[#39ff88] hover:bg-[#00ff87] text-[#001a0a] font-mono text-xs font-black tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(57,255,136,0.4)] hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <span>{copiedCA ? '✓' : '📋'}</span>
              <span>{copiedCA ? 'COPIED!' : 'COPY CA'}</span>
            </button>
            <a
              href={DEXSCREENER_URL}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all"
              title="View on DexScreener"
            >
              CHART
            </a>
          </div>
        </div>

        {/* ROW 3: TELEGRAM GROUP & VIRAL SHARE ON X BUTTONS */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Telegram Chat Group */}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#229ed9]/20 hover:bg-[#229ed9]/30 text-[#229ed9] border border-[#229ed9]/50 font-mono text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md text-center"
          >
            <span className="text-base">✈️</span>
            <span>JOIN OFFICIAL TG CHAT</span>
          </a>

          {/* Viral 1-Click Share on X (Twitter) */}
          <button
            onClick={handleShareOnX}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-zinc-800 to-black hover:from-black hover:to-zinc-900 text-white border border-white/25 hover:border-white font-mono text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer"
            title="Share your score and game on X (Twitter)"
          >
            <span className="font-sans text-sm font-bold">𝕏</span>
            <span>SHARE ON X (TWITTER)</span>
          </button>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="w-full z-20 py-2 px-4 text-center font-mono text-[11px] text-zinc-500 border-t border-white/5 bg-[#04050a]/90 flex flex-col sm:flex-row items-center justify-between gap-1">
        <p>$HUHCAT — The First Inscribed Image on Solana Mainnet V1</p>
        <div className="flex items-center gap-3">
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer" className="text-[#39ff88] hover:underline">Official Site</a>
          <span>•</span>
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="text-[#229ed9] hover:underline">Telegram</a>
          <span>•</span>
          <a href={PUMPFUN_URL} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Pump.fun</a>
        </div>
      </footer>
    </div>
  );
}
