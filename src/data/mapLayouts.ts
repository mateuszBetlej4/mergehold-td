import {
  pushTowerPadsOffPath,
  resolveTowerPadsNearJunctions,
  resolveTrapPads,
  type PathRoute,
  type TrapOnPath,
} from "./mapPathUtils";

export type { PathRoute, TrapOnPath } from "./mapPathUtils";
export type MapPoint = { x: number; y: number };

export type MapDecor =
  | { kind: "tree"; x: number; y: number; scale?: number }
  | { kind: "rock"; x: number; y: number; scale?: number; tint?: number }
  | { kind: "pillar"; x: number; y: number; scale?: number; tint?: number };

export type MapLayoutSpec = {
  mapId: string;
  routes: PathRoute[];
  /** Explicit coords — preferred for merge chokes and spacing control */
  towerPads?: MapPoint[];
  towerPadSpecs?: Array<{
    routeId: string;
    segmentIndex: number;
    t: number;
    side: "left" | "right";
  }>;
  trapOnPath: TrapOnPath[];
  fort: MapPoint;
  hero: MapPoint;
  fortFx: MapPoint;
  mageAbilityCenter: MapPoint;
  decor: MapDecor[];
};

export type MapLayout = {
  mapId: string;
  routes: PathRoute[];
  towerPads: MapPoint[];
  trapPads: MapPoint[];
  fort: MapPoint;
  hero: MapPoint;
  fortFx: MapPoint;
  mageAbilityCenter: MapPoint;
  decor: MapDecor[];
};

