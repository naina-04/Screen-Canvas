# ScreenCanvas — Testing Guide & Verification Checklist

This document details the test strategy, automated test suites, and manual verification procedures for **ScreenCanvas**.

---

## 1. Automated Test Suite

ScreenCanvas uses [Vitest](https://vitest.dev) for fast unit and integration testing.

### Running Automated Tests
```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Covered Test Suites

#### 1. Geometry Utilities (`tests/unit/geometry.test.ts`)
- `distance`: Euclidean distance between points.
- `distToSegment`: Shortest perpendicular and projection distance from a point to a 2D line segment.
- `isPointNearPath`: Polyline collision detection for stroke-based erasing.
- `isPointInRect`: Collision testing for rectangle outline borders and filled interiors.
- `calculateArrowhead`: Geometric computation of directional arrowhead triangles.

#### 2. History & Undo/Redo Engine (`tests/unit/history.test.ts`)
- Initial state verification (empty stacks, undo/redo disabled).
- Adding elements to undo stack.
- Multi-step undo and redo cycles.
- Redo stack truncation when new elements are added after an undo.
- Object-level erasing and restoration via undo.
- Clear all and restore.

#### 3. Integration & State Sync (`tests/integration/ipc.test.ts`)
- Verification of default application state and settings schema.
- Global and local keyboard shortcut bindings.
- History state synchronization between overlay and toolbar.
- Settings immutability and partial update merging.

---

## 2. Manual Verification Checklist

Follow this checklist to verify production-readiness on a Windows environment:

### A. Window Launch & Styling
- [ ] Launch application via `npm run dev` or packaged `.exe`.
- [ ] Confirm the transparent overlay window renders across the primary monitor.
- [ ] Confirm the floating toolbar pill is visible near the top of the screen with dark glassmorphism.
- [ ] Drag the toolbar using the left grip icon. Confirm smooth movement and repositioning.

### B. Freehand Drawing Tools
- [ ] **Pen Tool (`P`)**: Draw smooth curved lines. Confirm quadratic Bezier smoothing eliminates jitter.
- [ ] **Highlighter Tool (`H`)**: Draw over existing lines or underlying text. Confirm strokes have semi-transparency and do not obscure content.
- [ ] **Marker Tool (`M`)**: Confirm bold, high-opacity strokes.
- [ ] **Brush Styles**: Switch between Solid, Dashed, Dotted, and Marker styles. Confirm line dash patterns appear correctly.
- [ ] **Brush Sizes**: Test sizes 1px, 2px, 4px, 6px, 10px, 16px, 24px, 32px and custom slider.

### C. Geometric Shapes & Text
- [ ] **Line Tool (`L`)**: Drag to draw a straight line. Confirm live preview renders on the scratch canvas before mouse release.
- [ ] **Arrow Tool (`A`)**: Drag to draw an arrow. Confirm arrowhead points in direction of drag with preview.
- [ ] **Rectangle Tool (`R`)**: Drag to draw a rectangle. Confirm outline mode.
- [ ] **Circle Tool (`C`)**: Drag to draw an ellipse/circle.
- [ ] **Text Tool (`T`)**: Click anywhere on the overlay. Type an annotation in the floating textarea and press Enter. Confirm text commits crisply to the canvas.

### D. Eraser & History
- [ ] **Eraser Tool (`E`)**: Confirm the custom circular eraser cursor appears. Drag across existing strokes to erase them.
- [ ] **Undo (`Ctrl+Z`)**: Click Undo button or press shortcut. Confirm previous stroke is undone.
- [ ] **Redo (`Ctrl+Y`)**: Click Redo button or press shortcut. Confirm undone stroke is restored.
- [ ] **Clear All (`Ctrl+Shift+C`)**: Click Clear All button. Confirm all annotations disappear and Undo restores them.

### E. Pass-Through & Overlay Visibility
- [ ] **Pass-Through Mode (`Ctrl+Shift+D`)**:
  - Click the mode button or press shortcut.
  - Badge switches to "Pass-thru" (green).
  - Click on background desktop icons, links in a browser, or text in a code editor.
  - Confirm clicks pass directly through to background applications while your drawings stay visible on screen!
  - Click on the toolbar buttons: confirm toolbar is 100% interactive.
- [ ] **Toggle Overlay (`Ctrl+Shift+A`)**:
  - Click the Eye icon. Confirm annotations are temporarily hidden.
  - Click Eye icon again. Confirm annotations reappear without loss of state.

### F. Export & Capture
- [ ] **Export PNG**: Click the Download icon. Select a save destination in the native Windows file dialog. Confirm clean transparent PNG is written to disk.
- [ ] **Full Screen Capture**: Click the Camera icon. Confirm screen capture dialog opens and saves composite image.

---

## 3. Known Limitations & Edge Cases

1. **Direct3D / Fullscreen Exclusive Games**: Windows hardware overlays may not render on top of exclusive full-screen DirectX/Vulkan games (standard behavior across all Electron screen drawing applications; borderless windowed mode is recommended).
2. **Elevated (Admin) Windows**: On Windows, when interacting with an elevated (Run as Administrator) application, Windows UIPI (User Interface Privilege Isolation) requires ScreenCanvas to also run as Administrator to intercept or pass through clicks over those specific windows.
