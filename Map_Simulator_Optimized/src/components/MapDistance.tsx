import { useEffect, useRef } from "react";
import { useSettingsController, useSettingsSelector } from "../context/Context";

import { drawDistanceLayer } from "../assets/utils";


import { World } from "rust_simulator";

function MapDistance() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const controller = useSettingsController();
    const activeEmpireId = useSettingsSelector(state => state.activeEmpireId);
    
    const world = controller.world;
    const memory = controller.memory;



    const handleMapClick = (e: React.MouseEvent) => {
        if (!canvasRef.current || !world) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = world.width() / rect.width;
        const scaleY = world.height() / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        world.djisktra_dist_point(x, y, activeEmpireId);

        // 2. Render to Buffer (Pass None for auto-scale, or Some(500) to cap at 500 units)
        world.render_dist_map(undefined);

        // 3. Draw to Canvas
        const ctx = canvasRef.current.getContext("2d");
        if (ctx && memory) {
            drawDistanceLayer(ctx, world, memory);
        } else {
            console.warn("NO CTX OR MEMORY");
        }
    };

    return (
        <canvas
            ref={canvasRef}
            className="distance-canvas"
            width={world?.width() || 0}
            height={world?.height() || 0}
            onClick={handleMapClick}
            style={{
                width: '100%',
                height: '100%',
                imageRendering: 'pixelated',
                cursor: 'crosshair' // Indicates you can click to measure
            }}
        />
    );
}

export default MapDistance;