# Changelog

All notable changes to **ScreenCanvas** are documented in this file.

## [1.2.0] - 2026-09-24

### Added
- **Instant Pen Unselection**: Click active Pen button, click Desktop button, or press `Esc`/`V` to immediately switch to desktop click-through.
- **Smart Focus Tracking**: Pen automatically pauses drawing, passes through mouse clicks, and restores the system cursor when switching to other apps.
- **Mutual Window Teardown**: Guaranteed clean process exit when closing toolbar or overlay, preventing orphaned processes.
- **Second-Instance Guard**: Focuses and brings existing toolbar to top if app is launched while already running.
- **Sequential Stamp Manager**: Numbered badge stamp engine for tutorial workflows.
- **Shape Fill Transparency**: Translucent fills for rectangles and circles.
- **Catmull-Rom Spline & Chaikin Smoothing**: Mathematical curve smoothing algorithms for drawing strokes.
- **SVG Vector Exporter**: Vector SVG annotation generation.
- **Project Serialization**: Save and load `.screencanvas` JSON project files.

## [1.1.0] - 2026-09-23
- Initial release with dual-canvas engine, floating pill toolbar, and presentation tools.
