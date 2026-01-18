// world.js — server-side world manager

import { generateChunk } from "./terrain.js";

export class World {
    constructor() {
        this.chunks = new Map();   // "cx,cz" → chunk
        this.players = new Map();  // id → player data
    }

    key(cx, cz) {
        return `${cx},${cz}`;
    }

    ensureChunk(cx, cz) {
        const key = this.key(cx, cz);
        if (!this.chunks.has(key)) {
            const chunk = generateChunk(cx, cz);
            this.chunks.set(key, chunk);
        }
        return this.chunks.get(key);
    }

    getChunk(cx, cz) {
        return this.chunks.get(this.key(cx, cz));
    }

    setBlock(x, y, z, blockId, stateId = 0) {
        const cx = Math.floor(x / 16);
        const cz = Math.floor(z / 16);

        const chunk = this.ensureChunk(cx, cz);

        const lx = x - cx * 16;
        const lz = z - cz * 16;

        const index = lx + 16 * (lz + 16 * y);

        chunk.blocks[index] = blockId;
        chunk.blockStates[index] = stateId;

        return { cx, cz };
    }
}
