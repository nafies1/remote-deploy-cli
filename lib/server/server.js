import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from '../logger.js';
import { executeCommand } from './executor.js';

export const createServer = (secretKey, workingDir) => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json());
  app.use(morgan('tiny'));

  // Auth Middleware
  const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== secretKey) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    next();
  };

  app.post('/execute', authenticate, async (req, res) => {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing command' });
    }

    try {
      const result = await executeCommand(command, workingDir);
      res.json({ status: 'success', output: result });
    } catch (error) {
      res.status(500).json({ status: 'error', error: error });
    }
  });

  // Specific endpoint for deploy fe to map the requirement exactly
  app.post('/deploy/fe', authenticate, async (req, res) => {
    logger.info('Received deploy fe request');
    
    // Requirement: cd to working dir and run docker compose up -d
    // We use 'docker compose pull && docker compose up -d' to ensure latest image is used
    const command = 'docker compose pull && docker compose up -d';

    try {
      const result = await executeCommand(command, workingDir);
      res.json({ status: 'success', output: result });
    } catch (error) {
      res.status(500).json({ status: 'error', error: error });
    }
  });

  return app;
};
