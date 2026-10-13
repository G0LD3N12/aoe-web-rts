import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { PathNode } from '../Pathfinding';
import { ResourceNode, ResourceType } from './ResourceNode';
import { SoundFX } from '../SoundFX';

export enum UnitState {
  IDLE = 'idle',
  MOVING = 'moving',
  GATHERING = 'gathering',
  RETURNING = 'returning',
  ATTACKING = 'attacking'
}

export class Unit extends Entity {
  public speed: number = 3.2; // tiles per second
  public attack: number = 4;
  public armor: number = 1;
  public state: UnitState = UnitState.IDLE;
  public path: PathNode[] = [];

  // Gathering resources state
  public targetResource: ResourceNode | null = null;
  public carriedResource: { type: ResourceType; amount: number } | null = null;
  public maxCarry: number = 10;
  private gatherTimer: number = 0;

  // Animation walk bob
  private walkTime: number = 0;

  constructor(
    id: string,
    name: string,
    x: number,
    y: number,
    hp: number,
    texture: PIXI.Texture,
    public unitType: 'villager' | 'swordsman' | 'scout'
  ) {
    super(id, name, x, y, hp, texture, 1, 1);
    this.isUnit = true;

    // Anchor feet at bottom center
    this.sprite.anchor.set(0.5, 0.9);

    if (unitType === 'villager') {
      this.speed = 2.8;
      this.attack = 3;
      this.armor = 0;
    } else if (unitType === 'swordsman') {
      this.speed = 3.0;
      this.attack = 6;
      this.armor = 2;
    } else if (unitType === 'scout') {
      this.speed = 4.6;
      this.attack = 4;
      this.armor = 1;
    }
  }

  public setPath(path: PathNode[]) {
    this.path = [...path];
    if (this.path.length > 0) {
      this.state = UnitState.MOVING;
    } else {
      this.state = UnitState.IDLE;
    }
  }

  public assignGather(resource: ResourceNode, path: PathNode[]) {
    this.targetResource = resource;
    this.setPath(path);
    this.state = UnitState.MOVING;
  }

  public stop() {
    this.path = [];
    this.state = UnitState.IDLE;
    this.targetResource = null;
  }

  public update(deltaSeconds: number): void {
    if (this.state === UnitState.MOVING || this.state === UnitState.RETURNING) {
      if (this.path.length > 0) {
        const nextNode = this.path[0];
        const dx = nextNode.x - this.x;
        const dy = nextNode.y - this.y;
        const dist = Math.hypot(dx, dy);
        const step = this.speed * deltaSeconds;

        // Facing direction (flip sprite horizontally when moving left)
        if (dx < -0.05) {
          this.sprite.scale.x = -1;
        } else if (dx > 0.05) {
          this.sprite.scale.x = 1;
        }

        // Walk bobbing animation
        this.walkTime += deltaSeconds * 12;
        this.sprite.position.y = Math.sin(this.walkTime) * 3;

        if (dist <= step) {
          this.x = nextNode.x;
          this.y = nextNode.y;
          this.path.shift();

          if (this.path.length === 0) {
            // Reached destination
            this.sprite.position.y = 0;
            if (this.targetResource && this.targetResource.amount > 0) {
              this.state = UnitState.GATHERING;
              this.gatherTimer = 0;
            } else {
              this.state = UnitState.IDLE;
            }
          }
        } else {
          this.x += (dx / dist) * step;
          this.y += (dy / dist) * step;
        }

        this.updatePosition();
      } else {
        this.state = UnitState.IDLE;
        this.sprite.position.y = 0;
      }
    } else if (this.state === UnitState.GATHERING) {
      if (!this.targetResource || this.targetResource.amount <= 0) {
        this.state = UnitState.IDLE;
        this.targetResource = null;
        return;
      }

      this.gatherTimer += deltaSeconds;
      // Gather animation & sound every 1.2s
      if (this.gatherTimer >= 1.2) {
        this.gatherTimer = 0;
        const harvested = this.targetResource.harvest(2);
        SoundFX.playChop();

        if (!this.carriedResource) {
          this.carriedResource = { type: this.targetResource.resourceType, amount: 0 };
        }
        this.carriedResource.amount += harvested;

        // If resource is depleted
        if (this.targetResource.amount <= 0) {
          this.state = UnitState.IDLE;
          this.targetResource = null;
        }
      }
    }
  }
}
