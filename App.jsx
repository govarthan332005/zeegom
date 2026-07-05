import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import DishDetail from './pages/DishDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import OrderSuccess from './pages/OrderSuccess';
import BottomNav from './components/BottomNav';
import Splash from './components/Splash';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const hideNav = ['/login', '/checkout', '/order-success'].includes(location.pathname) ||
                  location.pathname.startsWith('/dish/');

  return (
    <>
      {showSplash && <Splash />}
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dish/:id" element={<DishDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
    </>
  );
}
