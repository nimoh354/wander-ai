// src/utils/tripGenerator.js

// Destination database with activities, food, and tips
const destinations = {
  paris: {
    type: 'city',
    country: 'France',
    currency: 'Euro',
    language: 'French',
    activities: {
      culture: ['Louvre Museum', 'Musée d\'Orsay', 'Notre-Dame Cathedral', 'Sainte-Chapelle'],
      food: ['French pastries', 'Croissants', 'Escargots', 'Steak frites', 'Cheese tasting'],
      adventure: ['Seine River cruise', 'Montmartre walking tour', 'Catacombs tour'],
      beach: ['None (but nice parks!)'],
      general: ['Eiffel Tower', 'Champs-Élysées', 'Arc de Triomphe', 'Latin Quarter']
    },
    food_spots: {
      breakfast: 'A local café with croissants and coffee',
      lunch: 'A charming bistro for steak frites',
      dinner: 'Traditional French restaurant with escargots'
    },
    accommodation: 'A cozy hotel in the Latin Quarter or near the Eiffel Tower',
    tips: [
      'Book Eiffel Tower tickets in advance',
      'Learn a few French phrases',
      'The Paris Museum Pass saves money',
      'Visit Montmartre for sunset views'
    ]
  },
  tokyo: {
    type: 'city',
    country: 'Japan',
    currency: 'Yen',
    language: 'Japanese',
    activities: {
      culture: ['Senso-ji Temple', 'Meiji Shrine', 'Imperial Palace', 'Ghibli Museum'],
      food: ['Sushi', 'Ramen', 'Tempura', 'Matcha desserts', 'Okonomiyaki'],
      adventure: ['Shibuya Crossing', 'Mount Fuji day trip', 'Sumo wrestling match'],
      beach: ['None (but beautiful gardens!)'],
      general: ['Tokyo Tower', 'Shinjuku Gyoen Garden', 'Akihabara', 'Harajuku']
    },
    food_spots: {
      breakfast: 'Convenience store onigiri and matcha latte',
      lunch: 'Ramen shop in Shinjuku',
      dinner: 'Sushi restaurant in Tsukiji Outer Market'
    },
    accommodation: 'A hotel in Shinjuku or Shibuya',
    tips: [
      'Get a Suica/Pasmo card for trains',
      'Learn basic Japanese phrases',
      'Visit temples in the early morning',
      'Check out the vending machines'
    ]
  },
  bali: {
    type: 'beach',
    country: 'Indonesia',
    currency: 'Rupiah',
    language: 'Indonesian',
    activities: {
      culture: ['Ubud Monkey Forest', 'Tanah Lot Temple', 'Uluwatu Temple', 'Balinese dance shows'],
      food: ['Nasi goreng', 'Mie goreng', 'Satay', 'Babi guling', 'Fresh smoothies'],
      adventure: ['Surfing at Kuta', 'Mount Batur sunrise trek', 'White water rafting'],
      beach: ['Seminyak Beach', 'Nusa Dua Beach', 'Jimbaran Bay', 'Padang Padang Beach'],
      general: ['Rice terraces', 'Tegalalang Rice Terrace', 'Campuhan Ridge Walk']
    },
    food_spots: {
      breakfast: 'Smoothie bowl at a beach café',
      lunch: 'Nasi goreng at a local warung',
      dinner: 'Seafood dinner on Jimbaran Beach'
    },
    accommodation: 'A villa in Seminyak or Ubud',
    tips: [
      'Rent a scooter for getting around',
      'Bring cash for local markets',
      'Visit temples with a sarong',
      'Sunset at Tanah Lot is incredible'
    ]
  },
  rome: {
    type: 'city',
    country: 'Italy',
    currency: 'Euro',
    language: 'Italian',
    activities: {
      culture: ['Colosseum', 'Vatican Museums', 'Pantheon', 'Roman Forum', 'Trevi Fountain'],
      food: ['Pizza', 'Pasta', 'Gelato', 'Tiramisu', 'Cappuccino'],
      adventure: ['Vatican City tour', 'Appian Way bike ride', 'Catacombs tour'],
      beach: ['Ostia Beach (1 hour away)'],
      general: ['Spanish Steps', 'Piazza Navona', 'Trastevere', 'Castel Sant\'Angelo']
    },
    food_spots: {
      breakfast: 'Cornetto and cappuccino at a local café',
      lunch: 'Pasta at a trattoria in Trastevere',
      dinner: 'Pizza at a pizzeria near Campo de\' Fiori'
    },
    accommodation: 'A hotel near the Colosseum or in Trastevere',
    tips: [
      'Book Colosseum tickets in advance',
      'Cover knees and shoulders in Vatican City',
      'Throw a coin in Trevi Fountain',
      'Eat where the locals eat'
    ]
  },
  dubai: {
    type: 'city',
    country: 'UAE',
    currency: 'Dirham',
    language: 'Arabic',
    activities: {
      culture: ['Burj Khalifa', 'Dubai Mall', 'Dubai Fountain', 'Al Fahidi Historical District'],
      food: ['Shawarma', 'Hummus', 'Falafel', 'Mandi', 'Kunafa'],
      adventure: ['Desert safari', 'Dune bashing', 'Skydiving over Palm Jumeirah'],
      beach: ['JBR Beach', 'Kite Beach', 'La Mer', 'Palm Jumeirah'],
      general: ['Dubai Marina', 'Gold Souk', 'Miracle Garden', 'Global Village']
    },
    food_spots: {
      breakfast: 'Shakshuka at a local café',
      lunch: 'Shawarma wrap from a street vendor',
      dinner: 'Mandi at a traditional restaurant'
    },
    accommodation: 'A hotel near Dubai Marina or Downtown',
    tips: [
      'Visit in winter for better weather',
      'Book desert safari in advance',
      'Dress modestly in public places',
      'Take the Metro to avoid traffic'
    ]
  },
  cape_town: {
    type: 'beach',
    country: 'South Africa',
    currency: 'Rand',
    language: 'English',
    activities: {
      culture: ['Table Mountain', 'Robben Island', 'Bo-Kaap', 'Castle of Good Hope'],
      food: ['Braai', 'Bobotie', 'Biltong', 'Malva pudding', 'Snoek'],
      adventure: ['Shark cage diving', 'Kirstenbosch hikes', 'Cape Point drive'],
      beach: ['Camps Bay Beach', 'Clifton Beaches', 'Muizenberg Beach', 'Boulders Beach'],
      general: ['V&A Waterfront', 'Kirstenbosch Gardens', 'Chapman\'s Peak Drive']
    },
    food_spots: {
      breakfast: 'Fresh fruit and pastries at a V&A café',
      lunch: 'Biltong and cheese platter',
      dinner: 'Braai at a local restaurant'
    },
    accommodation: 'A hotel in Camps Bay or City Bowl',
    tips: [
      'Take the cable car up Table Mountain',
      'Visit Boulders Beach for penguins',
      'Drive Chapman\'s Peak for sunset',
      'Be aware of safety in city center'
    ]
  }
};

