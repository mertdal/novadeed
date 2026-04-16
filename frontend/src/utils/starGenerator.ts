import * as THREE from 'three';
import type { StarData } from '../types';
import { getPaletteForStar, getLabelForClass } from './colors';
import type { NasaHostStar } from '../services/nasaApi';

// Real star data from IAU (International Astronomical Union) star catalog
// These names are official scientific designations - no copyright issues
// Format: [name, RA (hours→degrees), Dec (degrees), magnitude, spectralClass, distance(ly)]
const REAL_STARS: [string, number, number, number, string, number][] = [
  // Most famous / brightest stars
  ['Sirius', 101.287, -16.716, -1.46, 'A', 8.6],
  ['Canopus', 95.988, -52.696, -0.74, 'F', 310],
  ['Arcturus', 213.915, 19.182, -0.05, 'K', 36.7],
  ['Vega', 279.235, 38.784, 0.03, 'A', 25],
  ['Capella', 79.172, 45.998, 0.08, 'G', 42.9],
  ['Rigel', 78.634, -8.202, 0.13, 'B', 860],
  ['Procyon', 114.826, 5.225, 0.34, 'F', 11.4],
  ['Betelgeuse', 88.793, 7.407, 0.42, 'M', 700],
  ['Altair', 297.696, 8.868, 0.76, 'A', 16.7],
  ['Aldebaran', 68.980, 16.509, 0.86, 'K', 65.3],
  ['Antares', 247.352, -26.432, 0.96, 'M', 600],
  ['Spica', 201.298, -11.161, 0.97, 'B', 260],
  ['Pollux', 116.330, 28.026, 1.14, 'K', 33.8],
  ['Fomalhaut', 344.413, -29.622, 1.16, 'A', 25.1],
  ['Deneb', 310.358, 45.280, 1.25, 'A', 2600],
  ['Regulus', 152.093, 11.967, 1.35, 'B', 79.3],
  ['Castor', 113.650, 31.888, 1.58, 'A', 51],
  ['Bellatrix', 81.283, 6.350, 1.64, 'B', 250],
  ['Alnilam', 84.053, -1.202, 1.69, 'B', 2000],
  ['Polaris', 37.954, 89.264, 1.98, 'F', 431],

  // Second tier - well-known stars
  ['Algol', 47.042, 40.957, 2.12, 'B', 93],
  ['Mizar', 200.981, 54.925, 2.04, 'A', 78],
  ['Dubhe', 165.932, 61.751, 1.79, 'K', 124],
  ['Alioth', 193.507, 55.960, 1.77, 'A', 81],
  ['Alkaid', 206.885, 49.313, 1.86, 'B', 104],
  ['Merak', 165.460, 56.382, 2.37, 'A', 79.7],
  ['Phecda', 178.457, 53.695, 2.44, 'A', 83.2],
  ['Megrez', 183.856, 57.033, 3.31, 'A', 81.4],
  ['Achernar', 24.429, -57.237, 0.46, 'B', 139],
  ['Hadar', 210.956, -60.373, 0.61, 'B', 390],

  ['Acrux', 186.650, -63.099, 0.76, 'B', 320],
  ['Mimosa', 191.930, -59.689, 1.25, 'B', 280],
  ['Shaula', 263.402, -37.104, 1.62, 'B', 570],
  ['Gacrux', 187.791, -57.113, 1.64, 'M', 88],
  ['Elnath', 81.573, 28.608, 1.65, 'B', 134],
  ['Alnair', 332.058, -46.961, 1.74, 'B', 101],
  ['Alnitak', 85.190, -1.943, 1.77, 'O', 1200],
  ['Alioth', 193.507, 55.960, 1.77, 'A', 81],
  ['Mirfak', 51.081, 49.861, 1.79, 'F', 592],
  ['Kaus Australis', 276.043, -34.384, 1.85, 'B', 143],

  ['Wezen', 107.098, -26.393, 1.84, 'F', 1800],
  ['Sargas', 264.330, -43.002, 1.87, 'F', 272],
  ['Avior', 125.629, -59.510, 1.86, 'K', 630],
  ['Menkalinan', 89.882, 44.948, 1.90, 'A', 82],
  ['Atria', 252.166, -69.028, 1.92, 'K', 415],
  ['Alhena', 99.428, 16.399, 1.93, 'A', 109],
  ['Peacock', 306.412, -56.735, 1.94, 'B', 179],
  ['Alsephina', 131.176, -54.709, 1.96, 'A', 80],
  ['Mirzam', 95.675, -17.956, 1.98, 'B', 500],
  ['Alphard', 141.897, -8.659, 1.98, 'K', 177],

  // Third tier
  ['Hamal', 31.793, 23.462, 2.00, 'K', 66],
  ['Nunki', 283.816, -26.297, 2.02, 'B', 228],
  ['Diphda', 10.897, -17.987, 2.02, 'K', 96],
  ['Miaplacidus', 138.300, -69.717, 1.68, 'A', 111],
  ['Saiph', 86.939, -9.670, 2.09, 'B', 720],
  ['Rasalhague', 263.734, 12.560, 2.07, 'A', 48.6],
  ['Etamin', 269.152, 51.489, 2.23, 'K', 148],
  ['Almach', 30.975, 42.330, 2.17, 'K', 355],
  ['Denebola', 177.265, 14.572, 2.14, 'A', 36],
  ['Schedar', 10.127, 56.537, 2.24, 'K', 228],

  ['Naos', 120.896, -40.003, 2.25, 'O', 1080],
  ['Caph', 2.295, 59.150, 2.27, 'F', 54.7],
  ['Mintaka', 83.001, -0.299, 2.23, 'O', 1200],
  ['Sadr', 305.557, 40.257, 2.23, 'F', 1800],
  ['Alphecca', 233.672, 26.715, 2.23, 'A', 75],
  ['Ruchbah', 21.454, 60.235, 2.68, 'A', 99],
  ['Muphrid', 208.671, 18.398, 2.68, 'G', 37],
  ['Ankaa', 6.571, -42.306, 2.38, 'K', 77],
  ['Suhail', 136.999, -43.433, 2.21, 'K', 573],
  ['Aspidiske', 139.273, -59.275, 2.25, 'A', 690],

  // More stars to reach 100
  ['Albireo', 292.680, 27.960, 3.08, 'K', 430],
  ['Enif', 326.047, 9.875, 2.39, 'K', 672],
  ['Markab', 346.190, 15.205, 2.49, 'B', 133],
  ['Scheat', 345.944, 28.083, 2.42, 'M', 196],
  ['Nashira', 325.023, -16.662, 3.69, 'F', 139],
  ['Sabik', 257.595, -15.725, 2.43, 'A', 88],
  ['Zubeneschamali', 229.251, -9.383, 2.61, 'B', 185],
  ['Zubenelgenubi', 222.720, -16.042, 2.75, 'A', 77],
  ['Unukalhai', 236.067, 6.426, 2.65, 'K', 73],
  ['Kornephoros', 247.555, 21.490, 2.77, 'G', 139],

  ['Rasalgethi', 258.662, 14.390, 2.81, 'M', 360],
  ['Kochab', 222.677, 74.156, 2.08, 'K', 126],
  ['Pherkad', 230.182, 71.834, 3.00, 'A', 480],
  ['Thuban', 211.097, 64.376, 3.65, 'A', 303],
  ['Alcyone', 56.871, 24.105, 2.87, 'B', 440],
  ['Atlas', 57.291, 24.053, 3.62, 'B', 431],
  ['Electra', 56.219, 24.113, 3.70, 'B', 440],
  ['Maia', 56.457, 24.368, 3.87, 'B', 440],
  ['Merope', 56.581, 23.948, 4.18, 'B', 440],
  ['Taygeta', 56.302, 24.467, 4.30, 'B', 440],

  ['Acamar', 44.565, -40.305, 2.88, 'A', 161],
  ['Izar', 221.246, 27.074, 2.70, 'A', 202],
  ['Sadalmelik', 331.446, -0.320, 2.96, 'G', 520],
  ['Sadalsuud', 322.890, -5.571, 2.91, 'G', 540],
  ['Mirach', 17.433, 35.621, 2.05, 'M', 197],
  ['Alderamin', 319.645, 62.586, 2.51, 'A', 49],
  ['Vindemiatrix', 195.544, 10.959, 2.83, 'G', 109],
  ['Gienah', 183.952, -17.542, 2.59, 'B', 165],
  ['Tureis', 121.886, -24.304, 2.78, 'F', 185],
  ['Alshat', 300.274, 4.883, 3.77, 'B', 290],
];

