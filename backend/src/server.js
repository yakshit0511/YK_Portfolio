import mongoose from 'mongoose';

import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

let server;
let shuttingDown = false;
const port = Number(env.PORT) || 5000;

const shutdown = async (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect().catch(() => undefined);
  process.exit(exitCode);
};

process.once('SIGTERM', () => void shutdown(0));
process.once('SIGINT', () => void shutdown(0));
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  void shutdown(1);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  void shutdown(1);
});

try {
  await connectDB();
  server = app.listen(port, () => console.log(`Server listening on port ${port}.`));
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the other process or set PORT to a free port.`);
    } else {
      console.error(`Server failed to start on port ${port}:`, error.message);
    }
    void shutdown(1);
  });
} catch (error) {
  console.error('Server startup failed.');
  console.error(error?.message || error);
  await shutdown(1);
}
