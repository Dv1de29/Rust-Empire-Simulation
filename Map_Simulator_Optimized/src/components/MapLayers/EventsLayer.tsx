import { useRef } from "react";
import { useSettingsController, useSettingsSelector } from "../../context/Context";
import { useSimulationInput } from "../../utils/useSimulationInput";
import { useEditorInput } from "../../utils/useEditorInput";

function EventsLayer({viewMode} : {viewMode: "territory" | "distance"}){
    const controller = useSettingsController();
    const appMode = useSettingsSelector(state => state.activeMode);

    const activeTerrain = useSettingsSelector(state => state.activeTerrain);
    const activeDiameter = useSettingsSelector(state => state.activeRadius); // Assuming this is diameter
    useSettingsSelector(state => state.mapVersion);

    const world = controller.world;
    
    const containerRef = useRef<HTMLDivElement>(null);
    // 1. Ref for our Ghost Cursor
    const brushRef = useRef<HTMLDivElement>(null);

    const simInput = useSimulationInput(world, controller, viewMode);
    const editorInput = useEditorInput(world, controller, activeTerrain, activeDiameter);

    const handleEvent = (eventName: string, e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        // --- CURSOR LOGIC ---
        if (appMode === 'EDITOR' && brushRef.current && world) {
            // 1. Calculate Independent Scales
            const scaleX = rect.width / world.width();
            const scaleY = rect.height / world.height();

            // 2. Calculate Visual Dimensions (Can be an Oval!)
            const pixelWidth = activeDiameter * scaleX;
            const pixelHeight = activeDiameter * scaleY;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 3. Apply Styles
            brushRef.current.style.width = `${pixelWidth}px`;
            brushRef.current.style.height = `${pixelHeight}px`;
            
            // 4. Center the oval on the mouse
            brushRef.current.style.transform = `translate(${x - pixelWidth/2}px, ${y - pixelHeight/2}px)`;
            
            // Show/Hide
            brushRef.current.style.opacity = eventName === 'onMouseLeave' ? '0' : '1';
        }

        // --- GAME LOGIC ---
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
                // 2. Hide default cursor in EDITOR
                cursor: appMode === 'SIMULATION' ? 'crosshair' : 'none',
                overflow: 'hidden' // Keeps brush from causing scrollbars at edges
            }}
            onClick={(e) => handleEvent('onClick', e)}
            onMouseDown={(e) => handleEvent('onMouseDown', e)}
            onMouseMove={(e) => handleEvent('onMouseMove', e)}
            onMouseUp={(e) => handleEvent('onMouseUp', e)}
            onMouseLeave={(e) => handleEvent('onMouseLeave', e)}
        >
            {/* 3. The Ghost Brush Element */}
            {appMode === 'EDITOR' && (
                <div 
                    ref={brushRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        border: '2px solid white', // Visible on dark terrain
                        outline: '1px solid black', // Visible on light terrain (Double ring)
                        borderRadius: '50%',
                        pointerEvents: 'none', // Critical: Let clicks pass through to the div below
                        willChange: 'transform, width, height', // Performance hint
                        zIndex: 1001,
                        boxShadow: '0 0 5px rgba(0,0,0,0.5)' // Optional glow
                    }}
                />
            )}
        </div>
    );
}

export default EventsLayer;