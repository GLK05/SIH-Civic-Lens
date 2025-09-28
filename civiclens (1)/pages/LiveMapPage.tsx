import React, { useState, useEffect, useMemo } from 'react';
import { ReportStatus } from '../types';
import * as api from '../services/api';
import MapComponent from '../components/MapComponent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MenuIcon, MapPinIcon } from '../components/Icons';
import { supabase } from '../supabase/client';
import { Input } from '../components/ui/Input';

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const parseLocation = (location: string | null) => {
    if (!location) return null;
    // This function now only parses the location string, making it resilient to DB schema changes.
    const latLonMatch = location.match(/Lat: ([-.\d]+), Lon: ([-.\d]+)/);
    if (latLonMatch && latLonMatch[1] && latLonMatch[2]) {
        const lat = parseFloat(latLonMatch[1]);
        const lon = parseFloat(latLonMatch[2]);
        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
           return { lat, lon };
        }
    }
    return null;
};

const statusColors = {
    [ReportStatus.Pending]: '#FBBF24', [ReportStatus.Assigned]: '#3B82F6',
    [ReportStatus.InProgress]: '#8B5CF6', [ReportStatus.Resolved]: '#10B981',
};

const FilterPanel = ({ 
    statusFilter, setStatusFilter, 
    reports, 
    proximityFilter, setProximityFilter, 
    filterLocation, setFilterLocation,
    handleGetMyLocation, isFetchingLocation,
    locationError,
}) => {
    const allStatuses = Object.values(ReportStatus);
    const proximityOptions = [1, 5, 10]; // km
    
    const [locationSearch, setLocationSearch] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const handleSearch = async () => {
        if (!locationSearch) return;
        setIsGeocoding(true);
        setSearchError(null);
        try {
            const coords = await api.geocodeAddressWithGemini(locationSearch);
            if (coords) {
                setFilterLocation({ ...coords, label: locationSearch });
            } else {
                setSearchError("Location not found.");
            }
        } catch (err) {
            setSearchError(err.message);
        } finally {
            setIsGeocoding(false);
        }
    };


    return (
        <Card className="h-full lg:h-auto flex flex-col">
            <CardHeader>
                <CardTitle>Filter Reports</CardTitle>
                <CardDescription>View reports by status and location.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto">
                <div>
                    <h4 className="text-sm font-semibold mb-2">Status</h4>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant={statusFilter === 'All' ? 'default' : 'outline'} onClick={() => setStatusFilter('All')}>
                            All ({reports.length})
                        </Button>
                        {allStatuses.map(status => (
                            <React.Fragment key={status}>
                            <Button size="sm" variant={statusFilter === status ? 'default' : 'outline'} onClick={() => setStatusFilter(status)}>
                                {status} ({reports.filter(r => r.status === status).length})
                            </Button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Proximity</h4>
                    <div className="flex space-x-2">
                        <Input 
                            placeholder="Enter an address..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                        />
                        <Button onClick={handleSearch} disabled={isGeocoding}>{isGeocoding ? '...' : 'Go'}</Button>
                    </div>
                    {searchError && <p className="text-xs text-destructive">{searchError}</p>}
                    <Button variant="outline" className="w-full" onClick={handleGetMyLocation} disabled={isFetchingLocation}>
                        <MapPinIcon className="mr-2 h-4 w-4" /> Use My Current Location
                    </Button>

                    {filterLocation && <p className="text-xs text-muted-foreground">Filtering near: <span className="font-semibold text-foreground">{filterLocation.label}</span></p>}
                    {locationError && <p aria-live="assertive" className="text-xs text-destructive">{locationError}</p>}

                    <div>
                        <label className="text-xs font-medium">Radius</label>
                         <div className="flex flex-wrap gap-2 pt-2">
                            <Button size="sm" variant={!proximityFilter ? 'default' : 'outline'} onClick={() => setProximityFilter(null)}>All</Button>
                            {proximityOptions.map(dist => (
                                <React.Fragment key={dist}>
                                    <Button size="sm" variant={proximityFilter === dist ? 'default' : 'outline'} onClick={() => setProximityFilter(dist)}>
                                        {`< ${dist} km`}
                                    </Button>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const LiveMapPage = ({ viewReport }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [proximityFilter, setProximityFilter] = useState(null);
    const [filterLocation, setFilterLocation] = useState(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    
    const handleGetMyLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }
        setIsFetchingLocation(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const loc = { lat: latitude, lon: longitude };
                setUserLocation(loc);
                setFilterLocation({ ...loc, label: "Your Current Location" });
                setIsFetchingLocation(false);
            },
            (err) => {
                setLocationError("Could not get your location. Please enable location services.");
                setIsFetchingLocation(false);
            }
        );
    };

    const fetchAndProcessReports = async () => {
        const rawReports = await api.getReports();
        const reportsWithCoords = rawReports
            .map(report => ({ ...report, ...parseLocation(report.location) }))
            .filter((report) => report.lat != null && report.lon != null);
        setReports(reportsWithCoords);
    };


    useEffect(() => {
        handleGetMyLocation(); 
        
        setLoading(true);
        fetchAndProcessReports().finally(() => setLoading(false));

        const channel = supabase
            .channel('live-map-reports')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reports' },
                (payload) => {
                    setReports(currentReports => {
                        const newReport = { ...payload.new, ...parseLocation(payload.new.location) };
                        if (!newReport.lat || !newReport.lon) return currentReports;

                        if (payload.eventType === 'INSERT') {
                            return [newReport, ...currentReports];
                        }
                        if (payload.eventType === 'UPDATE') {
                            return currentReports.map(report => 
                                report.id === newReport.id ? newReport : report
                            );
                        }
                        if (payload.eventType === 'DELETE') {
                            return currentReports.filter(report => report.id !== payload.old.id);
                        }
                        return currentReports;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredReports = useMemo(() => {
        let tempReports = reports;

        if (statusFilter !== 'All') {
            tempReports = tempReports.filter(report => report.status === statusFilter);
        }

        if (proximityFilter && filterLocation) {
            tempReports = tempReports.filter(report => {
                const distance = getDistanceFromLatLonInKm(
                    filterLocation.lat,
                    filterLocation.lon,
                    report.lat,
                    report.lon
                );
                return distance <= proximityFilter;
            });
        }
        
        return tempReports;
    }, [reports, statusFilter, proximityFilter, filterLocation]);

    const filterPanelProps = {
        statusFilter, setStatusFilter, reports,
        proximityFilter, setProximityFilter,
        filterLocation, setFilterLocation,
        handleGetMyLocation, isFetchingLocation,
        locationError
    };

    return (
        <div className="h-full flex flex-col lg:flex-row">
            <div className="hidden lg:block lg:w-80 xl:w-96 p-4 space-y-4 overflow-y-auto">
                 <div>
                    <h1 className="text-2xl font-bold">Live Issues Map</h1>
                    <p className="text-muted-foreground">A real-time map of all reported civic issues.</p>
                </div>
                <FilterPanel {...filterPanelProps} />
            </div>

            <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-background p-4 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${isFilterPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <FilterPanel {...filterPanelProps} />
            </div>
            {isFilterPanelOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsFilterPanelOpen(false)}></div>}


            <div className="flex-grow relative">
                <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-background to-transparent z-10 lg:hidden">
                    <div className="flex justify-between items-center">
                        <Button variant="ghost" size="icon" onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} aria-label="Toggle filters">
                            <MenuIcon className="h-6 w-6" />
                            <span className="sr-only">Toggle Filters</span>
                        </Button>
                         <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm">
                            <h1 className="text-lg font-bold">Live Issues Map</h1>
                        </div>
                    </div>
                     {locationError && !filterLocation && <p aria-live="assertive" className="text-xs text-destructive mt-1 text-center bg-background/80 p-1 rounded">{locationError}</p>}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-full"><p>Loading map data...</p></div>
                ) : (
                    <MapComponent reports={filteredReports} viewReport={viewReport} statusColors={statusColors} userLocation={filterLocation} />
                )}
            </div>
        </div>
    );
};

export default LiveMapPage;