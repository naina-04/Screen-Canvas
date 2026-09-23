# ScreenCanvas Presentation & Live Annotation Guide

This guide covers advanced workflows and best practices for presenters, educators, technical speakers, and live streamers using **ScreenCanvas**.

---

## 1. Interaction Modes: Drawing vs Desktop Click-Through

ScreenCanvas separates canvas interaction into two seamless modes:

### Neutral Select Mode (`V` or `S`)
- **Behavior**: Keeps all your screen annotations visible on screen while forwarding all mouse clicks directly to underlying desktop applications (PowerPoint, Keynote, VS Code, Chrome).
- **Toggle**: Click any active drawing tool again or press `V` / `Escape` to return to Select mode instantly.
- **Under the Hood**: Uses Electron OS-level mouse event forwarding (`setIgnoreMouseEvents(true, { forward: true })`) and window defocusing.

### Drawing Mode (`Ctrl + Shift + D` or Tool Selection)
- **Behavior**: Intercepts pointer events to draw strokes, place shapes, highlight content, or write text directly on top of your screen.
- **Fast Resumption**: Selecting any drawing tool (e.g. `P` for Pen) automatically activates drawing mode.

---

## 2. Presentation Tools Suite

### Laser Pointer / Disappearing Ink (`K`)
- **Use Case**: Pointing out code lines, slide bullet points, or diagram elements during webinars without cluttering the screen or having to erase manually.
- **How It Works**:
  - Dragging creates a glowing trail with an animated bloom head at 60 FPS.
  - Points automatically fade out over **1.5 seconds**.
  - Does **not** add items to undo/redo history, keeping your persistent notes clean.

### Spotlight Focus Mode (`F`)
- **Use Case**: Dims the entire screen to 75% dark opacity while cutting out a radial feathered spotlight around your cursor.
- **Adjusting Spotlight Size**:
  - Scroll **Mouse Wheel Up** to expand the spotlight circle radius.
  - Scroll **Mouse Wheel Down** to contract the spotlight circle radius.
- **Deactivation**: Press `F` again or press `Escape` / `V` to return to standard view.

### Canvas Backdrops (`B`)
When you need blank sketch space during a presentation:
- **Transparent (Default)**: Annotate directly over your active desktop windows.
- **Solid Whiteboard**: Crisp clean slate (`#fcfdfd`) for high-contrast diagrams.
- **Dark Blackboard**: Matte chalkboard theme (`#18191d`) easy on the eyes.
- **Dotted Grid Paper**: Professional 24px dot grid pattern for technical sketches and flowcharts.
- **Cycle Shortcut**: Press `B` to cycle through all 4 backdrop styles instantly.

---

## 3. Precision Shape Snapping (Shift Key)

When drawing geometric shapes:
- **Square / 1:1 Aspect Ratio**: Hold `Shift` while dragging with the **Rectangle** tool.
- **Perfect Circle**: Hold `Shift` while dragging with the **Circle** tool.
- **Angle Snapping**: Hold `Shift` while drawing with the **Line** or **Arrow** tool to snap to exact 45° increments (0°, 45°, 90°, 135°, 180°).
- **Cancel In-Flight Drawing**: Press `Escape` while dragging to discard the shape without committing it to history.

---

## 4. Exporting & Sharing

| Action | Shortcut / Trigger | Description |
| :--- | :--- | :--- |
| **Copy Drawing to Clipboard** | `Ctrl + C` | Copies a high-res PNG snapshot of all annotations and backdrops directly into your OS clipboard for instant pasting into Slack, Notion, or Discord. |
| **Export Annotations (PNG)** | Toolbar Download Icon | Saves a transparent or backdrop PNG to your disk with standardized naming (`screencanvas-annotation-YYYY-MM-DD_HH-mm-ss.png`). |
| **Capture Screen + Drawing** | Toolbar Camera Icon | Composites native desktop screen capture with annotations into a single high-definition snapshot. |

---

## 5. Keyboard Cheat Sheet

| Key | Function |
| :--- | :--- |
| `Ctrl + Shift + D` | Toggle Drawing Mode / Desktop Pass-Through |
| `Ctrl + Shift + A` | Toggle Overlay Visibility (Hide / Show) |
| `Ctrl + Shift + C` | Clear All Annotations |
| `V` / `S` | Select / Interact Tool (Neutral Mode) |
| `P` | Freehand Pen / Toggle to Neutral |
| `K` | Laser Pointer (Disappearing Ink) |
| `F` | Spotlight Focus Mode |
| `B` | Cycle Canvas Backdrop |
| `H` | Highlighter |
| `M` | Marker |
| `E` | Eraser |
| `L` | Straight Line |
| `A` | Arrow |
| `R` | Rectangle (Hold `Shift` for square) |
| `C` | Circle (Hold `Shift` for 1:1 circle) |
| `T` | Text Annotation |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo |
| `Ctrl + C` | Copy snapshot to clipboard |
| `]` / `[` | Increase / Decrease stroke size |
| `Scroll Wheel` | Expand / Contract spotlight radius |
| `Escape` | Dismiss popovers / Cancel shape / Reset to Select |
