import * as THREE from 'three';

export interface ExoplanetData {
  name: string;
  radiusEarth?: number; // planet radius in Earth radii
  discoveryYear?: number;
}

export interface StarData {
  id: number;
  position: THREE.Vector3;
  color: THREE.Color;
  size: number;
  name: string;
  price: number;
  magnitude: number;
  distance: number; // light years
  temperature: string;
  isOwned: boolean;
  ownerName?: string;
  purchaseDate?: string;
  spectralClass: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M' | 'E_PINK' | 'E_GREEN' | 'E_PURPLE' | 'E_PLANET';
  // NASA real data fields
  isRealData?: boolean;
  discoveryYear?: number;
  stellarRadius?: number; // in solar radii
  stellarMass?: number; // in solar masses
  stellarTemp?: number; // effective temperature in K
  exoplanets?: ExoplanetData[];
}

export interface BlackHoleData {
  id: number;
  name: string;
  position: THREE.Vector3;
  mass: number; // relative scale
  size: number;
  description: string;
}

export interface PurchaseRequest {
  starId: number;
  ownerName: string;
  starName: string;
  email: string;
}

export interface StarResponse {
  id: string;
  starCoordinate: { x: number; y: number; z: number };
  ownerName: string;
  starName: string;
  purchaseDate: string;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}
