/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useId } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Simple form context for basic form handling
const FormContext = createContext();
const FormFieldContext = createContext();
const FormItemContext = createContext();

export const Form = ({ children, onSubmit, className = '', ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <FormContext.Provider value={{}}>
      <form
        className={`space-y-6 ${className}`}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

export const FormField = ({ name, children, ...props }) => {
  const contextValue = { name };

  return (
    <FormFieldContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(props) : children}
    </FormFieldContext.Provider>
  );
};

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);

  if (!fieldContext) {
    console.warn("useFormField should be used within FormField");
  }

  const { id } = itemContext || {};
  const { name } = fieldContext || {};

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
};

export const FormItem = React.forwardRef(({ className = '', ...props }, ref) => {
  const id = useId();

  const contextValue = { id };

  return (
    <FormItemContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

export const FormLabel = React.forwardRef(({ className = '', ...props }, ref) => {
  const { formItemId } = useFormField();

  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={
        formDescriptionId ? `${formDescriptionId} ${formMessageId}` : formMessageId
      }
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

export const FormDescription = React.forwardRef(({ className = '', ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

export const FormMessage = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const { formMessageId } = useFormField();

  if (!children) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-sm font-medium text-red-500', className)}
      {...props}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

