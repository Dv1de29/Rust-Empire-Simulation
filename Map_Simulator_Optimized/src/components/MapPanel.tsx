import { useState } from 'react';
import MapLayer from "./MapLayers/MapLayer";
import MapOwnership from "./MapLayers/MapOwnership";
import MapDistance from './MapLayers/MapDistance';
import '../styles/MapPanel.css'; 

import { useSettingsSelector } from '../context/Context';
import EventsLayer from './MapLayers/EventsLayer';

type MapViewMode = 'territory' | 'distance';

function MapPanel(){
    const isSystemReady = useSettingsSelector(state => state.isSystemReady);
    const isLoadingMap = useSettingsSelector(state => state.isLoadingMap);
    
    const appMode = useSettingsSelector(state => state.activeMode);

    const [viewMode, setViewMode] = useState<MapViewMode>('territory');

    if (!isSystemReady || isLoadingMap) return <div>Loading....</div>;

    return (
        <div className="map_container">
            <div className="map_header">
                <h3>Map View</h3>
                
                {/* --- TABS --- */}
                <div className="map-tabs">
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
            </div>

            <div className="map">
                {/* Terrain layer */}
                <div className="map-layer terrain-layer">
                    <MapLayer/>
                </div>

                {/* Ownership/distance layer */}
                {viewMode === 'territory' ? (
                    <div className="map-layer ownership-layer">
                        <MapOwnership mode={appMode}/>
                    </div>
                ) : (
                    <div className="map-layer distance-layer">
                        <MapDistance/>
                    </div>
                )}

                <EventsLayer viewMode={viewMode}/>
            </div>
        </div>
    );
};

export default MapPanel;