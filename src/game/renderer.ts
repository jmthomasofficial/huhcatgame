import { GameState, Player, Mouse, Platform, Coin, Particle, HuhText } from './types';

const COLORS = {
  sky: ['#1a0533', '#2d1b69', '#4a2c8a', '#6b3fa0'],
  ground: '#4a2800',
  groundTop: '#6b8c23',
  brick: '#c84c0c',
  brickDark: '#8b3000',
  question: '#ffd700',
  questionDark: '#cc9900',
  cloud: '#ffffff',
  cat: '#ff8c00',
  catDark: '#cc6600',
  catLight: '#ffb347',
  mouse: '#888888',
  mouseDark: '#555555',
  mouseEye: '#ff0000',
  coin: '#ffd700',
  coinGolden: '#ff6600',
};

export function render(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number, canvasHeight: number) {
  const { camera, screenShake } = state;
  
  // Apply screen shake
  const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake * 4 : 0;
  const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake * 4 : 0;
  
  ctx.save();
  ctx.translate(shakeX, shakeY);
  
  // Draw background
  drawBackground(ctx, camera, canvasWidth, canvasHeight, state.time);
  
  // Draw platforms
  state.platforms.forEach(p => {
    if (p.x + p.width > camera.x - 100 && p.x < camera.x + canvasWidth + 100) {
      drawPlatform(ctx, p, camera);
    }
  });
  
  // Draw coins
  state.coins.forEach(c => {
    if (!c.collected && c.x + c.width > camera.x - 50 && c.x < camera.x + canvasWidth + 50) {
      drawCoin(ctx, c, camera);
    }
  });
  
  // Draw mice
  state.mice.forEach(m => {
    if (m.x + m.width > camera.x - 50 && m.x < camera.x + canvasWidth + 50) {
      drawMouse(ctx, m, camera);
    }
  });
  
  // Draw player
  drawPlayer(ctx, state.player, camera);
  
  // Draw particles
  state.particles.forEach(p => drawParticle(ctx, p, camera));
  
  // Draw HUH texts
  state.huhTexts.forEach(h => drawHuhText(ctx, h, camera));
  
  // Draw HUD
  drawHUD(ctx, state, canvasWidth);
  
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, camera: { x: number; y: number }, w: number, h: number, time: number) {
  // Gradient sky
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#0a001a');
  gradient.addColorStop(0.3, '#1a0533');
  gradient.addColorStop(0.6, '#2d1b69');
  gradient.addColorStop(1, '#4a2c8a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Stars (parallax)
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137 + 50) % w + (camera.x * 0.05) % w + w) % w;
    const sy = ((i * 97 + 30) % (h * 0.6));
    const size = (i % 3) + 1;
    const twinkle = Math.sin(time * 3 + i) * 0.3 + 0.7;
    ctx.globalAlpha = twinkle;
    ctx.fillRect(sx, sy, size, size);
  }
  ctx.globalAlpha = 1;
  
  // Far mountains (parallax)
  ctx.fillStyle = '#1a0a3a';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 20) {
    const worldX = x + camera.x * 0.1;
    const mountainY = h - 150 + Math.sin(worldX * 0.003) * 60 + Math.sin(worldX * 0.007) * 30;
    ctx.lineTo(x, mountainY);
  }
  ctx.lineTo(w, h);
  ctx.fill();
  
  // Near mountains
  ctx.fillStyle = '#2a1050';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 15) {
    const worldX = x + camera.x * 0.2;
    const mountainY = h - 100 + Math.sin(worldX * 0.005) * 50 + Math.sin(worldX * 0.012) * 20;
    ctx.lineTo(x, mountainY);
  }
  ctx.lineTo(w, h);
  ctx.fill();
  
  // Floating crypto symbols in background
  ctx.globalAlpha = 0.15;
  ctx.font = '20px monospace';
  ctx.fillStyle = '#ffd700';
  const symbols = ['⟠', '◈', '⬡', '◇', '△'];
  for (let i = 0; i < 10; i++) {
    const sx = ((i * 200 + camera.x * 0.3) % (w + 200)) - 100;
    const sy = 100 + (i * 73) % 300 + Math.sin(time + i) * 20;
    ctx.fillText(symbols[i % symbols.length], sx, sy);
  }
  ctx.globalAlpha = 1;
}

