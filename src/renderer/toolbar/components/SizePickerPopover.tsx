import React from 'react';
import { BRUSH_SIZES } from '../../../shared/constants/defaults';
import { BrushStyle } from '../../../shared/types';

interface SizePickerPopoverProps {
  currentSize: number;
  currentStyle: BrushStyle;
  onChangeSize: (size: number) => void;
  onChangeStyle: (style: BrushStyle) => void;
  onClose: () => void;
}

export const SizePickerPopover: React.FC<SizePickerPopoverProps> = ({
  currentSize,
  currentStyle,
  onChangeSize,
  onChangeStyle,
  onClose,
}) => {
  const styles: { id: BrushStyle; label: string }[] = [
    { id: 'solid', label: 'Solid' },
    { id: 'dashed', label: 'Dashed' },
    { id: 'dotted', label: 'Dotted' },
    { id: 'marker', label: 'Marker' },
  ];

  return (
    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 p-3 bg-[#18191d] border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-3 min-w-[220px]">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 px-1">
        <span>Size & Style</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xs px-1">
          ✕
        </button>
      </div>

      {/* Preset sizes */}
      <div className="flex items-center justify-between gap-1 px-1">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onChangeSize(size)}
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
              currentSize === size
                ? 'bg-blue-600 text-white font-bold'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="flex items-center gap-2 px-1">
        <input
          type="range"
          min="1"
          max="50"
          value={currentSize}
          onChange={(e) => onChangeSize(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
        />
        <span className="text-xs font-mono text-gray-300 w-8 text-right">{currentSize}px</span>
      </div>

      {/* Brush Styles */}
      <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-gray-400 px-1">Stroke Style</span>
        <div className="grid grid-cols-2 gap-1.5">
          {styles.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onChangeStyle(id)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                currentStyle === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
