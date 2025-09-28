import React, { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { SparklesIcon } from './Icons';

const renderFormattedText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
            return <h4 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
        }
        if (line.startsWith('* ')) {
             return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>
        }
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>
        }
        return <p key={index} className="text-muted-foreground mb-2">{line}</p>;
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
    <div 
        ref={modalRef}
        tabIndex={-1}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-0 focus:outline-none"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-analysis-title"
    >
      <Card 
        className="w-full max-w-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
                <SparklesIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <CardTitle id="ai-analysis-title">AI-Powered Report Analysis</CardTitle>
                <CardDescription>An intelligent summary of all active issues.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Analyzing reports, please wait...</p>
            </div>
          )}
          {error && (
            <div className="text-center h-48 flex flex-col justify-center">
                 <p className="text-destructive font-semibold">Analysis Failed</p>
                 <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          )}
          {analysis && !isLoading && (
            <div className="prose dark:prose-invert">
                {renderFormattedText(analysis)}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIAnalysisModal;