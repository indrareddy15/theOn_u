/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const Accordion = ({ children, type = "single", collapsible = true, className = "", ...props }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (value) => {
    const newOpenItems = new Set(openItems);
    if (type === "single") {
      if (newOpenItems.has(value)) {
        newOpenItems.clear();
      } else {
        newOpenItems.clear();
        newOpenItems.add(value);
      }
    } else {
      if (newOpenItems.has(value)) {
        newOpenItems.delete(value);
      } else {
        newOpenItems.add(value);
      }
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen: openItems.has(child.props.value || index),
            onToggle: () => toggleItem(child.props.value || index),
          });
        }
        return child;
      })}
    </div>
  );
};

const AccordionItem = ({ children, className = "", value, isOpen, onToggle, ...props }) => {
  return (
    <div className={cn("border-b border-gray-200", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, onToggle });
        }
        return child;
      })}
    </div>
  );
};

const AccordionTrigger = ({ children, className = "", isOpen, onToggle, ...props }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left font-medium hover:underline",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
};

const AccordionContent = ({ children, className = "", isOpen, ...props }) => {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-screen pb-4" : "max-h-0"
      )}
      {...props}
    >
      <div className={cn("text-sm text-gray-600", className)}>
        {children}
      </div>
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };