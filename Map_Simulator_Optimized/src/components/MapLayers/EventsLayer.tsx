import { useRef } from "react";
import { useSettingsController, useSettingsSelector } from "../../context/Context";
import { useSimulationInput } from "../../utils/useSimulationInput";
import { useEditorInput } from "../../utils/useEditorInput";



function EventsLayer({viewMode} : {viewMode: "territory" | "distance"}){
    const controller = useSettingsController();
    const appMode = useSettingsSelector(state => state.activeMode);
    const world = controller.world;
    
    const containerRef = useRef<HTMLDivElement>(null);

    const simInput = useSimulationInput(world, controller, viewMode);
    
    // const editorInput = useEditorInput(world, 3, 20);

    const handleEvent = (eventName: string, e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        if (appMode === 'SIMULATION') {
            if (eventName === 'onClick') simInput.onClick(e, rect);
        } 
        // else if (appMode === 'EDITOR') {
        //     if (eventName === 'onMouseDown') editorInput.onMouseDown(e, rect);
        //     if (eventName === 'onMouseMove') editorInput.onMouseMove(e, rect);
        //     if (eventName === 'onMouseUp') editorInput.onMouseUp();
        //     if (eventName === 'onMouseLeave') editorInput.onMouseLeave();
        // }
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
                cursor: appMode === 'SIMULATION' ? 'crosshair' : 'default'
            }}
            // Bind Events
            onClick={(e) => handleEvent('onClick', e)}
            onMouseDown={(e) => handleEvent('onMouseDown', e)}
            onMouseMove={(e) => handleEvent('onMouseMove', e)}
            onMouseUp={(e) => handleEvent('onMouseUp', e)}
            onMouseLeave={(e) => handleEvent('onMouseLeave', e)}
        />
    );
}

export default EventsLayer