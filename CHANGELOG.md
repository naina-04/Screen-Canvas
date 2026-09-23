# Changelog

All notable changes to the ScreenCanvas project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-23

### Added
- **Select / Interact Mode (`V`, `S`)**:
  - Dedicated neutral tool with native desktop click-through (`setIgnoreMouseEvents(true, { forward: true })`).
  - Toggle-to-deselect state machine: clicking an active tool toggles immediately to neutral select mode.
  - Automatic focus management (`blur()`) ensuring underlying applications receive mouse events seamlessly.
- **Presentation Suite**:
  - **Laser Pointer / Disappearing Ink (`K`)**: 60 FPS glowing trail that automatically fades out after 1.5 seconds without polluting persistent history.
  - **Spotlight Focus Mode (`F`)**: Screen dimming with radial feathered cutout centered on cursor; dynamically resizable via mouse scroll wheel.
  - **Canvas Backdrops (`B`)**: Single-click cycling between Transparent, Solid Whiteboard (`#fcfdfd`), Deep Blackboard (`#18191d`), and Dotted Grid paper.
- **Precision Shape Snapping**:
  - Hold `Shift` while dragging to constrain Rectangles and Circles to 1:1 aspect ratio.
  - Hold `Shift` while drawing Lines or Arrows to snap angles to the nearest 45° increment.
- **Direct Clipboard Integration**:
  - Native image copying (`Ctrl + C` or Toolbar Button) capturing complete composite vector drawings and backdrops.
- **Interactive Shortcuts Guide**:
  - Dedicated help modal (`?` / Help button) displaying categorized hotkeys.
- **Presentation Palettes**:
  - Palette category switcher in ColorPickerPopover with Classic, Neon, and Pastel swatches.
- **Escape Key Gesture Cancellation**:
  - Cancels in-flight shape previews and dismisses prompt modals without corrupting history.
- **Quality Assurance**:
  - Comprehensive unit test suite covering tool state machine, snap engine, export utilities, and stamp rendering (41 passing tests).
  - GitHub Actions CI workflow for continuous validation.

---

## [1.0.0] - 2026-09-22

### Added
- Initial release of ScreenCanvas desktop application.
- Dual-canvas architecture with committed and scratch rendering layers.
- Freehand Pen, Highlighter, and Marker with Bezier smoothing.
- Geometric shapes (Line, Arrow, Rectangle, Circle) and inline text annotations.
- Eraser tool with stroke-level detection.
- Unlimited undo/redo history engine.
- Floating draggable frosted-glass toolbar.
- Multi-monitor display selection.