// Map spectral type to color — enhanced saturation for visual clarity
// Based on real spectral colors but pushed ~30% more saturated for impact
const SPECTRAL_COLORS: Record<string, { color: string; tempLabel: string }> = {
  O: { color: '#6688ff', tempLabel: '30,000+ K' },     // vivid blue
  B: { color: '#7799ff', tempLabel: '10,000–30,000 K' }, // bright blue-white
  A: { color: '#99aaee', tempLabel: '7,500–10,000 K' },  // light blue
  F: { color: '#eeddaa', tempLabel: '6,000–7,500 K' },   // warm white-yellow
  G: { color: '#ffcc55', tempLabel: '5,200–6,000 K' },   // golden yellow
  K: { color: '#ff9933', tempLabel: '3,700–5,200 K' },   // deep orange
  M: { color: '#ff5522', tempLabel: '2,400–3,700 K' },   // red-orange
};

// Convert RA/Dec to 3D cartesian coordinates in our scene
// Uses logarithmic scaling so all stars (8.6 ly to 2600 ly) are
// distributed evenly in the 100-600 unit range
function celestialTo3D(
  ra: number,
  dec: number,
  distance: number,
): THREE.Vector3 {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;

  // Logarithmic distance
  const logMin = Math.log(8);
  const logMax = Math.log(2700);
  const normalized = (Math.log(Math.max(distance, 8)) - logMin) / (logMax - logMin);
  
  // PUSHED OUTWARD TO CLEAR SOLAR SYSTEM:
  // We reserve the 0-350 unit radius massive sphere entirely for our Sun and orbiting Solar System. 
  // Alien stars now start generating right at the boundary (380) and cluster EXTREMELY tightly up to 430.
  const r = 200 + normalized * 50;

  const x = r * Math.cos(decRad) * Math.cos(raRad);
  const y = r * Math.sin(decRad);
  const z = r * Math.cos(decRad) * Math.sin(raRad);

  return new THREE.Vector3(
    Math.round(x * 10000) / 10000,
    Math.round(y * 10000) / 10000,
    Math.round(z * 10000) / 10000
  );
}

