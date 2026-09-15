import { Orangie, GameState, Particle } from './types';

/**
 * Draw the Orangie penguin character as an authentic 3/4 animated canvas sprite.
 * Faithfully matches the reference image:
 * - Pure cream/white chubby face, cheeks, and forehead in the front
 * - Royal blue plumage strictly on the back of the head and neck
 * - Bright orange ribbed beanie with green pom-pom on top
 * - Black hoodie with thick puffy collar, green and white drawstring tips, and white logo
 * - Large expressive anime penguin eyes with dual specular glints
 * - Dynamically faces towards the approaching player
 */
export function drawOrangie(
  ctx: CanvasRenderingContext2D,
  orangie: Orangie,
  camera: { x: number; y: number },
  time: number,
  playerX?: number
) {
  if (orangie.collected && !orangie.flyingAway) return;

  const x = orangie.x - camera.x;
  const y = orangie.y - camera.y;
  const bob = Math.sin(orangie.bobTimer * 3) * 2.5;
  const wave = Math.sin(orangie.waveTimer * 4) * 0.25;

  ctx.save();
  ctx.translate(x + orangie.width / 2, y + orangie.height / 2 + bob);

  // Flying away upward fade
  if (orangie.flyingAway) {
    const alpha = Math.max(0, 1 - (orangie.flyAwayVy < -5 ? 0.4 : 0));
    ctx.globalAlpha = alpha;
  }

  // Golden aura glow when waiting on platform
  if (!orangie.collected) {
    ctx.save();
    const glowRadius = 38 + Math.sin(time * 4) * 5;
    const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, glowRadius);
    aura.addColorStop(0, 'rgba(255, 180, 0, 0.3)');
    aura.addColorStop(0.5, 'rgba(255, 215, 0, 0.12)');
    aura.addColorStop(1, 'rgba(255, 180, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Face toward approaching player: if Ben Cat is to the left, flip so white face points left!
  const facingLeft = playerX !== undefined ? playerX < orangie.x : true;
  if (facingLeft) {
    ctx.scale(-1, 1);
  }

  // Draw Orangie 3/4 Sprite (base model facing RIGHT)
  drawOrangieBase(ctx, time, wave, false);

  ctx.restore();

  // Floating powerup indicator badge (drawn in normal orientation, not flipped)
  if (!orangie.collected) {
    ctx.save();
    const badgeX = x + orangie.width / 2;
    const badgeY = y - 16 + Math.sin(time * 5) * 3;
    const icon = getPowerupIcon(orangie.powerup);

    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(13, 17, 28, 0.85)';
    ctx.beginPath();
    ctx.roundRect(badgeX - 18, badgeY - 10, 36, 20, 10);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(badgeX - 18, badgeY - 10, 36, 20, 10);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, badgeX, badgeY);
    ctx.restore();
  }
}

/**
 * Core 3/4 Orangie sprite renderer (facing RIGHT).
 * When flipped via scale(-1, 1), faces LEFT toward oncoming player.
 */
