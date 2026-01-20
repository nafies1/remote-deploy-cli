import { connectAndDeploy } from './client.js';
import { logger } from '../logger.js';

export const deploy = async (serverName, serverUrl, secret) => {
  logger.info(`Starting deployment sequence for target: ${serverName}`);
  
  try {
    await connectAndDeploy(serverUrl, secret);
  } catch (err) {
    logger.error(`Deployment failed: ${err.message}`);
    throw err;
  }
};
