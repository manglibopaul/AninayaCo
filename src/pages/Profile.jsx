import React, { useEffect, useState } from 'react'

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      if (!token) throw new Error('Please sign in');
      const res = await fetch('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) window.location.href = '/login';
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setProfile(updated);
      alert('Profile updated');
    } catch (err) {
      alert('Update failed: ' + (err.message || 'error'));
    }
  };

  if (loading) return <div className='pt-16'><p>Loading…</p></div>
  if (error) return <div className='pt-16'><p className='text-red-500'>{error}</p></div>
  if (!profile) return <div className='pt-16'><p>Please sign in to view your profile.</p></div>

  return (
    <div className='pt-16'>
      <h2 className='text-2xl mb-4'>My Profile</h2>
      <form onSubmit={onSave} className='space-y-3 max-w-md'>
        <div>
          <label className='block text-sm'>Name</label>
          <input className='w-full border px-2 py-1' value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} />
        </div>
        <div>
          <label className='block text-sm'>Email</label>
          <input className='w-full border px-2 py-1' value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} />
        </div>
        <div>
          <label className='block text-sm'>Phone</label>
          <input className='w-full border px-2 py-1' value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
        </div>
        <div>
          <label className='block text-sm'>Street</label>
          <input className='w-full border px-2 py-1' value={profile.street || ''} onChange={e => setProfile({...profile, street: e.target.value})} />
        </div>
        <div className='flex gap-2'>
          <input className='w-1/2 border px-2 py-1' value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} placeholder='City' />
          <input className='w-1/2 border px-2 py-1' value={profile.state || ''} onChange={e => setProfile({...profile, state: e.target.value})} placeholder='Province' />
        </div>
        <div className='flex gap-2'>
          <input className='w-1/2 border px-2 py-1' value={profile.zipcode || ''} onChange={e => setProfile({...profile, zipcode: e.target.value})} placeholder='Zipcode' />
          <input className='w-1/2 border px-2 py-1' value={profile.country || ''} onChange={e => setProfile({...profile, country: e.target.value})} placeholder='Country' />
        </div>
        <div>
          <button className='px-4 py-2 bg-black text-white mr-3'>Save</button>
          <button type='button' onClick={() => {
            // logout user
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('userToken')
            window.location.href = '/'
          }} className='px-4 py-2 bg-red-600 text-white rounded'>Logout</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
