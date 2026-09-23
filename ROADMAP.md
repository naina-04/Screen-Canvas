# ScreenCanvas — Product Roadmap

This document outlines the development roadmap and feature trajectory for **ScreenCanvas**.

---

## 🚀 Phase 1: Core MVP (Completed ✅)

- [x] Electron application architecture with TypeScript.
- [x] High-performance dual-canvas rendering engine (Committed + Scratch layer).
- [x] Transparent full-screen overlay window.
- [x] Dedicated floating toolbar window with drag-to-reposition handle.
- [x] Drawing Mode vs Pass-Through Mode toggle (`Ctrl+Shift+D`).
- [x] Freehand drawing tools: Pen, Highlighter, Marker.
- [x] 9-swatch color palette + custom native color picker with real-time HEX input.
- [x] 8 brush size presets (1px – 32px) and continuous slider.
- [x] Stroke styles: Solid, Dashed, Dotted, Marker.
- [x] Eraser with stroke-collision hit detection.
- [x] Undo (`Ctrl+Z`), Redo (`Ctrl+Y`), and Clear All (`Ctrl+Shift+C`).
- [x] Geometric shape tools: Line, Arrow, Rectangle, Circle.
- [x] Inline text annotations (`T`).
- [x] Transparent PNG export via native Windows save dialog.
- [x] Global keyboard shortcuts with lifecycle cleanup.
- [x] Multi-monitor detection and display switcher.
- [x] Automated unit and integration test suite (15/15 tests passing).
- [x] Production build and Windows packaging configurations.

---

## 🌟 Phase 2: Presentation & Whiteboard Tools (Completed ✅)

- [x] **Spotlight Focus Mode (`F`)**: Darken screen with a soft feathered radial spotlight cutout centered on cursor (adjustable with mouse wheel).
- [x] **Laser Pointer / Disappearing Ink (`K`)**: Fading glowing trail that cleanly dissolves after 1.5 seconds without polluting history.
- [x] **Canvas Backdrops (`B`)**: Quick 1-click toggle between Transparent, Solid Whiteboard, Chalkboard Blackboard, and Dotted Grid paper.
- [ ] **Zoom / Magnifier Tool**: Instant magnification of screen sections for presentations.
- [ ] **Number Stamp Tool**: Sequential click-to-number stamps (①, ②, ③, ④) for step-by-step presentation tutorials.

---

## 💼 Phase 3: Professional Features & Cross-Platform

- [ ] **Drawing Session Persistence**: Save annotations to `.screencanvas` JSON project files to resume presentations later.
- [ ] **macOS Support**: Port overlay click-through configuration to macOS Quartz window server.
- [ ] **Linux (X11 / Wayland) Support**: Wayland layer-shell protocol integration.
- [ ] **Cloud Storage & Quick Share**: Optional one-click export to clipboard or private cloud links.
- [ ] **Custom Global Shortcut Re-binding**: User settings UI to customize hotkey combinations.
