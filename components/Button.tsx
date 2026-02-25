import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  isLoading = false,
  className = '',
  disabled,
  ...props 
}) => {
  const { t } = useLanguage();
  const baseStyles = "relative font-display font-bold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_0_15px_rgba(0,123,255,0.4)] hover:shadow-[0_0_25px_rgba(0,123,255,0.6)] hover:bg-blue-600 border border-blue-400/20",
    secondary: "bg-card text-white hover:bg-slate-700/50 border border-white/10 hover:border-white/20",
    danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:shadow-[0_0_15px_rgba(255,77,77,0.3)]",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isLoading ? t('pending') : children}
    </button>
  );
};
