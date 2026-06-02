
async function test() {
  const email = 'testmodul1780402131172@example.com';
  
  // Login with existing test user to get token
  const loginRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: 'password123'
    })
  });
  console.log('Login status:', loginRes.status);
  
  const cookies = loginRes.headers.raw ? loginRes.headers.raw()['set-cookie'] : loginRes.headers.get('set-cookie');

  // Fetch topik for module
  const topikRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/siswa/topik/cmpwkxhsh0013c8sskzf0264j', {
    headers: {
      'Cookie': Array.isArray(cookies) ? cookies.join('; ') : cookies
    }
  });
  console.log('Topik status:', topikRes.status);
  const topikData = await topikRes.json();
  console.log('Topik data structure keys:', Object.keys(topikData));
  if (topikData.data) console.log('data length:', topikData.data.length);
  if (topikData.items) console.log('items length:', topikData.items.length);
  console.log(JSON.stringify(topikData).substring(0, 500));
}

test();
