
import React, { useEffect, useRef } from 'react';
import { Location } from '../types';
import { INITIAL_MAP_CENTER, INITIAL_ZOOM, COLORS } from '../constants';
import { Locate } from 'lucide-react';

declare const L: any;

interface MapProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
  userLocation: [number, number] | null;
  isSidebarOpen: boolean;
  activeCategory: string;
}

const isLocationOpen = (location: Location) => {
  if (location.hours.type === '24h') return true;
  
  const now = new Date();
  const day = now.getDay();
  const time = now.getHours() * 60 + now.getMinutes();
  
  const [openH, openM] = location.hours.open!.split(':').map(Number);
  const [closeH, closeM] = location.hours.close!.split(':').map(Number);
  
  const openTime = (openH || 0) * 60 + (openM || 0);
  const closeTime = (closeH || 0) * 60 + (closeM || 0);
  
  return location.hours.days?.includes(day) && time >= openTime && time < closeTime;
};

const Map: React.FC<MapProps> = ({ locations, onLocationSelect, selectedLocation, userLocation, isSidebarOpen, activeCategory }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const initialLocateDone = useRef(false);

  // Validação ultra-robusta de coordenadas para evitar erros de LatLng(NaN, NaN)
  const isValidLatLng = (coords: any): coords is [number, number] => {
    if (!coords) return false;
    const lat = Array.isArray(coords) ? coords[0] : coords.lat;
    const lng = Array.isArray(coords) ? coords[1] : coords.lng;
    
    const nLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const nLng = typeof lng === 'string' ? parseFloat(lng) : lng;
    
    return typeof nLat === 'number' && !isNaN(nLat) && 
           typeof nLng === 'number' && !isNaN(nLng) && 
           Math.abs(nLat) <= 90 && Math.abs(nLng) <= 180 &&
           (nLat !== 0 || nLng !== 0);
  };

  const getCategoryConfig = (category: string) => {
    if (category.includes('Referência')) return { color: COLORS.referencia, icon: 'fa-landmark', textColor: '#333' };
    if (category.includes('Apoio')) return { color: COLORS.apoio, icon: 'fa-hands-holding', textColor: '#fff' };
    if (category.includes('Doação')) return { color: COLORS.doacao, icon: 'fa-box-open', textColor: '#fff' };
    return { color: COLORS.all, icon: 'fa-location-dot', textColor: '#fff' };
  };

  const createCustomIcon = (location: Location) => {
    const config = getCategoryConfig(location.category);
    const isOpen = isLocationOpen(location);
    const haloColor = isOpen ? COLORS.open : COLORS.closed;
    
    return L.divIcon({
      className: 'custom-marker-container',
      html: `
        <div class="marker-halo" style="background-color: ${haloColor};"></div>
        <div class="marker-pin" style="background-color: ${config.color}; color: ${config.textColor};">
          <i class="fa-solid ${config.icon}"></i>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });
  };

  useEffect(() => {
    if (!containerRef.current || typeof L === 'undefined') return;

    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB'
    });

    try {
      mapRef.current = L.map(containerRef.current, { 
        zoomControl: false,
        layers: [streetLayer] 
      }).setView(INITIAL_MAP_CENTER, INITIAL_ZOOM);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.locate({ setView: false, enableHighAccuracy: true });
        }
      }, 2000);

      return () => {
        clearTimeout(timer);
        if (mapRef.current) mapRef.current.remove();
      };
    } catch (err) {
      console.error("Erro ao inicializar mapa Leaflet:", err);
    }
  }, []);

  // Efeito para ajustar o mapa quando a sidebar abre/fecha ou local é selecionado
  useEffect(() => {
    if (mapRef.current && typeof L !== 'undefined') {
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize({ animate: true });
        
        if (selectedLocation && isValidLatLng([selectedLocation.lat, selectedLocation.lng])) {
          const sidebarWidth = isSidebarOpen && window.innerWidth > 640 ? 400 : 0;
          mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 17, { 
            duration: 1.2,
            paddingTopLeft: [sidebarWidth, 0]
          });
        }
      }, 400); 
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, selectedLocation]);

  // Atualização de marcadores
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || typeof L === 'undefined') return;

    markersLayerRef.current.clearLayers();
    const validCoords: any[] = [];

    locations.forEach((loc) => {
      if (!isValidLatLng([loc.lat, loc.lng])) return;
      const coords: [number, number] = [loc.lat, loc.lng];
      try {
        const customIcon = createCustomIcon(loc);
        L.marker(coords, { icon: customIcon })
          .addTo(markersLayerRef.current)
          .on('click', (e: any) => {
            L.DomEvent.stopPropagation(e);
            onLocationSelect(loc);
          });
        validCoords.push(coords);
      } catch (e) { console.warn("Erro ao criar marcador:", loc.name); }
    });

    if (validCoords.length > 0 && !selectedLocation) {
        try {
          const bounds = L.latLngBounds(validCoords);
          const sidebarPadding = isSidebarOpen && window.innerWidth > 640 ? 420 : 50;
          mapRef.current.fitBounds(bounds, { 
            paddingBottomRight: [50, 50],
            paddingTopLeft: [sidebarPadding, 50], 
            maxZoom: 16,
            animate: true
          });
        } catch (e) { console.error("Erro fitBounds:", e); }
    }
  }, [locations, activeCategory]);

  // Marcador de Usuário
  useEffect(() => {
    if (!mapRef.current || !isValidLatLng(userLocation) || typeof L === 'undefined') return;

    try {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      } else {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="user-flash"></div>
            <div class="user-pulse-outer"></div>
            <div class="user-pulse-inner"></div>
            <div class="user-dot-main"><i class="fa-solid fa-person-walking text-[10px] text-white"></i></div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        userMarkerRef.current = L.marker(userLocation, { icon: userIcon, zIndexOffset: 2000 }).addTo(mapRef.current);
        
        if (!initialLocateDone.current) {
          const sidebarWidth = isSidebarOpen && window.innerWidth > 640 ? 400 : 0;
          mapRef.current.flyTo(userLocation, 16, { 
            duration: 2,
            paddingTopLeft: [sidebarWidth, 0]
          });
          initialLocateDone.current = true;
        }
      }
    } catch (e) { console.error("Erro no marcador de usuário:", e); }
  }, [userLocation]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {/* Legend Desktop */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-gray-100 hidden sm:block">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#333]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14] animate-pulse"></div>
            Aberto
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff0000] shadow-[0_0_8px_#ff0000]"></div>
            Fechado
          </div>
        </div>
      </div>

      {/* Geolocate Button */}
      <div className="absolute bottom-24 right-3 z-[1000]">
        <button 
          onClick={() => {
            if (isValidLatLng(userLocation)) {
              const sidebarWidth = isSidebarOpen && window.innerWidth > 640 ? 400 : 0;
              mapRef.current.flyTo(userLocation, 16, { paddingTopLeft: [sidebarWidth, 0] });
            } else {
              mapRef.current.locate({ setView: true, maxZoom: 16 });
            }
          }}
          className="bg-white w-[48px] h-[48px] flex items-center justify-center rounded-2xl shadow-xl border border-gray-100 text-[#333] hover:bg-gray-50 transition-all active:scale-90"
        >
          <Locate size={24} />
        </button>
      </div>
      <style>{`
        .custom-marker-container { position: relative; }
        .marker-halo {
          width: 52px; height: 52px; border-radius: 50%;
          position: absolute; left: 50%; top: 50%; margin: -32px 0 0 -26px;
          opacity: 0.5; filter: blur(6px); transition: all 0.3s;
          animation: haloPulse 2.5s infinite ease-in-out;
        }
        @keyframes haloPulse {
          0%, 100% { transform: scale(0.85); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        .marker-pin {
          width: 38px; height: 38px; border-radius: 50% 50% 50% 0;
          position: absolute; transform: rotate(-45deg);
          left: 50%; top: 50%; margin: -19px 0 0 -19px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.2s;
          border: 2px solid white; z-index: 2;
        }
        .marker-pin i { transform: rotate(45deg); font-size: 16px; }
        .user-dot-main { width: 18px; height: 18px; background: #3b82f6; border: 2px solid white; border-radius: 50%; z-index: 10; position: relative; display: flex; align-items: center; justify-content: center; }
        .user-flash {
          width: 100px; height: 100px; background: rgba(59, 130, 246, 0.4);
          border-radius: 50%; position: absolute; left: 50%; top: 50%; margin: -50px 0 0 -50px;
          animation: flashEffect 1.2s cubic-bezier(0.4, 0, 0.2, 1) 2;
          pointer-events: none; opacity: 0;
        }
        @keyframes flashEffect {
          0%, 100% { opacity: 0; transform: scale(0.4); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default Map;
