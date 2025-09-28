import React from 'react';

type CardProps = {
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

const Card: React.FC<CardProps> = ({ className, children, onClick }) => (
  <div
    className={`rounded-xl border bg-card text-card-foreground shadow ${className || ''}`}
    onClick={onClick}
  >
    {children}
  </div>
);

type CardSubComponentProps = {
  className?: string;
  children?: React.ReactNode;
};

const CardHeader: React.FC<CardSubComponentProps> = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>
    {children}
  </div>
);

type CardTitleProps = CardSubComponentProps & {
    id?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({ className, children, id }) => (
  <h3 id={id} className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<CardSubComponentProps> = ({ className, children }) => (
  <p className={`text-sm text-muted-foreground ${className || ''}`}>
    {children}
  </p>
);

const CardContent: React.FC<CardSubComponentProps> = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

const CardFooter: React.FC<CardSubComponentProps> = ({ className, children }) => (
  <div className={`flex items-center p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
