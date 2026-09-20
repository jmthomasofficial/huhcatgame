import { Platform, Mouse, Coin, Orangie, PowerupType } from './types';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateLevel(seed: number): { platforms: Platform[]; mice: Mouse[]; coins: Coin[]; orangies: Orangie[]; levelLength: number } {
  const rng = seededRandom(seed);
  const platforms: Platform[] = [];
  const mice: Mouse[] = [];
  const coins: Coin[] = [];
  const orangies: Orangie[] = [];
  
  const groundY = 500;
  const levelLength = 8000 + rng() * 4000;
  
  // Powerup types for Orangies
  const powerupTypes: PowerupType[] = ['doubleJump', 'extraLife', 'invincibility', 'scoreMultiplier', 'magnet'];
  
  // Start platform (Safe Spawn Runway)
  platforms.push({ x: 0, y: groundY, width: 750, height: 100, type: 'ground', zone: 1 });
  
  // Welcome coins
  for (let i = 0; i < 5; i++) {
    coins.push({ x: 300 + i * 40, y: groundY - 80, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
  }
  // Easy mouse
  mice.push({
    x: 600, y: groundY - 32, width: 32, height: 32, vx: -1.5,
    isAlive: true, frame: 0, frameTimer: 0, type: 'normal', direction: -1, squishTimer: 0
  });

  let x = 750;
  let shrinesPlaced = 0;
  
  function getZone(posX: number): number {
    return posX < 2000 ? 1 : posX < 5000 ? 2 : posX < 8000 ? 3 : 4;
  }

  while (x < levelLength - 1000) {
    const zone = getZone(x);
    const progress = x / levelLength;
    
    // Check if we should place a shrine (at ~25% and ~65%)
    if ((progress > 0.25 && shrinesPlaced === 0) || (progress > 0.65 && shrinesPlaced === 1)) {
      // SEGMENT H: Orangie's Shrine
      const groundWidth = 200;
      platforms.push({ x, y: groundY, width: groundWidth, height: 100, type: 'ground', zone });
      
      const pedX = x + groundWidth / 2 - 40;
      const pedY = groundY - 60;
      platforms.push({ x: pedX, y: pedY, width: 80, height: 20, type: 'cloud', zone });
      
      const pType = powerupTypes[Math.floor(rng() * powerupTypes.length)];
      orangies.push({
        x: pedX + 40 - 18,
        y: pedY - 44,
        width: 36,
        height: 44,
        collected: false,
        powerup: pType,
        bobTimer: rng() * Math.PI * 2,
        waveTimer: rng() * Math.PI * 2,
        happyTimer: 0,
        flyAwayVy: 0,
        flyingAway: false
      });
      
      // Coin arc leading to pedestal
      coins.push({ x: x + 40, y: groundY - 40, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
      coins.push({ x: x + 70, y: groundY - 80, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
      coins.push({ x: x + 130, y: groundY - 80, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
      coins.push({ x: x + 160, y: groundY - 40, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
      
      x += groundWidth;
      shrinesPlaced++;
      continue;
    }

    const roll = rng();
    let segmentType = '';
    
    if (zone === 1) {
      if (roll < 0.28) segmentType = 'A';
      else if (roll < 0.64) segmentType = 'F';
      else segmentType = 'B';
    } else if (zone === 2) {
      if (roll < 0.28) segmentType = 'A';
      else if (roll < 0.46) segmentType = 'B';
      else if (roll < 0.64) segmentType = 'D';
      else if (roll < 0.82) segmentType = 'F';
      else segmentType = 'C';
    } else if (zone === 3) {
      if (roll < 0.20) segmentType = 'A';
      else if (roll < 0.40) segmentType = 'C';
      else if (roll < 0.60) segmentType = 'D';
      else if (roll < 0.80) segmentType = 'E';
      else segmentType = 'G';
    } else { // zone 4
      if (roll < 0.20) segmentType = 'A';
      else if (roll < 0.35) segmentType = 'C';
      else if (roll < 0.50) segmentType = 'D';
      else if (roll < 0.65) segmentType = 'E';
      else if (roll < 0.80) segmentType = 'G';
      else segmentType = 'B';
    }

    if (segmentType === 'A') { // Ground Gap with stepping stones
      const gapWidth = zone < 3 ? 90 + rng() * 50 : 100 + rng() * 60;
      x += gapWidth;
      
      const numClouds = zone < 3 ? 1 : (rng() < 0.5 ? 1 : 2);
      for (let i = 0; i < numClouds; i++) {
        const cloudX = x - gapWidth + (gapWidth / (numClouds + 1)) * (i + 1) - 30;
        const cloudY = groundY - 50 - rng() * 40;
        platforms.push({ x: cloudX, y: cloudY, width: 60, height: 20, type: 'cloud', zone });
        
        coins.push({ x: cloudX + 18, y: cloudY - 40, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
      }
      
      const groundWidth = 280 + rng() * 200;
      platforms.push({ x, y: groundY, width: groundWidth, height: 100, type: 'ground', zone });
      
      if (rng() < 0.7) {
        const speed = zone < 3 ? 1.5 : (zone === 3 ? 2.5 : 3.5);
        const mType = zone >= 3 && rng() < 0.3 ? 'big' : (zone >= 2 && rng() < 0.4 ? 'fast' : 'normal');
        const mWidth = mType === 'big' ? 48 : 32;
        const mHeight = mType === 'big' ? 48 : 32;
        mice.push({
          x: x + groundWidth / 2, y: groundY - mHeight, width: mWidth, height: mHeight,
          vx: -speed, isAlive: true, frame: 0, frameTimer: 0, type: mType, direction: -1, squishTimer: 0
        });
      }
      
      x += groundWidth;

    } else if (segmentType === 'B') { // Stepped Hill (clean, open arch with generous clearance)
      const numSteps = 2; // 2 ascending, 1 peak, 2 descending (5 platforms total)
      const stepSpacing = 110;
      const groundWidth = 100 + (numSteps * 2) * stepSpacing + 120; // 660px
      platforms.push({ x, y: groundY, width: groundWidth, height: 100, type: 'ground', zone });
      
      let stepX = x + 80;
      // Ascending steps (elevated: groundY - 75, groundY - 115)
      for (let i = 0; i < numSteps; i++) {
        const stepY = groundY - 75 - i * 40;
        platforms.push({ x: stepX, y: stepY, width: 60, height: 18, type: 'cloud', zone });
        if (rng() < 0.5) {
          coins.push({ x: stepX + 18, y: stepY - 35, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
        }
        stepX += stepSpacing;
      }
      
      // Peak platform (groundY - 155) with question block above
      const peakX = stepX;
      const peakY = groundY - 75 - numSteps * 40;
      platforms.push({ x: peakX, y: peakY, width: 65, height: 18, type: 'cloud', zone });
      platforms.push({ x: peakX + 12, y: peakY - 60, width: 40, height: 35, type: 'question', zone });
      
      stepX += stepSpacing;
      // Descending steps
      for (let i = numSteps - 1; i >= 0; i--) {
        const stepY = groundY - 75 - i * 40;
        platforms.push({ x: stepX, y: stepY, width: 60, height: 18, type: 'cloud', zone });
        stepX += stepSpacing;
      }
      
      const mType = zone >= 3 ? (rng() < 0.5 ? 'big' : 'fast') : 'normal';
      const mWidth = mType === 'big' ? 48 : 32;
      const mHeight = mType === 'big' ? 48 : 32;
      mice.push({
        x: x + groundWidth - 80, y: groundY - mHeight, width: mWidth, height: mHeight,
        vx: -2, isAlive: true, frame: 0, frameTimer: 0, type: mType, direction: -1, squishTimer: 0
      });
      
      x += groundWidth;

    } else if (segmentType === 'C') { // Moving Platform
      const groundWidth1 = 200;
      platforms.push({ x, y: groundY, width: groundWidth1, height: 100, type: 'ground', zone });
      x += groundWidth1;
      
      // 80px gap was requested, making the trench itself small
      const trenchWidth = 160; 
      platforms.push({ x: x + 40, y: groundY - 70, width: 80, height: 20, type: 'moving', moveDir: 1, moveRange: 40, originX: x + 40, zone });
      coins.push({ x: x + trenchWidth / 2 - 12, y: groundY - 150, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'golden' });
      x += trenchWidth;
      
      const groundWidth2 = 200;
      platforms.push({ x, y: groundY, width: groundWidth2, height: 100, type: 'ground', zone });
      
      if (rng() < 0.6) {
        mice.push({
          x: x + groundWidth2 / 2, y: groundY - 32, width: 32, height: 32,
          vx: -2, isAlive: true, frame: 0, frameTimer: 0, type: 'normal', direction: -1, squishTimer: 0
        });
      }
      
      x += groundWidth2;

    } else if (segmentType === 'D') { // Overhead Bricks (fully reachable jump height + stepping stone)
      const groundWidth = 500 + rng() * 200;
      platforms.push({ x, y: groundY, width: groundWidth, height: 100, type: 'ground', zone });
      
      const numBlocks = 4 + Math.floor(rng() * 4);
      const startBlockX = x + 150;
      const blockY = groundY - 140; // 105px clearance (35px tall block), comfortably jumpable!
      
      // Stepping stone cloud before the brick row so player can choose to jump on top or run below
      platforms.push({ x: startBlockX - 60, y: groundY - 75, width: 50, height: 18, type: 'cloud', zone });

      for (let i = 0; i < numBlocks; i++) {
        const bX = startBlockX + i * 40;
        platforms.push({ x: bX, y: blockY, width: 40, height: 35, type: rng() < 0.3 ? 'question' : 'brick', zone });
        if (rng() < 0.4) {
          coins.push({ x: bX + 8, y: blockY - 35, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
        }
      }
      
      const numMice = zone >= 3 ? 2 : 1;
      for (let i = 0; i < numMice; i++) {
        const mX = startBlockX + numBlocks * 40 + 50 + i * 100;
        if (mX < x + groundWidth - 40) {
          const mType = zone >= 2 && rng() < 0.4 ? 'fast' : 'normal';
          mice.push({
            x: mX, y: groundY - 32, width: 32, height: 32,
            vx: -2, isAlive: true, frame: 0, frameTimer: 0, type: mType, direction: -1, squishTimer: 0
          });
        }
      }
      
      x += groundWidth;

    } else if (segmentType === 'E') { // Vertical Shaft
      const shaftWidth = 200;
      const numPlats = 4 + Math.floor(rng() * 2);
      
      let pY = groundY - 60;
      for (let i = 0; i < numPlats; i++) {
        const pX = x + (i % 2 === 0 ? 20 : shaftWidth - 80);
        platforms.push({ x: pX, y: pY, width: 60, height: 20, type: 'cloud', zone });
        pY -= 60;
      }
      
      coins.push({ x: x + shaftWidth / 2 - 12, y: pY - 20, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'golden' });
      
      x += shaftWidth;
      const groundWidth = 300;
      platforms.push({ x, y: groundY, width: groundWidth, height: 100, type: 'ground', zone });
      x += groundWidth;

    } else if (segmentType === 'F') { // Speed Run Corridor
      const groundWidth = 500 + rng() * 200;
      platforms.push({ x, y: groundY, width: groundWidth, height: 100, type: 'ground', zone });
      
      const numMice = 3 + Math.floor(rng() * 3);
      const startMouseX = x + 150;
      for (let i = 0; i < numMice; i++) {
        if (startMouseX + i * 80 < x + groundWidth - 50) {
          mice.push({
            x: startMouseX + i * 80, y: groundY - 32, width: 32, height: 32,
            vx: -1.5, isAlive: true, frame: 0, frameTimer: 0, type: 'normal', direction: -1, squishTimer: 0
          });
          
          coins.push({ x: startMouseX + i * 80 + 4, y: groundY - 120 + Math.sin(i) * 30, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
        }
      }
      
      x += groundWidth;

    } else if (segmentType === 'G') { // Puzzle Pit
      const pitWidth = 200;
      x += 50; // gap before pit
      
      platforms.push({ x: x + 20, y: groundY - 60, width: 40, height: 20, type: 'cloud', zone });
      platforms.push({ x: x + 80, y: groundY - 90, width: 40, height: 20, type: 'cloud', zone });
      platforms.push({ x: x + 140, y: groundY - 60, width: 40, height: 20, type: 'cloud', zone });
      
      coins.push({ x: x + 50, y: groundY - 120, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
      coins.push({ x: x + 110, y: groundY - 120, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'fish' });
      coins.push({ x: x + pitWidth / 2 - 12, y: groundY - 180, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'golden' });
      
      x += pitWidth + 50; // gap after pit
      
      const groundWidth = 250;
      platforms.push({ x, y: groundY, width: groundWidth, height: 100, type: 'ground', zone });
      x += groundWidth;
    }
  }

  // Final Victory Runway & Solana V1 Inscription Portal Tarmac
  // Guarantee a continuous, solid, unbreakable ground platform from current x all the way past the portal to levelLength + 800px!
  const victoryRunwayWidth = Math.max(900, (levelLength + 800) - x);
  platforms.push({ x, y: groundY, width: victoryRunwayWidth, height: 100, type: 'ground', zone: 4 });

  // Protective End Barrier Wall (Terminal Security Gate) at levelLength + 760
  // Ben Cat can never walk into the void or drop off
  platforms.push({ x: levelLength + 760, y: groundY - 260, width: 60, height: 260, type: 'brick', zone: 4 });

  // Triumphant Golden Coin Arc leading up to the Solana V1 Inscription Portal
  const coinStartX = levelLength - 380;
  for (let i = 0; i < 9; i++) {
    const cx = coinStartX + i * 42;
    const cy = groundY - 60 - Math.sin((i / 8) * Math.PI) * 75;
    coins.push({ x: cx, y: cy, width: 24, height: 24, collected: false, frame: 0, frameTimer: 0, type: 'golden' });
  }

  // Triumphant Victory Orangie waiting triumphantly past the portal
  orangies.push({
    x: levelLength + 90,
    y: groundY - 44,
    width: 36,
    height: 44,
    collected: false,
    powerup: 'extraLife',
    bobTimer: 0,
    waveTimer: 0,
    happyTimer: 0,
    flyAwayVy: 0,
    flyingAway: false
  });

  // Random Orangies on regular ground platforms
  const extraOrangies = 1 + Math.floor(rng() * 2);
  let placedExtraOrangies = 0;
  
  // Create a copy of ground platforms that are large enough
  const groundPlats = platforms.filter(p => p.type === 'ground' && p.width > 250 && p.x > 1500 && p.x < levelLength - 1000);
  
  // Shuffle them
  for (let i = groundPlats.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [groundPlats[i], groundPlats[j]] = [groundPlats[j], groundPlats[i]];
  }

  for (let i = 0; i < groundPlats.length && placedExtraOrangies < extraOrangies; i++) {
    const plat = groundPlats[i];
    // don't place if we already have one near here (e.g. from a shrine)
    const tooClose = orangies.some(o => Math.abs(o.x - plat.x) < 500);
    if (!tooClose) {
      const pType = powerupTypes[Math.floor(rng() * powerupTypes.length)];
      const ox = plat.x + plat.width / 2 - 18;
      const oy = plat.y - 44;
      orangies.push({
        x: ox,
        y: oy,
        width: 36,
        height: 44,
        collected: false,
        powerup: pType,
        bobTimer: rng() * Math.PI * 2,
        waveTimer: rng() * Math.PI * 2,
        happyTimer: 0,
        flyAwayVy: 0,
        flyingAway: false
      });
      placedExtraOrangies++;
    }
  }

  // Post-Generation Overlap Validator
  function aabbOverlap(p1: Platform, p2: Platform) {
    return p1.x < p2.x + p2.width &&
           p1.x + p1.width > p2.x &&
           p1.y < p2.y + p2.height &&
           p1.y + p1.height > p2.y;
  }

  // 1. Remove any overlapping non-ground platforms
  for (let i = 0; i < platforms.length; i++) {
    if (platforms[i].type === 'ground') continue;
    for (let j = i + 1; j < platforms.length; j++) {
      if (platforms[j].type === 'ground') continue;
      if (aabbOverlap(platforms[i], platforms[j])) {
        platforms.splice(j, 1);
        j--;
      }
    }
  }

  // 2. Guarantee minimum clearance: raise any floating platform that is less than 70px above the ground
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    if (p.type === 'ground') continue;
    for (const g of platforms) {
      if (g.type === 'ground' && p.x + p.width > g.x && p.x < g.x + g.width) {
        if (p.y + p.height > g.y - 65) {
          p.y = g.y - 70 - p.height;
        }
      }
    }
  }

  return { platforms, mice, coins, orangies, levelLength };
}
