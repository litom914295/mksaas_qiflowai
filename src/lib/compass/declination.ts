export type DeclinationProvider = {
  getDeclinationDeg(lat: number, lon: number, date: Date): Promise<number>;
};

export type DeclinationCacheKey = string;

export class InMemoryDeclinationCache {
  private store = new Map<DeclinationCacheKey, { value: number; ts: number }>();
  constructor(
    private ttlMs = 24 * 60 * 60 * 1000,
    private max = 500
  ) {}
  get(key: DeclinationCacheKey): number | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.ts > this.ttlMs) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }
  set(key: DeclinationCacheKey, value: number) {
    if (this.store.size >= this.max) {
      const first = this.store.keys().next().value as string | undefined;
      if (first) this.store.delete(first);
    }
    this.store.set(key, { value, ts: Date.now() });
  }
}

export type WmmNoaaProviderOptions = {
  fetchImpl?: typeof fetch;
  cache?: InMemoryDeclinationCache;
};

// NOAA Geomag calculateDeclination JSON API (subject to availability).
// We keep it pluggable for tests via fetchImpl and cache.
export class WmmNoaaProvider implements DeclinationProvider {
  private fetchImpl: typeof fetch;
  private cache?: InMemoryDeclinationCache;
  constructor(opts: WmmNoaaProviderOptions = {}) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.cache = opts.cache;
  }
  async getDeclinationDeg(
    lat: number,
    lon: number,
    date: Date
  ): Promise<number> {
    const key = cacheKey(lat, lon, date);
    const hit = this.cache?.get(key);
    if (hit !== undefined) return hit;
    const url = buildNoaaUrl(lat, lon, date);
    const res = await this.fetchImpl(url);
    if (!res.ok) throw new Error(`WMM request failed: ${res.status}`);
    const json = await res.json();
    // Expected field path: result[0].declination or similar; keep flexible
    const d = extractDeclination(json);
    if (typeof d !== 'number' || Number.isNaN(d))
      throw new Error('Invalid declination in response');
    this.cache?.set(key, d);
    return d;
  }
}

function cacheKey(lat: number, lon: number, date: Date): string {
  // round lat/lon to 0.1°, date to day for caching
  const la = Math.round(lat * 10) / 10;
  const lo = Math.round(lon * 10) / 10;
  const day = date.toISOString().slice(0, 10);
  return `${la},${lo}@${day}`;
}

function buildNoaaUrl(lat: number, lon: number, date: Date): string {
  const day = date.toISOString().slice(0, 10);
  const params = new URLSearchParams({
    lat1: String(lat),
    lon1: String(lon),
    startYear: day,
    resultFormat: 'json',
  });
  // Public calculator endpoint; may change. User can override by proxying.
  return `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?${params.toString()}`;
}

function extractDeclination(
  payload:
    | {
        result?: Array<{ declination?: number }>;
        declination?: number;
      }
    | Record<string, unknown>
): number | undefined {
  // Try common shapes
  if (
    payload?.result &&
    Array.isArray(payload.result) &&
    payload.result.length > 0 &&
    typeof (payload.result as any)[0].declination === 'number'
  )
    return (payload.result as any)[0].declination;
  if (typeof payload?.declination === 'number') return payload.declination;
  return undefined;
}
