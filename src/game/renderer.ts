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
  
  // 5. Draw Player with authentic animated Ben Cat Sprite
  drawPlayer(ctx, state.player, camera, state.gameOver, state.time);
  
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

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, camera: { x: number; y: number }, gameOver: boolean, time: number = 0) {
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
  
  const isMoving = Math.abs(player.vx) > 0.25;
  const isAirborne = !player.isOnGround || player.isJumping;
  const isStomping = player.isStomping;
  const isDead = gameOver;
  
  // Squash and stretch dynamics
  const squish = isStomping ? 0.82 : (isAirborne ? 0.92 : 1);
  const stretch = isStomping ? 1.22 : (isAirborne ? 1.15 : 1);
  
  // Kinetic run & breath cycles
  const runPhase = isMoving && !isAirborne ? (time * 16 + player.x * 0.08) % (Math.PI * 2) : 0;
  const bobY = isMoving && !isAirborne 
    ? Math.abs(Math.sin(runPhase)) * 3 
    : (!isAirborne ? Math.sin(time * 3) * 1.2 : (isStomping ? 4 : -3));
    
  const legSwing1 = isMoving && !isAirborne 
    ? Math.sin(runPhase) * 11 
    : (isAirborne ? (isStomping ? 2 : 8) : 0);
  const legSwing2 = isMoving && !isAirborne 
    ? Math.sin(runPhase + Math.PI) * 11 
    : (isAirborne ? (isStomping ? 2 : -7) : 0);
    
  const tailWag = isMoving 
    ? Math.sin(runPhase) * 0.4 
    : (isAirborne ? -0.35 : Math.sin(time * 2.5) * 0.22);
    
  const isBlinking = !isDead && (Math.floor(time * 0.4) % 4 === 0) && ((time * 0.4) % 1 < 0.08);

  // 1. Ground Shadow
  if (!isDead) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowScale = 1 / (1 + (isAirborne ? 0.6 : 0));
    ctx.ellipse(w / 2, h + 2, (w * 0.42) * shadowScale, 3.5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Action Aura & Speed Trails
  if (isStomping) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 59, 92, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = COLORS.red;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, -8);
    ctx.lineTo(w * 0.2, h + 6);
    ctx.moveTo(w * 0.5, -12);
    ctx.lineTo(w * 0.5, h + 10);
    ctx.moveTo(w * 0.8, -8);
    ctx.lineTo(w * 0.8, h + 6);
    ctx.stroke();
    ctx.restore();
  } else if (isAirborne) {
    ctx.save();
    ctx.strokeStyle = 'rgba(57, 255, 136, 0.5)';
    ctx.lineWidth = 2;
    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.5);
    ctx.lineTo(-6, h * 0.8);
    ctx.moveTo(w * 0.2, h * 0.7);
    ctx.lineTo(-4, h);
    ctx.stroke();
    ctx.restore();
  }

  // Base coordinates for body parts
  const bx = w * 0.48;
  const by = h * 0.58 + bobY;

  // 3. Tail (Curved organic cat tail behind body)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  const tailBaseX = bx - 14;
  const tailBaseY = by + 2;
  const tailMidX = tailBaseX - 10 + tailWag * 12;
  const tailMidY = tailBaseY - 10;
  const tailTipX = tailBaseX - 12 + tailWag * 16;
  const tailTipY = tailBaseY - 22;
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(tailMidX, tailMidY, tailTipX, tailTipY);
  ctx.stroke();
  
  // Black Tip of Tail
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(tailMidX, tailMidY);
  ctx.lineTo(tailTipX, tailTipY);
  ctx.stroke();
  ctx.restore();

  // 4. Far Hind & Front Legs (Shadowed tone for 3D depth)
  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  
  // Far Hind Paw
  ctx.beginPath();
  ctx.ellipse(bx - 10 + legSwing2, by + 16, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Far Front Paw
  ctx.beginPath();
  ctx.ellipse(bx + 8 + legSwing1, by + 16, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Main Feline Torso
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(bx, by + 3, 14 * squish, 12 * stretch, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ben Cat's signature black fur saddle patch on back
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.ellipse(bx - 7, by - 1, 7, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // 6. Near Hind & Front Legs (Foreground, bright white with dark paw pads)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  
  // Near Hind Leg
  const nhX = bx - 6 + legSwing1;
  const nhY = by + 17;
  ctx.beginPath();
  ctx.ellipse(nhX, nhY, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Near Hind Paw Pad
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(nhX, nhY + 3.5, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Near Front Leg
  ctx.fillStyle = '#ffffff';
  const nfX = bx + 12 + legSwing2;
  const nfY = by + 17;
  ctx.beginPath();
  ctx.ellipse(nfX, nfY, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Near Front Paw Pad
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(nfX, nfY + 3.5, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 7. Head & Facial Features
  const hx = bx + 4;
  const hy = by - 13;
  
  // Ears (Ears tilt back when jumping/stomping)
  const earTilt = isAirborne ? -0.15 : (isStomping ? -0.25 : 0);
  
  // Left Ear
  ctx.save();
  ctx.translate(hx - 8, hy - 9);
  ctx.rotate(earTilt);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, 5);
  ctx.lineTo(-2, -14);
  ctx.lineTo(6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Pink Inner Ear
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(-3, 3);
  ctx.lineTo(-2, -10);
  ctx.lineTo(4, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right Ear
  ctx.save();
  ctx.translate(hx + 6, hy - 9);
  ctx.rotate(earTilt);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, 3);
  ctx.lineTo(3, -14);
  ctx.lineTo(7, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Pink Inner Ear
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(-2, 1);
  ctx.lineTo(3, -10);
  ctx.lineTo(5, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Head Base Circle
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 14.5 * squish, 13 * stretch, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cheek Fluff Tufts
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(hx - 13, hy + 2);
  ctx.lineTo(hx - 18, hy + 5);
  ctx.lineTo(hx - 12, hy + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(hx + 13, hy + 2);
  ctx.lineTo(hx + 18, hy + 5);
  ctx.lineTo(hx + 12, hy + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 8. THE ICONIC BEN CAT BLACK BANGS / WIG!
  // Sits squarely on the crown and forehead between ears
  ctx.fillStyle = '#18181b';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hx - 11, hy - 8);
  ctx.quadraticCurveTo(hx, hy - 14, hx + 11, hy - 8);
  ctx.quadraticCurveTo(hx + 10, hy - 2, hx + 7, hy - 1);
  ctx.quadraticCurveTo(hx + 3, hy - 3, hx, hy - 1);
  ctx.quadraticCurveTo(hx - 4, hy - 3, hx - 8, hy - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Glossy hair specular highlight arc
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(hx, hy - 7, 7, Math.PI * 1.1, Math.PI * 1.8);
  ctx.stroke();

  // 9. Eyes
  const eyeY = hy - 1;
  
  if (isDead) {
    // Comical Knockout 'X' Eyes
    ctx.strokeStyle = '#ff3b5c';
    ctx.lineWidth = 2.5;
    // Left X
    ctx.beginPath();
    ctx.moveTo(hx - 8, eyeY - 4); ctx.lineTo(hx - 2, eyeY + 4);
    ctx.moveTo(hx - 2, eyeY - 4); ctx.lineTo(hx - 8, eyeY + 4);
    // Right X
    ctx.moveTo(hx + 2, eyeY - 4); ctx.lineTo(hx + 8, eyeY + 4);
    ctx.moveTo(hx + 8, eyeY - 4); ctx.lineTo(hx + 2, eyeY + 4);
    ctx.stroke();
  } else if (isBlinking) {
    // Blink curves
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx - 5, eyeY, 3, 0, Math.PI);
    ctx.arc(hx + 5, eyeY, 3, 0, Math.PI);
    ctx.stroke();
  } else {
    // Bewildered Amber / Gold HUHCAT Eyes
    // Left Eye
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(hx - 5.5, eyeY, 4, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Iris
    ctx.fillStyle = '#f59e0b'; // Amber Gold
    ctx.beginPath();
    ctx.ellipse(hx - 5, eyeY + 0.2, 2.8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(hx - 4.5, eyeY + 0.5, 1.8, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Specular Glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hx - 6, eyeY - 1.2, 1.2, 0, Math.PI * 2);
    ctx.arc(hx - 3.5, eyeY + 1.2, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(hx + 5.5, eyeY, 4, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Iris
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(hx + 5, eyeY + 0.2, 2.8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(hx + 4.5, eyeY + 0.5, 1.8, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Specular Glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hx + 4, eyeY - 1.2, 1.2, 0, Math.PI * 2);
    ctx.arc(hx + 6.5, eyeY + 1.2, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 10. Cute Pink Nose & Snout
  const noseY = hy + 5.5;
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(hx - 2, noseY);
  ctx.lineTo(hx + 2, noseY);
  ctx.lineTo(hx, noseY + 2.2);
  ctx.closePath();
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.lineWidth = 1;
  // Left whiskers
  ctx.beginPath();
  ctx.moveTo(hx - 4, noseY + 1); ctx.lineTo(hx - 15, noseY - 1);
  ctx.moveTo(hx - 4, noseY + 2.5); ctx.lineTo(hx - 16, noseY + 3.5);
  ctx.moveTo(hx - 4, noseY + 4); ctx.lineTo(hx - 14, noseY + 7.5);
  // Right whiskers
  ctx.moveTo(hx + 4, noseY + 1); ctx.lineTo(hx + 15, noseY - 1);
  ctx.moveTo(hx + 4, noseY + 2.5); ctx.lineTo(hx + 16, noseY + 3.5);
  ctx.moveTo(hx + 4, noseY + 4); ctx.lineTo(hx + 14, noseY + 7.5);
  ctx.stroke();

  // 11. MOUTH ("HUH?!")
  const mouthY = noseY + 3.5;
  
  if (isAirborne || isStomping) {
    // THE SIGNATURE ICONIC WIDE OPEN "HUH?!" MOUTH!
    ctx.fillStyle = '#261020';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(hx, mouthY + 3, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Pink Tongue
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(hx, mouthY + 5.5, 2.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Two Little White Fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(hx - 2, mouthY); ctx.lineTo(hx - 1.2, mouthY + 2); ctx.lineTo(hx - 0.5, mouthY);
    ctx.moveTo(hx + 0.5, mouthY); ctx.lineTo(hx + 1.2, mouthY + 2); ctx.lineTo(hx + 2, mouthY);
    ctx.fill();
  } else if (isDead) {
    // Defeated mouth with tongue lolling
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx, mouthY, 3, 0, Math.PI);
    ctx.stroke();
    // Tongue sticking out
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(hx + 2, mouthY + 2, 2.5, 3.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Bewildered, cute cat 'w' meow mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx - 1.8, mouthY, 2, 0, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx + 1.8, mouthY, 2, Math.PI * 0.1, Math.PI);
    ctx.stroke();
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
  
  if (p.type === 'brick') {
    ctx.translate(x, y);
    if (p.rotation !== undefined) ctx.rotate(p.rotation);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.strokeStyle = '#39ff88';
    ctx.lineWidth = 1;
    ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
  } else if (p.type === 'stomp') {
    // Expanding neon shockwave ring
    const expansion = 1 + (1 - alpha) * 0.8;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, (p.size * 0.7) * expansion, 0, Math.PI * 2);
    ctx.stroke();
    // Inner pulse
    ctx.strokeStyle = '#ff3b5c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, (p.size * 0.4) * expansion, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const isMobile = canvasWidth < 480;
  
  ctx.save();
  
  // Left: Glassmorphic Metrics Card
  const cardW = isMobile ? 150 : 210;
  const cardH = isMobile ? 66 : 78;
  const cardX = 12;
  const cardY = 12;
  
  ctx.fillStyle = 'rgba(13, 17, 28, 0.85)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = 'rgba(57, 255, 136, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  
  // Pulsing Live Indicator Dot
  ctx.fillStyle = COLORS.green;
  ctx.shadowColor = COLORS.green;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(cardX + 12, cardY + (isMobile ? 12 : 16), 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  ctx.font = isMobile ? 'bold 11px "Space Mono", monospace' : 'bold 13px "Space Mono", monospace';
  ctx.textAlign = 'left';
  
  const textX = cardX + (isMobile ? 22 : 28);
  const line1Y = cardY + (isMobile ? 16 : 20);
  const lineGap = isMobile ? 18 : 22;
  
  // Score
  ctx.fillStyle = COLORS.green;
  ctx.fillText(isMobile ? `PTS: ${state.player.score}` : `$HUHCAT : ${state.player.score}`, textX, line1Y);
  
  // Mice deleted
  ctx.fillStyle = COLORS.cyan;
  const stomped = state.mice.filter(m => !m.isAlive).length;
  ctx.fillText(isMobile ? `MICE: ${stomped}` : `MICE    : ${stomped}`, textX, line1Y + lineGap);
  
  // On-chain distance
  ctx.fillStyle = '#a78bfa';
  ctx.fillText(isMobile ? `DIST: ${Math.floor(state.distance)}m` : `DIST    : ${Math.floor(state.distance)}m`, textX, line1Y + lineGap * 2);
  
  // Right: 9 Lives Badge (Sleek Glassmorphic Pill)
  const pillW = isMobile ? 82 : 100;
  const pillH = isMobile ? 28 : 32;
  const pillX = canvasWidth - pillW - 12;
  const pillY = 12;
  
  ctx.fillStyle = 'rgba(13, 17, 28, 0.85)';
  ctx.fillRect(pillX, pillY, pillW, pillH);
  ctx.strokeStyle = 'rgba(255, 59, 92, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(pillX, pillY, pillW, pillH);
  
  ctx.font = isMobile ? 'bold 12px "Space Mono", monospace' : 'bold 14px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff3b5c';
  ctx.fillText(`❤️ x${state.player.lives}`, pillX + pillW / 2, pillY + (isMobile ? 19 : 21));
  
  // High Score badge on desktop or wide mobile
  if (state.highScore > 0 && canvasWidth >= 420) {
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 11px "Space Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`HIGH: ${state.highScore}`, canvasWidth - 12, pillY + pillH + 16);
  }
  
  // Center: Active Combo Banner
  if (state.player.combo > 1) {
    ctx.shadowColor = COLORS.gold;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COLORS.gold;
    ctx.font = isMobile ? 'bold 16px "Syne", sans-serif' : 'bold 22px "Syne", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 HUH x${state.player.combo}! 🔥`, canvasWidth / 2, isMobile ? 32 : 42);
    ctx.shadowBlur = 0;
  }
  
  ctx.restore();
}
