import { useSettingsController, useSettingsSelector } from "../../context/Context";
import Slider from "../Slider";
import '../../styles/SettingsPanel.css';
import { TERRAIN_CONFIG, RESOURCE_CONFIG, type TerrainKey, get_activeInfo_terrain, get_activeInfo_resource } from "../../types/types";
import SelectType from "../SelectType";



const MAX_MAP_SIZE = 4000000;


function SettingsEditor() {
    const controller = useSettingsController();

    const selectedTerrain = useSettingsSelector(state => state.activeTerrain) as TerrainKey;
    const selectedResource = useSettingsSelector(state => state.activeResource);
    const brushRadius = useSettingsSelector(state => state.activeRadius);
    const {map_width, map_height} = useSettingsSelector(state => state.EditorMapSize);

    const paintingMode = useSettingsSelector(state => state.activePainting);

    // Get current color info, fallback to water if something is wrong
    const activeInfo = paintingMode === "MAP" ? get_activeInfo_terrain(selectedTerrain) : get_activeInfo_resource(selectedResource);

    return (
        <>
            <div className="header-info">
                <span>Map Size:</span>
            </div>

            <div className="sliders">
                <Slider
                    label="Width size"
                    min={1}
                    max={Math.sqrt(MAX_MAP_SIZE)}
                    value={map_width}
                    onChange={(newValue) => controller.setEditorMapSize(newValue, map_height)}
                />
            </div>

            <div className="sliders">
                <Slider
                    label="Height size"
                    min={1}
                    max={Math.sqrt(MAX_MAP_SIZE)}
                    value={map_height}
                    onChange={(newValue) => controller.setEditorMapSize(map_width, newValue)}
                />
            </div>

            <div className="actions" style={{ marginTop: '10px', marginBottom: '20px' }}>
                <button 
                    className="add-btn"
                    style={{ width: '100%' }}
                    onClick={() => controller.initializeEditorWorld(map_width, map_height)}
                >
                    Create New Map
                </button>
            </div>


            <div className="header-info">
                <span>Editor Tools:</span>
            </div>

            {/* Terrain Selection Dropdown */}
            <div className="map-selection" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Terrain:</label>
                    
                    {/* Small Color Preview Dot (Next to label) */}
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: activeInfo.color,
                        border: '1px solid #fff',
                        transition: 'background-color 0.2s'
                    }} />
                </div>
                
                {paintingMode === "MAP" ? (
                    <SelectType 
                        id="terrain-select"
                        selectedType={selectedTerrain}
                        setFunction={(new_value: string) => {controller.setActiveTerraiType(new_value)}}
                        Configuration={TERRAIN_CONFIG}
                    />
                ) : (
                    <SelectType 
                        id="value-select"
                        selectedType={selectedResource}
                        setFunction={(new_value: string) => {controller.setActiveResourceType(new_value)}}
                        Configuration={RESOURCE_CONFIG}
                    />
                )}

            </div>

            <hr style={{ borderColor: '#444', margin: '15px 0' }} />

            {/* Brush Radius Slider */}
            <div className="sliders">
                <Slider 
                    label="Brush Radius"
                    min={1}
                    max={50}
                    value={brushRadius}
                    onChange={(newValue) => controller.setActiveRadius(newValue)}
                />
            </div>

            {/* Visualizer for brush size */}
            <div style={{ 
                marginTop: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px',
                background: '#1e1e1e',
                borderRadius: '8px',
                overflow: 'hidden' // prevents massive brushes from breaking layout
            }}>
                <span style={{ fontSize: '0.8rem', color: '#777', marginBottom: '10px' }}>Brush Preview</span>
                
                <div style={{
                    width: `${brushRadius * 2}px`, // diameter
                    height: `${brushRadius * 2}px`,
                    backgroundColor: activeInfo.color,
                    borderRadius: '50%',
                    transition: 'all 0.1s ease-out',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }} />
            </div>

            <div className="actions" style={{ marginTop: '10px', marginBottom: '20px' }}>
                <button 
                    className="add-btn"
                    style={{ width: '100%' }}
                    onClick={() => {
                        if ( paintingMode === "MAP"){
                            controller.exportTerrainFile();
                        } else {
                            controller.exportResourceFile();
                        }
                    }}
                >
                    {`Export ${paintingMode === "MAP" ? "map" : "resource"} file`}
                </button>
            </div>
        </>
    );
}

export default SettingsEditor;