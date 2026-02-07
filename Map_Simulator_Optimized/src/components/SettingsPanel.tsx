import { useSettingsController, useSettingsSelector } from "../context/Context";
import SettingsEditor from "./SettingsEditor";
import SettingsSimulation from "./SettingsLayers/SettingsSimulation";


function SettingsPanel(){
    const controller = useSettingsController();
  
    const activeMode = useSettingsSelector(state => state.activeMode);

    return(
        <>
            {activeMode === 'SIMULATION' ? (
                <SettingsSimulation />
            ) : (
                <SettingsEditor />
            )}
        </>
    )
}

export default SettingsPanel;