import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', icon: 'ri-home-5-fill', label: 'Home' },
  { to: '/orders', icon: 'ri-file-list-3-fill', label: 'Orders' },
  { to: '/profile', icon: 'ri-user-3-fill', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(it => (
        <NavLink key={it.to} to={it.to}
          end={it.to === '/'}
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <i className={it.icon}></i>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
