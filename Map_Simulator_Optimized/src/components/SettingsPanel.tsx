import { useSettingsSelector } from "../context/Context";
import SettingsEditor from "./SettingsLayers/SettingsEditor";
import SettingsSimulation from "./SettingsLayers/SettingsSimulation";


function SettingsPanel(){
    // const controller = useSettingsController();
  
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