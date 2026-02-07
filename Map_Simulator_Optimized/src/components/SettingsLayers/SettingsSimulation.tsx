import { useSettingsController, useSettingsSelector } from "../../context/Context";
import type { SettingsValue, SliderKey } from "../../types/types";
import { SlidersSettings } from "../../types/types";
import Slider from "../Slider";
import '../../styles/SettingsPanel.css';
import ColorInput from "../ColorInput";
import { useEffect, useRef, useState } from "react";


function SettingsSimulation(){
    const [isListCollapsed, setIsListCollapsed] = useState<boolean>(false);

    const [growAmount, setGrowAmount] = useState<number>(100);
    // 2. New State to track if loop is active (Ref doesn't trigger re-render)
    const [isGrowing, setIsGrowing] = useState<boolean>(false);
    
    const draftEmpires = useSettingsSelector((state) => state.draftEmpires);
    const activeEmpireId = useSettingsSelector((state) => state.activeEmpireId);
    const activeMap = useSettingsSelector(state => state.activeMap);
    
    const controller = useSettingsController();
    
    const activeEmpire = draftEmpires.find(emp => emp.id === activeEmpireId);
    
    const colorRef = useRef<string>(activeEmpire?.color);
    const intervalRef = useRef<number | null>(null);
    

    ///useEffect that changes the colorRef on empire change
    useEffect(() => {
        if ( activeEmpire ){
            colorRef.current = activeEmpire.color;
        }
    }, [activeEmpireId, activeEmpire])
    
    /////clean-up useEffect for the interval if it exists
    useEffect(() => {
        return () => {
            if ( intervalRef.current ){
                clearInterval(intervalRef.current);
            }
        }
    }, []);



    // Guard clause: if no empire is selected, we still might want to show the list, 
    // but for now we keep your logic or just render the list if activeEmpire is null.
    // Assuming we want to always show the panel structure:
    if ( !activeEmpire ) return <div className="settings-panel">No active Empire</div>


    const settings = activeEmpire.settings;

    const handleAddEmpire = () => {
        controller.addEmpire()
    }

    const handleDeleteEmpire = () => {
        if ( draftEmpires.length === 1 ){
            alert("You need to have at least 1 empire every time");
            return;
        }

        controller.deleteEmpire(activeEmpireId);
    }

    // draftEmpires.map(emp => {
    //     console.log(emp.id)
    // })
    // console.log(`Empire active: ${activeEmpireId}`)

    const handleCommitSave = () => {
        if ( colorRef.current ){    
            controller.updateEmpireColor(activeEmpireId, colorRef.current)
        }
        controller.commitSettings();
    }

    const handleAutoGrow = () => {
        if ( intervalRef.current ) return;

        setIsGrowing(true);

        //make this with an input
        const grow_value = growAmount;

        controller.triggerAutoGrow(grow_value);

        intervalRef.current = window.setInterval(() => {
            controller.triggerAutoGrow(grow_value);
        }, 1000);
    }

    const handleStopGrow = () => {
        if ( intervalRef.current ){
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsGrowing(false);
        }
    }


    return (
        <>
            <div className="header-info">
                <span>Settings panel:</span>
            </div>

            <div className="map-selection">
                <select 
                    name="map-select" 
                    id="map-select"
                    value={activeMap}
                    onChange={(newValue) => {controller.setActiveMap(newValue.target.value)}}
                >
                    <option value="world">World</option>
                    <option value="africa">Africa</option>
                    <option value="east_asia">east_asia</option>
                    <option value="europe">europe</option>
                    <option value="middle_east">middle_east</option>
                    <option value="south_america">south_america</option>
                    <option value="west_mediteranean">west_mediteranean</option>
                    <option value="scandinavia">scandinavia</option>
                </select>
            </div>

            {/* Sliders Section */}
            <div className="sliders">
                {Object.entries(SlidersSettings).map(([key, config]) => {
                    const settingKey = key as SliderKey;
                    return (
                        <Slider
                            key={settingKey}
                            label={config.label}
                            min={config.min}
                            max={config.max}
                            value={settings[settingKey]}
                            onChange={(newValue) => controller.updateDraftsettings(activeEmpireId, settingKey, newValue)}
                        />
                    )
                })}
            </div>

            <div className="color-choice">
                <ColorInput
                    key={activeEmpireId}
                    draft_color={activeEmpire.color}
                    onColorChange={(newColor) => {colorRef.current = newColor;}}
                />
            </div>

            {/* Empire List Section */}
            {/* --- COLLAPSIBLE HEADER --- */}
            <div 
                className="empires-header" 
                onClick={() => setIsListCollapsed(!isListCollapsed)}
            >
                <span className="label-text">Empires:</span>
                
                {/* Arrow Icon: Rotates based on state */}
                <span className={`arrow-icon ${isListCollapsed ? 'collapsed' : ''}`}>
                    ▼
                </span>
            </div>

            {/* --- COLLAPSIBLE CONTENT --- */}
            {!isListCollapsed && (
                <div className="collapsible-content">
                    <div className="empires">
                        {draftEmpires.map(emp => (
                            <div 
                                key={emp.id} 
                                className={`empire-wrapper ${emp.id === activeEmpireId ? 'active' : ''}`}
                                onClick={() => controller.setActiveEmpireId(emp.id)}
                            >
                                <div style={{width: 10, height: 10, background: emp.color, borderRadius: '50%', marginRight: 5}}></div>
                                <span>{emp.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Add/Delete Buttons belong inside the list logic */}
                    <div className="actions">
                        <button className="add-btn" onClick={handleAddEmpire}>
                            Add Empire
                        </button>
                        <button className="del-btn" onClick={handleDeleteEmpire}>
                            Delete Empire
                        </button>
                    </div>
                </div>
            )}

            {/* Commit Button */}
            <div className="actions">
                <button 
                    className="commit-btn"
                    onClick={() => {
                        handleCommitSave();
                    }}
                >
                    Commit Changes
                </button>
            </div>

                    

            <div style={{marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px'}}>
                
                {/* 1. The Input Field */}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '0 5px'}}>
                    <label style={{color: '#aaa', fontSize: '0.9rem'}}>Growth Amount:</label>
                    <input 
                        type="number" 
                        min={5} 
                        max={1000} 
                        value={growAmount}
                        onChange={(e) => {
                            // Clamp value between 5 and 1000
                            const val = Number(e.target.value);
                            setGrowAmount(Math.max(5, Math.min(1000, val)));
                        }}
                        style={{
                            width: '80px',
                            background: '#2a2a2a',
                            border: '1px solid #555',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                {/* 2. The Buttons */}
                <div className="actions">
                    <button
                        className="add-btn"
                        style={{
                            backgroundColor: isGrowing ? '#555' : '#4CAF50',
                            cursor: isGrowing ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleAutoGrow}
                        disabled={isGrowing}
                    >
                        {isGrowing ? 'Growing...' : `Auto Grow`}
                    </button>
                    
                    <button
                        className="del-btn"
                        onClick={handleStopGrow}
                        disabled={!isGrowing}
                        style={{
                            opacity: !isGrowing ? 0.5 : 1,
                            cursor: !isGrowing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Stop
                    </button>
                </div>
            </div>
        </>
    )
}

export default SettingsSimulation;