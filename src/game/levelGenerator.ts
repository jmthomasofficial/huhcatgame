import { Platform, Mouse, Coin } from './types';

export function generateLevel(seed: number): { platforms: Platform[]; mice: Mouse[]; coins: Coin[]; levelLength: number } {
  const platforms: Platform[] = [];
  const mice: Mouse[] = [];
  const coins: Coin[] = [];
  
  const levelLength = 8000 + Math.floor(Math.random() * 4000);
  let x = 0;
  let groundY = 500;
  
  // Starting ground
  platforms.push({
    x: 0, y: groundY, width: 400, height: 40, type: 'ground'
  });
  
  x = 400;
  
  while (x < levelLength) {
    const segmentType = Math.random();
    
    if (segmentType < 0.3) {
      // Ground gap with floating platforms
      const gapWidth = 80 + Math.random() * 120;
      x += gapWidth;
      
      // Floating platforms over the gap
      const numPlatforms = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numPlatforms; i++) {
        const platX = x - gapWidth + (gapWidth / (numPlatforms + 1)) * (i + 1);
        const platY = groundY - 60 - Math.random() * 100;
        const platType = Math.random() < 0.3 ? 'question' : (Math.random() < 0.2 ? 'cloud' : 'brick');
        
        platforms.push({
          x: platX, y: platY, width: 80 + Math.random() * 40, height: 20,
          type: platType as Platform['type'],
          hit: false,
          coinCollected: false
        });
        
        // Add coins above platforms
        if (Math.random() < 0.5) {
          coins.push({
            x: platX + 20, y: platY - 40, width: 20, height: 20,
            collected: false, frame: 0, frameTimer: 0,
            type: Math.random() < 0.15 ? 'golden' : 'fish'
          });
        }
      }
      
      // Ground continues after gap
      const groundWidth = 200 + Math.random() * 300;
      platforms.push({
        x: x, y: groundY, width: groundWidth, height: 40, type: 'ground'
      });
      
      // Add mice on ground
      if (Math.random() < 0.6) {
        const mouseType = Math.random() < 0.15 ? 'big' : (Math.random() < 0.3 ? 'fast' : 'normal');
        mice.push({
          x: x + 50 + Math.random() * (groundWidth - 100),
          y: groundY - 30,
          width: mouseType === 'big' ? 40 : 28,
          height: mouseType === 'big' ? 30 : 22,
          vx: mouseType === 'fast' ? -2.5 : (mouseType === 'big' ? -0.8 : -1.5),
          isAlive: true,
          frame: 0,
          frameTimer: 0,
          type: mouseType,
          direction: -1,
          squishTimer: 0
        });
      }
      
      x += groundWidth;
    } else if (segmentType < 0.55) {
      // Staircase section
      const steps = 3 + Math.floor(Math.random() * 4);
      const stepWidth = 60;
      const stepHeight = 30;
      const direction = Math.random() < 0.5 ? 1 : -1;
      
      for (let i = 0; i < steps; i++) {
        const stepX = x + i * stepWidth;
        const stepY = groundY - (direction > 0 ? (i + 1) * stepHeight : (steps - i) * stepHeight);
        
        platforms.push({
          x: stepX, y: stepY, width: stepWidth, height: 20, type: 'brick'
        });
        
        if (Math.random() < 0.4) {
          coins.push({
            x: stepX + 20, y: stepY - 35, width: 20, height: 20,
            collected: false, frame: 0, frameTimer: 0, type: 'fish'
          });
        }
      }
      
      // Ground under staircase
      platforms.push({
        x: x, y: groundY, width: steps * stepWidth + 50, height: 40, type: 'ground'
      });
      
      // Mouse at top
      if (Math.random() < 0.5) {
        mice.push({
          x: x + steps * stepWidth - 40,
          y: groundY - (direction > 0 ? steps * stepHeight : stepHeight) - 30,
          width: 28, height: 22,
          vx: -1.5, isAlive: true, frame: 0, frameTimer: 0,
          type: 'normal', direction: -1, squishTimer: 0
        });
      }
      
      x += steps * stepWidth + 50;
    } else if (segmentType < 0.75) {
      // Moving platforms section
      const sectionWidth = 300 + Math.random() * 200;
      
      // Ground with gaps
      const groundParts = 2 + Math.floor(Math.random() * 2);
      const partWidth = sectionWidth / groundParts;
      
      for (let i = 0; i < groundParts; i++) {
        platforms.push({
          x: x + i * partWidth, y: groundY, width: partWidth - 60, height: 40, type: 'ground'
        });
      }
      
      // Moving platforms
      const numMoving = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numMoving; i++) {
        const moveX = x + (sectionWidth / numMoving) * i + 30;
        const moveY = groundY - 80 - Math.random() * 80;
        
        platforms.push({
          x: moveX, y: moveY, width: 70, height: 20,
          type: 'moving',
          moveDir: 1,
          moveRange: 60 + Math.random() * 40,
          originX: moveX
        });
        
        coins.push({
          x: moveX + 25, y: moveY - 35, width: 20, height: 20,
          collected: false, frame: 0, frameTimer: 0, type: 'fish'
        });
      }
      
      x += sectionWidth;
    } else if (segmentType < 0.9) {
      // Question block row
      const numBlocks = 3 + Math.floor(Math.random() * 5);
      const blockY = groundY - 100 - Math.random() * 60;
      
      // Ground underneath
      platforms.push({
        x: x - 20, y: groundY, width: numBlocks * 50 + 40, height: 40, type: 'ground'
      });
      
      for (let i = 0; i < numBlocks; i++) {
        const isQuestion = Math.random() < 0.4;
        platforms.push({
          x: x + i * 50, y: blockY, width: 40, height: 40,
          type: isQuestion ? 'question' : 'brick',
          hit: false,
          coinCollected: false
        });
      }
      
      // Mice between blocks
      if (Math.random() < 0.7) {
        mice.push({
          x: x + Math.random() * (numBlocks * 50),
          y: groundY - 30,
          width: 28, height: 22,
          vx: -1.5, isAlive: true, frame: 0, frameTimer: 0,
          type: Math.random() < 0.2 ? 'fast' : 'normal',
          direction: -1, squishTimer: 0
        });
      }
      
      x += numBlocks * 50 + 40;
    } else {
      // Long ground with enemies
      const groundWidth = 300 + Math.random() * 400;
      platforms.push({
        x: x, y: groundY, width: groundWidth, height: 40, type: 'ground'
      });
      
      // Multiple mice
      const numMice = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numMice; i++) {
        const mouseType = Math.random() < 0.1 ? 'big' : (Math.random() < 0.3 ? 'fast' : 'normal');
        mice.push({
          x: x + 50 + (groundWidth / numMice) * i,
          y: groundY - 30,
          width: mouseType === 'big' ? 40 : 28,
          height: mouseType === 'big' ? 30 : 22,
          vx: mouseType === 'fast' ? -2.5 : (mouseType === 'big' ? -0.8 : -1.5),
          isAlive: true, frame: 0, frameTimer: 0,
          type: mouseType, direction: -1, squishTimer: 0
        });
      }
      
      // Coins in the air
      const numCoins = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numCoins; i++) {
        coins.push({
          x: x + 30 + (groundWidth / numCoins) * i,
          y: groundY - 80 - Math.random() * 60,
          width: 20, height: 20,
          collected: false, frame: 0, frameTimer: 0,
          type: Math.random() < 0.1 ? 'golden' : 'fish'
        });
      }
      
      x += groundWidth;
    }
    
    // Random gap between segments
    x += 20 + Math.random() * 40;
  }
  
  // End platform (flag area)
  platforms.push({
    x: x, y: groundY, width: 200, height: 40, type: 'ground'
  });
  
  return { platforms, mice, coins, levelLength: x + 200 };
}
