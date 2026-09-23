import React from 'react';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge?: React.ReactNode;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  label,
  shortcut,
  isActive = false,
  disabled = false,
  onClick,
  badge,
}) => {
  return (
    <div className="relative group">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
          disabled
            ? 'opacity-30 cursor-not-allowed text-gray-500'
            : isActive
            ? 'bg-blue-600 text-white shadow-glow ring-2 ring-blue-400/50 scale-105'
            : 'text-gray-300 hover:text-white hover:bg-white/10 active:scale-95'
        }`}
      >
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            {badge}
          </span>
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
        <div className="bg-[#121316] text-white text-xs px-2.5 py-1 rounded-md shadow-xl border border-white/10 whitespace-nowrap flex items-center gap-1.5">
          <span className="font-medium">{label}</span>
          {shortcut && (
            <span className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-gray-300 font-mono">
              {shortcut}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
