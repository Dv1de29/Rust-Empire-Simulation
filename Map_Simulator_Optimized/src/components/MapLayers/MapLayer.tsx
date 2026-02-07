import React, { useRef, useEffect } from "react";

import { useSettingsController, useSettingsSelector } from "../../context/Context";



function MapLayer() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const controller = useSettingsController();
    const world = controller.world;
    const memory = controller.memory;

    const mapVersion = useSettingsSelector(state => state.mapVersion);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

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

    }, [world, mapVersion]); 

    if (!world) return null; 

    return (
        <canvas 
            className="map-canvas layer-canvas"
            ref={canvasRef}
            width={world.width()}
            height={world.height()}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                imageRendering: 'pixelated' 
            }}
        />
    );
}

export default MapLayer;