import { startServer } from './lib/server/index.js';
import { logger } from './lib/logger.js';
import { getConfig } from './lib/config.js';
import 'dotenv/config';

// Dedicated entry point for PM2 to ensure clean ESM handling
// PM2 sometimes struggles with CLI binaries directly in ESM mode

const port = process.env.SERVER_PORT || getConfig('server_port') || 3000;
const secret = process.env.SECRET_KEY || getConfig('secret_key');
const workingDir = process.env.WORKING_DIR || getConfig('working_dir');
const deploymentCommand = process.env.DEPLOYMENT_COMMAND || getConfig('deployment_command');

if (!secret) {
  logger.warn('Warning: No "secret_key" set. Communication might be insecure.');
}

if (!workingDir) {
  logger.error('Error: "working_dir" is not set.');
  process.exit(1);
}

if (!deploymentCommand) {
  logger.error('Error: "deployment_command" is not set.');
  process.exit(1);
}

startServer(port, secret, workingDir, deploymentCommand);
