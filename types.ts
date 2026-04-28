
export interface BusinessHours {
  type: '24h' | 'standard';
  open?: string; // HH:mm
  close?: string; // HH:mm
  days?: number[]; // 0=Sunday, 1=Monday...
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  category: string;
  image?: string;
  phone?: string;
  hours: BusinessHours;
}

export interface MapState {
  selectedLocation: Location | null;
  isSidebarOpen: boolean;
}
