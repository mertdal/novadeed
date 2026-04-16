const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Token management ──

function getToken(): string | null {
  return localStorage.getItem('starbound_token');
}

export function setToken(token: string) {
  localStorage.setItem('starbound_token', token);
}

export function clearToken() {
  localStorage.removeItem('starbound_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// ── Auth API ──

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Registration failed');
  }

  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Login failed');
  }

  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Google login failed');
  }

  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function getMe(): Promise<UserDto | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(),
  });

  if (!res.ok) return null;
  return res.json();
}

// ── Stars API ──

export interface OwnedStarDto {
  id: number;
  starCatalogId: number;
  name: string;
  customName?: string;
  ownerName: string;
  price: number;
  purchasedAt: string;
}

export async function getOwnedStars(): Promise<OwnedStarDto[]> {
  const res = await fetch(`${API_BASE}/stars/owned`, {
    headers: authHeaders(),
  });

  if (!res.ok) return [];
  return res.json();
}

export async function getAllOwnedStars(): Promise<OwnedStarDto[]> {
  const res = await fetch(`${API_BASE}/stars/all-owned`);
  if (!res.ok) return [];
  return res.json();
}

export async function purchaseStar(data: {
  starCatalogId: number;
  starName: string;
  customName?: string;
  price: number;
}): Promise<OwnedStarDto> {
  const res = await fetch(`${API_BASE}/stars/purchase`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Purchase failed');
  }

  return res.json();
}
