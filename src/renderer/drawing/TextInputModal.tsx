import React, { useState, useEffect, useRef } from 'react';
import { Point } from '../../shared/types';

interface TextInputModalProps {
  point: Point;
  color: string;
  fontSize: number;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  point,
  color,
  fontSize,
  onCommit,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onCommit(text);
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${point.x}px`,
        top: `${point.y}px`,
      }}
    >
      <div className="bg-[#18191d]/90 p-2 rounded-lg shadow-xl border border-white/20 backdrop-blur-md">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (text.trim()) onCommit(text);
            else onCancel();
          }}
          placeholder="Type annotation (Enter to commit, Esc to cancel)..."
          rows={2}
          style={{
            color,
            fontSize: `${fontSize}px`,
            lineHeight: 1.25,
          }}
          className="bg-transparent border-none outline-none resize-none font-sans min-w-[200px] min-h-[40px] text-white placeholder-gray-400"
        />
        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 border-t border-white/10 pt-1">
          <span>Enter: Save</span>
          <span>Shift+Enter: New line</span>
          <span>Esc: Cancel</span>
        </div>
      </div>
    </div>
  );
};
