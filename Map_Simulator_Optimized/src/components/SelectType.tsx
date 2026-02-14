/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CONFIG_TYPES, ConfigItem } from "../types/types"

interface SelectTypeProps{
    id?: string,
    selectedType: string,
    setFunction: (new_value: string) => void,
    Configuration: Record<string, ConfigItem>,
}




//////  addddddddd to the configurations a key: value
////// for the useEditorInputs to have the KEY of the terrain/resource

function SelectType(
    {id = "generic-select", selectedType, setFunction, Configuration} : SelectTypeProps
){
    return (
        <select 
            name="terrain-select" 
            id={id}
            value={selectedType}
            onChange={(e) => setFunction(e.target.value)}
            style={{ 
                width: '100%', 
                padding: '8px', 
                background: '#333', 
                color: 'white', 
                border: '1px solid #555', 
                borderRadius: '4px' 
            }}
        >
            {Object.entries(Configuration).map(([key, config]) => (
                <option key={key} value={config.code}>
                    {config.name}
                </option>
            ))}
        </select>
    )
}

export default SelectType;