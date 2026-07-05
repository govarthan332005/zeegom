import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAuthGate } from '../components/AuthGate';
import { seedDishes, categories } from '../data/dishes';

export default function Home() {
  const [dishes, setDishes] = useState(seedDishes);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { totalItems, addToCart, getQty, decreaseQty } = useCart();
  const requireAuth = useAuthGate();
  const navigate = useNavigate();

  useEffect(() => {
    const dishesRef = ref(db, 'dishes');
    const unsub = onValue(dishesRef, (snap) => {
      const val = snap.val();
      if (val) {
        const list = Object.values(val).filter(d => d.available !== false);
        if (list.length > 0) setDishes(list);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = dishes.filter(d => {
    const catOk = activeCat === 'all' || d.category === activeCat;
    const searchOk = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const firstName = user?.displayName?.split(' ')[0] || 'Foodie';

  const handleAdd = (dish, e) => {
    e.stopPropagation();
    requireAuth(() => addToCart(dish));
  };

  const handleDishClick = (dish) => {
    requireAuth(() => navigate(`/dish/${dish.id}`, { state: dish }));
  };

  return (
    <div className="fade-in">
      <div className="top-bar">
        <button className="location-btn" onClick={() => {}}>
          <div className="location-icon"><i className="ri-map-pin-fill"></i></div>
          <div className="location-text">
            <div className="location-label">Deliver to</div>
            <div className="location-value">Home <i className="ri-arrow-down-s-line"></i></div>
          </div>
        </button>
        <button className="cart-btn" onClick={() => requireAuth(() => navigate('/cart'))}>
          <i className="ri-shopping-bag-3-fill"></i>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </div>

      <div className="hero-section">
        <div className="hero-greeting">
          Hey {firstName}! 👋<br/>
          What would you like <span className="accent">to eat today?</span>
        </div>
      </div>

      <div className="search-box">
        <i className="ri-search-2-line"></i>
        <input
          placeholder="Search for dishes, cuisines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="banner">
        <div className="banner-tag">🔥 Chef's Special</div>
        <div className="banner-title">Get 20% OFF<br/>on your first order</div>
        <div className="banner-sub">Use code: CHEF20 · Free delivery</div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Categories</div>
        </div>
        <div className="categories-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${activeCat === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCat(cat.id)}
            >
              <div className="category-emoji">{cat.emoji}</div>
              <div className="category-name">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">
            {activeCat === 'all' ? '🔥 Popular Dishes' : `${activeCat}`}
          </div>
          <div className="section-link">{filtered.length} items</div>
        </div>

        {loading ? (
          <div className="dishes-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="dish-card">
                <div className="skeleton" style={{width:'100%',aspectRatio:1,borderRadius:0}}></div>
                <div style={{padding:14}}>
                  <div className="skeleton" style={{height:14,marginBottom:8}}></div>
                  <div className="skeleton" style={{height:10,width:'60%'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <div className="empty-title">No dishes found</div>
            <div className="empty-sub">Try a different category or search</div>
          </div>
        ) : (
          <div className="dishes-grid">
            {filtered.map(dish => {
              const qty = getQty(dish.id);
              return (
                <div key={dish.id} className="dish-card" onClick={() => handleDishClick(dish)}>
                  {dish.image ? (
                    <img src={dish.image} className="dish-image" alt={dish.name} />
                  ) : (
                    <div className="dish-image">{dish.emoji || '🍽️'}</div>
                  )}
                  <div className="dish-badge">
                    <i className="ri-star-fill" style={{color:'#FFB800'}}></i> {dish.rating || 4.5}
                  </div>
                  <div className={`dish-veg-badge ${dish.veg ? 'veg' : 'non-veg'}`}></div>
                  <div className="dish-info">
                    <div className="dish-name">{dish.name}</div>
                    <div className="dish-desc">{dish.category} · {dish.time || '20 min'}</div>
                    <div className="dish-footer">
                      <div className="dish-price"><span className="currency">₹</span>{dish.price}</div>
                      {qty > 0 ? (
                        <div className="qty-control" onClick={e => e.stopPropagation()}>
                          <button className="qty-btn" onClick={() => decreaseQty(dish.id)}>−</button>
                          <span className="qty-num">{qty}</span>
                          <button className="qty-btn" onClick={(e) => handleAdd(dish, e)}>+</button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={(e) => handleAdd(dish, e)}>+</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
