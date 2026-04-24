import {
  Container,
  Graphics,
  Text,
  TextStyle,
  Ticker,
  Application,
} from "pixi.js";

export const SYMBOL_META: Record<string, { emoji: string; color: number; label: string }> = {
  Cherry:     { emoji: "🍒", color: 0xc0392b, label: "CHERRY"   },
  Lemon:      { emoji: "🍋", color: 0xf1c40f, label: "LEMON"    },
  Orange:     { emoji: "🍊", color: 0xe67e22, label: "ORANGE"   },
  Plum:       { emoji: "🍇", color: 0x8e44ad, label: "PLUM"     },
  Watermelon: { emoji: "🍉", color: 0x27ae60, label: "MELON"    },
  Strawberry: { emoji: "🍓", color: 0xe84393, label: "BERRY"    },
  Lucky7:     { emoji: "7️⃣",  color: 0xc9a84c, label: "LUCKY 7" },
  Wild:       { emoji: "⭐", color: 0x00d4ff, label: "WILD"     },
};

export const SYMBOL_NAMES = Object.keys(SYMBOL_META);

export const TILE_W    = 110;
export const TILE_H    = 100;
export const TILE_GAP  = 6;
export const ROWS      = 5;
export const STRIP_LEN = 20;

const STEP         = TILE_H + TILE_GAP;
const MAX_VELOCITY = 38;
const ACCEL        = 2.0;
const DECEL        = 1.9;
const SNAP_TRIGGER = 6;

type Phase = "idle" | "accelerate" | "cruise" | "decelerate";

export class Reel {
  container: Container;
  private ticker: Ticker;
  private strip: Container;
  private tiles: Container[];

  private velocity = 0;
  private phase: Phase = "idle";
  private shouldStop = false;          // set by stopOn() whenever it's called
  private stopCallback: (() => void) | null = null;

  constructor(app: Application) {
    this.ticker = app.ticker;

    this.container = new Container();

    const mask = new Graphics();
    mask.rect(0, 0, TILE_W, ROWS * STEP - TILE_GAP);
    mask.fill(0xffffff);
    this.container.addChild(mask);
    this.container.mask = mask;

    this.strip = new Container();
    this.container.addChild(this.strip);

    const symbols = Array.from(
      { length: STRIP_LEN },
      () => SYMBOL_NAMES[Math.floor(Math.random() * SYMBOL_NAMES.length)]
    );

    this.tiles = symbols.map((name, i) => {
      const tile = buildSymbolTile(name);
      tile.y = i * STEP;
      this.strip.addChild(tile);
      return tile;
    });

    this.ticker.add(this._tick, this);
  }

  startSpin() {
    this.shouldStop    = false;
    this.stopCallback  = null;
    this.velocity      = 0;
    this.phase         = "accelerate";
  }

  stopOn(targetColumn: string[]): Promise<void> {
    return new Promise((resolve) => {
      this.stopCallback = () => {
        this._applyTargetSymbols(targetColumn);
        resolve();
      };
      // Signal that we want to stop; _tick will begin decel
      // only once we have actually reached cruise speed.
      this.shouldStop = true;
    });
  }

  private _applyTargetSymbols(targetColumn: string[]) {
    for (let i = 0; i < STRIP_LEN; i++) {
      const tile      = this.tiles[i];
      const worldY    = this.strip.y + tile.y;
      const visualRow = Math.round(worldY / STEP);
      if (visualRow >= 0 && visualRow < ROWS) {
        rebuildTile(tile, targetColumn[visualRow]);
      }
    }
  }

