import React from 'react';

// FIX: Add explicit prop types and make non-essential props optional.
const Textarea = ({
  className,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  id
}: {
  className?: string;
  value: any;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        id={id}
      />
    );
};

export { Textarea };
