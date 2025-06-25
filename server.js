// server.js
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.PORT || 10000;

app.get('/api/status', (req, res) =>
  res.json({ status: 'garden server live' })
);

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, ws => {
    wss.emit('connection', ws, req);
  });
});

// WebSocket logic
wss.on('connection', ws => {
  console.log('WS client connected');
  ws.send(JSON.stringify({ event: 'welcome', garden: {} }));

  ws.on('message', msg => {
    const data = JSON.parse(msg);
    // update game state & broadcast
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: 'gardenUpdate', data }));
      }
    });
  });

  ws.on('close', () => console.log('WS client disconnected'));
});

// Start HTTP + WS server
server.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
