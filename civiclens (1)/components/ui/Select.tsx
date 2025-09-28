import React from 'react';

type SelectProps = {
  className?: string;
  children?: React.ReactNode;
  value: any;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  disabled?: boolean;
  required?: boolean;
  id?: string;
};

const Select: React.FC<SelectProps> = ({
  className,
  children,
  value,
  onChange,
  disabled,
  required,
  id,
}) => {
    return (
      <select
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        id={id}
      >
        {children}
      </select>
    );
};

export { Select };
