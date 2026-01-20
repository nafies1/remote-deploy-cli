# Advanced Configuration

## Server Configuration

The server can be configured via Environment Variables or the CLI configuration store. Environment variables take precedence.

| Variable             | Config Key           | Description                                                                | Default |
| -------------------- | -------------------- | -------------------------------------------------------------------------- | ------- |
| `SERVER_PORT`        | `server_port`        | The TCP port the server listens on.                                        | `3000`  |
| `SECRET_KEY`         | `secret_key`         | A shared secret string for authentication. **Required**.                   | -       |
| `WORKING_DIR`        | `working_dir`        | The absolute path where the deployment command is executed. **Required**.  | -       |
| `DEPLOYMENT_COMMAND` | `deployment_command` | The shell command to execute when a deployment is triggered. **Required**. | -       |

### Using PM2

For production usage without Docker, we recommend using PM2.

```bash
# Start with PM2
pm2 start server-entry.js --name redep-server --env SECRET_KEY=xyz --env WORKING_DIR=/app
```

The CLI `redep start` command automatically attempts to use PM2 if installed.

## Client Configuration

Clients can be configured to talk to multiple servers (e.g., `dev`, `staging`, `prod`).

```json
{
  "servers": {
    "prod": {
      "host": "https://deploy.example.com",
      "secret_key": "prod-secret"
    },
    "staging": {
      "host": "http://10.0.0.5:3000",
      "secret_key": "staging-secret"
    }
  }
}
```

### Managing Servers via CLI

```bash
# Set a server
redep config set servers.dev.host http://localhost:3000
redep config set servers.dev.secret_key mysecret

# Get a server config
redep config get servers.dev
```

## Security Best Practices

1.  **TLS/SSL**: Always use HTTPS for the `host` URL in production. The WebSocket connection will automatically use WSS (Secure WebSocket).
2.  **Secret Rotation**: Rotate your `SECRET_KEY` periodically.
3.  **Firewall**: Restrict access to the server port (3000) to known IP addresses (e.g., your VPN or CI/CD runner IPs).
4.  **Least Privilege**: Run the server process with a user that has only the necessary permissions (e.g., access to Docker socket and the working directory).
