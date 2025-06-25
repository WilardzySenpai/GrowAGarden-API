const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 10000;

// HTTP endpoint for API
app.get('/api/status', (req, res) => {
  res.json({ status: 'garden server is live' });
});

const server = app.listen(PORT, () =>
  console.log(`HTTP & WS listening on port ${PORT}`)
);

// Attach WebSocket server to same port
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log('New WebSocket client connected');
  ws.send(JSON.stringify({ event: 'welcome', garden: {} }));

  ws.on('message', msg => {
    const data = JSON.parse(msg);
    console.log('Received:', data);
    // TODO: Game logic: update garden, save in DB, broadcast to others
    wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ event: 'gardenUpdate', data }));
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});
