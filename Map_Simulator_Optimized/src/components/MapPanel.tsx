import React, { useEffect, useState } from 'react';
import MapLayer from "./MapLayer";
import MapOwnership from "./MapOwnership";
import '../styles/MapPanel.css'; // Import the external CSS
import { useSettingsSelector } from '../context/Context';

import { fetchMap } from '../assets/utils';


import init, { initThreadPool, World } from "rust_simulator";

// Go up: components -> src -> react_app -> root -> rust_simulator -> pkg
// (Adjust the number of "../" based on your exact folder depth)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from "../../../rust_simulator/pkg/rust_simulator_bg.wasm?url";


function MapPanel(){
    const [world, setWorld] = useState<World | null>(null);
    const [wasmMemory, setWasmMemory] = useState<WebAssembly.Memory | null>(null);
    const [isSystemReady, setSystemReady] = useState<boolean>(false);
    
    // Tracks if the specific map data is currently fetching
    const [isLoadingMap, setLoadingMap] = useState<boolean>(false);

    const activeMap: string = useSettingsSelector(state => state.activeMap);

    useEffect(() => {
        let mounted = true;
        async function bootUp() {
            try{
                const wasm = await init(wasmUrl);

                try{
                    await initThreadPool(navigator.hardwareConcurrency);
                } catch(e){
                    console.warn("Thread pool already active or failed:", e);
                }

                if ( mounted ){
                    setWasmMemory(wasm.memory);
                    setSystemReady(true);
                }
            }
            catch(e){
                console.error("ERROR booting the world", e);
            }   
        }

        bootUp();

        return () => { mounted = false; };
    }, [])

    useEffect(() => {
        if ( !isSystemReady || !activeMap ) return;

        let mounted = true;
        const loadWorld = async () => {
            setLoadingMap(true);

            try{
                const mapData = await fetchMap(activeMap);

                if ( !mounted ) return;

                if (!mapData){
                    throw new Error(`Map data was empty for:${activeMap}`);
                }

                const w = World.new(mapData);
                setWorld(w);
            } catch(e){
                console.error("Failed to load map: ", e);
            } finally{
                if ( mounted ) setLoadingMap(false);
            }
        }

        loadWorld();

        return () => {mounted = false;};
    }, [activeMap, isSystemReady])
    
    if (!isSystemReady || isLoadingMap) return <div>Loading....</div>;

    return (
        <div className="map_container">
            <div className="map_header">
                <h3>Map View</h3>
                {/* Header controls go here */}
            </div>
            <div className="map">
                {/* Layer 1: Bottom (Static Terrain) */}
                <div className="map-layer terrain-layer">
                    <MapLayer world={world} memory={wasmMemory}/>
                </div>

                {/* Layer 2: Top (Dynamic Ownership) */}
                <div className="map-layer ownership-layer">
                    <MapOwnership world={world} memory={wasmMemory}/>
                </div>
            </div>
        </div>
    );
};

export default MapPanel;