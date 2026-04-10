import https from 'https';
import fs from 'fs';
import path from 'path';

const TOKEN = 'cfat_1iyHGgbYl17s7pbRLeUP6PYJy9rBGJLmZfbywXzD52e114b0';
const ACCOUNT = 'cc550ad7cbc3497604af4e34ed34634e';
const PROJECT = 'isitsafetotravel-v4';

const dir = '.vercel/output/static';
const files = [];

function walkDir(d) {
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) walkDir(full);
    else if (!e.name.startsWith('.')) files.push({path: full.replace(dir+'/', ''), file: full});
  }
}
walkDir(dir);
console.log(`Found ${files.length} files`);

async function request(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${ACCOUNT}${path}`,
      method,
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...headers }
    };
    const req = https.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function upload() {
  // Create deployment
  const dep = await request('POST', `/pages/projects/${PROJECT}/deployments`, {});
  console.log('Deployment:', dep.result.short_id, dep.result.url);
  
  // Get upload URL
  const manifest = {};
  for (const f of files) {
    const hash = (await import('crypto')).createHash('sha256')
      .update(fs.readFileSync(f.file)).digest('hex').substring(0, 32);
    manifest[f.path] = hash;
  }
  
  const uploadResp = await request('POST', `/pages/projects/${PROJECT}/deployments/${dep.result.short_id}/upload-url-multi`, 
    {manifest});
  console.log('Upload response:', JSON.stringify(uploadResp));
}

upload().catch(console.error);
