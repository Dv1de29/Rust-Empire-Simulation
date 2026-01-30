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

// 2. Define the shape of your config object
interface SliderConfig {
    label: string;
    min: number;
    max: number;
}

// 3. Create the constant. 
// Using Record<SliderKey, SliderConfig> forces you to define every key.
export const SlidersSettings: Record<SliderKey, SliderConfig> = {
    water:    { label: "Water",    min: 0, max: 100 },
    river:    { label: "River",    min: 0, max: 100 },
    plain:    { label: "Plain",    min: 0, max: 100 },
    mountain: { label: "Mountain", min: 0, max: 100 },
    desert:   { label: "Desert",   min: 0, max: 100 },
    forest:   { label: "Forest",   min: 0, max: 100 },
    ice:      { label: "Ice",      min: 0, max: 100 },
    size:     { label: "Empire size", min: 100, max: 10000},
};

export interface EmpireConfig{
    id: number,
    name: string,
    color: string,
    settings: SettingsValue,
}