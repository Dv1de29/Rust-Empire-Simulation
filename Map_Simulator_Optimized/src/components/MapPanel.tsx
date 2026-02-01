import { useState } from 'react';
import MapLayer from "./MapLayer";
import MapOwnership from "./MapOwnership";
import MapDistance from './MapDistance';
import '../styles/MapPanel.css'; 

import { useSettingsSelector } from '../context/Context';

type MapViewMode = 'territory' | 'distance';

function MapPanel(){
    const isSystemReady = useSettingsSelector(state => state.isSystemReady);
    const isLoadingMap = useSettingsSelector(state => state.isLoadingMap);
    
    // State to toggle between views
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
                {/* Layer 1: Terrain is ALWAYS visible as the base */}
                <div className="map-layer terrain-layer">
                    <MapLayer/>
                </div>

                {/* Layer 2: Conditional Overlay */}
                {viewMode === 'territory' ? (
                    <div className="map-layer ownership-layer">
                        <MapOwnership/>
                    </div>
                ) : (
                    <div className="map-layer distance-layer">
                        <MapDistance/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPanel;