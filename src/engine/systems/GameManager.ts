import * as PIXI from 'pixi.js';
import { Entity } from '../entities/Entity';
import { Unit } from '../entities/Unit';
import { Building } from '../entities/Building';
import { ResourceNode } from '../entities/ResourceNode';
import { TextureGenerator } from '../TextureGenerator';
import { PlayerResources } from '../../ui/HUD';
import { SoundFX } from '../SoundFX';

export class GameManager {
  public entities: Entity[] = [];
  public entityContainer: PIXI.Container;

  public resources: PlayerResources = {
    food: 200,
    wood: 200,
    gold: 100,
    stone: 100,
    pop: 4,
    maxPop: 15
  };

  private nextEntityId: number = 1;

  constructor() {
    this.entityContainer = new PIXI.Container();
    // Enable zIndex depth sorting
    this.entityContainer.sortableChildren = true;

    this.spawnInitialWorld();
  }

  private spawnInitialWorld() {
    // 1. Town Center (Central landmark)
    const tc = new Building(
      `tc_${this.nextEntityId++}`,
      'Centro Urbano',
      20,
      20,
      2400,
      TextureGenerator.getTownCenterTexture(),
      'town_center',
      3,
      3
    );
    this.addEntity(tc);

    // 2. House
    const house = new Building(
      `house_${this.nextEntityId++}`,
      'Casa',
      17,
      17,
      550,
      TextureGenerator.getHouseTexture(),
      'house',
      2,
      2
    );
    this.addEntity(house);

    // 3. Barracks
    const barracks = new Building(
      `barracks_${this.nextEntityId++}`,
      'Cuartel',
      23,
      17,
      1200,
      TextureGenerator.getBarracksTexture(),
      'barracks',
      3,
      3
    );
    this.addEntity(barracks);

    // 4. Starting Units: 3 Villagers
    const v1 = new Unit(`u_${this.nextEntityId++}`, 'Aldeano', 19.5, 21.5, 40, TextureGenerator.getVillagerTexture(), 'villager');
    const v2 = new Unit(`u_${this.nextEntityId++}`, 'Aldeano', 20.5, 22.0, 40, TextureGenerator.getVillagerTexture(), 'villager');
    const v3 = new Unit(`u_${this.nextEntityId++}`, 'Aldeano', 19.0, 22.5, 40, TextureGenerator.getVillagerTexture(), 'villager');
    this.addEntity(v1);
    this.addEntity(v2);
    this.addEntity(v3);

    // 5. Militia / Swordsman
    const s1 = new Unit(`u_${this.nextEntityId++}`, 'Espadachín', 22.5, 21.5, 45, TextureGenerator.getSwordsmanTexture(), 'swordsman');
    this.addEntity(s1);

    // 6. Forest clusters (Oak trees)
    const treeTex = TextureGenerator.getTreeTexture();
    const treeCoords = [
      { x: 14, y: 19 }, { x: 15, y: 19 }, { x: 14, y: 20 }, { x: 15, y: 20 },
      { x: 14, y: 21 }, { x: 15, y: 21 }, { x: 13, y: 20 }, { x: 13, y: 21 },
      { x: 16, y: 22 }, { x: 15, y: 23 }, { x: 16, y: 23 }
    ];
    treeCoords.forEach((c) => {
      const tree = new ResourceNode(`tree_${this.nextEntityId++}`, 'Árbol de Roble', 'wood', c.x, c.y, treeTex, 125);
      this.addEntity(tree);
    });

    // 7. Gold Mine cluster
    const goldTex = TextureGenerator.getGoldTexture();
    const goldCoords = [{ x: 26, y: 19 }, { x: 27, y: 19 }, { x: 26, y: 20 }];
    goldCoords.forEach((c) => {
      const gold = new ResourceNode(`gold_${this.nextEntityId++}`, 'Cantera de Oro', 'gold', c.x, c.y, goldTex, 800);
      this.addEntity(gold);
    });

    // 8. Stone Quarry cluster
    const stoneTex = TextureGenerator.getStoneTexture();
    const stoneCoords = [{ x: 16, y: 14 }, { x: 17, y: 14 }, { x: 17, y: 15 }];
    stoneCoords.forEach((c) => {
      const stone = new ResourceNode(`stone_${this.nextEntityId++}`, 'Cantera de Piedra', 'stone', c.x, c.y, stoneTex, 600);
      this.addEntity(stone);
    });

    this.recalculatePopCapacity();
  }

