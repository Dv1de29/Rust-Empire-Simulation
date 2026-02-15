import { useState } from 'react';
import MapLayer from "./MapLayers/MapLayer";
import MapOwnership from "./MapLayers/MapOwnership";
import MapDistance from './MapLayers/MapDistance';
import '../styles/MapPanel.css'; 

import { useSettingsController, useSettingsSelector } from '../context/Context';
import EventsLayer from './MapLayers/EventsLayer';
import MapValue from './MapLayers/MapValue';

type MapViewMode = 'territory' | 'distance';
type PaintingMode = "MAP" | "RESOURCE";

function MapPanel(){
    const isSystemReady = useSettingsSelector(state => state.isSystemReady);
    const isLoadingMap = useSettingsSelector(state => state.isLoadingMap);
    const showResourcesMap = useSettingsSelector(state => state.showResourcesMap);
    
    const appMode = useSettingsSelector(state => state.activeMode);

    const [viewMode, setViewMode] = useState<MapViewMode>('territory');
    const [paintingMode, setPaintingMode] = useState<PaintingMode>("MAP");

    const controller = useSettingsController();


    if (!isSystemReady || isLoadingMap) return <div>Loading....</div>;

    return (
        <div className="map_container">
            <div className="map_header">
                <h3>Map View</h3>
                
                {/* --- TABS --- */}

                {appMode === 'SIMULATION' ? (
                    <div className="map-tabs simulation-mode-tabs">
                        <button 
                            className={`tab-btn ${viewMode === 'territory' ? 'active' : ''}`}
                            onClick={() => setViewMode('territory')}
                        >
                            Territory
                        </button>
                        <button 
                            className={`tab-btn ${viewMode === 'distance' ? 'active' : ''}`}
                            onClick={() => setViewMode('distance')}
                        >
                            Distance
                        </button>
                    </div>
                ) : (
                    <div className="map-tabs editor-mode-tabs">
                        <button 
                            className={`tab-btn ${paintingMode === 'MAP' ? 'active' : ''}`}
                            onClick={() => {
                                setPaintingMode('MAP');
                                controller.setActivePainting("MAP")
                            }}
                        >
                            Terrain
                        </button>
                        <button 
                            className={`tab-btn ${paintingMode === 'RESOURCE' ? 'active' : ''}`}
                            onClick={() => {
                                setPaintingMode('RESOURCE');
                                controller.setActivePainting("RESOURCE");
                            }}
                        >
                            Resource
                        </button>
                    </div>
                )}

                {/* <div className="map-tabs simulation-mode-tabs">
                    <button 
                        className={`tab-btn ${viewMode === 'territory' ? 'active' : ''}`}
                        onClick={() => setViewMode('territory')}
                    >
                        Territory
                    </button>
                    <button 
                        className={`tab-btn ${viewMode === 'distance' ? 'active' : ''}`}
                        onClick={() => setViewMode('distance')}
                    >
                        Distance
                    </button>
                </div> */}
            </div>

            <div className="map">
                {/* Terrain layer */}
                <div className="map-layer terrain-layer">
                    <MapLayer/>
                </div>

                {/* Ownership/distance layer */}
                {appMode === "SIMULATION" ?  
                    (viewMode === 'territory' ? (
                        <>
                        <div className="map-layer ownership-layer">
                            <MapOwnership mode={appMode}/>
                        </div>
                        {showResourcesMap && (
                            <div className="map-layer resource-layer">
                                <MapValue/>
                            </div> 
                        )}
                        </>
                    ) : (
                        <div className="map-layer distance-layer">
                            <MapDistance/>
                        </div>
                    )
                    ) : (
                        paintingMode === "MAP" ? (
                            <></>
                        ) : (
                            <div className="map-layer resource-layer">
                                <MapValue />
                            </div>
                            
                        )
                    )
                }

                <EventsLayer viewMode={viewMode} paintingMode={paintingMode}/>
            </div>
        </div>
    );
};

export default MapPanel;