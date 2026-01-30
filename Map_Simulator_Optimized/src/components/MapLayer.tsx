import React, { useRef, useEffect } from "react";

import { World } from "rust_simulator";

interface MapLayerProps {
    world: World | null; // We need the world instance to ask for pointers
    memory: WebAssembly.Memory | null
}

function MapLayer({ world, memory }: MapLayerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        // Guard clauses: If anything is missing, stop.
        if (!canvas || !ctx || !world) {
            console.warn("Returned from the useEffect!!!!!");
            return;
        }

        if ( !world){
            console.warn("No world so exited from useEffect");
            return;
        }

        if ( !memory ){
            console.warn("No memory so exited from useEffect");
            return;
        }

        // 1. Ask Rust to calculate pixels (if not already done)
        // This fills the 'terrain_buffer' in Rust memory
        world.render_terrain(); 

        // 2. Get the dimensions directly from Rust to be safe
        const width = world.width();
        const height = world.height();

        // 3. Get the POINTER to the memory location
        const ptr = world.get_terrain_buffer_ptr();

        // 4. Create a JavaScript View into WASM Memory
        // Uint8ClampedArray is what HTML Canvas expects (RGBA, 0-255)
        // Length = width * height * 4 bytes (R, G, B, A)
        const data = new Uint8ClampedArray(
            memory.buffer, // The entire WASM RAM
            ptr,
            width * height * 4
        );

        // 5. Create ImageData and Draw
        // This is extremely fast because 'data' is just a view, not a copy
        const imageData = new ImageData(data, width, height);
        
        ctx.putImageData(imageData, 0, 0);

    }, [world]); // Re-run this only if the 'world' instance changes

    // If world is null, we can't render dimensions yet
    if (!world) return null; 

    return (
        <canvas 
            className="map-canvas layer-canvas"
            ref={canvasRef}
            width={world.width()}   // Set physical pixel buffer size
            height={world.height()} // Set physical pixel buffer size
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                imageRendering: 'pixelated' // Keep edges sharp!
            }}
        />
    );
}

export default MapLayer;