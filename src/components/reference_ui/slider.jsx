import React, { useState } from 'react';

export const Slider = ({
    value = [0, 100],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    className = ''
}) => {
    const [sliderValue, setSliderValue] = useState(value);

    const handleMinChange = (e) => {
        const newMin = parseInt(e.target.value);
        const newValue = [Math.min(newMin, sliderValue[1]), sliderValue[1]];
        setSliderValue(newValue);
        onValueChange?.(newValue);
    };

    const handleMaxChange = (e) => {
        const newMax = parseInt(e.target.value);
        const newValue = [sliderValue[0], Math.max(newMax, sliderValue[0])];
        setSliderValue(newValue);
        onValueChange?.(newValue);
    };

    return (
        <div className={`relative flex w-full touch-none select-none items-center ${className}`}>
            <div className="relative w-full">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={sliderValue[0]}
                    onChange={handleMinChange}
                    className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-10"
                    style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        background: 'transparent'
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={sliderValue[1]}
                    onChange={handleMaxChange}
                    className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-20"
                    style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        background: 'transparent'
                    }}
                />
                <div className="absolute w-full h-2 bg-gray-200 rounded-lg">
                    <div
                        className="absolute h-full bg-gray-900 rounded-lg"
                        style={{
                            left: `${((sliderValue[0] - min) / (max - min)) * 100}%`,
                            width: `${((sliderValue[1] - sliderValue[0]) / (max - min)) * 100}%`
                        }}
                    />
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #374151;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                input[type="range"]::-moz-range-thumb {
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #374151;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                input[type="range"]::-webkit-slider-track {
                    background: transparent;
                }
                input[type="range"]::-moz-range-track {
                    background: transparent;
                }
                `
            }} />
        </div>
    );
};