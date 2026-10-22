const { execSync, spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function snap() {
  // 1. Get session token & user
  const body = JSON.stringify({ email: 'guest@koreflame.com', password: 'Guest@KoreFlame2026!' });
  const loginRes = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ headers: res.headers, data: JSON.parse(d) }));
    });
    req.write(body);
    req.end();
  });

  const cookieHeader = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
  console.log('Cookie:', cookieHeader);

  // Take screenshot with Edge
  // Edge command with cookie or via remote-debugging
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outImg = 'C:\\Users\\Ranjith kumar\\.gemini\\antigravity\\brain\\0f4160da-9707-4287-8ba2-2ed5b7ea6e52\\scratch\\dash_after.png';

  // We can pass user-data-dir and set cookie or run headless with devtools protocol
  // Or simpler: Edge with --screenshot
  const cmd = `"${edgePath}" --headless --disable-gpu --window-size=1280,900 --screenshot="${outImg}" "http://localhost:3000/dashboard.html"`;
  console.log('Running cmd...');
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('Screenshot taken!');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

snap();
