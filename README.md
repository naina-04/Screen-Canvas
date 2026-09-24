# ScreenCanvas

> Professional, lightweight desktop screen annotation and presentation tool built with Electron, React, and TypeScript.

---

## ✨ Features

- 🖊️ **Precision Pen & Highlighting**: Freehand drawing with solid, dashed, and dotted stroke styles.
- 🔄 **One-Click Pen Unselect & Desktop Mode**: Instantly unselect the pen (`Esc` or `V`) to switch to other applications.
- 🎯 **Smart Focus Tracking**: Automatically suspends drawing and restores the normal system cursor when you switch apps.
- 📜 **Scrollable Toolbar with Smart Navigation**: Horizontal mouse wheel scrolling, chevron controls, and segmented category tabs (`All`, `Draw`, `Styles`, `Present`, `Actions`).
- 🔔 **Windows System Tray & Daemon**: Sits quietly next to the Windows clock with quick right-click actions.
- 🌟 **Presentation Spotlight (`F`)**: Darken screen with a radial spotlight centered on your cursor.
- ⚡ **Laser Pointer (`K`)**: Disappearing glowing ink that cleanly dissolves after 1.5 seconds.
- 📐 **Vector Shapes**: Rectangles, circles, lines, and directional arrows.
- 📝 **Sequential Number Stamps (`N`)**: Drop numbered badges (`①`, `②`, `③`) with auto-incrementing counters for step-by-step guides.
- 🔄 **Session Auto-Recovery**: Automatically saves and restores drawing sessions between app launches.
- 💾 **Transparent PNG & Screenshot Export**: One-click screen capture with annotations.

---

## ⌨️ Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Esc` / `V`** | Unselect Pen / Desktop Click-Through Mode |
| **`P`** | Toggle Pen Tool |
| **`H`** | Highlighter |
| **`M`** | Marker Brush |
| **`E`** | Eraser |
| **`N`** | Numbered Step Badge Stamp (`①`, `②`, `③`...) |
| **`F`** | Spotlight Focus Mode |
| **`K`** | Laser Pointer (Disappearing Ink) |
| **`B`** | Cycle Canvas Backdrops (Whiteboard, Blackboard, Grid) |
| **`1`–`9`** | Instant Numeric Tool Select |
| **`←` / `→`** | Cycle Previous / Next Drawing Tool |
| **`Ctrl+Shift+D`** | Toggle Drawing vs Desktop Mode |
| **`Ctrl+Z` / `Ctrl+Y`** | Undo / Redo |
| **`Ctrl+C`** | Copy Drawing Snapshot to Clipboard |
| **`Ctrl+Q`** | Exit ScreenCanvas |

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run locally in development
npm run dev

# Run test suite
npm test

# Typecheck
npm run typecheck

# Build production bundle
npm run build
```
