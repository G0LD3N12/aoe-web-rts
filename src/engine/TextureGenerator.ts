import * as PIXI from 'pixi.js';
import { Isometric } from './Isometric';

/**
 * Procedural Age of Empires sprite generator.
 * Produces crisp 2.5D isometric textures using canvas and registers them as PixiJS Textures.
 */
export class TextureGenerator {
  private static cache: Map<string, PIXI.Texture> = new Map();

  /**
   * Helper to create a PIXI.Texture from an HTMLCanvasElement
   */
  private static canvasToTexture(canvas: HTMLCanvasElement): PIXI.Texture {
    return PIXI.Texture.from(canvas);
  }

  /**
   * Isometric grass tile (AoE II style emerald green with subtle grass tufts)
   */
  public static getGrassTile(): PIXI.Texture {
    if (this.cache.has('tile_grass')) return this.cache.get('tile_grass')!;

    const w = Isometric.TILE_WIDTH;
    const h = Isometric.TILE_HEIGHT;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Diamond path
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(0, h / 2);
    ctx.closePath();

    // Base grass gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#4a7c29');
    grad.addColorStop(0.5, '#416f24');
    grad.addColorStop(1, '#335b1b');
    ctx.fillStyle = grad;
    ctx.fill();

    // Grass textures and blades
    ctx.save();
    ctx.clip();
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.5 ? '#579230' : '#2d4e16';
      ctx.fillRect(rx, ry, 2, 3);
    }
    // Subtle border contour for 3D depth
    ctx.strokeStyle = '#274413';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const tex = this.canvasToTexture(canvas);
    this.cache.set('tile_grass', tex);
    return tex;
  }

  /**
   * Isometric dirt tile
   */
  public static getDirtTile(): PIXI.Texture {
    if (this.cache.has('tile_dirt')) return this.cache.get('tile_dirt')!;

    const w = Isometric.TILE_WIDTH;
    const h = Isometric.TILE_HEIGHT;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(0, h / 2);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#7a5a3a');
    grad.addColorStop(1, '#5c4126');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.save();
    ctx.clip();
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#8c6843' : '#45301b';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.strokeStyle = '#3d2814';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const tex = this.canvasToTexture(canvas);
    this.cache.set('tile_dirt', tex);
    return tex;
  }

  /**
   * Isometric water tile
   */
  public static getWaterTile(): PIXI.Texture {
    if (this.cache.has('tile_water')) return this.cache.get('tile_water')!;

    const w = Isometric.TILE_WIDTH;
    const h = Isometric.TILE_HEIGHT;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(0, h / 2);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1c5d99');
    grad.addColorStop(1, '#0f3b60');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 15; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 6, 1.5);
    }
    ctx.strokeStyle = '#09253d';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const tex = this.canvasToTexture(canvas);
    this.cache.set('tile_water', tex);
    return tex;
  }

  /**
   * Oak Tree Resource Sprite
   */
  public static getTreeTexture(): PIXI.Texture {
    if (this.cache.has('res_tree')) return this.cache.get('res_tree')!;

    const canvas = document.createElement('canvas');
    canvas.width = 70;
    canvas.height = 90;
    const ctx = canvas.getContext('2d')!;

    // Ground shadow
    ctx.beginPath();
    ctx.ellipse(35, 78, 22, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(31, 52, 9, 28);
    ctx.fillStyle = '#422814';
    ctx.fillRect(35, 52, 5, 28);

    // Leaves / Foliage layers (AoE stylized deep green puff clusters)
    const drawFoliage = (cx: number, cy: number, r: number, color1: string, color2: string) => {
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    drawFoliage(35, 48, 20, '#4f7d28', '#264410');
    drawFoliage(24, 38, 17, '#5d9130', '#2d5214');
    drawFoliage(45, 36, 18, '#5d9130', '#2a4d13');
    drawFoliage(35, 24, 18, '#6eae38', '#386619');

    const tex = this.canvasToTexture(canvas);
    this.cache.set('res_tree', tex);
    return tex;
  }

  /**
   * Gold Mine Resource Sprite
   */
  public static getGoldTexture(): PIXI.Texture {
    if (this.cache.has('res_gold')) return this.cache.get('res_gold')!;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 54;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(32, 44, 26, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Gray rock base
    ctx.beginPath();
    ctx.moveTo(12, 42);
    ctx.lineTo(24, 20);
    ctx.lineTo(44, 16);
    ctx.lineTo(54, 34);
    ctx.lineTo(46, 46);
    ctx.closePath();
    ctx.fillStyle = '#6b7280';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Golden sparkling veins
    const goldVeins = [
      { x: 26, y: 24, w: 10, h: 6 },
      { x: 38, y: 22, w: 8, h: 5 },
      { x: 30, y: 34, w: 12, h: 7 },
      { x: 18, y: 32, w: 7, h: 5 }
    ];
    for (const v of goldVeins) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(v.x, v.y, v.w, v.h);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(v.x + 1, v.y + 1, v.w - 3, 2);
    }

    const tex = this.canvasToTexture(canvas);
    this.cache.set('res_gold', tex);
    return tex;
  }

  /**
   * Stone Quarry Resource Sprite
   */
  public static getStoneTexture(): PIXI.Texture {
    if (this.cache.has('res_stone')) return this.cache.get('res_stone')!;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 50;
    const ctx = canvas.getContext('2d')!;

    ctx.beginPath();
    ctx.ellipse(32, 42, 24, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Rock formation
    ctx.beginPath();
    ctx.moveTo(14, 40);
    ctx.lineTo(20, 22);
    ctx.lineTo(40, 18);
    ctx.lineTo(52, 32);
    ctx.lineTo(48, 44);
    ctx.closePath();
    ctx.fillStyle = '#9ca3af';
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Facet highlights
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(22, 23);
    ctx.lineTo(38, 20);
    ctx.lineTo(32, 32);
    ctx.fill();

    const tex = this.canvasToTexture(canvas);
    this.cache.set('res_stone', tex);
    return tex;
  }

  /**
   * Town Center Building (AoE Iconic 3x3 Building)
   */
  public static getTownCenterTexture(): PIXI.Texture {
    if (this.cache.has('bldg_town_center')) return this.cache.get('bldg_town_center')!;

    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    // Ground Shadow
    ctx.beginPath();
    ctx.ellipse(90, 130, 75, 25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Stone foundation base
    ctx.fillStyle = '#78716c';
    ctx.fillRect(40, 95, 100, 35);
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 95, 100, 35);

    // Archway entrance
    ctx.beginPath();
    ctx.arc(90, 110, 18, Math.PI, 0);
    ctx.lineTo(108, 130);
    ctx.lineTo(72, 130);
    ctx.closePath();
    ctx.fillStyle = '#1c1917';
    ctx.fill();

    // Wooden timber beams / walls
    ctx.fillStyle = '#a16207';
    ctx.fillRect(48, 60, 84, 38);
    ctx.fillStyle = '#713f12';
    ctx.fillRect(48, 60, 6, 38);
    ctx.fillRect(126, 60, 6, 38);
    ctx.fillRect(87, 60, 6, 38);

    // Thatched / tiled roof (Roofed canopy)
    ctx.beginPath();
    ctx.moveTo(25, 65);
    ctx.lineTo(90, 20);
    ctx.lineTo(155, 65);
    ctx.lineTo(90, 80);
    ctx.closePath();
    const roofGrad = ctx.createLinearGradient(90, 20, 90, 80);
    roofGrad.addColorStop(0, '#c2410c');
    roofGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = roofGrad;
    ctx.fill();
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 2;
    ctx.stroke();

    // AoE Town Bell and tower watch post
    ctx.fillStyle = '#78716c';
    ctx.fillRect(80, 8, 20, 22);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(90, 22, 5, 0, Math.PI * 2);
    ctx.fill();

    // Medieval Blue/Gold Banner
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(98, 4, 16, 12);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(104, 7, 4, 6);

    const tex = this.canvasToTexture(canvas);
    this.cache.set('bldg_town_center', tex);
    return tex;
  }

  /**
   * Barracks Building (AoE 3x3 Military Building)
   */
  public static getBarracksTexture(): PIXI.Texture {
    if (this.cache.has('bldg_barracks')) return this.cache.get('bldg_barracks')!;

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 140;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(80, 115, 65, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Wood & stone walls
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(35, 70, 90, 42);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 70, 90, 42);

    // Doorway
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(72, 88, 16, 24);

    // Roof
    ctx.beginPath();
    ctx.moveTo(25, 72);
    ctx.lineTo(80, 32);
    ctx.lineTo(135, 72);
    ctx.lineTo(80, 85);
    ctx.closePath();
    ctx.fillStyle = '#991b1b';
    ctx.fill();
    ctx.strokeStyle = '#450a0a';
    ctx.stroke();

    // Training target / shield banner
    ctx.beginPath();
    ctx.arc(52, 90, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f87171';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(52, 90, 4, 0, Math.PI * 2);
    ctx.fill();

    const tex = this.canvasToTexture(canvas);
    this.cache.set('bldg_barracks', tex);
    return tex;
  }

  /**
   * House Cottage Building (AoE 2x2 Building)
   */
  public static getHouseTexture(): PIXI.Texture {
    if (this.cache.has('bldg_house')) return this.cache.get('bldg_house')!;

    const canvas = document.createElement('canvas');
    canvas.width = 110;
    canvas.height = 110;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(55, 90, 42, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Stone base
    ctx.fillStyle = '#78716c';
    ctx.fillRect(25, 60, 60, 30);
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(25, 60, 60, 30);

    // Door & window
    ctx.fillStyle = '#451a03';
    ctx.fillRect(48, 72, 14, 18);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(32, 68, 8, 8);

    // Chimney with smoke
    ctx.fillStyle = '#57534e';
    ctx.fillRect(66, 26, 10, 18);

    // Thatched roof
    ctx.beginPath();
    ctx.moveTo(15, 62);
    ctx.lineTo(55, 30);
    ctx.lineTo(95, 62);
    ctx.lineTo(55, 72);
    ctx.closePath();
    ctx.fillStyle = '#ca8a04';
    ctx.fill();
    ctx.strokeStyle = '#713f12';
    ctx.stroke();

    const tex = this.canvasToTexture(canvas);
    this.cache.set('bldg_house', tex);
    return tex;
  }

  /**
   * Villager Unit Sprite
   */
  public static getVillagerTexture(): PIXI.Texture {
    if (this.cache.has('unit_villager')) return this.cache.get('unit_villager')!;

    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 54;
    const ctx = canvas.getContext('2d')!;

    // Small shadow
    ctx.beginPath();
    ctx.ellipse(20, 48, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Legs
    ctx.fillStyle = '#451a03';
    ctx.fillRect(16, 36, 3, 11);
    ctx.fillRect(21, 36, 3, 11);

    // Tunic (Blue Player color)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(14, 23, 12, 14);

    // Head / Face
    ctx.beginPath();
    ctx.arc(20, 17, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fbcfe8';
    ctx.fill();

    // Peasant Straw Hat
    ctx.beginPath();
    ctx.ellipse(20, 14, 9, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ca8a04';
    ctx.fill();

    // Tool: Pitchfork / wooden axe
    ctx.fillStyle = '#78350f';
    ctx.fillRect(26, 12, 2, 28);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(25, 10, 4, 3);

    const tex = this.canvasToTexture(canvas);
    this.cache.set('unit_villager', tex);
    return tex;
  }

  /**
   * Swordsman / Militia Unit Sprite (AoE armed soldier)
   */
  public static getSwordsmanTexture(): PIXI.Texture {
    if (this.cache.has('unit_swordsman')) return this.cache.get('unit_swordsman')!;

    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 56;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(22, 50, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Armored legs
    ctx.fillStyle = '#475569';
    ctx.fillRect(17, 38, 4, 11);
    ctx.fillRect(23, 38, 4, 11);

    // Armor chestplate & player tunic
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(15, 24, 14, 15);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(17, 24, 10, 8);

    // Iron Helmet
    ctx.beginPath();
    ctx.arc(22, 18, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.fillStyle = '#dc2626'; // Red plume
    ctx.fillRect(21, 9, 2, 6);

    // Shield (Left hand)
    ctx.beginPath();
    ctx.ellipse(12, 28, 5, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sword (Right hand)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(30, 12, 2, 22);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(28, 28, 6, 2);

    const tex = this.canvasToTexture(canvas);
    this.cache.set('unit_swordsman', tex);
    return tex;
  }
}
