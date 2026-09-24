# ScreenCanvas — Desktop Integration & Window Lifecycle

This document explains the window focus tracking, application active state, and pen unselection mechanics.

## Architecture Overview

ScreenCanvas consists of two primary windows:
1. **Toolbar Window**: Floating pill UI at the top of the screen (`alwaysOnTop: 'screen-saver', 1`).
2. **Overlay Canvas Window**: Transparent fullscreen window (`alwaysOnTop: 'floating'`).

### Focus Tracking & Deactivation
- When the user switches to any other application (e.g. Chrome, VS Code) via `Alt+Tab` or taskbar, both ScreenCanvas windows emit `blur`.
- After a 120ms debounce to prevent flicker between internal toolbar-to-canvas clicks, the application enters **Inactive Mode**:
  - `setIgnoreMouseEvents(true, { forward: true })` is called.
  - The cursor immediately reverts to `default`.
  - In-flight strokes are cancelled.
  - Clicks pass through to the active application.

### Re-activation (Bringing App to Top)
- The user clicks the floating toolbar or focuses ScreenCanvas.
- ScreenCanvas detects focus and immediately restores the active drawing tool and cursor.

### Unselecting the Pen
- Click the active Pen button to toggle it off to Desktop mode.
- Click the dedicated **Desktop Cursor** button (`Esc` / `V`).
- Press <kbd>Escape</kbd> anywhere on screen.
