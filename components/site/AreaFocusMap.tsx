interface AreaFocusMapProps {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  mapDelta?: number;
  heightClassName?: string;
}

function buildMapSrc(lat: number, lng: number, mapDelta: number): string {
  const minLng = lng - mapDelta;
  const maxLng = lng + mapDelta;
  const minLat = lat - mapDelta;
  const maxLat = lat + mapDelta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
}

export default function AreaFocusMap({
  lat,
  lng,
  title,
  subtitle = "Area focus",
  mapDelta = 0.22,
  heightClassName = "h-[280px] md:h-[340px]",
}: AreaFocusMapProps) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{subtitle}</p>
      </div>
      <div className={`relative ${heightClassName}`}>
        <iframe
          title={`${title} map`}
          src={buildMapSrc(lat, lng, mapDelta)}
          className="h-full w-full border-0"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[42%] w-[42%] rounded-full border-[3px] border-black/90 bg-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.75)]" />
        </div>
      </div>
    </div>
  );
}
