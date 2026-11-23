import { describe, expect, test } from 'vitest';
import { AudioManager, type AudioChannel } from '../../src/core/Audio';

class FakeAudio implements AudioChannel {
  preload = '';
  loop = false;
  playbackRate = 1;
  currentTime = 10;
  volume = 1;
  plays = 0;
  pauses = 0;
  released = false;
  rejectPlay = false;

  play(): Promise<void> {
    this.plays++;
    return this.rejectPlay ? Promise.reject(new Error('autoplay blocked')) : Promise.resolve();
  }
  pause(): void { this.pauses++; }
  removeAttribute(name: string): void { if (name === 'src') this.released = true; }
  load(): void {}
}

function setup(): { audio: AudioManager; channels: Map<string, FakeAudio> } {
  const channels = new Map<string, FakeAudio>();
  const audio = new AudioManager(url => {
    const channel = new FakeAudio();
    channels.set(url, channel);
    return channel;
  });
  return { audio, channels };
}

describe('AudioManager', () => {
  test('mặc định tắt tiếng và không tạo hay tải âm thanh', () => {
    const { audio, channels } = setup();
    audio.play('pickup');
    audio.setConcert(true);
    audio.setRush(true);
    audio.resume();
    expect(channels.size).toBe(0);
  });

  test('SFX tải khi cần, dùng lại cùng kênh và phát lại từ đầu', () => {
    const { audio, channels } = setup();
    audio.setMuted(false);
    expect(channels.size).toBe(0);
    audio.play('pickup');
    const channel = channels.get('/audio/pickup.webm')!;
    expect(channel.preload).toBe('none');
    expect(channel.loop).toBe(false);
    expect(channel.currentTime).toBe(0);
    channel.currentTime = 0.1;
    audio.play('pickup');
    expect(channels.size).toBe(1);
    expect(channel.currentTime).toBe(0);
    expect(channel.plays).toBe(2);
  });

  test('chỉ tạo nhạc khi concert đang chạy và người chơi bật tiếng', () => {
    const { audio, channels } = setup();
    audio.setConcert(true);
    expect(channels.size).toBe(0);
    audio.setMuted(false);
    const music = channels.get('/audio/concert.webm')!;
    expect(music.loop).toBe(true);
    expect(music.plays).toBe(1);
    audio.setConcert(true);
    expect(music.plays).toBe(1);
    audio.setConcert(false);
    expect(music.pauses).toBeGreaterThan(0);
    expect(music.currentTime).toBe(0);
  });

  test('giờ cao điểm tăng nhạc lên 1.15 rồi trả lại đúng nhịp', () => {
    const { audio, channels } = setup();
    audio.setRush(true);
    audio.setMuted(false);
    audio.setConcert(true);
    const music = channels.get('/audio/concert.webm')!;
    expect(music.playbackRate).toBe(1.15);
    audio.setRush(false);
    expect(music.playbackRate).toBe(1);
  });

  test('tắt tiếng dừng mọi kênh, bật lại chỉ tiếp tục nhạc concert', () => {
    const { audio, channels } = setup();
    audio.setMuted(false);
    audio.setConcert(true);
    audio.play('correct');
    const music = channels.get('/audio/concert.webm')!;
    const effect = channels.get('/audio/correct.webm')!;
    audio.setMuted(true);
    expect(music.pauses).toBeGreaterThan(0);
    expect(effect.pauses).toBeGreaterThan(0);
    audio.play('wrong');
    expect(channels.has('/audio/wrong.webm')).toBe(false);
    audio.setMuted(false);
    expect(music.plays).toBe(2);
    expect(effect.plays).toBe(1);
  });

  test('ẩn trang dừng tiếng, hiện lại chỉ phát nhạc của màn còn đang hoạt động', () => {
    const { audio, channels } = setup();
    audio.setMuted(false);
    audio.setConcert(true);
    audio.suspend();
    audio.play('event');
    expect(channels.has('/audio/event.webm')).toBe(false);
    audio.resume();
    const music = channels.get('/audio/concert.webm')!;
    expect(music.plays).toBe(2);
    audio.suspend();
    audio.setConcert(false);
    audio.resume();
    expect(music.plays).toBe(2);
  });

  test('nhạc không được tải trong lúc trang bị ẩn', () => {
    const { audio, channels } = setup();
    audio.setMuted(false);
    audio.suspend();
    audio.setConcert(true);
    expect(channels.size).toBe(0);
    audio.resume();
    expect(channels.has('/audio/concert.webm')).toBe(true);
  });

  test('trình duyệt từ chối play không tạo lỗi promise và vẫn thử lại được', async () => {
    const { audio, channels } = setup();
    audio.setMuted(false);
    audio.play('wrong');
    const effect = channels.get('/audio/wrong.webm')!;
    effect.rejectPlay = true;
    expect(() => audio.play('wrong')).not.toThrow();
    await Promise.resolve();
    effect.rejectPlay = false;
    audio.play('wrong');
    expect(effect.plays).toBe(3);
  });

  test('nhạc bị autoplay chặn có thể thử lại ở thao tác tiếp theo', async () => {
    const music = new FakeAudio();
    music.rejectPlay = true;
    const audio = new AudioManager(() => music);
    audio.setMuted(false);
    audio.setConcert(true);
    await Promise.resolve();
    music.rejectPlay = false;
    audio.setConcert(true);
    expect(music.plays).toBe(2);
  });

  test('lỗi tạo hoặc phát đồng bộ cũng không ngăn game chạy', () => {
    const unavailable = new AudioManager(() => { throw new Error('unsupported audio'); });
    unavailable.setMuted(false);
    expect(() => unavailable.play('win')).not.toThrow();
    expect(() => unavailable.setConcert(true)).not.toThrow();
    const broken = new FakeAudio();
    broken.play = () => { throw new Error('unsupported format'); };
    const audio = new AudioManager(() => broken);
    audio.setMuted(false);
    expect(() => audio.play('lose')).not.toThrow();
  });

  test('dispose dừng, giải phóng nguồn và ngăn tạo tiếng về sau', () => {
    const { audio, channels } = setup();
    audio.setMuted(false);
    audio.setConcert(true);
    audio.play('hazard');
    audio.dispose();
    for (const channel of channels.values()) {
      expect(channel.pauses).toBeGreaterThan(0);
      expect(channel.released).toBe(true);
    }
    const count = channels.size;
    audio.setMuted(false);
    audio.setConcert(true);
    audio.resume();
    audio.play('event');
    expect(channels.size).toBe(count);
  });
});
