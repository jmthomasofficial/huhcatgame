import { GameState, Player, Mouse, Platform, Coin, Particle, HuhText } from './types';

// Pre-load authentic Ben Cat sprites
const baseUrl = import.meta.env.BASE_URL || '/';
const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

const spriteIdle = new Image();
spriteIdle.src = `${cleanBase}cat_idle.png`;

const spriteHuh = new Image();
spriteHuh.src = `${cleanBase}cat_huh.png`;

const spriteDead = new Image();
spriteDead.src = `${cleanBase}cat_dead.png`;

const COLORS = {
  bgVoid: '#04050a',
  bgPanel: '#0d111c',
  green: '#39ff88',
  greenDim: '#00d15c',
  purple: '#9945ff',
  purpleDim: '#7025d9',
  red: '#ff3b5c',
  gold: '#ffd700',
  cyan: '#00f0ff',
  text: '#eef2f6',
  muted: '#8a93a6',
};

export function render(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number, canvasHeight: number) {
  const { camera, screenShake } = state;
  
  // Apply screen shake
  const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake * 5 : 0;
  const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake * 5 : 0;
  
  ctx.save();
  ctx.translate(shakeX, shakeY);
  
  // 1. Draw Cyberpunk Solana Background
  drawBackground(ctx, camera, canvasWidth, canvasHeight, state.time);
  
  // 2. Draw Platforms (Cyber Alloy + Neon Emerald / Solana Purple)
  state.platforms.forEach(p => {
    if (p.x + p.width > camera.x - 100 && p.x < camera.x + canvasWidth + 100) {
      drawPlatform(ctx, p, camera);
    }
  });
  
  // 3. Draw Collectibles (Solana Gold Coins & Holographic Fish)
  state.coins.forEach(c => {
    if (!c.collected && c.x + c.width > camera.x - 50 && c.x < camera.x + canvasWidth + 50) {
      drawCoin(ctx, c, camera);
    }
  });
  
  // 4. Draw Robo-Mice Enemies
  state.mice.forEach(m => {
    if (m.x + m.width > camera.x - 50 && m.x < camera.x + canvasWidth + 50) {
      drawMouse(ctx, m, camera);
    }
  });
  
  // 5. Draw Player with authentic Ben Cat Sprite
  drawPlayer(ctx, state.player, camera, state.gameOver);
  
  // 6. Draw Sparks & Particles
  state.particles.forEach(p => drawParticle(ctx, p, camera));
  
  // 7. Draw Iconic HUH?! Floating Badges
  state.huhTexts.forEach(h => drawHuhText(ctx, h, camera));
  
  // 8. Draw Modernized Cyber HUD
  drawHUD(ctx, state, canvasWidth);
  
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, camera: { x: number; y: number }, w: number, h: number, time: number) {
  // Deep space cyber gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#04050a');
  bgGrad.addColorStop(0.4, '#070a14');
  bgGrad.addColorStop(0.8, '#0b0d1e');
  bgGrad.addColorStop(1, '#120b24');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);
  
  // Cyber grid horizon
  ctx.save();
  ctx.strokeStyle = 'rgba(57, 255, 136, 0.07)';
  ctx.lineWidth = 1;
  const gridStep = 40;
  const camShiftX = (camera.x * 0.15) % gridStep;
  for (let x = -camShiftX; x <= w; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.45);
    ctx.lineTo(x * 1.5 - w * 0.25, h);
    ctx.stroke();
  }
  for (let y = h * 0.45; y <= h; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  // Distant Stars & Solana Constellation
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 70; i++) {
    const sx = ((i * 137 + 50) % w + (camera.x * 0.04) % w + w) % w;
    const sy = ((i * 97 + 30) % (h * 0.55));
    const size = (i % 3) === 0 ? 2 : 1;
    const isSolana = i % 8 === 0;
    const isEmerald = i % 11 === 0;
    
    ctx.globalAlpha = Math.sin(time * 2.5 + i) * 0.4 + 0.6;
    ctx.fillStyle = isSolana ? '#9945ff' : isEmerald ? '#39ff88' : '#eef2f6';
    ctx.fillRect(sx, sy, size, size);
  }
  ctx.globalAlpha = 1;
  
  // Distant Cyber Skyline Silhouette
  ctx.fillStyle = 'rgba(8, 12, 24, 0.85)';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 30) {
    const worldX = x + camera.x * 0.08;
    const bHeight = 80 + (Math.sin(worldX * 0.015) * 40 + Math.sin(worldX * 0.04) * 20);
    ctx.lineTo(x, h - bHeight);
    ctx.lineTo(x + 25, h - bHeight);
  }
  ctx.lineTo(w, h);
  ctx.fill();
  
  // Floating On-Chain Lore Runes in background
  ctx.globalAlpha = 0.12;
  ctx.font = 'bold 16px "Space Mono", monospace';
  ctx.fillStyle = COLORS.green;
  const runes = ['$HUHCAT', 'SOL', 'V1', '0xCAT', 'INSCRIPTION', 'PUMP', '3.2M'];
  for (let i = 0; i < runes.length; i++) {
    const sx = ((i * 180 + camera.x * 0.2) % (w + 200)) - 100;
    const sy = 80 + (i * 65) % (h * 0.4) + Math.sin(time + i) * 15;
    ctx.fillText(runes[i], sx, sy);
  }
  ctx.globalAlpha = 1;
}

