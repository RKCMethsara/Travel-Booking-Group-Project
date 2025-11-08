import React, { useState, useCallback, memo } from 'react';

const PlaceCard = memo(({ place, onView }) => {
  const [imgError, setImgError] = useState(false);

  const handleClick = useCallback(() => {
    onView(place);
  }, [place, onView]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      onView(place);
    }
  }, [place, onView]);

  return (
    <div 
      className="place-card" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
      aria-label={`View details for ${place.name}`}
    >
      <div className="place-image">
        {!imgError ? (
          <img 
            src={place.img} 
            alt={place.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="img-placeholder">📷 Image unavailable</div>
        )}
      </div>
      <div className="place-info">
        <h3>{place.name}</h3>
        <p>{place.short}</p>
      </div>
      <div className="place-actions">
        <button className="btn primary view-details-btn" aria-label={`View ${place.name}`}>
          View Details
        </button>
      </div>
    </div>
  );
});

PlaceCard.displayName = 'PlaceCard';

export default PlaceCard;
