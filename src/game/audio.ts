let audioCtx: AudioContext | null = null;
let huhBuffer1: AudioBuffer | null = null;
let huhBuffer2: AudioBuffer | null = null;
let isAudioLoading = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

async function loadSoundBuffer(url: string): Promise<AudioBuffer | null> {
  try {
    const ctx = getAudioContext();
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.warn(`Failed to load audio sample from ${url}:`, err);
    return null;
  }
}

export async function initAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (!huhBuffer1 && !isAudioLoading) {
      isAudioLoading = true;
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      
      const [b1, b2] = await Promise.all([
        loadSoundBuffer(`${cleanBase}huh.mp3`),
        loadSoundBuffer(`${cleanBase}huh2.mp3`),
      ]);
      huhBuffer1 = b1;
      huhBuffer2 = b2;
      isAudioLoading = false;
    }
  } catch (e) {
    console.warn('initAudio error:', e);
  }
}

export function playHuhSound(pitch: number = 1) {
  try {
    const ctx = getAudioContext();
    const buffer = Math.random() > 0.4 ? huhBuffer1 : (huhBuffer2 || huhBuffer1);

    if (buffer) {
      // Play real Ben Cat vocal sample
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      source.buffer = buffer;
      source.playbackRate.value = pitch;
      
      gainNode.gain.setValueAtTime(0.85, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start(ctx.currentTime);
      return;
    }

    // Fallback synth sound if sample not yet loaded
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300 * pitch, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150 * pitch, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Audio context not ready
  }
}

export function playStompSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

export function playCoinSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

export function playJumpSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(280, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.12);
    
    gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

export function playDeathSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(360, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export function playPowerUpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.12);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.12);
    });
  } catch (e) {}
}

export function playComboSound(combo: number) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const baseFreq = 320 + combo * 90;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

export function playBrickBreakSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Punchy crunch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
    
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.16);
    
    // Crisp click / fracture
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(520, now);
    clickOsc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
    
    clickGain.gain.setValueAtTime(0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    
    clickOsc.start(now);
    clickOsc.stop(now + 0.08);
  } catch (e) {}
}

// Looping Background Music (BGM) Engine
let bgmAudio: HTMLAudioElement | null = null;
let bgmVolume = parseFloat(localStorage.getItem('huhcat_bgm_volume') || '0.5');
let bgmMuted = localStorage.getItem('huhcat_bgm_muted') === 'true';

export function getBgmAudio(): HTMLAudioElement {
  if (!bgmAudio) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    bgmAudio = new Audio(`${cleanBase}bgm.mp3`);
    bgmAudio.loop = true;
    bgmAudio.volume = bgmMuted ? 0 : bgmVolume;
  }
  return bgmAudio;
}

export function startBgm() {
  try {
    const audio = getBgmAudio();
    audio.volume = bgmMuted ? 0 : bgmVolume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy: will play on next user interaction
      });
    }
  } catch (e) {
    console.warn('startBgm error:', e);
  }
}

export function stopBgm() {
  if (bgmAudio) {
    bgmAudio.pause();
  }
}

export function setBgmVolume(val: number) {
  bgmVolume = Math.max(0, Math.min(1, val));
  localStorage.setItem('huhcat_bgm_volume', bgmVolume.toString());
  if (bgmAudio) {
    bgmAudio.volume = bgmMuted ? 0 : bgmVolume;
  }
}

export function getBgmVolume(): number {
  return bgmVolume;
}

export function isBgmMuted(): boolean {
  return bgmMuted;
}

export function setBgmMuted(muted: boolean) {
  bgmMuted = muted;
  localStorage.setItem('huhcat_bgm_muted', bgmMuted.toString());
  if (bgmAudio) {
    bgmAudio.volume = bgmMuted ? 0 : bgmVolume;
    if (!bgmMuted && bgmAudio.paused) {
      bgmAudio.play().catch(() => {});
    }
  }
}

export function toggleBgmMute(): boolean {
  setBgmMuted(!bgmMuted);
  return bgmMuted;
}
