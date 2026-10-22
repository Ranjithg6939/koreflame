const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function run() {
  // 1. Login to get token & cookie
  const loginBody = JSON.stringify({ email: 'guest@koreflame.com', password: 'Guest@KoreFlame2026!' });
  const loginRes = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ headers: res.headers, data: JSON.parse(d) }));
    });
    req.write(loginBody);
    req.end();
  });

  const sessionToken = loginRes.data.token;
  const user = loginRes.data.user;
  console.log('Got user:', user.name, 'token:', sessionToken);

  // 2. Launch Edge with remote debugging
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1280,900',
    'about:blank'
  ]);

  // Wait 1.5s for Edge to start
  await new Promise(r => setTimeout(r, 1500));

  // 3. Get websocket debugger URL
  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/version', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  console.log('Debugger URL:', versionData.webSocketDebuggerUrl);
  const ws = new WebSocket(versionData.webSocketDebuggerUrl);

  let idCounter = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg.result);
      callbacks.delete(msg.id);
    }
  };

  const send = (method, params = {}) => new Promise((resolve) => {
    const id = idCounter++;
    callbacks.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  // Create new target
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendSession = (method, params = {}) => new Promise((resolve) => {
    const id = idCounter++;
    callbacks.set(id, resolve);
    ws.send(JSON.stringify({ id, sessionId, method, params }));
  });

  await sendSession('Network.enable');
  await sendSession('Page.enable');

  // Set cookie
  await sendSession('Network.setCookie', {
    name: 'kf_session',
    value: sessionToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  // Navigate to dashboard
  await sendSession('Page.navigate', { url: 'http://localhost:3000/dashboard.html' });

  // Wait 2.5s for page scripts & icons to render
  await new Promise(r => setTimeout(r, 2500));

  // Take screenshot
  const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
  const outPath = 'C:\\Users\\Ranjith kumar\\.gemini\\antigravity\\brain\\0f4160da-9707-4287-8ba2-2ed5b7ea6e52\\scratch\\dash_aligned.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', outPath);

  ws.close();
  edgeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
