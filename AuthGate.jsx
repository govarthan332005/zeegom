import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useAuthGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (action) => {
    if (!user) {
      toast('🔒 Please sign in to continue', { duration: 2500 });
      navigate('/login');
      return false;
    }
    if (action) action();
    return true;
  };
}
