import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ orders: 0, delivered: 0, spent: 0 });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const q = query(ref(db, 'orders'), orderByChild('userId'), equalTo(user.uid));
    const unsub = onValue(q, (snap) => {
      const val = snap.val();
      if (val) {
        const list = Object.values(val);
        setStats({
          orders: list.length,
          delivered: list.filter(o => o.status === 'delivered').length,
          spent: list.reduce((s, o) => s + (o.total || 0), 0)
        });
      }
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await logout();
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon:'ri-file-list-3-fill', title:'My Orders', sub:'Track your food orders', color:'orange', onClick: () => navigate('/orders') },
    { icon:'ri-map-pin-fill', title:'Saved Addresses', sub:'Manage delivery addresses', color:'', onClick: () => toast('Coming soon! 🚀') },
    { icon:'ri-heart-fill', title:'Favorites', sub:'Your favorite dishes', color:'purple', onClick: () => toast('Coming soon! 🚀') },
    { icon:'ri-coupon-3-fill', title:'Offers & Coupons', sub:'Available discounts', color:'green', onClick: () => toast('Use code CHEF20 for 20% off! 🎁') },
    { icon:'ri-customer-service-2-fill', title:'Help & Support', sub:'Get in touch with us', color:'blue', onClick: () => toast('Contact: support@chefskitchen.com') },
    { icon:'ri-shield-check-fill', title:'Privacy & Terms', sub:'Read our policies', color:'', onClick: () => toast('Coming soon! 🚀') },
  ];

  return (
    <div className="fade-in">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          {user.photoURL ? (
            <img src={user.photoURL} className="profile-avatar" alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="profile-avatar">{user.displayName?.[0]?.toUpperCase()}</div>
          )}
          <div>
            <div className="profile-name">{user.displayName}</div>
            <div className="profile-email">{user.email}</div>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-num">{stats.orders}</div>
          <div className="stat-label">Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.delivered}</div>
          <div className="stat-label">Delivered</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">₹{stats.spent}</div>
          <div className="stat-label">Spent</div>
        </div>
      </div>

      <div className="menu-list">
        {menuItems.map((m, i) => (
          <div key={i} className="menu-item" onClick={m.onClick}>
            <div className={`menu-icon ${m.color}`}><i className={m.icon}></i></div>
            <div className="menu-info">
              <div className="menu-title">{m.title}</div>
              <div className="menu-sub">{m.sub}</div>
            </div>
            <i className="ri-arrow-right-s-line menu-arrow"></i>
          </div>
        ))}
      </div>

      <div style={{padding:'0 20px 30px'}}>
        <button className="btn btn-outline btn-lg btn-full" onClick={handleLogout} style={{color:'#CC0000', borderColor:'#FFD6D6'}}>
          <i className="ri-logout-box-r-fill"></i> Sign Out
        </button>
        <div style={{textAlign:'center', marginTop:16, color:'#999', fontSize:12, fontWeight:600}}>
          Chef's Kitchen v1.0 · Made with ❤️
        </div>
      </div>
    </div>
  );
}
