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

export const TERRAIN_CONFIG: Record<TerrainKey, { name: string; color: string }> = {
    // Rust: 0xFFDB9538 (A:FF B:DB G:95 R:38) -> CSS: #3895DB
    water:    { name: 'Water',    color: '#3895DB' }, 
    
    // Rust: 0xFFE0C040 (A:FF B:E0 G:C0 R:40) -> CSS: #40C0E0
    river:    { name: 'River',    color: '#40C0E0' }, 

    // Rust: 0xFF408035 (A:FF B:40 G:80 R:35) -> CSS: #358040
    plain:    { name: 'Plain',    color: '#358040' }, 

    // Rust: 0xFF606060 (A:FF B:60 G:60 R:60) -> CSS: #606060
    mountain: { name: 'Mountain', color: '#606060' }, 

    // Rust: 0xFF60C0F0 (A:FF B:60 G:C0 R:F0) -> CSS: #F0C060
    desert:   { name: 'Desert',   color: '#F0C060' }, 

    // Rust: 0xFF225510 (A:FF B:22 G:55 R:10) -> CSS: #105522
    forest:   { name: 'Forest',   color: '#105522' }, 

    // Rust: 0xFFFAFAFA (A:FF B:FA G:FA R:FA) -> CSS: #FAFAFA
    ice:      { name: 'Ice',      color: '#FAFAFA' }, 
};



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