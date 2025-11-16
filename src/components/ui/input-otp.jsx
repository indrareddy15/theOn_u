import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { Minus } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const OTPContext = createContext();

export const InputOTP = ({
  maxLength = 6,
  value = '',
  onChange,
  className = '',
  containerClassName = '',
  disabled = false,
  ...props
}) => {
  const [otp, setOtp] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    setOtp(value);
  }, [value]);

  const handleChange = (newValue, index) => {
    const newOtp = otp.split('');
    newOtp[index] = newValue;
    const updatedOtp = newOtp.join('');

    setOtp(updatedOtp);
    onChange?.(updatedOtp);

    // Move to next input if value is entered
    if (newValue && index < maxLength - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedChars = pastedData.slice(0, maxLength).split('');

    setOtp(pastedChars.join(''));
    onChange?.(pastedChars.join(''));

    const nextIndex = Math.min(pastedChars.length, maxLength - 1);
    setActiveIndex(nextIndex);
    inputRefs.current[nextIndex]?.focus();
  };

  const contextValue = {
    otp,
    maxLength,
    activeIndex,
    disabled,
    handleChange,
    handleKeyDown,
    handlePaste,
    inputRefs
  };

  return (
    <OTPContext.Provider value={contextValue}>
      <div
        className={cn('flex items-center gap-2', containerClassName)}
        {...props}
      >
        {Array.from({ length: maxLength }, (_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            disabled={disabled}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-center text-sm transition-colors',
              'focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              activeIndex === index && 'ring-2 ring-gray-950 ring-offset-2',
              className
            )}
          />
        ))}
      </div>
    </OTPContext.Provider>
  );
};

export const InputOTPGroup = ({ className = '', children, ...props }) => {
  return (
    <div className={cn('flex items-center', className)} {...props}>
      {children}
    </div>
  );
};

export const InputOTPSlot = ({
  index,
  className = '',
  ...props
}) => {
  const context = useContext(OTPContext);

  if (!context) {
    console.warn('InputOTPSlot must be used within InputOTP');
    return null;
  }

  const { otp, activeIndex, disabled, handleChange, handleKeyDown, handlePaste, inputRefs } = context;
  const char = otp[index] || '';
  const isActive = activeIndex === index;

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-sm transition-all',
        isActive && 'ring-2 ring-gray-950 ring-offset-2',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      <input
        ref={(el) => (inputRefs.current[index] = el)}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        value={char}
        onChange={(e) => handleChange(e.target.value, index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        onPaste={handlePaste}
        onFocus={() => context.setActiveIndex?.(index)}
        disabled={disabled}
        className="absolute inset-0 bg-transparent text-center outline-none"
      />
      {char}
      {isActive && !char && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-pulse bg-gray-900" />
        </div>
      )}
    </div>
  );
};

export const InputOTPSeparator = ({ ...props }) => {
  return (
    <div role="separator" {...props}>
      <Minus className="h-4 w-4" />
    </div>
  );
};

