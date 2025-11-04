import React, { useState } from 'react';
import { Event, ScrapedEvent } from '../types';

interface AdminPanelProps {
  pendingEvents: Event[];
  scrapedEvents: ScrapedEvent[];
  onApprove: (event: Event) => void;
  onReject: (id: number) => void;
  onAddEvent: (eventData: Omit<Event, 'id' | 'category' | 'status' | 'coords' | 'imageUrl'> & {lat: string, lng: string}) => void;
  onScrape: () => void;
  onAddScrapedToPending: (event: ScrapedEvent) => void;
  onDiscardScraped: (index: number) => void;
  isCategorizing: boolean;
  isScraping: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  pendingEvents, 
  scrapedEvents,
  onApprove, 
  onReject, 
  onAddEvent, 
  onScrape,
  onAddScrapedToPending,
  onDiscardScraped,
  isCategorizing,
  isScraping
}) => {
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    lat: '',
    lng: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(formState);
    setFormState({ title: '', description: '', date: '', location: '', lat: '', lng: '' });
  };
  
  return (
    <div className="bg-slate-800 p-6 rounded-lg my-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-sky-400">Admin Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Web Scraping */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Web Scraping (AI Simulation)</h3>
          <button onClick={onScrape} disabled={isScraping} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed mb-4">
            {isScraping ? 'Searching for events...' : 'Find New Events'}
          </button>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {scrapedEvents.length > 0 ? scrapedEvents.map((event, index) => (
              <div key={index} className="bg-slate-700 p-3 rounded-md">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-slate-400">{event.location}</p>
                 <div className="flex gap-2 mt-2">
                  <button onClick={() => onAddScrapedToPending(event)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors w-full">Add to Pending</button>
                  <button onClick={() => onDiscardScraped(index)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors w-full">Discard</button>
                </div>
              </div>
            )) : <p className="text-slate-400 text-sm">Click the button to find events.</p>}
          </div>
        </div>

        {/* Pending Events */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Pending Approval ({pendingEvents.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {pendingEvents.length > 0 ? pendingEvents.map(event => (
              <div key={event.id} className="bg-slate-700 p-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-slate-400">{event.location}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onApprove(event)} disabled={isCategorizing} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors disabled:bg-slate-600">Approve</button>
                  <button onClick={() => onReject(event.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors">Reject</button>
                </div>
              </div>
            )) : <p className="text-slate-400">No pending events.</p>}
          </div>
        </div>
        
        {/* Manual Event Creation */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Add Manually</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="title" value={formState.title} onChange={handleInputChange} placeholder="Event Title" required className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none" />
            <textarea name="description" value={formState.description} onChange={handleInputChange} placeholder="Description" required rows={3} className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none" />
            <input name="date" value={formState.date} onChange={handleInputChange} type="date" required className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none" />
            <input name="location" value={formState.location} onChange={handleInputChange} placeholder="Location Name" required className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none" />
            <div className="flex gap-4">
              <input name="lat" value={formState.lat} onChange={handleInputChange} placeholder="Latitude" required type="number" step="any" className="w-1/2 bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none" />
              <input name="lng" value={formState.lng} onChange={handleInputChange} placeholder="Longitude" required type="number" step="any" className="w-1/2 bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <button type="submit" disabled={isCategorizing} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
              {isCategorizing ? 'Categorizing...' : 'Add Event'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
