export enum Category {
  FUN = 'Fun Hunters',
  FAMILY = 'Family Hunters',
  FASHION = 'Fashion Hunters',
  SPORTS = 'Outdoor & Sports Hunter',
  CULTURE = 'Coolture Hunter',
  WELLNESS = 'Wellness Hunter',
  NETWORKING = 'Networking Hunter',
  XPERIENCE = 'Xperience Hunter',
  UNCATEGORIZED = 'Uncategorized',
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: Category;
  coords: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'approved';
}

export type ScrapedEvent = Pick<Event, 'title' | 'description' | 'date' | 'location'>;
