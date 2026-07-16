import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export type ClipResult = {
  blobUrl?: string;
  uri?: string;
  mime: string;
  label: string;
};

type RecorderState = {
  recorder: MediaRecorder | null;
  chunks: Blob[];
  stream: MediaStream | null;
  overlay: HTMLDivElement | null;
  timer: ReturnType<typeof setTimeout> | null;
};

const state: RecorderState = {
  recorder: null,
  chunks: [],
  stream: null,
  overlay: null,
  timer: null,
};

function findGameCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvases = [...document.querySelectorAll('canvas')];
  // Prefer the largest WebGL canvas
  return (
    canvases.sort(
      (a, b) => b.width * b.height - a.width * a.height,
    )[0] ?? null
  );
}

function showBrandOverlay(label: string, names: string) {
  if (typeof document === 'undefined') return;
  hideBrandOverlay();
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'left:0',
    'right:0',
    'bottom:18%',
    'z-index:99999',
    'pointer-events:none',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'gap:6px',
    'font-family:system-ui,sans-serif',
    'text-align:center',
  ].join(';');
  el.innerHTML = `
    <div style="font-size:28px;font-weight:800;color:#FF6B9D;text-shadow:0 2px 12px rgba(0,0,0,.45)">${label}</div>
    <div style="font-size:15px;font-weight:700;color:#FFF8F0;text-shadow:0 2px 8px rgba(0,0,0,.4)">${names}</div>
    <div style="font-size:13px;font-weight:600;color:#FFE8D6;opacity:.9">Frog but(t) strong</div>
  `;
  document.body.appendChild(el);
  state.overlay = el;
}

function hideBrandOverlay() {
  state.overlay?.remove();
  state.overlay = null;
}

/** Start a short branded highlight capture (web MediaRecorder). */
export function startHighlightCapture(opts: {
  label: string;
  names: string;
  durationMs?: number;
}): Promise<ClipResult | null> {
  if (Platform.OS !== 'web') {
    return captureNativeStill(opts);
  }

  return new Promise((resolve) => {
    try {
      const canvas = findGameCanvas();
      if (!canvas || typeof (canvas as HTMLCanvasElement).captureStream !== 'function') {
        resolve(null);
        return;
      }

      showBrandOverlay(opts.label, opts.names);
      const stream = canvas.captureStream(30);
      state.stream = stream;
      state.chunks = [];

      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      state.recorder = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) state.chunks.push(e.data);
      };
      recorder.onstop = () => {
        hideBrandOverlay();
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(state.chunks, { type: mime || 'video/webm' });
        const blobUrl = URL.createObjectURL(blob);
        resolve({ blobUrl, mime: blob.type || 'video/webm', label: opts.label });
        state.recorder = null;
        state.chunks = [];
        state.stream = null;
      };

      recorder.start(100);
      const duration = opts.durationMs ?? 2800;
      state.timer = setTimeout(() => {
        if (state.recorder && state.recorder.state !== 'inactive') {
          state.recorder.stop();
        }
      }, duration);
    } catch {
      hideBrandOverlay();
      resolve(null);
    }
  });
}

async function captureNativeStill(opts: {
  label: string;
  names: string;
}): Promise<ClipResult | null> {
  try {
    // Branded text card as shareable still when video encode isn't available
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, 0, 1280);
      g.addColorStop(0, '#1A1028');
      g.addColorStop(1, '#FF6B9D');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 720, 1280);
      ctx.fillStyle = '#FFF8F0';
      ctx.font = 'bold 48px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Frog but(t) strong', 360, 180);
      ctx.fillStyle = '#FFC2D1';
      ctx.font = 'bold 56px system-ui';
      ctx.fillText(opts.label, 360, 640);
      ctx.fillStyle = '#FFF8F0';
      ctx.font = '28px system-ui';
      ctx.fillText(opts.names, 360, 720);
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      const uri = `${FileSystem.cacheDirectory}frog-highlight.png`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return { uri, mime: 'image/png', label: opts.label };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function shareClip(clip: ClipResult): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && clip.blobUrl) {
      const a = document.createElement('a');
      a.href = clip.blobUrl;
      a.download = `frog-butt-${Date.now()}.webm`;
      a.click();
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const blob = await fetch(clip.blobUrl).then((r) => r.blob());
          const file = new File([blob], 'frog-butt-clash.webm', { type: clip.mime });
          await navigator.share({
            files: [file],
            title: 'Frog but(t) strong',
            text: clip.label,
          });
        } catch {
          /* download already triggered */
        }
      }
      return true;
    }
    if (clip.uri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(clip.uri, {
        mimeType: clip.mime,
        dialogTitle: 'Share that clap',
      });
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/** Share a frog card image (creator). */
export async function shareFrogCard(opts: {
  name: string;
  tagline: string;
  cheekScale: number;
}): Promise<boolean> {
  try {
    if (typeof document === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 900, 1100);
    g.addColorStop(0, '#FFE8D6');
    g.addColorStop(0.5, '#FFD6E0');
    g.addColorStop(1, '#FF8FAB');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 900, 1100);

    // Cheek blobs
    const r = 90 + opts.cheekScale * 70;
    ctx.fillStyle = 'rgba(255,107,157,0.55)';
    ctx.beginPath();
    ctx.ellipse(320, 620, r, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(580, 620, r, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3A2E28';
    ctx.font = 'bold 64px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(opts.name, 450, 280);
    ctx.font = '28px system-ui';
    ctx.fillStyle = 'rgba(58,46,40,0.7)';
    ctx.fillText(opts.tagline, 450, 340);
    ctx.fillStyle = '#FF6B9D';
    ctx.font = 'bold 36px system-ui';
    ctx.fillText('Frog but(t) strong', 450, 980);
    ctx.fillStyle = 'rgba(58,46,40,0.55)';
    ctx.font = '22px system-ui';
    ctx.fillText(`cheek scale ${opts.cheekScale.toFixed(2)}x · share your frog`, 450, 1030);

    if (Platform.OS === 'web') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-frog-${opts.name.replace(/\s+/g, '-')}.png`;
      a.click();
      return true;
    }

    const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    const uri = `${FileSystem.cacheDirectory}frog-card.png`;
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your frog' });
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
