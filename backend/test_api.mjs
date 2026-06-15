import fetch from 'node-fetch';

async function test() {
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test1234@example.com', password: 'abc' })
  });
  let data = await regRes.json();
  if (!data.success && data.message === 'User already exists') {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test1234@example.com', password: 'abc' })
    });
    data = await loginRes.json();
  }
  
  if (!data.success) {
    console.error("Auth failed:", data);
    process.exit(1);
  }
  const token = data.token;

  const addRes = await fetch('http://localhost:5000/api/watchlist/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ coinId: 'ethereum' })
  });
  const addData = await addRes.json();
  console.log("Add Watchlist Response:", addData);
}
test();
