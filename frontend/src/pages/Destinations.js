import React from 'react';
import places from '../data/places';
import PlaceCard from '../components/PlaceCard';
import { useNavigate } from 'react-router-dom';

export default function Destinations() {
  const navigate = useNavigate();
  function view(place) {
    navigate(`/place/${place.id}`);
  }
  return (
    <div className="page destinations">
      <h2>Destinations</h2>
      <p>Choose from our curated list of beautiful places around Sri Lanka.</p>
      <div className="grid">
        {places.map(p => (
          <PlaceCard key={p.id} place={p} onView={view} />
        ))}
      </div>
    </div>
  );
}
