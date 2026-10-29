# CROWN OF FOOTBALL — Rise of a Club

**Creator:** Hamid Yarali  
**Suggested repository:** `crown-of-football`  
**GitHub:** https://github.com/HamidYaraliOfficial  
**Copyright:** © 2026 Hamid Yarali. All rights reserved.

## Overview
A browser-based football management game with fictional clubs and players. Manage your squad, negotiate transfers, control budgets and contracts, scout talent, set tactics, simulate matches, and progress through league seasons.

## Quick start
On Windows, run `RUN-PLAY-NOW.bat`. Alternatively, from the repository root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/PLAY_NOW.html`. The standalone version does not require npm installation and includes Persian, English, and Simplified Chinese interfaces, local saves, and JSON import/export.

## Dependency-free smoke checks

```bash
node scripts/verify-standalone.cjs
node scripts/smoke-offline.cjs
```

These check inline JavaScript syntax and exercise page templates, language switching, transfers, match completion, and save import/export using a mocked DOM. They are not a substitute for a real-browser test.

## Development app
```bash
npm install
npm run dev
```
Run the web app and API with `npm run dev:full`. Build and test with `npm run build` and `npm test`.

## Status
`PLAY_NOW.html` is provided for immediate standalone use. The React/Three.js app and API are extensible development code and require dependency installation before building. The API currently uses an in-memory development adapter; `database/schema.sql` is not yet wired into persistent career operations.

## Intellectual property
Copyright © 2026 Hamid Yarali. All rights reserved. Reuse, redistribution, derivative works, and commercial use require prior written permission, except where independently permitted by applicable law. See [`LICENSE`](LICENSE).
