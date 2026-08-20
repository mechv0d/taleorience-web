import { useAssets } from "@/api/hooks";
import { assetThumbnailUrl } from "@/api/endpoints";
import { cn } from "@/lib/cn";

/** Pure selectable asset grid used by the picker and inline block editors. */
export function AssetGrid({
  projectId,
  multi,
  selected,
  onSelect,
}: {
  projectId: string;
  multi: boolean;
  selected: string[];
  onSelect: (ids: string[]) => void;
}) {
  const { data: assets, isLoading } = useAssets(projectId);

  if (isLoading) {
    return <p className="py-4 text-center text-xs text-text-muted">Loading assets…</p>;
  }
  if (!assets || assets.length === 0) {
    return <p className="py-4 text-center text-xs text-text-muted">No assets yet. Upload some first.</p>;
  }

  return (
    <div className="grid max-h-64 grid-cols-3 gap-1.5 overflow-y-auto">
      {assets.map((asset) => {
        const active = selected.includes(asset.id);
        return (
          <button
            key={asset.id}
            onClick={() => {
              if (multi) {
                onSelect(active ? selected.filter((s) => s !== asset.id) : [...selected, asset.id]);
              } else {
                onSelect(active ? [] : [asset.id]);
              }
            }}
            data-testid={`asset-option-${asset.id}`}
            className={cn(
              "relative aspect-square overflow-hidden rounded-small border-2",
              active ? "border-primary" : "border-transparent",
            )}
          >
            <img src={assetThumbnailUrl(projectId, asset.id)} alt={asset.path} className="h-full w-full object-cover" />
            {active && <span className="absolute inset-0 bg-primary/20" />}
          </button>
        );
      })}
    </div>
  );
}