function drawOrangieBase(
  ctx: CanvasRenderingContext2D,
  time: number,
  wave: number,
  isCutscene: boolean = false
) {
  const hx = 0;
  const hy = -12;

  // === 1. FEET ===
  const footWobble = Math.sin(time * 3) * 1.2;
  ctx.fillStyle = '#f97316';
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 1.2;
  // Back foot
  ctx.beginPath();
  ctx.ellipse(-6 + footWobble * 0.4, 22, 6, 3.2, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Front foot
  ctx.beginPath();
  ctx.ellipse(7 - footWobble * 0.4, 22, 7, 3.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // === 2. BODY & HOODIE ===
  ctx.fillStyle = '#141416';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 6, 17, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White chest/belly contour on front
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(6, 7, 8, 12, 0.15, -Math.PI * 0.45, Math.PI * 0.55);
  ctx.fill();

  // Drawstrings with iconic green and white aglets
  ctx.strokeStyle = '#52525b';
  ctx.lineWidth = 1.4;
  // Left string (Green)
  ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-3, 11); ctx.stroke();
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(-4.5, 11, 3.2, 4.8);

  // Right string (White)
  ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(4, 12); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2.8, 12, 3.2, 4.8);

  // Thick Puffy Hoodie Collar
  ctx.fillStyle = '#222226';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -1, 15, 6, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Flipper Wing
  ctx.save();
  ctx.translate(13, 5);
  ctx.rotate(0.25 + wave * 0.8);
  ctx.fillStyle = '#141416';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 5, 5, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // === 3. HEAD & FACE ===
  // A. Back of Head & Neck (Sky Blue #3b82f6 matching reference)
  // Sits strictly on the rear contour of the head
  ctx.fillStyle = '#3b82f6';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy - 11);
  ctx.quadraticCurveTo(hx - 18, hy - 3, hx - 17, hy + 5);
  ctx.quadraticCurveTo(hx - 14, hy + 11, hx - 4, hy + 10);
  ctx.quadraticCurveTo(hx - 10, hy + 3, hx - 8, hy - 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle shadow edge on blue skull
  ctx.fillStyle = 'rgba(29, 78, 216, 0.35)';
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy - 11);
  ctx.quadraticCurveTo(hx - 18, hy - 3, hx - 17, hy + 5);
  ctx.lineTo(hx - 12, hy + 5);
  ctx.quadraticCurveTo(hx - 14, hy - 2, hx - 7, hy - 11);
  ctx.closePath();
  ctx.fill();

  // B. ENTIRE CHUBBY WHITE FACE (Dominates 85% of head)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy - 11);
  ctx.lineTo(hx + 13, hy - 11); // forehead under beanie
  ctx.quadraticCurveTo(hx + 19, hy - 6, hx + 20, 0); // cheek contour
  ctx.quadraticCurveTo(hx + 21, hy + 7, hx + 16, hy + 10); // chubby jowl!
  ctx.quadraticCurveTo(hx + 8, hy + 13, hx + 2, hy + 10.5); // chin
  ctx.quadraticCurveTo(hx - 5, hy + 10.5, hx - 4, hy + 9); // throat
  ctx.quadraticCurveTo(hx - 9, hy + 3, hx - 8, hy - 11); // seam to blue
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Soft cute peach blush
  ctx.fillStyle = 'rgba(254, 205, 211, 0.45)';
  ctx.beginPath();
  ctx.ellipse(hx + 14, hy + 6, 4.5, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // === 4. EYES (BIG ADORABLE ANIME PENGUIN EYES) ===
  const eyeY = hy - 3;
  const blink = !isCutscene && (Math.floor(time * 0.4) % 5 === 0) && ((time * 0.4) % 1 < 0.07);

  if (blink) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(hx + 1.5, eyeY, 2.5, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx + 11.5, eyeY, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    // Left Eye (back eye)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(hx + 1.5, eyeY, 3.5, 5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Primary glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(hx + 0.8, eyeY - 1.6, 1.6, 2.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Secondary glint
    ctx.beginPath();
    ctx.arc(hx + 2.4, eyeY + 2, 1, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye (front eye, larger, closer to camera)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(hx + 11.5, eyeY + 0.8, 4.2, 5.8, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Primary glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(hx + 10.5, eyeY - 1.2, 2, 2.6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Secondary glint
    ctx.beginPath();
    ctx.arc(hx + 12.8, eyeY + 2.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // === 5. BEAK (CUTE SOFT ORANGE BEAK BETWEEN CHEEKS) ===
  const beakX = hx + 5.5;
  const beakY = hy + 2.5;
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(beakX, beakY - 2.8);
  ctx.quadraticCurveTo(beakX + 5.5, beakY - 1.2, beakX + 7.5, beakY);
  ctx.quadraticCurveTo(beakX + 5, beakY + 3.2, beakX, beakY + 3.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Beak mouth smile seam
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(beakX + 0.5, beakY + 0.3);
  ctx.lineTo(beakX + 6.5, beakY + 0.3);
  ctx.stroke();

  // === 6. BEANIE HAT (ORANGE KNIT WITH RIBBED CUFF & GREEN POM-POM) ===
  const beanieY = hy - 10;

  // Beanie Dome
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(hx - 13, beanieY);
  ctx.quadraticCurveTo(hx - 10, beanieY - 15, hx - 1, beanieY - 16);
  ctx.quadraticCurveTo(hx + 11, beanieY - 16, hx + 14, beanieY + 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Highlight line across top curve
  ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(hx, beanieY - 9, 8.5, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Wide Ribbed Cuff
  ctx.fillStyle = '#f97316';
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(hx - 14, beanieY - 3, 29, 7.5, 3);
  ctx.fill();
  ctx.stroke();

  // 5 Rib divider seams
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 1.3;
  const ribs = [-9, -4.5, 0, 4.5, 9];
  for (const rx of ribs) {
    ctx.beginPath();
    ctx.moveTo(hx + rx, beanieY - 3);
    ctx.lineTo(hx + rx, beanieY + 4.5);
    ctx.stroke();
  }

  // Fluffy Green Pom-Pom
  const pomX = hx - 2;
  const pomY = beanieY - 17;
  ctx.fillStyle = '#16a34a';
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(pomX, pomY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Texture dots
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(pomX - 2.8, pomY - 2.2, 2.6, 0, Math.PI * 2);
  ctx.arc(pomX + 2.8, pomY - 1.8, 2.4, 0, Math.PI * 2);
  ctx.arc(pomX, pomY + 2.5, 2.6, 0, Math.PI * 2);
  ctx.fill();
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

  // Rotating golden solar corona
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

  // Sun glow radial gradient
  const sunGlow = ctx.createRadialGradient(cx, orangieY, 10, cx, orangieY, 120);
  sunGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
  sunGlow.addColorStop(0.3, 'rgba(255, 165, 0, 0.3)');
  sunGlow.addColorStop(0.6, 'rgba(255, 140, 0, 0.1)');
  sunGlow.addColorStop(1, 'rgba(255, 140, 0, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(cx, orangieY, 120, 0, Math.PI * 2);
  ctx.fill();

  // Draw Orangie (large version for cutscene, perfectly rendered with pure white face)
  ctx.save();
  ctx.translate(cx, orangieY);
  const cutsceneScale = 2.4;
  ctx.scale(cutsceneScale, cutsceneScale);
  drawOrangieBase(ctx, t, Math.sin(t * 3) * 0.15, true);
  ctx.restore();

  // Golden sparkle cascade
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

  // Phase 3 (2.5s+): Text reveal
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
    ctx.fillText('ORANGIE BELIEVES IN YOU', cx, orangieY + 74);

    // Sub-text
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Space Mono", monospace';
    ctx.fillText('+1 LIFE RESTORED', cx, orangieY + 98);

    ctx.restore();
  }

  // Phase 4 (3.0-3.3s): Divine Flash
  if (t >= 3.0 && t < 3.3) {
    const flashAlpha = 1 - (t - 3.0) / 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.6})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}
