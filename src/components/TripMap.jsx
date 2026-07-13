// src/components/TripMap.jsx
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers - MUST be outside component
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom marker icon
const createCustomIcon = (color = '#E88D5C') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// Component to fit bounds
function FitBounds({ trips }) {
  const map = useMap()
  
  useEffect(() => {
    if (trips && trips.length > 0) {
      const bounds = trips
        .filter(trip => trip.latitude && trip.longitude)
        .map(trip => [trip.latitude, trip.longitude])
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [trips, map])
  
  return null
}

function TripMap({ trips }) {
  const [selectedTrip, setSelectedTrip] = useState(null)

  // Filter trips with coordinates
  const tripsWithCoords = trips.filter(trip => 
    trip.latitude && trip.longitude
  )

  // Default center (Nairobi, Kenya)
  const defaultCenter = [-1.286389, 36.817223]
  const defaultZoom = 6

  if (tripsWithCoords.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#f9fafb',
        borderRadius: '12px',
        color: '#6b7280'
      }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>🗺️</span>
        <p>No trips with location data yet.</p>
        <p style={{ fontSize: '13px', marginTop: '0.5rem' }}>
          Add coordinates to your trips to see them on the map!
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: '500px', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '12px',
          zIndex: 1
        }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds trips={tripsWithCoords} />

        {tripsWithCoords.map((trip, index) => {
          const colors = ['#E88D5C', '#8B5CF6', '#EC4899', '#22c55e', '#F59E0B', '#3B82F6']
          const color = colors[index % colors.length]
          
          return (
            <Marker
              key={trip.id}
              position={[trip.latitude, trip.longitude]}
              icon={createCustomIcon(color)}
              eventHandlers={{
                click: () => setSelectedTrip(trip)
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', fontWeight: '700' }}>
                    {trip.destination}
                  </h4>
                  <p style={{ margin: '0.25rem 0', fontSize: '13px', color: '#6b7280' }}>
                    📅 {trip.duration_days} days
                  </p>
                  {trip.budget && (
                    <p style={{ margin: '0.25rem 0', fontSize: '13px', color: '#6b7280' }}>
                      💰 ${trip.budget}
                    </p>
                  )}
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    {trip.latitude}, {trip.longitude}
                  </p>
                  <button
                    onClick={() => {
                      alert(`Trip: ${trip.destination}\nDuration: ${trip.duration_days} days\nBudget: $${trip.budget || 'Flexible'}`)
                    }}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#E88D5C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
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
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'white',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px',
        maxWidth: '200px'
      }}>
        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>📍 Your Trips</strong>
        <p style={{ margin: 0, color: '#6b7280' }}>
          {tripsWithCoords.length} location{tripsWithCoords.length !== 1 ? 's' : ''} shown
        </p>
      </div>
    </div>
  )
}

export default TripMap