
async function testSubmit() {
  const email = 'testmodul1780402131172@example.com';
  
  const loginRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: 'password123' })
  });
  
  const cookies = loginRes.headers.raw ? loginRes.headers.raw()['set-cookie'] : loginRes.headers.get('set-cookie');
  const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;

  const pretestRes = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/siswa/pretest/cmprsw9t3001ho8ss696pq7bx', {
    headers: { 'Cookie': cookieStr }
  });
  const pretestData = await pretestRes.json();
  const qId = pretestData.pretestQuestions[0].id;
  
  const submitResA = await fetch('https://lms-express-api-o5uk.vercel.app/api/v1/siswa/pretest/cmprsw9t3001ho8ss696pq7bx/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieStr },
    body: JSON.stringify({
      answers: [
        { questionId: qId, answer: 'Pilihan A' }
      ]
    })
  });
  console.log('Submit Pilihan A status:', submitResA.status, await submitResA.text());
}

testSubmit();
