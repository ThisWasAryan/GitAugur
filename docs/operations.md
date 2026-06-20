# Operations

GitAugur requires zero custom daemons or services.

### Development Build
```bash
npm install
npm run tauri dev
```

### Production Build
```bash
npm run tauri build
```
This generates binaries in `src-tauri/target/release/bundle/`.

### Logging
Tauri backend logs are routed directly into the terminal during `dev`. Front-end states and errors are dispatched into the browser dev console.

### Troubleshooting
- **No Branches Shown:** Ensure your path contains `.git` and your log formats correctly emit `%00` delimiters.
- **UI Freezes:** Check for synchronous `await invoke` calls blocking the main React render thread. Ensure `setTimeout` yields are in place.
