import { getMapLayout } from "../src/data/mapLayouts.ts";
import { minDistToPath, pathLength } from "../src/data/mapPathUtils.ts";

const ARCHER = 166;
const MIN_TOWER = 54;
const MIN_TOWER_OFF_PATH = 48;
const MIN_TRAP = 38;

for (const id of ["greenwatch", "sunspire", "frostgate", "underkeep"]) {
  const l = getMapLayout(id);
  const overlaps = [];
  for (let i = 0; i < l.towerPads.length; i += 1) {
    for (let j = i + 1; j < l.towerPads.length; j += 1) {
      const d = Math.hypot(l.towerPads[i].x - l.towerPads[j].x, l.towerPads[i].y - l.towerPads[j].y);
      if (d < MIN_TOWER) overlaps.push(`tower ${i}-${j} ${Math.round(d)}px`);
    }
  }
  for (let i = 0; i < l.trapPads.length; i += 1) {
    for (let j = i + 1; j < l.trapPads.length; j += 1) {
      const d = Math.hypot(l.trapPads[i].x - l.trapPads[j].x, l.trapPads[i].y - l.trapPads[j].y);
      if (d < MIN_TRAP) overlaps.push(`trap ${i}-${j} ${Math.round(d)}px`);
    }
  }
  const towerCov = l.towerPads.map((p) =>
    Math.round(Math.min(...l.routes.map((r) => minDistToPath(p.x, p.y, r.waypoints)))),
  );
  const towerOnPath = towerCov.filter((d) => d < MIN_TOWER_OFF_PATH);
  const trapOn = l.trapPads.map((p) =>
    Math.round(Math.min(...l.routes.map((r) => minDistToPath(p.x, p.y, r.waypoints)))),
  );
  console.log(
    id,
    "routes",
    l.routes.map((r) => `${r.id}:${Math.round(pathLength(r.waypoints))}`).join(" "),
    "towerCov",
    towerCov,
    "trapOn",
    trapOn,
    overlaps.length ? overlaps : "ok",
    towerOnPath.length ? `ON-PATH ${towerOnPath.join(",")}` : "",
  );
}