const layoutSpecs: MapLayoutSpec[] = [
  {
    mapId: "greenwatch",
    routes: [
      {
        id: "west",
        label: "West glade",
        waypoints: [
          { x: 195, y: 28 },
          { x: 195, y: 78 },
          { x: 72, y: 168 },
          { x: 108, y: 268 },
          { x: 195, y: 368 },
          { x: 195, y: 452 },
        ],
      },
      {
        id: "east",
        label: "East ridge",
        waypoints: [
          { x: 195, y: 28 },
          { x: 195, y: 78 },
          { x: 318, y: 168 },
          { x: 282, y: 268 },
          { x: 195, y: 368 },
          { x: 195, y: 452 },
        ],
      },
    ],
    towerPads: [
      { x: 128, y: 118 },
      { x: 262, y: 118 },
      { x: 48, y: 218 },
      { x: 342, y: 218 },
      { x: 195, y: 318 },
      { x: 118, y: 408 },
      { x: 272, y: 408 },
    ],
    trapOnPath: [
      { routeId: "west", segmentIndex: 1, t: 0.55 },
      { routeId: "east", segmentIndex: 1, t: 0.55 },
      { routeId: "west", segmentIndex: 2, t: 0.5 },
      { routeId: "east", segmentIndex: 2, t: 0.5 },
      { routeId: "west", segmentIndex: 3, t: 0.55 },
    ],
    fort: { x: 195, y: 500 },
    hero: { x: 195, y: 508 },
    fortFx: { x: 195, y: 584 },
    mageAbilityCenter: { x: 195, y: 228 },
    decor: [
      { kind: "tree", x: 36, y: 104, scale: 0.72 },
      { kind: "tree", x: 345, y: 104, scale: 0.64 },
      { kind: "tree", x: 52, y: 526, scale: 0.6 },
      { kind: "tree", x: 345, y: 565, scale: 0.74 },
    ],
  },
  {
    mapId: "sunspire",
    routes: [
      {
        id: "ridge",
        label: "Sun ridge",
        waypoints: [
          { x: 195, y: 28 },
          { x: 268, y: 48 },
          { x: 312, y: 145 },
          { x: 288, y: 255 },
          { x: 228, y: 365 },
          { x: 195, y: 435 },
        ],
      },
      {
        id: "dune",
        label: "Dune sweep",
        waypoints: [
          { x: 195, y: 28 },
          { x: 122, y: 48 },
          { x: 78, y: 145 },
          { x: 102, y: 255 },
          { x: 162, y: 365 },
          { x: 195, y: 435 },
        ],
      },
    ],
    towerPads: [
      { x: 305, y: 95 },
      { x: 85, y: 95 },
      { x: 335, y: 200 },
      { x: 55, y: 200 },
      { x: 195, y: 290 },
      { x: 248, y: 385 },
    ],
    trapOnPath: [
      { routeId: "ridge", segmentIndex: 1, t: 0.5 },
      { routeId: "dune", segmentIndex: 1, t: 0.5 },
      { routeId: "ridge", segmentIndex: 2, t: 0.55 },
      { routeId: "dune", segmentIndex: 2, t: 0.55 },
      { routeId: "ridge", segmentIndex: 4, t: 0.4 },
    ],
    fort: { x: 195, y: 505 },
    hero: { x: 195, y: 513 },
    fortFx: { x: 195, y: 589 },
    mageAbilityCenter: { x: 195, y: 195 },
    decor: [
      { kind: "rock", x: 48, y: 130, scale: 1.1, tint: 0xb85c38 },
      { kind: "rock", x: 335, y: 118, scale: 0.95, tint: 0xc99f67 },
      { kind: "rock", x: 62, y: 548, scale: 0.85, tint: 0xecd6a5 },
      { kind: "rock", x: 328, y: 562, scale: 1.0, tint: 0xb85c38 },
    ],
  },
  {
    mapId: "frostgate",
    routes: [
      {
        id: "west",
        label: "Ice west",
        waypoints: [
          { x: 195, y: 28 },
          { x: 195, y: 72 },
          { x: 42, y: 148 },
          { x: 88, y: 228 },
          { x: 148, y: 298 },
          { x: 178, y: 378 },
          { x: 195, y: 468 },
        ],
      },
      {
        id: "center",
        label: "Frost road",
        waypoints: [
          { x: 195, y: 28 },
          { x: 195, y: 468 },
        ],
      },
      {
        id: "east",
        label: "Ice east",
        waypoints: [
          { x: 195, y: 28 },
          { x: 195, y: 72 },
          { x: 348, y: 148 },
          { x: 302, y: 228 },
          { x: 242, y: 298 },
          { x: 212, y: 378 },
          { x: 195, y: 468 },
        ],
      },
    ],
    towerPads: [
      { x: 52, y: 188 },
      { x: 338, y: 188 },
      { x: 118, y: 278 },
      { x: 272, y: 278 },
      { x: 148, y: 168 },
      { x: 242, y: 398 },
    ],
    trapOnPath: [
      { routeId: "west", segmentIndex: 1, t: 0.55 },
      { routeId: "east", segmentIndex: 1, t: 0.55 },
      { routeId: "center", segmentIndex: 0, t: 0.35 },
      { routeId: "west", segmentIndex: 3, t: 0.5 },
      { routeId: "east", segmentIndex: 3, t: 0.5 },
      { routeId: "center", segmentIndex: 0, t: 0.72 },
    ],
    fort: { x: 195, y: 510 },
    hero: { x: 195, y: 518 },
    fortFx: { x: 195, y: 594 },
    mageAbilityCenter: { x: 195, y: 280 },
    decor: [
      { kind: "pillar", x: 32, y: 100, scale: 0.9, tint: 0x365f7a },
      { kind: "pillar", x: 355, y: 108, scale: 0.85, tint: 0x365f7a },
      { kind: "rock", x: 45, y: 530, scale: 0.9, tint: 0xb9cbd0 },
      { kind: "pillar", x: 350, y: 568, scale: 0.95, tint: 0x365f7a },
    ],
  },
  {
    mapId: "underkeep",
    routes: [
      {
        id: "gauntlet",
        label: "Gauntlet",
        waypoints: [
          { x: 195, y: 28 },
          { x: 118, y: 72 },
          { x: 78, y: 142 },
          { x: 108, y: 212 },
          { x: 88, y: 282 },
          { x: 128, y: 352 },
          { x: 168, y: 412 },
          { x: 195, y: 458 },
        ],
      },
      {
        id: "crypt",
        label: "Crypt hall",
        waypoints: [
          { x: 195, y: 28 },
          { x: 272, y: 72 },
          { x: 312, y: 142 },
          { x: 282, y: 212 },
          { x: 302, y: 282 },
          { x: 262, y: 352 },
          { x: 222, y: 412 },
          { x: 195, y: 458 },
        ],
      },
    ],
    towerPads: [
      { x: 42, y: 178 },
      { x: 348, y: 178 },
      { x: 68, y: 318 },
      { x: 322, y: 318 },
      { x: 195, y: 248 },
    ],
    trapOnPath: [
      { routeId: "gauntlet", segmentIndex: 1, t: 0.5 },
      { routeId: "crypt", segmentIndex: 1, t: 0.5 },
      { routeId: "gauntlet", segmentIndex: 2, t: 0.45 },
      { routeId: "crypt", segmentIndex: 2, t: 0.45 },
      { routeId: "gauntlet", segmentIndex: 4, t: 0.5 },
      { routeId: "crypt", segmentIndex: 4, t: 0.5 },
      { routeId: "gauntlet", segmentIndex: 5, t: 0.55 },
    ],
    fort: { x: 195, y: 505 },
    hero: { x: 195, y: 513 },
    fortFx: { x: 195, y: 589 },
    mageAbilityCenter: { x: 195, y: 230 },
    decor: [
      { kind: "pillar", x: 40, y: 105, scale: 0.75, tint: 0x6856a3 },
      { kind: "pillar", x: 342, y: 92, scale: 0.7, tint: 0x6856a3 },
      { kind: "pillar", x: 58, y: 542, scale: 0.65, tint: 0x5d635c },
      { kind: "rock", x: 330, y: 555, scale: 0.8, tint: 0x6856a3 },
    ],
  },
];

function resolveLayout(spec: MapLayoutSpec): MapLayout {
  const rawTowerPads =
    spec.towerPads ??
    resolveTowerPadsNearJunctions(spec.routes, spec.towerPadSpecs ?? []);
  const towerPads = pushTowerPadsOffPath(spec.routes, rawTowerPads);

  return {
    mapId: spec.mapId,
    routes: spec.routes,
    towerPads,
    trapPads: resolveTrapPads(spec.routes, spec.trapOnPath),
    fort: spec.fort,
    hero: spec.hero,
    fortFx: spec.fortFx,
    mageAbilityCenter: spec.mageAbilityCenter,
    decor: spec.decor,
  };
}

const layouts = layoutSpecs.map(resolveLayout);
const layoutById = new Map(layouts.map((layout) => [layout.mapId, layout]));

export function getMapLayout(mapId: string): MapLayout {
  return layoutById.get(mapId) ?? layouts[0];
}

export function getMapLayoutSpec(mapId: string): MapLayoutSpec {
  return layoutSpecs.find((s) => s.mapId === mapId) ?? layoutSpecs[0];
}
