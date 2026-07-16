/**
 * Lightweight SFX — Web Audio beeps/whooshes (works great on web + Expo web).
 * Native gets silent-safe stubs until packed audio assets ship.
 */
type Tone = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slide?: number;
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function beep(t: Tone) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = t.type ?? 'sine';
  osc.frequency.setValueAtTime(t.freq, ac.currentTime);
  if (t.slide) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, t.freq + t.slide),
      ac.currentTime + t.dur,
    );
  }
  const vol = t.gain ?? 0.08;
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(vol, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t.dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + t.dur + 0.02);
}

function noiseBurst(dur: number, gain = 0.05) {
  const ac = getCtx();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start();
}

export const Sfx = {
  unlock() {
    getCtx();
  },
  uiTap() {
    beep({ freq: 660, dur: 0.06, type: 'triangle', gain: 0.05 });
  },
  chargeTick(level: number) {
    beep({
      freq: 280 + level * 420,
      dur: 0.04,
      type: 'sine',
      gain: 0.03 + level * 0.03,
    });
  },
  dash(superDash = false) {
    beep({
      freq: superDash ? 180 : 220,
      dur: 0.18,
      type: 'sawtooth',
      gain: superDash ? 0.09 : 0.06,
      slide: superDash ? 480 : 320,
    });
    noiseBurst(0.12, superDash ? 0.07 : 0.04);
  },
  clash(perfect = false) {
    beep({
      freq: perfect ? 520 : 340,
      dur: 0.12,
      type: 'square',
      gain: perfect ? 0.1 : 0.07,
      slide: perfect ? 200 : 80,
    });
    noiseBurst(0.15, perfect ? 0.09 : 0.05);
    if (perfect) {
      beep({ freq: 880, dur: 0.2, type: 'triangle', gain: 0.06 });
    }
  },
  win() {
    beep({ freq: 523, dur: 0.12, type: 'triangle', gain: 0.07 });
    setTimeout(() => beep({ freq: 659, dur: 0.12, type: 'triangle', gain: 0.07 }), 90);
    setTimeout(() => beep({ freq: 784, dur: 0.22, type: 'triangle', gain: 0.08 }), 180);
  },
  lose() {
    beep({ freq: 300, dur: 0.2, type: 'sawtooth', gain: 0.05, slide: -120 });
  },
  countdown(n: number) {
    beep({
      freq: n <= 0 ? 640 : 400,
      dur: n <= 0 ? 0.18 : 0.1,
      type: 'triangle',
      gain: 0.07,
    });
  },
};
