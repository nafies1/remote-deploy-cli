import { createServer } from 'http';
import { createApp, setupSocket } from './server.js';
import { logger } from '../logger.js';

export const startServer = (port, secret, workingDir, deploymentCommand) => {
  if (!secret) {
    logger.error('Cannot start server: Secret key is required for security.');
    process.exit(1);
  }

  const app = createApp();
  const httpServer = createServer(app);
  
  // Attach Socket.io
  setupSocket(httpServer, secret, workingDir, deploymentCommand);

  httpServer.listen(port, () => {
    logger.success(`Server is running on port ${port}`);
    logger.info(`Working Directory: ${workingDir}`);
    logger.info(`Deployment Command: ${deploymentCommand}`);
    logger.info(`Waiting for connections...`);
  });
};
