import { useSettingsController, useSettingsSelector } from "../context/Context";
import type { SettingsValue, SliderKey } from "../types/types";
import { SlidersSettings } from "../types/types";
import Slider from "./Slider";
import '../styles/SettingsPanel.css';
import ColorInput from "./ColorInput";
import { useEffect, useRef } from "react";


function SettingsPanel(){

    const draftEmpires = useSettingsSelector((state) => state.draftEmpires);
    const activeEmpireId = useSettingsSelector((state) => state.activeEmpireId);
    const activeMap = useSettingsSelector(state => state.activeMap);

    const controller = useSettingsController();

    const activeEmpire = draftEmpires.find(emp => emp.id === activeEmpireId);
    const colorRef = useRef<string>(activeEmpire?.color);

    useEffect(() => {
        if ( activeEmpire ){
            colorRef.current = activeEmpire.color;
        }
    }, [activeEmpireId, activeEmpire])

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
                    <option value="sout_america">sout_america</option>
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
            <div className="empires-label">Empires:</div>
            <div className="empires">
                {draftEmpires.map(emp => (
                    <div 
                        key={emp.id} 
                        // Apply 'active' class if this is the currently selected empire
                        className={`empire-wrapper ${emp.id === activeEmpireId ? 'active' : ''}`}
                        onClick={() => controller.setActiveEmpireId(emp.id)}
                    >
                        <span>{emp.name}</span>
                    </div>
                ))}
            </div>

            {/* Add empire button  */}
            <div className="actions">
                <button
                className="add-btn"
                    onClick={handleAddEmpire}
                >
                    Add Empire
                </button>
                <button
                    className="del-btn"
                    onClick={handleDeleteEmpire}
                >
                    Delete Empire
                </button>
            </div>

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
        </>
    )
}

export default SettingsPanel;