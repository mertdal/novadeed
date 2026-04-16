export const SPECTRAL_PALETTES = [
  // Deep Blue (O type) - 0,1,2
  { hot: '#e6ffff', mid: '#66b3ff', cool: '#0044cc' },
  { hot: '#ccffff', mid: '#4d94ff', cool: '#003399' },
  { hot: '#b3e6ff', mid: '#3377ff', cool: '#002266' },
  // Light Blue (B type) - 3,4,5
  { hot: '#e6f0ff', mid: '#80bfff', cool: '#0066cc' },
  { hot: '#cce0ff', mid: '#66a3ff', cool: '#0055b3' },
  { hot: '#b3ccff', mid: '#4d88ff', cool: '#004499' },
  // White/Blue-White (A type) - 6,7,8
  { hot: '#f2f8ff', mid: '#b3d1ff', cool: '#336699' },
  { hot: '#e6f2ff', mid: '#99c2ff', cool: '#225580' },
  { hot: '#d9ecff', mid: '#80b3ff', cool: '#114466' },
  // Yellow/White (F type) - 9,10,11
  { hot: '#ffffe6', mid: '#ffcc66', cool: '#b37700' },
  { hot: '#ffffcc', mid: '#ffbf4d', cool: '#996600' },
  { hot: '#ffffb3', mid: '#ffb333', cool: '#805500' },
  // Yellow (G type) - 12,13,14
  { hot: '#fff2cc', mid: '#ffaa00', cool: '#cc5500' },
  { hot: '#ffe6b3', mid: '#ff9900', cool: '#b34400' },
  { hot: '#ffd999', mid: '#ff8800', cool: '#993300' },
  // Orange (K type) - 15,16,17
  { hot: '#ffcc99', mid: '#ff6600', cool: '#992200' },
  { hot: '#ffbb80', mid: '#e65c00', cool: '#801a00' },
  { hot: '#ffaa66', mid: '#cc5200', cool: '#661100' },
  // Red Dwarf (M type) - 18,19,20
  { hot: '#ff9999', mid: '#cc0000', cool: '#4d0000' },
  { hot: '#ff8080', mid: '#b30000', cool: '#330000' },
  { hot: '#ff6666', mid: '#990000', cool: '#1a0000' },
  // Exotics (Rare colors) - 21, 22, 23
  { hot: '#ffe6f2', mid: '#ff3399', cool: '#660033' }, // Pink WR
  { hot: '#e6ffe6', mid: '#33cc33', cool: '#004d00' }, // Green Nebula
  { hot: '#f2e6ff', mid: '#9933ff', cool: '#330066' }, // Purple
];

export const getPaletteForStar = (starId: number, spectralClass: string) => {
  let baseIndex = 0;
  if (spectralClass === 'O') baseIndex = 0;
  else if (spectralClass === 'B') baseIndex = 3;
  else if (spectralClass === 'A') baseIndex = 6;
  else if (spectralClass === 'F') baseIndex = 9;
  else if (spectralClass === 'G') baseIndex = 12;
  else if (spectralClass === 'K') baseIndex = 15;
  else if (spectralClass === 'M') baseIndex = 18;
  else if (spectralClass === 'E_PINK') return SPECTRAL_PALETTES[21];
  else if (spectralClass === 'E_GREEN') return SPECTRAL_PALETTES[22];
  else if (spectralClass === 'E_PURPLE') return SPECTRAL_PALETTES[23];

  const variation = (starId * 7) % 3;
  return SPECTRAL_PALETTES[baseIndex + variation];
};

export const getLabelForClass = (spectralClass: string) => {
  const map: Record<string, string> = {
    'O': 'Blue Giant · 30,000+ K',
    'B': 'Blue-White · 10,000–30,000 K',
    'A': 'White Star · 7,500–10,000 K',
    'F': 'Yellow-White · 6,000–7,500 K',
    'G': 'Yellow Dwarf · 5,200–6,000 K',
    'K': 'Orange Dwarf · 3,700–5,200 K',
    'M': 'Red Dwarf · 2,400–3,700 K',
    'E_PINK': 'Wolf-Rayet · Exotic Temp',
    'E_GREEN': 'Emerald Nebula · Unknown K',
    'E_PURPLE': 'Deep Matter Star · Exotic',
    'E_PLANET': '[ SOLAR SYSTEM BODY ]'
  };
  return map[spectralClass] || 'Unknown Origin';
};