  private _tick = () => {
    if (this.phase === "idle") return;

    // ── 1. Update velocity based on phase ───────────────────────
    if (this.phase === "accelerate") {
      this.velocity = Math.min(this.velocity + ACCEL, MAX_VELOCITY);

      if (this.velocity >= MAX_VELOCITY) {
        // Only begin decelerating once we have full speed
        this.phase = this.shouldStop ? "decelerate" : "cruise";
      }

    } else if (this.phase === "decelerate") {
      this.velocity = Math.max(this.velocity - DECEL, SNAP_TRIGGER);

    } else if (this.phase === "cruise" && this.shouldStop) {
      // stopOn() arrived while we were cruising — start decel next tick
      this.phase = "decelerate";
    }

    // ── 2. Move strip ────────────────────────────────────────────
    this.strip.y += this.velocity;

    // ── 3. Recycle tiles ─────────────────────────────────────────
    for (let i = 0; i < STRIP_LEN; i++) {
      const tile   = this.tiles[i];
      const worldY = this.strip.y + tile.y;
      if (worldY > ROWS * STEP) {
        tile.y -= STRIP_LEN * STEP;
        rebuildTile(tile, SYMBOL_NAMES[Math.floor(Math.random() * SYMBOL_NAMES.length)]);
      }
    }

    // ── 4. Snap when slow enough ──────────────────────────────────
    if (this.phase === "decelerate" && this.velocity <= SNAP_TRIGGER) {
      this.strip.y  = Math.round(this.strip.y / STEP) * STEP;
      this.velocity = 0;
      this.phase    = "idle";

      const cb = this.stopCallback;
      this.stopCallback = null;
      this.shouldStop   = false;
      cb?.();           // resolve the promise AFTER state is clean
    }
  };

  destroy() {
    this.ticker.remove(this._tick, this);
    this.container.destroy({ children: true });
  }
}

export function buildSymbolTile(name: string): Container {
  const meta = SYMBOL_META[name] ?? SYMBOL_META["Cherry"];
  const c    = new Container();

  const bg = new Graphics();
  bg.roundRect(2, 2, TILE_W - 4, TILE_H - 4, 12);
  bg.fill({ color: meta.color, alpha: 0.18 });
  bg.stroke({ color: meta.color, alpha: 0.55, width: 1.5 });
  c.addChild(bg);

  const emoji = new Text({
    text: meta.emoji,
    style: new TextStyle({
      fontSize: 38,
      fontFamily: "Segoe UI Emoji, Apple Color Emoji, sans-serif",
    }),
  });
  emoji.anchor.set(0.5);
  emoji.x = TILE_W / 2;
  emoji.y = TILE_H / 2 - 6;
  c.addChild(emoji);

  const label = new Text({
    text: meta.label,
    style: new TextStyle({
      fontSize:      10,
      fontFamily:    "Rajdhani, sans-serif",
      fontWeight:    "700",
      fill:          meta.color,
      letterSpacing: 1.5,
    }),
  });
  label.anchor.set(0.5);
  label.x = TILE_W / 2;
  label.y = TILE_H - 14;
  c.addChild(label);

  (c as any).__symbolName = name;
  return c;
}

export function rebuildTile(tile: Container, name: string) {
  tile.removeChildren();
  const meta = SYMBOL_META[name] ?? SYMBOL_META["Cherry"];

  const bg = new Graphics();
  bg.roundRect(2, 2, TILE_W - 4, TILE_H - 4, 12);
  bg.fill({ color: meta.color, alpha: 0.18 });
  bg.stroke({ color: meta.color, alpha: 0.55, width: 1.5 });
  tile.addChild(bg);

  const emoji = new Text({
    text: meta.emoji,
    style: new TextStyle({
      fontSize: 38,
      fontFamily: "Segoe UI Emoji, Apple Color Emoji, sans-serif",
    }),
  });
  emoji.anchor.set(0.5);
  emoji.x = TILE_W / 2;
  emoji.y = TILE_H / 2 - 6;
  tile.addChild(emoji);

  const label = new Text({
    text: meta.label,
    style: new TextStyle({
      fontSize:      10,
      fontFamily:    "Rajdhani, sans-serif",
      fontWeight:    "700",
      fill:          meta.color,
      letterSpacing: 1.5,
    }),
  });
  label.anchor.set(0.5);
  label.x = TILE_W / 2;
  label.y = TILE_H - 14;
  tile.addChild(label);

  (tile as any).__symbolName = name;
}