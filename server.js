// server.js — main multiplayer server

import { WebSocketServer } from "ws";
import { World } from "./world.js";

const wss = new WebSocketServer({ port: 8080 });
const world = new World();

console.log("SixSevenCraft server running on ws://localhost:8080");

wss.on("connection", socket => {
    let playerId = null;

    socket.on("message", msg => {
        const data = JSON.parse(msg);

        // -----------------------------
        // PLAYER JOIN
        // -----------------------------
        if (data.type === "join") {
            playerId = data.id;
            world.players.set(playerId, {
                x: 0, y: 80, z: 0,
                ry: 0
            });
            return;
        }

        // -----------------------------
        // PLAYER MOVEMENT
        // -----------------------------
        if (data.type === "move") {
            const p = world.players.get(data.id);
            if (!p) return;

            p.x = data.x;
            p.y = data.y;
            p.z = data.z;
            p.ry = data.ry;

            broadcastState();
            return;
        }

        // -----------------------------
        // CHUNK REQUEST
        // -----------------------------
        if (data.type === "requestChunk") {
            const chunk = world.ensureChunk(data.cx, data.cz);

            socket.send(JSON.stringify({
                type: "chunk",
                cx: chunk.cx,
                cz: chunk.cz,
                blocks: Array.from(chunk.blocks),
                blockStates: Array.from(chunk.blockStates)
            }));
            return;
        }

        // -----------------------------
        // BLOCK UPDATE
        // -----------------------------
        if (data.type === "blockUpdate") {
            const { x, y, z, blockId, stateId } = data;

            const { cx, cz } = world.setBlock(x, y, z, blockId, stateId);

            broadcast({
                type: "blockUpdate",
                x, y, z, blockId, stateId
            });
        }
    });

    socket.on("close", () => {
        if (playerId) {
            world.players.delete(playerId);
            broadcast({ type: "leave", id: playerId });
        }
    });
});

// -----------------------------
// BROADCAST HELPERS
// -----------------------------
function broadcast(obj) {
    const msg = JSON.stringify(obj);
    for (const client of wss.clients) {
        if (client.readyState === 1) client.send(msg);
    }
}

function broadcastState() {
    const players = {};
    for (const [id, p] of world.players) {
        players[id] = p;
    }
    broadcast({ type: "state", players });
}

