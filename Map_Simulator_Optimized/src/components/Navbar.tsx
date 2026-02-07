
import '../styles/NavBar.css'
import { useSettingsController, useSettingsSelector } from '../context/Context';

function NavBar() {
    const activeMode = useSettingsSelector(state => state.activeMode);

    const controller = useSettingsController();

    return (
        <nav className="navbar">
            <div className="logo">
                MapSim
            </div>

            {/* Navigation Links */}
            <div className={`nav-links`}>
                <div 
                    className={`modes ${activeMode === 'SIMULATION' ? 'active' : ""}`} 
                    onClick={() => {controller.setActiveMode('SIMULATION')}}
                >Map</div>
                <div 
                    className={`modes ${activeMode === 'EDITOR' ? 'active' : ""}`}
                    onClick={() => {controller.setActiveMode('EDITOR')}}
                >Editor</div>
            </div>
        </nav>
    );
}

export default NavBar;