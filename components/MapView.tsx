
import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { MapPinIcon } from './icons';
import { CATEGORY_COLORS } from '../constants';

interface MapViewProps {
  events: Event[];
}

const MapView: React.FC<MapViewProps> = ({ events }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ event: Event; x: number; y: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  }, []);

  // Bounding box for Monterrey area to normalize coordinates
  const bounds = {
    minLat: 25.4, maxLat: 25.9,
    minLng: -100.6, maxLng: -100.0,
  };

  const getPosition = (lat: number, lng: number) => {
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    return { top: `${y}%`, left: `${x}%` };
  };

  const handleMouseEnter = (event: Event, e: React.MouseEvent) => {
    setTooltip({ event, x: e.clientX, y: e.clientY });
  };
  
  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700 animate-fade-in">
        <div className="absolute inset-0 bg-grid-slate-700/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0))]"></div>
        <p className="absolute top-2 left-2 text-xs text-slate-400">Simulated Map View of Monterrey Area</p>
      {events.map((event) => {
        const { top, left } = getPosition(event.coords.lat, event.coords.lng);
        const categoryColor = CATEGORY_COLORS[event.category]?.replace('bg-', 'text-').split(' ')[0] || 'text-gray-400';
        return (
          <div
            key={event.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ top, left }}
            onMouseEnter={(e) => handleMouseEnter(event, e)}
            onMouseLeave={handleMouseLeave}
          >
            <MapPinIcon className={`w-8 h-8 ${categoryColor} transition-transform hover:scale-125`} />
          </div>
        );
      })}
      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={getPosition(userLocation.lat, userLocation.lng)}
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white animate-pulse" title="Your Location"></div>
        </div>
      )}
       {tooltip && (
        <div
          className="absolute z-10 p-2 bg-slate-900 border border-slate-700 rounded-md text-sm shadow-lg pointer-events-none"
          style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
        >
          <p className="font-bold">{tooltip.event.title}</p>
          <p className="text-slate-400">{tooltip.event.location}</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
