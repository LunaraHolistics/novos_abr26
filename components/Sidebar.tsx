
import React, { useEffect, useState, useMemo } from 'react';
import { Location } from '../types';
import { 
  X, Navigation, Compass, Globe, ArrowLeft, List, 
  ChevronRight, Phone, Clock, ChevronUp, ChevronDown, 
  BookOpen, AlertTriangle, LifeBuoy, Siren 
} from 'lucide-react';
import { COLORS } from '../constants';

declare const L: any;

interface SidebarProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  filteredLocations: Location[];
  onSelectFromList: (loc: Location) => void;
  onClearSelection: () => void;
  userLocation: [number, number] | null;
  onOpenCampaign: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  location, 
  isOpen, 
  onClose, 
  onOpen,
  activeCategory,
  onCategoryChange,
  filteredLocations,
  onSelectFromList,
  onClearSelection,
  userLocation,
  onOpenCampaign
}) => {
  const [activeView, setActiveView] = useState<'filters' | 'detail'>('filters');

  useEffect(() => {
    // Switching view based on selection: if location exists, show detail; otherwise, show list/filters
    setActiveView(location ? 'detail' : 'filters');
  }, [location]);

  const statusInfo = useMemo(() => {
    if (!location) return null;
    
    if (location.hours.type === '24h') {
      return { isOpen: true, text: 'Aberto agora - Atendimento 24h' };
    }

    const now = new Date();
    const day = now.getDay();
    const time = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = (location.hours.open || "00:00").split(':').map(Number);
    const [closeH, closeM] = (location.hours.close || "00:00").split(':').map(Number);
    
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    
    const isOpenNow = location.hours.days?.includes(day) && time >= openTime && time < closeTime;
    
    if (isOpenNow) {
      return { isOpen: true, text: `Aberto agora - Fecha às ${location.hours.close}h` };
    } else {
      const isToday = location.hours.days?.includes(day);
      const willOpenLater = isToday && time < openTime;
      return { 
        isOpen: false, 
        text: willOpenLater 
          ? `Fechado agora - Abre hoje às ${location.hours.open}h` 
          : `Fechado agora - Abre às ${location.hours.open}h (Seg-Sex)` 
      };
    }
  }, [location]);

  const distanceText = useMemo(() => {
    if (!location || !userLocation || typeof L === 'undefined') return null;
    
    const lat1 = userLocation[0];
    const lng1 = userLocation[1];
    const lat2 = location.lat;
    const lng2 = location.lng;

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return null;

    try {
      const user = L.latLng(lat1, lng1);
      const target = L.latLng(lat2, lng2);
      const d = user.distanceTo(target);
      return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(2)} km`;
    } catch (e) { return null; }
  }, [location, userLocation]);

  const getCategoryConfig = (cat: string) => {
    if (cat.includes('Referência')) return { color: COLORS.referencia, icon: 'fa-landmark', textColor: '#333' };
    if (cat.includes('Apoio')) return { color: COLORS.apoio, icon: 'fa-hands-holding', textColor: '#fff' };
    if (cat.includes('Doação')) return { color: COLORS.doacao, icon: 'fa-box-open', textColor: '#fff' };
    return { color: COLORS.all, icon: 'fa-location-dot', textColor: '#fff' };
  };

  const categories = [
    { id: 'Serviços de Referência', label: 'Referência', color: COLORS.referencia },
    { id: 'Apoio e Parcerias', label: 'Apoio', color: COLORS.apoio },
    { id: 'Pontos de Doação', label: 'Doação', color: COLORS.doacao }
  ];

  const groupedLocations = useMemo(() => {
    const groups: Record<string, Location[]> = {};
    filteredLocations.forEach(loc => {
      if (!groups[loc.category]) groups[loc.category] = [];
      groups[loc.category].push(loc);
    });
    return groups;
  }, [filteredLocations]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* ALÇA MOBILE: Improved UX for sliding panel */}
      <div 
        onClick={() => isOpen ? onClose() : onOpen()}
        className="sm:hidden absolute top-0 left-0 right-0 h-16 flex flex-col items-center justify-center cursor-pointer active:bg-gray-50 transition-colors z-20"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mb-2"></div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">{isOpen ? 'Recolher' : 'Abrir Painel'}</span>
           {isOpen ? <ChevronDown size={14} className="text-blue-600" /> : <ChevronUp size={14} className="text-blue-600" />}
        </div>
      </div>

      {/* Header Fixo: X button always on top right as requested */}
      <div className="p-5 pt-16 sm:pt-5 border-b flex items-center justify-between bg-white shrink-0 relative">
        <div className="flex items-center gap-3">
          {activeView === 'detail' ? (
            <button onClick={onClearSelection} className="p-2 hover:bg-gray-100 rounded-full transition-all" title="Voltar para a lista">
              <ArrowLeft size={20} className="text-[#333]" />
            </button>
          ) : (
            <div className="p-2 bg-blue-50 rounded-xl">
              <List size={20} className="text-blue-600" />
            </div>
          )}
          <h2 className="font-black text-[#333] uppercase tracking-tight text-sm">
            {activeView === 'detail' ? 'Detalhes do Local' : 'Lista de Locais'}
          </h2>
        </div>
        
        {/* Botão de fechar (X) sempre no topo direito da barra. 
            Em 'detail', ele volta para a lista. Em 'filters', ele fecha a sidebar. */}
        <button 
          onClick={activeView === 'detail' ? onClearSelection : onClose}
          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all shadow-sm"
          title={activeView === 'detail' ? "Voltar para a lista" : "Fechar painel"}
        >
          <X size={20} />
        </button>
      </div>

      {/* Conteúdo com Scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="pb-24">
          {activeView === 'filters' ? (
            <div className="p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button 
                onClick={onOpenCampaign}
                className="w-full mb-6 flex items-center justify-center gap-3 p-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 active:scale-95 transition-all shadow-lg font-black text-[11px] uppercase tracking-widest border-b-4 border-orange-700"
              >
                <BookOpen size={18} />
                📖 Como Ajudar a Rede
              </button>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2">
                  <LifeBuoy size={14} className="text-red-500" />
                  <p className="text-[10px] font-black text-[#333] uppercase tracking-widest">Canais de Ajuda</p>
                </div>
                
                <a href="tel:16997823770" 
                   className="w-full flex items-center justify-center gap-3 p-4 bg-yellow-400 text-[#333] rounded-2xl shadow-md font-black text-[11px] uppercase tracking-widest border-b-4 border-yellow-600 animate-pulse">
                  <Phone size={18} /> Abordagem Social SEAS (24h): 99782-3770
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a href="tel:192" className="flex items-center justify-center gap-2 p-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow border-b-4 border-red-800">
                    <Siren size={16} /> SAMU 192
                  </a>
                  <a href="tel:153" className="flex items-center justify-center gap-2 p-3 bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow border-b-4 border-blue-900">
                    <Siren size={16} /> GCM - Guarda Civil Municipal 153
                  </a>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded-3xl">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertTriangle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Atenção</span>
                  </div>
                  <ul className="text-[10px] font-bold text-red-800 space-y-1">
                    <li>• Verifique risco imediato à vida antes de acionar.</li>
                    <li>• Nunca ofereça remédios por conta própria.</li>
                  </ul>
                </div>
              </div>

              {/* Seção de Filtros no topo da lista */}
              <div className="mb-8">
                <p className="text-[10px] font-black text-[#333] uppercase tracking-widest mb-4">Filtrar por Categoria</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onCategoryChange('all')}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                      activeCategory === 'all' ? 'bg-[#333] text-white border-[#333]' : 'bg-white text-[#333] border-gray-100 shadow-sm'
                    }`}
                  >
                    Ver Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onCategoryChange(cat.id)}
                      className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                        activeCategory === cat.id ? 'shadow-xl scale-[1.02] border-white' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: cat.color,
                        color: cat.id.includes('Referência') ? '#333' : '#fff'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista Principal de Locais */}
              <div className="space-y-6">
                {Object.entries(groupedLocations).map(([category, locs]) => (
                  <div key={category} className="space-y-3">
                    <p className="text-[9px] font-black text-[#333] uppercase tracking-wider border-l-4 pl-3" style={{ borderColor: getCategoryConfig(category).color }}>{category}</p>
                    <div className="grid gap-3">
                      {locs.map(loc => (
                        <button key={loc.id} onClick={() => onSelectFromList(loc)} className="w-full text-left p-4 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex items-start gap-4 active:scale-95 group">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: getCategoryConfig(loc.category).color, color: getCategoryConfig(loc.category).textColor }}>
                            <i className={`fa-solid ${getCategoryConfig(loc.category).icon} text-sm`}></i>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="font-black text-[#333] text-xs truncate uppercase tracking-tight">{loc.name}</h4>
                            <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 tracking-wide">{loc.category}</p>
                          </div>
                          <ChevronRight size={18} className="text-gray-300 mt-2 group-hover:text-blue-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : location && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-400">
              <div className="h-48 sm:h-56 relative overflow-hidden shrink-0">
                <img src={location.image} className="w-full h-full object-cover" alt={location.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                      style={{ backgroundColor: getCategoryConfig(location.category).color, color: getCategoryConfig(location.category).textColor }}>
                  <i className={`fa-solid ${getCategoryConfig(location.category).icon}`}></i>
                  {location.category}
                </span>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-black text-[#333] mb-4 leading-none uppercase tracking-tighter">{location.name}</h3>

                <div className={`mb-4 p-4 rounded-3xl flex flex-col gap-1 border-l-[6px] shadow-sm ${statusInfo?.isOpen ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span className="text-[11px] font-black uppercase tracking-tight">{statusInfo?.text}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-2xl mb-6 border border-blue-100">
                  <Compass size={18} />
                  <span className="text-xs font-black uppercase tracking-tight">📍 Distância: {distanceText || 'Calculando...'}</span>
                </div>

                <p className="text-[#333] text-xs leading-relaxed font-semibold mb-8 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                  {location.description}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {location.phone && (
                    <a href={`tel:${location.phone.replace(/\D/g,'')}`}
                       className="flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-2xl shadow-lg font-black text-[11px] uppercase tracking-widest">
                      <Phone size={18} /> Ligar para o Local
                    </a>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`} target="_blank" rel="noreferrer"
                       className="flex items-center justify-center gap-3 p-4 bg-[#4285F4] text-white rounded-2xl shadow-lg font-black text-[11px] uppercase tracking-widest">
                      <Navigation size={18} /> Google Maps
                    </a>
                    <a href={`https://waze.com/ul?ll=${location.lat},${location.lng}&navigate=yes`} target="_blank" rel="noreferrer"
                       className="flex items-center justify-center gap-3 p-4 bg-[#33ccff] text-white rounded-2xl shadow-lg font-black text-[11px] uppercase tracking-widest">
                      <Globe size={18} /> Waze
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Fixo */}
      <div className="p-4 bg-gray-50 border-t text-center shrink-0">
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Programa Novos Caminhos Araraquara</p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Sidebar;