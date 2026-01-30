import { useState, type ChangeEvent } from "react";


function ColorInput({draft_color, onColorChange} : {draft_color: string, onColorChange: (color: string) => void}){
    const [color, setColor] = useState<string>(draft_color);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;

        setColor(color);
        onColorChange(color);
    }

    return (
        <>
            <input 
                type="color" 
                name="color-input" 
                id="color-input" 
                value={color}
                onChange={handleChange}
            />
        </>
    )
}

export default ColorInput;