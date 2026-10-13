/**
 * Fast A* pathfinding on isometric grid with 8-directional movement
 */
export interface PathNode {
  x: number;
  y: number;
}

export class Pathfinding {
  /**
   * Finds shortest path using A* on an obstacle grid
   */
  public static findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    isBlocked: (x: number, y: number) => boolean,
    mapWidth: number,
    mapHeight: number
  ): PathNode[] {
    const sx = Math.floor(startX);
    const sy = Math.floor(startY);
    const tx = Math.floor(targetX);
    const ty = Math.floor(targetY);

    if (sx === tx && sy === ty) return [{ x: targetX, y: targetY }];
    if (tx < 0 || tx >= mapWidth || ty < 0 || ty >= mapHeight) return [];

    // If destination tile itself is directly blocked, find closest neighbor
    let endX = tx;
    let endY = ty;
    if (isBlocked(endX, endY)) {
      const neighbors = [
        { x: tx + 1, y: ty },
        { x: tx - 1, y: ty },
        { x: tx, y: ty + 1 },
        { x: tx, y: ty - 1 },
        { x: tx + 1, y: ty + 1 },
        { x: tx - 1, y: ty - 1 },
        { x: tx + 1, y: ty - 1 },
        { x: tx - 1, y: ty + 1 }
      ];
      let best = null;
      let minDist = Infinity;
      for (const n of neighbors) {
        if (n.x >= 0 && n.x < mapWidth && n.y >= 0 && n.y < mapHeight && !isBlocked(n.x, n.y)) {
          const d = Math.hypot(n.x - sx, n.y - sy);
          if (d < minDist) {
            minDist = d;
            best = n;
          }
        }
      }
      if (!best) return [];
      endX = best.x;
      endY = best.y;
    }

    interface NodeRecord {
      x: number;
      y: number;
      g: number;
      h: number;
      f: number;
      parent: NodeRecord | null;
    }

    const openSet: NodeRecord[] = [];
    const closedSet = new Set<string>();
    const nodeMap = new Map<string, NodeRecord>();

    const startNode: NodeRecord = {
      x: sx,
      y: sy,
      g: 0,
      h: Math.hypot(endX - sx, endY - sy),
      f: Math.hypot(endX - sx, endY - sy),
      parent: null
    };

    openSet.push(startNode);
    nodeMap.set(`${sx},${sy}`, startNode);

    const DIRS = [
      { dx: 1, dy: 0, cost: 1.0 },
      { dx: -1, dy: 0, cost: 1.0 },
      { dx: 0, dy: 1, cost: 1.0 },
      { dx: 0, dy: -1, cost: 1.0 },
      { dx: 1, dy: 1, cost: 1.414 },
      { dx: -1, dy: -1, cost: 1.414 },
      { dx: 1, dy: -1, cost: 1.414 },
      { dx: -1, dy: 1, cost: 1.414 }
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 1200;

    while (openSet.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;
      // Get lowest f score
      let lowestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIdx].f) {
          lowestIdx = i;
        }
      }

      const current = openSet.splice(lowestIdx, 1)[0];
      const curKey = `${current.x},${current.y}`;

      if (current.x === endX && current.y === endY) {
        // Reconstruct path
        const path: PathNode[] = [];
        let curr: NodeRecord | null = current;
        while (curr) {
          path.unshift({ x: curr.x + 0.5, y: curr.y + 0.5 });
          curr = curr.parent;
        }
        return path;
      }

      closedSet.add(curKey);

      for (const dir of DIRS) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;

        if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) continue;
        const nKey = `${nx},${ny}`;
        if (closedSet.has(nKey)) continue;

        if (isBlocked(nx, ny)) continue;

        // Diagonal corner cutting check
        if (dir.dx !== 0 && dir.dy !== 0) {
          if (isBlocked(current.x + dir.dx, current.y) && isBlocked(current.x, current.y + dir.dy)) {
            continue;
          }
        }

        const gScore = current.g + dir.cost;
        let neighbor = nodeMap.get(nKey);

        if (!neighbor) {
          const h = Math.hypot(endX - nx, endY - ny);
          neighbor = {
            x: nx,
            y: ny,
            g: gScore,
            h,
            f: gScore + h,
            parent: current
          };
          nodeMap.set(nKey, neighbor);
          openSet.push(neighbor);
        } else if (gScore < neighbor.g) {
          neighbor.g = gScore;
          neighbor.f = gScore + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    // Fallback if iteration cap reached: return direct line
    return [{ x: endX + 0.5, y: endY + 0.5 }];
  }
}
