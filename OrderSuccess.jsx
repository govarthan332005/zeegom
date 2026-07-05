import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total } = location.state || {};

  useEffect(() => {
    if (!orderId) navigate('/');
  }, [orderId, navigate]);

  return (
    <div className="fade-in" style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center'}}>
      <div className="success-check">
        <i className="ri-check-line"></i>
      </div>
      <h1 style={{fontSize:32, marginTop:24}}>Order Placed! 🎉</h1>
      <p style={{color:'#666', margin:'12px 0 6px', fontWeight:500, fontSize:15}}>
        Thanks for ordering with Chef's Kitchen!
      </p>
      <p style={{color:'#666', fontWeight:500, fontSize:14}}>
        Your delicious food is being prepared with love ❤️
      </p>

      <div style={{background:'white', padding:20, borderRadius:20, marginTop:30, width:'100%', maxWidth:340, boxShadow:'var(--shadow-md)'}}>
        <div style={{fontSize:12, color:'#999', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Order ID</div>
        <div style={{fontSize:14, fontWeight:700, marginTop:4, wordBreak:'break-all'}}>#{orderId?.slice(-8).toUpperCase()}</div>
        <div style={{borderTop:'2px dashed #eee', margin:'14px 0'}}></div>
        <div style={{fontSize:12, color:'#999', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Amount Paid</div>
        <div style={{fontSize:26, fontWeight:800, marginTop:2, fontFamily:'Bricolage Grotesque', color:'var(--primary)'}}>₹{total}</div>
      </div>

      <div style={{display:'flex', gap:12, marginTop:30, width:'100%', maxWidth:340}}>
        <button className="btn btn-outline btn-lg" style={{flex:1}} onClick={() => navigate('/')}>
          <i className="ri-home-5-fill"></i> Home
        </button>
        <button className="btn btn-primary btn-lg" style={{flex:1}} onClick={() => navigate('/orders')}>
          Track Order <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>
  );
}
