import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import FFButton from '../education/shared/FFButton';
import FFCard from '../education/shared/FFCard';
import DataMigration from './DataMigration';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMigration, setShowMigration] = useState(false);

  const { signIn, signUp, loading, error } = useAuth();
  const setError = useAuth.getState().setError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const credentials = { email, password };
    const { data, error: authError } = isLoginView
      ? await signIn(credentials)
      : await signUp(credentials);

    if (!authError && !isLoginView && data.user) {
        // After successful sign up, check for local data to migrate.
        const localData = localStorage.getItem('flashfusion_ai_content');
        if (localData && JSON.parse(localData).length > 0) {
            setShowMigration(true);
        } else {
            alert("Sign up successful! Please check your email to verify your account and then sign in.");
            setIsLoginView(true);
        }
    } else if (authError && authError.message.includes('Email not confirmed')) {
         alert("Please check your email to verify your account before signing in.");
    }
  };

  if (showMigration) {
      return <DataMigration onComplete={() => {
          alert("Migration complete! You can now sign in with your new credentials.");
          setShowMigration(false);
          setIsLoginView(true);
      }} />;
  }

  return (
    <div className="max-w-md mx-auto mt-16 ff-fade-in-up">
      <FFCard>
        <div className="flex border-b border-ff-surface mb-6">
          <button onClick={() => { setIsLoginView(true); setError(null); }} className={`flex-1 py-2 text-center font-semibold ${isLoginView ? 'text-ff-primary border-b-2 border-ff-primary' : 'text-ff-text-muted'}`}>Sign In</button>
          <button onClick={() => { setIsLoginView(false); setError(null); }} className={`flex-1 py-2 text-center font-semibold ${!isLoginView ? 'text-ff-primary border-b-2 border-ff-primary' : 'text-ff-text-muted'}`}>Sign Up</button>
        </div>
        
        <h2 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-2xl font-bold text-center mb-1">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h2>
        <p className="text-ff-text-muted text-center mb-6">{isLoginView ? 'Sign in to access your content.' : 'Get started with your own AI-powered workspace.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ff-text-secondary mb-1" htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ff-text-secondary mb-1" htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-ff-surface p-2 rounded-md border border-slate-600" />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error.message}</p>}
          
          <div className="pt-2">
            <FFButton type="submit" disabled={loading} className="w-full">
              {loading ? 'Loading...' : isLoginView ? 'Sign In' : 'Create Account'}
            </FFButton>
          </div>
        </form>
      </FFCard>
    </div>
  );
};

export default AuthPage;