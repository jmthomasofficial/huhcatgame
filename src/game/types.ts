export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  isJumping: boolean;
  isOnGround: boolean;
  facing: 'left' | 'right';
  frame: number;
  frameTimer: number;
  isStomping: boolean;
  invincible: number;
  lives: number;
  score: number;
  combo: number;
  comboTimer: number;
  // Game feel
  coyoteTimer: number;
  jumpBufferTimer: number;
  lastSafeX: number;
  lastSafeY: number;
  // Orangie powerups
  hasDoubleJump: boolean;
  doubleJumpUsed: boolean;
  powerupTimer: number;        // countdown for timed powerups
  activePowerup: PowerupType | null;
  speedBoost: number;          // combo-based speed multiplier (1.0 = normal)
}

export type PowerupType = 'doubleJump' | 'extraLife' | 'invincibility' | 'scoreMultiplier' | 'magnet';

export interface Orangie {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  powerup: PowerupType;
  bobTimer: number;
  // Animation state
  waveTimer: number;          // arm wave animation
  happyTimer: number;         // celebration when collected (counts down)
  flyAwayVy: number;          // upward velocity when flying away after collection
  flyingAway: boolean;
}

export interface Mouse {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  isAlive: boolean;
  frame: number;
  frameTimer: number;
  type: 'normal' | 'fast' | 'big';
  direction: number;
  squishTimer: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'brick' | 'question' | 'moving' | 'cloud';
  moveDir?: number;
  moveRange?: number;
  originX?: number;
  hit?: boolean;
  destroyed?: boolean;
  coinCollected?: boolean;
  zone?: number;  // difficulty zone (1-4) for visual theming
}

export interface Coin {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  frame: number;
  frameTimer: number;
  type: 'fish' | 'golden';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'huh' | 'star' | 'coin' | 'dust' | 'stomp' | 'brick' | 'orangie' | 'powerup';
  text?: string;
  rotation?: number;
}

export interface HuhText {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  scale: number;
  text: string;
  color: string;
}

export interface GameState {
  player: Player;
  mice: Mouse[];
  platforms: Platform[];
  coins: Coin[];
  orangies: Orangie[];
  particles: Particle[];
  huhTexts: HuhText[];
  camera: Vector2;
  levelLength: number;
  gameOver: boolean;
  gameWon: boolean;
  paused: boolean;
  screenShake: number;
  time: number;
  distance: number;
  highScore: number;
  seed: number;
  // Hitstop freeze
  hitstopFrames: number;
  // Orangie divine rescue
  orangieRescueActive: boolean;
  orangieRescueTimer: number;
  orangieRescueUsed: boolean;
  // Score multiplier from powerup
  scoreMultiplier: number;
  scoreMultiplierTimer: number;
  // Magnet powerup
  magnetActive: boolean;
  magnetTimer: number;
}

export interface Keys {
  left: boolean;
  right: boolean;
  up: boolean;
  jump: boolean;
}
