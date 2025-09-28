import React, { useEffect, useRef } from 'react';
import { Button } from './ui/Button.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card.js';
import { SparklesIcon } from './Icons.js';

const renderFormattedText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
            return React.createElement('h4', { key: index, className: "text-lg font-semibold mt-4 mb-2" }, line.replace(/\*\*/g, ''));
        }
        if (line.startsWith('* ')) {
             return React.createElement('li', { key: index, className: "ml-4 list-disc" }, line.substring(2));
        }
        if (line.startsWith('### ')) {
            return React.createElement('h3', { key: index, className: "text-xl font-semibold mt-4 mb-2" }, line.substring(4));
        }
        return React.createElement('p', { key: index, className: "text-muted-foreground mb-2" }, line);
    });
};

const AIAnalysisModal = ({ 
    isOpen, 
    onClose, 
    analysis, 
    isLoading, 
    error 
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
        "aria-labelledby": "ai-analysis-title"
    },
      React.createElement(Card, {
        className: "w-full max-w-2xl animate-in zoom-in-95",
        onClick: (e) => e.stopPropagation()
      },
        React.createElement(CardHeader, { className: "flex flex-row items-start space-x-4" },
            React.createElement('div', { className: "bg-primary/10 p-3 rounded-full" },
                React.createElement(SparklesIcon, { className: "w-6 h-6 text-primary" })
            ),
            React.createElement('div', null,
                React.createElement(CardTitle, { id: "ai-analysis-title" }, "AI-Powered Report Analysis"),
                React.createElement(CardDescription, null, "An intelligent summary of all active issues.")
            )
        ),
        React.createElement(CardContent, { className: "max-h-[60vh] overflow-y-auto" },
          isLoading && (
            React.createElement('div', { className: "flex flex-col items-center justify-center h-48" },
              React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" }),
              React.createElement('p', { className: "text-muted-foreground" }, "Analyzing reports, please wait...")
            )
          ),
          error && (
            React.createElement('div', { className: "text-center h-48 flex flex-col justify-center" },
                 React.createElement('p', { className: "text-destructive font-semibold" }, "Analysis Failed"),
                 React.createElement('p', { className: "text-muted-foreground text-sm" }, error)
            )
          ),
          analysis && !isLoading && (
            React.createElement('div', { className: "prose dark:prose-invert" },
                renderFormattedText(analysis)
            )
          )
        ),
        React.createElement(CardFooter, { className: "justify-end" },
          React.createElement(Button, { variant: "outline", onClick: onClose }, "Close")
        )
      )
    )
  );
};

export default AIAnalysisModal;