import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export type ResourceType = 'wood' | 'gold' | 'stone' | 'food';

export class ResourceNode extends Entity {
  public resourceType: ResourceType;
  public amount: number;
  public maxAmount: number;

  constructor(
    id: string,
    name: string,
    resourceType: ResourceType,
    x: number,
    y: number,
    texture: PIXI.Texture,
    amount: number = 300
  ) {
    super(id, name, x, y, 100, texture, 1, 1);
    this.isResource = true;
    this.resourceType = resourceType;
    this.amount = amount;
    this.maxAmount = amount;

    // Anchor at bottom center of tree/rock
    this.sprite.anchor.set(0.5, 0.9);
  }

  public harvest(amount: number): number {
    const gathered = Math.min(this.amount, amount);
    this.amount -= gathered;
    return gathered;
  }

  public update(_deltaSeconds: number): void {
    // Static resource node
  }
}
