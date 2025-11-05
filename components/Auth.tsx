
import React, { useState, FormEvent } from 'react';
// FIX: Import firebase compat to use types like firebase.auth.AuthError.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';


interface AuthProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignup: (name: string, email: string, pass: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

// FIX: Changed AuthError type to firebase.auth.AuthError for Firebase v8 compat.
const getErrorMessage = (error: firebase.auth.AuthError): string => {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

export default function Auth({ onLogin, onSignup, onResetPassword }: AuthProps): React.JSX.Element {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isForgotPassword) {
        if (!email) {
          setError('Please enter your email address.');
          return;
        }
        await onResetPassword(email);
        setMessage('If an account exists, a password reset link has been sent to your email.');
        return;
      }

      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
          setError('All fields are required.');
          return;
        }
        await onSignup(name, email, password);
      }
    } catch (err) {
      // FIX: Cast error to firebase.auth.AuthError for Firebase v8 compat.
      setError(getErrorMessage(err as firebase.auth.AuthError));
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError('');
    setMessage('');
    setName('');
    setEmail('');
    setPassword('');
  };
  
  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setIsLogin(true); // Forgot password is an extension of login
    setError('');
    setMessage('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Genlux AI</h1>
          <p className="text-gray-400 mt-2">
            {isForgotPassword ? 'Reset Your Password' : (isLogin ? 'Welcome Back!' : 'Create an Account')}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && !isForgotPassword && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {!isForgotPassword && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {message && <p className="text-green-400 text-sm text-center">{message}</p>}
          <button type="submit" className="w-full py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition duration-300">
            {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        <div className="text-center text-sm text-gray-400">
            {isForgotPassword ? (
                <button onClick={toggleForgotPassword} className="font-medium text-purple-400 hover:underline">
                    Back to Login
                </button>
            ) : (
                <>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={toggleForm} className="font-medium text-purple-400 hover:underline">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                    {isLogin && (
                        <>
                         <span className="mx-2">|</span>
                         <button onClick={toggleForgotPassword} className="font-medium text-purple-400 hover:underline">
                           Forgot Password?
                         </button>
                        </>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
}