// Size based on apparent magnitude (brighter = larger)
function magnitudeToSize(mag: number): number {
  return Math.max(1.5, 6 - mag * 1.5);
}

// Price based on brightness and rarity
function calculatePrice(mag: number, spectralClass: string): number {
  const basePrices: Record<string, number> = {
    O: 999,
    B: 599,
    A: 399,
    F: 299,
    G: 249,
    K: 199,
    M: 149,
  };
  const base = basePrices[spectralClass] || 199;
  const brightnessMultiplier = Math.max(0.5, (3 - mag) / 3);
  return Math.round(base * brightnessMultiplier);
}

export function generateStars(count: number): StarData[] {
  const stars: StarData[] = [];
  const limit = Math.min(count, REAL_STARS.length);

  for (let i = 0; i < limit; i++) {
    const [name, ra, dec, mag, originalSpectral, distance] = REAL_STARS[i];
    
    // Rastgele Astronomik Sınıf Ataması (Bilimsel kilidi kırdığımız yer)
    const BASE_CLASSES = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];
    
    // %24 Egzotik şansı, %76 Normal
    const exoticHash = (i * 31) % 100;
    let spectralClass = '';
    
    if (exoticHash < 8) spectralClass = 'E_PINK';
    else if (exoticHash < 16) spectralClass = 'E_GREEN';
    else if (exoticHash < 24) spectralClass = 'E_PURPLE';
    else {
      // Rastgele normal bir renk sınıfı
      spectralClass = BASE_CLASSES[(i * 13) % BASE_CLASSES.length];
    }
    
    const pos = celestialTo3D(ra, dec, distance);
    const size = magnitudeToSize(mag);

    // Fetch the perfectly synchronized 24-variant palette map and apply the mid-tone to the spatial point cloud.
    const palette = getPaletteForStar(i, spectralClass);
    const starColor = new THREE.Color(palette.mid);

    const price = Math.round(Math.max(50, 1000 - distance * 1.5 - mag * 50));

    stars.push({
      id: i,
      position: pos,
      color: starColor,
      size,
      name,
      price,
      magnitude: mag,
      distance: Math.round(distance),
      temperature: getLabelForClass(spectralClass),
      isOwned: Math.random() > 0.8,
      ownerName: Math.random() > 0.8 ? 'Space Explorer' : undefined,
      spectralClass: spectralClass as any,
    });
  }

  return stars;
}

/**
 * Convert effective temperature (K) to spectral class
 */
function tempToSpectralClass(temp: number): string {
  if (temp >= 30000) return 'O';
  if (temp >= 10000) return 'B';
  if (temp >= 7500) return 'A';
  if (temp >= 6000) return 'F';
  if (temp >= 5200) return 'G';
  if (temp >= 3700) return 'K';
  return 'M';
}

/**
 * Generate StarData objects from real NASA exoplanet host star data.
 * These get IDs starting from 1000 to avoid collision with IAU catalog.
 */
export function generateNasaStars(nasaData: NasaHostStar[]): StarData[] {
  const stars: StarData[] = [];

  for (let i = 0; i < nasaData.length; i++) {
    const host = nasaData[i];
    const id = 1000 + i;

    const spectralClass = tempToSpectralClass(host.temperature);
    const pos = celestialTo3D(host.ra, host.dec, Math.min(host.distanceLy, 2600));

    // Size based on stellar radius (1 solar radius = base size 4)
    const size = Math.max(1.5, Math.min(8, host.radius * 3));

    const palette = getPaletteForStar(id, spectralClass);
    const starColor = new THREE.Color(palette.mid);

    // Price based on number of exoplanets and distance
    const price = Math.round(Math.max(100, 1500 - host.distanceLy * 0.5 + host.exoplanets.length * 200));

    // Temperature label from real data
    const tempLabel = `${Math.round(host.temperature).toLocaleString()} K`;

    stars.push({
      id,
      position: pos,
      color: starColor,
      size,
      name: host.hostname,
      price,
      magnitude: 0, // API doesn't return magnitude directly
      distance: host.distanceLy,
      temperature: tempLabel,
      isOwned: false,
      spectralClass: spectralClass as any,
      // NASA real data fields
      isRealData: true,
      discoveryYear: host.discoveryYear,
      stellarRadius: host.radius,
      stellarMass: host.mass,
      stellarTemp: host.temperature,
      exoplanets: host.exoplanets.map((p) => ({
        name: p.name,
        radiusEarth: p.radiusEarth,
        discoveryYear: p.discoveryYear,
      })),
    });
  }

  return stars;
}
