import { GameState, Keys, Player, Particle, HuhText } from './types';
import { generateLevel } from './levelGenerator';
import { playHuhSound, playStompSound, playCoinSound, playJumpSound, playDeathSound, playComboSound } from './audio';

const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const MOVE_SPEED = 4;
const MAX_FALL_SPEED = 12;
const FRICTION = 0.85;

export function createInitialState(): GameState {
  const { platforms, mice, coins, levelLength } = generateLevel(Date.now());
  
  return {
    player: {
      x: 100,
      y: 400,
      width: 40,
      height: 50,
      vx: 0,
      vy: 0,
      isJumping: false,
      isOnGround: false,
      facing: 'right',
      frame: 0,
      frameTimer: 0,
      isStomping: false,
      invincible: 0,
      lives: 3,
      score: 0,
      combo: 0,
      comboTimer: 0,
    },
    mice,
    platforms,
    coins,
    particles: [],
    huhTexts: [],
    camera: { x: 0, y: 0 },
    levelLength,
    gameOver: false,
    gameWon: false,
    paused: false,
    screenShake: 0,
    time: 0,
    distance: 0,
    highScore: parseInt(localStorage.getItem('huhcat_highscore') || '0'),
  };
}

export function update(state: GameState, keys: Keys, dt: number): GameState {
  if (state.gameOver || state.gameWon || state.paused) return state;
  
  state.time += dt;
  
  // Update player
  updatePlayer(state, keys, dt);
  
  // Update mice
  updateMice(state, dt);
  
  // Update platforms
  updatePlatforms(state, dt);
  
  // Update coins
  updateCoins(state, dt);
  
  // Update particles
  updateParticles(state, dt);
  
  // Update HUH texts
  updateHuhTexts(state, dt);
  
  // Update camera
  updateCamera(state);
  
  // Update screen shake
  if (state.screenShake > 0) {
    state.screenShake -= dt * 5;
    if (state.screenShake < 0) state.screenShake = 0;
  }
  
  // Update combo timer
  if (state.player.comboTimer > 0) {
    state.player.comboTimer -= dt;
    if (state.player.comboTimer <= 0) {
      state.player.combo = 0;
    }
  }
  
  // Update distance
  state.distance = Math.max(state.distance, state.player.x / 50);
  
  // Check win condition
  if (state.player.x > state.levelLength - 100) {
    state.gameWon = true;
    state.player.score += 1000;
    if (state.player.score > state.highScore) {
      state.highScore = state.player.score;
      localStorage.setItem('huhcat_highscore', state.highScore.toString());
    }
  }
  
  // Check death by falling
  if (state.player.y > 700) {
    playerDie(state);
  }
  
  return state;
}

