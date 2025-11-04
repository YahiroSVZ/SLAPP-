
import React from 'react';
import { Event } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { HeartIcon, MapPinIcon, CalendarIcon } from './icons';

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isFavorite, onToggleFavorite }) => {
  const categoryColor = CATEGORY_COLORS[event.category] || 'bg-gray-500 text-gray-100';
  const formattedDate = new Date(event.date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 flex flex-col animate-fade-in">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={event.imageUrl} alt={event.title} />
        <button
          onClick={() => onToggleFavorite(event.id)}
          className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
          aria-label="Toggle Favorite"
        >
          <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} />
        </button>
        <div className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold rounded-full ${categoryColor}`}>
          {event.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
        <p className="text-slate-400 text-sm flex-grow mb-4">{event.description}</p>
        <div className="mt-auto space-y-2 text-sm">
          <div className="flex items-center text-slate-300">
            <CalendarIcon className="w-4 h-4 mr-2 text-sky-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-slate-300">
            <MapPinIcon className="w-4 h-4 mr-2 text-sky-400" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
