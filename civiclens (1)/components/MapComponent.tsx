import React, { useEffect, useRef } from 'react';

declare const L: any;

const MapComponent = ({ reports, viewReport, statusColors, userLocation }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(null);

    const getPinSVG = (color) => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
            <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff"/>
        </svg>
    `;

    useEffect(() => {
        if (!mapContainerRef.current || typeof L === 'undefined') {
            return;
        }

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            mapRef.current = map;
            markersRef.current = L.markerClusterGroup().addTo(map);
        }

        const markers = markersRef.current;
        markers.clearLayers();

        const allMarkersGroup = L.featureGroup();

        if (userLocation) {
            const userIcon = L.divIcon({
                html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
                className: '',
                iconSize: [16, 16],
            });
            const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 })
                .bindPopup("Your Location");
            allMarkersGroup.addLayer(userMarker);
        }

        reports.forEach(report => {
            const pinColor = statusColors[report.status] || '#808080'; // Default gray color
            const customIcon = L.divIcon({
                html: getPinSVG(pinColor),
                className: '',
                iconAnchor: [14, 28],
                popupAnchor: [0, -28]
            });

            const popupContent = document.createElement('div');
            popupContent.innerHTML = `
                <div class="text-sm space-y-1">
                    <p class="font-bold">${report.title}</p>
                    <p class="text-xs text-gray-500">Status: ${report.status}</p>
                    <p class="text-xs text-gray-500 font-semibold">${report.vote_count || 0} Confirmation(s)</p>
                </div>
            `;
            const button = document.createElement('button');
            button.innerHTML = 'View Details';
            button.className = 'mt-2 w-full text-xs text-white bg-primary hover:bg-primary/90 rounded-md py-1 px-2';
            button.onclick = () => viewReport(report);
            popupContent.appendChild(button);

            const marker = L.marker([report.lat, report.lon], { icon: customIcon })
                .bindPopup(popupContent);

            allMarkersGroup.addLayer(marker);
        });

        markers.addLayer(allMarkersGroup);

        if (allMarkersGroup.getLayers().length > 0) {
            const bounds = allMarkersGroup.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            }
        }

    }, [reports, viewReport, statusColors, userLocation]);

    return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapComponent;