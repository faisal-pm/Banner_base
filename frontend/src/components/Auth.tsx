
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Login from './ui/Login';
import Signup from './ui/Signup';
import PasswordRecovery from './ui/PasswordRecovery';
import type { Session } from '@supabase/supabase-js';
import Dashboard from './Dashboard';

const Auth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState('login'); // login, signup, or recoverPassword

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const renderView = () => {
    switch (view) {
      case 'signup':
        return <Signup />;
      case 'recoverPassword':
        return <PasswordRecovery />;
      default:
        return <Login />;
    }
  };

  if (session) {
    return <Dashboard />;
  }

  return (
    <div className="container mx-auto">
      <nav className="flex justify-center py-4 space-x-4">
        <button
          onClick={() => setView('login')}
          className={`px-4 py-2 rounded-md ${
            view === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setView('signup')}
          className={`px-4 py-2 rounded-md ${
            view === 'signup' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setView('recoverPassword')}
          className={`px-4 py-2 rounded-md ${
            view === 'recoverPassword'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Forgot Password?
        </button>
      </nav>
      {renderView()}
    </div>
  );
};

export default Auth;
