import React, { useEffect, useState } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      setUsers((u) => u.filter(x => x.id !== id));
    } catch (err) {
      alert('Delete failed: ' + (err.message || 'error'));
    }
  };

  const toggleAdmin = async (user) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setUsers((u) => u.map(x => x.id === updated.id ? updated : x));
    } catch (err) {
      alert('Update failed: ' + (err.message || 'error'));
    }
  };

  return (
    <div className='pt-16'>
      <h2 className='text-2xl mb-4'>Admin — Customers</h2>
      {loading && <p>Loading…</p>}
      {error && <p className='text-red-500'>{error}</p>}

      <div className='space-y-3'>
        {users.map(u => (
          <div key={u.id} className='p-3 border rounded flex items-center justify-between'>
            <div>
              <p className='font-medium'>{u.name} <span className='text-sm text-gray-500'>&lt;{u.email}&gt;</span></p>
              <p className='text-sm text-gray-500'>Phone: {u.phone || '-'}</p>
            </div>
            <div className='flex items-center gap-2'>
              <button onClick={() => toggleAdmin(u)} className='px-3 py-1 border rounded'>{u.isAdmin ? 'Revoke Admin' : 'Make Admin'}</button>
              <button onClick={() => deleteUser(u.id)} className='px-3 py-1 border rounded text-red-600'>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
