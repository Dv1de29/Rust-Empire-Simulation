import React, { useRef, useEffect } from "react";

import { useSettingsController, useSettingsSelector } from "../context/Context";

import { drawOwnershipLayer, formatSettings, hexToColorInt } from "../assets/utils";


function MapOwnership() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const controller = useSettingsController();
    const world = controller.world;
    const memory = controller.memory;

    const ownershipRevision = useSettingsSelector(state => state.ownershipRev);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if ( !world || !memory || !ctx) return;

        drawOwnershipLayer(ctx, world, memory);
    }, [world, memory, ownershipRevision])


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        // Guard clauses: If anything is missing, stop.
        if (!canvas || !ctx ) {
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
        world.render_ownership(); 

        // 2. Get the dimensions directly from Rust to be safe
        const width = world.width();
        const height = world.height();

        // 3. Get the POINTER to the memory location
        const ptr = world.get_ownership_buffer_ptr();

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

    }, [world, memory]);

    const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!world || !canvasRef.current || !memory) return;

        const snapshot = controller.getSnapshot();

        const activeEmpireId = snapshot.activeEmpireId;
        const activeEmpire = snapshot.draftEmpires.find(emp => emp.id === activeEmpireId);

        if (!activeEmpire) {
            console.warn("No active ampire");
            return;
        }

        if ( activeEmpire.alreadyPlaced) {
            alert("This empire is already placed, delete it or select another empire");
            return;
        }

        const canvas = canvasRef.current;
        
        // 1. Get the size of the canvas as it appears on the screen (CSS pixels)
        const rect = canvas.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 3. Calculate the ratio (Simulation Cells / Screen Pixels)
        // Example: 50 cells / 800 pixels = 0.0625 cells per pixel
        const scaleX = world.width() / rect.width;
        const scaleY = world.height() / rect.height;

        // 4. Map and Floor to get integer Grid Coordinates
        const cellX = Math.floor(mouseX * scaleX);
        const cellY = Math.floor(mouseY * scaleY);

        // 5. Safety Clamp (prevents -1 or out of bounds errors)
        const safeX = Math.max(0, Math.min(cellX, world.width() - 1));
        const safeY = Math.max(0, Math.min(cellY, world.height() - 1));

        console.log(`Clicked Cell: [${safeX}, ${safeY}]`);

        if ( !activeEmpireId ){
            console.warn("No active empire id: ", activeEmpireId);
            return;
        }

        const empire_settings = activeEmpire.settings;
        const empire_color = hexToColorInt(activeEmpire.color);
        const settings = formatSettings(empire_settings);
        console.log(activeEmpire);

        world.add_empire(safeX, safeY, activeEmpireId, empire_color, activeEmpire.settings.size, settings)
        controller.placeEmpire(activeEmpireId);
        const ctx = canvas.getContext('2d');
        if ( !ctx ) return;
        drawOwnershipLayer(ctx, world, memory);       
    }


    if (!world) return null; 

    return (
        <canvas 
            className="map-canvas owner-canvas"
            ref={canvasRef}
            width={world.width()}
            height={world.height()}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                imageRendering: 'pixelated' // Keep edges sharp!
            }}
            onClick={(e) => {
                handleClick(e);
            }}
        />
    );
}

export default MapOwnership;