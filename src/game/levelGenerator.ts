import { Platform, Mouse, Coin } from './types';

export function generateLevel(seed: number): { platforms: Platform[]; mice: Mouse[]; coins: Coin[]; levelLength: number } {
  const platforms: Platform[] = [];
  const mice: Mouse[] = [];
  const coins: Coin[] = [];
  
  const levelLength = 8000 + Math.floor(Math.random() * 4000);
  let x = 0;
  const groundY = 500;
  
  // 1. GUARANTEED SAFE SPAWN RUNWAY
  // Wide open starting track from x = 0 to 750 with zero overhead blocks
  const runwayWidth = 750;
  platforms.push({
    x: 0,
    y: groundY,
    width: runwayWidth,
    height: 40,
    type: 'ground'
  });
  
  // Welcome collectible coin arc on runway
  for (let i = 0; i < 5; i++) {
    coins.push({
      x: 220 + i * 90,
      y: groundY - 60 - Math.sin((i / 4) * Math.PI) * 35,
      width: 20,
      height: 20,
      collected: false,
      frame: 0,
      frameTimer: 0,
      type: i === 4 ? 'golden' : 'fish'
    });
  }
  
  // Single easy introductory mouse on runway
  mice.push({
    x: 520,
    y: groundY - 26,
    width: 28,
    height: 22,
    vx: -1.2,
    isAlive: true,
    frame: 0,
    frameTimer: 0,
    type: 'normal',
    direction: -1,
    squishTimer: 0
  });

  x = runwayWidth;
  
  // 2. PROCEDURAL LEVEL SEGMENTS
  while (x < levelLength) {
    const segmentRoll = Math.random();
    
    if (segmentRoll < 0.28) {
      // SEGMENT A: Ground gap with safe aerial stepping stones
      const gapWidth = 90 + Math.random() * 50; // 90px to 140px (well within 160px jump arc)
      x += gapWidth;
      
      // Elevated stepping platforms over the chasm
      const numPlatforms = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numPlatforms; i++) {
        const platX = x - gapWidth + (gapWidth / (numPlatforms + 1)) * (i + 1) - 35;
        const platY = groundY - 140 - Math.random() * 30;
        
        // Use 'cloud' or 'question' so platforms over gaps are stable
        const platType = Math.random() < 0.5 ? 'cloud' : 'question';
        platforms.push({
          x: platX,
          y: platY,
          width: 70,
          height: 20,
          type: platType,
          hit: false,
          coinCollected: false
        });
        
        coins.push({
          x: platX + 25,
          y: platY - 35,
          width: 20,
          height: 20,
          collected: false,
          frame: 0,
          frameTimer: 0,
          type: Math.random() < 0.2 ? 'golden' : 'fish'
        });
      }
      
      // Ground continues firmly after the gap
      const groundWidth = 280 + Math.random() * 200;
      platforms.push({
        x: x,
        y: groundY,
        width: groundWidth,
        height: 40,
        type: 'ground'
      });
      
      // Mice on landing ground
      if (Math.random() < 0.7) {
        const mouseType = Math.random() < 0.2 ? 'fast' : 'normal';
        mice.push({
          x: x + 80 + Math.random() * (groundWidth - 120),
          y: groundY - 26,
          width: 28,
          height: 22,
          vx: mouseType === 'fast' ? -2.2 : -1.4,
          isAlive: true,
          frame: 0,
          frameTimer: 0,
          type: mouseType,
          direction: -1,
          squishTimer: 0
        });
      }
      
      x += groundWidth;
    } else if (segmentRoll < 0.52) {
      // SEGMENT B: Floating stair boxes (air underneath so you can run under and jump)
      const steps = 3 + Math.floor(Math.random() * 2); // 3 to 4 steps
      const stepWidth = 55;
      const stepHeight = 70;
      const stepPlatH = 28;
      const hillBaseWidth = (steps * 2 + 1) * stepWidth + 60;
      
      // Continuous ground under entire mountain section
      platforms.push({
        x: x,
        y: groundY,
        width: hillBaseWidth,
        height: 40,
        type: 'ground'
      });
      
      for (let i = 0; i < steps; i++) {
        const stepY = groundY - 85 - i * stepHeight;
        platforms.push({
          x: x + 30 + i * stepWidth,
          y: stepY,
          width: stepWidth,
          height: stepPlatH,
          type: 'ground'
        });
        
        platforms.push({
          x: x + hillBaseWidth - 30 - (i + 1) * stepWidth,
          y: stepY,
          width: stepWidth,
          height: stepPlatH,
          type: 'ground'
        });
      }
      
      const peakY = groundY - 85 - steps * stepHeight;
      platforms.push({
        x: x + 30 + steps * stepWidth,
        y: peakY,
        width: stepWidth,
        height: stepPlatH,
        type: 'ground'
      });
      
      platforms.push({
        x: x + 30 + steps * stepWidth,
        y: peakY - 90,
        width: 40,
        height: 35,
        type: 'question',
        hit: false,
        coinCollected: false
      });
      
      coins.push({
        x: x + 30 + steps * stepWidth + 10,
        y: peakY - 135,
        width: 20,
        height: 20,
        collected: false,
        frame: 0,
        frameTimer: 0,
        type: 'golden'
      });
      
      // Enemy patrolling mountain peak
      mice.push({
        x: x + 30 + steps * stepWidth + 5,
        y: peakY - 26,
        width: 28,
        height: 22,
        vx: -1.0,
        isAlive: true,
        frame: 0,
        frameTimer: 0,
        type: 'normal',
        direction: -1,
        squishTimer: 0
      });
      
      x += hillBaseWidth;
    } else if (segmentRoll < 0.76) {
      // SEGMENT C: Moving tech platforms over low terrain
      const sectionWidth = 360 + Math.random() * 120;
      
      // Ground with a single jumpable trench
      const partWidth = sectionWidth / 2 - 40;
      platforms.push({
        x: x,
        y: groundY,
        width: partWidth,
        height: 40,
        type: 'ground'
      });
      platforms.push({
        x: x + partWidth + 80,
        y: groundY,
        width: partWidth,
        height: 40,
        type: 'ground'
      });
      
      // Smooth moving platform spanning trench
      const moveX = x + partWidth + 10;
      const moveY = groundY - 70;
      platforms.push({
        x: moveX,
        y: moveY,
        width: 75,
        height: 20,
        type: 'moving',
        moveDir: 1,
        moveRange: 45,
        originX: moveX
      });
      
      coins.push({
        x: moveX + 28,
        y: moveY - 35,
        width: 20,
        height: 20,
        collected: false,
        frame: 0,
        frameTimer: 0,
        type: 'golden'
      });
      
      x += sectionWidth;
    } else {
      // SEGMENT D: Classic Overhead Breakable Bricks & Solana Mystery Blocks
      // Generates modular 40px blocks with 130px clearance above ground
      // Cat (height 50) walks freely underneath, can jump up and SMASH blocks from below!
      const numBlocks = 4 + Math.floor(Math.random() * 4);
      const blockWidth = 40;
      const blockHeight = 35;
      const blockY = groundY - 200; // high enough to run under, still smashable on a jump
      const sectionWidth = numBlocks * blockWidth + 160;
      
      // Continuous ground
      platforms.push({
        x: x,
        y: groundY,
        width: sectionWidth,
        height: 40,
        type: 'ground'
      });
      
      for (let i = 0; i < numBlocks; i++) {
        const isQuestion = Math.random() < 0.3;
        const bX = x + 70 + i * blockWidth;
        
        platforms.push({
          x: bX,
          y: blockY,
          width: blockWidth,
          height: blockHeight,
          type: isQuestion ? 'question' : 'brick',
          hit: false,
          coinCollected: false
        });
        
        // High bonus coin perched on top of some breakable bricks
        if (!isQuestion && Math.random() < 0.45) {
          coins.push({
            x: bX + 10,
            y: blockY - 35,
            width: 20,
            height: 20,
            collected: false,
            frame: 0,
            frameTimer: 0,
            type: Math.random() < 0.2 ? 'golden' : 'fish'
          });
        }
      }
      
      // Mice patrol on ground under the blocks
      const numMice = 1 + Math.floor(Math.random() * 2);
      for (let m = 0; m < numMice; m++) {
        const mouseType = Math.random() < 0.2 ? 'big' : 'normal';
        mice.push({
          x: x + 90 + m * 90,
          y: groundY - (mouseType === 'big' ? 32 : 24),
          width: mouseType === 'big' ? 38 : 28,
          height: mouseType === 'big' ? 30 : 22,
          vx: mouseType === 'big' ? -0.9 : -1.4,
          isAlive: true,
          frame: 0,
          frameTimer: 0,
          type: mouseType,
          direction: -1,
          squishTimer: 0
        });
      }
      
      x += sectionWidth;
    }
  }
  
  // 3. FINAL VICTORY RUNWAY & FLAG ZONE
  platforms.push({
    x: x,
    y: groundY,
    width: 400,
    height: 40,
    type: 'ground'
  });
  
  // Final victory golden coin arc
  for (let i = 0; i < 6; i++) {
    coins.push({
      x: x + 50 + i * 40,
      y: groundY - 70 - Math.sin((i / 5) * Math.PI) * 40,
      width: 20,
      height: 20,
      collected: false,
      frame: 0,
      frameTimer: 0,
      type: 'golden'
    });
  }
  
  return { platforms, mice, coins, levelLength: x + 350 };
}
