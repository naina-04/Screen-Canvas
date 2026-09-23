import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  desc: string;
}

const GLOBAL_SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'Shift', 'D'], desc: 'Toggle Drawing Mode / Pass-Through Click' },
  { keys: ['Ctrl', 'Shift', 'A'], desc: 'Toggle Overlay Visibility (Hide / Show)' },
  { keys: ['Ctrl', 'Shift', 'C'], desc: 'Clear All Annotations' },
];

const TOOL_SHORTCUTS: ShortcutItem[] = [
  { keys: ['V'], desc: 'Select / Interact Tool (Neutral Desktop Mode)' },
  { keys: ['P'], desc: 'Pen (Freehand Drawing) / Toggle to Neutral' },
  { keys: ['K'], desc: 'Laser Pointer (Disappearing Ink Trail)' },
  { keys: ['F'], desc: 'Spotlight Focus Mode (Dark Backdrop Cutout)' },
  { keys: ['B'], desc: 'Cycle Backdrop (Transparent, Whiteboard, Blackboard, Grid)' },
  { keys: ['H'], desc: 'Highlighter (Semi-transparent strokes)' },
  { keys: ['M'], desc: 'Marker (Chisel bold strokes)' },
  { keys: ['E'], desc: 'Eraser (Stroke removal on contact)' },
  { keys: ['L'], desc: 'Straight Line' },
  { keys: ['A'], desc: 'Arrow with Proportional Head' },
  { keys: ['R'], desc: 'Rectangle (Hold Shift for Square)' },
  { keys: ['C'], desc: 'Circle / Ellipse (Hold Shift for 1:1 Circle)' },
  { keys: ['T'], desc: 'Text Annotation (Click to type notes)' },
];

const EDIT_SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'Z'], desc: 'Undo stroke / shape' },
  { keys: ['Ctrl', 'Y'], desc: 'Redo previously undone stroke' },
  { keys: ['Ctrl', 'C'], desc: 'Copy drawing snapshot to clipboard' },
  { keys: ['['], desc: 'Decrease brush stroke width' },
  { keys: [']'], desc: 'Increase brush stroke width' },
  { keys: ['Scroll'], desc: 'Resize Spotlight circle radius' },
  { keys: ['Escape'], desc: 'Cancel in-flight preview / Return to Select mode' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#1e1e24]/95 border border-white/15 rounded-2xl shadow-2xl p-6 text-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-gray-400">Quick keys for maximum speed during presentations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-xs">
          <div>
            <h3 className="font-semibold text-gray-300 uppercase tracking-wider mb-2 text-[10px]">
              Global Hotkeys (Always Active)
            </h3>
            <div className="space-y-1.5">
              {GLOBAL_SHORTCUTS.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/5">
                  <span className="text-gray-300">{item.desc}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, i) => (
                      <kbd key={i} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/20 font-mono text-[11px] text-blue-300">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 uppercase tracking-wider mb-2 text-[10px]">
              Drawing & Presentation Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {TOOL_SHORTCUTS.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/5">
                  <span className="text-gray-300 truncate pr-2">{item.desc}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/20 font-mono text-[11px] text-amber-300 flex-shrink-0">
                    {item.keys[0]}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 uppercase tracking-wider mb-2 text-[10px]">
              Canvas, Editing & Gestures
            </h3>
            <div className="space-y-1.5">
              {EDIT_SHORTCUTS.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/5">
                  <span className="text-gray-300">{item.desc}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, i) => (
                      <kbd key={i} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/20 font-mono text-[11px] text-emerald-300">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
