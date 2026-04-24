import { Application, Container, Graphics } from "pixi.js";
import { Reel, TILE_W, TILE_H, TILE_GAP, ROWS } from "./Reel";

const REEL_COUNT     = 5;
const REEL_GAP       = 10;
const STOP_DELAY     = 320;
const MIN_SPIN_MS    = 1500;
const WIN_HIGHLIGHT  = 0xf0c96a;

export class ReelManager {
  container: Container;
  private app: Application;
  private reels: Reel[] = [];
  private winOverlay: Graphics;
  private spinStartTime = 0;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();

    const frameW = REEL_COUNT * (TILE_W + REEL_GAP) - REEL_GAP + 16;
    const frameH = ROWS * (TILE_H + TILE_GAP) - TILE_GAP + 16;

    const frame = new Graphics();
    frame.roundRect(-8, -8, frameW, frameH, 16);
    frame.fill({ color: 0x020b1a, alpha: 0.9 });
    frame.stroke({ color: 0xc9a84c, alpha: 0.35, width: 1.5 });
    this.container.addChild(frame);

    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = new Reel(app);
      reel.container.x = i * (TILE_W + REEL_GAP);
      reel.container.y = 0;
      this.container.addChild(reel.container);
      this.reels.push(reel);
    }

    this.winOverlay = new Graphics();
    this.container.addChild(this.winOverlay);
  }

  startSpinAll() {
    this.clearWinOverlay();
    this.spinStartTime = Date.now();
    for (const reel of this.reels) {
      reel.startSpin();
    }
  }

  async stopAll(grid: string[][]): Promise<void> {
    const elapsed = Date.now() - this.spinStartTime;
    const remaining = Math.max(0, MIN_SPIN_MS - elapsed);

    await new Promise<void>((resolve) => setTimeout(resolve, remaining));

    const stopPromises = this.reels.map((reel, i) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          reel.stopOn(grid[i]).then(resolve);
        }, i * STOP_DELAY);
      });
    });

    await Promise.all(stopPromises);
  }

  highlightPayline(positions: number[]) {
    const g     = this.winOverlay;
    const step  = TILE_H + TILE_GAP;
    const hStep = TILE_W + REEL_GAP;

    for (let reelIdx = 0; reelIdx < positions.length; reelIdx++) {
      const x = reelIdx * hStep;
      const y = positions[reelIdx] * step;

      g.roundRect(x + 2, y + 2, TILE_W - 4, TILE_H - 4, 12);
      g.fill({ color: WIN_HIGHLIGHT, alpha: 0.12 });
      g.stroke({ color: WIN_HIGHLIGHT, alpha: 0.95, width: 3.5 });
    }

    if (positions.length >= 2) {
      const points = positions.map((row, i) => ({
        x: i * hStep + TILE_W / 2,
        y: row * step + TILE_H / 2,
      }));

      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.stroke({ color: WIN_HIGHLIGHT, alpha: 0.3, width: 14 });

      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.stroke({ color: WIN_HIGHLIGHT, alpha: 0.7, width: 7 });

      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.stroke({ color: 0xffffff, alpha: 1, width: 2.5 });
    }
  }

  clearWinOverlay() {
    this.winOverlay.clear();
  }

  destroy() {
    this.reels.forEach((r) => r.destroy());
    this.container.destroy({ children: true });
  }
}