import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { ReelManager } from "./ReelManager";
import { TILE_W, TILE_H, TILE_GAP, ROWS } from "./Reel";
import type { WinLineDto } from "./SpinDtos";
import spinSound from "./Spin.wav";

const REEL_COUNT = 5;
const REEL_GAP = 10;

export class SlotApp {
  private app!: Application;
  private reelManager!: ReelManager;
  public initialized = false;

  private sounds = {
    spin: null as HTMLAudioElement | null,
    win: null as HTMLAudioElement | null,
  };

  
  private readonly SPIN_VOLUME = 0.45;   
  private readonly WIN_VOLUME  = 0.65;   

  async init(container: HTMLElement) {
    this.app = new Application();
    await this.app.init({
      width: container.clientWidth || 700,
      height: container.clientHeight || 580,
      background: 0x020b1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(this.app.canvas as HTMLCanvasElement);

    this.reelManager = new ReelManager(this.app);

    const reelBlockW = REEL_COUNT * (TILE_W + REEL_GAP) - REEL_GAP;
    const reelBlockH = ROWS * (TILE_H + TILE_GAP) - TILE_GAP;

    this.reelManager.container.x = Math.floor((this.app.screen.width - reelBlockW) / 2);
    this.reelManager.container.y = Math.floor((this.app.screen.height - reelBlockH) / 2);

    this.app.stage.addChild(this.reelManager.container);

    this._drawDecorations();
    this._loadSounds();

    this.initialized = true;
  }

  private _loadSounds() {
    
    this.sounds.spin = new Audio(spinSound);
this.sounds.spin.loop = true;
this.sounds.spin.volume = this.SPIN_VOLUME;

    this.sounds.win = new Audio("/sounds/win.mp3");
    this.sounds.win.volume = this.WIN_VOLUME;  
  }

  async playSpin(grid: string[][], winLines: WinLineDto[]) {
    if (!this.initialized) return;

    this._clearWinInterval();

    
    if (this.sounds.spin) {
      this.sounds.spin.currentTime = 0;
      this.sounds.spin.play().catch(() => {});
    }

    this.reelManager.startSpinAll();
    await this.reelManager.stopAll(grid);

   
    if (this.sounds.spin) this.sounds.spin.pause();

    if (winLines.length > 0) {
      if (this.sounds.win) {
        this.sounds.win.currentTime = 0;
        this.sounds.win.play().catch(() => {});
      }
      this._flashWins(winLines);
    }
  }

  private _flashWins(winLines: WinLineDto[]) {
    let idx = 0;

    const showNext = () => {
      this.reelManager.clearWinOverlay();
      if (idx >= winLines.length) idx = 0;
      this.reelManager.highlightPayline(winLines[idx].positions);
      idx++;
    };

    showNext();
    const interval = setInterval(showNext, 900);
    (this as any)._winInterval = interval;
  }

  private _clearWinInterval() {
    if ((this as any)._winInterval) {
      clearInterval((this as any)._winInterval);
      (this as any)._winInterval = null;
    }
  }

  private _drawDecorations() {
    const { width, height } = this.app.screen;

    const glow = new Graphics();
    glow.circle(0, 0, 200);
    glow.fill({ color: 0xc9a84c, alpha: 0.04 });
    this.app.stage.addChildAt(glow, 0);

    const glow2 = new Graphics();
    glow2.circle(width, height, 200);
    glow2.fill({ color: 0x1a6fd4, alpha: 0.04 });
    this.app.stage.addChildAt(glow2, 0);
  }

  startSpinSound() {
  if (this.sounds.spin) {
    this.sounds.spin.currentTime = 0;
    this.sounds.spin.volume = this.SPIN_VOLUME;
    this.sounds.spin.play().catch((e) => {
      console.error("Spin sound error:", e);
    });
  }
}

  destroy() {
    this._clearWinInterval();
    if (this.sounds.spin) this.sounds.spin.pause();
    if (this.sounds.win) this.sounds.win.pause();
    this.reelManager?.destroy();

    if (this.app && this.initialized) {
      try {
        const canvas = this.app.renderer?.view?.canvas as HTMLCanvasElement
                  ?? (this.app as any).renderer?.canvas as HTMLCanvasElement;
        canvas?.parentNode?.removeChild(canvas);
      } catch (_) {}

      try {
        this.app.destroy(false);
      } catch (_) {}
    }

    this.initialized = false;
  }

  resize(width: number, height: number) {
    if (!this.initialized) return;
    this.app.renderer.resize(width, height);

    const reelBlockW = REEL_COUNT * (TILE_W + REEL_GAP) - REEL_GAP;
    const reelBlockH = ROWS * (TILE_H + TILE_GAP) - TILE_GAP;
    this.reelManager.container.x = Math.floor((width - reelBlockW) / 2);
    this.reelManager.container.y = Math.floor((height - reelBlockH) / 2);
  }
}