# 🎨 ScreenCanvas

<div align="center">

**A professional, ultra-low-latency desktop screen drawing, annotation, and presentation application.**

Built with **Electron**, **React 18**, and **TypeScript**, powered by a high-performance **Dual-Canvas Rendering Engine**.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-95%20passed%20%7C%2027%20suites-success.svg)]()
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

[Features](#-key-features) • [Installation](#-installation--getting-started) • [Shortcuts](#-complete-keyboard-shortcuts-reference) • [Architecture](#-architecture--design) • [Toolbar Navigation](#-scrollable-toolbar--smart-navigation) • [Roadmap](#-roadmap)

</div>

---

## 🌟 Overview

**ScreenCanvas** turns your entire desktop into a fluid, interactive digital canvas. Whether you are delivering live presentations, teaching online classes, recording software tutorials, conducting design critiques, or streaming code, ScreenCanvas gives you precision drawing tools directly on top of any active application without disrupting your workflow.

---

## ✨ Key Features

### 📑 Multi-Page Presentation Slide Decks (`PageUp` / `PageDown`)
- **Independent Canvas Slides**: Manage multi-page presentation decks (`Slide 1 / 3`, `Slide 2 / 3`...) in the same session without erasing earlier work.
- **Quick-Flip Navigation**: Jump forward with **`PageDown`** or `▶`, and backtrack with **`PageUp`** or `◀` to address audience questions seamlessly.
- **Dedicated Per-Slide History**: Each slide maintains its own isolated strokes, shapes, and undo/redo stacks.
- **Floating On-Screen Slide Toast**: An elegant glassmorphic indicator (`📄 Slide 2 of 3`) appears in the top-right corner whenever slides are switched.
- **Instant Slide Creation**: Click `+ Slide` on the toolbar to append a fresh board in less than a millisecond.

### 🖊️ Precision Freehand Drawing & Smoothing
- **Multiple Brush Modes**: Freehand Pen (`P`), semi-transparent Highlighter (`H`), and chisel Marker (`M`).
- **Stroke Styles**: Choose between **Solid**, **Dashed**, and **Dotted** stroke patterns with customizable spacing.
- **Catmull-Rom & Chaikin Mathematical Smoothing**: Real-time curve interpolation prevents jagged lines, producing silky-smooth freehand penmanship even when drawing quickly with a mouse.
- **Dynamic Width & Color**: 8 instant brush size presets (1px to 32px), continuous slider, 9-swatch designer palette, and native Windows color picker with real-time HEX code input.

### 🔄 Instant Pen Unselection & Desktop Click-Through Mode
- **Zero-Friction App Switching**: Press `Esc` or `V`, or click the active tool to instantly unselect the pen. ScreenCanvas immediately returns to **Pass-Through Mode**, allowing you to click, scroll, and type in underlying applications without closing your drawings.
- **Smart Focus Tracking**: When you switch windows or open another app, ScreenCanvas automatically suspends drawing clicks and restores the native Windows mouse cursor.

### 📝 Sequential Numbered Step Badges (`N`)
- **Step-by-Step Documentation**: Drop auto-incrementing numbered callout badges (`①`, `②`, `③`...) with a single click.
- **Live Preview Cursor**: Displays a semi-transparent preview badge with drop shadow under your mouse cursor before stamping.
- **Counter Reset**: Right-click the Number Stamp button in the toolbar at any time to reset the counter back to `1`.

### 🌟 Presentation & Live Demonstration Suite
- **Spotlight Focus Mode (`F`)**: Darkens your entire display with an adjustable radial cutout spotlight centered on your mouse cursor to direct audience attention. Use the **Mouse Wheel** to dynamically expand or shrink the spotlight radius.
- **Laser Pointer / Disappearing Ink (`K`)**: Produces a glowing neon trail that cleanly dissolves after 1.5 seconds—ideal for pointing without leaving permanent ink on the screen.
- **Canvas Backdrops (`B`)**: Instantly toggle between **Transparent Overlay**, **Solid Whiteboard**, **Chalkboard Blackboard**, and **Dotted Grid Paper** with a single keystroke.

### 📐 Geometric Vector Shapes & Inline Text
- **Precision Shapes**: Draw straight Lines (`L`), Directional Arrows (`A`), Rectangles (`R`), and Circles / Ellipses (`C`). Hold `Shift` for strict 1:1 aspect ratios (perfect squares and circles).
- **Translucent Shape Fills**: Toggle semi-transparent color fills for rectangles and ellipses to highlight screen areas.
- **Inline Text Annotations (`T`)**: Click anywhere to type notes, labels, and explanations with crisp font rendering.

### 📜 Scrollable Toolbar & Category Navigation
- **Horizontal Mouse-Wheel Scrolling**: Effortlessly scroll across all tools on compact displays or smaller screen resolutions.
- **Interactive Chevron Buttons**: Left (`◀`) and right (`▶`) buttons appear when content overflows, providing smooth animated scrolling.
- **Segmented Category Filter Tabs**:
  - `All`: View the entire suite of tools and settings.
  - `Draw`: Access Pen, Highlighter, Marker, Eraser, Shapes, Text, and Number Stamps.
  - `Styles`: Configure stroke widths, stroke styles (solid/dashed/dotted), and color palettes.
  - `Present`: Quick access to Spotlight, Laser Pointer, and Canvas Backdrops.
  - `Actions`: Undo, Redo, Clear Screen, Copy, and Save dialogs.

### 🔔 Windows System Tray & Daemon Operation
- **Quiet Background Running**: Sits unobtrusively in the Windows notification area next to the clock.
- **Right-Click Tray Menu**:
  - 👁️ **Show / Hide Toolbar**: Toggle toolbar visibility without affecting drawings.
  - 🎨 **Toggle Drawing Mode (`Ctrl+Shift+D`)**: Switch between drawing and desktop interaction.
  - 🧹 **Clear Screen (`Ctrl+Shift+C`)**: Instantly clear all active annotations.
  - 🚪 **Exit ScreenCanvas**: Cleanly close all windows and release system resources.

### 🔄 Session Auto-Recovery & Instant Snapshots
- **Automatic Session Recovery**: Committed drawings are automatically persisted into local storage and seamlessly restored when ScreenCanvas relaunches.
- **Manual Snapshot Hotkey (`Ctrl+S`)**: Instantly save a snapshot of the current canvas with an on-screen confirmation toast.
- **Project Serialization**: Save and load complete `.screencanvas` JSON project files to resume complex presentation decks later.

### 💾 Export & Clipboard Sharing
- **Transparent PNG Export**: Export annotations as a high-resolution PNG with a transparent or backdrop background via the native Windows save dialog.
- **One-Click Clipboard Copy (`Ctrl+C`)**: Copy a snapshot of your drawing to the clipboard to paste directly into Slack, Discord, Teams, or documentation.
- **Vector SVG Export**: Clean vector XML output for high-res publishing.

### 🖥️ Multi-Monitor Detection & Display Switching
- Automatically identifies all active monitors with native resolutions and coordinates.
- Switch the active drawing canvas between displays with a single click from the toolbar display switcher.

---

## ⌨️ Complete Keyboard Shortcuts Reference

### 🌐 Global & Mode Switching
| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Esc` / `V`** | **Desktop Mode / Unselect Pen** | Immediately unselect active pen and pass clicks through to other apps |
| **`Ctrl + Shift + D`** | **Toggle Drawing Mode** | Flip between full drawing overlay and desktop click-through |
| **`Ctrl + Shift + A`** | **Toggle Overlay Visibility** | Temporarily hide or show all annotations |
| **`Ctrl + Shift + C`** | **Clear Screen** | Wipe all drawings from the canvas |
| **`Ctrl + Q`** | **Quit Application** | Safely terminate ScreenCanvas |

### 🎨 Drawing & Annotation Tools
| Shortcut | Tool | Description |
| :--- | :--- | :--- |
| **`P`** | **Pen** | Freehand precision drawing (press again to unselect) |
| **`H`** | **Highlighter** | Semi-transparent yellow/color highlighter strokes |
| **`M`** | **Marker** | Chisel-tip bold marker brush |
| **`E`** | **Eraser** | Contact-based stroke erasure |
| **`N`** | **Number Stamp** | Sequential callout badge stamp (`①`, `②`, `③`...) |
| **`L`** | **Line** | Straight geometric line |
| **`A`** | **Arrow** | Directional arrow with proportional head |
| **`R`** | **Rectangle** | Rectangle vector shape (hold `Shift` for square) |
| **`C`** | **Circle** | Ellipse vector shape (hold `Shift` for circle) |
| **`T`** | **Text** | Inline typography and note label |

### 🌟 Presentation & Canvas Backdrops
| Shortcut | Tool | Description |
| :--- | :--- | :--- |
| **`PageDown`** | **Next Slide** | Advance to next canvas slide in presentation deck |
| **`PageUp`** | **Previous Slide** | Return to previous canvas slide in presentation deck |
| **`F`** | **Spotlight Focus** | Darken screen with radial spotlight cutout around mouse |
| **`K`** | **Laser Pointer** | Disappearing ink trail that dissolves after 1.5s |
| **`B`** | **Cycle Backdrops** | Transparent → Whiteboard → Blackboard → Grid |
| **`Mouse Wheel`** | **Spotlight Size** | Expand or contract spotlight aperture diameter |

### ⚡ History, Editing & Tool Selection
| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Ctrl + Z`** | **Undo** | Revert the last drawn stroke or shape |
| **`Ctrl + Y`** | **Redo** | Restore the previously undone stroke |
| **`Ctrl + C`** | **Copy Snapshot** | Copy the canvas rendering directly to clipboard |
| **`Ctrl + S`** | **Save Snapshot** | Save canvas state snapshot to local storage |
| **`[` / `]`** | **Brush Size** | Decrease / Increase brush stroke width |
| **`1` – `9`** | **Quick Select** | Switch directly to tools 1 through 9 |
| **`←` / `→`** | **Cycle Tools** | Select previous or next drawing tool |

---

## 🏗️ Architecture & Design

ScreenCanvas is built around a decoupled multi-window Electron architecture:

```
                          ┌─────────────────────────────┐
                          │   Electron Main Process     │
                          │   (Tray, IPC, Display Mgr)  │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │ IPC (ContextBridge)                           │ IPC (ContextBridge)
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Overlay Window (Full)  │                   │    Toolbar Window (Pill)  │
   │ ┌───────────────────────┐ │                   │ ┌───────────────────────┐ │
   │ │  Committed Canvas     │ │                   │ │ Category Tabs (Filter)│ │
   │ │  (Persistent History) │ │                   │ ├───────────────────────┤ │
   │ ├───────────────────────┤ │                   │ │ Horizontal Scroller   │ │
   │ │  Scratchpad Canvas    │ │                   │ ├───────────────────────┤ │
   │ │  (Active In-Flight)   │ │                   │ │ Tool Buttons & Popovers││
   │ └───────────────────────┘ │                   │ └───────────────────────┘ │
   └───────────────────────────┘                   └───────────────────────────┘
```

1. **Dual-Canvas Rendering Pipeline**:
   - **Committed Layer**: Contains all completed strokes and shapes. Only redraws during undo/redo or element removal, ensuring steady 60+ FPS performance.
   - **Scratch Layer**: Handles active mouse-drag drawing, shape previews, laser pointer trails, and sequential stamp hovering without dirtying the committed canvas.
2. **Mutual Window Lifecycle Management**:
   - The Overlay and Toolbar communicate through secure, strongly-typed Electron IPC channels (`window.electronAPI`).
   - If either window is closed, the main process cleanly shuts down background workers, unregisters global shortcuts, and tears down the tray icon to prevent orphaned processes.
3. **Session Persistence Engine**:
   - Serializes drawing vector objects, text, and active drawing settings with JSON validation and corrupted-state recovery.

---

## 📁 Project Directory Structure

```
desktop-writer/
├── src/
│   ├── main/                          # Electron main process
│   │   ├── index.ts                   # App entry, window creation, IPC handlers
│   │   ├── trayManager.ts             # Windows system tray daemon & context menu
│   │   ├── displayManager.ts          # Multi-display detection & geometry
│   │   └── shortcuts.ts               # Global OS-level keyboard shortcut hooks
│   ├── preload/                       # Context bridge & secure API exposed to renderers
│   │   └── index.ts                   # window.electronAPI definitions
│   ├── renderer/                      # React frontend
│   │   ├── overlay/                   # Full-screen transparent drawing canvas
│   │   │   ├── OverlayApp.tsx         # Drawing coordinator, hotkey listener
│   │   │   └── components/            # Spotlight, backdrop, and text overlay components
│   │   ├── toolbar/                   # Floating draggable pill toolbar
│   │   │   ├── ToolbarApp.tsx         # Scrollable container, category tabs, actions
│   │   │   └── components/            # ColorPicker, BrushSizePicker, ShortcutsModal
│   │   └── drawing/                   # Dual-canvas core component
│   │       └── DualCanvas.tsx         # Mouse/touch event processing & preview cursor
│   └── shared/                        # Shared utilities, math, and types
│       ├── types/index.ts             # TypeScript interfaces for strokes, shapes, settings
│       ├── constants/defaults.ts      # Default colors, sizes, and tools
│       └── utils/
│           ├── renderEngine.ts        # Canvas 2D rendering methods (shapes, stamps, laser)
│           ├── sessionPersistence.ts  # Auto-save & session recovery engine
│           ├── splineEngine.ts        # Catmull-Rom smoothing algorithms
│           └── exportEngine.ts        # PNG, SVG, and clipboard export utilities
├── tests/                             # Automated test suite (88 tests passing)
│   ├── unit/                          # Unit tests for geometry, stamps, tray, storage
│   └── integration/                   # IPC communication tests
├── ARCHITECTURE.md                    # Deep architectural documentation
├── CHANGELOG.md                       # Version changelog
├── ROADMAP.md                         # Development roadmap
└── package.json                       # Scripts, dependencies, and metadata
```

---

## 🚀 Installation & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **OS**: Windows 10 / 11 (fully supported), macOS & Linux (experimental)

### 1. Clone the Repository
```bash
git clone https://github.com/naina-04/Screen-Canvas.git
cd Screen-Canvas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
npm run dev
```
*Launches Vite dev server with Hot Module Replacement (HMR) for both the overlay and toolbar windows.*

### 4. Run Automated Tests
```bash
# Run all 26 test suites (88 unit & integration tests)
npm test

# Run tests in watch mode during development
npm run test:watch
```

### 5. Check Types & Build Production Bundle
```bash
# Verify TypeScript without emitting files
npm run typecheck

# Build optimized production bundle
npm run build
```

### 6. Package for Windows
```bash
npm run package
```
*Generates a standalone Windows installer (`.exe`) and portable binary in the `release/` directory.*

---

## 🗺️ Roadmap

- [x] High-performance dual-canvas rendering architecture.
- [x] Full freehand suite (Pen, Highlighter, Marker, Eraser).
- [x] Geometric shapes (Line, Arrow, Rectangle, Circle, Text).
- [x] Presentation Spotlight (`F`) & Disappearing Laser Pointer (`K`).
- [x] Canvas Backdrops (Whiteboard, Blackboard, Grid).
- [x] Sequential Number Stamps (`N`) with live cursor preview.
- [x] Windows System Tray Daemon with right-click context menu.
- [x] Scrollable toolbar with category filtering tabs (`All`, `Draw`, `Styles`, `Present`, `Actions`).
- [x] Automatic session recovery & manual snapshots (`Ctrl+S`).
- [ ] **Zoom / Magnifier Tool (`Z`)**: Circular loupe (2x–4x zoom) for high-DPI demonstrations.
- [ ] **Auto-Fade Vanishing Pen Mode**: Automatically dissolves regular pen ink after 5–10 seconds.
- [ ] **Multi-Monitor Quick-Hop Hotkey**: Leap between monitors with a keyboard shortcut.
- [ ] **Cloud Storage & One-Click Sharing**: Direct upload to cloud providers with instant links.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/naina-04/Screen-Canvas/issues) or submit a Pull Request.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">
Made with ❤️ by the ScreenCanvas Team
</div>
