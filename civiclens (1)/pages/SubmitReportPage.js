
import React, { useState, useRef, useEffect } from 'react';
import { ReportCategory, ReportStatus } from '../types.js';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Select } from '../components/ui/Select.js';
import { UploadIcon, MapPinIcon, ArrowLeftIcon, CpuIcon, CameraIcon } from '../components/Icons.js';
import DuplicateReportModal from '../components/DuplicateReportModal.js';

const SubmitReportPage = ({ currentUser, onReportSubmitted, onBack }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(ReportCategory.Other);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [etr, setEtr] = useState(null);
  const [isGettingEtr, setIsGettingEtr] = useState(false);
  
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateReports, setDuplicateReports] = useState([]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImagePreview(result);
        setImageData(result.split(',')[1]); // Strip the data URL prefix
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          setLocation(locationString);
          setCoords({ lat: latitude, lon: longitude });
          setLoading(false);
        },
        (err) => {
          setError('Could not get location. Please enable location services in your browser/device settings and try again.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const fetchETR = async () => {
    if (!title || !description || !category || !location) return;
    setIsGettingEtr(true);
    try {
      const estimatedTime = await api.getETR({ title, description, category, location });
      setEtr(estimatedTime);
    } catch (err) {
      setEtr("Could not be estimated.");
    } finally {
      setIsGettingEtr(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        if (title && description && category && location) fetchETR();
    }, 1000);
    return () => clearTimeout(debounceTimer);
  }, [title, description, category, location]);
  
  const performSubmit = async () => {
    setError('');
    setLoading(true);
    
    const reportData = {
        title,
        description,
        category,
        location,
        image_data: imageData,
        image_url: imageFile?.name,
        submitted_by_name: currentUser.name,
    };
    
    try {
        await api.submitReport(reportData);
        alert('Report submitted successfully!');
        onReportSubmitted();
    } catch (err) {
        // The submission failed, show the error directly to the user.
        // No offline saving will occur.
        setError(`Submission failed: ${err.message}`);
        console.error("Full submission error details:", err);
    } finally {
        setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !coords || !category || !imageData) {
      setError('Please fill out all required fields, including location and an image.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
        const potentialReport = { title, description, category, location };
        const duplicates = await api.checkForDuplicateReports(potentialReport);

        if (duplicates.length > 0) {
            setDuplicateReports(duplicates);
            setIsDuplicateModalOpen(true);
        } else {
            await performSubmit();
        }
    } catch (err) {
        console.error("Duplicate check failed, submitting anyway:", err);
        setError(`An error occurred while checking for duplicates: ${err.message}. Proceeding with submission.`);
        await performSubmit();
    }
  };

  const handleConfirmSubmit = async () => {
    setIsDuplicateModalOpen(false);
    await performSubmit();
  };

  const handleCancelSubmit = () => {
    setIsDuplicateModalOpen(false);
    setLoading(false);
  };

  return (
    React.createElement('div', { className: "space-y-6 max-w-4xl mx-auto" },
      React.createElement(DuplicateReportModal, {
        isOpen: isDuplicateModalOpen,
        onClose: handleCancelSubmit,
        onConfirm: handleConfirmSubmit,
        duplicateReports: duplicateReports
      }),
      React.createElement(Button, { variant: "ghost", onClick: onBack, className: "mb-4" },
        React.createElement(ArrowLeftIcon, { className: "mr-2 h-4 w-4" }),
        "Back to Dashboard"
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement(Card, null,
          React.createElement(CardHeader, null,
            React.createElement(CardTitle, null, "Submit a New Report"),
            React.createElement(CardDescription, null, "Fill in the details below to report a new civic issue.")
          ),
          React.createElement(CardContent, { className: "space-y-6" },
            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', { htmlFor: "title" }, "Title"),
              React.createElement(Input, { id: "title", placeholder: "e.g., Large pothole on Main St", value: title, onChange: e => setTitle(e.target.value), required: true })
            ),

            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', { htmlFor: "description" }, "Description"),
              React.createElement(Textarea, { id: "description", placeholder: "Provide details about the issue, its size, and specific location.", value: description, onChange: e => setDescription(e.target.value), required: true })
            ),

            React.createElement('div', { className: "space-y-2" },
                React.createElement('label', { htmlFor: "category" }, "Category"),
                React.createElement(Select, { id: "category", value: category, onChange: e => setCategory(e.target.value), required: true },
                Object.values(ReportCategory).map(cat => React.createElement('option', { key: cat, value: cat }, cat)))
            ),

             React.createElement('div', { className: "space-y-2" },
                React.createElement('label', null, "Location (Required)"),
                 React.createElement(Card, { className: "bg-muted/50" },
                    React.createElement(CardContent, { className: "p-4 text-center" },
                        location ? (
                            React.createElement('p', { className: "font-mono text-sm" }, location)
                        ) : (
                            React.createElement('p', { className: "text-sm text-muted-foreground" }, "Location not set. Please use the button below.")
                        )
                    )
                ),
                React.createElement(Button, { type: "button", variant: "outline", onClick: handleGetLocation, disabled: loading, className: "w-full" },
                    React.createElement(MapPinIcon, { className: "mr-2 h-5 w-5" }),
                    loading ? 'Getting Location...' : 'Get My Current Location'
                )
            ),

            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', null, "Image (Required)"),
               imagePreview ? (
                  React.createElement('div', { className: "w-full h-48 border-2 border-dashed rounded-lg p-2" },
                    React.createElement('img', { src: imagePreview, alt: "Preview", className: "h-full w-full object-contain rounded-lg" })
                  )
                ) : (
                  React.createElement('div', { className: "flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg" },
                    React.createElement('p', { className: "text-muted-foreground" }, "Image preview will appear here")
                  )
                ),
              React.createElement('div', { className: "grid grid-cols-2 gap-4 pt-2" },
                React.createElement(Button, { type: "button", variant: "secondary", onClick: () => fileInputRef.current?.click() },
                    React.createElement(UploadIcon, { className: "mr-2 h-4 w-4" }), " Upload Image"
                ),
                React.createElement(Button, { type: "button", variant: "secondary", onClick: () => cameraInputRef.current?.click() },
                    React.createElement(CameraIcon, { className: "mr-2 h-4 w-4" }), " Take Photo"
                )
              ),
              React.createElement('input', { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleImageChange }),
              React.createElement('input', { ref: cameraInputRef, type: "file", accept: "image/*", capture: true, className: "hidden", onChange: handleImageChange })
            ),
            
            etr && (
                React.createElement(Card, { className: "bg-primary/5 border-primary/20" },
                    React.createElement(CardContent, { className: "p-4 flex items-center" },
                        React.createElement(CpuIcon, { className: "h-6 w-6 text-primary mr-4" }),
                        React.createElement('div', null,
                            React.createElement('p', { className: "font-semibold text-sm" }, "AI Estimated Time to Resolution"),
                            React.createElement('p', { className: "text-muted-foreground text-sm" }, isGettingEtr ? "Calculating..." : etr)
                        )
                    )
                )
            ),

            error && React.createElement('p', { "aria-live": "assertive", className: "text-sm text-destructive" }, error)
          ),
          React.createElement(CardFooter, { className: "justify-center" },
            React.createElement(Button, { type: "submit", disabled: loading, className: "w-full sm:w-auto" },
              loading ? 'Submitting...' : 'Submit Report'
            )
          )
        )
      )
    )
  );
};
export default SubmitReportPage;
