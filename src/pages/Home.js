import React, { useCallback } from 'react';
import places from '../data/places';
import PlaceCard from '../components/PlaceCard';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  
  const view = useCallback((place) => {
    navigate(`/place/${place.id}`);
  }, [navigate]);

  const navigateToDestinations = useCallback(() => {
    navigate('/destinations');
  }, [navigate]);

  const navigateToBook = useCallback(() => {
    navigate('/book');
  }, [navigate]);
  return (
    <div className="page home">
      <header className="hero-home">
        <div className="hero-background-grid">
          <div className="grid-item" style={{backgroundImage: "url('/images/Unawatuna Beach.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Temple of the Sacred Tooth Relic.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Yala National Park.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Horton Plains & World\\'s End.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Arugam Bay.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Ravana Falls.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Sigiriya Rock Fortress.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Nine Arch Bridge.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/taxti.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Mirissa Beach.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Galle Fort.jpg')"}}></div>
          <div className="grid-item" style={{backgroundImage: "url('/images/Lotus Tower.jpg')"}}></div>
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
                  <div className="hero-badge">
          🏝️ DREAM CYLON
        </div>
          <h1 className="hero-title">
            Explore Sri Lanka
            <span className="hero-subtitle-accent">Pearl of the Indian Ocean</span>
          </h1>
          <p className="hero-description">
            Discover the best destinations and book your next adventure.
            <br />
            <span className="hero-highlight">20+ Amazing Locations</span> • 
            <span className="hero-highlight"> Premium Hotels</span> • 
            <span className="hero-highlight"> Unforgettable Experiences</span>
          </p>
          <div className="hero-buttons">
            <button className="hero-btn primary" onClick={navigateToDestinations}>
              🗺️ Explore Destinations
            </button>
            <button className="hero-btn secondary" onClick={navigateToBook}>
              📅 Book Now
            </button>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>↓</span>
        </div>
      </header>
      
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon">🌟</div>
              <h3>Top Destinations</h3>
              <p>Carefully curated locations across Sri Lanka</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">🏨</div>
              <h3>Premium Hotels</h3>
              <p>Stay at the best accommodations</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">🎯</div>
              <h3>Easy Booking</h3>
              <p>Simple and secure reservation process</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">💯</div>
              <h3>Best Prices</h3>
              <p>Competitive rates for all packages</p>
            </div>
          </div>
        </div>
      </section>

      <section className="destinations-section">
        <div className="container">
          <h2 className="section-title">Popular Destinations</h2>
          <p className="section-subtitle">Choose from our handpicked collection of stunning locations</p>
        </div>
        <div className="grid">
          {places.map(p => (
            <PlaceCard key={p.id} place={p} onView={view} />
          ))}
        </div>
      </section>
    </div>
  );
}
