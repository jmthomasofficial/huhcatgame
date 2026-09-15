import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Keys } from './types';
import { createInitialState, update } from './engine';
import { render } from './renderer';
import { initAudio } from './audio';

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

  const startGame = useCallback(() => {
    initAudio();
    gameStateRef.current = createInitialState();
    setGameScreen('playing');
    setHuhCount(0);
  }, []);

  const restartGame = useCallback(() => {
    initAudio();
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
          if (gameScreen === 'playing') {
            setHuhCount(c => c + 1);
          }
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

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const halfWidth = rect.width / 2;
      
      // Tap to jump
      keysRef.current.up = true;
      keysRef.current.jump = true;
      if (gameScreen === 'playing') {
        setHuhCount(c => c + 1);
      }
      
      // Left/right based on touch position
      if (x < halfWidth * 0.4) {
        keysRef.current.left = true;
      } else if (x > halfWidth * 1.6) {
        keysRef.current.right = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const halfWidth = rect.width / 2;
      
      keysRef.current.left = false;
      keysRef.current.right = false;
      
      if (x < halfWidth * 0.4) {
        keysRef.current.left = true;
      } else if (x > halfWidth * 1.6) {
        keysRef.current.right = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
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
      update(state, keysRef.current, dt);

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
      canvas.width = Math.min(900, container.clientWidth);
      canvas.height = Math.min(600, container.clientHeight);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a001a] via-[#1a0533] to-[#2d1b69] overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-10 animate-pulse"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          >
            {['🐱', '🐭', '⭐', '💰', '🔥'][i % 5]}
          </div>
        ))}
      </div>

      {/* Title Screen */}
      {gameScreen === 'title' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-b from-[#0a001a]/95 via-[#1a0533]/95 to-[#2d1b69]/95">
          <div className="text-center px-4">
            {/* Logo */}
            <div className="mb-4 animate-bounce">
              <span className="text-7xl md:text-8xl">🐱</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 mb-2"
              style={{ fontFamily: '"Comic Sans MS", cursive', textShadow: '0 0 30px rgba(255,140,0,0.5)' }}>
              HUHCAT
            </h1>
            <p className="text-xl md:text-2xl text-purple-300 mb-2" style={{ fontFamily: '"Comic Sans MS", cursive' }}>
              The Game 🎮
            </p>
            <p className="text-sm text-purple-400 mb-8 max-w-md mx-auto">
              Jump on mice. Say HUH. Collect fish. Become legend.
            </p>
            
            {/* Instructions */}
            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-purple-500/30 max-w-sm mx-auto">
              <p className="text-yellow-300 font-bold mb-2">🎮 CONTROLS</p>
              <div className="text-sm text-purple-200 space-y-1">
                <p>⬅️ ➡️ Arrow Keys / A,D — Move</p>
                <p>⬆️ Space / W — Jump (says HUH!)</p>
                <p>🐭 Jump on mice to stomp them!</p>
                <p>🐟 Collect fish coins for points</p>
                <p>❓ Hit ? blocks from below</p>
                <p>🔥 Chain stomps for COMBOS!</p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl font-black rounded-full 
                hover:scale-110 transition-transform duration-200 shadow-lg shadow-orange-500/50
                animate-pulse hover:animate-none"
              style={{ fontFamily: '"Comic Sans MS", cursive' }}
            >
              🎮 PLAY NOW! 🐱
            </button>
            
            <p className="text-xs text-purple-500 mt-4">Press SPACE or ENTER to start</p>
            
            {highScore > 0 && (
              <p className="text-yellow-400 mt-3 text-sm">🏆 High Score: {highScore}</p>
            )}
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative w-full max-w-[900px] h-[600px] mx-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-900/50"
          style={{ imageRendering: 'auto' }}
        />
        
        {/* Mobile touch controls overlay */}
        <div className="md:hidden absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <button
              className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm active:bg-white/40"
              onTouchStart={() => { keysRef.current.left = true; }}
              onTouchEnd={() => { keysRef.current.left = false; }}
            >
              ⬅️
            </button>
            <button
              className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm active:bg-white/40"
              onTouchStart={() => { keysRef.current.right = true; }}
              onTouchEnd={() => { keysRef.current.right = false; }}
            >
              ➡️
            </button>
          </div>
          <button
            className="w-16 h-16 bg-orange-500/40 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm active:bg-orange-500/70 pointer-events-auto"
            onTouchStart={() => { 
              keysRef.current.up = true; 
              keysRef.current.jump = true;
              setHuhCount(c => c + 1);
            }}
            onTouchEnd={() => { 
              keysRef.current.up = false; 
              keysRef.current.jump = false; 
            }}
          >
            🐱
          </button>
        </div>
      </div>

      {/* HUH Counter */}
      {gameScreen === 'playing' && huhCount > 0 && (
        <div className="absolute top-4 right-4 bg-black/60 rounded-lg px-3 py-1 border border-orange-500/50">
          <span className="text-orange-400 font-bold text-sm" style={{ fontFamily: '"Comic Sans MS", cursive' }}>
            HUH count: {huhCount} 🗣️
          </span>
        </div>
      )}

      {/* Game Over Screen */}
      {gameScreen === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
          <div className="text-center px-4">
            <div className="text-6xl mb-4">😿</div>
            <h2 className="text-4xl md:text-5xl font-black text-red-400 mb-4" style={{ fontFamily: '"Comic Sans MS", cursive' }}>
              GAME OVER
            </h2>
            <p className="text-2xl text-yellow-300 mb-2">Score: {score}</p>
            <p className="text-lg text-purple-300 mb-1">Distance: {Math.floor(gameStateRef.current.distance)}m</p>
            <p className="text-lg text-orange-300 mb-1">Mice stomped: {gameStateRef.current.mice.filter(m => !m.isAlive).length} 🐭</p>
            <p className="text-sm text-purple-400 mb-1">Total HUHs: {huhCount}</p>
            {score >= highScore && score > 0 && (
              <p className="text-xl text-yellow-400 animate-pulse mb-4">🏆 NEW HIGH SCORE! 🏆</p>
            )}
            <p className="text-sm text-purple-400 mb-4">Best: {highScore}</p>
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-lg font-black rounded-full 
                hover:scale-110 transition-transform duration-200 shadow-lg shadow-orange-500/50"
              style={{ fontFamily: '"Comic Sans MS", cursive' }}
            >
              🔄 TRY AGAIN
            </button>
            <p className="text-xs text-purple-500 mt-3">Press SPACE to restart</p>
          </div>
        </div>
      )}

      {/* Win Screen */}
      {gameScreen === 'win' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
          <div className="text-center px-4">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4" 
              style={{ fontFamily: '"Comic Sans MS", cursive' }}>
              YOU WIN!
            </h2>
            <p className="text-xl text-yellow-300 mb-2">Score: {score}</p>
            <p className="text-lg text-purple-300 mb-1">Mice stomped: {gameStateRef.current.mice.filter(m => !m.isAlive).length} 🐭</p>
            <p className="text-lg text-orange-300 mb-1">Total HUHs: {huhCount} 🗣️</p>
            {score >= highScore && (
              <p className="text-xl text-yellow-400 animate-pulse mb-4">🏆 HIGH SCORE! 🏆</p>
            )}
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-black rounded-full 
                hover:scale-110 transition-transform duration-200 shadow-lg shadow-green-500/50 mt-4"
              style={{ fontFamily: '"Comic Sans MS", cursive' }}
            >
              🎮 PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-2 text-center text-xs text-purple-600">
        <p>$HUHCAT — The First Inscribed Image on Solana 🐱</p>
      </div>
    </div>
  );
}
