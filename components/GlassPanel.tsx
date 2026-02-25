import React from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', hoverEffect = false, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`
        bg-card/80 backdrop-blur-xl border border-white/10 rounded-[28px] p-6
        ${hoverEffect ? 'hover:border-white/20 hover:bg-card/90 transition-all' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};