import React from 'react';
import '../styles/Slider.css';

interface SliderProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}

function Slider({ 
    label, 
    value, 
    min = 0, 
    max = 100, 
    step = 1,
    onChange 
}: SliderProps) {
    
    // Calculate percentage for the colorful "fill" effect background
    const getBackgroundSize = () => {
        return { backgroundSize: `${((value - min) * 100) / (max - min)}% 100%` };
    };

    return (
        <div className="slider-wrapper">
            <div className="slider-header">
                <label className="slider-label">{label}</label>
                <span className="slider-value">{value}</span>
            </div>
            <input 
                type="range" 
                className="slider-input"
                min={min}
                max={max}
                step={step}
                value={value}
                style={getBackgroundSize()}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}

export default Slider;