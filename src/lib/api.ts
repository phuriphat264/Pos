const API_URL = process.env.NEXT_PUBLIC_API_URL || `http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000`;

export const getStoreData = async (token: string) => {
  const res = await fetch(`${API_URL}/api/store`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch store data');
  return res.json();
};

export const updateStoreData = async (token: string, data: any) => {
  const res = await fetch(`${API_URL}/api/store`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update store data');
  return res.json();
};

export const clearStoreData = async (token: string) => {
  const res = await fetch(`${API_URL}/api/store`, {
    method: 'DELETE',
    headers: { 
      Authorization: `Bearer ${token}` 
    }
  });
  if (!res.ok) throw new Error('Failed to clear store data');
  return res.json();
};
