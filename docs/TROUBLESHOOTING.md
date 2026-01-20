# Troubleshooting Guide

## Common Issues

### 1. Connection Refused
**Error:** `Connection failed: connect ECONNREFUSED 127.0.0.1:3000`

**Possible Causes:**
- The server is not running.
- The server is running on a different port.
- The server is running inside Docker but the port is not mapped correctly.
- Firewall blocking the connection.

**Solutions:**
- Check if the server is running: `redep status` or `docker ps`.
- Verify the port: `redep config get server_port`.
- If using Docker, ensure `-p 3000:3000` is used.
- Check firewall settings.

### 2. Authentication Failed
**Error:** `Authentication error: Invalid secret key` or `403 Forbidden`

**Possible Causes:**
- The `SECRET_KEY` on the client does not match the server's key.
- The `SECRET_KEY` was not set on the server.

**Solutions:**
- Verify client key: `redep config get servers.<name>.secret_key`.
- Verify server key: Check `SECRET_KEY` env var or `redep config get secret_key`.
- Regenerate keys if necessary: `redep generate secret_key` (on server) and update client.

### 3. Deployment Command Failed
**Error:** `Deployment failed: Process exited with code 1`

**Possible Causes:**
- The `DEPLOYMENT_COMMAND` failed to execute successfully.
- Missing dependencies (e.g., `docker`, `npm`, `git`) in the server environment.
- Permission issues in `WORKING_DIR`.

**Solutions:**
- Check the streamed logs for the specific error message from the command.
- Ensure the `WORKING_DIR` exists and is writable.
- If running in Docker, ensure the necessary tools are installed or volumes are mounted correctly (e.g., `/var/run/docker.sock` for Docker commands).

### 4. "socket hang up" or Disconnects
**Possible Causes:**
- Network instability.
- Server crashed during execution.
- Timeout settings on intermediate proxies (Nginx, etc.).

**Solutions:**
- Check server logs: `docker logs redep-server` or `pm2 logs redep-server`.
- If using a reverse proxy, ensure WebSocket support is enabled and timeouts are increased.

### 5. Config Not Saving
**Error:** Changes to config don't persist.

**Possible Causes:**
- Permission issues with the config file location.
- Corrupted config file.

**Solutions:**
- Run `redep config path` to see where the config is stored.
- Try clearing config: `redep config clear`.
