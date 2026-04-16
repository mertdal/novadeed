/**
 * NASA Exoplanet Archive TAP API Client
 * Free, no authentication required.
 * Fetches real exoplanet host star data and caches for 24 hours.
 */

const TAP_BASE = '/api/nasa';
const CACHE_KEY = 'starbound_nasa_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface NasaStarRecord {
  hostname: string;
  ra: number;
  dec: number;
  st_teff: number | null; // stellar effective temperature (K)
  st_rad: number | null; // stellar radius (solar radii)
  st_mass: number | null; // stellar mass (solar masses)
  sy_dist: number | null; // distance (parsecs)
  disc_year: number | null;
  pl_name: string;
  pl_rade: number | null; // planet radius (earth radii)
}

export interface NasaHostStar {
  hostname: string;
  ra: number;
  dec: number;
  temperature: number;
  radius: number;
  mass: number;
  distanceLy: number;
  discoveryYear: number;
  exoplanets: { name: string; radiusEarth: number; discoveryYear: number }[];
}

interface CacheData {
  timestamp: number;
  stars: NasaHostStar[];
}

/**
 * ADQL query: select 100 most notable confirmed exoplanet host stars
 * Groups by hostname and picks distinct systems with real temperature data
 */
function buildQuery(): string {
  return `
    SELECT TOP 100
      hostname, ra, dec, st_teff, st_rad, st_mass, sy_dist, disc_year, pl_name, pl_rade
    FROM pscomppars
    WHERE st_teff IS NOT NULL
      AND ra IS NOT NULL
      AND dec IS NOT NULL
      AND sy_dist IS NOT NULL
      AND default_flag = 1
    ORDER BY sy_dist ASC
  `.trim().replace(/\s+/g, ' ');
}

function getCached(): NasaHostStar[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CacheData = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data.stars;
  } catch {
    return null;
  }
}

function setCache(stars: NasaHostStar[]): void {
  try {
    const data: CacheData = { timestamp: Date.now(), stars };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently continue
  }
}

/**
 * Group raw NASA records by hostname into unique star systems
 */
function groupByHost(records: NasaStarRecord[]): NasaHostStar[] {
  const hostMap = new Map<string, NasaHostStar>();

  for (const rec of records) {
    if (!rec.hostname || rec.ra == null || rec.dec == null) continue;

    const existing = hostMap.get(rec.hostname);
    const planet = {
      name: rec.pl_name || 'Unknown',
      radiusEarth: rec.pl_rade || 1,
      discoveryYear: rec.disc_year || 2000,
    };

    if (existing) {
      existing.exoplanets.push(planet);
    } else {
      // Convert parsecs to light years (1 pc ≈ 3.26156 ly)
      const distLy = (rec.sy_dist || 100) * 3.26156;

      hostMap.set(rec.hostname, {
        hostname: rec.hostname,
        ra: rec.ra,
        dec: rec.dec,
        temperature: rec.st_teff || 5778,
        radius: rec.st_rad || 1,
        mass: rec.st_mass || 1,
        distanceLy: Math.round(distLy),
        discoveryYear: rec.disc_year || 2000,
        exoplanets: [planet],
      });
    }
  }

  return Array.from(hostMap.values());
}

/**
 * Fetch top 100 exoplanet host stars from NASA Exoplanet Archive.
 * Returns cached data if available and fresh.
 * Falls back to empty array on failure (app continues with static data).
 */
export async function fetchNasaExoplanets(): Promise<NasaHostStar[]> {
  // Check cache first
  const cached = getCached();
  if (cached) {
    console.log(`[NASA API] Using cached data (${cached.length} host stars)`);
    return cached;
  }

  try {
    console.log('[NASA API] Fetching real exoplanet data from NASA TAP...');

    const query = buildQuery();
    const url = `${TAP_BASE}?query=${encodeURIComponent(query)}&format=json`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      throw new Error(`NASA API HTTP ${response.status}`);
    }

    const rawData: NasaStarRecord[] = await response.json();
    const hostStars = groupByHost(rawData);

    console.log(`[NASA API] Fetched ${hostStars.length} unique host stars with ${rawData.length} planets`);

    // Cache for 24h
    setCache(hostStars);
    return hostStars;
  } catch (error) {
    console.warn('[NASA API] Failed to fetch data, using static catalog only:', error);
    return [];
  }
}
