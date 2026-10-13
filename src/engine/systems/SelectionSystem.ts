import { Entity } from '../entities/Entity';
import { Unit } from '../entities/Unit';
import { ResourceNode } from '../entities/ResourceNode';
import { Building } from '../entities/Building';
import { Camera } from '../Camera';
import { Isometric } from '../Isometric';
import { Pathfinding } from '../Pathfinding';
import { WorldMap } from '../WorldMap';
import { SoundFX } from '../SoundFX';

export class SelectionSystem {
  public selectedEntities: Entity[] = [];
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private selectionBoxEl: HTMLElement | null;

  constructor(
    private camera: Camera,
    private worldMap: WorldMap,
    private getEntities: () => Entity[],
    private onSelectionChanged: (selected: Entity[]) => void
  ) {
    this.selectionBoxEl = document.getElementById('selection-box');
    this.setupListeners();
  }

  private setupListeners() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    container.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        if (this.selectionBoxEl) {
          this.selectionBoxEl.style.left = `${e.clientX}px`;
          this.selectionBoxEl.style.top = `${e.clientY}px`;
          this.selectionBoxEl.style.width = '0px';
          this.selectionBoxEl.style.height = '0px';
          this.selectionBoxEl.style.display = 'block';
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.selectionBoxEl) return;

      const minX = Math.min(this.dragStartX, e.clientX);
      const minY = Math.min(this.dragStartY, e.clientY);
      const width = Math.abs(e.clientX - this.dragStartX);
      const height = Math.abs(e.clientY - this.dragStartY);

      this.selectionBoxEl.style.left = `${minX}px`;
      this.selectionBoxEl.style.top = `${minY}px`;
      this.selectionBoxEl.style.width = `${width}px`;
      this.selectionBoxEl.style.height = `${height}px`;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0 && this.isDragging) {
        this.isDragging = false;
        if (this.selectionBoxEl) {
          this.selectionBoxEl.style.display = 'none';
        }

        const dragDist = Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY);
        if (dragDist < 6) {
          // Single click selection
          this.handleSingleClick(e.clientX, e.clientY);
        } else {
          // Marquee box multi-selection
          this.handleBoxSelection(
            Math.min(this.dragStartX, e.clientX),
            Math.min(this.dragStartY, e.clientY),
            Math.max(this.dragStartX, e.clientX),
            Math.max(this.dragStartY, e.clientY)
          );
        }
      } else if (e.button === 2) { // Right click: Orders
        this.handleRightClick(e.clientX, e.clientY);
      }
    });
  }

  private handleSingleClick(clientX: number, clientY: number) {
    const worldPoint = this.camera.screenToWorld(clientX, clientY);
    const gridPos = Isometric.screenToGrid(worldPoint.x, worldPoint.y);

    const entities = this.getEntities();
    let bestEntity: Entity | null = null;
    let bestDist = Infinity;

    // Hit test entities (prioritize units over buildings over resources)
    for (const ent of entities) {
      const dx = gridPos.gx - ent.x;
      const dy = gridPos.gy - ent.y;
      const dist = Math.hypot(dx, dy);

      const radius = Math.max(ent.tileWidth, ent.tileHeight) * 0.8;
      if (dist < radius && dist < bestDist) {
        bestDist = dist;
        bestEntity = ent;
      }
    }

    this.clearSelection();
    if (bestEntity) {
      bestEntity.setSelected(true);
      this.selectedEntities = [bestEntity];
      SoundFX.playSelect();
    }
    this.onSelectionChanged(this.selectedEntities);
  }

  private handleBoxSelection(minX: number, minY: number, maxX: number, maxY: number) {
    this.clearSelection();
    const entities = this.getEntities();
    const newlySelected: Entity[] = [];

    for (const ent of entities) {
      // Box selection only selects units
      if (!ent.isUnit) continue;

      const screenPos = Isometric.gridToScreen(ent.x, ent.y);
      const viewportScreen = this.camera.worldToScreen(screenPos.x, screenPos.y);

      if (
        viewportScreen.x >= minX &&
        viewportScreen.x <= maxX &&
        viewportScreen.y >= minY &&
        viewportScreen.y <= maxY
      ) {
        ent.setSelected(true);
        newlySelected.push(ent);
      }
    }

    this.selectedEntities = newlySelected;
    if (newlySelected.length > 0) {
      SoundFX.playSelect();
    }
    this.onSelectionChanged(this.selectedEntities);
  }

  private handleRightClick(clientX: number, clientY: number) {
    const selectedUnits = this.selectedEntities.filter((e) => e.isUnit) as Unit[];
    if (selectedUnits.length === 0) return;

    const worldPoint = this.camera.screenToWorld(clientX, clientY);
    const gridPos = Isometric.screenToGrid(worldPoint.x, worldPoint.y);

    const entities = this.getEntities();
    // Check if target is a resource node
    let targetResource: ResourceNode | null = null;
    for (const ent of entities) {
      if (ent.isResource) {
        const d = Math.hypot(gridPos.gx - ent.x, gridPos.gy - ent.y);
        if (d < 1.0) {
          targetResource = ent as ResourceNode;
          break;
        }
      }
    }

    SoundFX.playCommand();

    // Move or harvest orders for each unit
    selectedUnits.forEach((unit, idx) => {
      // Slight spread for multiple units
      const spreadX = (idx % 3) * 0.4 - 0.4;
      const spreadY = Math.floor(idx / 3) * 0.4 - 0.4;
      const destX = Math.round(gridPos.gx + spreadX);
      const destY = Math.round(gridPos.gy + spreadY);

      const path = Pathfinding.findPath(
        unit.x,
        unit.y,
        destX,
        destY,
        (x, y) => !this.worldMap.isWalkable(x, y),
        this.worldMap.width,
        this.worldMap.height
      );

      if (targetResource && unit.unitType === 'villager') {
        unit.assignGather(targetResource, path);
      } else {
        unit.setPath(path);
      }
    });
  }

  public clearSelection() {
    for (const ent of this.selectedEntities) {
      ent.setSelected(false);
    }
    this.selectedEntities = [];
  }
}
