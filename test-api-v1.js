

async function test() {
  const email = 'testmodul' + Date.now() + '@example.com';
  
  // Register
  const registerRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama_lengkap: 'Test Siswa Modul',
      email: email,
      password: 'password123',
      role: 'siswa',
      jenjang: 'SMA',
      kelas_sekolah: '10'
    })
  });
  console.log('Register status:', registerRes.status);
  
  // Login
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
  console.log('Cookies:', cookies);

  // Fetch modul
  const modulRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/siswa/modul', {
    headers: {
      'Cookie': Array.isArray(cookies) ? cookies.join('; ') : cookies
    }
  });
  console.log('Modul status:', modulRes.status);
  const modulData = await modulRes.json();
  console.log('Modul data structure keys:', Object.keys(modulData));
  if (modulData.data) console.log('data length:', modulData.data.length);
  if (modulData.items) console.log('items length:', modulData.items.length);
  console.log(JSON.stringify(modulData).substring(0, 500));
}

test();
