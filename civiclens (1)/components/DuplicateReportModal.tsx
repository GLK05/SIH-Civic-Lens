import React, { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { AlertTriangleIcon } from './Icons';

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
    <div 
        ref={modalRef}
        tabIndex={-1}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-0 focus:outline-none"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-report-title"
    >
      <Card 
        className="w-full max-w-lg animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="text-center">
            <div className="mx-auto bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full w-fit">
                <AlertTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle id="duplicate-report-title" className="mt-2">Potential Duplicates Found</CardTitle>
            <CardDescription>Our AI found these reports that seem similar to yours. Please review them before submitting a new one.</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[40vh] overflow-y-auto space-y-3">
          {duplicateReports.map(report => (
            <div key={report.id} className="border p-3 rounded-lg bg-muted/50">
                <p className="font-semibold">{report.title}</p>
                <p className="text-sm text-muted-foreground">{report.location}</p>
                <p className="text-xs mt-1"><span className="font-medium">Status:</span> {report.status}</p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel Submission</Button>
          <Button onClick={onConfirm}>It's Different, Submit Anyway</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DuplicateReportModal;