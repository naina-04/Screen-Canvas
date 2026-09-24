import React from 'react';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  label,
  shortcut,
  isActive = false,
  disabled = false,
  onClick,
  badge,
  className = '',
}) => {
  return (
    <div className={`relative group shrink-0 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 ${
          disabled
            ? 'opacity-30 cursor-not-allowed text-gray-500'
            : isActive
            ? 'bg-blue-600 text-white shadow-glow ring-2 ring-blue-400/60 scale-105'
            : 'text-gray-300 hover:text-white hover:bg-white/12 active:scale-90 hover:scale-105'
        }`}
      >
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            {badge}
          </span>
        )}
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 bg-blue-300 rounded-full shadow-sm" />
        )}
      </button>

      {/* High-res Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
        <div className="w-2 h-1 border-x-4 border-x-transparent border-b-4 border-b-[#14151a]" />
        <div className="bg-[#14151a]/95 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-2xl border border-white/15 whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
          <span className="font-medium text-gray-100">{label}</span>
          {shortcut && (
            <span className="text-[9px] bg-white/15 px-1 py-0.5 rounded text-blue-200 font-mono font-semibold">
              {shortcut}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
