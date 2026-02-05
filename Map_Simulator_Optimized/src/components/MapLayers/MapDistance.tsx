import { useEffect, useRef } from "react";
import { useSettingsController, useSettingsSelector } from "../../context/Context";

import { drawDistanceLayer, formatSettings } from "../../assets/utils";


import { World } from "rust_simulator";

function MapDistance() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // const clickedPointRef = useRef<{x: number, y: number} | null>(null);

    const draftEmpires = useSettingsSelector(state => state.draftEmpires);
    
    const activeEmpireId = useSettingsSelector(state => state.activeEmpireId);
    
    const distSource = useSettingsSelector(state => state.lastClicked);
    
    const controller = useSettingsController();

    const activeEmpire = draftEmpires.find(emp => emp.id === activeEmpireId);

    
    const world = controller.world;
    const memory = controller.memory;

    const physicsHash = activeEmpire ? JSON.stringify(activeEmpire.settings) : "";

    useEffect(() => {
        if ( !distSource ) return;
        if (!canvasRef.current || !world) return;
        if ( !activeEmpire ){
            console.warn("No active empire");
            return;
        }
        const {x, y} = distSource;

        world.djisktra_dist_point(x, y, activeEmpireId, formatSettings(
            activeEmpire.settings
        ));

        // 2. Render to Buffer (Pass None for auto-scale, or Some(500) to cap at 500 units)
        world.render_dist_map();

        // 3. Draw to Canvas
        const ctx = canvasRef.current.getContext("2d");
        if (ctx && memory) {
            drawDistanceLayer(ctx, world, memory);
        } else {
            console.warn("NO CTX OR MEMORY");
        }
    }, [physicsHash, distSource])

    // const handleMapClick = (e: React.MouseEvent) => {
    //     if (!canvasRef.current || !world) return;

    //     if ( !activeEmpire ){
    //         console.warn("No active empire");
    //         return;
    //     }

    //     const rect = canvasRef.current.getBoundingClientRect();
    //     const scaleX = world.width() / rect.width;
    //     const scaleY = world.height() / rect.height;

    //     const x = Math.floor((e.clientX - rect.left) * scaleX);
    //     const y = Math.floor((e.clientY - rect.top) * scaleY);

    //     clickedPointRef.current = {x, y};

    //     world.djisktra_dist_point(x, y, activeEmpireId, formatSettings(
    //         activeEmpire.settings
    //     ));

    //     // 2. Render to Buffer (Pass None for auto-scale, or Some(500) to cap at 500 units)
    //     world.render_dist_map();

    //     // 3. Draw to Canvas
    //     const ctx = canvasRef.current.getContext("2d");
    //     if (ctx && memory) {
    //         drawDistanceLayer(ctx, world, memory);
    //     } else {
    //         console.warn("NO CTX OR MEMORY");
    //     }
    // };

    return (
        <canvas
            ref={canvasRef}
            className="distance-canvas"
            width={world?.width() || 0}
            height={world?.height() || 0}
            style={{
                width: '100%',
                height: '100%',
                imageRendering: 'pixelated',
                cursor: 'crosshair' // Indicates you can click to measure
            }}
            // onClick={handleMapClick}
        />
    );
}

export default MapDistance;