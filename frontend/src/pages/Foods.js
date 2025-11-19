import React, { useState, useCallback } from 'react';

const sriLankanFoods = [
  {
    id: 1,
    name: 'Rice & Curry',
    description: 'Traditional Sri Lankan meal with rice and multiple curry dishes',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    category: 'Main Course'
  },
  {
    id: 2,
    name: 'Kottu Roti',
    description: 'Chopped roti stir-fried with vegetables, egg, and meat',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop',
    category: 'Street Food'
  },
  {
    id: 3,
    name: 'Hoppers (Appa)',
    description: 'Bowl-shaped pancakes made from fermented rice flour',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    category: 'Breakfast'
  },
  {
    id: 4,
    name: 'Lamprais',
    description: 'Dutch Burgher dish with rice, curry, and sambol wrapped in banana leaf',
    image: 'https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=400&h=300&fit=crop',
    category: 'Special'
  },
  {
    id: 5,
    name: 'String Hoppers',
    description: 'Steamed rice noodle nests served with curry',
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop',
    category: 'Breakfast'
  },
  {
    id: 6,
    name: 'Fish Curry',
    description: 'Fresh fish cooked in coconut milk with aromatic spices',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    category: 'Seafood'
  },
  {
    id: 7,
    name: 'Prawn Curry',
    description: 'Jumbo prawns in creamy coconut curry sauce',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
    category: 'Seafood'
  },
  {
    id: 8,
    name: 'Crab Curry',
    description: 'Sri Lankan specialty - crab cooked with rich spices',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop',
    category: 'Seafood'
  },
  {
    id: 9,
    name: 'Grilled Fish',
    description: 'Fresh catch grilled with Sri Lankan spices',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
    category: 'Seafood'
  }
];

const categories = ['All', 'Main Course', 'Seafood', 'Breakfast', 'Street Food', 'Special'];

const deliveryServices = [
  { id: 'uber', name: 'Uber Eats', url: 'https://www.ubereats.com/', icon: '🍔' },
  { id: 'pickme', name: 'PickMe Food', url: 'https://www.pickme.lk/food', icon: '🛵' }
];

export default function Foods(){
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  
  const filteredFoods = activeCategory === 'All' 
    ? sriLankanFoods 
    : sriLankanFoods.filter(food => food.category === activeCategory);

  const handleOrderClick = useCallback((food) => {
    setSelectedFood(food);
  }, []);

  const handleDeliverySelect = useCallback((service) => {
    if (selectedFood) {
      window.open(service.url, '_blank');
      setSelectedFood(null);
    }
  }, [selectedFood]);

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedFood(null);
  }, []);
  
  return (
    <div className="page foods-page">
      <div className="foods-hero">
        <div className="foods-hero-content">
          <h1>🍛 Sri Lankan Cuisine</h1>
          <p className="foods-subtitle">Discover the rich flavors and authentic dishes of Sri Lanka</p>
        </div>
      </div>

      <div className="container foods-container">
        <div className="foods-intro">
          <h2>Experience Authentic Sri Lankan Food</h2>
          <p>From spicy curries to delicious street food, Sri Lankan cuisine offers a unique blend of flavors influenced by Indian, Dutch, Portuguese, and Malay cultures.</p>
        </div>

        <div className="food-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`food-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'All' && '🍽️ '}
              {category === 'Main Course' && '🍛 '}
              {category === 'Seafood' && '🦐 '}
              {category === 'Breakfast' && '🥞 '}
              {category === 'Street Food' && '🌮 '}
              {category === 'Special' && '⭐ '}
              {category}
            </button>
          ))}
        </div>

        <div className="foods-grid">
          {filteredFoods.map(food => (
            <div key={food.id} className="food-card">
              <div className="food-image">
                <img 
                  src={food.image} 
                  alt={food.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=' + encodeURIComponent(food.name);
                  }}
                />
                <span className="food-category">{food.category}</span>
              </div>
              <div className="food-info">
                <h3>{food.name}</h3>
                <p>{food.description}</p>
                <button 
                  className="order-btn"
                  onClick={() => handleOrderClick(food)}
                >
                  🛒 Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Service Selection Modal */}
      {selectedFood && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>Choose Delivery Service</h2>
            <p className="modal-subtitle">Select how you want to order <strong>{selectedFood.name}</strong></p>
            
            <div className="delivery-options">
              {deliveryServices.map(service => (
                <button
                  key={service.id}
                  className="delivery-option-btn"
                  onClick={() => handleDeliverySelect(service)}
                >
                  <span className="delivery-option-icon">{service.icon}</span>
                  <div className="delivery-option-info">
                    <strong>{service.name}</strong>
                    <small>Click to order online</small>
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
