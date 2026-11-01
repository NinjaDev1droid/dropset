# DropSet Tests

Automated checks for every DropSet page and tool. Run them after you change anything.

## First time only

```bash
cd tests
npm install
```

## Run the tests

```bash
cd tests
npm test
```

Every line should say `PASS`. A `FAIL` line tells you which feature broke.

| Command | What it checks | Time |
|---|---|---|
| `npm test` | Everything below | ~30 s |
| `npm run test:logic` | Setlist Generator against every genre / vibe / crowd / length, opener/closer parsing, building sets from your library, and the backup file format / merge rules | 1 s |
| `npm run test:browser` | Opens every page in Chrome (in the background) and clicks through each tool: loading, phone layout, adding/editing/deleting tracks and gigs, income totals, captions, copy and CSV export, and downloading + restoring a backup | ~30 s |

## Notes

- The browser tests use your installed Google Chrome. If it lives somewhere else, run
  `CHROME_PATH="/path/to/chrome" npm test`.
- They run in a separate, temporary Chrome profile, so your real library and gigs are never touched.
- If you add new songs to `setlist-generator/app.js`, `npm run test:logic` checks every track has all its fields.
