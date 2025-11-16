import React, { useState, createContext, useContext } from 'react';

const RadioGroupContext = createContext();

export const RadioGroup = ({ children, value, onValueChange, defaultValue, className = '' }) => {
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');

    const handleValueChange = (newValue) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
    };

    return (
        <RadioGroupContext.Provider value={{ selectedValue, setSelectedValue: handleValueChange }}>
            <div className={`grid gap-2 ${className}`} role="radiogroup">
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
};

export const RadioGroupItem = ({ children, value, id, className = '' }) => {
    const { selectedValue, setSelectedValue } = useContext(RadioGroupContext);
    const isSelected = selectedValue === value;
    const itemId = id || `radio-${value}`;

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <input
                type="radio"
                id={itemId}
                checked={isSelected}
                onChange={() => setSelectedValue(value)}
                className="h-4 w-4 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-500"
                value={value}
            />
            {children && (
                <label
                    htmlFor={itemId}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {children}
                </label>
            )}
        </div>
    );
};