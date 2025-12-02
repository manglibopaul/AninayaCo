import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
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
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Login failed');
      }
      const data = await res.json();
      if (!data.user || !data.user.isAdmin) {
        setError('Account is not an admin');
        // clear any tokens just in case
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      // save token and user
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[60vh] flex items-center justify-center py-12'>
      <div className='w-full max-w-sm bg-white rounded-lg shadow p-8'>
        <h2 className='text-center text-xl font-semibold mb-4'>Admin Login</h2>
        <form onSubmit={submit} className='space-y-4'>
          <input className='w-full border px-3 py-2 rounded' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className='w-full border px-3 py-2 rounded' placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <p className='text-sm text-red-500'>{error}</p>}
          <button className='w-full bg-black text-white py-2 rounded' type='submit' disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
