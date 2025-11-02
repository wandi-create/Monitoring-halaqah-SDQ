import React, { useState } from 'react';
import { User } from '../types';
import { BookOpenIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // NOTE: This is an insecure way to handle login.
      // In a real-world application, use Supabase Auth (supabase.auth.signInWithPassword)
      // and store only hashed passwords in the database.
      const { data: user, error: queryError } = await supabase
        .from('guru')
        .select('*')
        .eq('email', email)
        .eq('password', password) // This is insecure!
        .single();

      if (queryError) {
        throw new Error("Email atau password salah.");
      }

      if (user) {
        onLogin(user as User);
      } else {
        setError('Email atau password salah.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <div 
                className="inline-block p-4 rounded-full mb-4"
                style={{background: 'linear-gradient(135deg, #E879F9 0%, #623AA2 100%)'}}
            >
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
          <h1 className="text-3xl font-bold text-gray-800">Monitoring Halaqah</h1>
          <p className="text-gray-500">SDQ Mutiara Sunnah</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="email@sdq.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </div>
        </form>
         <div className="text-center text-xs text-gray-400">
          <p>Sistem Monitoring Bulanan © 2025 SDQ Mutiara Sunnah</p>
        </div>
      </div>
    </div>
  );
};

export default Login;