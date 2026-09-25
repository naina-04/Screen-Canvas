# Security Architecture

- `contextIsolation: true` on all renderer windows.
- `nodeIntegration: false`.
- IPC communication strictly validated and filtered through `preload/index.ts`.
