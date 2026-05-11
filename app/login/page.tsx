'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (password === 'your-secret-password') {
      document.cookie = 'admin-auth=true; path=/; max-age=86400';
      router.push('/');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        backgroundImage: 'url(/images/homeBackground.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-black/80 border-2 border-red-900/60 rounded-lg p-8 w-96 shadow-2xl backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-red-500 mb-2 text-center">Admin Access</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Enter the master key</p>
        
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full bg-gray-900 border border-red-800 text-white p-3 rounded mb-4 focus:outline-none focus:border-red-500 transition"
        />
        
        <button
          onClick={handleLogin}
          className="w-full bg-red-900 hover:bg-red-800 text-white py-3 rounded transition font-bold tracking-wider"
        >
          UNLOCK
        </button>
        
        {error && (
          <p className="text-red-500 mt-4 text-center text-sm animate-pulse">
            Access denied... Wrong key
          </p>
        )}
      </div>
    </div>
  );
}