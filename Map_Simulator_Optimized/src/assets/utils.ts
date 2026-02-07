import { World } from "rust_simulator";
import type { SettingsValue } from "../types/types";

export const drawOwnershipLayer = (
    ctx: CanvasRenderingContext2D,
    world: World,
    memory: WebAssembly.Memory
) => {
    world.render_ownership();

    const width = world.width();
    const height = world.height();
    const ptr = world.get_ownership_buffer_ptr();

    const data = new Uint8ClampedArray(
        memory.buffer,
        ptr,
        width * height * 4
    );

    const imageData = new ImageData(data, width, height);
    ctx.putImageData(imageData, 0, 0);
};

export const drawTerrainLayer = (
    ctx: CanvasRenderingContext2D,
    world: World,
    memory: WebAssembly.Memory
) => {
    world.render_terrain();

    const width = world.width();
    const height = world.height();
    const ptr = world.get_terrain_buffer_ptr();

    const data = new Uint8ClampedArray(
        memory.buffer,
        ptr,
        width * height * 4
    );

    const imageData = new ImageData(data, width, height);
    ctx.putImageData(imageData, 0, 0);
};

// Helper to draw the Distance Buffer
export const drawDistanceLayer = (
    ctx: CanvasRenderingContext2D,
    world: World,
    memory: WebAssembly.Memory
) => {
    const width = world.width();
    const height = world.height();
    const ptr = world.get_dist_buffer_ptr(); // <--- The new pointer we made in Rust

    const data = new Uint8ClampedArray(
        memory.buffer,
        ptr,
        width * height * 4
    );

    const imageData = new ImageData(data, width, height);
    ctx.putImageData(imageData, 0, 0);
};


// Converts a Hex string (#RRGGBB) to the Integer format Rust expects (0xAABBGGRR)
export function hexToColorInt(hex: string) {
    // Remove '#' if present
    const cleanHex = hex.replace('#', '');
    
    // Parse the components
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const a = 0xFF; // Full Opacity

    // Combine into Little Endian Uint32 (AABBGGRR)
    // This matches how standard ImageData reads pixels
    return (a << 24) | (b << 16) | (g << 8) | r >>> 0;
}

// Maps your settings object to the specific indices defined in your Rust Terrain Enum
export function formatSettings(settingsObj: SettingsValue) {
    // The order MUST match your Rust Enum:
    // 0: Unknown, 1: Water, 2: River, 3: Plain, 4: Mountain, 5: Desert, 6: Forest, 7: Ice
    
    // Default cost of 999 if a setting is missing
    const D = 999; 

    return new Uint32Array([
        D,                          // 0: Unknown (Usually unused)
        settingsObj.water ?? D,     // 1: Water
        settingsObj.river ?? D,     // 2: River
        settingsObj.plain ?? D,     // 3: Plain
        settingsObj.mountain ?? D,  // 4: Mountain
        settingsObj.desert ?? D,    // 5: Desert
        settingsObj.forest ?? D,    // 6: Forest
        settingsObj.ice ?? D        // 7: Ice
    ]);
}





export const fetchMap = async (mapName: string) => {
    try{
        const res = await fetch(`/resources/maps/${mapName}.txt`);

        if ( !res.ok ){
            throw new Error(`Error at fetching the map string: ${res.status}, ${res.statusText}`);
        }

        const data = await res.text();

        // console.log(data);

        return data
    }
    catch(e){
        console.error("Error: ", e);
    }
}



export type MapType = 'BLANK_WATER' | 'BLANK_GRASS' | 'NOISE';

export function generateMapString(width: number, height: number, type: MapType = 'BLANK_WATER'): string {
    let mapString = "";
    
    // Define characters based on your Rust parser
    // W=Water, P=Plain, M=Mountain, F=Forest, D=Desert, etc.
    const chars = ['W', 'P', 'M', 'F', 'D', 'S', 'I']; 

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (type === 'BLANK_WATER') {
                mapString += 'W';
            } else if (type === 'BLANK_GRASS') {
                mapString += 'P';
            } else if (type === 'NOISE') {
                // Simple random noise
                const randomIndex = Math.floor(Math.random() * chars.length);
                mapString += chars[randomIndex];
            }
        }
        // Add newline at end of each row (except the last one if you want to be strict, 
        // but usually split('\n') handles trailing newlines fine)
        if (y < height - 1) {
            mapString += '\n';
        }
    }
    
    return mapString;
}