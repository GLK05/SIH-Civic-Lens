import React, { useEffect, useRef } from 'react';

const MiniMap = ({ location }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    const getPinSVG = () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path fill="#EF4444" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff"/>
        </svg>
    `;

    useEffect(() => {
        if (!mapContainerRef.current || typeof L === 'undefined' || !location) {
            return;
        }

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [location.lat, location.lon],
                zoom: 15,
                zoomControl: false,
                scrollWheelZoom: false,
                dragging: false,
                touchZoom: false,
                doubleClickZoom: false,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);
            mapRef.current = map;
        }

        // Clear previous markers
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapRef.current.removeLayer(layer);
            }
        });

        const customIcon = L.divIcon({
            html: getPinSVG(),
            className: '',
            iconAnchor: [16, 32],
        });

        L.marker([location.lat, location.lon], { icon: customIcon }).addTo(mapRef.current);
        
        mapRef.current.setView([location.lat, location.lon], 15);

    }, [location]);

    return React.createElement('div', { ref: mapContainerRef, className: "w-full h-full" });
};

export default MiniMap;