function drawPlatform(ctx: CanvasRenderingContext2D, p: Platform, camera: { x: number; y: number }) {
  const x = p.x - camera.x;
  const y = p.y - camera.y;
  
  switch (p.type) {
    case 'ground':
      // Cyber Alloy Ground with Glowing Neon Emerald Top Border
      ctx.fillStyle = '#0d111c';
      ctx.fillRect(x, y, p.width, p.height);
      
      // Neon Emerald Top Rail
      ctx.fillStyle = COLORS.green;
      ctx.fillRect(x, y, p.width, 4);
      
      // Top Rail Glow
      ctx.shadowColor = COLORS.green;
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(57, 255, 136, 0.4)';
      ctx.fillRect(x, y, p.width, 2);
      ctx.shadowBlur = 0;
      
      // Circuit tech accents
      ctx.strokeStyle = 'rgba(57, 255, 136, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < p.width; i += 40) {
        ctx.strokeRect(x + i + 4, y + 10, 32, p.height - 18);
        ctx.fillStyle = 'rgba(57, 255, 136, 0.2)';
        ctx.fillRect(x + i + 8, y + 14, 4, 4);
      }
      break;
      
    case 'brick':
      // Tech Server Block
      ctx.fillStyle = '#111728';
      ctx.fillRect(x, y, p.width, p.height);
      ctx.strokeStyle = 'rgba(57, 255, 136, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, y + 1, p.width - 2, p.height - 2);
      
      // Inner glowing lines
      for (let bx = 0; bx < p.width; bx += 20) {
        ctx.strokeStyle = 'rgba(153, 69, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(x + bx, y);
        ctx.lineTo(x + bx, y + p.height);
        ctx.stroke();
      }
      // Top Edge Specular
      ctx.fillStyle = 'rgba(57, 255, 136, 0.6)';
      ctx.fillRect(x, y, p.width, 2);
      break;
      
    case 'question':
      // Solana Mystery Box
      const bounce = p.hit ? 0 : Math.sin(Date.now() * 0.006) * 2;
      ctx.fillStyle = p.hit ? '#1a1f2e' : '#1b1233';
      ctx.fillRect(x, y + bounce, p.width, p.height);
      
      // Purple / Gold Border
      ctx.strokeStyle = p.hit ? '#334155' : COLORS.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1 + bounce, p.width - 2, p.height - 2);
      
      if (!p.hit) {
        // Glowing Solana 'S' or '?'
        ctx.shadowColor = COLORS.gold;
        ctx.shadowBlur = 10;
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 20px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('S', x + p.width / 2, y + p.height / 2 + 7 + bounce);
        ctx.shadowBlur = 0;
        
        // Corner rivets
        ctx.fillStyle = COLORS.purple;
        ctx.fillRect(x + 4, y + 4 + bounce, 3, 3);
        ctx.fillRect(x + p.width - 7, y + 4 + bounce, 3, 3);
        ctx.fillRect(x + 4, y + p.height - 7 + bounce, 3, 3);
        ctx.fillRect(x + p.width - 7, y + p.height - 7 + bounce, 3, 3);
      }
      break;
      
    case 'moving':
      // Moving Tech Platform
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, p.width, p.height);
      ctx.strokeStyle = COLORS.cyan;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, p.width, p.height);
      
      // Pulse arrows
      ctx.fillStyle = COLORS.cyan;
      ctx.font = 'bold 12px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◄►', x + p.width / 2, y + p.height / 2 + 4);
      break;
      
    case 'cloud':
      // Solana Purple Nebula Jump Pad
      ctx.save();
      const cx = x + p.width / 2;
      const cy = y + p.height / 2;
      
      ctx.shadowColor = COLORS.purple;
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(153, 69, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, p.width / 2, p.height / 2 + 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = COLORS.purple;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(cx - 8, cy - 3, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
  }
}

