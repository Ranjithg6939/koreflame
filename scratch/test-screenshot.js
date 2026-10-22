const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  // 1. Login to get cookie and user
  const loginBody = JSON.stringify({
    email: 'admin@koreflame.com',
    password: 'GrillMaster@2026!'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Login status:', res.statusCode);
      const cookies = res.headers['set-cookie'];
      console.log('Set-Cookie:', cookies);
      const user = JSON.parse(data).user;
      console.log('User:', user);
    });
  });

  req.write(loginBody);
  req.end();
}

run();
