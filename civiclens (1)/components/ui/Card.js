import React from 'react';

const Card = ({ className, children, onClick }) => (
  React.createElement('div', {
    className: `rounded-xl border bg-card text-card-foreground shadow ${className || ''}`,
    onClick: onClick
  },
  children)
);

const CardHeader = ({ className, children }) => (
  React.createElement('div', { className: `flex flex-col space-y-1.5 p-6 ${className || ''}` },
    children
  )
);

const CardTitle = ({ className, children, id }) => (
  React.createElement('h3', { id: id, className: `text-2xl font-semibold leading-none tracking-tight ${className || ''}` },
    children
  )
);

const CardDescription = ({ className, children }) => (
  React.createElement('p', { className: `text-sm text-muted-foreground ${className || ''}` },
    children
  )
);

const CardContent = ({ className, children }) => (
  React.createElement('div', { className: `p-6 pt-0 ${className || ''}` },
    children
  )
);

const CardFooter = ({ className, children }) => (
  React.createElement('div', { className: `flex items-center p-6 pt-0 ${className || ''}` },
    children
  )
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };