import { useRef } from "react";
import { useSettingsController, useSettingsSelector } from "../../context/Context";
import { useSimulationInput } from "../../utils/useSimulationInput";
import { useEditorInput } from "../../utils/useEditorInput";

function EventsLayer({viewMode, paintingMode} : {
        viewMode: "territory" | "distance",
        paintingMode: "MAP" | "RESOURCE"
    }){
    const controller = useSettingsController();
    const appMode = useSettingsSelector(state => state.activeMode);

    const activeTerrain = useSettingsSelector(state => state.activeTerrain);
    const activeResource = useSettingsSelector(state => state.activeResource);

    const activeDiameter = useSettingsSelector(state => state.activeRadius); //daimeter
    useSettingsSelector(state => state.mapVersion);

    const world = controller.world;
    
    const containerRef = useRef<HTMLDivElement>(null);
    const brushRef = useRef<HTMLDivElement>(null);

    const simInput = useSimulationInput(world, controller, viewMode);
    const editorInput = useEditorInput(
        world, 
        controller, 
        paintingMode === "MAP" ? activeTerrain : activeResource, 
        activeDiameter, 
        paintingMode
     );

    const handleEvent = (eventName: string, e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        // CURSOR LOGIC
        if (appMode === 'EDITOR' && brushRef.current && world) {
            const scaleX = rect.width / world.width();
            const scaleY = rect.height / world.height();

            const pixelWidth = activeDiameter * scaleX;
            const pixelHeight = activeDiameter * scaleY;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            brushRef.current.style.width = `${pixelWidth}px`;
            brushRef.current.style.height = `${pixelHeight}px`;
            
            brushRef.current.style.transform = `translate(${x - pixelWidth/2}px, ${y - pixelHeight/2}px)`;
            
            brushRef.current.style.opacity = eventName === 'onMouseLeave' ? '0' : '1';
        }

        // GAME LOGIC
        if (appMode === 'SIMULATION') {
            if (eventName === 'onClick') simInput.onClick(e, rect);
        } 
        else if (appMode === 'EDITOR') {
            if (eventName === 'onMouseDown') editorInput.onMouseDown(e, rect);
            if (eventName === 'onMouseMove') editorInput.onMouseMove(e, rect);
            if (eventName === 'onMouseUp') editorInput.onMouseUp();
            if (eventName === 'onMouseLeave') editorInput.onMouseLeave();
        }
    };

    return (
        <div 
            ref={containerRef}
            className="interaction-layer"
            style={{
                width: '100%',
                height: '100%',
                zIndex: 999,
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: appMode === 'SIMULATION' ? 'crosshair' : 'none',
                overflow: 'hidden' 
            }}
            onClick={(e) => handleEvent('onClick', e)}
            onMouseDown={(e) => handleEvent('onMouseDown', e)}
            onMouseMove={(e) => handleEvent('onMouseMove', e)}
            onMouseUp={(e) => handleEvent('onMouseUp', e)}
            onMouseLeave={(e) => handleEvent('onMouseLeave', e)}
        >
            {appMode === 'EDITOR' && (
                <div 
                    ref={brushRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        border: '2px solid white',
                        outline: '1px solid black', 
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        willChange: 'transform, width, height',
                        zIndex: 1001,
                        boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                />
            )}
        </div>
    );
}

export default EventsLayer;