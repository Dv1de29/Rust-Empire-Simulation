export interface SettingsValue{
    water : number,
    river : number,
    plain : number,
    mountain : number,
    desert : number,
    forest : number,
    ice : number,
    size: number,
}

export type SliderKey = keyof SettingsValue 

export type TerrainKey = 'water' | 'river' | 'plain' | 'mountain' | 'desert' | 'forest' | 'ice';


export type ConfigItem = {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; 
}
export type CONFIG_TYPES = Record<string, ConfigItem> 


export const TERRAIN_CONFIG: CONFIG_TYPES = {
    // Rust: 0xFFDB9538 (A:FF B:DB G:95 R:38) -> CSS: #3895DB
    water:    { name: 'Water', code: "W",    color: '#3895DB' }, 
    
    // Rust: 0xFFE0C040 (A:FF B:E0 G:C0 R:40) -> CSS: #40C0E0
    river:    { name: 'River', code: "R",    color: '#40C0E0' }, 

    // Rust: 0xFF408035 (A:FF B:40 G:80 R:35) -> CSS: #358040
    plain:    { name: 'Plain', code: "P",    color: '#358040' }, 

    // Rust: 0xFF606060 (A:FF B:60 G:60 R:60) -> CSS: #606060
    mountain: { name: 'Mountain', code: "M", color: '#606060' }, 

    // Rust: 0xFF60C0F0 (A:FF B:60 G:C0 R:F0) -> CSS: #F0C060
    desert:   { name: 'Desert', code: "D",   color: '#F0C060' }, 

    // Rust: 0xFF225510 (A:FF B:22 G:55 R:10) -> CSS: #105522
    forest:   { name: 'Forest', code: "F",   color: '#105522' }, 

    // Rust: 0xFFFAFAFA (A:FF B:FA G:FA R:FA) -> CSS: #FAFAFA
    ice:      { name: 'Ice', code: "I",      color: '#FAFAFA' }, 
};

export const RESOURCE_CONFIG: CONFIG_TYPES = {
    // --- Precious Metals (Wealth) ---
    gold:   { name: 'Gold', code: "g",   color: '#FFD700', value: 100 }, // Gold
    silver: { name: 'Silver', code: "s", color: '#C0C0C0', value: 70  }, // Silver
    gems:   { name: 'Gems', code: "*",   color: '#DA70D6', value: 150 }, // Orchid/Purple

    // --- Strategic/Industrial ---
    coal:   { name: 'Coal', code: "c",   color: '#2F4F4F', value: 70  }, // Dark Slate Grey

    // --- Food (Sustenance) ---
    cows:   { name: 'Cows', code: "C",   color: '#A0522D', value: 30  }, // Sienna Brown
    wheat:  { name: 'Wheat', code: "w",  color: '#F5DEB3', value: 20  }, // Wheat/Tan
    fish:   { name: 'Fish', code: "f",   color: '#AFEEEE', value: 25  }, // Pale Turquoise (Visible on water)

    // --- Luxury Goods (Happiness) ---
    silk:   { name: 'Silk', code: "S",   color: '#FF69B4', value: 80  }, // Hot Pink
    spices: { name: 'Spices', code: "!", color: '#D2691E', value: 90  }, // Chocolate/Orange
    wine:   { name: 'Wine', code: "v",   color: '#800000', value: 40  }, // Maroon
};

export const DEFAULT_RESOURCE = 'W';

export const get_activeInfo_terrain = (activeTerrain: string) => {
    switch (activeTerrain){
        case "W": return TERRAIN_CONFIG['water'];
        case "R": return TERRAIN_CONFIG['river'];
        case "P": return TERRAIN_CONFIG['plain'];
        case "M": return TERRAIN_CONFIG['mountain'];
        case "D": return TERRAIN_CONFIG['desert'];
        case "F": return TERRAIN_CONFIG['forest'];
        case "I": return TERRAIN_CONFIG['ice'];
        default: return TERRAIN_CONFIG['plain']; // Safe fallback
    }
}

export const get_activeInfo_resource = (activeResource: string) => {
    switch (activeResource){
        // Precious Metals
        case "g": return RESOURCE_CONFIG['gold'];
        case "s": return RESOURCE_CONFIG['silver'];
        case "*": return RESOURCE_CONFIG['gems'];

        // Strategic
        case "c": return RESOURCE_CONFIG['coal'];

        // Food
        case "C": return RESOURCE_CONFIG['cows'];
        case "w": return RESOURCE_CONFIG['wheat'];
        case "f": return RESOURCE_CONFIG['fish'];

        // Luxury
        case "S": return RESOURCE_CONFIG['silk'];
        case "!": return RESOURCE_CONFIG['spices'];
        case "v": return RESOURCE_CONFIG['wine'];

        default: return RESOURCE_CONFIG['gold']; // Safe fallback
    }
}



interface SliderConfig {
    label: string;
    min: number;
    max: number;
}


export const SlidersSettings: Record<SliderKey, SliderConfig> = {
    water:    { label: "Water",    min: 1, max: 100 },
    river:    { label: "River",    min: 1, max: 100 },
    plain:    { label: "Plain",    min: 1, max: 100 },
    mountain: { label: "Mountain", min: 1, max: 100 },
    desert:   { label: "Desert",   min: 1, max: 100 },
    forest:   { label: "Forest",   min: 1, max: 100 },
    ice:      { label: "Ice",      min: 1, max: 100 },
    size:     { label: "Empire size", min: 100, max: 10000},
};

export interface EmpireConfig{
    id: number,
    name: string,
    color: string,
    alreadyPlaced: boolean,
    capital: {x: number, y: number} | null,
    settings: SettingsValue,
}