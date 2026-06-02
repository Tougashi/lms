

async function test() {
  // 1. Register a new user
  const email = 'test' + Date.now() + '@example.com';
  const registerRes = await fetch('https://lms-express-api-o5uk.vercel.app/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama_lengkap: 'Test Siswa',
      email: email,
      password: 'password123',
      role: 'siswa',
      jenjang: 'SMA',
      kelas_sekolah: '10'
    })
  });
  console.log('Register status:', registerRes.status);
  const registerData = await registerRes.json();
  console.log('Register data:', registerData);

  // 2. Login to get cookies
  const loginRes = await fetch('https://lms-express-api-o5uk.vercel.app/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: 'password123'
    })
  });
  console.log('Login status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login data:', loginData);
  
  const cookies = loginRes.headers.raw()['set-cookie'];
  console.log('Cookies:', cookies);

  // 3. Fetch profile
  const profileRes = await fetch('https://lms-express-api-o5uk.vercel.app/siswa/profile', {
    headers: {
      'Cookie': cookies ? cookies.join('; ') : ''
    }
  });
  console.log('Profile status:', profileRes.status);
  const profileData = await profileRes.json();
  console.log('Profile data:', profileData);
}

test();
