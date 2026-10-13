import * as PIXI from 'pixi.js';
import { Isometric } from './Isometric';
import { TextureGenerator } from './TextureGenerator';

export enum TileType {
  GRASS = 0,
  DIRT = 1,
  WATER = 2
}

export class WorldMap {
  public readonly width: number;
  public readonly height: number;
  public tiles: TileType[][];
  public container: PIXI.Container;
  private spriteGrid: (PIXI.Sprite | null)[][];

  constructor(width: number = 40, height: number = 40) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.spriteGrid = [];
    this.container = new PIXI.Container();

    this.generateTerrain();
    this.buildMesh();
  }

  private generateTerrain() {
    for (let x = 0; x < this.width; x++) {
      this.tiles[x] = [];
      this.spriteGrid[x] = [];
      for (let y = 0; y < this.height; y++) {
        // Base grass
        let type = TileType.GRASS;

        // River or lake on border
        if (x < 3 || y < 3) {
          type = TileType.WATER;
        } else if ((x > 18 && x < 24 && y > 18 && y < 24)) {
          // Dirt clearing around center
          type = TileType.DIRT;
        } else if (Math.sin(x * 0.3) * Math.cos(y * 0.3) > 0.6) {
          type = TileType.DIRT;
        }

        this.tiles[x][y] = type;
        this.spriteGrid[x][y] = null;
      }
    }
  }

  private buildMesh() {
    const grassTex = TextureGenerator.getGrassTile();
    const dirtTex = TextureGenerator.getDirtTile();
    const waterTex = TextureGenerator.getWaterTile();

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const type = this.tiles[x][y];
        let tex = grassTex;
        if (type === TileType.DIRT) tex = dirtTex;
        else if (type === TileType.WATER) tex = waterTex;

        const sprite = new PIXI.Sprite(tex);
        const screenPos = Isometric.gridToScreen(x, y);

        // Center origin of diamond
        sprite.anchor.set(0.5, 0);
        sprite.position.set(screenPos.x, screenPos.y);

        this.container.addChild(sprite);
        this.spriteGrid[x][y] = sprite;
      }
    }
  }

  public isWalkable(x: number, y: number): boolean {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) {
      return false;
    }
    return this.tiles[gx][gy] !== TileType.WATER;
  }
}
