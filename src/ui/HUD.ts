import { Entity } from '../engine/entities/Entity';
import { Unit } from '../engine/entities/Unit';
import { Building } from '../engine/entities/Building';
import { ResourceNode } from '../engine/entities/ResourceNode';
import { SoundFX } from '../engine/SoundFX';

export interface PlayerResources {
  food: number;
  wood: number;
  gold: number;
  stone: number;
  pop: number;
  maxPop: number;
}

export class HUD {
  private resFoodEl: HTMLElement;
  private resWoodEl: HTMLElement;
  private resGoldEl: HTMLElement;
  private resStoneEl: HTMLElement;
  private resPopEl: HTMLElement;
  private fpsEl: HTMLElement;
  private unitsCountEl: HTMLElement;

  private selIconEl: HTMLElement;
  private selNameEl: HTMLElement;
  private selSubEl: HTMLElement;
  private selHpEl: HTMLElement;
  private selHpFillEl: HTMLElement;
  private selAttackEl: HTMLElement;
  private selRangeEl: HTMLElement;
  private selArmorEl: HTMLElement;
  private commandCardEl: HTMLElement;

  constructor(
    private onTrainUnit: (building: Building, type: 'villager' | 'swordsman') => void,
    private onBuildRequest: (type: 'house' | 'barracks') => void
  ) {
    this.resFoodEl = document.getElementById('res-food')!;
    this.resWoodEl = document.getElementById('res-wood')!;
    this.resGoldEl = document.getElementById('res-gold')!;
    this.resStoneEl = document.getElementById('res-stone')!;
    this.resPopEl = document.getElementById('res-pop')!;
    this.fpsEl = document.getElementById('fps-display')!;
    this.unitsCountEl = document.getElementById('units-count')!;

    this.selIconEl = document.getElementById('sel-icon')!;
    this.selNameEl = document.getElementById('sel-name')!;
    this.selSubEl = document.getElementById('sel-sub')!;
    this.selHpEl = document.getElementById('sel-hp')!;
    this.selHpFillEl = document.getElementById('sel-hp-fill')!;
    this.selAttackEl = document.getElementById('sel-attack')!;
    this.selRangeEl = document.getElementById('sel-range')!;
    this.selArmorEl = document.getElementById('sel-armor')!;
    this.commandCardEl = document.getElementById('command-card')!;
  }

  public updateResources(res: PlayerResources, fps: number, totalUnits: number) {
    this.resFoodEl.textContent = Math.floor(res.food).toString();
    this.resWoodEl.textContent = Math.floor(res.wood).toString();
    this.resGoldEl.textContent = Math.floor(res.gold).toString();
    this.resStoneEl.textContent = Math.floor(res.stone).toString();
    this.resPopEl.textContent = `${res.pop} / ${res.maxPop}`;
    this.fpsEl.textContent = Math.round(fps).toString();
    this.unitsCountEl.textContent = totalUnits.toString();
  }

  public updateSelection(selected: Entity[]) {
    this.commandCardEl.innerHTML = '';

    if (selected.length === 0) {
      this.selIconEl.textContent = '🛡️';
      this.selNameEl.textContent = 'Ninguna selección';
      this.selSubEl.textContent = 'Haz clic en una unidad o edificio';
      this.selHpEl.textContent = '-';
      this.selHpFillEl.style.width = '0%';
      this.selAttackEl.textContent = '-';
      this.selRangeEl.textContent = '-';
      this.selArmorEl.textContent = '-';
      return;
    }

    const primary = selected[0];

    // HP Bar
    const hpPct = Math.max(0, Math.min(100, (primary.hp / primary.maxHp) * 100));
    this.selHpEl.textContent = `${Math.floor(primary.hp)} / ${primary.maxHp}`;
    this.selHpFillEl.style.width = `${hpPct}%`;

    if (primary.isUnit) {
      const u = primary as Unit;
      this.selNameEl.textContent = u.name;
      this.selSubEl.textContent = `Estado: ${u.state.toUpperCase()}`;
      this.selIconEl.textContent = u.unitType === 'villager' ? '🧑‍🌾' : u.unitType === 'swordsman' ? '⚔️' : '🐎';
      this.selAttackEl.textContent = u.attack.toString();
      this.selRangeEl.textContent = '1 (Cuerpo a cuerpo)';
      this.selArmorEl.textContent = `${u.armor} / 0`;

      // Unit command buttons
      if (u.unitType === 'villager') {
        this.addCommandButton('🏠', 'Construir Casa (30 Madera)', 'Q', () => {
          this.onBuildRequest('house');
        });
        this.addCommandButton('🛡️', 'Construir Cuartel (150 Madera)', 'W', () => {
          this.onBuildRequest('barracks');
        });
      }

      this.addCommandButton('🛑', 'Detener Unidad (Stop)', 'S', () => {
        selected.forEach((ent) => {
          if (ent.isUnit) (ent as Unit).stop();
        });
        SoundFX.playCommand();
      });
    } else if (primary.isBuilding) {
      const b = primary as Building;
      this.selNameEl.textContent = b.name;
      this.selSubEl.textContent = b.queue.length > 0 ? `Entrenando (${b.queue.length})...` : 'Listo';
      this.selIconEl.textContent = b.buildingType === 'town_center' ? '🏰' : b.buildingType === 'barracks' ? '🛡️' : '🏠';
      this.selAttackEl.textContent = b.buildingType === 'town_center' ? '5' : '0';
      this.selRangeEl.textContent = b.buildingType === 'town_center' ? '6' : '0';
      this.selArmorEl.textContent = '3 / 8';

      if (b.buildingType === 'town_center') {
        this.addCommandButton('🧑', 'Crear Aldeano (50 Comida)', 'C', () => {
          this.onTrainUnit(b, 'villager');
        });
      } else if (b.buildingType === 'barracks') {
        this.addCommandButton('⚔️', 'Entrenar Espadachín (60 Comida, 20 Oro)', 'E', () => {
          this.onTrainUnit(b, 'swordsman');
        });
      }
    } else if (primary.isResource) {
      const r = primary as ResourceNode;
      this.selNameEl.textContent = r.name;
      this.selSubEl.textContent = `Tipo: ${r.resourceType.toUpperCase()}`;
      this.selIconEl.textContent = r.resourceType === 'wood' ? '🌲' : r.resourceType === 'gold' ? '🪙' : '🧱';
      this.selHpEl.textContent = `Cantidad: ${r.amount}`;
      this.selAttackEl.textContent = '-';
      this.selRangeEl.textContent = '-';
      this.selArmorEl.textContent = '-';
    }
  }

  private addCommandButton(icon: string, tooltip: string, hotkey: string, onClick: () => void) {
    const btn = document.createElement('button');
    btn.className = 'cmd-btn';
    btn.innerHTML = `
      <span>${icon}</span>
      <span class="btn-badge">${hotkey}</span>
      <div class="cmd-tooltip">${tooltip}</div>
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundFX.playBuild();
      onClick();
    });
    this.commandCardEl.appendChild(btn);
  }
}