function updatePlayer(state: GameState, keys: Keys, dt: number) {
  const player = state.player;
  
  // Horizontal movement
  if (keys.left) {
    player.vx -= MOVE_SPEED * 0.3;
    player.facing = 'left';
  }
  if (keys.right) {
    player.vx += MOVE_SPEED * 0.3;
    player.facing = 'right';
  }
  
  // Apply friction
  player.vx *= FRICTION;
  
  // Clamp horizontal speed
  if (Math.abs(player.vx) > MOVE_SPEED) {
    player.vx = Math.sign(player.vx) * MOVE_SPEED;
  }
  if (Math.abs(player.vx) < 0.1) player.vx = 0;
  
  // Jump
  if ((keys.up || keys.jump) && player.isOnGround && !player.isJumping) {
    player.vy = JUMP_FORCE;
    player.isJumping = true;
    player.isOnGround = false;
    player.isStomping = false;
    playJumpSound();
    spawnHuhText(state, player.x + player.width / 2, player.y - 10);
    playHuhSound(0.8 + Math.random() * 0.4);
    spawnDustParticles(state, player.x + player.width / 2, player.y + player.height);
  }
  
  // Gravity
  player.vy += GRAVITY;
  if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
  
  // Move player
  player.x += player.vx;
  player.y += player.vy;
  
  // Platform collision
  player.isOnGround = false;
  
  for (const platform of state.platforms) {
    if (checkPlayerPlatformCollision(player, platform)) {
      // Landing on top
      if (player.vy > 0 && player.y + player.height - player.vy <= platform.y + 5) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.isOnGround = true;
        player.isJumping = false;
        
        // Moving platform carry
        if (platform.type === 'moving' && platform.originX !== undefined) {
          player.x += (platform.moveDir || 0) * 1.5;
        }
      }
      // Hitting from below
      else if (player.vy < 0 && player.y - player.vy >= platform.y + platform.height - 5) {
        player.y = platform.y + platform.height;
        player.vy = 1;
        
        // Hit question block
        if (platform.type === 'question' && !platform.hit) {
          platform.hit = true;
          state.player.score += 100;
          playCoinSound();
          spawnCoinParticles(state, platform.x + platform.width / 2, platform.y - 20);
          state.screenShake = 2;
        }
        // Hit brick
        if (platform.type === 'brick') {
          state.screenShake = 1;
          spawnDustParticles(state, player.x + player.width / 2, platform.y + platform.height);
        }
      }
      // Side collision
      else {
        if (player.vx > 0) {
          player.x = platform.x - player.width;
        } else if (player.vx < 0) {
          player.x = platform.x + platform.width;
        }
        player.vx = 0;
      }
    }
  }
  
  // Mouse collision
  for (const mouse of state.mice) {
    if (!mouse.isAlive) continue;
    
    if (checkPlayerMouseCollision(player, mouse)) {
      // Stomping from above
      if (player.vy > 0 && player.y + player.height < mouse.y + mouse.height * 0.6) {
        // Stomp the mouse!
        mouse.isAlive = false;
        mouse.squishTimer = 2;
        player.vy = JUMP_FORCE * 0.6; // Bounce
        player.isStomping = true;
        
        // Score and combo
        state.player.combo++;
        state.player.comboTimer = 2;
        const comboMultiplier = Math.min(state.player.combo, 10);
        const points = (mouse.type === 'big' ? 300 : mouse.type === 'fast' ? 200 : 100) * comboMultiplier;
        state.player.score += points;
        
        playStompSound();
        playHuhSound(1 + state.player.combo * 0.1);
        if (state.player.combo > 1) playComboSound(state.player.combo);
        
        state.screenShake = 3;
        
        // Spawn effects
        spawnStompParticles(state, mouse.x + mouse.width / 2, mouse.y);
        spawnHuhText(state, player.x + player.width / 2, player.y - 20, 
          state.player.combo > 1 ? `HUH x${state.player.combo}!` : 'HUH!');
        
      } else if (player.invincible <= 0) {
        // Hit by mouse
        playerDie(state);
      }
    }
  }
  
  // Coin collection
  for (const coin of state.coins) {
    if (coin.collected) continue;
    
    if (checkPlayerCoinCollision(player, coin)) {
      coin.collected = true;
      const points = coin.type === 'golden' ? 500 : 50;
      state.player.score += points;
      playCoinSound();
      spawnCoinParticles(state, coin.x + coin.width / 2, coin.y + coin.height / 2);
    }
  }
  
  // Invincibility timer
  if (player.invincible > 0) {
    player.invincible -= dt;
  }
  
  // Stomp animation timer
  if (player.isStomping && player.isOnGround) {
    player.isStomping = false;
  }
  
  // Animation
  player.frameTimer += dt * 60;
  if (player.frameTimer > 8) {
    player.frame = (player.frame + 1) % 4;
    player.frameTimer = 0;
  }
  
  // Keep player in bounds
  if (player.x < 0) player.x = 0;
}

function updateMice(state: GameState, dt: number) {
  for (const mouse of state.mice) {
    if (!mouse.isAlive) {
      if (mouse.squishTimer > 0) {
        mouse.squishTimer -= dt;
      }
      continue;
    }
    
    mouse.x += mouse.vx;
    mouse.frameTimer += dt * 60;
    
    // Check if mouse is on a platform
    let onPlatform = false;
    for (const platform of state.platforms) {
      if (mouse.x + mouse.width > platform.x && mouse.x < platform.x + platform.width &&
          Math.abs(mouse.y + mouse.height - platform.y) < 5) {
        onPlatform = true;
        
        // Turn around at platform edges
        if (mouse.x <= platform.x + 5 || mouse.x + mouse.width >= platform.x + platform.width - 5) {
          mouse.vx = -mouse.vx;
          mouse.direction = Math.sign(mouse.vx);
        }
      }
    }
    
    // Simple gravity for mice not on platforms
    if (!onPlatform) {
      mouse.y += 3;
      // Remove if fallen off screen
      if (mouse.y > 700) {
        mouse.isAlive = false;
      }
    }
  }
}

function updatePlatforms(state: GameState, dt: number) {
  for (const platform of state.platforms) {
    if (platform.type === 'moving' && platform.originX !== undefined) {
      platform.x += (platform.moveDir || 1) * 1.5;
      if (platform.x > platform.originX + (platform.moveRange || 60) ||
          platform.x < platform.originX - (platform.moveRange || 60)) {
        platform.moveDir = -(platform.moveDir || 1);
      }
    }
  }
}

function updateCoins(state: GameState, dt: number) {
  for (const coin of state.coins) {
    coin.frameTimer += dt * 60;
  }
}

