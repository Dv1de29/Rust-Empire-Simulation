import MapPanel from "../components/MapPanel";
import SettingsPanel from "../components/SettingsPanel";

import '../styles/GamePage.css'


function GamePage(){
    return (
        <>
            <div className="game-page">
                <aside className="settings-aside">
                    <SettingsPanel />
                </aside>
                <aside className="map-aside">
                    <MapPanel />
                </aside>
            </div>
        </>
    )
}

export default GamePage;