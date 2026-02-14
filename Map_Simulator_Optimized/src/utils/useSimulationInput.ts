/* eslint-disable @typescript-eslint/no-explicit-any */
import type { World } from "rust_simulator"; // Adjust import path
import { formatSettings, hexToColorInt } from "../assets/utils";

// 1. Add 'viewMode' to the arguments
export const useSimulationInput = (
    world: World | null, 
    controller: any, 
    viewMode: 'territory' | 'distance'
) => {
    
    const handleClick = (e: React.MouseEvent, rect: DOMRect) => {
        if (!world) return;

        const snapshot = controller.getSnapshot();
        const activeEmpireId = snapshot.activeEmpireId;
        const activeEmpire = snapshot.draftEmpires.find((emp: any) => emp.id === activeEmpireId);

        // Common Check: We need an active empire definition for costs/color
        if (!activeEmpire) {
            console.warn("No active empire selected");
            return;
        }

        // --- BRANCH 1: Territory Mode Checks ---
        if (viewMode === 'territory') {
            // Only strictly check placement if we are actually trying to place it
            if (activeEmpire.alreadyPlaced) {
                alert("This empire is already placed, delete it or select another empire");
                return;
            }
        }

        // --- Common Math (Coordinates) ---
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleX = world.width() / rect.width;
        const scaleY = world.height() / rect.height;
        const cellX = Math.floor(mouseX * scaleX);
        const cellY = Math.floor(mouseY * scaleY);
        const safeX = Math.max(0, Math.min(cellX, world.width() - 1));
        const safeY = Math.max(0, Math.min(cellY, world.height() - 1));

        // console.log(`Clicked Cell: [${safeX}, ${safeY}]`);

        controller.setLastClicked(safeX, safeY);
       
        const settings = formatSettings(activeEmpire.settings);

        if (viewMode === 'territory') {
            const empire_color = hexToColorInt(activeEmpire.color);
            const size = activeEmpire.settings.size || 500;
            
            if (!world.add_empire(
                safeX, safeY, activeEmpireId, empire_color, size, settings
            )) {
                alert("Cannot place an empire");
                return;
            }
            
            controller.placeEmpire(activeEmpireId, safeX, safeY);

        } else {
            // console.time("Dijkstra dist Calc");
            
            world.djisktra_dist_point(safeX, safeY, activeEmpireId, settings);
            
            // console.timeEnd("Dijkstra dist Calc");
        }
    };

    return {
        onClick: handleClick, // Standardized naming (camelCase)
    };
};