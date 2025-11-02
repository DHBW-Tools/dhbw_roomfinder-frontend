# Test Mock Server

This folder contains a small mock API used for frontend development. The canonical server file is `server.mjs` (ES module). A legacy `server.js` was removed to avoid confusion.

## Run (npm)

From the project root you can use the npm script:

```bash
# start the mock API on port 9090
npm run mock:dev
# or the alias
npm run api:dev
```

## Run (node)

You can also run the file directly:

```bash
# runs on PORT=9090 by default if you use the npm script above
PORT=9090 node ./test-mock-server/server.mjs
```

## Behavior

- The server serves JSON and .ics example files from `../test-data/api_examples`.
- The `/api/v1/rooms/nearest?room=ROOMID` endpoint now returns dynamic results based on the provided `room` query parameter (it reads `rooms-list.json` and computes simple proximity). Use `?limit=` to change how many results you want (default 10).
- Other endpoints include:
  - `GET /api/v1/rooms` -> `rooms-list.json`
  - `GET /api/v1/rooms/:roomId` -> `room-<id>.json` (if present)
  - `GET /api/v1/rooms/:roomId/free` -> `room-<id>-free.json`
  - `GET /api/v1/rooms/:roomId/calendar.ics` -> `room-<id>-calendar.ics`
  - `GET /api/v1/courses` -> `courses-list.json`
  - `POST /api/v1/refresh` -> responds with `refresh-response.json` (202)

## Notes

- The server is an ES module (`.mjs`). If you prefer CommonJS, convert the file or add `"type": "module"` to the project's `package.json`.
- The mock server is intentionally lightweight and not production-ready. It's meant for local development and tests.

## Quick test

```bash
curl 'http://localhost:9090/api/v1/rooms/nearest?room=A244&limit=5' | jq .
```

If you want, I can also:

- Add a tiny health-check route (e.g. `/__health`) for scripts to wait on.
- Make the server accept `?q=` queries for `GET /api/v1/rooms?q=...` to support autosuggest in the UI.
