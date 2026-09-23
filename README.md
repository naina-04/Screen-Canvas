# ScreenCanvas 🎨
> **Professional Desktop Screen Drawing & Annotation Application for Windows**

ScreenCanvas is a high-performance desktop screen annotation application that allows presenters, educators, developers, and creators to draw freely anywhere on their screen on top of any active application. Inspired by Epic Pen and ZoomIt, ScreenCanvas features a transparent overlay and a floating dark-mode pill toolbar with seamless switching between drawing and pass-through interaction modes.

---

## ✨ Features

- 🖥️ **Desktop Screen Overlay**: Borderless, transparent, always-on-top overlay spanning your monitor.
- ⚡ **Zero-Lag Pass-Through Mode (`Ctrl+Shift+D`)**: Toggle instantly between drawing on the screen and interacting with underlying desktop windows, browsers, or slides without closing your annotations.
- 🖌️ **Comprehensive Toolset**:
  - **Pen**: Smooth freehand strokes with quadratic Bezier curve interpolation.
  - **Highlighter**: Realistic semi-transparent highlighting (`multiply` composite).
  - **Marker**: Bold, chisel-styled high-visibility strokes.
  - **Shapes**: Straight lines, directional arrows with proportional heads, rectangles, and ellipses/circles.
  - **Text Annotations**: Click anywhere to type notes directly on screen.
  - **Object & Stroke Eraser**: Intuitive stroke-level removal on contact.
- 🎨 **Rich Color & Size Controls**:
  - Presets (Red, Orange, Yellow, Green, Blue, Purple, Pink, White, Black).
  - Custom color picker with real-time HEX input.
  - 8 brush size presets (1px to 32px) plus fine-grained slider.
  - Brush styles: Solid, Dashed, Dotted, and Marker.
- 🔄 **Reliable History Engine**: Infinite, memory-conscious vector undo (`Ctrl+Z`) and redo (`Ctrl+Y`), plus one-click Clear All (`Ctrl+Shift+C`).
- 📷 **Export & Screenshot**:
  - Export drawings as clean, transparent PNG files.
  - Full-screen capture composited with your annotations.
- 🖥️ **Multi-Monitor Ready**: Built-in monitor switcher supporting negative coordinates and high-DPI display scaling.
- 🔒 **Zero Cloud / No Account Required**: Completely local, private, and secure.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Ctrl + Shift + D` | Toggle Drawing Mode / Pass-Through Mode | **Global** |
| `Ctrl + Shift + A` | Toggle Overlay Visibility (Hide / Show) | **Global** |
| `Ctrl + Shift + C` | Clear All Annotations | **Global** |
| `P` | Select Freehand Pen | App |
| `H` | Select Highlighter | App |
| `M` | Select Marker | App |
| `E` | Select Eraser | App |
| `L` | Select Line Tool | App |
| `A` | Select Arrow Tool | App |
| `R` | Select Rectangle Tool | App |
| `C` | Select Circle Tool | App |
| `T` | Select Text Tool | App |
| `Ctrl + Z` | Undo | App |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo | App |
| `]` / `[` | Increase / Decrease Brush Size | App |
| `Escape` | Dismiss Popovers / Reset active tool | App |

---

## 🏗️ Architecture Overview

ScreenCanvas utilizes a **Two-Window Architecture** to avoid Windows OS mouse-event hit-testing glitches:
1. **Overlay Window (`overlayWindow`)**: Frameless, transparent, always-on-top window covering the screen canvas. Uses `setIgnoreMouseEvents(true, { forward: true })` in Pass-Through mode to forward clicks directly to underlying applications.
2. **Floating Toolbar Window (`toolbarWindow`)**: Movable dark-glassmorphism pill window that remains accessible and interactive at all times, even when pass-through is active.

```
       +-----------------------+
       |   Electron Main       |
       +-----------+-----------+
                   |
       +-----------+-----------+
       |                       |
+------v-------+        +------v--------+
| Overlay Win  |        | Toolbar Win   |
| (Transparent |        | (Floating Pill|
|  Dual-Canvas)|        |  Controls)    |
+--------------+        +---------------+
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Operating System**: Windows 10/11 (Architecture is cross-platform ready for macOS and Linux)

### Installation
```bash
git clone <repository-url>
cd "desktop writer"
npm install
```

### Running Locally (Development)
```bash
# Starts Vite dev server and launches Electron with live reload
npm run dev
```

### Running Tests
```bash
# Run unit and integration tests (Vitest)
npm run test

# Type checking
npm run typecheck
```

### Building for Production
```bash
# Compile React Vite frontend and TypeScript Electron backend
npm run build

# Package Windows application (portable and unpacked directory)
npm run package
```

The packaged binaries will be output into the `release/` directory.

---

## 🛡️ Security Best Practices

ScreenCanvas follows Electron security guidelines:
- `contextIsolation: true` is strictly enforced.
- `nodeIntegration: false` in all renderer web preferences.
- A minimal, strictly-typed ContextBridge preload API prevents unrestricted system access.
- Validated IPC message schemas.
- No remote code execution or remote CDNs.

---

## 📋 Troubleshooting & FAQ

**Q: Clicks aren't reaching my browser or IDE when drawing is finished?**
> A: Press `Ctrl+Shift+D` or click the mode button in the toolbar to switch to **Pass-thru** mode. In pass-through mode, your drawings remain visible while your mouse interacts directly with underlying desktop windows.

**Q: Can I move the toolbar?**
> A: Yes! Drag the grip icon on the left edge of the floating toolbar to reposition it anywhere across any connected monitor.

**Q: How does multi-monitor support work?**
> A: Click the Monitor icon on the toolbar to select any connected display. The overlay automatically resizes and maps to the selected display's physical bounds and DPI scale.

---

## 📄 License
MIT License. Created by the ScreenCanvas Team.
