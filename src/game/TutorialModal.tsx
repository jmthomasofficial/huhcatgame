import React, { useState } from 'react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'combat' | 'orangie' | 'zones'>('basics');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0d111c] border-2 border-[#39ff88]/50 rounded-2xl shadow-[0_0_50px_rgba(57,255,136,0.3)] flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-[#111728] border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">📖</span>
            <div>
              <h2 className="font-syne font-black text-base sm:text-xl text-white tracking-wider flex items-center gap-2">
                HOW TO PLAY & OFFICIAL GUIDE
              </h2>
              <p className="font-mono text-[10px] sm:text-xs text-zinc-400">
                Master the moves, combat combos, Orangie powerups & Solana secrets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            title="Close Tutorial"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#090d16] px-2 sm:px-4 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('basics')}
            className={`px-3 py-2 sm:py-2.5 font-mono text-[11px] sm:text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'basics'
                ? 'text-[#39ff88] border-[#39ff88] bg-[#39ff88]/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>🎮</span>
            <span>Controls & Basics</span>
          </button>

          <button
            onClick={() => setActiveTab('combat')}
            className={`px-3 py-2 sm:py-2.5 font-mono text-[11px] sm:text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'combat'
                ? 'text-yellow-400 border-yellow-400 bg-yellow-400/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>💥</span>
            <span>Combat & Combos</span>
          </button>

          <button
            onClick={() => setActiveTab('orangie')}
            className={`px-3 py-2 sm:py-2.5 font-mono text-[11px] sm:text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orangie'
                ? 'text-[#ff8c00] border-[#ff8c00] bg-[#ff8c00]/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>🐧</span>
            <span>Orangie & Powerups</span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`px-3 py-2 sm:py-2.5 font-mono text-[11px] sm:text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'zones'
                ? 'text-[#9945ff] border-[#9945ff] bg-[#9945ff]/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>🗺️</span>
            <span>Zones & Seeds</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto font-mono text-xs sm:text-sm text-zinc-300 space-y-4">
          {/* TAB 1: CONTROLS & BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#111728] border border-white/10 rounded-xl p-3 sm:p-4 space-y-3">
                <h3 className="font-syne font-bold text-sm sm:text-base text-[#39ff88] flex items-center gap-2">
                  <span>🕹️</span> DESKTOP KEYBOARD CONTROLS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-zinc-400">Run Left / Right</span>
                    <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded">A / D or ⬅️ / ➡️</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-zinc-400">Jump</span>
                    <span className="text-[#39ff88] font-bold bg-zinc-800 px-2 py-0.5 rounded">SPACE or ⬆️</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-zinc-400">Variable Jump</span>
                    <span className="text-yellow-300 font-bold">Tap = Hop · Hold = Full Height</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-zinc-400">Coyote Time</span>
                    <span className="text-cyan-300 font-bold">Can still jump 6 frames off ledge!</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111728] border border-white/10 rounded-xl p-3 sm:p-4 space-y-2">
                <h3 className="font-syne font-bold text-sm sm:text-base text-cyan-300 flex items-center gap-2">
                  <span>📱</span> MOBILE TOUCH CONTROLS
                </h3>
                <p className="text-xs text-zinc-300">
                  On mobile phones and tablets, a full glassmorphic d-pad appears automatically:
                </p>
                <ul className="list-disc list-inside text-xs space-y-1 text-zinc-400">
                  <li>Hold the <strong className="text-white">◀ / ▶</strong> buttons on the left thumb to run.</li>
                  <li>Tap the large <strong className="text-[#39ff88]">JUMP ⬆</strong> button on the right thumb.</li>
                  <li>You can also tap anywhere on the game screen to jump!</li>
                </ul>
              </div>

              <div className="bg-[#111728] border border-white/10 rounded-xl p-3 sm:p-4 space-y-2">
                <h3 className="font-syne font-bold text-sm sm:text-base text-purple-300 flex items-center gap-2">
                  <span>☁️</span> ONE-WAY CLOUD PLATFORMS (SEMI-SOLID)
                </h3>
                <p className="text-xs text-zinc-300">
                  The floating purple oval platforms are <strong className="text-purple-300">clouds</strong>! You can jump straight <strong className="text-white">UP through them from below</strong> without bonking your head or getting blocked. You only land on them when falling downward!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COMBAT & COMBOS */}
          {activeTab === 'combat' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#111728] border border-yellow-500/20 rounded-xl p-3 sm:p-4 space-y-3">
                <h3 className="font-syne font-bold text-sm sm:text-base text-yellow-300 flex items-center gap-2">
                  <span>🐭</span> STOMP ROBO-MICE FOR AUTHENTIC "HUH!"
                </h3>
                <p className="text-xs text-zinc-300">
                  Jump directly on top of robo-mice to squish them. Ben Cat roars with the official on-chain vocalization: <span className="text-yellow-400 font-black">"HUH!"</span>
                </p>
                <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-200">
                  ⚡ <strong>HITSTOP FEEL</strong>: Stomping an enemy triggers a 3-frame impact freeze so every hit feels punchy!
                </div>
              </div>

              <div className="bg-[#111728] border border-white/10 rounded-xl p-3 sm:p-4 space-y-3">
                <h3 className="font-syne font-bold text-sm sm:text-base text-[#39ff88] flex items-center gap-2">
                  <span>🔥</span> COMBO STREAKS & SPEED BOOST
                </h3>
                <p className="text-xs text-zinc-300">
                  Chain consecutive mouse stomps without touching the ground to build your combo multiplier:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-black/40 border border-white/10">
                    <div className="font-bold text-white">2× Combo</div>
                    <div className="text-[#39ff88]">+10% Speed</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/10">
                    <div className="font-bold text-white">4× Combo</div>
                    <div className="text-[#39ff88]">+20% Speed</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/10">
                    <div className="font-bold text-white">6× MAX COMBO</div>
                    <div className="text-yellow-400 font-bold">+30% Speed</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#111728] border border-white/10 rounded-xl p-3 sm:p-4 space-y-2">
                <h3 className="font-syne font-bold text-sm sm:text-base text-pink-300 flex items-center gap-2">
                  <span>🧱</span> SMASH BRICKS & [ ? ] QUESTION BLOCKS
                </h3>
                <p className="text-xs text-zinc-300">
                  Jump into overhead brick rows from below! Smashing a brick instantly KO's any robo-mouse patrolling on top of it for <strong>200 bonus points</strong>!
                </p>
                <p className="text-xs text-zinc-400">
                  Hit glowing <strong>[ ? ] question blocks</strong> to collect secret coins and points!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ORANGIE & POWERUPS */}
          {activeTab === 'orangie' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#111728] border border-orange-500/30 rounded-xl p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐧</span>
                  <div>
                    <h3 className="font-syne font-bold text-sm sm:text-base text-[#ff8c00]">
                      MEET ORANGIE THE PENGUIN
                    </h3>
                    <p className="text-xs text-zinc-400">
                      The legendary Solana companion in the orange beanie and black hoodie!
                    </p>
                  </div>
                </div>
                <p className="text-xs text-zinc-300">
                  Orangie waits at <strong className="text-white">peaceful Shrines</strong> and along platforms. Touch Orangie to claim his blessing!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#111728] border border-blue-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-300 text-sm">
                    <span>⬆️⬆️</span> DOUBLE JUMP (30s)
                  </div>
                  <p className="text-zinc-400">
                    Press Jump again in mid-air! Soar over giant chasms and reach high elevated ledges effortlessly.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#111728] border border-red-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-400 text-sm">
                    <span>❤️</span> +1 EXTRA LIFE
                  </div>
                  <p className="text-zinc-400">
                    Instantly restores one of your lost lives (capped at 9 lives max).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#111728] border border-yellow-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-yellow-300 text-sm">
                    <span>🛡️</span> INVINCIBILITY SHIELD (8s)
                  </div>
                  <p className="text-zinc-400">
                    Surrounded by a celestial shield. Walk straight through robo-mice without taking any damage!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#111728] border border-purple-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300 text-sm">
                    <span>⚡</span> 2× SCORE MULTIPLIER (20s)
                  </div>
                  <p className="text-zinc-400">
                    Doubles all points earned from coins, stomps, question blocks, and brick smashes!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#111728] border border-cyan-500/30 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-sm">
                    <span>🧲</span> COIN MAGNET (15s)
                  </div>
                  <p className="text-zinc-400">
                    Draws all nearby holographic fish and Solana gold coins straight to you like a tractor beam!
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 border border-orange-500/40 rounded-xl p-3 sm:p-4 space-y-2">
                <h3 className="font-syne font-bold text-sm sm:text-base text-yellow-300 flex items-center gap-2">
                  <span>☀️</span> THE 9TH LIFE DIVINE RESCUE
                </h3>
                <p className="text-xs text-zinc-200">
                  If you run out of all 9 lives, <strong className="text-orange-400">Orangie descends from a celestial rotating sun</strong> in a full cutscene with golden starbursts, proclaiming:
                </p>
                <div className="text-center font-black text-yellow-300 tracking-wider text-sm py-1 bg-black/40 rounded border border-yellow-500/30">
                  "ORANGIE BELIEVES IN YOU" — +1 LIFE RESTORED
                </div>
                <p className="text-[11px] text-zinc-400 text-center">
                  You respawn on safe ground with 3 seconds of invulnerability (once per run).
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ZONES & SEEDS */}
          {activeTab === 'zones' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#111728] border border-white/10 rounded-xl p-3 sm:p-4 space-y-3">
                <h3 className="font-syne font-bold text-sm sm:text-base text-purple-300 flex items-center gap-2">
                  <span>🗺️</span> 4 PROCEDURAL DIFFICULTY ZONES
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <strong className="text-[#39ff88]">ZONE 1: RUNWAY</strong> (0–2000m)
                    </div>
                    <span className="text-zinc-400">Wide platforms · Slow mice</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <strong className="text-purple-300">ZONE 2: SOLANA</strong> (2000–5000m)
                    </div>
                    <span className="text-zinc-400">Moving platforms · Stepped hills</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                    <div>
                      <strong className="text-red-400">ZONE 3: DANGER</strong> (5000–8000m)
                    </div>
                    <span className="text-zinc-400">Big mice · Precision pits</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between">
                    <div>
                      <strong className="text-yellow-300">ZONE 4: GAUNTLET</strong> (8000m+)
                    </div>
                    <span className="text-zinc-400">Dense enemies · Victory runway</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111728] border border-white/10 rounded-xl p-3 sm:p-4 space-y-2">
                <h3 className="font-syne font-bold text-sm sm:text-base text-cyan-300 flex items-center gap-2">
                  <span>🎲</span> SPEEDRUN SEEDS & COMMUNITY CHALLENGES
                </h3>
                <p className="text-xs text-zinc-300">
                  Every level generation is deterministic using a random Seed.
                </p>
                <p className="text-xs text-zinc-400">
                  When your run finishes, click <strong className="text-white">📋 Copy Seed</strong> on the Game Over screen and share it in Telegram or Twitter to challenge other players to the exact same obstacle course!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 bg-[#111728] border-t border-white/10 flex items-center justify-between">
          <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">
            Press [ESC] or [H] anytime to close
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-[#39ff88] to-[#00d15c] text-[#001a0a] font-black font-syne text-xs sm:text-sm tracking-wider hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-lg"
          >
            LET'S PLAY! ▶
          </button>
        </div>
      </div>
    </div>
  );
}
