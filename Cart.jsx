import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Cart() {
  const { cart, addToCart, decreaseQty, removeFromCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  const delivery = totalPrice > 0 ? (totalPrice >= 500 ? 0 : 40) : 0;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + delivery + tax;

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><i className="ri-arrow-left-line"></i></button>
        <div className="page-title">Your Cart {totalItems > 0 && <span style={{color:'#999', fontWeight:500}}>({totalItems})</span>}</div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <div className="empty-title">Your cart is empty</div>
          <div className="empty-sub">Add some yummy dishes to get started</div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            <i className="ri-restaurant-fill"></i> Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div style={{padding:'0 20px'}}>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                {item.image ? (
                  <img src={item.image} className="cart-item-img" alt="" />
                ) : (
                  <div className="cart-item-img">{item.emoji || '🍽️'}</div>
                )}
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} × {item.qty} = ₹{item.price * item.qty}</div>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => decreaseQty(item.id)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => addToCart(item)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bill-card">
            <div style={{fontWeight:800, fontSize:16, marginBottom:10, fontFamily:'Bricolage Grotesque'}}>Bill Details</div>
            <div className="bill-row">
              <span>Item Total</span><span>₹{totalPrice}</span>
            </div>
            <div className="bill-row">
              <span>Delivery Fee {totalPrice >= 500 && <span style={{color:'#00A868', fontWeight:700}}> · FREE</span>}</span>
              <span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>
            <div className="bill-row">
              <span>Taxes & Charges (5%)</span><span>₹{tax}</span>
            </div>
            <div className="bill-row total">
              <span>Grand Total</span><span>₹{grandTotal}</span>
            </div>
          </div>

          {totalPrice < 500 && (
            <div style={{margin:'0 20px 20px', padding:14, background:'#FFF7E6', borderRadius:14, fontSize:13, fontWeight:600, color:'#B87400', textAlign:'center'}}>
              🎁 Add ₹{500 - totalPrice} more to get FREE delivery!
            </div>
          )}

          <div className="checkout-bar">
            <div style={{display:'flex', alignItems:'center', gap:14}}>
              <div>
                <div style={{fontSize:11, color:'#999', fontWeight:700, textTransform:'uppercase'}}>Total</div>
                <div style={{fontSize:22, fontWeight:800, fontFamily:'Bricolage Grotesque'}}>₹{grandTotal}</div>
              </div>
              <button className="btn btn-primary btn-lg" style={{flex:1}} onClick={() => navigate('/checkout')}>
                Proceed to Checkout <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
