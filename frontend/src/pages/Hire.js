import React, { useState, useCallback } from 'react';

const vehicles = [
  {
    id: 1,
    name: 'Economy Car',
    description: 'Compact and fuel-efficient for city travel',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'SUV',
    description: 'Spacious and comfortable for family trips',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Van',
    description: 'Perfect for group tours and large families',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Luxury Sedan',
    description: 'Premium comfort for business or leisure',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Tuk-Tuk',
    description: 'Experience authentic Sri Lankan transport',
    image: '/images/taxti.jpg'
  },
  {
    id: 6,
    name: 'Motorcycle',
    description: 'Freedom to explore at your own pace',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop'
  }
];

const rentalServices = [
  { id: 'pickme', name: 'PickMe', url: 'https://www.pickme.lk/', icon: '🚕' },
  { id: 'uber', name: 'Uber', url: 'https://www.uber.com/lk/en/', icon: '🚘' }
];

export default function Hire(){
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleBookClick = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const handleServiceSelect = useCallback((service) => {
    if (selectedVehicle) {
      window.open(service.url, '_blank');
      setSelectedVehicle(null);
    }
  }, [selectedVehicle]);

  const closeModal = useCallback(() => {
    setSelectedVehicle(null);
  }, []);
  
  return (
    <div className="page hire-page">
      <div className="hire-hero">
        <div className="hire-hero-content">
          <h1>🚗 Hire a Vehicle</h1>
          <p className="hire-subtitle">Choose from our wide range of vehicles for your Sri Lankan adventure</p>
        </div>
      </div>

      <div className="container hire-container">
        <div className="hire-intro">
          <h2>Your Perfect Travel Companion</h2>
          <p>Whether you need a car for a day trip or a van for a family tour, we have the perfect vehicle for your needs. All vehicles come with optional driver services.</p>
        </div>

        <div className="vehicles-grid">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-image">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=' + encodeURIComponent(vehicle.name);
                  }}
                />
              </div>
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <p>{vehicle.description}</p>
                <button 
                  className="order-btn"
                  onClick={() => handleBookClick(vehicle)}
                >
                  🚗 Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hire-features">
          <h3>✨ Why Choose Our Services?</h3>
          <div className="features-list">
            <div className="feature-item">
              <span>✅</span>
              <span>Well-maintained vehicles</span>
            </div>
            <div className="feature-item">
              <span>✅</span>
              <span>Experienced drivers available</span>
            </div>
            <div className="feature-item">
              <span>✅</span>
              <span>Flexible rental periods</span>
            </div>
            <div className="feature-item">
              <span>✅</span>
              <span>24/7 customer support</span>
            </div>
            <div className="feature-item">
              <span>✅</span>
              <span>Competitive pricing</span>
            </div>
            <div className="feature-item">
              <span>✅</span>
              <span>Insurance included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Service Selection Modal */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>Choose Rental Service</h2>
            <p className="modal-subtitle">Select how you want to book <strong>{selectedVehicle.name}</strong></p>
            
            <div className="delivery-options">
              {rentalServices.map(service => (
                <button
                  key={service.id}
                  className="delivery-option-btn"
                  onClick={() => handleServiceSelect(service)}
                >
                  <span className="delivery-option-icon">{service.icon}</span>
                  <div className="delivery-option-info">
                    <strong>{service.name}</strong>
                    <small>Click to book online</small>
                  </div>
                  <span className="arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
