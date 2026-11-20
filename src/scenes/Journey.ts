import type { Game, Scene } from '../core/Game';
import type { Viewport } from '../core/Viewport';
import type { LevelDef } from '../data/levels';
import { ProgressStore, isLevelUnlocked } from '../gameplay/ProgressStore';
import type { LevelResult } from '../gameplay/ScoreSystem';
import { HandbookScene } from './HandbookScene';
import { LevelScene } from './LevelScene';
import { MapScene } from './MapScene';
import { MenuScene } from './MenuScene';
import { ResultScene } from './ResultScene';

interface JourneyOptions {
  reducedMotion: boolean;
  openSource: (url: string) => void;
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
      onComplete: result => this.progress.complete(level, result, [...scene.session.correctTypeIds], scene.session.veChaiSold),
      onResult: result => this.result(level, result),
    });
    this.change(scene);
  }

  private menu(): void {
    this.change(new MenuScene(this.viewport, {
      play: () => this.map(),
      handbook: () => this.handbook(() => this.menu()),
      toggleMute: () => this.progress.setMuted(!this.progress.data.settings.muted),
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

  private result(level: LevelDef, result: LevelResult): void {
    this.change(new ResultScene(this.viewport, level, result, {
      replay: () => this.play(level),
      map: () => this.map(),
    }));
  }

  private change(scene: Scene): void { this.game.scenes.change(scene, this.game); }
}
