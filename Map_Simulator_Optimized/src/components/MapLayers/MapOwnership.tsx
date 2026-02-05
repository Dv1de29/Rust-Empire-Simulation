import React, { useRef, useEffect } from "react";

import { useSettingsController, useSettingsSelector } from "../../context/Context";

import { drawOwnershipLayer, formatSettings, hexToColorInt } from "../../assets/utils";


function MapOwnership({mode} : {mode: "SIMULATION" | "EDITOR"}) {
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
        />
    );
}

export default MapOwnership;