const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function snapLight() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9227',
    '--window-size=360,800',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const versionData = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9227/json/version', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const ws = new WebSocket(versionData.webSocketDebuggerUrl);
  let id = 1; const cbs = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && cbs.has(m.id)) { cbs.get(m.id)(m.result); cbs.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = id++; cbs.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.onopen = r);
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const sendSession = (method, params = {}) => new Promise(r => { const i = id++; cbs.set(i, r); ws.send(JSON.stringify({ id: i, sessionId, method, params })); });
  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Page.navigate', { url: 'http://localhost:3000/index-2.html' });
  await new Promise(r => setTimeout(r, 2000));
  await sendSession('Runtime.evaluate', { expression: "document.documentElement.setAttribute('data-theme', 'light');" });
  await new Promise(r => setTimeout(r, 400));
  const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\Ranjith kumar\\.gemini\\antigravity\\brain\\0f4160da-9707-4287-8ba2-2ed5b7ea6e52\\scratch\\index2_light_360.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved');
  ws.close(); edgeProc.kill();
}
snapLight();
