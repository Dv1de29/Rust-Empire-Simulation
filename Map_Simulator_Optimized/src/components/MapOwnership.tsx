import React, { useRef, useEffect } from "react";

import { useSettingsController, useSettingsSelector } from "../context/Context";

import { drawOwnershipLayer, formatSettings, hexToColorInt } from "../assets/utils";


function MapOwnership() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const controller = useSettingsController();
    const world = controller.world;
    const memory = controller.memory;

    const commitEmpires = useSettingsSelector(state => state.commitEmpires);
    const ownershipRevision = useSettingsSelector(state => state.ownershipRev);


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!world || !memory || !ctx || !canvas) return;


        // B. Draw the Pixels to Canvas (Base Layer)
        drawOwnershipLayer(ctx, world, memory);

        // C. Draw the Overlays (Dots & Names)
        commitEmpires.forEach(emp => {
            // Only draw if it is placed AND has coordinates
            if (emp.alreadyPlaced && emp.capital) {
                const { x, y } = emp.capital;

                ctx.save(); 

                // Draw Dot
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2); 
                ctx.fillStyle = "#FFFFFF";
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#000000";
                ctx.stroke();

                // Draw Name
                ctx.font = "bold 11px sans-serif"; 
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                
                // Outline (Stroke) makes text readable on any background
                ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
                ctx.lineWidth = 3;
                ctx.strokeText(emp.name, x, y - 5);

                // Fill (Text Color)
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(emp.name, x, y - 5);

                ctx.restore();
            }
        });

    }, [world, memory, ownershipRevision, commitEmpires])

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
        // const ctx = canvas.getContext('2d');
        // if ( !ctx ) return;
        // drawOwnershipLayer(ctx, world, memory);       
        controller.placeEmpire(activeEmpireId, safeX, safeY);
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