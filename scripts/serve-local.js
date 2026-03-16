const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.join(__dirname, '../.next');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
  // Parse URL
  let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);

  // If it's a page route, serve the static HTML
  if (filePath === './index.html' || filePath.startsWith('/test-')) {
    // For Next.js static export, pages are in .next/server/app
    const pagePath = path.join(__dirname, '../out', req.url === '/' ? 'index.html' : req.url + '.html');
    if (fs.existsSync(pagePath)) {
      serveFile(pagePath, res);
      return;
    }
  }

  // For static assets
  const staticPath = path.join(ROOT, filePath.replace('./', ''));
  if (fs.existsSync(staticPath)) {
    serveFile(staticPath, res);
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not Found');
});

function serveFile(filePath, res) {
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end('Server Error: ' + error.code);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Local server running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://10.0.2.2:${PORT} (Android emulator)`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
