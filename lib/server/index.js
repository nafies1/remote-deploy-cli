import { createServer } from './server.js';
import { logger } from '../logger.js';

export const startServer = (port, secret, workingDir) => {
  if (!secret) {
    logger.error('Cannot start server: Secret key is required for security.');
    process.exit(1);
  }

  const app = createServer(secret, workingDir);

  app.listen(port, () => {
    logger.success(`Server is running on port ${port}`);
    logger.info(`Working Directory: ${workingDir}`);
    logger.info(`Waiting for commands...`);
  });
};
