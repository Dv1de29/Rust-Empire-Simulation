
import { createContext, useContext, useState, useSyncExternalStore } from "react";


import type { EmpireConfig, SettingsValue } from "../types/types";

import { STARTING_EMPIRES, INITIAL_SETTINGS } from "../assets/initials";



interface SettingsState{
    draftEmpires: EmpireConfig[],
    commitEmpires: EmpireConfig[],
    activeEmpireId: number,
    activeMap: string,
}


class SettingsStore{
    private state: SettingsState;
    private listeners: Set<() => void>;
    

    constructor(initialEmpires: EmpireConfig[] = STARTING_EMPIRES){
        this.state = {
            draftEmpires: initialEmpires,
            commitEmpires: initialEmpires,
            activeEmpireId: 1,
            activeMap: "world"
        };
        this.listeners = new Set();
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
            if ( emp.id === empireId ){
                return {
                    ...emp,
                    color: color,
                }
            }
            return emp;
        })
        this.state = { ...this.state, draftEmpires: newDrafts };
        this.emitChange();
    }

    setActiveEmpireId(id: number){
        this.state = { ...this.state, activeEmpireId: id };
        this.emitChange();
    }

    setActiveMap(map: string){
        this.state = { ...this.state, activeMap: map };
        this.emitChange();
    }
    
    addEmpire(defaultSettings: SettingsValue = INITIAL_SETTINGS){
        const newId = this.state.draftEmpires.length > 0 ?
        Math.max(...this.state.draftEmpires.map(e => e.id)) + 1 : 1;
        
        const newColor = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
        
        const newEmpire: EmpireConfig = {
            id: newId,
            name: `Empire ${newId}`,
            color: newColor,
            settings: defaultSettings,
        }
        
        const newEmpires = [...this.state.draftEmpires, newEmpire];
        
        this.state = { ...this.state, draftEmpires: newEmpires, activeEmpireId: newId}
        this.emitChange();
    }
    
    deleteEmpire(id: number){
        const newDrafts = this.state.draftEmpires.filter(emp => emp.id !== id);
        this.state = {...this.state, draftEmpires: newDrafts, activeEmpireId: newDrafts[0].id};
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