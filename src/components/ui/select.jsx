import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';

const SelectContext = createContext();

export const Select = ({ children, value, onValueChange, defaultValue }) => {
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    const [isOpen, setIsOpen] = useState(false);

    // Sync internal state with external value prop
    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    // Create a map of values to display text from SelectItem children
    const valueToTextMap = useMemo(() => {
        const map = {};

        const extractItems = (children) => {
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                    // Check by component name instead of type reference
                    if (child.type?.name === 'SelectContent' || (child.type && child.type.toString().includes('SelectContent'))) {
                        extractItems(child.props.children);
                    } else if (child.type?.name === 'SelectItem' || (child.type && child.type.toString().includes('SelectItem'))) {
                        map[child.props.value] = child.props.children;
                    } else if (child.props && child.props.children) {
                        extractItems(child.props.children);
                    }
                }
            });
        };

        extractItems(children);
        return map;
    }, [children]);

    const handleValueChange = (newValue) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
        setIsOpen(false);
    };

    return (
        <SelectContext.Provider value={{
            selectedValue,
            selectedText: valueToTextMap[selectedValue] || '',
            setSelectedValue: handleValueChange,
            isOpen,
            setIsOpen
        }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = ({ children, className = '' }) => {
    const { isOpen, setIsOpen } = useContext(SelectContext);

    return (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
        flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 
        rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500
        ${className}
      `}
        >
            {children}
        </button>
    );
};

export const SelectValue = ({ placeholder = 'Select...' }) => {
    const { selectedValue, selectedText } = useContext(SelectContext);

    // If we have selectedText, use it; otherwise fall back to selectedValue or placeholder
    const displayValue = selectedText || selectedValue || placeholder;
    const hasValue = selectedText || selectedValue;

    return (
        <span className={hasValue ? 'text-gray-900' : 'text-gray-500'}>
            {displayValue}
        </span>
    );
};

export const SelectContent = ({ children, className = '' }) => {
    const { isOpen, setIsOpen } = useContext(SelectContext);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
            />
            <div className={`
        absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg
        max-h-60 overflow-y-auto ${className}
      `}>
                {children}
            </div>
        </>
    );
};

export const SelectItem = ({ children, value, className = '' }) => {
    const { setSelectedValue, selectedValue } = useContext(SelectContext);

    const isSelected = selectedValue === value;

    const handleClick = () => {
        setSelectedValue(value);
    };

    return (
        <button
            onClick={handleClick}
            className={`
        w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
        ${isSelected ? 'bg-gray-100 font-medium' : ''} ${className}
      `}
        >
            {children}
        </button>
    );
};