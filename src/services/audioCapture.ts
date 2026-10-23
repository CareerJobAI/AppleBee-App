/**
 * Audio Capture Service for Applebee Live Interview Intelligence
 * Handles media permissions, track lifecycles, and audio frequency analysis.
 */

export interface AudioCaptureCallbacks {
  onLevelChange?: (level: number) => void;
  onError?: (error: Error) => void;
  onPermissionStateChange?: (state: 'prompt' | 'granted' | 'denied') => void;
}

export class AudioCaptureService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private isCapturing = false;

  public async requestAndStart(callbacks?: AudioCaptureCallbacks): Promise<MediaStream> {
    if (this.isCapturing && this.mediaStream) {
      return this.mediaStream;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error('Microphone audio capture is not supported in this browser environment.');
      callbacks?.onError?.(err);
      throw err;
    }

    try {
      callbacks?.onPermissionStateChange?.('prompt');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      this.isCapturing = true;
      callbacks?.onPermissionStateChange?.('granted');

      // Initialize audio analysis for visual meter
      this.setupAudioAnalysis(stream, callbacks?.onLevelChange);

      // Listen for unexpected track endings (e.g. mic unplugged or revoked)
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          this.stop();
        };
      });

      return stream;
    } catch (err: any) {
      this.stop();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        callbacks?.onPermissionStateChange?.('denied');
        const permError = new Error('Microphone permission was denied. Please allow microphone access in your browser settings.');
        callbacks?.onError?.(permError);
        throw permError;
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        const notFoundError = new Error('No microphone device found on your system.');
        callbacks?.onError?.(notFoundError);
        throw notFoundError;
      } else {
        callbacks?.onError?.(err);
        throw err;
      }
    }
  }

  private setupAudioAnalysis(stream: MediaStream, onLevelChange?: (level: number) => void) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        if (!this.analyser || !this.isCapturing) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize 0 to 100 with sensitivity curve
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        onLevelChange?.(normalized);

        this.animationFrameId = requestAnimationFrame(checkAudioLevel);
      };

      this.animationFrameId = requestAnimationFrame(checkAudioLevel);
    } catch (e) {
      console.warn('Audio visualization analysis failed:', e);
    }
  }

  public stop() {
    this.isCapturing = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.analyser = null;
  }

  public getCapturingState(): boolean {
    return this.isCapturing;
  }
}

export const audioCapture = new AudioCaptureService();
