import type { MapPoint } from "./mapLayouts";

export type PathRoute = {
  id: string;
  label: string;
  waypoints: MapPoint[];
};

export type TrapOnPath = {
  routeId: string;
  segmentIndex: number;
  /** 0–1 along segment */
  t: number;
};

export function pathLength(waypoints: MapPoint[]): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    total += Math.hypot(waypoints[i + 1].x - waypoints[i].x, waypoints[i + 1].y - waypoints[i].y);
  }
  return total;
}

export function pointOnSegment(a: MapPoint, b: MapPoint, t: number): MapPoint {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function distToSegment(px: number, py: number, a: MapPoint, b: MapPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - a.x, py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

export function minDistToPath(px: number, py: number, waypoints: MapPoint[]): number {
  let min = Infinity;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    min = Math.min(min, distToSegment(px, py, waypoints[i], waypoints[i + 1]));
  }
  return min;
}

export function resolveTrapPads(routes: PathRoute[], trapOnPath: TrapOnPath[]): MapPoint[] {
  return trapOnPath.map((spec) => {
    const route = routes.find((r) => r.id === spec.routeId) ?? routes[0];
    const a = route.waypoints[spec.segmentIndex];
    const b = route.waypoints[spec.segmentIndex + 1] ?? a;
    return pointOnSegment(a, b, spec.t);
  });
}

/** Minimum gap between tower build circles (radius 26 → 52px center-to-center). */
export const MIN_TOWER_PAD_GAP = 56;

/** Tower pad center must stay this far from path (pad radius 26 + path dot ~12). */
export const MIN_TOWER_OFF_PATH = 56;

const CANVAS_MARGIN = 28;

type ClosestOnPath = {
  x: number;
  y: number;
  dist: number;
  normalX: number;
  normalY: number;
};

function closestOnRoutes(px: number, py: number, routes: PathRoute[]): ClosestOnPath {
  let best: ClosestOnPath = { x: px, y: py, dist: Infinity, normalX: 0, normalY: 1 };

  for (const route of routes) {
    for (let i = 0; i < route.waypoints.length - 1; i += 1) {
      const a = route.waypoints[i];
      const b = route.waypoints[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      let t = len2 === 0 ? 0 : ((px - a.x) * dx + (py - a.y) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = a.x + t * dx;
      const cy = a.y + t * dy;
      const dist = Math.hypot(px - cx, py - cy);

      const segLen = Math.hypot(dx, dy) || 1;
      let nx = dy / segLen;
      let ny = -dx / segLen;
      const toPadX = px - cx;
      const toPadY = py - cy;
      if (toPadX * nx + toPadY * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      if (Math.hypot(toPadX, toPadY) < 0.01) {
        const preferLeft = cx < 195;
        if (!preferLeft) {
          nx = -nx;
          ny = -ny;
        }
      }

      if (dist < best.dist) {
        best = { x: cx, y: cy, dist, normalX: nx, normalY: ny };
      }
    }
  }

  return best;
}

function clampToCanvas(p: MapPoint): MapPoint {
  return {
    x: Math.max(CANVAS_MARGIN, Math.min(390 - CANVAS_MARGIN, p.x)),
    y: Math.max(CANVAS_MARGIN, Math.min(694 - CANVAS_MARGIN, p.y)),
  };
}

function minDistToAllRoutes(px: number, py: number, routes: PathRoute[]): number {
  return Math.min(...routes.map((route) => minDistToPath(px, py, route.waypoints)));
}

/** Push tower pads off lane tiles so build circles do not sit on the path. */
export function pushTowerPadsOffPath(
  routes: PathRoute[],
  pads: MapPoint[],
  minOffPath = MIN_TOWER_OFF_PATH,
): MapPoint[] {
  return pads.map((pad) => {
    let point = { ...pad };

    for (let attempt = 0; attempt < 10; attempt += 1) {
      if (minDistToAllRoutes(point.x, point.y, routes) >= minOffPath) break;

      const hit = closestOnRoutes(point.x, point.y, routes);
      point = clampToCanvas({
        x: Math.round(hit.x + hit.normalX * minOffPath),
        y: Math.round(hit.y + hit.normalY * minOffPath),
      });
    }

    return point;
  });
}

export function resolveTowerPadsNearJunctions(
  routes: PathRoute[],
  specs: Array<{ routeId: string; segmentIndex: number; t: number; side: "left" | "right" }>,
  offset = 62,
): MapPoint[] {
  return specs.map((spec) => {
    const route = routes.find((r) => r.id === spec.routeId) ?? routes[0];
    const a = route.waypoints[spec.segmentIndex];
    const b = route.waypoints[spec.segmentIndex + 1] ?? a;
    const onPath = pointOnSegment(a, b, spec.t);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const normal = spec.side === "left" ? angle - Math.PI / 2 : angle + Math.PI / 2;
    return {
      x: Math.round(onPath.x + Math.cos(normal) * offset),
      y: Math.round(onPath.y + Math.sin(normal) * offset),
    };
  });
}

export type PathThreatSample = {
  length: number;
  towerThreat: number;
  trapSlots: number;
};

export function scoreRoute(
  waypoints: MapPoint[],
  towerSamples: Array<{ x: number; y: number; range: number; dps: number }>,
  trapPoints: MapPoint[],
): PathThreatSample {
  let towerThreat = 0;
  for (const tower of towerSamples) {
    if (minDistToPath(tower.x, tower.y, waypoints) < tower.range) {
      towerThreat += tower.dps;
    }
  }

  let trapSlots = 0;
  for (const trap of trapPoints) {
    if (minDistToPath(trap.x, trap.y, waypoints) < 40) trapSlots += 1;
  }

  return { length: pathLength(waypoints), towerThreat, trapSlots };
}