function updateParticles(state: GameState, dt: number) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= dt;
    if (p.rotation !== undefined) p.rotation += 0.1;
    
    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

function updateHuhTexts(state: GameState, dt: number) {
  for (let i = state.huhTexts.length - 1; i >= 0; i--) {
    const h = state.huhTexts[i];
    h.y += h.vy;
    h.vy -= 0.5;
    h.life -= dt;
    
    if (h.life <= 0) {
      state.huhTexts.splice(i, 1);
    }
  }
}

function updateCamera(state: GameState) {
  const targetX = state.player.x - 350;
  const targetY = Math.min(state.player.y - 300, 200);
  
  state.camera.x += (targetX - state.camera.x) * 0.08;
  state.camera.y += (targetY - state.camera.y) * 0.05;
  
  if (state.camera.x < 0) state.camera.x = 0;
  if (state.camera.y > 200) state.camera.y = 200;
  if (state.camera.y < -100) state.camera.y = -100;
}

function playerDie(state: GameState) {
  state.player.lives--;
  playDeathSound();
  state.screenShake = 5;
  
  if (state.player.lives <= 0) {
    state.gameOver = true;
    if (state.player.score > state.highScore) {
      state.highScore = state.player.score;
      localStorage.setItem('huhcat_highscore', state.highScore.toString());
    }
  } else {
    // Respawn
    state.player.x = Math.max(0, state.camera.x + 100);
    state.player.y = 300;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.invincible = 2;
    state.player.combo = 0;
    
    // Spawn HUH texts for death
    for (let i = 0; i < 5; i++) {
      spawnHuhText(state, 
        state.player.x + Math.random() * 60 - 30, 
        state.player.y + Math.random() * 60 - 30,
        'HUH?!'
      );
    }
  }
}

// Collision helpers
function checkPlayerPlatformCollision(player: Player, platform: { x: number; y: number; width: number; height: number }): boolean {
  return player.x + player.width > platform.x + 4 &&
         player.x < platform.x + platform.width - 4 &&
         player.y + player.height > platform.y &&
         player.y < platform.y + platform.height;
}

function checkPlayerMouseCollision(player: Player, mouse: { x: number; y: number; width: number; height: number }): boolean {
  return player.x + player.width > mouse.x + 4 &&
         player.x < mouse.x + mouse.width - 4 &&
         player.y + player.height > mouse.y + 4 &&
         player.y < mouse.y + mouse.height;
}

function checkPlayerCoinCollision(player: Player, coin: { x: number; y: number; width: number; height: number }): boolean {
  return player.x + player.width > coin.x &&
         player.x < coin.x + coin.width &&
         player.y + player.height > coin.y &&
         player.y < coin.y + coin.height;
}

// Particle spawners
function spawnHuhText(state: GameState, x: number, y: number, text?: string) {
  const huhVariants = ['HUH!', 'HUH?!', 'HUH??', 'HUH!!!', 'huh.', 'HUH', 'HUH?!?!', 'HUH 🐱'];
  const colors = ['#ff6600', '#ffcc00', '#ff3366', '#66ff66', '#66ccff', '#ff99ff', '#ffffff'];
  
  state.huhTexts.push({
    x,
    y,
    vy: -3,
    life: 1.5,
    maxLife: 1.5,
    scale: 1 + Math.random() * 0.5,
    text: text || huhVariants[Math.floor(Math.random() * huhVariants.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  });
}

function spawnDustParticles(state: GameState, x: number, y: number) {
  for (let i = 0; i < 5; i++) {
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3,
      life: 0.5,
      maxLife: 0.5,
      color: '#c8a86b',
      size: 3 + Math.random() * 3,
      type: 'dust',
    });
  }
}

function spawnStompParticles(state: GameState, x: number, y: number) {
  for (let i = 0; i < 8; i++) {
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      life: 0.8,
      maxLife: 0.8,
      color: ['#ff0', '#f80', '#f00', '#fff'][Math.floor(Math.random() * 4)],
      size: 4 + Math.random() * 6,
      type: 'star',
      rotation: Math.random() * Math.PI * 2,
    });
  }
  // Stomp emoji
  state.particles.push({
    x, y: y - 10,
    vx: 0, vy: -2,
    life: 0.6,
    maxLife: 0.6,
    color: '#fff',
    size: 24,
    type: 'stomp',
  });
}

function spawnCoinParticles(state: GameState, x: number, y: number) {
  for (let i = 0; i < 4; i++) {
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 5 - 2,
      life: 0.6,
      maxLife: 0.6,
      color: '#ffd700',
      size: 14 + Math.random() * 6,
      type: 'coin',
    });
  }
}
