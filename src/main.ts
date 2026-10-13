import * as PIXI from 'pixi.js';
import { Isometric } from './engine/Isometric';
import { Camera } from './engine/Camera';
import { WorldMap } from './engine/WorldMap';
import { GameManager } from './engine/systems/GameManager';
import { SelectionSystem } from './engine/systems/SelectionSystem';
import { HUD } from './ui/HUD';
import { Minimap } from './ui/Minimap';
import { Unit } from './engine/entities/Unit';

async function bootstrap() {
  const container = document.getElementById('canvas-container')!;

  // 1. Initialize PixiJS v8 Application with WebGL preference for broad compatibility
  const app = new PIXI.Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x080c10,
    preference: 'webgl',
    antialias: true,
    autoDensity: true,
    resolution: 1
  });

  container.appendChild(app.canvas);

  // 2. Root RTS World Scene Container
  const worldContainer = new PIXI.Container();
  app.stage.addChild(worldContainer);

  // 3. World Terrain Map
  const worldMap = new WorldMap(42, 42);
  worldContainer.addChild(worldMap.container);

  // 4. Game Manager (Units, Buildings, Resources)
  const gameManager = new GameManager();
  worldContainer.addChild(gameManager.entityContainer);

  // 5. RTS Camera
  const camera = new Camera(worldContainer, window.innerWidth, window.innerHeight);
  // Center camera on Town Center (tile 20, 20)
  const townCenterPos = Isometric.gridToScreen(20, 20);
  camera.centerOn(townCenterPos.x, townCenterPos.y);

  window.addEventListener('resize', () => {
    camera.resize(window.innerWidth, window.innerHeight);
  });

  // 6. UI HUD & Minimap
  let hud: HUD;
  hud = new HUD(
    (building, type) => {
      gameManager.trainUnit(building, type);
      hud.updateSelection(selectionSystem.selectedEntities);
    },
    (type) => {
      // Build structure near selected unit or town center
      const selUnit = selectionSystem.selectedEntities.find((e) => e.isUnit) as Unit | undefined;
      const bx = selUnit ? selUnit.x + 1 : 20;
      const by = selUnit ? selUnit.y + 1 : 20;
      gameManager.buildStructure(type, bx, by);
    }
  );

  const minimap = new Minimap(worldMap, camera, () => gameManager.entities);

  // 7. Selection & Commands System
  const selectionSystem = new SelectionSystem(
    camera,
    worldMap,
    () => gameManager.entities,
    (selected) => {
      hud.updateSelection(selected);
    }
  );

  // Initial selection of Town Center
  const initialTC = gameManager.entities.find((e) => e.name === 'Centro Urbano');
  if (initialTC) {
    initialTC.setSelected(true);
    selectionSystem.selectedEntities = [initialTC];
    hud.updateSelection([initialTC]);
  }

  // 8. Game Loop
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTime = 0;
  let currentFps = 60;

  app.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // FPS calculation
    frameCount++;
    fpsTime += dt;
    if (fpsTime >= 0.5) {
      currentFps = frameCount / fpsTime;
      frameCount = 0;
      fpsTime = 0;
    }

    // Update camera and navigation
    camera.update(dt);

    // Update game logic (units, production, resources)
    gameManager.update(dt);

    // Refresh UI
    hud.updateResources(gameManager.resources, currentFps, gameManager.entities.filter((e) => e.isUnit).length);
    minimap.render();
  });
}

bootstrap().catch((err) => {
  console.error('Failed to initialize AoE RTS game:', err);
});
