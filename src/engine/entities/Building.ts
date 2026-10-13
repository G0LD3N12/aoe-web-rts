import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export interface ProductionItem {
  id: string;
  name: string;
  type: 'villager' | 'swordsman';
  duration: number; // seconds
  elapsed: number;
}

export class Building extends Entity {
  public buildingType: 'town_center' | 'barracks' | 'house';
  public queue: ProductionItem[] = [];
  public popBonus: number = 0;

  constructor(
    id: string,
    name: string,
    x: number,
    y: number,
    hp: number,
    texture: PIXI.Texture,
    buildingType: 'town_center' | 'barracks' | 'house',
    tileWidth: number,
    tileHeight: number
  ) {
    super(id, name, x, y, hp, texture, tileWidth, tileHeight);
    this.isBuilding = true;
    this.buildingType = buildingType;

    // Anchor at bottom center of building footprint
    this.sprite.anchor.set(0.5, 0.85);

    if (buildingType === 'house') {
      this.popBonus = 5;
    } else if (buildingType === 'town_center') {
      this.popBonus = 10;
    }
  }

  public enqueue(type: 'villager' | 'swordsman'): boolean {
    if (this.queue.length >= 5) return false;
    const duration = type === 'villager' ? 5 : 8;
    this.queue.push({
      id: `${type}_${Date.now()}`,
      name: type === 'villager' ? 'Aldeano' : 'Espadachín',
      type,
      duration,
      elapsed: 0
    });
    return true;
  }

  public update(deltaSeconds: number): 'villager' | 'swordsman' | null {
    if (this.queue.length === 0) return null;

    const current = this.queue[0];
    current.elapsed += deltaSeconds;

    if (current.elapsed >= current.duration) {
      this.queue.shift();
      return current.type;
    }

    return null;
  }
}
