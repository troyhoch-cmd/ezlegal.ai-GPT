#!/usr/bin/env node
import http from 'http';

const url = process.argv[2] || 'http://127.0.0.1:5173';
const timeout = parseInt(process.argv[3] || '30000', 10);
const interval = 500;

const parsed = new URL(url);
const start = Date.now();

function probe() {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: parsed.hostname, port: parsed.port || 80, path: '/', timeout: 2000 },
      (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function waitForServer() {
  while (Date.now() - start < timeout) {
    const ok = await probe();
    if (ok) {
      console.log(`[wait-for-server] ${url} responded OK (${Date.now() - start}ms)`);
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  console.error(`[wait-for-server] TIMEOUT after ${timeout}ms - ${url} never responded`);
  process.exit(1);
}

waitForServer();
