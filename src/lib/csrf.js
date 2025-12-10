// src/lib/csrf.js
export const initializeCSRF = async () => {
  try {
    const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('CSRF failed:', error);
    return false;
  }
};

// In your App.jsx
import { initializeCSRF } from './lib/csrf';

useEffect(() => {
  initializeCSRF().then(success => {
    console.log('CSRF initialized:', success);
  });
}, []);