import mongoose from 'mongoose';

import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

let server;
let shuttingDown = false;

const shutdown = async (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect().catch(() => undefined);
  process.exit(exitCode);
};

process.once('SIGTERM', () => void shutdown(0));
process.once('SIGINT', () => void shutdown(0));
process.on('unhandledRejection', () => {
  console.error('Unhandled promise rejection.');
  void shutdown(1);
});
process.on('uncaughtException', () => {
  console.error('Uncaught exception.');
  void shutdown(1);
});

try {
  await connectDB();
  server = app.listen(env.PORT, () => console.log(`Server listening on port ${env.PORT}.`));
} catch {
  console.error('Server startup failed.');
  await shutdown(1);
}
