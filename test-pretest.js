
async function test() {
  const email = 'testmodul1780402131172@example.com';
  
  const loginRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: 'password123' })
  });
  
  const cookies = loginRes.headers.raw ? loginRes.headers.raw()['set-cookie'] : loginRes.headers.get('set-cookie');

  const pretestRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/siswa/pretest/cmprsw9t3001ho8ss696pq7bx', {
    headers: { 'Cookie': Array.isArray(cookies) ? cookies.join('; ') : cookies }
  });
  const pretestData = await pretestRes.json();
  
  console.log(JSON.stringify(pretestData.pretestQuestions[0], null, 2));
}

test();
