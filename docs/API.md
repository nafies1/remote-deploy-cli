# API Reference

`redep` uses `socket.io` for real-time communication. If you want to build a custom client, you can connect to the server using any Socket.IO client.

## Connection

**URL**: `http://<server-ip>:<port>` (or `https://` if configured)

**Authentication**:
You must provide the `token` in the `auth` object during the handshake.

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_SECRET_KEY',
  },
});
```

## Events

### Client -> Server

| Event    | Data   | Description                                 |
| -------- | ------ | ------------------------------------------- |
| `deploy` | `null` | Triggers the configured deployment command. |

### Server -> Client

| Event    | Data Structure                                                          | Description                                                                  |
| -------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `status` | `{ status: string, message?: string, error?: string, timestamp: Date }` | Updates on the deployment state. Statuses: `started`, `completed`, `failed`. |
| `log`    | `{ type: 'stdout' \| 'stderr', data: string, timestamp: Date }`         | Real-time log output from the deployment process.                            |

## Example Custom Client (Node.js)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'my-secret' },
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('deploy');
});

socket.on('log', (data) => {
  console.log(`[${data.type}] ${data.data}`);
});

socket.on('status', (data) => {
  console.log(`Status: ${data.status}`);
  if (data.status === 'completed' || data.status === 'failed') {
    socket.close();
  }
});
```
