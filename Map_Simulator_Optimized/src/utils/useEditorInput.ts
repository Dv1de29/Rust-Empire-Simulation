import { useState } from 'react';
import type { World } from "rust_simulator";

export const useEditorInputs = (
    world: World | null, 
    activeTerrain: number, // e.g., 0=Water, 1=Plain
    brushSize: number
) => {
    const [isPainting, setIsPainting] = useState(false);

    // Helper to calculate Grid Coords
    const getCoords = (e: React.MouseEvent, rect: DOMRect) => {
        if (!world) return null;
        const scaleX = world.width() / rect.width;
        const scaleY = world.height() / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        return { x, y };
    }

    const paint = (e: React.MouseEvent, rect: DOMRect) => {
        if (!world) return;
        
        const coords = getCoords(e, rect);
        if (!coords) return;

        // Call Rust
        world.paint_terrain_brush(coords.x, coords.y, brushSize, activeTerrain);
    };

    return {
        onMouseDown: (e: React.MouseEvent, rect: DOMRect) => {
            setIsPainting(true);
            paint(e, rect); // Paint the first dot immediately
        },
        onMouseMove: (e: React.MouseEvent, rect: DOMRect) => {
            if (isPainting) {
                paint(e, rect); // Continue painting while dragging
            }
        },
        onMouseUp: () => setIsPainting(false),
        onMouseLeave: () => setIsPainting(false),
    };
};