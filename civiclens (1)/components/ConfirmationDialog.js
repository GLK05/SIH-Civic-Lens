import React, { useEffect, useRef } from 'react';
import { Button } from './ui/Button.js';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card.js';

const ConfirmationDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel' 
}) => {
  const dialogRef = useRef(null);
  const triggerElementRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      
      const timer = setTimeout(() => {
        dialogRef.current?.focus();
      }, 100);

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        triggerElementRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    React.createElement('div', {
        ref: dialogRef,
        tabIndex: -1,
        className: "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-0 focus:outline-none",
        onClick: onClose,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "confirmation-dialog-title"
    },
      React.createElement(Card, {
        className: "w-full max-w-md animate-in zoom-in-95",
        onClick: (e) => e.stopPropagation() // Prevent closing when clicking inside the card
      },
        React.createElement(CardHeader, null,
          React.createElement(CardTitle, { id: "confirmation-dialog-title" }, title),
          React.createElement(CardDescription, null, description)
        ),
        React.createElement(CardFooter, { className: "justify-end space-x-2" },
          React.createElement(Button, { variant: "outline", onClick: onClose }, cancelText),
          React.createElement(Button, { onClick: onConfirm }, confirmText)
        )
      )
    )
  );
};

export default ConfirmationDialog;