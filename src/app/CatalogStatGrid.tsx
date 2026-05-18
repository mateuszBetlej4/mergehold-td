import type { CatalogStat } from "./catalogStats";

type CatalogStatGridProps = {
  stats: CatalogStat[];
};

export function CatalogStatGrid({ stats }: CatalogStatGridProps) {
  if (stats.length === 0) return null;

  return (
    <dl className="catalog-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="catalog-stat">
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
