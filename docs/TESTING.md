# Testing and Verification

## Dependency-free standalone check

The JavaScript embedded in `PLAY_NOW.html` can be syntax-checked by extracting its `<script>` body and running `node --check` on that temporary `.js` file. This check does not test browser rendering or gameplay behavior.

## Development app checks

After dependencies are installed:

```bash
npm run build
npm test
```

Run the standalone app locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/PLAY_NOW.html`.

## Before release

- Test career creation, save/reload, JSON export/import, and reset.
- Test transfer affordability, wage limits, transaction idempotency, and player club membership.
- Run seeded match simulations and verify goal/event/stat consistency.
- Complete a full season and validate fixture counts and tie-break calculations.
- Check responsive behavior at narrow and wide viewport sizes.
- Audit API ownership checks, authentication, dependencies, CSP, and third-party licenses.

Do not mark a test passed unless it was actually executed and the result recorded.
