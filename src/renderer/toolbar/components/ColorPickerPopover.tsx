import React, { useState } from 'react';
import { DEFAULT_COLORS } from '../../../shared/constants/defaults';
import { Pipette } from 'lucide-react';

interface ColorPickerPopoverProps {
  currentColor: string;
  onChangeColor: (color: string) => void;
  onClose: () => void;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  currentColor,
  onChangeColor,
  onClose,
}) => {
  const [customHex, setCustomHex] = useState(currentColor);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChangeColor(val);
    }
  };

  return (
    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 p-3 bg-[#18191d] border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-2.5 min-w-[210px]">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 px-1">
        <span>Color Palette</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xs px-1"
        >
          ✕
        </button>
      </div>

      {/* Grid of presets */}
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              onChangeColor(c);
              setCustomHex(c);
            }}
            className={`w-7 h-7 rounded-full transition-transform border ${
              currentColor.toLowerCase() === c.toLowerCase()
                ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#18191d]'
                : 'hover:scale-105 border-white/20'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}

        {/* Native color picker */}
        <label className="relative w-7 h-7 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:scale-105 bg-gradient-to-tr from-pink-500 via-green-400 to-blue-500">
          <Pipette className="w-3.5 h-3.5 text-white drop-shadow" />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => {
              onChangeColor(e.target.value);
              setCustomHex(e.target.value);
            }}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>

      {/* Hex input */}
      <div className="flex items-center gap-2 mt-1 px-1">
        <span className="text-xs text-gray-400 font-mono">HEX</span>
        <input
          type="text"
          value={customHex}
          onChange={handleHexChange}
          placeholder="#ff0000"
          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono w-24 outline-none focus:border-blue-500"
        />
        <div
          className="w-5 h-5 rounded border border-white/20 ml-auto"
          style={{ backgroundColor: currentColor }}
        />
      </div>
    </div>
  );
};
