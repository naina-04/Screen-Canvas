import React, { useState, useEffect } from 'react';
import { DisplayInfo } from '../../../shared/types';
import { Monitor } from 'lucide-react';

interface DisplaySelectorProps {
  onClose: () => void;
}

export const DisplaySelector: React.FC<DisplaySelectorProps> = ({ onClose }) => {
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (window.electronAPI?.getDisplays) {
      window.electronAPI.getDisplays().then((list) => {
        setDisplays(list);
        const primary = list.find((d) => d.isPrimary) || list[0];
        if (primary) setSelectedId(primary.id);
      });
    }
  }, []);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    if (window.electronAPI?.setDisplay) {
      window.electronAPI.setDisplay(id);
    }
    onClose();
  };

  return (
    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 p-3 bg-[#18191d] border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-2 min-w-[240px]">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 px-1">
        <span>Select Display</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xs px-1">
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-1">
        {displays.map((disp) => (
          <button
            key={disp.id}
            onClick={() => handleSelect(disp.id)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
              selectedId === disp.id
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4 shrink-0" />
            <div className="flex flex-col">
              <span>{disp.name}</span>
              <span className="text-[10px] opacity-75">
                Scale: {Math.round(disp.scaleFactor * 100)}% ({disp.bounds.width}×{disp.bounds.height})
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
