import * as PIXI from 'pixi.js';
import { Isometric } from '../Isometric';

export abstract class Entity {
  public id: string;
  public name: string;
  public x: number;
  public y: number;
  public tileWidth: number = 1;
  public tileHeight: number = 1;
  public hp: number;
  public maxHp: number;
  public selected: boolean = false;
  public isUnit: boolean = false;
  public isBuilding: boolean = false;
  public isResource: boolean = false;

  public container: PIXI.Container;
  public sprite: PIXI.Sprite;
  protected selectionRing: PIXI.Graphics;
  protected hpBar: PIXI.Graphics;

  constructor(
    id: string,
    name: string,
    x: number,
    y: number,
    hp: number,
    texture: PIXI.Texture,
    tileWidth: number = 1,
    tileHeight: number = 1
  ) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHp = hp;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;

    this.container = new PIXI.Container();

    // Selection ellipse ring (AoE green ring)
    this.selectionRing = new PIXI.Graphics();
    this.selectionRing.visible = false;
    this.container.addChild(this.selectionRing);

    // Main sprite
    this.sprite = new PIXI.Sprite(texture);
    this.container.addChild(this.sprite);

    // HP Bar
    this.hpBar = new PIXI.Graphics();
    this.hpBar.visible = false;
    this.container.addChild(this.hpBar);

    this.updatePosition();
    this.drawSelectionRing();
  }

  public updatePosition() {
    const screenPos = Isometric.gridToScreen(this.x, this.y);
    this.container.position.set(screenPos.x, screenPos.y);
    // Y-sorting depth
    this.container.zIndex = Isometric.getDepth(this.x, this.y);
  }

  public setSelected(selected: boolean) {
    this.selected = selected;
    this.selectionRing.visible = selected;
    this.hpBar.visible = selected;
    if (selected) {
      this.drawHpBar();
    }
  }

  protected drawSelectionRing() {
    this.selectionRing.clear();
    const rx = (this.tileWidth * Isometric.HALF_WIDTH) * 0.7;
    const ry = (this.tileHeight * Isometric.HALF_HEIGHT) * 0.6;
    this.selectionRing.ellipse(0, 0, rx, ry);
    this.selectionRing.stroke({ width: 2, color: 0x00ff66 });
  }

  protected drawHpBar() {
    this.hpBar.clear();
    const w = 36;
    const h = 5;
    const yOff = -this.sprite.height + 6;

    // Background
    this.hpBar.rect(-w / 2, yOff, w, h);
    this.hpBar.fill({ color: 0x220000 });
    this.hpBar.stroke({ width: 1, color: 0x000000 });

    // Fill
    const pct = Math.max(0, Math.min(1, this.hp / this.maxHp));
    const fillColor = pct > 0.5 ? 0x00cc44 : pct > 0.25 ? 0xddaa00 : 0xcc2222;
    this.hpBar.rect(-w / 2, yOff, w * pct, h);
    this.hpBar.fill({ color: fillColor });
  }

  public abstract update(deltaSeconds: number): void;

  public destroy() {
    this.container.destroy({ children: true });
  }
}
