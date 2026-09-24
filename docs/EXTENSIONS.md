# ScreenCanvas — Extension & Custom Tools Guide

Guidelines for implementing new tools and renderers in ScreenCanvas.

## Adding a New Vector Tool
1. Define the element schema in `src/shared/types/index.ts`.
2. Add tool icon and button in `src/renderer/toolbar/ToolbarApp.tsx`.
3. Add render logic in `src/shared/utils/renderEngine.ts`.
4. Implement interactive gestures in `src/renderer/drawing/DualCanvas.tsx`.
5. Add unit tests in `tests/unit/`.
