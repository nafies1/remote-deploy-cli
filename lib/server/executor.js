import { spawn } from 'child_process';
import { logger } from '../logger.js';

export const spawnCommand = (command, workingDir, onStdout, onStderr) => {
  return new Promise((resolve, reject) => {
    logger.info(`Executing: ${command} in ${workingDir}`);

    // Parse command string into command and args for spawn
    // This is a simple split, for complex commands with quotes, we might need a parser or use shell: true
    // Using shell: true is easier for compatibility with the existing full command strings
    const child = spawn(command, {
      cwd: workingDir,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        const output = data.toString();
        if (onStdout) onStdout(output);
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const output = data.toString();
        if (onStderr) onStderr(output);
      });
    }

    child.on('error', (error) => {
      logger.error(`Execution error: ${error.message}`);
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        logger.success('Execution successful');
        resolve();
      } else {
        logger.error(`Process exited with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
};