  public addEntity(ent: Entity) {
    this.entities.push(ent);
    this.entityContainer.addChild(ent.container);
  }

  public removeEntity(ent: Entity) {
    const idx = this.entities.indexOf(ent);
    if (idx !== -1) {
      this.entities.splice(idx, 1);
      this.entityContainer.removeChild(ent.container);
      ent.destroy();
    }
  }

  public trainUnit(building: Building, type: 'villager' | 'swordsman'): boolean {
    const foodCost = type === 'villager' ? 50 : 60;
    const goldCost = type === 'swordsman' ? 20 : 0;

    if (this.resources.food < foodCost || this.resources.gold < goldCost) {
      return false;
    }
    if (this.resources.pop >= this.resources.maxPop) {
      return false;
    }

    const enqueued = building.enqueue(type);
    if (enqueued) {
      this.resources.food -= foodCost;
      this.resources.gold -= goldCost;
      return true;
    }
    return false;
  }

  public buildStructure(type: 'house' | 'barracks', nearX: number, nearY: number): boolean {
    const woodCost = type === 'house' ? 30 : 150;
    if (this.resources.wood < woodCost) return false;

    this.resources.wood -= woodCost;
    if (type === 'house') {
      const house = new Building(
        `house_${this.nextEntityId++}`,
        'Casa',
        nearX + 1.5,
        nearY + 1.5,
        550,
        TextureGenerator.getHouseTexture(),
        'house',
        2,
        2
      );
      this.addEntity(house);
    } else {
      const barracks = new Building(
        `barracks_${this.nextEntityId++}`,
        'Cuartel',
        nearX + 2,
        nearY + 2,
        1200,
        TextureGenerator.getBarracksTexture(),
        'barracks',
        3,
        3
      );
      this.addEntity(barracks);
    }

    this.recalculatePopCapacity();
    SoundFX.playBuild();
    return true;
  }

  public recalculatePopCapacity() {
    let max = 5; // Base cap
    let units = 0;

    for (const ent of this.entities) {
      if (ent.isBuilding) {
        const b = ent as Building;
        max += b.popBonus;
      } else if (ent.isUnit) {
        units++;
      }
    }

    this.resources.maxPop = Math.min(200, max);
    this.resources.pop = units;
  }

  public update(deltaSeconds: number) {
    let activeUnits = 0;

    for (const ent of this.entities) {
      if (ent.isUnit) {
        activeUnits++;
        const u = ent as Unit;
        u.update(deltaSeconds);

        // Deposit gathered resources if carrying
        if (u.carriedResource && u.carriedResource.amount >= u.maxCarry) {
          if (u.carriedResource.type === 'wood') this.resources.wood += u.carriedResource.amount;
          else if (u.carriedResource.type === 'food') this.resources.food += u.carriedResource.amount;
          else if (u.carriedResource.type === 'gold') this.resources.gold += u.carriedResource.amount;
          else if (u.carriedResource.type === 'stone') this.resources.stone += u.carriedResource.amount;
          u.carriedResource = null;
        }
      } else if (ent.isBuilding) {
        const b = ent as Building;
        const trained = b.update(deltaSeconds);
        if (trained) {
          // Spawn completed unit near building
          const tex = trained === 'villager' ? TextureGenerator.getVillagerTexture() : TextureGenerator.getSwordsmanTexture();
          const newUnit = new Unit(
            `u_${this.nextEntityId++}`,
            trained === 'villager' ? 'Aldeano' : 'Espadachín',
            b.x + b.tileWidth / 2,
            b.y + b.tileHeight / 2 + 0.8,
            trained === 'villager' ? 40 : 45,
            tex,
            trained
          );
          this.addEntity(newUnit);
          this.recalculatePopCapacity();
          SoundFX.playUnitTrained();
        }
      }
    }

    this.resources.pop = activeUnits;
  }
}