// Default destinations if the user enters something not in our database
const getDefaultDestination = (destination) => {
  const lowerDest = destination.toLowerCase();
  
  // Check if destination exists
  for (const [key, value] of Object.entries(destinations)) {
    if (lowerDest.includes(key) || key.includes(lowerDest)) {
      return value;
    }
  }
  
  // Return generic city if not found
  return {
    type: 'city',
    country: 'Unknown',
    currency: 'Local currency',
    language: 'Local language',
    activities: {
      culture: ['Local museums', 'Historic sites', 'City tours', 'Local markets'],
      food: ['Local cuisine', 'Street food', 'Traditional dishes', 'Cafés and restaurants'],
      adventure: ['Walking tours', 'Sightseeing', 'Day trips', 'Parks and nature'],
      beach: ['Nearby beaches or waterfront'],
      general: ['Main attractions', 'City center', 'Local experiences']
    },
    food_spots: {
      breakfast: 'A local café with traditional breakfast',
      lunch: 'A popular lunch spot',
      dinner: 'A well-rated restaurant'
    },
    accommodation: 'A comfortable hotel in the city center',
    tips: [
      'Learn a few words in the local language',
      'Check local travel guides',
      'Ask locals for recommendations',
      'Be respectful of local customs'
    ]
  };
};

export const generateDefaultItinerary = (destination, duration, budget, preferences) => {
  const destData = getDefaultDestination(destination);
  const prefList = preferences ? preferences.split(',').map(p => p.trim().toLowerCase()) : ['general'];
  
  // Build day-by-day itinerary
  const days = [];
  const activities = [];
  
  // Gather activities based on preferences
  if (prefList.some(p => ['culture', 'history', 'art', 'museum'].includes(p))) {
    activities.push(...destData.activities.culture);
  }
  if (prefList.some(p => ['food', 'cuisine', 'restaurant', 'eating'].includes(p))) {
    activities.push(...destData.activities.food);
  }
  if (prefList.some(p => ['adventure', 'outdoor', 'hike', 'nature'].includes(p))) {
    activities.push(...destData.activities.adventure);
  }
  if (prefList.some(p => ['beach', 'coast', 'water', 'swim'].includes(p))) {
    activities.push(...destData.activities.beach);
  }
  
  // If no preferences matched, use general activities
  if (activities.length === 0) {
    activities.push(...destData.activities.general);
  }
  
  // Add some variety
  if (activities.length < duration * 2) {
    activities.push(...destData.activities.general);
  }
  
  // Shuffle and create days
  const shuffled = [...activities].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(duration, 10); i++) {
    const dayActivities = shuffled.slice(i * 2, i * 2 + 2);
    if (dayActivities.length === 0) break;
    
    days.push({
      day: i + 1,
      title: `Day ${i + 1}: ${dayActivities[0] || 'Explore ' + destination}`,
      activities: dayActivities.length > 0 
        ? dayActivities.map((act, idx) => {
            const times = ['Morning', 'Afternoon', 'Evening'];
            return `${times[idx % times.length]}: ${act}`;
          })
        : [`Morning: Explore ${destination}`, `Afternoon: Local experiences`, `Evening: Relax`],
      meals: {
        breakfast: destData.food_spots.breakfast || 'Local café',
        lunch: destData.food_spots.lunch || 'Popular lunch spot',
        dinner: destData.food_spots.dinner || 'Dinner restaurant'
      },
      accommodation: destData.accommodation || 'Hotel in city center'
    });
  }
  
  // Calculate estimated cost
  let estimatedCost = 'Budget friendly';
  if (budget) {
    const numBudget = parseFloat(budget);
    if (numBudget < 500) estimatedCost = `~$${numBudget} (budget)`;
    else if (numBudget < 1000) estimatedCost = `~$${numBudget} (moderate)`;
    else estimatedCost = `~$${numBudget} (premium)`;
  }
  
  return {
    destination: destination,
    duration: duration,
    days: days,
    tips: destData.tips || ['Enjoy your trip!', 'Stay safe and have fun!'],
    estimatedCost: estimatedCost,
    country: destData.country,
    currency: destData.currency,
    language: destData.language,
    generatedBy: 'WanderAI Default Engine'
  };
};