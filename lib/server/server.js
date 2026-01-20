import express from 'express';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import { spawnCommand } from './executor.js';
import { logger } from '../logger.js';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());

  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  return app;
};

export const setupSocket = (httpServer, secretKey, workingDir, deploymentCommand) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token === secretKey) {
      next();
    } else {
      logger.warn(`Authentication failed for socket: ${socket.id}`);
      next(new Error('Authentication error: Invalid secret key'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('deploy', async () => {
      logger.info(`Starting deployment sequence triggered by ${socket.id}`);
      socket.emit('status', { status: 'started', message: 'Deployment started', timestamp: new Date() });

      try {
        await spawnCommand(
          deploymentCommand,
          workingDir,
          (log) => {
            socket.emit('log', { type: 'stdout', data: log, timestamp: new Date() });
          },
          (log) => {
            socket.emit('log', { type: 'stderr', data: log, timestamp: new Date() });
          }
        );

        socket.emit('status', { status: 'completed', message: 'Deployment finished successfully', timestamp: new Date() });
        logger.success('Deployment completed successfully');
      } catch (error) {
        socket.emit('status', { status: 'failed', error: error.message, timestamp: new Date() });
        logger.error(`Deployment failed: ${error.message}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
