import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 10000;

// Create HTTP server for Render health checks
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Attach WebSocket server to the same HTTP server
const wss = new WebSocketServer({ server });

let players = {};

wss.on("connection", ws => {
  let id = null;

  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "join") {
        id = data.id;
        players[id] = { x: 0, y: 0, z: 0, ry: 0 };
        broadcast({ type: "state", players });
      }

      if (data.type === "move" && id) {
        players[id] = {
          x: data.x,
          y: data.y,
          z: data.z,
          ry: data.ry
        };
        broadcast({ type: "state", players });
      }
    } catch {}
  });

  ws.on("close", () => {
    if (id && players[id]) {
      delete players[id];
      broadcast({ type: "leave", id });
    }
  });
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

