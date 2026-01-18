// terrain.js — server-side chunk generator

export function generateChunk(cx, cz) {
    const CHUNK_SIZE = 16;
    const WORLD_HEIGHT = 128;

    const blocks = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
    const blockStates = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);

    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {

            const worldX = cx * CHUNK_SIZE + x;
            const worldZ = cz * CHUNK_SIZE + z;

            const height = 64 + Math.floor(
                8 * Math.sin(worldX * 0.05) +
                8 * Math.cos(worldZ * 0.05)
            );

            for (let y = 0; y < WORLD_HEIGHT; y++) {
                const index = x + CHUNK_SIZE * (z + CHUNK_SIZE * y);

                if (y > height) {
                    blocks[index] = 0; // air
                } else if (y === height) {
                    blocks[index] = 1; // grass_block
                } else if (y > height - 4) {
                    blocks[index] = 2; // dirt
                } else {
                    blocks[index] = 3; // stone
                }

                blockStates[index] = 0; // default state
            }
        }
    }

    return { cx, cz, blocks, blockStates };
}

