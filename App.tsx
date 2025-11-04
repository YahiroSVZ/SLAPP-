import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Category, ScrapedEvent } from './types';
import { fetchEvents } from './services/eventService';
import { categorizeEvent, scrapeEventsFromWeb } from './services/geminiService';
import { CATEGORIES } from './constants';
import EventCard from './components/EventCard';
import AdminPanel from './components/AdminPanel';
import MapView from './components/MapView';
import { HeartIcon, ListIcon, MapIcon } from './components/icons';

type View = 'list' | 'map' | 'favorites';

const App: React.FC = () => {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [scrapedEvents, setScrapedEvents] = useState<ScrapedEvent[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      const events = await fetchEvents();
      setAllEvents(events.filter(e => e.status === 'approved'));
      setPendingEvents(events.filter(e => e.status === 'pending'));
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('eventFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const handleToggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id];
      localStorage.setItem('eventFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const handleApprove = async (event: Event) => {
    setIsCategorizing(true);
    const category = await categorizeEvent(event);
    const approvedEvent = { ...event, status: 'approved' as const, category };
    
    setAllEvents(prev => [...prev, approvedEvent]);
    setPendingEvents(prev => prev.filter(e => e.id !== event.id));
    setIsCategorizing(false);
  };
  
  const handleReject = (id: number) => {
    setPendingEvents(prev => prev.filter(e => e.id !== id));
  };
  
  const handleAddEvent = async (eventData: Omit<Event, 'id' | 'category' | 'status'| 'coords' | 'imageUrl'> & {lat: string, lng: string}) => {
    setIsCategorizing(true);
    const category = await categorizeEvent(eventData);
    const newEvent: Event = {
      ...eventData,
      id: Date.now(),
      category,
      status: 'approved',
      coords: { lat: parseFloat(eventData.lat), lng: parseFloat(eventData.lng) },
      imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`,
    };
    setAllEvents(prev => [newEvent, ...prev]);
    setIsCategorizing(false);
  };

  const handleScrapeEvents = async () => {
    setIsScraping(true);
    const events = await scrapeEventsFromWeb();
    setScrapedEvents(events);
    setIsScraping(false);
  };

  const handleAddScrapedToPending = (scrapedEvent: ScrapedEvent) => {
    const newPendingEvent: Event = {
      ...scrapedEvent,
      id: Date.now(),
      category: Category.UNCATEGORIZED,
      status: 'pending',
      imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`,
      // Default coords for Monterrey, admin should verify later
      coords: { lat: 25.6751, lng: -100.3185 }, 
    };
    setPendingEvents(prev => [newPendingEvent, ...prev]);
    setScrapedEvents(prev => prev.filter(e => e.title !== scrapedEvent.title));
  };

  const handleDiscardScraped = (index: number) => {
    setScrapedEvents(prev => prev.filter((_, i) => i !== index));
  };
  
  const filteredEvents = useMemo(() => {
    let eventsToDisplay: Event[] = [];
    if (currentView === 'favorites') {
        eventsToDisplay = allEvents.filter(event => favorites.includes(event.id));
    } else {
        eventsToDisplay = allEvents;
    }

    if (selectedCategory === 'all') {
      return eventsToDisplay;
    }
    return eventsToDisplay.filter(event => event.category === selectedCategory);
  }, [allEvents, favorites, currentView, selectedCategory]);

  const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
  }> = ({ onClick, isActive, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-white mb-4 sm:mb-0">
                Monterrey <span className="text-sky-400">Event Hunter</span>
            </h1>
          <div className="flex items-center gap-2">
            <NavButton onClick={() => setCurrentView('list')} isActive={currentView === 'list'}>
                <ListIcon className="w-5 h-5" /> List
            </NavButton>
            <NavButton onClick={() => setCurrentView('map')} isActive={currentView === 'map'}>
                <MapIcon className="w-5 h-5" /> Map
            </NavButton>
            <NavButton onClick={() => setCurrentView('favorites')} isActive={currentView === 'favorites'}>
                <HeartIcon className="w-5 h-5" /> Favorites
            </NavButton>
            <label className="flex items-center cursor-pointer ml-4">
              <span className="mr-2 text-sm font-medium">Admin</span>
              <div className="relative">
                <input type="checkbox" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </div>
            </label>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {isAdmin && <AdminPanel 
          pendingEvents={pendingEvents} 
          scrapedEvents={scrapedEvents}
          onApprove={handleApprove} 
          onReject={handleReject} 
          onAddEvent={handleAddEvent}
          onScrape={handleScrapeEvents}
          onAddScrapedToPending={handleAddScrapedToPending}
          onDiscardScraped={handleDiscardScraped}
          isCategorizing={isCategorizing}
          isScraping={isScraping}
        />}

        <div className="my-6">
          <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>All Categories</button>
              {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategory === cat ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{cat}</button>
              ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400">Loading events...</div>
        ) : (
          <>
            {currentView !== 'map' && (
              filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isFavorite={favorites.includes(event.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 animate-fade-in">
                    <h3 className="text-2xl font-semibold mb-2">No events found.</h3>
                    <p>Try selecting a different category or view your favorites!</p>
                </div>
              )
            )}
            {currentView === 'map' && <MapView events={filteredEvents} />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
