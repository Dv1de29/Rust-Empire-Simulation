/* eslint-disable @typescript-eslint/no-explicit-any */



import { useState } from 'react';
import type { World } from "rust_simulator";
import { drawOwnershipLayer } from '../assets/utils';

export const useEditorInput = (
    world: World | null, 
    controller: any,
    activeTerrain: string,
    brushSize: number,
    paintingMode: "MAP" | "RESOURCE",
) => {
    const [isPainting, setIsPainting] = useState(false);

    // console.log(activeTerrain);

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
        if ( paintingMode === "MAP"){
            world.paint_terrain_brush(coords.x, coords.y, brushSize, activeTerrain);
        } else {
            world.paint_resource_brush(coords.x, coords.y, brushSize, activeTerrain);
        }
    };

    return {
        onMouseDown: (e: React.MouseEvent, rect: DOMRect) => {
            setIsPainting(true);
            paint(e, rect); // Paint the first dot immediately
            if ( paintingMode === "MAP"){
                controller.signalTerrainChange();
            } else {
                controller.signalResourceChange();
            }
        },
        onMouseMove: (e: React.MouseEvent, rect: DOMRect) => {
            if (isPainting) {
                paint(e, rect); // Continue painting while dragging
                if ( paintingMode === "MAP"){
                    controller.signalTerrainChange();
                } else {
                    controller.signalResourceChange();
                }
            }
        },
        onMouseUp: () => setIsPainting(false),
        onMouseLeave: () => setIsPainting(false),
    };
};