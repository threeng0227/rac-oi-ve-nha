import type { Game, Scene } from '../core/Game';
import type { Viewport } from '../core/Viewport';
import type { LevelDef } from '../data/levels';
import { ProgressStore, isLevelUnlocked } from '../gameplay/ProgressStore';
import type { LevelResult } from '../gameplay/ScoreSystem';
import type { AudioManager } from '../core/Audio';
import { PLEDGES } from '../data/pledges';
import { ShareCard } from '../ui/ShareCard';
import { SHARE_TEXT } from '../i18n/vi';
import { HandbookScene } from './HandbookScene';
import { LevelScene } from './LevelScene';
import { MapScene } from './MapScene';
import { MenuScene } from './MenuScene';
import { ResultScene } from './ResultScene';
import { PledgeScene } from './PledgeScene';

interface JourneyOptions {
  reducedMotion: boolean;
  openSource: (url: string) => void;
  audio?: AudioManager;
  onEventWarning?: () => void;
}

/** Nối hành trình và dữ liệu lưu, các scene chỉ nhận hành động điều hướng. */
export class Journey {
  constructor(
    private readonly game: Game,
    private readonly viewport: Viewport,
    private readonly progress: ProgressStore,
    private readonly options: JourneyOptions,
  ) {}

  start(): void { this.menu(); }

  play(level: LevelDef): void {
    if (!isLevelUnlocked(this.progress.data, level)) return;
    const scene = new LevelScene(this.viewport, {
      level,
      skipTutorial: this.progress.data.levels[level.id] !== undefined,
      reducedMotion: this.options.reducedMotion,
      onDiscover: typeId => this.progress.discover(typeId),
      onSound: sound => {
        this.options.audio?.play(sound);
        if (sound === 'event') this.options.onEventWarning?.();
      },
      onEventChange: id => this.options.audio?.setRush(id === 'GIO_CAO_DIEM'),
      onComplete: result => this.progress.complete(level, result, [...scene.session.correctTypeIds], scene.session.veChaiSold),
      onResult: result => this.result(level, result),
    });
    this.change(scene);
  }

  private menu(): void {
    this.change(new MenuScene(this.viewport, {
      play: () => this.map(),
      handbook: () => this.handbook(() => this.menu()),
      toggleMute: () => {
        this.progress.setMuted(!this.progress.data.settings.muted);
        this.options.audio?.setMuted(this.progress.data.settings.muted);
        this.options.audio?.play('correct');
      },
      isMuted: () => this.progress.data.settings.muted,
    }));
  }

  private map(): void {
    this.change(new MapScene(this.viewport, this.progress.data, {
      play: level => this.play(level),
      back: () => this.menu(),
      handbook: () => this.handbook(() => this.map()),
    }));
  }

  private handbook(back: () => void): void {
    this.change(new HandbookScene(this.viewport, this.progress.data, { back, openSource: this.options.openSource }));
  }

  private result(level: LevelDef, result: LevelResult, offerPledge = true): void {
    if (offerPledge && level.order === 6 && result.stars >= 1 && this.progress.data.pledges.length === 0) {
      this.pledges(() => this.result(level, result, false));
      return;
    }
    const card = () => new ShareCard(level, result,
      PLEDGES.filter(pledge => this.progress.data.pledges.includes(pledge.id)).map(pledge => pledge.text));
    const scene = new ResultScene(this.viewport, level, result, {
      replay: () => this.play(level),
      map: () => this.map(),
      share: () => { void card().share().catch(() => scene.setStatus(SHARE_TEXT.failed)); },
      download: () => { void card().download().catch(() => scene.setStatus(SHARE_TEXT.failed)); },
      ...(this.progress.data.levels['nhieu-loc']?.cleared ? { pledge: () => this.pledges(() => this.result(level, result, false)) } : {}),
    });
    this.change(scene);
  }

  private pledges(back: () => void): void {
    this.change(new PledgeScene(this.viewport, this.progress.data.pledges, {
      confirm: ids => { this.progress.setPledges(ids); back(); }, back,
    }));
  }

  private change(scene: Scene): void {
    this.options.audio?.setRush(false);
    this.options.audio?.setConcert(scene instanceof LevelScene && scene.session.level.id === 'concert');
    this.game.scenes.change(scene, this.game);
  }
}