function drawMouse(ctx: CanvasRenderingContext2D, m: Mouse, camera: { x: number; y: number }) {
  const x = m.x - camera.x;
  const y = m.y - camera.y;
  
  if (!m.isAlive) {
    if (m.squishTimer > 0) {
      // Squished robotic chassis with spark
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y + m.height - 7, m.width, 7);
      ctx.fillStyle = COLORS.red;
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.fillText('DELETED', x, y + m.height - 2);
    }
    return;
  }
  
  const bobY = Math.sin(m.frameTimer * 0.25) * 2;
  
  ctx.save();
  // Cyber Mech Body
  ctx.fillStyle = m.type === 'big' ? '#1e293b' : '#334155';
  ctx.beginPath();
  ctx.ellipse(x + m.width / 2, y + m.height / 2 + bobY, m.width / 2, m.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mechanical Ears
  ctx.fillStyle = m.type === 'big' ? '#0f172a' : '#1e293b';
  ctx.beginPath();
  ctx.ellipse(x + m.width * 0.3, y + 2 + bobY, 6, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + m.width * 0.7, y + 2 + bobY, 6, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Glowing Red Laser Visor / Eyes
  ctx.shadowColor = COLORS.red;
  ctx.shadowBlur = 8;
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(x + m.width * 0.25, y + m.height * 0.35 + bobY, m.width * 0.5, 4);
  ctx.shadowBlur = 0;
  
  // Electric Tail
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + m.width, y + m.height * 0.7 + bobY);
  ctx.quadraticCurveTo(
    x + m.width + 12,
    y + m.height * 0.5 + bobY + Math.sin(m.frameTimer * 0.3) * 6,
    x + m.width + 8,
    y + m.height * 0.2 + bobY
  );
  ctx.stroke();
  
  // Boss Crown for Big Mech
  if (m.type === 'big') {
    ctx.fillStyle = COLORS.gold;
    ctx.shadowColor = COLORS.gold;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(x + m.width * 0.2, y - 2 + bobY);
    ctx.lineTo(x + m.width * 0.35, y - 11 + bobY);
    ctx.lineTo(x + m.width * 0.5, y - 4 + bobY);
    ctx.lineTo(x + m.width * 0.65, y - 11 + bobY);
    ctx.lineTo(x + m.width * 0.8, y - 2 + bobY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function drawCoin(ctx: CanvasRenderingContext2D, c: Coin, camera: { x: number; y: number }) {
  const x = c.x - camera.x;
  const y = c.y - camera.y;
  const bob = Math.sin(Date.now() * 0.005 + c.x) * 4;
  
  if (c.type === 'golden') {
    // Solana Golden Coin
    ctx.save();
    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 12;
    
    // Outer Coin
    const grad = ctx.createLinearGradient(x, y + bob, x + 20, y + 20 + bob);
    grad.addColorStop(0, '#39ff88');
    grad.addColorStop(1, '#9945ff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + 10, y + 10 + bob, 11, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner Coin
    ctx.fillStyle = '#0d111c';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10 + bob, 8.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Solana S
    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 11px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('S', x + 10, y + 14 + bob);
    ctx.restore();
  } else {
    // Holographic Cyber Fish
    ctx.save();
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 8;
    ctx.fillStyle = COLORS.cyan;
    
    // Fish body
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 10 + bob, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fish tail
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 10 + bob);
    ctx.lineTo(x + 24, y + 5 + bob);
    ctx.lineTo(x + 24, y + 15 + bob);
    ctx.closePath();
    ctx.fill();
    
    // Fish neon eye
    ctx.fillStyle = '#04050a';
    ctx.beginPath();
    ctx.arc(x + 6, y + 9 + bob, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, camera: { x: number; y: number }, gameOver: boolean) {
  const x = player.x - camera.x;
  const y = player.y - camera.y;
  const flip = player.facing === 'left';
  
  // Invincibility flash
  if (player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }
  
  ctx.save();
  if (flip) {
    ctx.translate(x + player.width, y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, y);
  }
  
  const w = player.width;
  const h = player.height;
  const squish = player.isStomping ? 0.8 : 1;
  const stretch = player.isJumping ? 1.15 : 1;
  
  // Ground Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 2, w * 0.4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Select Sprite: Dead -> Huh (Jump/Stomp) -> Idle
  let activeSprite: HTMLImageElement | null = null;
  if (gameOver) {
    activeSprite = spriteDead;
  } else if (player.isJumping || player.isStomping) {
    activeSprite = spriteHuh;
  } else {
    activeSprite = spriteIdle;
  }
  
  const isSpriteReady = activeSprite && activeSprite.complete && activeSprite.naturalWidth > 0;
  
  if (isSpriteReady) {
    // Draw authentic Ben Cat Medallion
    ctx.save();
    
    // Attack streak when stomping
    if (player.isStomping) {
      ctx.shadowColor = COLORS.red;
      ctx.shadowBlur = 20;
    } else {
      ctx.shadowColor = player.isJumping ? COLORS.purple : COLORS.green;
      ctx.shadowBlur = 12;
    }
    
    const spriteSize = w * 1.15;
    const offX = (w - spriteSize) / 2;
    const offY = (h - spriteSize * stretch) / 2;
    
    ctx.drawImage(activeSprite, offX, offY, spriteSize * squish, spriteSize * stretch);
    ctx.restore();
  } else {
    // Procedural Fallback if sprite is still fetching
    ctx.fillStyle = '#f5f5f5'; // Ben Cat white fur
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.55, w * 0.4 * squish, h * 0.38 * stretch, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Black bangs
    ctx.fillStyle = '#1e1e1e';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.25, w * 0.25, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Confused Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(w * 0.38, h * 0.35, 3, 0, Math.PI * 2);
    ctx.arc(w * 0.62, h * 0.35, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // HUH mouth
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.48, 4, player.isJumping ? 6 : 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, camera: { x: number; y: number }) {
  const x = p.x - camera.x;
  const y = p.y - camera.y;
  const alpha = p.life / p.maxLife;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(x, y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHuhText(ctx: CanvasRenderingContext2D, h: HuhText, camera: { x: number; y: number }) {
  const x = h.x - camera.x;
  const y = h.y - camera.y;
  const alpha = h.life / h.maxLife;
  const scale = h.scale * (1 + (1 - alpha) * 0.4);
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Iconic Viral Subtitle Red Badge
  const text = 'Huh?';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  const textWidth = ctx.measureText(text).width;
  
  ctx.fillStyle = '#e50914'; // Iconic TikTok subtitle red
  ctx.fillRect(-textWidth / 2 - 8, -14, textWidth + 16, 26);
  
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  
  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number) {
  // Left: Glassmorphic Metrics Card
  ctx.save();
  ctx.fillStyle = 'rgba(13, 17, 28, 0.85)';
  ctx.fillRect(16, 16, 210, 78);
  ctx.strokeStyle = 'rgba(57, 255, 136, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, 210, 78);
  
  // Pulsing Live Indicator Dot
  ctx.fillStyle = COLORS.green;
  ctx.shadowColor = COLORS.green;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(28, 30, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  ctx.font = 'bold 13px "Space Mono", monospace';
  ctx.textAlign = 'left';
  
  // Score
  ctx.fillStyle = COLORS.green;
  ctx.fillText(`$HUHCAT : ${state.player.score}`, 40, 34);
  
  // Mice deleted
  ctx.fillStyle = COLORS.cyan;
  const stomped = state.mice.filter(m => !m.isAlive).length;
  ctx.fillText(`MICE    : ${stomped}`, 40, 56);
  
  // On-chain distance
  ctx.fillStyle = '#a78bfa';
  ctx.fillText(`DIST    : ${Math.floor(state.distance)}m`, 40, 78);
  
  // Right: Lives & High Score
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i < state.player.lives; i++) {
    ctx.fillText('❤️', canvasWidth - 16 - i * 28, 36);
  }
  
  if (state.highScore > 0) {
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`HIGH SCORE: ${state.highScore}`, canvasWidth - 16, 62);
  }
  
  // Center: Active Combo Banner
  if (state.player.combo > 1) {
    ctx.shadowColor = COLORS.gold;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 22px "Syne", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 HUH COMBO x${state.player.combo}! 🔥`, canvasWidth / 2, 42);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
