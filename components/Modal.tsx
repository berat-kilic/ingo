import React from 'react';
import { GlassPanel } from './GlassPanel';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  // Dil desteği için başlık çevirisi
  // Modal başlığı genelde t(key) ile gelmeli, sabit metin varsa t(title) ile çevirilebilir
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl relative">
        <GlassPanel className="bg-base shadow-2xl border-white/20">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="text-xl font-display font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          {children}
        </GlassPanel>
      </div>
    </div>
  );
};