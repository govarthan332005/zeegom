import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, get } from 'firebase/database';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.displayName || '',
    phone: '',
    address: '',
    landmark: '',
    payment: 'cod',
    note: ''
  });

  useEffect(() => {
    if (!user) navigate('/login');
    if (cart.length === 0) navigate('/');
    // Load saved info
    if (user) {
      get(ref(db, `users/${user.uid}`)).then(snap => {
        const v = snap.val();
        if (v) setForm(f => ({
          ...f,
          name: v.name || f.name,
          phone: v.phone || f.phone,
          address: v.lastAddress || f.address,
        }));
      });
    }
  }, [user]);

  const delivery = totalPrice >= 500 ? 0 : 40;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + delivery + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const orderRef = push(ref(db, 'orders'));
      const order = {
        id: orderRef.key,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        userPhoto: user.photoURL || '',
        items: cart,
        subtotal: totalPrice,
        delivery,
        tax,
        total: grandTotal,
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          landmark: form.landmark
        },
        payment: form.payment,
        note: form.note,
        status: 'pending',
        createdAt: Date.now()
      };
      await set(orderRef, order);
      // Save phone/address to user profile for next time
      await set(ref(db, `users/${user.uid}/phone`), form.phone);
      await set(ref(db, `users/${user.uid}/lastAddress`), form.address);
      clearCart();
      navigate('/order-success', { state: { orderId: orderRef.key, total: grandTotal } });
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><i className="ri-arrow-left-line"></i></button>
        <div className="page-title">Checkout</div>
      </div>

      <form onSubmit={handleSubmit} style={{padding:'0 20px 140px'}}>
        <div style={{background:'white', padding:20, borderRadius:20, marginBottom:16, boxShadow:'var(--shadow-sm)'}}>
          <div style={{fontWeight:800, fontSize:17, marginBottom:14, fontFamily:'Bricolage Grotesque'}}>📍 Delivery Details</div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input className="form-input" type="tel" placeholder="10-digit mobile number"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Full Address *</label>
            <textarea className="form-input" placeholder="House no, street, area, city..."
              value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Landmark (Optional)</label>
            <input className="form-input" placeholder="Near..."
              value={form.landmark} onChange={e => setForm({...form, landmark: e.target.value})} />
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Special Instructions</label>
            <textarea className="form-input" placeholder="Any allergies, spice level, etc..."
              value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
          </div>
        </div>

        <div style={{background:'white', padding:20, borderRadius:20, marginBottom:16, boxShadow:'var(--shadow-sm)'}}>
          <div style={{fontWeight:800, fontSize:17, marginBottom:14, fontFamily:'Bricolage Grotesque'}}>💳 Payment Method</div>
          {[
            {v:'cod', icon:'ri-money-rupee-circle-fill', title:'Cash on Delivery', sub:'Pay when your order arrives'},
            {v:'upi', icon:'ri-smartphone-fill', title:'UPI / QR Code', sub:'Pay via any UPI app'},
            {v:'card', icon:'ri-bank-card-fill', title:'Credit / Debit Card', sub:'Visa, Mastercard, RuPay'}
          ].map(p => (
            <label key={p.v} style={{
              display:'flex', alignItems:'center', gap:12, padding:14,
              border: form.payment === p.v ? '2px solid var(--primary)' : '2px solid var(--border)',
              borderRadius:14, marginBottom:8, cursor:'pointer',
              background: form.payment === p.v ? '#FFF5F5' : 'white',
              transition:'all 0.2s'
            }}>
              <input type="radio" name="payment" value={p.v}
                checked={form.payment === p.v}
                onChange={e => setForm({...form, payment: e.target.value})}
                style={{display:'none'}} />
              <i className={p.icon} style={{fontSize:26, color: form.payment === p.v ? 'var(--primary)' : '#999'}}></i>
              <div style={{flex:1}}>
                <div style={{fontWeight:700, fontSize:14}}>{p.title}</div>
                <div style={{fontSize:12, color:'#999', fontWeight:500}}>{p.sub}</div>
              </div>
              {form.payment === p.v && <i className="ri-checkbox-circle-fill" style={{fontSize:22, color:'var(--primary)'}}></i>}
            </label>
          ))}
        </div>

        <div className="bill-card" style={{margin:0, marginBottom:20}}>
          <div style={{fontWeight:800, fontSize:17, marginBottom:10, fontFamily:'Bricolage Grotesque'}}>🧾 Order Summary</div>
          {cart.map(i => (
            <div key={i.id} className="bill-row">
              <span>{i.name} × {i.qty}</span>
              <span>₹{i.price * i.qty}</span>
            </div>
          ))}
          <div className="bill-row"><span>Subtotal</span><span>₹{totalPrice}</span></div>
          <div className="bill-row"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
          <div className="bill-row"><span>Tax (5%)</span><span>₹{tax}</span></div>
          <div className="bill-row total"><span>Total</span><span>₹{grandTotal}</span></div>
        </div>

        <div className="checkout-bar">
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? (
              <><div className="loader-ring" style={{width:22,height:22,borderWidth:2.5,borderTopColor:'white',borderColor:'rgba(255,255,255,0.3)'}}></div> Placing Order...</>
            ) : (
              <>Place Order · ₹{grandTotal} <i className="ri-arrow-right-line"></i></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
