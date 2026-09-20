import { GameState, Keys, Player, Particle, HuhText, Orangie, PowerupType } from './types';
import { generateLevel } from './levelGenerator';
import { playHuhSound, playStompSound, playCoinSound, playJumpSound, playDeathSound, playComboSound, playBrickBreakSound, playVictorySound } from './audio';

const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const MOVE_SPEED = 4;
const MAX_FALL_SPEED = 12;
const FRICTION = 0.85;
const COYOTE_FRAMES = 6;
const JUMP_BUFFER_FRAMES = 6;
const HITSTOP_FRAMES = 3;

export function createInitialState(): GameState {
  const seed = Date.now();
  const { platforms, mice, coins, levelLength, orangies } = generateLevel(seed);
  let highScore = 0;
  try { highScore = parseInt(localStorage.getItem('huhcat_highscore') || '0'); } catch(e) {}
  
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
      lives: 9,
      score: 0,
      combo: 0,
      comboTimer: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      lastSafeX: 100,
      lastSafeY: 400,
      hasDoubleJump: false,
      doubleJumpUsed: false,
      powerupTimer: 0,
      activePowerup: null,
      speedBoost: 1.0,
    },
    mice,
    platforms,
    coins,
    orangies,
    particles: [],
    huhTexts: [],
    camera: { x: 0, y: 0 },
    levelLength,
    gameOver: false,
    gameWon: false,
    victoryTimer: 0,
    paused: false,
    screenShake: 0,
    time: 0,
    distance: 0,
    highScore,
    seed,
    hitstopFrames: 0,
    orangieRescueActive: false,
    orangieRescueTimer: 0,
    orangieRescueUsed: false,
    scoreMultiplier: 1,
    scoreMultiplierTimer: 0,
    magnetActive: false,
    magnetTimer: 0,
  };
}

export function update(state: GameState, keys: Keys, dt: number, viewWidth: number = 940, viewHeight: number = 500): GameState {
  if (state.gameOver || state.paused) return state;
  
  if (state.gameWon) {
    if (state.victoryTimer !== undefined && state.victoryTimer > 0) {
      state.victoryTimer -= dt;
      // Continue animating celebratory particles, texts, and screen shake
      updateParticles(state, dt);
      updateHuhTexts(state, dt);
      if (state.screenShake > 0) {
        state.screenShake -= dt * 5;
        if (state.screenShake < 0) state.screenShake = 0;
      }
      // Victory gentle descent/settling
      if (state.player.y < 450) {
        state.player.y += 2 * dt * 60;
      }
    }
    return state;
  }
  
  if (state.hitstopFrames > 0) {
    state.hitstopFrames--;
    return state;
  }
  
  if (state.orangieRescueActive) {
    updateOrangieRescue(state, dt);
    return state;
  }
  
  state.time += dt;
  
  // Update player
  updatePlayer(state, keys, dt);
  
  // Update mice
  updateMice(state, dt);
  
  // Update platforms
  updatePlatforms(state, dt);
  
  // Update coins
  updateCoins(state, dt);
  
  // Update orangies
  updateOrangies(state, dt);
  
  // Update powerups
  updatePowerups(state, dt);
  
  // Update particles
  updateParticles(state, dt);
  
  // Update HUH texts
  updateHuhTexts(state, dt);
  
  // Update camera with mobile-aware dynamic framing
  updateCamera(state, viewWidth, viewHeight);
  
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
      state.player.speedBoost = 1.0;
    }
  }
  
  // Update distance
  state.distance = Math.max(state.distance, state.player.x / 50);
  
  // Check win condition (Crossing into the Solana V1 Inscription Victory Portal)
  if (!state.gameWon && state.player.x + state.player.width >= state.levelLength - 20) {
    state.gameWon = true;
    state.victoryTimer = 0.9; // 0.9s celebratory spectacle before victory modal
    const victoryBonus = 5000 * state.scoreMultiplier;
    state.player.score += victoryBonus;
    if (state.player.score > state.highScore) {
      state.highScore = state.player.score;
      try { localStorage.setItem('huhcat_highscore', state.highScore.toString()); } catch(e) {}
    }

    // Celebratory victory leap & screen shake
    state.player.vx = 0;
    state.player.vy = -7;
    state.screenShake = 3;

    // Spawn massive burst of celebratory victory particles from the portal core
    for (let i = 0; i < 45; i++) {
      const angle = (Math.PI * 2 * i) / 45 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 6;
      state.particles.push({
        x: state.levelLength,
        y: 410,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.8,
        color: ['#39ff88', '#ffd700', '#9945ff', '#00f0ff', '#ffffff'][i % 5],
        size: 3.5 + Math.random() * 4,
        type: 'star'
      });
    }

    // Floating celebratory banner text
    state.huhTexts.push({
      x: state.levelLength,
      y: 340,
      vy: -1.8,
      life: 0,
      maxLife: 2.2,
      scale: 1.5,
      text: '🏆 V1 INSCRIBED! +5000 🏆',
      color: '#ffd700'
    });

    // Play victory fanfare & Ben Cat joy vocal
    playVictorySound();
    playHuhSound(1.2);
  }
  
  return state;
}

