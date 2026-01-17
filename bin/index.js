#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { logger } from '../lib/logger.js';
import { getConfig, setConfig, getAllConfig, clearConfig } from '../lib/config.js';
import { startServer } from '../lib/server/index.js';
import { deploy } from '../lib/client/index.js';

const program = new Command();

program
  .name('redep')
  .description('Remote execution CLI for deployment')
  .version('1.0.0');

// Configuration Command
const configCommand = new Command('config')
  .description('Manage configuration');

configCommand
  .command('set <key> <value>')
  .description('Set a configuration key')
  .action((key, value) => {
    setConfig(key, value);
    logger.success(`Configuration updated: ${key} = ${value}`);
  });

configCommand
  .command('get <key>')
  .description('Get a configuration key')
  .action((key) => {
    const value = getConfig(key);
    logger.info(`${key}: ${value}`);
  });

configCommand
  .command('list')
  .description('List all configurations')
  .action(() => {
    const all = getAllConfig();
    logger.info('Current Configuration:');
    console.table(all);
  });

configCommand
  .command('clear')
  .description('Clear all configurations')
  .action(() => {
    clearConfig();
    logger.success('All configurations have been cleared.');
  });

program.addCommand(configCommand);

// Server Command
program
  .command('listen')
  .description('Start the server to listen for commands')
  .option('-p, --port <port>', 'Port to listen on', 3000)
  .action((options) => {
    const port = options.port || process.env.SERVER_PORT || getConfig('server_port') || 3000;
    const secret = process.env.SECRET_KEY || getConfig('secret_key');
    
    if (!secret) {
      logger.warn('Warning: No "secret_key" set in config or SECRET_KEY env var. Communication might be insecure or fail if client requires it.');
      logger.info('Run "redep config set secret_key <your-secret>" or set SECRET_KEY env var.');
    }

    const workingDir = process.env.WORKING_DIR || getConfig('working_dir');
    if (!workingDir) {
      logger.error('Error: "working_dir" is not set. Please set it using "redep config set working_dir <path>" or WORKING_DIR env var.');
      process.exit(1);
    }

    startServer(port, secret, workingDir);
  });

// Client Command
program
  .command('deploy <type>')
  .description('Deploy a service (e.g., "fe") to the server machine')
  .action(async (type) => {
    const serverUrl = process.env.SERVER_URL || getConfig('server_url');
    const secret = process.env.SECRET_KEY || getConfig('secret_key');

    if (!serverUrl) {
      logger.error('Error: "server_url" is not set. Set SERVER_URL env var or run "redep config set server_url <url>"');
      process.exit(1);
    }

    if (!secret) {
      logger.error('Error: "secret_key" is not set. Set SECRET_KEY env var or run "redep config set secret_key <your-secret>"');
      process.exit(1);
    }

    try {
      await deploy(type, serverUrl, secret);
    } catch (error) {
      logger.error(`Deploy failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
