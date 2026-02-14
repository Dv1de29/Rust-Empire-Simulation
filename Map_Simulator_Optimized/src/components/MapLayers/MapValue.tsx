import React, { useRef, useEffect } from "react";

import { useSettingsController, useSettingsSelector } from "../../context/Context";



function MapValue() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const controller = useSettingsController();
    const world = controller.world;
    const memory = controller.memory;

    const resourceVersion = useSettingsSelector(state => state.resourceVersion);

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


        /////cahnge to render_resource after modifying rust
        world.render_resources(); 

        const width = world.width();
        const height = world.height();

        const ptr = world.get_resource_buffer_ptr();

        const data = new Uint8ClampedArray(
            memory.buffer, 
            ptr,
            width * height * 4
        );

        const imageData = new ImageData(data, width, height);
        
        ctx.putImageData(imageData, 0, 0);

    }, [world, resourceVersion]); 

    if (!world) return null; 

    return (
        <canvas 
            className="map-canvas resource-canvas"
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

export default MapValue;