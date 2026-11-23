export type SfxId = 'pickup' | 'correct' | 'wrong' | 'hazard' | 'event' | 'win' | 'lose';

/** Phần HTMLAudioElement cần dùng, để test chạy được trên Node. */
export interface AudioChannel {
  preload: string;
  loop: boolean;
  playbackRate: number;
  currentTime: number;
  volume: number;
  play(): Promise<void> | void;
  pause(): void;
  removeAttribute?(name: string): void;
  load?(): void;
}

export type AudioFactory = (url: string) => AudioChannel;

/** Âm thanh tắt mặc định, tải theo nhu cầu và chịu được autoplay bị chặn. */
export class AudioManager {
  private muted = true;
  private suspended = false;
  private disposed = false;
  private concertActive = false;
  private rush = false;
  private musicPlaying = false;
  private music: AudioChannel | null = null;
  private readonly effects = new Map<SfxId, AudioChannel>();

  constructor(private readonly factory: AudioFactory = url => new Audio(url)) {}

  setMuted(muted: boolean): void {
    if (this.disposed) return;
    this.muted = muted;
    if (muted) this.pauseAll();
    else this.syncMusic();
  }

  play(name: SfxId): void {
    if (this.disposed || this.muted || this.suspended) return;
    const channel = this.effects.get(name) ?? this.create(`/audio/${name}.webm`, false);
    if (!channel) return;
    this.effects.set(name, channel);
    try { channel.currentTime = 0; } catch { /* Metadata may still be loading. */ }
    this.start(channel);
  }

  setConcert(active: boolean): void {
    if (this.disposed) return;
    this.concertActive = active;
    if (active) this.syncMusic();
    else if (this.music) {
      this.music.pause();
      this.musicPlaying = false;
      try { this.music.currentTime = 0; } catch { /* Metadata may still be loading. */ }
    }
  }

  setRush(active: boolean): void {
    this.rush = active;
    if (this.music) this.music.playbackRate = active ? 1.15 : 1;
  }

  suspend(): void {
    if (this.disposed) return;
    this.suspended = true;
    this.pauseAll();
  }

  resume(): void {
    if (this.disposed) return;
    this.suspended = false;
    this.syncMusic();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.pauseAll();
    const channels = [...this.effects.values(), ...(this.music ? [this.music] : [])];
    for (const channel of channels) {
      channel.removeAttribute?.('src');
      channel.load?.();
    }
    this.effects.clear();
    this.music = null;
  }

  private syncMusic(): void {
    if (this.disposed || this.muted || this.suspended || !this.concertActive || this.musicPlaying) return;
    this.music ??= this.create('/audio/concert.webm', true);
    if (!this.music) return;
    this.music.playbackRate = this.rush ? 1.15 : 1;
    this.musicPlaying = true;
    this.start(this.music, () => { this.musicPlaying = false; });
  }

  private create(url: string, loop: boolean): AudioChannel | null {
    try {
      const channel = this.factory(url);
      channel.preload = 'none';
      channel.loop = loop;
      channel.volume = loop ? 0.16 : 0.5;
      return channel;
    } catch {
      return null;
    }
  }

  private start(channel: AudioChannel, onBlocked?: () => void): void {
    try {
      void Promise.resolve(channel.play()).catch(() => onBlocked?.());
    } catch {
      onBlocked?.();
    }
  }

  private pauseAll(): void {
    for (const channel of this.effects.values()) channel.pause();
    this.music?.pause();
    this.musicPlaying = false;
  }
}
