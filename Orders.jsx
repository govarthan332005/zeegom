import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const statusInfo = {
  pending: { label: 'Pending', class: 'status-pending', icon: '⏳' },
  preparing: { label: 'Preparing', class: 'status-preparing', icon: '👨‍🍳' },
  ready: { label: 'Ready', class: 'status-ready', icon: '📦' },
  delivered: { label: 'Delivered', class: 'status-delivered', icon: '✅' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled', icon: '❌' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const q = query(ref(db, 'orders'), orderByChild('userId'), equalTo(user.uid));
    const unsub = onValue(q, (snap) => {
      const val = snap.val();
      if (val) {
        const list = Object.values(val).sort((a,b) => b.createdAt - a.createdAt);
        setOrders(list);
      } else setOrders([]);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  return (
    <div className="fade-in">
      <div className="top-bar">
        <div style={{flex:1}}>
          <div className="page-title" style={{fontSize:28}}>My Orders</div>
          <div style={{fontSize:13, color:'#999', fontWeight:600}}>{orders.length} orders total</div>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="loader-ring"></div>
          <div>Loading your orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">No orders yet</div>
          <div className="empty-sub">Start ordering delicious food!</div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            <i className="ri-restaurant-fill"></i> Browse Menu
          </button>
        </div>
      ) : (
        orders.map(order => {
          const st = statusInfo[order.status] || statusInfo.pending;
          const date = new Date(order.createdAt);
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{order.id.slice(-8).toUpperCase()}</div>
                  <div className="order-date">{date.toLocaleDateString('en-IN', {day:'numeric', month:'short'})} · {date.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
                <div className={`status-badge ${st.class}`}>{st.icon} {st.label}</div>
              </div>
              <div className="order-items-preview">
                {order.items.map(i => `${i.name} × ${i.qty}`).join(' · ')}
              </div>
              <div className="order-footer">
                <div style={{fontSize:12, color:'#666', fontWeight:600}}>{order.items.length} items</div>
                <div className="order-total">₹{order.total}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
