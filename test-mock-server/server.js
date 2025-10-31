const http = require("http");
const fs = require("fs").promises;
const path = require("path");
const url = require("url");

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
  const parsed = url.parse(req.url, true);
  const parts = (parsed.pathname || "").split("/").filter(Boolean);

  // Simple logging
  console.log(req.method, parsed.pathname);

  // /metrics
  if (parsed.pathname === "/metrics" && req.method === "GET") {
    return serveFile(res, "metrics.json", "application/json");
  }

  // GET /api/v1/rooms
  if (parsed.pathname === "/api/v1/rooms" && req.method === "GET") {
    return serveFile(res, "rooms-list.json", "application/json");
  }

  // GET /api/v1/courses
  if (parsed.pathname === "/api/v1/courses" && req.method === "GET") {
    return serveFile(res, "courses-list.json", "application/json");
  }

  // GET /api/v1/status
  if (parsed.pathname === "/api/v1/status" && req.method === "GET") {
    return serveFile(res, "status.json", "application/json");
  }

  // POST /api/v1/refresh
  if (parsed.pathname === "/api/v1/refresh" && req.method === "POST") {
    // read body but ignore content; respond with refresh-response.json and 202
    await parseBody(req);
    const p = path.join(DATA_DIR, "refresh-response.json");
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
      return serveFile(res, "rooms-nearest.json", "application/json");
    }

    // /api/v1/rooms/:roomId/calendar.ics
    const maybeId = parts[3];
    if (maybeId && parts[4] === "calendar.ics" && req.method === "GET") {
      const file = `room-${maybeId}-calendar.ics`;
      return serveFile(res, file, "text/calendar");
    }

    // /api/v1/rooms/:roomId/free
    if (maybeId && parts[4] === "free" && req.method === "GET") {
      const file = `room-${maybeId}-free.json`;
      return serveFile(res, file, "application/json");
    }

    // /api/v1/rooms/:roomId
    if (maybeId && req.method === "GET" && parts.length === 4) {
      const file = `room-${maybeId}.json`;
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
    const file = `course-${courseId}-rooms.json`;
    return serveFile(res, file, "application/json");
  }

  // Fallback for static files by name (helpful for tests)
  if (req.method === "GET") {
    const name = parts.join("-");
    // try common names
    const mapping = {
      "rooms-list.json": "rooms-list.json",
    };
    // not found: 404
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(PORT, () => {
  console.log(`Mock API server listening on http://localhost:${PORT}`);
});