function drawPlatform(ctx: CanvasRenderingContext2D, p: Platform, camera: { x: number; y: number }) {
  const x = p.x - camera.x;
  const y = p.y - camera.y;
  
  switch (p.type) {
    case 'ground':
      // Ground block
      ctx.fillStyle = COLORS.groundTop;
      ctx.fillRect(x, y, p.width, 8);
      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(x, y + 8, p.width, p.height - 8);
      // Dirt texture
      ctx.fillStyle = '#5a3800';
      for (let i = 0; i < p.width; i += 20) {
        ctx.fillRect(x + i + 5, y + 15, 6, 4);
        ctx.fillRect(x + i + 12, y + 25, 4, 3);
      }
      break;
      
    case 'brick':
      ctx.fillStyle = COLORS.brick;
      ctx.fillRect(x, y, p.width, p.height);
      ctx.fillStyle = COLORS.brickDark;
      ctx.strokeStyle = COLORS.brickDark;
      ctx.lineWidth = 1;
      // Brick pattern
      for (let bx = 0; bx < p.width; bx += 20) {
        for (let by = 0; by < p.height; by += 10) {
          const offset = (by / 10) % 2 === 0 ? 0 : 10;
          ctx.strokeRect(x + bx + offset, y + by, 20, 10);
        }
      }
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x, y, p.width, 3);
      break;
      
    case 'question':
      const bounce = p.hit ? 0 : Math.sin(Date.now() * 0.005) * 2;
      ctx.fillStyle = p.hit ? '#8b6914' : COLORS.question;
      ctx.fillRect(x, y + bounce, p.width, p.height);
      ctx.fillStyle = p.hit ? '#5a4510' : COLORS.questionDark;
      ctx.strokeStyle = p.hit ? '#5a4510' : COLORS.questionDark;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2 + bounce, p.width - 4, p.height - 4);
      if (!p.hit) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?', x + p.width / 2, y + p.height / 2 + 7 + bounce);
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x + 4, y + 4 + bounce, 8, 8);
      }
      break;
      
    case 'moving':
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(x, y, p.width, p.height);
      ctx.fillStyle = '#66aaff';
      ctx.fillRect(x, y, p.width, 4);
      ctx.fillStyle = '#2266cc';
      ctx.fillRect(x, y + p.height - 4, p.width, 4);
      // Arrow indicators
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('◄►', x + p.width / 2, y + p.height / 2 + 4);
      break;
      
    case 'cloud':
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      const cx = x + p.width / 2;
      const cy = y + p.height / 2;
      ctx.ellipse(cx, cy, p.width / 2, p.height / 2 + 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 5, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 12, cy - 3, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

function drawMouse(ctx: CanvasRenderingContext2D, m: Mouse, camera: { x: number; y: number }) {
  const x = m.x - camera.x;
  const y = m.y - camera.y;
  
  if (!m.isAlive) {
    if (m.squishTimer > 0) {
      // Squished mouse
      ctx.fillStyle = COLORS.mouse;
      ctx.fillRect(x, y + m.height - 8, m.width, 8);
      ctx.fillStyle = '#ff0000';
      ctx.font = '10px Arial';
      ctx.fillText('X_X', x + 4, y + m.height - 2);
    }
    return;
  }
  
  const bobY = Math.sin(m.frameTimer * 0.2) * 2;
  
  // Body
  ctx.fillStyle = m.type === 'big' ? '#666' : COLORS.mouse;
  ctx.beginPath();
  ctx.ellipse(x + m.width / 2, y + m.height / 2 + bobY, m.width / 2, m.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears
  ctx.fillStyle = m.type === 'big' ? '#555' : COLORS.mouseDark;
  ctx.beginPath();
  ctx.ellipse(x + m.width * 0.3, y + 2 + bobY, 6, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + m.width * 0.7, y + 2 + bobY, 6, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner ears
  ctx.fillStyle = '#ffaaaa';
  ctx.beginPath();
  ctx.ellipse(x + m.width * 0.3, y + 4 + bobY, 3, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + m.width * 0.7, y + 4 + bobY, 3, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes (angry red for big mice)
  ctx.fillStyle = m.type === 'big' ? '#ff0000' : '#000';
  ctx.beginPath();
  ctx.arc(x + m.width * 0.35, y + m.height * 0.4 + bobY, m.type === 'big' ? 4 : 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + m.width * 0.65, y + m.height * 0.4 + bobY, m.type === 'big' ? 4 : 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + m.width * 0.35 + 1, y + m.height * 0.35 + bobY, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + m.width * 0.65 + 1, y + m.height * 0.35 + bobY, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#ff6699';
  ctx.beginPath();
  ctx.arc(x + m.width / 2, y + m.height * 0.55 + bobY, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Whiskers
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + m.width * 0.3, y + m.height * 0.55 + bobY);
  ctx.lineTo(x - 5, y + m.height * 0.5 + bobY);
  ctx.moveTo(x + m.width * 0.3, y + m.height * 0.6 + bobY);
  ctx.lineTo(x - 5, y + m.height * 0.65 + bobY);
  ctx.moveTo(x + m.width * 0.7, y + m.height * 0.55 + bobY);
  ctx.lineTo(x + m.width + 5, y + m.height * 0.5 + bobY);
  ctx.moveTo(x + m.width * 0.7, y + m.height * 0.6 + bobY);
  ctx.lineTo(x + m.width + 5, y + m.height * 0.65 + bobY);
  ctx.stroke();
  
  // Tail
  ctx.strokeStyle = '#ff9999';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + m.width, y + m.height * 0.7 + bobY);
  ctx.quadraticCurveTo(x + m.width + 15, y + m.height * 0.5 + bobY + Math.sin(m.frameTimer * 0.3) * 5, x + m.width + 10, y + m.height * 0.3 + bobY);
  ctx.stroke();
  
  // Speed lines for fast mice
  if (m.type === 'fast') {
    ctx.strokeStyle = 'rgba(255,255,0,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + m.width + 5, y + 5 + i * 7 + bobY);
      ctx.lineTo(x + m.width + 15 + Math.random() * 5, y + 5 + i * 7 + bobY);
      ctx.stroke();
    }
  }
  
  // Crown for big mice
  if (m.type === 'big') {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(x + m.width * 0.25, y - 2 + bobY);
    ctx.lineTo(x + m.width * 0.35, y - 10 + bobY);
    ctx.lineTo(x + m.width * 0.45, y - 4 + bobY);
    ctx.lineTo(x + m.width * 0.55, y - 12 + bobY);
    ctx.lineTo(x + m.width * 0.65, y - 4 + bobY);
    ctx.lineTo(x + m.width * 0.75, y - 10 + bobY);
    ctx.lineTo(x + m.width * 0.85, y - 2 + bobY);
    ctx.fill();
  }
}

function drawCoin(ctx: CanvasRenderingContext2D, c: Coin, camera: { x: number; y: number }) {
  const x = c.x - camera.x;
  const y = c.y - camera.y;
  const bob = Math.sin(Date.now() * 0.004 + c.x) * 3;
  
  if (c.type === 'golden') {
    // Golden coin (Solana themed)
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10 + bob, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9933';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10 + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('S', x + 10, y + 14 + bob);
    // Glow
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x + 10, y + 10 + bob, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    // Fish coin
    ctx.fillStyle = '#44bbff';
    ctx.beginPath();
    const fishBob = bob;
    // Fish body
    ctx.ellipse(x + 10, y + 10 + fishBob, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fish tail
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 10 + fishBob);
    ctx.lineTo(x + 24, y + 5 + fishBob);
    ctx.lineTo(x + 24, y + 15 + fishBob);
    ctx.closePath();
    ctx.fill();
    // Fish eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 6, y + 9 + fishBob, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 5.5, y + 8.5 + fishBob, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, camera: { x: number; y: number }) {
  const x = player.x - camera.x;
  const y = player.y - camera.y;
  const flip = player.facing === 'left';
  
  // Invincibility flash
  if (player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) {
    ctx.globalAlpha = 0.5;
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
  const stretch = player.isJumping ? 1.1 : 1;
  
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 2, w * 0.4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.fillStyle = COLORS.cat;
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.6, w * 0.4 * squish, h * 0.35 * stretch, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = COLORS.cat;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.3, w * 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears
  ctx.fillStyle = COLORS.catDark;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.15);
  ctx.lineTo(w * 0.1, h * -0.05);
  ctx.lineTo(w * 0.35, h * 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.8, h * 0.15);
  ctx.lineTo(w * 0.9, h * -0.05);
  ctx.lineTo(w * 0.65, h * 0.1);
  ctx.fill();
  
  // Inner ears
  ctx.fillStyle = '#ffaaaa';
  ctx.beginPath();
  ctx.moveTo(w * 0.22, h * 0.15);
  ctx.lineTo(w * 0.15, h * 0.0);
  ctx.lineTo(w * 0.32, h * 0.12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.78, h * 0.15);
  ctx.lineTo(w * 0.85, h * 0.0);
  ctx.lineTo(w * 0.68, h * 0.12);
  ctx.fill();
  
  // Face - THE ICONIC HUH FACE
  // Eyes (wide, confused)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(w * 0.35, h * 0.28, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.65, h * 0.28, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils (looking confused/up)
  ctx.fillStyle = '#000';
  const pupilOffY = player.isJumping ? -2 : 0;
  ctx.beginPath();
  ctx.arc(w * 0.37, h * 0.28 + pupilOffY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.67, h * 0.28 + pupilOffY, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(w * 0.35, h * 0.26 + pupilOffY, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.65, h * 0.26 + pupilOffY, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Confused eyebrows
  ctx.strokeStyle = COLORS.catDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.22, h * 0.18);
  ctx.lineTo(w * 0.42, h * 0.22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.78, h * 0.22);
  ctx.lineTo(w * 0.58, h * 0.18);
  ctx.stroke();
  
  // Mouth (confused "o" shape - the HUH expression)
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.4, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff6666';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.41, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Whiskers
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.35);
  ctx.lineTo(w * 0.0, h * 0.32);
  ctx.moveTo(w * 0.2, h * 0.4);
  ctx.lineTo(w * 0.0, h * 0.42);
  ctx.moveTo(w * 0.8, h * 0.35);
  ctx.lineTo(w * 1.0, h * 0.32);
  ctx.moveTo(w * 0.8, h * 0.4);
  ctx.lineTo(w * 1.0, h * 0.42);
  ctx.stroke();
  
  // Tail
  ctx.strokeStyle = COLORS.catDark;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.6);
  const tailWag = Math.sin(Date.now() * 0.008) * 10;
  ctx.quadraticCurveTo(w * -0.2, h * 0.4 + tailWag, w * -0.1, h * 0.2 + tailWag);
  ctx.stroke();
  
  // Feet
  ctx.fillStyle = COLORS.catDark;
  const walkCycle = Math.sin(player.frameTimer * 0.3) * 3;
  if (!player.isJumping) {
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.92 + walkCycle, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h * 0.92 - walkCycle, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, camera: { x: number; y: number }) {
  const x = p.x - camera.x;
  const y = p.y - camera.y;
  const alpha = p.life / p.maxLife;
  
  ctx.globalAlpha = alpha;
  
  switch (p.type) {
    case 'star':
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.rotation || 0);
      drawStar(ctx, 0, 0, p.size);
      ctx.restore();
      break;
    case 'coin':
      ctx.fillStyle = p.color;
      ctx.font = `${p.size}px Arial`;
      ctx.fillText('✦', x, y);
      break;
    case 'dust':
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'stomp':
      ctx.fillStyle = p.color;
      ctx.font = `bold ${p.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('💥', x, y);
      break;
    default:
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
  }
  
  ctx.globalAlpha = 1;
}

function drawHuhText(ctx: CanvasRenderingContext2D, h: HuhText, camera: { x: number; y: number }) {
  const x = h.x - camera.x;
  const y = h.y - camera.y;
  const alpha = h.life / h.maxLife;
  const scale = h.scale * (1 + (1 - alpha) * 0.5);
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(Math.sin(Date.now() * 0.01) * 0.1);
  
  // Text shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.font = 'bold 28px "Comic Sans MS", cursive';
  ctx.textAlign = 'center';
  ctx.fillText(h.text, 2, 2);
  
  // Main text
  ctx.fillStyle = h.color;
  ctx.fillText(h.text, 0, 0);
  
  // Outline
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeText(h.text, 0, 0);
  
  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number) {
  // Score
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 200, 70);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 200, 70);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px "Comic Sans MS", cursive';
  ctx.textAlign = 'left';
  ctx.fillText(`🐱 SCORE: ${state.player.score}`, 20, 32);
  ctx.fillText(`🐭 MICE: ${state.mice.filter(m => !m.isAlive).length}`, 20, 52);
  ctx.fillText(`📏 DIST: ${Math.floor(state.distance)}m`, 20, 72);
  
  // Lives
  ctx.fillStyle = '#ff4444';
  ctx.font = '20px Arial';
  ctx.textAlign = 'right';
  for (let i = 0; i < state.player.lives; i++) {
    ctx.fillText('❤️', canvasWidth - 20 - i * 30, 30);
  }
  
  // Combo
  if (state.player.combo > 1) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px "Comic Sans MS", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(`COMBO x${state.player.combo}! 🔥`, canvasWidth / 2, 35);
  }
  
  // High score
  if (state.highScore > 0) {
    ctx.fillStyle = 'rgba(255,215,0,0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${state.highScore}`, canvasWidth - 20, 55);
  }
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
