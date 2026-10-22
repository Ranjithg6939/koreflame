const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function testModal() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9224',
    '--window-size=1280,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const versionData = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9224/json/version', r => {
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

  await sendSession('Network.enable');
  await sendSession('Page.enable');
  await sendSession('Runtime.enable');

  await sendSession('Network.setCookie', {
    name: 'kf_session',
    value: 'e6722c300e060f93cc02bf9c95f8a131f7345587f60fa0714f820797cf139b53',
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  await sendSession('Page.navigate', { url: 'http://localhost:3000/dashboard.html#loyalty' });
  await new Promise(r => setTimeout(r, 2000));

  // Trigger redeem reward modal
  await sendSession('Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('#loyalty-rewards-grid button');
      if (btn) btn.click();
    `
  });

  // Wait 600ms for modal animation
  await new Promise(r => setTimeout(r, 600));

  const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
  const outPath = 'C:\\Users\\Ranjith kumar\\.gemini\\antigravity\\brain\\0f4160da-9707-4287-8ba2-2ed5b7ea6e52\\scratch\\loyalty_modal.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved loyalty modal screenshot to:', outPath);

  ws.close();
  edgeProc.kill();
  process.exit(0);
}

testModal().catch(e => {
  console.error(e);
  process.exit(1);
});
