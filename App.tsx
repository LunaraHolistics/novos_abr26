
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Location, MapState } from './types';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import CampaignModal from './components/CampaignModal';
import { LOCATIONS_DATA } from './constants';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [state, setState] = useState<MapState>({
    selectedLocation: null,
    isSidebarOpen: true,
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (typeof latitude === 'number' && !isNaN(latitude) && 
              typeof longitude === 'number' && !isNaN(longitude)) {
            setUserLocation([latitude, longitude]);
          }
        },
        (error) => {
          console.warn("Geolocalização indisponível:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const filteredLocations = useMemo(() => {
    if (activeCategory === 'all') return LOCATIONS_DATA;
    return LOCATIONS_DATA.filter(loc => loc.category === activeCategory);
  }, [activeCategory]);

  const handleLocationSelect = useCallback((location: Location) => {
    setState({
      selectedLocation: location,
      isSidebarOpen: true,
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isSidebarOpen: false }));
  }, []);

  const openSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isSidebarOpen: true }));
  }, []);

  const toggleSidebarManually = () => {
    setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  };

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category);
    setState(prev => ({ 
      ...prev, 
      selectedLocation: null, 
      isSidebarOpen: true 
    }));
  };

  const handleClearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedLocation: null }));
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden font-sans bg-[#f9f7f2]">
      {/* Header Fixo */}
      <header className="bg-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm z-[1400] border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-inner border border-gray-50 p-1">
            <img src="favicon.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-xl font-black text-[#333] leading-none tracking-tighter uppercase">NOVOS CAMINHOS</h1>
            <p className="text-[8px] sm:text-[10px] font-bold text-[#6b665e] italic leading-tight uppercase tracking-widest">Araraquara/SP • Rede de Apoio</p>
          </div>
        </div>
        
        <div className="flex sm:hidden">
           <button 
            onClick={toggleSidebarManually}
            className={`p-2 rounded-xl transition-all border ${state.isSidebarOpen ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-[#333] border-gray-100'}`}
          >
            {state.isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Área do Conteúdo */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* MAPA: Fundo fixo, nunca treme */}
        <div className="absolute inset-0 z-0">
          <Map 
            locations={filteredLocations}
            onLocationSelect={handleLocationSelect} 
            selectedLocation={state.selectedLocation}
            userLocation={userLocation}
            isSidebarOpen={state.isSidebarOpen}
            activeCategory={activeCategory}
          />
        </div>

        {/* SIDEBAR OVERLAY (MOBILE) / SIDEBAR LATERAL (DESKTOP) */}
        <div 
          className={`
            fixed left-0 right-0 z-[1300] transition-transform duration-500 ease-in-out
            sm:relative sm:z-20 sm:h-full sm:translate-y-0 sm:w-[400px] sm:flex sm:shrink-0
            ${state.isSidebarOpen 
              ? 'bottom-0 h-[60vh] translate-y-0' 
              : 'bottom-0 h-[60vh] translate-y-[calc(100%-65px)]'}
          `}
        >
          {/* CONTEÚDO DA SIDEBAR */}
          <div className="w-full h-full bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:shadow-2xl overflow-hidden flex flex-col border-t sm:border-t-0 sm:border-l border-gray-100 sm:rounded-none rounded-t-[32px]">
              <Sidebar 
                location={state.selectedLocation} 
                isOpen={state.isSidebarOpen} 
                onClose={closeSidebar} 
                onOpen={openSidebar}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryFilter}
                filteredLocations={filteredLocations}
                onSelectFromList={handleLocationSelect}
                onClearSelection={handleClearSelection}
                userLocation={userLocation}
                onOpenCampaign={() => setIsCampaignOpen(true)}
              />
          </div>
        </div>
      </div>

      <CampaignModal 
        isOpen={isCampaignOpen} 
        onClose={() => setIsCampaignOpen(false)} 
      />
    </div>
  );
};

export default App;
