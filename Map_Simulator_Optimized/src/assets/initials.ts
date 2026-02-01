import type { EmpireConfig, SettingsValue } from "../types/types";

export const INITIAL_SETTINGS: SettingsValue = {
    // --- The Easy Stuff ---
    plain: 15,     // Your baseline speed.
    forest: 20,    // Slight slowdown, but fine.
    river: 10,     

    // --- The Moderate Barriers ---
    desert: 60,    // Unpleasant, but traversable.
    
    // --- The Hard Barriers ---
    // Water is now CHEAPER than Mountains to "be inside", 
    // but the Transition Penalty (3x) makes ENTERING it hard.
    water: 25,     
    
    // Mountains are hard to move through continually.
    mountain: 80,  

    // --- The Wasteland ---
    ice: 100,       // Only for desperate expansion.

    size: 2000,
};


export const STARTING_EMPIRES: EmpireConfig[] = [
  {
    id: 1,
    name: "Empire 1",
    color: "#FF5733",
    alreadyPlaced: false,
    settings: INITIAL_SETTINGS,
  }
];





// export const INITIAL_SETTINGS: SettingsValue = {
//     water: 50,
//     river: 20,
//     plain: 30,
//     mountain: 10,
//     desert: 5,
//     forest: 40,
//     ice: 10,
//     size: 100,
// }