import { create } from 'zustand';
import type { StarData, BlackHoleData } from '../types';
import { generateStars, generateNasaStars } from '../utils/starGenerator';
import { fetchNasaExoplanets } from '../services/nasaApi';
import * as THREE from 'three';

// Single black hole — Sagittarius A* (the iconic Milky Way supermassive black hole)
const BLACK_HOLES: BlackHoleData[] = [
  {
    id: 8001,
    name: 'Sagittarius A*',
    position: new THREE.Vector3(-200, -60, 450),
    mass: 4000000,
    size: 18,
    description: 'The supermassive black hole at the center of our Milky Way galaxy. 4 million solar masses compressed into a region smaller than Mercury\'s orbit.',
  },
];

interface StarStore {
  stars: StarData[];
  selectedStar: StarData | null;
  hoveredStar: StarData | null;
  focusedStar: StarData | null;
  drawerOpen: boolean;
  purchaseModalOpen: boolean;
  isMoving: boolean;
  isFocusMode: boolean;
  cameraTarget: [number, number, number] | null;
  cameraPosition: [number, number, number];
  nasaDataLoaded: boolean;
  blackHoles: BlackHoleData[];
  dashboardOpen: boolean;
  certStar: StarData | null;

  setStars: (stars: StarData[]) => void;
  selectStar: (star: StarData | null) => void;
  hoverStar: (star: StarData | null) => void;
  focusStar: (star: StarData | null) => void;
  exitFocus: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openPurchaseModal: () => void;
  closePurchaseModal: () => void;
  setIsMoving: (moving: boolean) => void;
  setCameraTarget: (target: [number, number, number] | null) => void;
  setCameraPosition: (pos: [number, number, number]) => void;
  markStarOwned: (starId: number, ownerName: string) => void;
  syncOwnedStars: () => Promise<void>;
  loadNasaData: () => Promise<void>;
  setDashboardOpen: (open: boolean) => void;
  setCertStar: (star: StarData | null) => void;
}

export const useStarStore = create<StarStore>((set, get) => ({
  stars: generateStars(174),
  selectedStar: null,
  hoveredStar: null,
  focusedStar: null,
  drawerOpen: false,
  purchaseModalOpen: false,
  isMoving: false,
  isFocusMode: false,
  cameraTarget: null,
  cameraPosition: [0, 0, 0],
  nasaDataLoaded: false,
  blackHoles: BLACK_HOLES,
  dashboardOpen: false,
  certStar: null,

  setStars: (stars) => set({ stars }),
  selectStar: (star) => set({ selectedStar: star }),
  hoverStar: (star) => set({ hoveredStar: star }),

  focusStar: (star) =>
    set({
      focusedStar: star,
      selectedStar: star,
      isFocusMode: true,
      drawerOpen: true,
    }),

  exitFocus: () =>
    set({
      focusedStar: null,
      isFocusMode: false,
      drawerOpen: false,
      selectedStar: null,
    }),

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, selectedStar: null }),
  openPurchaseModal: () => set({ purchaseModalOpen: true }),
  closePurchaseModal: () => set({ purchaseModalOpen: false }),
  setIsMoving: (moving) => set({ isMoving: moving }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  markStarOwned: (starId, ownerName) =>
    set((state) => ({
      stars: state.stars.map((s) =>
        s.id === starId ? { ...s, isOwned: true, ownerName } : s
      ),
      selectedStar:
        state.selectedStar?.id === starId
          ? { ...state.selectedStar, isOwned: true, ownerName }
          : state.selectedStar,
      focusedStar:
        state.focusedStar?.id === starId
          ? { ...state.focusedStar, isOwned: true, ownerName }
          : state.focusedStar,
    })),
    
  syncOwnedStars: async () => {
    try {
      const { getOwnedStars } = await import('../services/api');
      const owned = await getOwnedStars();
      
      set((state) => ({
        stars: state.stars.map((s) => {
          const matchingOwned = owned.find((o) => o.starCatalogId === s.id);
          if (matchingOwned) {
            return { 
              ...s, 
              isOwned: true, 
              ownerName: matchingOwned.ownerName || 'Space Explorer' 
            };
          }
          return s;
        }),
      }));
    } catch (e) {
      console.warn('[Sync] Failed to sync owned stars:', e);
    }
  },

  loadNasaData: async () => {
    if (get().nasaDataLoaded) return;
    try {
      const nasaData = await fetchNasaExoplanets();
      if (nasaData.length > 0) {
        const nasaStars = generateNasaStars(nasaData);
        set((state) => ({
          stars: [...state.stars, ...nasaStars],
          nasaDataLoaded: true,
        }));
        console.log(`[Store] Merged ${nasaStars.length} NASA stars into catalog`);
      }
    } catch (error) {
      console.warn('[Store] NASA data load failed:', error);
    }
  },
  setDashboardOpen: (open) => set({ dashboardOpen: open }),
  setCertStar: (star) => set({ certStar: star }),
}));

