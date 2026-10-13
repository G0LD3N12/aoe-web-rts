import { WorldMap, TileType } from '../engine/WorldMap';
import { Camera } from '../engine/Camera';
import { Entity } from '../engine/entities/Entity';
import { Isometric } from '../engine/Isometric';

export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isInteracting: boolean = false;

  constructor(
    private worldMap: WorldMap,
    private camera: Camera,
    private getEntities: () => Entity[]
  ) {
    this.canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.setupListeners();
  }

  private setupListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isInteracting = true;
      this.handleClick(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isInteracting) {
        this.handleClick(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isInteracting = false;
    });
  }

  private handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX < 0 || clickX > this.canvas.width || clickY < 0 || clickY > this.canvas.height) {
      return;
    }

    // Map canvas coordinates to isometric grid
    const normX = clickX / this.canvas.width;
    const normY = clickY / this.canvas.height;

    const gx = normX * this.worldMap.width;
    const gy = normY * this.worldMap.height;

    const worldPos = Isometric.gridToScreen(gx, gy);
    this.camera.centerOn(worldPos.x, worldPos.y);
  }

  public render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.fillStyle = '#070a0d';
    ctx.fillRect(0, 0, w, h);

    const cellW = w / this.worldMap.width;
    const cellH = h / this.worldMap.height;

    // Draw terrain
    for (let x = 0; x < this.worldMap.width; x++) {
      for (let y = 0; y < this.worldMap.height; y++) {
        const tile = this.worldMap.tiles[x][y];
        if (tile === TileType.WATER) {
          ctx.fillStyle = '#1e3a8a';
        } else if (tile === TileType.DIRT) {
          ctx.fillStyle = '#78350f';
        } else {
          ctx.fillStyle = '#15803d';
        }
        ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw entities
    const entities = this.getEntities();
    for (const ent of entities) {
      const ex = ent.x * cellW;
      const ey = ent.y * cellH;

      if (ent.isUnit) {
        ctx.fillStyle = '#38bdf8'; // Blue player unit
        ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
      } else if (ent.isBuilding) {
        ctx.fillStyle = '#1d4ed8'; // Player building
        const bw = ent.tileWidth * cellW;
        const bh = ent.tileHeight * cellH;
        ctx.fillRect(ex - bw / 2, ey - bh / 2, bw, bh);
      } else if (ent.isResource) {
        ctx.fillStyle = '#fbbf24'; // Resource gold/wood/stone
        ctx.fillRect(ex - 1, ey - 1, 2, 2);
      }
    }

    // Draw camera frustum box
    const centerWorld = this.camera.screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
    const centerGrid = Isometric.screenToGrid(centerWorld.x, centerWorld.y);

    const viewSpanX = (window.innerWidth / this.camera.zoom / Isometric.TILE_WIDTH) * 0.7;
    const viewSpanY = (window.innerHeight / this.camera.zoom / Isometric.TILE_HEIGHT) * 0.7;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      (centerGrid.gx - viewSpanX / 2) * cellW,
      (centerGrid.gy - viewSpanY / 2) * cellH,
      viewSpanX * cellW,
      viewSpanY * cellH
    );
  }
}
