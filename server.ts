import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // In-memory real-time state initialized with SHA curriculum data
  let sharedState = {
    courses: [
      { id: 'c1', code: 'CS101', name: 'Programming Fundamentals (C++)', credits: 3, grade: 'A' },
      { id: 'c2', code: 'MATH101', name: 'Mathematics 1 (Calculus)', credits: 3, grade: 'B+' },
      { id: 'c3', code: 'PHYS101', name: 'Physics 1 (Mechanics)', credits: 3, grade: 'A-' },
      { id: 'c4', code: 'ENG101', name: 'Technical English', credits: 2, grade: 'A' },
      { id: 'c5', code: 'HUM101', name: 'Ethics & Human Rights', credits: 2, grade: 'B+' },
    ],
    prevCgpa: 3.15,
    prevCredits: 32,
    semesters: [
      {
        id: 'sem_initial_1',
        name: 'Year 1 - Fall (الفرقة الأولى - خريف)',
        term: 'Fall',
        courses: [
          { id: 's1_1', code: 'MATH101', name: 'Calculus 1', credits: 3, grade: 'B+' },
          { id: 's1_2', code: 'PHYS101', name: 'Physics 1', credits: 3, grade: 'A-' },
          { id: 's1_3', code: 'CS101', name: 'Programming', credits: 3, grade: 'A' },
          { id: 's1_4', code: 'ENG101', name: 'English 1', credits: 2, grade: 'A' },
        ],
        notes: 'Focus on Calculus and programming foundations. Complete all lab sheets early.',
      },
      {
        id: 'sem_initial_2',
        name: 'Year 1 - Spring (الفرقة الأولى - ربيع)',
        term: 'Spring',
        courses: [
          { id: 's2_1', code: 'CS104', name: 'OOP Java', credits: 3, grade: 'A' },
          { id: 's2_2', code: 'CS105', name: 'Digital Logic', credits: 3, grade: 'B+' },
          { id: 's2_3', code: 'MATH102', name: 'Linear Algebra', credits: 3, grade: 'A' },
          { id: 's2_4', code: 'STAT101', name: 'Statistics', credits: 3, grade: 'A-' },
        ],
        notes: 'Need to improve attendance in digital logic lab and prepare early for midterms.',
      },
    ],
    currentNotes: 'Focus on Calculus',
    version: 1,
    lastUpdated: Date.now(),
  };

  const broadcastToOthers = (data: any, senderWs?: WebSocket) => {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client !== senderWs && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  const broadcastAll = (data: any) => {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  wss.on('connection', (ws) => {
    // Send full state to newly connected client
    ws.send(
      JSON.stringify({
        type: 'sync:init',
        state: sharedState,
        clientCount: wss.clients.size,
      })
    );

    // Notify all clients of presence change
    broadcastAll({
      type: 'presence:update',
      clientCount: wss.clients.size,
    });

    ws.on('message', (messageRaw) => {
      try {
        const data = JSON.parse(messageRaw.toString());

        if (data.type === 'state:patch') {
          sharedState = {
            ...sharedState,
            ...data.payload,
            version: sharedState.version + 1,
            lastUpdated: Date.now(),
          };

          // Broadcast patch to other connected devices
          broadcastToOthers(
            {
              type: 'state:patched',
              payload: data.payload,
              version: sharedState.version,
              sourceClientId: data.clientId,
              timestamp: Date.now(),
            },
            ws
          );
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      broadcastAll({
        type: 'presence:update',
        clientCount: wss.clients.size,
      });
    });

    ws.on('error', (err) => {
      console.error('WebSocket connection error:', err);
    });
  });

  app.use(express.json());

  // API endpoints for health and state snapshot
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SHA Real-Time GPA Engine',
      clients: wss.clients.size,
      time: Date.now(),
    });
  });

  app.get('/api/state', (_req, res) => {
    res.json(sharedState);
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`SHA GPA server listening on port ${port} [Real-Time WebSocket on /ws]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to initialize SHA real-time server:', err);
  process.exit(1);
});
