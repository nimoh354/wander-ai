import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// City coordinates database
const cityCoordinates = {
  'paris': [48.8566, 2.3522],
  'london': [51.5074, -0.1278],
  'tokyo': [35.6762, 139.6503],
  'new york': [40.7128, -74.0060],
  'bali': [-8.3405, 115.0920],
  'rome': [41.9028, 12.4964],
  'dubai': [25.2048, 55.2708],
  'cape town': [-33.9249, 18.4241],
  'sydney': [-33.8688, 151.2093],
  'bangkok': [13.7563, 100.5018],
  'singapore': [1.3521, 103.8198],
  'barcelona': [41.3851, 2.1734],
  'amsterdam': [52.3676, 4.9041],
  'berlin': [52.5200, 13.4050],
  'venice': [45.4408, 12.3155],
  'florence': [43.7696, 11.2558],
  'istanbul': [41.0082, 28.9784],
  'marrakech': [31.6295, -7.9811],
  'rio': [-22.9068, -43.1729],
  'mexico city': [19.4326, -99.1332],
  'milan': [45.4642, 9.1900],
  'vienna': [48.2082, 16.3738],
  'prague': [50.0755, 14.4378],
  'budapest': [47.4979, 19.0402],
  'athens': [37.9838, 23.7275],
  'lisbon': [38.7223, -9.1393],
  'dublin': [53.3498, -6.2603],
  'edinburgh': [55.9533, -3.1883],
  'stockholm': [59.3293, 18.0686],
  'oslo': [59.9139, 10.7522],
  'helsinki': [60.1699, 24.9384],
  'moscow': [55.7558, 37.6173],
  'beijing': [39.9042, 116.4074],
  'shanghai': [31.2304, 121.4737],
  'hong kong': [22.3193, 114.1694],
  'seoul': [37.5665, 126.9780],
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.6139, 77.2090],
  'cairo': [30.0444, 31.2357],
  'nairobi': [-1.2921, 36.8219],
  'lagos': [6.5244, 3.3792],
  'sao paulo': [-23.5505, -46.6333],
  'buenos aires': [-34.6037, -58.3816],
  'toronto': [43.6532, -79.3832],
  'vancouver': [49.2827, -123.1207],
  'san francisco': [37.7749, -122.4194],
  'los angeles': [34.0522, -118.2437],
  'chicago': [41.8781, -87.6298],
  'miami': [25.7617, -80.1918],
  'orlando': [28.5383, -81.3792],
  'las vegas': [36.1699, -115.1398],
  'denver': [39.7392, -104.9903],
  'seattle': [47.6062, -122.3321],
  'portland': [45.5152, -122.6784],
  'austin': [30.2672, -97.7431],
  'nashville': [36.1627, -86.7816],
  'new orleans': [29.9511, -90.0715],
  'honolulu': [21.3156, -157.8589],
  'anchorage': [61.2181, -149.9003]
}

const getCoordinates = (destination) => {
  const lower = destination.toLowerCase()
  for (const [key, coords] of Object.entries(cityCoordinates)) {
    if (lower.includes(key) || key.includes(lower)) {
      return coords
    }
  }
  // Default to a random city if not found
  const cities = Object.values(cityCoordinates)
  return cities[Math.floor(Math.random() * cities.length)]
}

// Component to fit bounds to show all markers
function FitBounds({ trips }) {
  const map = useMap()
  
  useEffect(() => {
    if (trips.length > 0) {
      const bounds = L.latLngBounds([])
      trips.forEach(trip => {
        const coords = getCoordinates(trip.destination)
        bounds.extend(coords)
      })
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [trips, map])
  
  return null
}

function TripMap({ trips, onTripClick }) {
  const defaultCenter = [20, 0]
  const defaultZoom = 2

  return (
    <div style={{
      height: '500px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid rgba(139, 92, 246, 0.08)'
    }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {trips.map((trip) => {
          const coords = getCoordinates(trip.destination)
          return (
            <Marker
              key={trip.id}
              position={coords}
              eventHandlers={{
                click: () => {
                  if (onTripClick) onTripClick(trip)
                }
              }}
            >
              <Popup>
                <div style={{ padding: '0.5rem', maxWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '16px' }}>
                    🗺️ {trip.destination}
                  </h4>
                  <p style={{ margin: '0.25rem 0', fontSize: '12px', color: '#666' }}>
                    📅 {trip.duration_days} days
                  </p>
                  {trip.budget && (
                    <p style={{ margin: '0.25rem 0', fontSize: '12px', color: '#666' }}>
                      💰 ${trip.budget}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      if (onTripClick) onTripClick(trip)
                    }}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#8B5CF6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View Trip
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        <FitBounds trips={trips} />
      </MapContainer>
    </div>
  )
}

export default TripMap