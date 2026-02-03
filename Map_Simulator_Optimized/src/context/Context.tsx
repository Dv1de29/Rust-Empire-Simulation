
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";


import type { EmpireConfig, SettingsValue } from "../types/types";

import { STARTING_EMPIRES, INITIAL_SETTINGS } from "../assets/initials";



//// from rust

import init, { initThreadPool, World } from "rust_simulator";

// Go up: components -> src -> react_app -> root -> rust_simulator -> pkg
// (Adjust the number of "../" based on your exact folder depth)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from "../../../rust_simulator/pkg/rust_simulator_bg.wasm?url";

import { drawOwnershipLayer, fetchMap, hexToColorInt } from "../assets/utils";





interface SettingsState{
    draftEmpires: EmpireConfig[],
    commitEmpires: EmpireConfig[],
    activeEmpireId: number,
    activeMap: string,

    isLoadingMap: boolean,
    isSystemReady: boolean;
    ownershipRev: number,
}


class SettingsStore{
    private state: SettingsState;
    private listeners: Set<() => void>;

    public world: World | null = null;
    public memory: WebAssembly.Memory | null = null;

    private isBooting = false;
    

    constructor(initialEmpires: EmpireConfig[] = STARTING_EMPIRES){
        this.state = {
            draftEmpires: initialEmpires,
            commitEmpires: initialEmpires,
            activeEmpireId: 1,
            activeMap: "world",
            isLoadingMap: false,
            isSystemReady: false,
            ownershipRev: 0,
        };
        this.listeners = new Set();
    }

    async bootSystem(){
        if ( this.state.isSystemReady ) return;

        if (this.isBooting) return;
        this.isBooting = true;

        try{
            const wasm = await init(wasmUrl)

            try{
                await initThreadPool(navigator.hardwareConcurrency);
            } catch(e){
                console.warn("Thread pool already active:", e);
            }

            this.memory = wasm.memory;

            await this.loadMapInternal(this.state.activeMap);

            this.state = {...this.state, isSystemReady: true };
            this.emitChange();

        }catch(e){
            console.error("Failed to boot WASM", e);

            this.isBooting = false;
        }
    }

    private async loadMapInternal(mapName: string){
        this.state = {...this.state, isLoadingMap: true};
        this.emitChange();

        try{
            const mapData = await fetchMap(mapName);
            if ( !mapData) throw new Error("Couldn't load the mapData");

            this.world = World.new(mapData);
        } catch(e){
            console.warn("Error loading the mapData: ", e);
        } finally{
            this.state = {...this.state, isLoadingMap: false};
            this.emitChange();
        }
    }
    
    updateDraftsettings = (empireId: number, key: keyof SettingsValue, value: number) => {
        console.log(`Updating key ${key}, wiht value ${value} of empire ${empireId}`);
        const newDrafts = this.state.draftEmpires.map(emp => {
            if ( emp.id === empireId ){
                return{
                    ...emp,
                    settings: {
                        ...emp.settings,
                        [key]: value
                    }
                };
            }
            return emp;
        });

        this.state = {...this.state, draftEmpires: newDrafts};
        this.emitChange();
    }


    updateEmpireName(empireId: number, name: string){
        const newDrafts = this.state.draftEmpires.map(emp => {
            if ( emp.id === empireId ){
                return {
                    ...emp,
                    name: name,
                }
            }
            return emp;
        })
        this.state = { ...this.state, draftEmpires: newDrafts };
        this.emitChange();
    }

    updateEmpireColor(empireId: number, color: string){
        const newDrafts = this.state.draftEmpires.map(emp => {
            return emp.id === empireId ? { ...emp, color } : emp;
        })
        
        if ( this.world ){
            const colorInt = hexToColorInt(color);
            this.world.set_empire_color(empireId, colorInt);
        }
        
        this.state = { ...this.state, draftEmpires: newDrafts, ownershipRev: this.state.ownershipRev + 1 };
        this.emitChange();
    }

    setActiveEmpireId(id: number){
        this.state = { ...this.state, activeEmpireId: id };
        this.emitChange();
    }

    setActiveMap(map: string){
        const newDrafts = this.state.draftEmpires.map(emp => {
            return {
                ...emp,
                alreadyPlaced: false,
            }
        })
        this.state = { ...this.state, activeMap: map };
        this.emitChange();

        this.loadMapInternal(map);
    }
    
    addEmpire(defaultSettings: SettingsValue = INITIAL_SETTINGS){
        const newId = this.state.draftEmpires.length > 0 ?
        Math.max(...this.state.draftEmpires.map(e => e.id)) + 1 : 1;
        
        const newColor = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
        
        const newEmpire: EmpireConfig = {
            id: newId,
            name: `Empire ${newId}`,
            color: newColor,
            alreadyPlaced: false,
            capital: null,
            settings: defaultSettings,
        }
        
        const newEmpires = [...this.state.draftEmpires, newEmpire];
        
        this.state = { ...this.state, draftEmpires: newEmpires, activeEmpireId: newId}
        this.emitChange();
    }
    
    deleteEmpire(id: number){
        const newDrafts = this.state.draftEmpires.filter(emp => emp.id !== id);

        this.world?.delete_empire(id)

        this.state = {...this.state, draftEmpires: newDrafts, activeEmpireId: newDrafts[0].id, ownershipRev: this.state.ownershipRev + 1};
        this.emitChange();
    }

    /// placing an empire does an auto-commit
    placeEmpire(empireId: number, x: number, y: number){
        const newDrafts = this.state.draftEmpires.map(emp => emp.id === empireId ? {
            ...emp,
            alreadyPlaced: true,
            capital: {x: x, y: y},
        } : emp)

        this.state = {...this.state, commitEmpires: newDrafts, draftEmpires: newDrafts};
        this.emitChange();
    }
    
    commitSettings(){
        this.state = {
            ...this.state,
            commitEmpires: this.state.draftEmpires,
        }

        this.emitChange();
    }

    resetDrafts(){
        this.state = {
            ...this.state,
            draftEmpires: this.state.commitEmpires,
        }

        this.emitChange();
    }

    
    


    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        }
    }

    getSnapshot = () => {
        return this.state;
    }
    
    private emitChange = () => {
        this.listeners.forEach(l => l());
    }
}


const Context = createContext<SettingsStore | null>(null);

export const SettingsProvider = ({
    children,
    initialEmpires,
}: {
    children: React.ReactNode,
    initialEmpires: EmpireConfig[],
}) => {
    const [store] = useState(() => new SettingsStore(initialEmpires));

    useEffect(() => {
        store.bootSystem();
    }, [store]);

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    )
}



export function useSettingsSelector<T>(selector: (state: SettingsState) => T): T{
    const store = useContext(Context);

    if (!store) throw new Error("You must use this inside a SettingsProvider")

    return useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()));
}


export function useSettingsController() {
    const store = useContext(Context);
    if (!store) throw new Error("You must use this inside a SettingsProvider")
    
    return store;
}