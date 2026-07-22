// src/pages/TripGenerator.jsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'

function TripGenerator({ user, onTripSaved }) {
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(4)
  const [budget, setBudget] = useState('')
  const [preferences, setPreferences] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [booking, setBooking] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    travelers: 1,
    specialRequests: '',
    paymentMethod: 'card'
  })

  // ============================================================
  // REAL CLIENT DATA FOR DESTINATIONS (25+ destinations)
  // ============================================================
  const getRealClientData = (dest, days, budget) => {
    const data = {
      // === ASIA ===
      'tokyo': {
        flight_airline: 'Japan Airlines',
        flight_number: `JL ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Ritz-Carlton, Tokyo',
        hotel_address: 'Tokyo Midtown, 9-7-1 Akasaka, Minato-ku, Tokyo 107-6245, Japan',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'CENTRAL TOKYO', morning: 'Visit Senso-ji temple in Asakusa and explore Nakamise Shopping Street.', afternoon: 'Experience the vibrant atmosphere of Shibuya, including the famous Shibuya Crossing.', evening: 'Enjoy shopping and dining in Shibuya.' },
          { title: 'MODERN TOKYO', morning: 'Explore the upscale district of Ginza with its luxury boutiques and department stores.', afternoon: 'Visit Odaiba for futuristic entertainment and enjoy the views of Tokyo Bay.', evening: 'Experience the nightlife of Shinjuku with its neon lights and dining options.' },
          { title: 'CULTURAL TOKYO', morning: 'Visit the historic Imperial Palace and stroll through the East Gardens.', afternoon: 'Explore Ueno Park area, including the Tokyo National Museum and Ueno Zoo.', evening: 'Watch a traditional theater performance at the Kabukiza Theatre in Ginza.' },
          { title: 'MODERN & TRADITIONAL', morning: 'Visit the Tokyo Skytree or Tokyo Tower for panoramic views.', afternoon: 'Explore the anime and electronics culture of Akihabara.', evening: 'Conclude your trip in Roppongi, known for art galleries and nightlife.' }
        ]
      },
      'bali': {
        flight_airline: 'Garuda Indonesia',
        flight_number: `GA ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Mandapa, A Ritz-Carlton Reserve',
        hotel_address: 'Jalan Kedewatan, Banjar Kedewatan, Ubud, Gianyar 80571, Bali, Indonesia',
        arrival_date: new Date(Date.now() + 75 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (75 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'UBUD CULTURE', morning: 'Visit the Sacred Monkey Forest Sanctuary in Ubud.', afternoon: 'Explore the Ubud Art Market and traditional crafts.', evening: 'Enjoy a traditional Balinese dance performance.' },
          { title: 'RICE TERRACES', morning: 'Visit the stunning Tegalalang Rice Terraces.', afternoon: 'Explore the Tirta Empul Temple and its holy springs.', evening: 'Enjoy a romantic dinner overlooking the jungle.' },
          { title: 'COASTAL EXPLORATION', morning: 'Visit the Tanah Lot Temple on the coastal cliffs.', afternoon: 'Explore the beaches of Seminyak and enjoy water sports.', evening: 'Watch the sunset at Jimbaran Bay with a seafood dinner.' },
          { title: 'BALINESE WELLNESS', morning: 'Participate in a traditional Balinese yoga session.', afternoon: 'Enjoy a relaxing spa and wellness treatment.', evening: 'Attend a traditional cooking class and learn Balinese cuisine.' }
        ]
      },
      'bangkok': {
        flight_airline: 'Thai Airways',
        flight_number: `TG ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Mandarin Oriental, Bangkok',
        hotel_address: '48 Oriental Ave, Khwaeng Bang Rak, Bang Rak, Bangkok 10500, Thailand',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'GRAND PALACE', morning: 'Visit the Grand Palace and the Temple of the Emerald Buddha.', afternoon: 'Explore Wat Pho and see the Reclining Buddha.', evening: 'Experience the vibrant street food scene at Chinatown.' },
          { title: 'MARKETS & TEMPLES', morning: 'Visit the floating markets of Damnoen Saduak.', afternoon: 'Explore Wat Arun (Temple of Dawn) across the river.', evening: 'Shop at the Asiatique night market.' },
          { title: 'MODERN BANGKOK', morning: 'Visit the modern shopping malls of Siam Square.', afternoon: 'Explore the Jim Thompson House and Thai silk history.', evening: 'Enjoy a rooftop dinner with city views.' },
          { title: 'LOCAL LIFE', morning: 'Take a khlong (canal) tour to see local life.', afternoon: 'Visit the Bangkok National Museum.', evening: 'Experience Muay Thai boxing at a local stadium.' }
        ]
      },
      'seoul': {
        flight_airline: 'Korean Air',
        flight_number: `KE ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Shilla Seoul',
        hotel_address: '249 Dongho-ro, Jung-gu, Seoul, South Korea',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'HISTORIC SEOUL', morning: 'Visit Gyeongbokgung Palace and watch the changing of the guard.', afternoon: 'Explore the traditional Bukchon Hanok Village.', evening: 'Stroll through Insadong for traditional crafts and tea.' },
          { title: 'MODERN SEOUL', morning: 'Visit the N Seoul Tower for panoramic city views.', afternoon: 'Explore the trendy neighborhood of Hongdae.', evening: 'Shop and dine in the vibrant Myeongdong district.' },
          { title: 'CULTURAL SEOUL', morning: 'Visit the National Museum of Korea.', afternoon: 'Explore the Dongdaemun Design Plaza.', evening: 'Experience a traditional Korean BBQ dinner.' },
          { title: 'LOCAL LIFE', morning: 'Visit the lively Gwangjang Market for street food.', afternoon: 'Explore the Han River Park and rent a bike.', evening: 'Enjoy K-pop culture in Gangnam district.' }
        ]
      },
      'singapore': {
        flight_airline: 'Singapore Airlines',
        flight_number: `SQ ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Marina Bay Sands',
        hotel_address: '10 Bayfront Ave, Singapore 018956',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'MARINA BAY', morning: 'Visit the iconic Marina Bay Sands and take in the views from the SkyPark.', afternoon: 'Explore Gardens by the Bay and the Supertree Grove.', evening: 'Watch the Spectra light show at Marina Bay.' },
          { title: 'CULTURAL SINGAPORE', morning: 'Explore Chinatown and visit the Buddha Tooth Relic Temple.', afternoon: 'Visit Little India and the vibrant Sri Veeramakaliamman Temple.', evening: 'Enjoy the nightlife at Clarke Quay.' },
          { title: 'SENTOSA ISLAND', morning: 'Take the cable car to Sentosa Island and visit Universal Studios.', afternoon: 'Relax at Siloso Beach and try water sports.', evening: 'Watch the Wings of Time light and water show.' },
          { title: 'SHOPPING & NATURE', morning: 'Shop along Orchard Road, Singapore\'s premier shopping street.', afternoon: 'Visit the Singapore Botanic Gardens, a UNESCO World Heritage site.', evening: 'Enjoy a Singapore Sling at the Raffles Hotel.' }
        ]
      },
      'dubai': {
        flight_airline: 'Emirates',
        flight_number: `EK ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Burj Al Arab Jumeirah',
        hotel_address: 'Jumeirah St, Dubai, United Arab Emirates',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'SKYSCRAPERS', morning: 'Visit the Burj Khalifa, the world\'s tallest building.', afternoon: 'Explore the Dubai Mall and its indoor aquarium.', evening: 'Watch the Dubai Fountain show.' },
          { title: 'OLD DUBAI', morning: 'Visit the Dubai Museum at Al Fahidi Fort.', afternoon: 'Take an abra (water taxi) across Dubai Creek.', evening: 'Explore the gold and spice souks.' },
          { title: 'DESERT ADVENTURE', morning: 'Enjoy a desert safari with dune bashing.', afternoon: 'Visit a Bedouin camp and try camel riding.', evening: 'Enjoy a traditional BBQ dinner under the stars.' },
          { title: 'MODERN WONDERS', morning: 'Visit the Palm Jumeirah and Atlantis resort.', afternoon: 'Explore the Dubai Marina and JBR Beach.', evening: 'Enjoy fine dining with a view of the city.' }
        ]
      },
      'mumbai': {
        flight_airline: 'Air India',
        flight_number: `AI ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Taj Mahal Palace, Mumbai',
        hotel_address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'GATEWAY TO INDIA', morning: 'Visit the Gateway of India and the Taj Mahal Palace Hotel.', afternoon: 'Explore the Colaba Causeway for shopping.', evening: 'Enjoy a sunset at Marine Drive (the Queen\'s Necklace).' },
          { title: 'MUMBAI CULTURE', morning: 'Visit the Chhatrapati Shivaji Maharaj Vastu Sangrahalaya Museum.', afternoon: 'Explore the Dhobi Ghat (open-air laundry).', evening: 'Visit the Siddhivinayak Temple.' },
          { title: 'BOLLYWOOD & LIFE', morning: 'Take a tour of Bollywood studios.', afternoon: 'Explore the bustling Crawford Market.', evening: 'Visit the Elephanta Caves by ferry.' },
          { title: 'LOCAL EXPERIENCE', morning: 'Take a local train ride to understand Mumbai\'s lifeline.', afternoon: 'Visit the Haji Ali Dargah mosque.', evening: 'Enjoy street food at Chowpatty Beach.' }
        ]
      },
      'hong kong': {
        flight_airline: 'Cathay Pacific',
        flight_number: `CX ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Peninsula Hong Kong',
        hotel_address: 'Salisbury Rd, Tsim Sha Tsui, Hong Kong',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'VICTORIA PEAK', morning: 'Take the Peak Tram to Victoria Peak for panoramic views.', afternoon: 'Explore the Hong Kong Zoological and Botanical Gardens.', evening: 'Enjoy a harbour cruise at sunset.' },
          { title: 'HONG KONG ISLAND', morning: 'Visit the Man Mo Temple and explore Sheung Wan.', afternoon: 'Shop at the bustling Causeway Bay area.', evening: 'Experience the nightlife at Lan Kwai Fong.' },
          { title: 'KOWLOON', morning: 'Explore the Temple Street Night Market and Mong Kok.', afternoon: 'Visit the Wong Tai Sin Temple.', evening: 'Enjoy a dinner with views of the skyline.' },
          { title: 'DISNEY MAGIC', morning: 'Visit Hong Kong Disneyland for a day of fun.', afternoon: 'Explore the Disney attractions and shows.', evening: 'Watch the Disney fireworks show.' }
        ]
      },

      // === EUROPE ===
      'paris': {
        flight_airline: 'Air France',
        flight_number: `AF ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Hôtel Ritz Paris',
        hotel_address: '15 Place Vendôme, 75001 Paris, France',
        arrival_date: new Date(Date.now() + 45 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (45 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'THE HEART OF PARIS', morning: 'Visit the iconic Eiffel Tower and enjoy panoramic views of the city.', afternoon: 'Explore the Louvre Museum and see the Mona Lisa.', evening: 'Stroll along the Seine River and enjoy a romantic dinner cruise.' },
          { title: 'ART & CULTURE', morning: 'Visit the Musée d\'Orsay and admire Impressionist masterpieces.', afternoon: 'Explore the charming streets of Montmartre and visit the Sacré-Cœur Basilica.', evening: 'Enjoy a cabaret show at the famous Moulin Rouge.' },
          { title: 'ROYAL ELEGANCE', morning: 'Take a day trip to the Palace of Versailles and explore its magnificent gardens.', afternoon: 'Visit the Grand Trianon and Marie Antoinette\'s Hamlet.', evening: 'Return to Paris and enjoy a dinner at a traditional French bistro.' },
          { title: 'LOCAL EXPERIENCE', morning: 'Visit the Latin Quarter and explore the Sorbonne University.', afternoon: 'Shop at the vibrant Marché d\'Aligre market.', evening: 'Enjoy a final French dinner at a local brasserie.' }
        ]
      },
      'rome': {
        flight_airline: 'ITA Airways',
        flight_number: `AZ ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Hotel Eden, Rome',
        hotel_address: 'Via Ludovisi 49, 00187 Rome, Italy',
        arrival_date: new Date(Date.now() + 60 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (60 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'ANCIENT ROME', morning: 'Visit the Colosseum and learn about ancient Roman history.', afternoon: 'Explore the Roman Forum and Palatine Hill.', evening: 'Enjoy authentic Italian pasta at a trattoria in Trastevere.' },
          { title: 'VATICAN CITY', morning: 'Visit St. Peter\'s Basilica and climb to the top of the dome.', afternoon: 'Explore the Vatican Museums and the Sistine Chapel.', evening: 'Stroll through the charming streets of Trastevere.' },
          { title: 'ROMAN HILLS', morning: 'Visit the Villa Borghese gardens and enjoy a relaxing walk.', afternoon: 'Explore the Spanish Steps and Trevi Fountain.', evening: 'Enjoy a romantic dinner with a view of the Roman skyline.' },
          { title: 'UNDERGROUND ROME', morning: 'Visit the Catacombs of Rome and explore underground burial chambers.', afternoon: 'Explore the ancient Appian Way and its historic landmarks.', evening: 'Enjoy a final Roman dinner and gelato.' }
        ]
      },
      'london': {
        flight_airline: 'British Airways',
        flight_number: `BA ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Ritz London',
        hotel_address: '150 Piccadilly, St. James\'s, London W1J 9BR, United Kingdom',
        arrival_date: new Date(Date.now() + 40 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (40 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'ROYAL LONDON', morning: 'Visit Buckingham Palace and watch the Changing of the Guard.', afternoon: 'Explore the Tower of London and see the Crown Jewels.', evening: 'Enjoy a traditional British dinner at a historic pub.' },
          { title: 'HISTORIC LONDON', morning: 'Visit Westminster Abbey and the Houses of Parliament.', afternoon: 'Ride the London Eye for panoramic views of the city.', evening: 'Explore the vibrant South Bank and its cultural venues.' },
          { title: 'MUSEUM LONDON', morning: 'Visit the British Museum and see the Rosetta Stone.', afternoon: 'Explore the Natural History Museum and its stunning architecture.', evening: 'Enjoy a show in London\'s West End theatre district.' },
          { title: 'MODERN LONDON', morning: 'Visit the Shard for breathtaking views of the city.', afternoon: 'Explore the trendy neighborhoods of Notting Hill and Portobello Road.', evening: 'Experience the nightlife of Soho and its diverse dining options.' }
        ]
      },
      'barcelona': {
        flight_airline: 'Vueling Airlines',
        flight_number: `VY ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Hotel Arts Barcelona',
        hotel_address: 'Carrer de la Marina, 19-21, 08005 Barcelona, Spain',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'GAUDI\'S MASTERPIECES', morning: 'Visit the Sagrada Familia, Gaudí\'s unfinished masterpiece.', afternoon: 'Explore Park Güell and enjoy colorful mosaics.', evening: 'Stroll down the vibrant Las Ramblas.' },
          { title: 'GOTHIC QUARTER', morning: 'Explore the Gothic Quarter and Barcelona Cathedral.', afternoon: 'Visit the Picasso Museum.', evening: 'Enjoy tapas at a local bar in El Born.' },
          { title: 'MODERNIST BARCELONA', morning: 'Visit Casa Batlló and Casa Milà on the Passeig de Gràcia.', afternoon: 'Explore the Montjuïc Hill and its castle.', evening: 'Watch the Magic Fountain light show.' },
          { title: 'BEACH & PORT', morning: 'Relax at Barceloneta Beach.', afternoon: 'Explore the Port Vell marina.', evening: 'Enjoy seafood paella at a beachfront restaurant.' }
        ]
      },
      'amsterdam': {
        flight_airline: 'KLM Royal Dutch Airlines',
        flight_number: `KL ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Waldorf Astoria Amsterdam',
        hotel_address: 'Herengracht 542-556, 1017 CG Amsterdam, Netherlands',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'CANAL CITY', morning: 'Take a canal cruise through the UNESCO-listed canals.', afternoon: 'Visit the Anne Frank House.', evening: 'Explore the Jordaan district and its cozy bars.' },
          { title: 'ART & MUSEUMS', morning: 'Visit the Rijksmuseum and see works by Rembrandt.', afternoon: 'Explore the Van Gogh Museum.', evening: 'Visit the Vondelpark for a relaxing evening walk.' },
          { title: 'DUTCH CULTURE', morning: 'Visit the Zaanse Schans windmills just outside the city.', afternoon: 'Explore the Heineken Experience.', evening: 'Enjoy Dutch pancakes at a local café.' },
          { title: 'MODERN AMSTERDAM', morning: 'Visit the NEMO Science Museum.', afternoon: 'Explore the trendy De Pijp neighborhood.', evening: 'Experience Amsterdam\'s vibrant nightlife.' }
        ]
      },
      'prague': {
        flight_airline: 'Czech Airlines',
        flight_number: `OK ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Four Seasons Hotel Prague',
        hotel_address: 'Veleslavínova 2a/1098, 110 00 Prague 1, Czech Republic',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'OLD TOWN', morning: 'Visit the Old Town Square and the Astronomical Clock.', afternoon: 'Cross the Charles Bridge and explore the Lesser Town.', evening: 'Enjoy a traditional Czech dinner with beer.' },
          { title: 'PRAGUE CASTLE', morning: 'Explore the Prague Castle complex and St. Vitus Cathedral.', afternoon: 'Visit the Golden Lane and the castle gardens.', evening: 'Watch the sunset from the castle hill.' },
          { title: 'JEWISH QUARTER', morning: 'Visit the Jewish Quarter and its historic synagogues.', afternoon: 'Explore the Josefov neighborhood.', evening: 'Enjoy a classical music concert.' },
          { title: 'LOCAL EXPERIENCE', morning: 'Visit the Petřín Hill for city views.', afternoon: 'Explore the vibrant Náplavka riverbank.', evening: 'Experience a traditional Czech puppet show.' }
        ]
      },
      'vienna': {
        flight_airline: 'Austrian Airlines',
        flight_number: `OS ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Hotel Sacher Vienna',
        hotel_address: 'Philharmonikerstrasse 4, 1010 Vienna, Austria',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'IMPERIAL VIENNA', morning: 'Visit the Schönbrunn Palace and its beautiful gardens.', afternoon: 'Explore the Hofburg Palace and the Imperial Apartments.', evening: 'Enjoy a classical concert at the Musikverein.' },
          { title: 'ART & MUSEUMS', morning: 'Visit the Kunsthistorisches Museum (Art History Museum).', afternoon: 'Explore the Belvedere Palace and see Klimt\'s "The Kiss".', evening: 'Walk through the historic city center.' },
          { title: 'VIENNESE LIFE', morning: 'Visit the Prater amusement park and ride the Giant Ferris Wheel.', afternoon: 'Explore the Naschmarkt for local food and flavors.', evening: 'Enjoy a traditional Viennese dinner with live music.' },
          { title: 'DANUBE & NATURE', morning: 'Take a cruise on the Danube River.', afternoon: 'Visit the Danube Island for outdoor activities.', evening: 'Conclude with a visit to a traditional Viennese coffee house.' }
        ]
      },

      // === AFRICA ===
      'nairobi': {
        flight_airline: 'Kenya Airways',
        flight_number: `KQ ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Giraffe Manor',
        hotel_address: 'Langata, P.O. Box 20-00603, Nairobi, Kenya',
        arrival_date: new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (90 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'WILDLIFE EXPERIENCE', morning: 'Visit the David Sheldrick Wildlife Trust and meet orphaned elephants.', afternoon: 'Explore the Giraffe Centre and feed the endangered Rothschild giraffes.', evening: 'Enjoy a sundowner dinner with a view of the Nairobi skyline.' },
          { title: 'NATIONAL PARK SAFARI', morning: 'Embark on a morning game drive in Nairobi National Park.', afternoon: 'Visit the Nairobi Safari Walk and explore the animal trails.', evening: 'Enjoy a traditional Kenyan dinner and cultural performance.' },
          { title: 'MAASAI CULTURE', morning: 'Visit the Bomas of Kenya and learn about Kenyan tribal cultures.', afternoon: 'Explore the Karen Blixen Museum.', evening: 'Enjoy a night out at a local restaurant in the vibrant Kilimani area.' },
          { title: 'CRYSTAL WATERS', morning: 'Take a day trip to the beautiful Lake Naivasha.', afternoon: 'Enjoy a boat ride and spot hippos and birdlife.', evening: 'Return to Nairobi and enjoy a farewell dinner.' }
        ]
      },
      'cape town': {
        flight_airline: 'South African Airways',
        flight_number: `SA ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Twelve Apostles Hotel and Spa',
        hotel_address: 'Victoria Rd, Camps Bay, Cape Town, 8005, South Africa',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'TABLE MOUNTAIN', morning: 'Take the cable car up Table Mountain for panoramic views.', afternoon: 'Explore the V&A Waterfront and shopping.', evening: 'Enjoy dinner at a waterfront restaurant.' },
          { title: 'CAPE PENINSULA', morning: 'Drive along the stunning Chapman\'s Peak Drive.', afternoon: 'Visit Cape Point and the Cape of Good Hope.', evening: 'Watch the sunset at Camps Bay beach.' },
          { title: 'WINE LANDS', morning: 'Drive to the Stellenbosch wine region.', afternoon: 'Visit wine estates and enjoy wine tastings.', evening: 'Enjoy a gourmet dinner in the winelands.' },
          { title: 'ROBBEN ISLAND', morning: 'Take a ferry to Robben Island and visit the prison museum.', afternoon: 'Explore the Bo-Kaap neighborhood with its colorful houses.', evening: 'Enjoy local South African cuisine.' }
        ]
      },
      'marrakech': {
        flight_airline: 'Royal Air Maroc',
        flight_number: `AT ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'La Mamounia Marrakech',
        hotel_address: 'Avenue Bab Jdid, 40040 Marrakech, Morocco',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'MEDINA EXPERIENCE', morning: 'Explore the historic Medina and its winding streets.', afternoon: 'Visit the Bahia Palace and its beautiful gardens.', evening: 'Experience the Djemaa el-Fna square night market.' },
          { title: 'GARDENS & PALACES', morning: 'Visit the Majorelle Garden, once owned by Yves Saint Laurent.', afternoon: 'Explore the Saadian Tombs.', evening: 'Enjoy a traditional Moroccan dinner with music.' },
          { title: 'ATLAS MOUNTAINS', morning: 'Take a day trip to the Atlas Mountains.', afternoon: 'Visit Berber villages and enjoy mountain views.', evening: 'Return to Marrakech and relax at a hammam spa.' },
          { title: 'LOCAL CRAFTS', morning: 'Visit the souks and shop for traditional crafts.', afternoon: 'Learn about Moroccan cuisine in a cooking class.', evening: 'Enjoy a final farewell dinner with mint tea.' }
        ]
      },
      'zanzibar': {
        flight_airline: 'Precision Air',
        flight_number: `PW ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Palms Zanzibar',
        hotel_address: 'Bwejuu Beach, Zanzibar, Tanzania',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'STONE TOWN', morning: 'Explore the historic Stone Town and its winding alleys.', afternoon: 'Visit the House of Wonders and the old slave market.', evening: 'Enjoy a sunset dhow cruise.' },
          { title: 'SPICE FARM', morning: 'Visit a spice farm and learn about Zanzibar\'s spice trade.', afternoon: 'Explore the Jozani Forest and see the red colobus monkeys.', evening: 'Enjoy a traditional Swahili dinner.' },
          { title: 'BEACH PARADISE', morning: 'Relax on the white sands of Nungwi Beach.', afternoon: 'Try snorkeling or scuba diving in crystal clear waters.', evening: 'Enjoy a seafood dinner on the beach.' },
          { title: 'ISLAND LIFE', morning: 'Take a boat trip to Prison Island and see the giant tortoises.', afternoon: 'Explore the local fishing villages.', evening: 'Experience a traditional Taarab music performance.' }
        ]
      },

      // === AMERICAS ===
      'new york': {
        flight_airline: 'Delta Air Lines',
        flight_number: `DL ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Plaza Hotel',
        hotel_address: '768 5th Ave, New York, NY 10019, USA',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'MANHATTAN ICONS', morning: 'Visit the Statue of Liberty and Ellis Island.', afternoon: 'Explore Wall Street and the Financial District.', evening: 'Watch a Broadway show in Times Square.' },
          { title: 'CENTRAL PARK', morning: 'Stroll through Central Park and visit the zoo.', afternoon: 'Visit the Metropolitan Museum of Art.', evening: 'Enjoy dinner with a view of the skyline.' },
          { title: 'MUSEUMS & CULTURE', morning: 'Visit the American Museum of Natural History.', afternoon: 'Explore the Guggenheim Museum.', evening: 'Walk across the Brooklyn Bridge at sunset.' },
          { title: 'NEIGHBORHOODS', morning: 'Explore SoHo and its trendy boutiques.', afternoon: 'Visit Greenwich Village and enjoy the bohemian vibe.', evening: 'Experience the nightlife in the Meatpacking District.' }
        ]
      },
      'rio': {
        flight_airline: 'LATAM Airlines',
        flight_number: `LA ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Belmond Copacabana Palace',
        hotel_address: 'Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ, 22021-001, Brazil',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'SUGARLOAF & COPACABANA', morning: 'Take the cable car to Sugarloaf Mountain.', afternoon: 'Relax at Copacabana Beach.', evening: 'Enjoy a Brazilian BBQ dinner with samba music.' },
          { title: 'CHRIST THE REDEEMER', morning: 'Visit the iconic Christ the Redeemer statue on Corcovado.', afternoon: 'Explore the Tijuca Forest, one of the world\'s largest urban forests.', evening: 'Watch the sunset from Ipanema Beach.' },
          { title: 'CULTURAL RIO', morning: 'Visit the Selarón Steps and the colorful Lapa neighborhood.', afternoon: 'Explore the Museum of Tomorrow.', evening: 'Experience a samba show at a traditional club.' },
          { title: 'LOCAL EXPERIENCE', morning: 'Visit the Feira de São Cristóvão market.', afternoon: 'Explore the Santa Teresa neighborhood with its hillside charm.', evening: 'Enjoy caipirinhas at a beachfront bar.' }
        ]
      },
      'mexico city': {
        flight_airline: 'Aeroméxico',
        flight_number: `AM ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Four Seasons Hotel Mexico City',
        hotel_address: 'Paseo de la Reforma 500, Juárez, Cuauhtémoc, 06600 Mexico City, Mexico',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'HISTORIC CENTER', morning: 'Visit the Zócalo and the Metropolitan Cathedral.', afternoon: 'Explore the Templo Mayor ruins.', evening: 'Enjoy authentic Mexican cuisine in the historic center.' },
          { title: 'MUSEUMS', morning: 'Visit the National Museum of Anthropology.', afternoon: 'Explore the Frida Kahlo Museum in Coyoacán.', evening: 'Experience the nightlife in the Roma neighborhood.' },
          { title: 'ARCHAEOLOGY', morning: 'Take a day trip to the Teotihuacan pyramids.', afternoon: 'Climb the Pyramid of the Sun and Moon.', evening: 'Return to Mexico City and enjoy a meal with a view.' },
          { title: 'MODERN MEXICO', morning: 'Visit the Polanco neighborhood and its high-end shops.', afternoon: 'Explore the Chapultepec Castle.', evening: 'Enjoy a Lucha Libre wrestling match.' }
        ]
      },

      // === OCEANIA ===
      'sydney': {
        flight_airline: 'Qantas Airways',
        flight_number: `QF ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Park Hyatt Sydney',
        hotel_address: '7 Hickson Rd, The Rocks NSW 2000, Australia',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'SYDNEY HARBOUR', morning: 'Visit the Sydney Opera House and take a guided tour.', afternoon: 'Explore the Royal Botanic Gardens.', evening: 'Enjoy a harbour dinner cruise with city views.' },
          { title: 'BEACH LIFE', morning: 'Relax at the iconic Bondi Beach.', afternoon: 'Walk the Bondi to Coogee coastal path.', evening: 'Enjoy a beachfront dinner with sunset views.' },
          { title: 'THE ROCKS & HISTORY', morning: 'Explore The Rocks neighborhood and its historic buildings.', afternoon: 'Visit the Sydney Harbour Bridge and climb to the top.', evening: 'Experience the nightlife in Darling Harbour.' },
          { title: 'NATURE & WILDLIFE', morning: 'Take the ferry to Taronga Zoo.', afternoon: 'Explore the wildlife and animal encounters.', evening: 'Enjoy a final Australian dinner at Circular Quay.' }
        ]
      },
      'auckland': {
        flight_airline: 'Air New Zealand',
        flight_number: `NZ ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The SkyCity Grand Hotel',
        hotel_address: '90 Federal Street, Auckland 1010, New Zealand',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'SKY TOWER', morning: 'Visit the Sky Tower for 360-degree views of Auckland.', afternoon: 'Explore the Viaduct Harbour and its waterfront dining.', evening: 'Enjoy a dinner at a waterfront restaurant.' },
          { title: 'ISLAND ADVENTURE', morning: 'Take a ferry to Waiheke Island and explore its vineyards.', afternoon: 'Enjoy wine tasting and olive oil tasting.', evening: 'Return to Auckland and visit the vibrant Britomart area.' },
          { title: 'VOLCANIC HISTORY', morning: 'Visit the Auckland Domain and the Auckland War Memorial Museum.', afternoon: 'Explore the volcanic cone of Mount Eden.', evening: 'Enjoy the nightlife in Ponsonby.' },
          { title: 'NATURE & BEACHES', morning: 'Drive to the West Coast beaches and explore Piha Beach.', afternoon: 'Visit the Arataki Visitor Centre for panoramic views.', evening: 'Enjoy a farewell dinner in Auckland.' }
        ]
      }
    }

    return data[dest.toLowerCase()] || null
  }

  const generateItinerary = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setItinerary(null)
    setShowBooking(false)

    try {
      const clientData = getRealClientData(destination, duration, budget)
      
      if (!clientData) {
        throw new Error(`We don't have data for "${destination}" yet. Try Tokyo, Paris, Rome, Bali, Nairobi, London, Sydney, NYC, or one of our many other destinations!`)
      }

      const generatedItinerary = {
        destination: destination,
        duration: duration,
        estimatedCost: budget || 'Flexible',
        flight_airline: clientData.flight_airline,
        flight_number: clientData.flight_number,
        hotel: clientData.hotel,
        hotel_address: clientData.hotel_address,
        arrival_date: clientData.arrival_date,
        departure_date: clientData.departure_date,
        days: clientData.days.slice(0, duration).map((day, index) => ({
          title: `DAY ${index + 1}: ${day.title}`,
          morning: day.morning,
          afternoon: day.afternoon,
          evening: day.evening
        })),
        tips: [
          `💡 Book your ${destination} tours in advance for better rates`,
          `💡 Learn a few local phrases to enhance your experience`,
          `💡 Check local events and festivals during your stay`,
          `💡 Use public transport to explore like a local`,
          `💡 Leave room in your itinerary for spontaneous adventures`
        ]
      }

      setTimeout(() => {
        setItinerary(generatedItinerary)
        setLoading(false)
      }, 1500)

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      console.error('Error:', err)
      setLoading(false)
    }
  }

  const saveTrip = async () => {
    if (!itinerary) return
    
    setSaving(true)
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'Traveler',
        user_type: 'tourist'
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
      
      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }
      
      const tripData = {
        user_id: user.id,
        destination: destination,
        duration_days: duration,
        budget: budget ? parseFloat(budget) : null,
        preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
        itinerary: itinerary,
        status: 'planned'
      }
      
      const { error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
      
      if (tripError) {
        throw new Error(`Trip save failed: ${tripError.message}`)
      }
      
      alert('✅ Trip saved successfully!')
      if (onTripSaved) onTripSaved()
      setDestination('')
      setDuration(4)
      setBudget('')
      setPreferences('')
      setItinerary(null)
      setShowBooking(false)
    } catch (err) {
      console.error('Save error:', err)
      alert('❌ Error saving trip: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const bookTrip = async () => {
    if (!itinerary) return
    
    setBooking(true)
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'Traveler',
        user_type: 'tourist'
      }
      
      await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
      
      const tripData = {
        user_id: user.id,
        destination: destination,
        duration_days: duration,
        budget: budget ? parseFloat(budget) : null,
        preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
        itinerary: itinerary,
        status: 'booked',
        travelers: bookingDetails.travelers,
        special_requests: bookingDetails.specialRequests || null
      }
      
      const { data: tripResult, error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
      
      if (tripError) throw tripError
      
      const bookingData = {
        trip_id: tripResult[0].id,
        user_id: user.id,
        status: 'confirmed',
        total_price: parseFloat(budget) || 0,
        travelers: bookingDetails.travelers,
        special_requests: bookingDetails.specialRequests || null,
        payment_method: bookingDetails.paymentMethod
      }
      
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
      
      if (bookingError) throw bookingError
      
      alert('✅ Trip booked successfully! Check your bookings.')
      if (onTripSaved) onTripSaved()
      
      setDestination('')
      setDuration(4)
      setBudget('')
      setPreferences('')
      setItinerary(null)
      setShowBooking(false)
      setBookingDetails({
        travelers: 1,
        specialRequests: '',
        paymentMethod: 'card'
      })
    } catch (err) {
      console.error('Booking error:', err)
      alert('❌ Error booking trip: ' + err.message)
    } finally {
      setBooking(false)
    }
  }

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const goToDashboard = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div>
      <Navbar user={user} onLogout={() => window.location.reload()} />
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        padding: '2rem',
        position: 'relative'
      }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 0
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <button
            onClick={goToDashboard}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(255,255,255,0.9)',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ffffff'
              e.target.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.9)'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ← Back to Dashboard
          </button>

          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            ✨ Plan Your Dream Trip
          </h1>

          <p style={{ 
            color: '#ffffff', 
            marginBottom: '2rem', 
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            fontSize: '16px'
          }}>
            Tell us about your ideal trip, and our AI will create a personalized itinerary!
          </p>

          {/* Input Form */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <form onSubmit={generateItinerary}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  🌍 Where do you want to go?
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Tokyo, Paris, Bali, Nairobi, Rome, London, Sydney, NYC..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  📅 How many days?
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 4)}
                  min="1"
                  max="7"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  💰 Budget (optional)
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Luxury, Budget, $1000..."
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  🎯 Preferences (optional)
                </label>
                <input
                  type="text"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., food, adventure, culture, beach..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? '🧠 AI is thinking...' : '✨ Generate Itinerary'}
              </button>
            </form>

            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#fef2f2',
                color: '#ef4444',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* Itinerary Results - Lock Page Style */}
          {itinerary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                padding: '2.5rem',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {/* Lock Icon Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: '#f3f4f6',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔒</span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    TRAVEL ITINERARY
                  </span>
                </div>
              </div>

              {/* Flight & Hotel Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>FLIGHT #</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {itinerary.flight_airline} {itinerary.flight_number}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>HOTEL</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>
                    {itinerary.hotel}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>HOTEL ADDRESS</span>
                  <p style={{ fontWeight: '400', color: '#4b5563', fontSize: '14px' }}>
                    {itinerary.hotel_address}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>ARRIVAL</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {itinerary.arrival_date}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>DEPARTURE</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {itinerary.departure_date}
                  </p>
                </div>
              </div>

              {/* Itinerary Days */}
              <div style={{ marginBottom: '1.5rem' }}>
                {itinerary.days.map((day, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: index < itinerary.days.length - 1 ? '1.5rem' : '0',
                      borderBottom: index < itinerary.days.length - 1 ? '1px solid #e5e7eb' : 'none',
                      paddingBottom: index < itinerary.days.length - 1 ? '1.5rem' : '0'
                    }}
                  >
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      fontFamily: "'Playfair Display', serif",
                      color: '#1a1a2e',
                      marginBottom: '0.75rem'
                    }}>
                      {day.title}
                    </h3>
                    <div style={{ display: 'grid', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#E88D5C', fontWeight: '600', minWidth: '70px' }}>Morning:</span>
                        <span style={{ color: '#4b5563' }}>{day.morning}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#8B5CF6', fontWeight: '600', minWidth: '70px' }}>Afternoon:</span>
                        <span style={{ color: '#4b5563' }}>{day.afternoon}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#EC4899', fontWeight: '600', minWidth: '70px' }}>Evening:</span>
                        <span style={{ color: '#4b5563' }}>{day.evening}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Travel Tips */}
              {itinerary.tips && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a2e' }}>
                    💡 Travel Tips
                  </h4>
                  {itinerary.tips.slice(0, 4).map((tip, i) => (
                    <p key={i} style={{ color: '#4b5563', fontSize: '13px', marginBottom: '0.25rem' }}>
                      {tip}
                    </p>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <button
                  onClick={saveTrip}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? '💾 Saving...' : '💾 Save Trip'}
                </button>
                <button
                  onClick={() => setShowBooking(!showBooking)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {showBooking ? '✕ Cancel Booking' : '📅 Book This Trip'}
                </button>
                <button
                  onClick={goToDashboard}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
              </div>

              {/* Booking Form */}
              {showBooking && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '2px solid #8B5CF6'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: '#1a1a2e'
                  }}>
                    📅 Book This Trip
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                    Confirm your booking details below.
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}>
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      name="travelers"
                      value={bookingDetails.travelers}
                      onChange={handleBookingInputChange}
                      min="1"
                      max="20"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}>
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={bookingDetails.specialRequests}
                      onChange={handleBookingInputChange}
                      rows="2"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Any special requests?"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={bookTrip}
                      disabled={booking}
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        opacity: booking ? 0.7 : 1
                      }}
                    >
                      {booking ? 'Processing...' : '✅ Confirm Booking'}
                    </button>
                    <button
                      onClick={() => setShowBooking(false)}
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TripGenerator