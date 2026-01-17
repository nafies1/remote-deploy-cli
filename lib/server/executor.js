import { exec } from 'child_process';
import { logger } from '../logger.js';

export const executeCommand = (command, workingDir) => {
  return new Promise((resolve, reject) => {
    logger.info(`Executing: ${command} in ${workingDir}`);

    exec(command, { cwd: workingDir }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Execution error: ${error.message}`);
        return reject({ error: error.message, stderr });
      }

      if (stderr) {
        // Docker often outputs to stderr even for info, so we log it but don't fail unless error is set
        logger.warn(`Stderr: ${stderr}`);
      }

      logger.success('Execution successful');
      resolve({ stdout, stderr });
    });
  });
};
