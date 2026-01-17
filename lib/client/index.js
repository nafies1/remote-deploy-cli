import { sendCommand } from './client.js';
import { logger } from '../logger.js';

export const deploy = async (type, serverUrl, secret) => {
  logger.info(`Starting deployment sequence for target: ${type}`);
  
  if (type === 'fe') {
    logger.info('Sending deployment instruction to server machine...');
    
    try {
      const result = await sendCommand(serverUrl, '/deploy/fe', secret, {});
      
      if (result.status === 'success') {
        logger.success('Server successfully executed the deployment command.');
        logger.log('--- Remote Output ---');
        if (result.output.stdout) console.log(result.output.stdout);
        if (result.output.stderr) console.log(result.output.stderr);
        logger.log('---------------------');
      } else {
        logger.error('Server reported failure.');
        console.error(result);
      }
    } catch (err) {
      throw err;
    }

  } else {
    logger.error(`Deployment type "${type}" is not supported yet.`);
    throw new Error(`Unsupported deployment type: ${type}`);
  }
};
