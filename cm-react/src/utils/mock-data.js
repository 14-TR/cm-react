// Mock data for development when API is not available
export const mockEvents = [
  {
    id: 1,
    event_type: "Battle",
    event_date: "2022-01-15",
    latitude: 34.5553,
    longitude: 69.2075,
    location: "Kabul, Afghanistan",
    fatalities: 12,
    description: "Armed conflict between opposing forces"
  },
  {
    id: 2,
    event_type: "Battle",
    event_date: "2022-02-10",
    latitude: 33.5138,
    longitude: 36.2765,
    location: "Damascus, Syria",
    fatalities: 8,
    description: "Urban warfare in city center"
  },
  {
    id: 3,
    event_type: "Explosion",
    event_date: "2022-03-05",
    latitude: 33.3152,
    longitude: 44.3661,
    location: "Baghdad, Iraq",
    fatalities: 15,
    description: "IED explosion in market area"
  },
  {
    id: 4,
    event_type: "Explosion",
    event_date: "2022-04-20",
    latitude: 31.5497,
    longitude: 34.2876,
    location: "Gaza, Palestine",
    fatalities: 6,
    description: "Explosion near residential building"
  },
  {
    id: 5,
    event_type: "VIIRS",
    event_date: "2022-05-12",
    latitude: 36.1911,
    longitude: 44.0091,
    location: "Erbil, Iraq",
    fatalities: 0,
    description: "Fire detected by satellite"
  },
  {
    id: 6,
    event_type: "Battle",
    event_date: "2022-06-18",
    latitude: 12.8628,
    longitude: 45.0288,
    location: "Aden, Yemen",
    fatalities: 10,
    description: "Armed conflict in port area"
  },
  {
    id: 7,
    event_type: "VIIRS",
    event_date: "2022-07-25",
    latitude: 15.3694,
    longitude: 44.1910,
    location: "Sanaa, Yemen",
    fatalities: 0,
    description: "Large fire detected by satellite"
  },
  {
    id: 8,
    event_type: "Battle",
    event_date: "2022-08-30",
    latitude: 32.5355,
    longitude: 35.8545,
    location: "Irbid, Jordan",
    fatalities: 5,
    description: "Border skirmish"
  },
  {
    id: 9,
    event_type: "Explosion",
    event_date: "2022-09-14",
    latitude: 29.3759,
    longitude: 47.9774,
    location: "Kuwait City, Kuwait",
    fatalities: 3,
    description: "Explosion at industrial facility"
  },
  {
    id: 10,
    event_type: "VIIRS",
    event_date: "2022-10-22",
    latitude: 25.2854,
    longitude: 51.5310,
    location: "Doha, Qatar",
    fatalities: 0,
    description: "Fire at construction site detected by satellite"
  },
  {
    id: 11,
    event_type: "Battle",
    event_date: "2022-11-08",
    latitude: 24.4539,
    longitude: 54.3773,
    location: "Abu Dhabi, UAE",
    fatalities: 2,
    description: "Security incident at facility"
  },
  {
    id: 12,
    event_type: "Explosion",
    event_date: "2022-12-19",
    latitude: 26.2235,
    longitude: 50.5876,
    location: "Manama, Bahrain",
    fatalities: 1,
    description: "Small explosion near government building"
  },
  {
    id: 13,
    event_type: "Battle",
    event_date: "2023-01-05",
    latitude: 30.0444,
    longitude: 31.2357,
    location: "Cairo, Egypt",
    fatalities: 7,
    description: "Armed confrontation in urban area"
  },
  {
    id: 14,
    event_type: "VIIRS",
    event_date: "2023-02-11",
    latitude: 36.7538,
    longitude: 3.0588,
    location: "Algiers, Algeria",
    fatalities: 0,
    description: "Wildfire detected by satellite"
  },
  {
    id: 15,
    event_type: "Explosion",
    event_date: "2023-03-20",
    latitude: 32.8872,
    longitude: 13.1913,
    location: "Tripoli, Libya",
    fatalities: 9,
    description: "Explosion at fuel depot"
  },
  {
    id: 16,
    event_type: "Battle",
    event_date: "2023-04-15",
    latitude: 36.8065,
    longitude: 10.1815,
    location: "Tunis, Tunisia",
    fatalities: 4,
    description: "Security forces engagement with armed group"
  },
  {
    id: 17,
    event_type: "VIIRS",
    event_date: "2023-05-22",
    latitude: 33.8869,
    longitude: 9.5375,
    location: "Central Tunisia",
    fatalities: 0,
    description: "Forest fire detected by satellite"
  },
  {
    id: 18,
    event_type: "Explosion",
    event_date: "2023-06-10",
    latitude: 31.6295,
    longitude: -7.9811,
    location: "Marrakech, Morocco",
    fatalities: 2,
    description: "Gas explosion in commercial district"
  },
  {
    id: 19,
    event_type: "Battle",
    event_date: "2023-07-18",
    latitude: 14.7167,
    longitude: -17.4677,
    location: "Dakar, Senegal",
    fatalities: 6,
    description: "Armed conflict between rival groups"
  },
  {
    id: 20,
    event_type: "VIIRS",
    event_date: "2023-08-25",
    latitude: 9.0579,
    longitude: 7.4951,
    location: "Abuja, Nigeria",
    fatalities: 0,
    description: "Large fire detected by satellite"
  }
];

// Generate more events for better visualization
export const generateMoreEvents = (baseEvents, multiplier = 5) => {
  const result = [...baseEvents];
  
  for (let i = 0; i < multiplier; i++) {
    baseEvents.forEach(event => {
      // Create a copy with slight location variations
      const newEvent = {
        ...event,
        id: result.length + 1,
        latitude: event.latitude + (Math.random() - 0.5) * 0.5,
        longitude: event.longitude + (Math.random() - 0.5) * 0.5,
        event_date: new Date(new Date(event.event_date).getTime() + 
                            Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                            .toISOString().split('T')[0]
      };
      result.push(newEvent);
    });
  }
  
  return result;
};

// Export the expanded dataset
export const mockEventData = generateMoreEvents(mockEvents, 5); 