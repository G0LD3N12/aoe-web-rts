/**
 * Isometric projection math for 2.5D Age of Empires style RTS
 * Standard 2:1 projection ratio (diamond grid)
 */
export class Isometric {
  public static readonly TILE_WIDTH = 96;
  public static readonly TILE_HEIGHT = 48;
  public static readonly HALF_WIDTH = Isometric.TILE_WIDTH / 2;
  public static readonly HALF_HEIGHT = Isometric.TILE_HEIGHT / 2;

  /**
   * Converts continuous grid (tile) coordinates to 2D screen world coordinates
   */
  public static gridToScreen(gx: number, gy: number, gz: number = 0): { x: number; y: number } {
    return {
      x: (gx - gy) * Isometric.HALF_WIDTH,
      y: (gx + gy) * Isometric.HALF_HEIGHT - gz * 24
    };
  }

  /**
   * Converts 2D screen world coordinates back to continuous grid coordinates
   */
  public static screenToGrid(sx: number, sy: number): { gx: number; gy: number } {
    const gx = (sx / Isometric.HALF_WIDTH + sy / Isometric.HALF_HEIGHT) / 2;
    const gy = (sy / Isometric.HALF_HEIGHT - sx / Isometric.HALF_WIDTH) / 2;
    return { gx, gy };
  }

  /**
   * Calculates depth (z-index) for Y-sorting entities on the isometric plane
   */
  public static getDepth(gx: number, gy: number, offset: number = 0): number {
    return Math.floor((gx + gy) * 100) + offset;
  }
}
