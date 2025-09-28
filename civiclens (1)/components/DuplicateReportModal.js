import React, { useEffect, useRef } from 'react';
import { Button } from './ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card.js';
import { AlertTriangleIcon } from './Icons.js';

const DuplicateReportModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    duplicateReports 
}) => {
  const modalRef = useRef(null);
  const triggerElementRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      
      const timer = setTimeout(() => {
        modalRef.current?.focus();
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
        ref: modalRef,
        tabIndex: -1,
        className: "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-0 focus:outline-none",
        onClick: onClose,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "duplicate-report-title"
    },
      React.createElement(Card, {
        className: "w-full max-w-lg animate-in zoom-in-95",
        onClick: (e) => e.stopPropagation()
      },
        React.createElement(CardHeader, { className: "text-center" },
            React.createElement('div', { className: "mx-auto bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full w-fit" },
                React.createElement(AlertTriangleIcon, { className: "w-6 h-6 text-yellow-600 dark:text-yellow-400" })
            ),
            React.createElement(CardTitle, { id: "duplicate-report-title", className: "mt-2" }, "Potential Duplicates Found"),
            React.createElement(CardDescription, null, "Our AI found these reports that seem similar to yours. Please review them before submitting a new one.")
        ),
        React.createElement(CardContent, { className: "max-h-[40vh] overflow-y-auto space-y-3" },
          duplicateReports.map(report => (
            React.createElement('div', { key: report.id, className: "border p-3 rounded-lg bg-muted/50" },
                React.createElement('p', { className: "font-semibold" }, report.title),
                React.createElement('p', { className: "text-sm text-muted-foreground" }, report.location),
                React.createElement('p', { className: "text-xs mt-1" }, React.createElement('span', { className: "font-medium" }, "Status:"), " ", report.status)
            )
          ))
        ),
        React.createElement(CardFooter, { className: "flex flex-col sm:flex-row justify-end gap-2" },
          React.createElement(Button, { variant: "outline", onClick: onClose }, "Cancel Submission"),
          React.createElement(Button, { onClick: onConfirm }, "It's Different, Submit Anyway")
        )
      )
    )
  );
};

export default DuplicateReportModal;