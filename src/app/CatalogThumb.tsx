import { colorToCss } from "../game/gameBridge";
import { getCatalogSprite, type CatalogCategory } from "./catalogSprites";

type CatalogThumbProps = {
  itemId: string;
  category: CatalogCategory;
  tint?: number;
  role?: string;
};

export function CatalogThumb({ itemId, category, tint, role }: CatalogThumbProps) {
  const sprite = getCatalogSprite(itemId, category, { tint, role });
  const bg = sprite.tint !== undefined ? `${colorToCss(sprite.tint)}33` : undefined;

  return (
    <div className="card-token catalog-thumb" style={bg ? { backgroundColor: bg } : undefined}>
      <img src={sprite.src} alt="" loading="lazy" decoding="async" />
    </div>
  );
}
