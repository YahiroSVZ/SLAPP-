import { GoogleGenAI, Type } from "@google/genai";
import { Category, Event, ScrapedEvent } from "../types";
import { CATEGORIES } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const categorizeEvent = async (event: Pick<Event, 'title' | 'description'>): Promise<Category> => {
  const { title, description } = event;
  const prompt = `
    Based on the following event title and description, please classify it into one of the specified categories.
    
    Title: "${title}"
    Description: "${description}"

    Categories:
    - ${CATEGORIES.join('\n- ')}

    Return only the JSON object with the category.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: CATEGORIES,
              description: "The most appropriate category for the event."
            },
          },
          required: ["category"],
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result.category && Object.values(Category).includes(result.category)) {
      return result.category as Category;
    }

    console.warn('Gemini returned an invalid category:', result.category);
    return Category.UNCATEGORIZED;

  } catch (error) {
    console.error("Error categorizing event with Gemini:", error);
    return Category.UNCATEGORIZED;
  }
};


export const scrapeEventsFromWeb = async (): Promise<ScrapedEvent[]> => {
  const prompt = `
    Act as a web scraper. Find 5 potential upcoming events in Monterrey, Mexico. 
    Provide the event title, a short description (around 20-30 words), the date in YYYY-MM-DD format, and the location.
    Return the data as a JSON array of objects. Do not include events that have already passed today's date.
    Ensure the events are varied and interesting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  date: { type: Type.STRING },
                  location: { type: Type.STRING },
                },
                required: ["title", "description", "date", "location"],
              },
            },
          },
        },
      },
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    if (result.events && Array.isArray(result.events)) {
      return result.events;
    }

    return [];
  } catch (error) {
    console.error("Error scraping events with Gemini:", error);
    return [];
  }
};
