import http from "http";
import fs from "fs/promises";
import path from "path";
import { parse as urlParse, fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const DATA_DIR = path.resolve(__dirname, "../test-data/api_examples");

async function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  try {
    const txt = await fs.readFile(p, "utf8");
    return JSON.parse(txt);
  } catch (err) {
    return null;
  }
}

async function serveFile(res, relPath, contentType = "application/json") {
  const p = path.join(DATA_DIR, relPath);
  try {
    const buf = await fs.readFile(p);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(buf);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const s = Buffer.concat(chunks).toString() || "{}";
        resolve(JSON.parse(s));
      } catch (e) {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = urlParse(req.url, true);
  const parts = (parsed.pathname || "").split("/").filter(Boolean);

  // Simple logging
  console.log(req.method, parsed.pathname);

  // /metrics
  if (parsed.pathname === "/metrics" && req.method === "GET") {
    return serveFile(res, "system/metrics.json", "application/json");
  }

  // GET /api/v1/rooms
  if (parsed.pathname === "/api/v1/rooms" && req.method === "GET") {
    return serveFile(res, "rooms/rooms-list.json", "application/json");
  }

  // GET /api/v1/courses
  if (parsed.pathname === "/api/v1/courses" && req.method === "GET") {
    return serveFile(res, "courses/courses-list.json", "application/json");
  }

  // GET /api/v1/status
  if (parsed.pathname === "/api/v1/status" && req.method === "GET") {
    return serveFile(res, "system/status.json", "application/json");
  }

  // POST /api/v1/refresh
  if (parsed.pathname === "/api/v1/refresh" && req.method === "POST") {
    // read body but ignore content; respond with refresh-response.json and 202
    await parseBody(req);
    const p = path.join(DATA_DIR, "system/refresh-response.json");
    try {
      const buf = await fs.readFile(p);
      res.writeHead(202, { "Content-Type": "application/json" });
      res.end(buf);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "no_refresh_response" }));
    }
    return;
  }

  // Patterns under /api/v1/rooms
  if (parts[0] === "api" && parts[1] === "v1" && parts[2] === "rooms") {
    // /api/v1/rooms/nearest
    if (parts.length === 4 && parts[3] === "nearest" && req.method === "GET") {
      // Try to return a dynamic nearest list based on ?room=ROOMID
      try {
        const query = parsed.query || {};
        const src = String(query.room || "").toUpperCase();
        const limit = Math.min(100, parseInt(query.limit || "10", 10) || 10);
        const all = await readJSON("rooms/rooms-list.json");
        const rooms = all && Array.isArray(all.rooms) ? all.rooms : [];

        // helper to compute a simple proximity score
        function proximity(a, b) {
          // prefer same block, then numeric closeness
          if (!a || !b) return Infinity;
          const sameBlock = a.block === b.block ? 0 : 1000;
          const anum = Number(a.number ?? 0);
          const bnum = Number(b.number ?? 0);
          const diff = Math.abs(anum - bnum);
          return sameBlock + diff;
        }

        let srcRoom = rooms.find((r) => String(r.id).toUpperCase() === src);
        // fallback: if not found, try to derive block from id like A244 -> 'A'
        if (!srcRoom && src && src.length > 0) {
          const block = src[0];
          srcRoom = { id: src, block, number: 0 };
        }

        // build candidate list excluding the source room
        const candidates = rooms.filter(
          (r) => String(r.id).toUpperCase() !== src
        );

        // compute distance using proximity and attach a human-friendly distance (meters)
        const computed = candidates
          .map((r) => {
            const score = srcRoom
              ? proximity(r, srcRoom)
              : Math.random() * 1000;
            // convert score to meters for simple display
            const distance = Math.max(
              5,
              Math.round(score * 8 + (Math.random() * 20 - 10))
            );
            return {
              id: r.id,
              distance,
              free_now: !!r.free_now,
            };
          })
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ source: src || null, rooms: computed }));
        return;
      } catch {
        // fallback to static file
        return serveFile(res, "rooms/rooms-nearest.json", "application/json");
      }
    }

    // /api/v1/rooms/:roomId/calendar.ics
    const maybeId = parts[3];
    if (maybeId && parts[4] === "calendar.ics" && req.method === "GET") {
      const file = `rooms/room-${maybeId}-calendar.ics`;
      return serveFile(res, file, "text/calendar");
    }

    // /api/v1/rooms/:roomId/free
    if (maybeId && parts[4] === "free" && req.method === "GET") {
      const file = `rooms/room-${maybeId}-free.json`;
      return serveFile(res, file, "application/json");
    }

    // /api/v1/rooms/:roomId
    if (maybeId && req.method === "GET" && parts.length === 4) {
      const file = `rooms/room-${maybeId}.json`;
      return serveFile(res, file, "application/json");
    }
  }

  // Patterns under /api/v1/courses/:courseId/rooms
  if (
    parts[0] === "api" &&
    parts[1] === "v1" &&
    parts[2] === "courses" &&
    parts[4] === "rooms" &&
    req.method === "GET"
  ) {
    const courseId = parts[3];
    const file = `courses/course-${courseId}-rooms.json`;
    return serveFile(res, file, "application/json");
  }

  // Fallback for static files by name (helpful for tests)
  if (req.method === "GET") {
    const name = parts.join("-");
    // try common names
    const mapping = {
      "rooms-list.json": "rooms/rooms-list.json",
    };
    if (mapping[name]) {
      return serveFile(res, mapping[name], "application/json");
    }
    // not found: fall through to 404
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(PORT, () => {
  console.log(`Mock API server listening on http://localhost:${PORT}`);
});
