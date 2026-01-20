import { io } from 'socket.io-client';
import { logger } from '../logger.js';

export const connectAndDeploy = (serverUrl, secret) => {
  return new Promise((resolve, reject) => {
    logger.info(`Connecting to ${serverUrl}...`);

    const socket = io(serverUrl, {
      auth: {
        token: secret,
      },
      reconnection: false, // Don't auto reconnect for a single command execution
    });

    socket.on('connect', () => {
      logger.success('Connected to server. requesting deployment...');
      socket.emit('deploy');
    });

    socket.on('connect_error', (err) => {
      logger.error(`Connection error: ${err.message}`);
      socket.close();
      reject(err);
    });

    socket.on('status', (data) => {
      const time = new Date(data.timestamp).toLocaleTimeString();
      
      if (data.status === 'started') {
        logger.info(`[${time}] Status: ${data.message || 'Deployment Started'}`);
      } else if (data.status === 'completed') {
        logger.success(`[${time}] Status: ${data.message || 'Deployment Completed'}`);
        socket.close();
        resolve();
      } else if (data.status === 'failed') {
        logger.error(`[${time}] Status: ${data.error || 'Deployment Failed'}`);
        socket.close();
        reject(new Error(data.error));
      }
    });

    socket.on('log', (data) => {
      const time = new Date(data.timestamp).toLocaleTimeString();
      const msg = data.data.trim();
      if (msg) {
        if (data.type === 'stderr') {
          console.error(`[${time}] [STDERR] ${msg}`);
        } else {
          console.log(`[${time}] [STDOUT] ${msg}`);
        }
      }
    });

    socket.on('disconnect', () => {
      // If disconnected without completion/failure, it might be an issue
      // But usually 'status' events close the socket.
    });
  });
};
