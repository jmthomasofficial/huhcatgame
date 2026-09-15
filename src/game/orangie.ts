import { Orangie, GameState, Particle } from './types';

/**
 * Draw the Orangie penguin character as a fully custom canvas-drawn animated sprite.
 * Based on the reference image: penguin with orange beanie (green pom-pom),
 * black hoodie with "R" logo, white face/body, blue accents, orange beak, big eyes.
 * Flipped to face right (toward the player).
 */
export function drawOrangie(
  ctx: CanvasRenderingContext2D,
  orangie: Orangie,
  camera: { x: number; y: number },
  time: number
) {
  if (orangie.collected && !orangie.flyingAway) return;

  const x = orangie.x - camera.x;
  const y = orangie.y - camera.y;
  const bob = Math.sin(orangie.bobTimer * 3) * 3;
  const wave = Math.sin(orangie.waveTimer * 4) * 0.3;

  ctx.save();
  ctx.translate(x + orangie.width / 2, y + orangie.height / 2 + bob);

  // Flying away fade
  if (orangie.flyingAway) {
    const alpha = Math.max(0, 1 - (orangie.flyAwayVy < -6 ? 0.5 : 0));
    ctx.globalAlpha = alpha;
  }

  // Golden aura glow around Orangie
  if (!orangie.collected) {
    ctx.save();
    const glowRadius = 38 + Math.sin(time * 4) * 6;
    const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, glowRadius);
    aura.addColorStop(0, 'rgba(255, 165, 0, 0.25)');
    aura.addColorStop(0.5, 'rgba(255, 200, 0, 0.1)');
    aura.addColorStop(1, 'rgba(255, 165, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Scale for sprite drawing (centered at 0,0)
  const s = 1.0;
  ctx.scale(s, s);

  // === BODY ===
  // Main body (oval, white with slight blue tint)
  ctx.fillStyle = '#e8ecf0';
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 6, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hoodie / dark vest area
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(0, 8, 13, 15, 0, 0.3, Math.PI - 0.3);
  ctx.fill();

  // Hoodie neckline
  ctx.fillStyle = '#2d2d44';
  ctx.beginPath();
  ctx.ellipse(0, -2, 9, 4, 0, 0, Math.PI);
  ctx.fill();

  // Blue accent stripe on hoodie
  ctx.fillStyle = '#4a90d9';
  ctx.fillRect(-2, 4, 4, 12);

  // "R" logo on hoodie
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 7px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R', 0, 10);

  // White belly patch
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, 2, 7, 8, 0, Math.PI * 0.15, Math.PI * 0.85);
  ctx.fill();

  // === FEET ===
  const footWobble = Math.sin(time * 3) * 1.5;
  // Left foot
  ctx.fillStyle = '#ff8c00';
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(-6 + footWobble * 0.5, 23, 6, 3, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right foot
  ctx.beginPath();
  ctx.ellipse(6 - footWobble * 0.5, 23, 6, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // === WINGS/FLIPPERS ===
  ctx.save();
  // Left flipper (waving!)
  ctx.translate(-14, 2);
  ctx.rotate(-0.4 + wave);
  ctx.fillStyle = '#1a1a2e';
  ctx.strokeStyle = '#0f0f1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 6, 5, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  // Right flipper
  ctx.translate(14, 2);
  ctx.rotate(0.4 - wave * 0.5);
  ctx.fillStyle = '#1a1a2e';
  ctx.strokeStyle = '#0f0f1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 6, 5, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // === HEAD ===
  const hx = 0;
  const hy = -14;

  // Head circle (white)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 13, 12.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blue side patches (penguin markings)
  ctx.fillStyle = '#4a90d9';
  ctx.beginPath();
  ctx.ellipse(hx - 10, hy + 2, 5, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 10, hy + 2, 5, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // === EYES ===
  const eyeY = hy - 1;
  const blink = (Math.floor(time * 0.4) % 5 === 0) && ((time * 0.4) % 1 < 0.06);

  if (blink) {
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx - 4.5, eyeY, 2.5, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx + 4.5, eyeY, 2.5, 0, Math.PI);
    ctx.stroke();
  } else {
    // Left eye
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(hx - 4.5, eyeY, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Pupil
    ctx.fillStyle = '#0f0f1a';
    ctx.beginPath();
    ctx.ellipse(hx - 4, eyeY + 0.5, 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hx - 5, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(hx + 4.5, eyeY, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0f0f1a';
    ctx.beginPath();
    ctx.ellipse(hx + 4, eyeY + 0.5, 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hx + 3.5, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // === BEAK ===
  ctx.fillStyle = '#ff8c00';
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(hx - 3, hy + 4);
  ctx.lineTo(hx, hy + 7.5);
  ctx.lineTo(hx + 3, hy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === BEANIE HAT ===
  // Main beanie (orange)
  ctx.fillStyle = '#ff8c00';
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(hx, hy - 10, 11, 7, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Beanie brim
  ctx.fillStyle = '#e07000';
  ctx.beginPath();
  ctx.ellipse(hx, hy - 5, 13, 3.5, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Beanie fold line
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(hx, hy - 7, 10, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Green pom-pom on top
  ctx.fillStyle = '#2ecc71';
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(hx, hy - 17, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pom-pom fluff detail
  ctx.fillStyle = '#3ddc84';
  ctx.beginPath();
  ctx.arc(hx - 1.5, hy - 18, 2, 0, Math.PI * 2);
  ctx.fill();

  // === POWERUP INDICATOR ===
  if (!orangie.collected) {
    const iconY = -42 + Math.sin(time * 5) * 3;
    const icon = getPowerupIcon(orangie.powerup);

    // Floating powerup badge above head
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(-16, iconY - 8, 32, 16, 8);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-16, iconY - 8, 32, 16, 8);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 9px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 0, iconY);
    ctx.restore();
  }

  ctx.restore();
}

function getPowerupIcon(powerup: string): string {
  switch (powerup) {
    case 'doubleJump': return '⬆️⬆️';
    case 'extraLife': return '❤️+1';
    case 'invincibility': return '🛡️';
    case 'scoreMultiplier': return '×2';
    case 'magnet': return '🧲';
    default: return '🐧';
  }
}

/**
 * Draw the Orangie Divine Rescue cutscene.
 * Called when orangieRescueActive is true.
 */
export function drawOrangieRescue(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number
) {
  const t = state.orangieRescueTimer;
  const cx = canvasWidth / 2;

  // Phase 1 (0-1s): Screen dims
  const dimAlpha = Math.min(t / 1.0, 0.7);
  ctx.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Cinematic letterbox bars
  const barHeight = Math.min(t * 40, 40);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, barHeight);
  ctx.fillRect(0, canvasHeight - barHeight, canvasWidth, barHeight);

  if (t < 0.5) return; // Brief darkness before Orangie appears

  // Phase 2 (0.5-3s): Sun + Orangie descent
  const descentProgress = Math.min((t - 0.5) / 2.5, 1.0);
  const eased = 1 - Math.pow(1 - descentProgress, 3); // ease-out cubic
  const orangieY = -60 + eased * (canvasHeight * 0.4 + 60);

  // Sun rays (rotating)
  if (t > 0.5) {
    ctx.save();
    ctx.translate(cx, orangieY);
    ctx.rotate(t * 0.5);

    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayAlpha = 0.15 + Math.sin(t * 3 + i) * 0.08;
      ctx.fillStyle = `rgba(255, 200, 0, ${rayAlpha})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const innerSpread = 8;
      const outerSpread = 30 + Math.sin(t * 2 + i) * 10;
      const rayLen = 160 + Math.sin(t * 3 + i * 0.7) * 40;
      ctx.lineTo(
        Math.cos(angle - innerSpread * 0.01) * rayLen,
        Math.sin(angle - innerSpread * 0.01) * rayLen
      );
      ctx.lineTo(
        Math.cos(angle + innerSpread * 0.01) * rayLen,
        Math.sin(angle + innerSpread * 0.01) * rayLen
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Sun glow circle
  const sunGlow = ctx.createRadialGradient(cx, orangieY, 10, cx, orangieY, 120);
  sunGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
  sunGlow.addColorStop(0.3, 'rgba(255, 165, 0, 0.3)');
  sunGlow.addColorStop(0.6, 'rgba(255, 140, 0, 0.1)');
  sunGlow.addColorStop(1, 'rgba(255, 140, 0, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(cx, orangieY, 120, 0, Math.PI * 2);
  ctx.fill();

  // Draw Orangie (large version for cutscene)
  ctx.save();
  ctx.translate(cx, orangieY);
  const cutsceneScale = 2.2;
  ctx.scale(cutsceneScale, cutsceneScale);
  drawOrangieCutsceneSprite(ctx, t);
  ctx.restore();

  // Golden sparkle particles falling from Orangie
  if (t > 0.8) {
    ctx.save();
    for (let i = 0; i < 20; i++) {
      const sparkleT = (t * 3 + i * 0.5) % 3;
      const sx = cx + Math.sin(i * 2.3 + t) * 80;
      const sy = orangieY + sparkleT * 80;
      const sparkleAlpha = Math.max(0, 1 - sparkleT / 3);
      const sparkleSize = 2 + Math.sin(t * 5 + i) * 1.5;

      ctx.globalAlpha = sparkleAlpha * 0.8;
      ctx.fillStyle = i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ffffff' : '#ff8c00';
      ctx.beginPath();
      // Star sparkle shape
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 2 + i);
      ctx.fillRect(-sparkleSize, -1, sparkleSize * 2, 2);
      ctx.fillRect(-1, -sparkleSize, 2, sparkleSize * 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Phase 3 (3-3.5s): Text reveal
  if (t >= 2.5) {
    const textAlpha = Math.min((t - 2.5) / 0.5, 1.0);
    ctx.save();
    ctx.globalAlpha = textAlpha;

    // "ORANGIE BELIEVES IN YOU" text
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Syne", "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ORANGIE BELIEVES IN YOU', cx, orangieY + 70);

    // Sub-text
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Space Mono", monospace';
    ctx.fillText('+1 LIFE RESTORED', cx, orangieY + 95);

    ctx.restore();
  }

  // Phase 4 (3.5-5s): Flash and fade
  if (t >= 3.0 && t < 3.3) {
    const flashAlpha = 1 - (t - 3.0) / 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.6})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

/**
 * Draw the large Orangie sprite used in the divine rescue cutscene.
 * Origin at (0, 0), scaled up by caller.
 */
function drawOrangieCutsceneSprite(ctx: CanvasRenderingContext2D, time: number) {
  const wave = Math.sin(time * 3) * 0.15;

  // Body
  ctx.fillStyle = '#e8ecf0';
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 6, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hoodie
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(0, 8, 13, 15, 0, 0.3, Math.PI - 0.3);
  ctx.fill();

  // Blue stripe
  ctx.fillStyle = '#4a90d9';
  ctx.fillRect(-2, 4, 4, 12);

  // R logo
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 7px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R', 0, 10);

  // White belly
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, 2, 7, 8, 0, Math.PI * 0.15, Math.PI * 0.85);
  ctx.fill();

  // Feet
  ctx.fillStyle = '#ff8c00';
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(-6, 23, 6, 3, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(6, 23, 6, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wings (both waving in cutscene)
  ctx.save();
  ctx.translate(-14, 2);
  ctx.rotate(-0.6 + wave);
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(0, 6, 5, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(14, 2);
  ctx.rotate(0.6 - wave);
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(0, 6, 5, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head
  const hy = -14;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, hy, 13, 12.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blue patches
  ctx.fillStyle = '#4a90d9';
  ctx.beginPath();
  ctx.ellipse(-10, hy + 2, 5, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, hy + 2, 5, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (big and friendly in cutscene)
  const eyeY = hy - 1;
  // Left
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-4.5, eyeY, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f0f1a';
  ctx.beginPath();
  ctx.ellipse(-4, eyeY + 0.5, 2.2, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5, eyeY - 1.2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Right
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(4.5, eyeY, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f0f1a';
  ctx.beginPath();
  ctx.ellipse(4, eyeY + 0.5, 2.2, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(3.5, eyeY - 1.2, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Happy smile (cutscene = always smiling)
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, hy + 6, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Beak
  ctx.fillStyle = '#ff8c00';
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-3, hy + 4);
  ctx.lineTo(0, hy + 7.5);
  ctx.lineTo(3, hy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Beanie
  ctx.fillStyle = '#ff8c00';
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, hy - 10, 11, 7, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e07000';
  ctx.beginPath();
  ctx.ellipse(0, hy - 5, 13, 3.5, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Green pom-pom
  ctx.fillStyle = '#2ecc71';
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, hy - 17, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#3ddc84';
  ctx.beginPath();
  ctx.arc(-1.5, hy - 18, 2, 0, Math.PI * 2);
  ctx.fill();
}
