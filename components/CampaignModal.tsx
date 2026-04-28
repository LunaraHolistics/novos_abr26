
import React from 'react';
import { X, Download } from 'lucide-react';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    // Tenta baixar as duas imagens com um pequeno intervalo para evitar bloqueio do navegador
    handleDownload('folder1.jpg', 'informativo_novos_caminhos_p1.jpg');
    setTimeout(() => {
      handleDownload('folder2.jpg', 'informativo_novos_caminhos_p2.jpg');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <h3 className="font-black text-[#333] uppercase tracking-tight text-sm">Folder Informativo</h3>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Como Ajudar - veja o Folder</p>
            </div>
            <button 
              onClick={handleDownloadAll}
              className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
              title="Baixar Folder Completo"
            >
              <Download size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 custom-scrollbar">
          <div className="flex flex-col gap-6 items-center">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full max-w-full group/img relative">
              <img 
                src="folder1.jpg" 
                alt="Folder Campanha - Página 1" 
                className="w-full h-auto rounded-xl object-contain block mx-auto"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x1200?text=Folder+Página+1';
                }}
              />
              <button 
                onClick={() => handleDownload('folder1.jpg', 'pagina_1.jpg')}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl opacity-0 group-hover/img:opacity-100 transition-opacity text-blue-600 hover:bg-white"
                title="Baixar esta página"
              >
                <Download size={20} />
              </button>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full max-w-full group/img relative">
              <img 
                src="folder2.jpg" 
                alt="Folder Campanha - Página 2" 
                className="w-full h-auto rounded-xl object-contain block mx-auto"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x1200?text=Folder+Página+2';
                }}
              />
              <button 
                onClick={() => handleDownload('folder2.jpg', 'pagina_2.jpg')}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl opacity-0 group-hover/img:opacity-100 transition-opacity text-blue-600 hover:bg-white"
                title="Baixar esta página"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-100 border-t flex flex-col items-center gap-2 shrink-0">
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Informativo - Programa Novos Caminhos</p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CampaignModal;