function updatePlayer(state: GameState, keys: Keys, dt: number) {
  const player = state.player;
  const currentMoveSpeed = MOVE_SPEED * player.speedBoost;
  
  // Horizontal movement
  if (keys.left) {
    player.vx -= currentMoveSpeed * 0.3 * dt * 60;
    player.facing = 'left';
  }
  if (keys.right) {
    player.vx += currentMoveSpeed * 0.3 * dt * 60;
    player.facing = 'right';
  }
  
  // Apply friction
  player.vx *= Math.pow(FRICTION, dt * 60);
  
  // Clamp horizontal speed
  if (Math.abs(player.vx) > currentMoveSpeed) {
    player.vx = Math.sign(player.vx) * currentMoveSpeed;
  }
  if (Math.abs(player.vx) < 0.1) player.vx = 0;
  
  // Set buffer when jump pressed
  let jumpJustPressed = false;
  if (keys.up || keys.jump) {
    if (player.jumpBufferTimer <= 0) jumpJustPressed = true;
    player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
  }
  if (player.jumpBufferTimer > 0) {
    player.jumpBufferTimer -= dt * 60;
  }
  
  // Gravity
  player.vy += GRAVITY * dt * 60;
  if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
  
  // Variable jump height — releasing jump cuts velocity
  if (!keys.up && !keys.jump && player.vy < -4) {
    player.vy = Math.max(player.vy, -4);
  }
  
  // Move player
  player.x += player.vx * dt * 60;
  player.y += player.vy * dt * 60;
  
  // Platform collision
  player.isOnGround = false;
  
  for (const platform of state.platforms) {
    if (checkPlayerPlatformCollision(player, platform)) {
      // Cloud platforms are ONE-WAY (semi-solid): only land on top when falling downward!
      if (platform.type === 'cloud') {
        if (player.vy > 0 && player.y + player.height - player.vy * dt * 60 <= platform.y + 6) {
          player.y = platform.y - player.height;
          player.vy = 0;
          player.isOnGround = true;
          player.isJumping = false;
        }
        // Player passes freely through bottom and sides of clouds — no head bonks, no blocking!
        continue;
      }

      // Landing on top (ground, brick, question, moving)
      if (player.vy > 0 && player.y + player.height - player.vy * dt * 60 <= platform.y + 5) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.isOnGround = true;
        player.isJumping = false;
        
        // Moving platform carry
        if (platform.type === 'moving' && platform.originX !== undefined) {
          player.x += (platform.moveDir || 0) * 1.5 * dt * 60;
        }
      }
      // Hitting from below (solid blocks only)
      else if (player.vy < 0 && player.y - player.vy * dt * 60 >= platform.y + platform.height - 5) {
        player.y = platform.y + platform.height;
        player.vy = 1;
        
        // Hit question block
        if (platform.type === 'question' && !platform.hit) {
          platform.hit = true;
          state.player.score += 100 * state.scoreMultiplier;
          playCoinSound();
          spawnCoinParticles(state, platform.x + platform.width / 2, platform.y - 20);
          state.screenShake = 2;
        }
        // Hit brick - SMASH AND BREAK IT!
        if (platform.type === 'brick') {
          platform.destroyed = true;
          state.screenShake = 3;
          state.player.score += 50 * state.scoreMultiplier;
          playBrickBreakSound();
          spawnBrickBreakParticles(state, platform.x + platform.width / 2, platform.y + platform.height / 2);
          spawnHuhText(state, platform.x + platform.width / 2, platform.y - 10, 'SMASH!');
          
          // Knock out any mouse patrolling on top of this brick
          for (const mouse of state.mice) {
            if (mouse.isAlive &&
                mouse.x + mouse.width > platform.x &&
                mouse.x < platform.x + platform.width &&
                Math.abs((mouse.y + mouse.height) - platform.y) < 15) {
              mouse.isAlive = false;
              mouse.squishTimer = 2;
              state.player.score += 200 * state.scoreMultiplier;
              state.player.combo++;
              state.player.comboTimer = 2;
              state.player.speedBoost = 1.0 + Math.min(state.player.combo, 6) * 0.05;
              spawnStompParticles(state, mouse.x + mouse.width / 2, mouse.y);
              spawnHuhText(state, mouse.x + mouse.width / 2, mouse.y - 20, 'KO!');
            }
          }
        }
      }
      // Side collision
      else {
        // Side collision — push out in direction of least penetration
        const overlapLeft = (player.x + player.width) - (platform.x + 4);
        const overlapRight = (platform.x + platform.width - 4) - player.x;
        if (overlapLeft < overlapRight) {
          player.x = platform.x + 4 - player.width;
        } else {
          player.x = platform.x + platform.width - 4;
        }
        player.vx = 0;
      }
    }
  }
  
  // Clean up destroyed platforms
  if (state.platforms.some(p => p.destroyed)) {
    state.platforms = state.platforms.filter(p => !p.destroyed);
  }
  
  // Track last safe ground position for respawning
  for (const platform of state.platforms) {
    if (platform.type === 'ground' && player.isOnGround) {
      if (player.x + player.width > platform.x && player.x < platform.x + platform.width) {
        player.lastSafeX = player.x;
        player.lastSafeY = platform.y - player.height;
      }
    }
  }
  
  // Coyote time
  if (player.isOnGround) {
    player.coyoteTimer = COYOTE_FRAMES;
    player.doubleJumpUsed = false;
  } else if (player.coyoteTimer > 0) {
    player.coyoteTimer -= dt * 60;
  }

  // Check buffer on landing
  const wantsJump = (keys.up || keys.jump) || player.jumpBufferTimer > 0;
  const canJump = player.isOnGround || player.coyoteTimer > 0;
  if (wantsJump && canJump && !player.isJumping) {
    player.vy = JUMP_FORCE;
    player.isJumping = true;
    player.isOnGround = false;
    player.isStomping = false;
    player.jumpBufferTimer = 0;
    player.coyoteTimer = 0;
    playJumpSound();
    spawnDustParticles(state, player.x + player.width / 2, player.y + player.height);
  }
  
  // Double jump (from Orangie powerup)
  if (jumpJustPressed && !player.isOnGround && player.hasDoubleJump && !player.doubleJumpUsed && player.vy > -5) {
    player.vy = JUMP_FORCE * 0.85; // slightly weaker than ground jump
    player.doubleJumpUsed = true;
    playJumpSound();
    spawnDustParticles(state, player.x + player.width / 2, player.y + player.height);
    spawnHuhText(state, player.x + player.width / 2, player.y - 20, '🐧 DOUBLE!');
  }
  
  // Mouse collision
  for (const mouse of state.mice) {
    if (!mouse.isAlive) continue;
    
    if (checkPlayerMouseCollision(player, mouse)) {
      // Use previous-frame position for more forgiving stomp detection
      const prevBottom = player.y + player.height - player.vy * dt * 60;
      if (player.vy > 0 && (prevBottom <= mouse.y + 8 || player.y + player.height < mouse.y + mouse.height * 0.65)) {
        // Stomp successful!
        mouse.isAlive = false;
        mouse.squishTimer = 2;
        player.vy = JUMP_FORCE * 0.6; // Bounce
        player.isStomping = true;
        
        state.hitstopFrames = HITSTOP_FRAMES;
        
        // Score and combo
        state.player.combo++;
        state.player.comboTimer = 2;
        state.player.speedBoost = 1.0 + Math.min(state.player.combo, 6) * 0.05; // up to 30% boost
        const comboMultiplier = Math.min(state.player.combo, 10);
        const points = (mouse.type === 'big' ? 300 : mouse.type === 'fast' ? 200 : 100) * comboMultiplier;
        state.player.score += points * state.scoreMultiplier;
        
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
      state.player.score += points * state.scoreMultiplier;
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
  
  // Pit fall check: if player drops below the map into a chasm
  if (player.y > 680) {
    playerDie(state);
  }
}

function updateMice(state: GameState, dt: number) {
  for (const mouse of state.mice) {
    if (!mouse.isAlive) {
      if (mouse.squishTimer > 0) {
        mouse.squishTimer -= dt;
      }
      continue;
    }
    
    mouse.x += mouse.vx * dt * 60;
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
      mouse.y += 3 * dt * 60;
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
      platform.x += (platform.moveDir || 1) * 1.5 * dt * 60;
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

function updateOrangies(state: GameState, dt: number) {
  for (const orangie of state.orangies) {
    if (orangie.collected && !orangie.flyingAway) continue;
    
    // Bob animation
    orangie.bobTimer += dt;
    orangie.waveTimer += dt;
    
    // Flying away after collection
    if (orangie.flyingAway) {
      orangie.y += orangie.flyAwayVy * dt * 60;
      orangie.flyAwayVy -= 0.15 * dt * 60; // accelerate upward
      if (orangie.y < state.camera.y - 100) {
        orangie.flyingAway = false; // off screen, done
      }
      continue;
    }
    
    // Check player collision
    if (checkPlayerOrangieCollision(state.player, orangie)) {
      orangie.collected = true;
      orangie.flyingAway = true;
      orangie.flyAwayVy = -3;
      orangie.happyTimer = 1.0;
      
      // Apply powerup
      applyPowerup(state, orangie.powerup);
      
      // Effects
      state.screenShake = 2;
      spawnOrangieParticles(state, orangie.x + orangie.width / 2, orangie.y + orangie.height / 2);
      spawnHuhText(state, orangie.x + orangie.width / 2, orangie.y - 30, getPowerupText(orangie.powerup));
    }
  }
}

function checkPlayerOrangieCollision(player: Player, orangie: Orangie): boolean {
  return player.x + player.width > orangie.x + 4 &&
         player.x < orangie.x + orangie.width - 4 &&
         player.y + player.height > orangie.y + 4 &&
         player.y < orangie.y + orangie.height;
}

function applyPowerup(state: GameState, powerup: PowerupType) {
  const player = state.player;
  switch (powerup) {
    case 'doubleJump':
      player.hasDoubleJump = true;
      player.activePowerup = 'doubleJump';
      player.powerupTimer = 30; // 30 seconds
      break;
    case 'extraLife':
      player.lives = Math.min(player.lives + 1, 9);
      break;
    case 'invincibility':
      player.invincible = 8; // 8 seconds of invincibility
      player.activePowerup = 'invincibility';
      player.powerupTimer = 8;
      break;
    case 'scoreMultiplier':
      state.scoreMultiplier = 2;
      state.scoreMultiplierTimer = 20; // 20 seconds
      player.activePowerup = 'scoreMultiplier';
      player.powerupTimer = 20;
      break;
    case 'magnet':
      state.magnetActive = true;
      state.magnetTimer = 15; // 15 seconds
      player.activePowerup = 'magnet';
      player.powerupTimer = 15;
      break;
  }
  playCoinSound(); // TODO: could use a unique powerup sound
}

function getPowerupText(powerup: PowerupType): string {
  switch (powerup) {
    case 'doubleJump': return '🐧 DOUBLE JUMP!';
    case 'extraLife': return '🐧 +1 LIFE!';
    case 'invincibility': return '🐧 INVINCIBLE!';
    case 'scoreMultiplier': return '🐧 2X SCORE!';
    case 'magnet': return '🐧 COIN MAGNET!';
  }
}

function updatePowerups(state: GameState, dt: number) {
  const player = state.player;
  
  // Timed powerup countdown
  if (player.powerupTimer > 0) {
    player.powerupTimer -= dt;
    if (player.powerupTimer <= 0) {
      // Expire the active powerup
      if (player.activePowerup === 'doubleJump') {
        player.hasDoubleJump = false;
      }
      player.activePowerup = null;
      player.powerupTimer = 0;
    }
  }
  
  // Score multiplier timer
  if (state.scoreMultiplierTimer > 0) {
    state.scoreMultiplierTimer -= dt;
    if (state.scoreMultiplierTimer <= 0) {
      state.scoreMultiplier = 1;
      state.scoreMultiplierTimer = 0;
    }
  }
  
  // Magnet timer
  if (state.magnetTimer > 0) {
    state.magnetTimer -= dt;
    if (state.magnetTimer <= 0) {
      state.magnetActive = false;
      state.magnetTimer = 0;
    }
  }
  
  // Magnet effect — attract coins toward player
  if (state.magnetActive) {
    for (const coin of state.coins) {
      if (coin.collected) continue;
      const dx = player.x + player.width / 2 - (coin.x + coin.width / 2);
      const dy = player.y + player.height / 2 - (coin.y + coin.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const strength = (1 - dist / 200) * 3 * dt * 60;
        coin.x += (dx / dist) * strength;
        coin.y += (dy / dist) * strength;
      }
    }
  }
}

function updateOrangieRescue(state: GameState, dt: number) {
  state.orangieRescueTimer += dt;
  
  // Phase 1 (0-1s): Screen dims, golden rays appear
  // Phase 2 (1-3s): Orangie descends from top with sun aura
  // Phase 3 (3-3.5s): Life restored, flash
  // Phase 4 (3.5-5s): Orangie flies away, game resumes
  
  if (state.orangieRescueTimer >= 3.0 && state.player.lives === 0) {
    // Restore life
    state.player.lives = 1;
    state.player.invincible = 3;
    state.player.vx = 0;
    state.player.vy = 0;
    // Respawn on last safe position
    state.player.x = state.player.lastSafeX;
    state.player.y = state.player.lastSafeY;
    state.screenShake = 2;
    spawnHuhText(state, state.player.x + 20, state.player.y - 40, '🐧 ORANGIE BELIEVES!');
  }
  
  if (state.orangieRescueTimer >= 5.0) {
    // End cutscene
    state.orangieRescueActive = false;
    state.orangieRescueUsed = true;
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

function updateCamera(state: GameState, viewWidth: number = 940, viewHeight: number = 500) {
  // Mobile-aware dynamic framing: keep player around 32% from left edge
  // On mobile (viewWidth = 350): keeps Ben Cat at x=112px, providing 238px viewing runway ahead!
  // On desktop (viewWidth = 940): keeps Ben Cat at x=300px, providing 640px viewing runway ahead!
  const playerLeadX = Math.max(80, viewWidth * 0.32);
  const targetX = state.player.x - playerLeadX;
  
  // Vertically keep player around 65% of viewport height
  const playerLeadY = Math.max(180, viewHeight * 0.65);
  const targetY = state.player.y - playerLeadY;
  
  state.camera.x += (targetX - state.camera.x) * 0.12;
  state.camera.y += (targetY - state.camera.y) * 0.08;
  
  if (state.camera.x < 0) state.camera.x = 0;
  if (state.camera.y > 220) state.camera.y = 220;
  if (state.camera.y < -120) state.camera.y = -120;
}

function playerDie(state: GameState) {
  state.player.lives--;
  playDeathSound();
  state.screenShake = 5;
  
  if (state.player.lives <= 0) {
    // Check for Orangie rescue
    if (!state.orangieRescueUsed) {
      state.orangieRescueActive = true;
      state.orangieRescueTimer = 0;
      state.player.lives = 0; // keep at 0 during cutscene
      return;
    }
    state.gameOver = true;
    if (state.player.score > state.highScore) {
      state.highScore = state.player.score;
      try { localStorage.setItem('huhcat_highscore', state.highScore.toString()); } catch(e) {}
    }
  } else {
    // Respawn on last known safe position
    state.player.x = state.player.lastSafeX;
    state.player.y = state.player.lastSafeY;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.invincible = 2.5;
    state.player.combo = 0;
    state.player.hasDoubleJump = false;
    state.player.activePowerup = null;
    state.player.powerupTimer = 0;
    
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

function spawnBrickBreakParticles(state: GameState, x: number, y: number) {
  const colors = ['#39ff88', '#9945ff', '#111728', '#00f0ff', '#ffffff'];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const speed = 2.5 + Math.random() * 4.5;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      life: 0.7,
      maxLife: 0.7,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 4,
      type: 'brick',
      rotation: Math.random() * Math.PI * 2,
    });
  }
}

function spawnOrangieParticles(state: GameState, x: number, y: number) {
  const colors = ['#ff8c00', '#ffa500', '#ffd700', '#ffffff', '#00bfff'];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1.0,
      maxLife: 1.0,
      color: colors[i % colors.length],
      size: 5 + Math.random() * 5,
      type: 'orangie',
      rotation: Math.random() * Math.PI * 2,
    });
  }
}
