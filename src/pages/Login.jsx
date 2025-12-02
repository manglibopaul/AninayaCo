import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [mode, setMode] = useState('Login'); // 'Login' or 'Sign Up'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = mode === 'Login' ? '/api/users/login' : '/api/users/register';
      const body = mode === 'Login' ? { email, password } : { name, email, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Authentication failed');
      }

      const data = await res.json();
      // Save token and user info
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect after login/register
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[70vh] flex items-center justify-center py-12'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-lg p-8'>
        <h2 className='text-center text-2xl font-semibold mb-6'>{mode === 'Login' ? 'Login' : 'Sign Up'}</h2>

        <form onSubmit={submit} className='space-y-4'>
          {mode === 'Sign Up' && (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder='Name'
              className='w-full border rounded-md px-4 py-3 placeholder-gray-400'
            />
          )}

          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            type='email'
            placeholder='Email'
            className='w-full border rounded-md px-4 py-3 placeholder-gray-400'
          />

          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            type='password'
            placeholder='Password'
            className='w-full border rounded-md px-4 py-3 placeholder-gray-400'
          />

          {error && <p className='text-sm text-red-500'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black text-white py-3 rounded-md text-center font-medium hover:opacity-95'
          >
            {loading ? (mode === 'Login' ? 'Signing in…' : 'Creating account…') : (mode === 'Login' ? 'Login' : 'Create account')}
          </button>

          <div className='text-center text-sm text-gray-600'>
            {mode === 'Login' ? (
              <>
                Don't have an account? <button type='button' onClick={() => setMode('Sign Up')} className='text-black underline ml-1'>Register</button>
              </>
            ) : (
              <>
                Already have an account? <button type='button' onClick={() => setMode('Login')} className='text-black underline ml-1'>Login</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
