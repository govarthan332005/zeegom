import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { seedDishes } from '../data/dishes';

export default function DishDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, getQty, decreaseQty, totalItems } = useCart();
  const [dish, setDish] = useState(location.state || null);

  useEffect(() => {
    if (!dish) {
      // try firebase then seed
      get(ref(db, 'dishes')).then(snap => {
        const val = snap.val();
        let found = null;
        if (val) found = Object.values(val).find(d => d.id === id);
        if (!found) found = seedDishes.find(d => d.id === id);
        setDish(found);
      });
    }
  }, [id, dish]);

  if (!dish) return <div className="page-loader"><div className="loader-ring"></div><div>Loading dish...</div></div>;

  const qty = getQty(dish.id);

  return (
    <div className="fade-in">
      <div className="page-header" style={{background:'transparent', position:'absolute', width:'100%'}}>
        <button className="back-btn" onClick={() => navigate(-1)}><i className="ri-arrow-left-line"></i></button>
        <div style={{flex:1}}></div>
        <button className="back-btn" onClick={() => navigate('/cart')} style={{position:'relative'}}>
          <i className="ri-shopping-bag-3-fill"></i>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </div>

      {dish.image ? (
        <img src={dish.image} className="dish-detail-image" alt={dish.name}/>
      ) : (
        <div className="dish-detail-image">{dish.emoji || '🍽️'}</div>
      )}

      <div className="detail-content">
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
          <div className={`dish-veg-badge ${dish.veg ? 'veg' : 'non-veg'}`}></div>
          <span style={{fontSize:12, fontWeight:700, color:'#666'}}>{dish.veg ? 'PURE VEG' : 'NON-VEG'}</span>
        </div>
        <div className="detail-title">{dish.name}</div>
        <div className="detail-meta">
          <div className="meta-chip"><i className="ri-star-fill" style={{color:'#FFB800'}}></i> {dish.rating || 4.5}</div>
          <div className="meta-chip"><i className="ri-time-line"></i> {dish.time || '20 min'}</div>
          <div className="meta-chip"><i className="ri-restaurant-line"></i> {dish.category}</div>
        </div>
        <div className="detail-price"><span className="currency">₹</span>{dish.price}</div>
        <div className="detail-desc">{dish.description}</div>

        <div style={{marginTop: 30}}>
          <h3 style={{fontSize:18, marginBottom:12}}>Why you'll love it 💚</h3>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {[
              {icon:'ri-fire-fill', text:'Freshly cooked to order', color:'#FF3D3D'},
              {icon:'ri-leaf-fill', text:'Made with premium ingredients', color:'#00A868'},
              {icon:'ri-heart-fill', text:'Prepared by our expert chef', color:'#E88C00'}
            ].map((f, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:12, background:'#f8f4ee', borderRadius:14}}>
                <i className={f.icon} style={{color:f.color, fontSize:22}}></i>
                <span style={{fontWeight:600, fontSize:14}}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="checkout-bar">
        {qty > 0 ? (
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <div className="qty-control" style={{padding:4}}>
              <button className="qty-btn" style={{width:40, height:40}} onClick={() => decreaseQty(dish.id)}>−</button>
              <span className="qty-num" style={{fontSize:16, minWidth:32}}>{qty}</span>
              <button className="qty-btn" style={{width:40, height:40}} onClick={() => addToCart(dish)}>+</button>
            </div>
            <button className="btn btn-primary btn-lg" style={{flex:1}} onClick={() => navigate('/cart')}>
              View Cart · ₹{dish.price * qty}
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-lg btn-full" onClick={() => addToCart(dish)}>
            <i className="ri-shopping-bag-3-fill"></i> Add to Cart · ₹{dish.price}
          </button>
        )}
      </div>
    </div>
  );
}
