
import React, { useState, useRef, useEffect } from 'react';
import { ReportCategory, ReportStatus } from '../types';
import * as api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { UploadIcon, MapPinIcon, ArrowLeftIcon, CpuIcon, CameraIcon } from '../components/Icons';
import DuplicateReportModal from '../components/DuplicateReportModal';

const SubmitReportPage = ({ currentUser, onReportSubmitted, onBack }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(ReportCategory.Other);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [etr, setEtr] = useState<string | null>(null);
  const [isGettingEtr, setIsGettingEtr] = useState(false);
  
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateReports, setDuplicateReports] = useState([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
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
    } catch (err: any) {
        // The submission failed, show the error directly to the user.
        // No offline saving will occur.
        setError(`Submission failed: ${err.message}`);
        console.error("Full submission error details:", err);
    } finally {
        setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
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
    <div className="space-y-6 max-w-4xl mx-auto">
       <DuplicateReportModal
        isOpen={isDuplicateModalOpen}
        onClose={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        duplicateReports={duplicateReports}
      />
      
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Submit a New Report</CardTitle>
            <CardDescription>Fill in the details below to report a new civic issue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title">Title</label>
              <Input id="title" placeholder="e.g., Large pothole on Main St" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea id="description" placeholder="Provide details about the issue, its size, and specific location." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
                <label htmlFor="category">Category</label>
                <Select id="category" value={category} onChange={e => setCategory(e.target.value as any)} required>
                {Object.values(ReportCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
            </div>

             <div className="space-y-2">
                <label>Location (Required)</label>
                 <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                        {location ? (
                            <p className="font-mono text-sm">{location}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Location not set. Please use the button below.</p>
                        )}
                    </CardContent>
                </Card>
                <Button type="button" variant="outline" onClick={handleGetLocation} disabled={loading} className="w-full">
                    <MapPinIcon className="mr-2 h-5 w-5" />
                    {loading ? 'Getting Location...' : 'Get My Current Location'}
                </Button>
            </div>

            <div className="space-y-2">
              <label>Image (Required)</label>
               {imagePreview ? (
                  <div className="w-full h-48 border-2 border-dashed rounded-lg p-2">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Image preview will appear here</p>
                  </div>
                )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className="mr-2 h-4 w-4"/> Upload Image
                </Button>
                <Button type="button" variant="secondary" onClick={() => cameraInputRef.current?.click()}>
                    <CameraIcon className="mr-2 h-4 w-4"/> Take Photo
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture className="hidden" onChange={handleImageChange} />
            </div>
            
            {etr && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center">
                        <CpuIcon className="h-6 w-6 text-primary mr-4" />
                        <div>
                            <p className="font-semibold text-sm">AI Estimated Time to Resolution</p>
                            <p className="text-muted-foreground text-sm">{isGettingEtr ? "Calculating..." : etr}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && <p aria-live="assertive" className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="justify-center">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default SubmitReportPage;
