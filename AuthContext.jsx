import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, googleProvider, db } from '../firebase/config';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Save/update user in database
        const userRef = ref(db, `users/${u.uid}`);
        const snap = await get(userRef);
        if (!snap.exists()) {
          await set(userRef, {
            uid: u.uid,
            name: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            createdAt: Date.now(),
            phone: '',
            addresses: []
          });
        } else {
          // update login time
          await set(ref(db, `users/${u.uid}/lastLogin`), Date.now());
        }
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
