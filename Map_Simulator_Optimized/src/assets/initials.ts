import type { EmpireConfig, SettingsValue } from "../types/types";

export const INITIAL_SETTINGS: SettingsValue = {
    plain: 15,    
    forest: 20,
    river: 10,     

    desert: 60,   

    water: 25,     
    
    mountain: 80,  

    ice: 100,   

    size: 100,
};


export const STARTING_EMPIRES: EmpireConfig[] = [
  {
    id: 1,
    name: "Empire 1",
    color: "#FF5733",
    alreadyPlaced: false,
    capital: null,
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