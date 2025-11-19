import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import places from '../data/places';

export default function PlacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const place = places.find(p => p.id === id);
  const [imgErrors, setImgErrors] = useState({});

  if (!place) {
    return (
      <div className="page">
        <h2>Place not found</h2>
        <button className="btn primary" onClick={() => navigate('/destinations')}>
          Back to Destinations
        </button>
      </div>
    );
  }

  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=driving`;

  const handleImageError = (imageId) => {
    setImgErrors(prev => ({ ...prev, [imageId]: true }));
  };

  return (
    <div className="page place-page">
      <div className="place-detail">
        <div className="place-main-image">
          {!imgErrors.main ? (
            <img 
              src={place.img} 
              alt={place.name}
              onError={() => handleImageError('main')}
            />
          ) : (
            <div className="img-placeholder-large">📷 Image unavailable</div>
          )}
        </div>
        <div className="place-info-detail">
          <h1>{place.name}</h1>
          <p className="description">{place.description || place.short}</p>
          
          <div className="place-actions-detail">
            <a 
              href={googleUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="btn primary"
              aria-label={`Get directions to ${place.name}`}
            >
              📍 Navigate with Google Maps
            </a>
            <button 
              className="btn secondary" 
              onClick={() => navigate('/book')}
              aria-label="Book this destination"
            >
              📅 Book Now
            </button>
          </div>
        </div>

        {place.images && place.images.length > 0 && (
          <div className="image-gallery">
            <h2>Image Gallery</h2>
            <div className="gallery-grid">
              {place.images.map((img, index) => (
                <div key={index} className="gallery-item">
                  {!imgErrors[`gallery-${index}`] ? (
                    <img 
                      src={img} 
                      alt={`${place.name} view ${index + 1}`}
                      loading="lazy"
                      onError={() => handleImageError(`gallery-${index}`)}
                    />
                  ) : (
                    <div className="img-placeholder">📷</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
