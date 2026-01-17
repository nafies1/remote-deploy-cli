# redep (Remote Deploy CLI)

> A lightweight, secure Node.js CLI tool for remote execution using a Client-Server architecture. Designed to simplify deployment workflows by triggering commands (like Docker Compose) on remote servers securely.

![npm version](https://img.shields.io/npm/v/remote-deploy-cli.svg)
![License](https://img.shields.io/npm/l/remote-deploy-cli.svg)

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Server Configuration](#1-configure-the-server-machine)
  - [Client Configuration](#2-configure-the-client-machine)
  - [Deploying](#3-execute-deployment)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)

---

## Description

**redep** allows you to securely trigger deployment scripts on a remote server from your local machine or CI/CD pipeline. It operates on a **Client-Server** model:

1.  **Server**: Listens for incoming commands and executes them (e.g., `docker compose up -d`).
2.  **Client**: Sends authenticated commands to the server.

It is particularly useful for simple setups where you want to redeploy a service on a VPS without SSH-ing manually or setting up complex orchestration tools like Kubernetes.

## Features

- **Client-Server Architecture**: Clear separation of concerns.
- **Secure Authentication**: Uses Bearer Token authentication with a shared secret.
- **Docker Ready**: Runs easily as a Docker container; supports managing sibling containers via socket mounting.
- **Environment Aware**: Full support for `.env` files and environment variables.
- **Zero-Config option**: Can be fully configured via environment variables for stateless CI/CD usage.

---

## Installation

### Global Installation (Recommended)

To use `redep` as a command-line tool anywhere on your system:

```bash
npm install -g remote-deploy-cli
```

### Local Installation

If you prefer to use it within a specific project (e.g., via `npm scripts`):

```bash
npm install remote-deploy-cli --save-dev
```

---

## Usage

### 1. Configure the Server Machine

The **Server** is the machine where your application is running. It needs to listen for deployment triggers.

#### Option A: Running with Docker (Best Practice)

We recommend running the `redep` server in a container.

1.  Create a `docker-compose.server.yml` (or add to your existing compose file):

    ```yaml
    version: '3.8'
    services:
      deploy-server:
        image: remote-deploy-cli
        container_name: deploy-server
        restart: unless-stopped
        ports:
          - "3000:3000"
        volumes:
          # REQUIRED: Allow control of host docker
          - /var/run/docker.sock:/var/run/docker.sock
          # REQUIRED: Mount your project directory
          - ./your-project-path:/workspace
        environment:
          - SERVER_PORT=3000
          - SECRET_KEY=your-super-secure-secret
          # Must match the internal mount path above
          - WORKING_DIR=/workspace
    ```

2.  Start the server:
    ```bash
    docker compose -f docker-compose.server.yml up -d
    ```

#### Option B: Running Manually on Node.js

1.  Set the working directory (where your target `docker-compose.yml` lives):
    ```bash
    redep config set working_dir /path/to/your/project
    ```
2.  Set your secret key:
    ```bash
    redep config set secret_key your-super-secure-secret
    ```
3.  Start listening:
    ```bash
    redep listen
    ```

### 2. Configure the Client Machine

The **Client** is your laptop or CI/CD runner (e.g., GitHub Actions).

1.  Set the Server URL:
    ```bash
    redep config set server_url http://your-server-ip:3000
    ```
2.  Set the Secret Key (must match the server's):
    ```bash
    redep config set secret_key your-super-secure-secret
    ```

> **CI/CD Tip**: In CI environments, avoid `redep config`. Use Environment Variables instead:
> `SERVER_URL=... SECRET_KEY=... redep deploy fe`

### 3. Execute Deployment

Trigger a deployment command. Currently supports the `fe` (frontend) type, which typically runs a docker-compose pull and up sequence.

```bash
redep deploy fe
```

---

## Configuration Reference

You can configure `redep` using CLI commands (`redep config set`) or Environment Variables. Environment variables take precedence.

| Config Key    | Env Variable  | Description                                      | Required Context |
| :------------ | :------------ | :----------------------------------------------- | :--------------- |
| `server_port` | `SERVER_PORT` | Port for the server to listen on (Default: 3000) | Server           |
| `working_dir` | `WORKING_DIR` | Directory to execute commands in                 | Server           |
| `server_url`  | `SERVER_URL`  | URL of the remote `redep` server                 | Client           |
| `secret_key`  | `SECRET_KEY`  | Shared secret for authentication                 | Both             |

### Managing Configuration via CLI

```bash
# Set a value
redep config set <key> <value>

# Get a value
redep config get <key>

# List all current config
redep config list

# Clear all config
redep config clear
```

---

## Troubleshooting

### `Error: "working_dir" is not set`
- **Cause**: The server doesn't know where to run commands.
- **Fix**: Run `redep config set working_dir /absolute/path` or set `WORKING_DIR` env var. In Docker, ensure the volume is mounted and `WORKING_DIR` matches the mount point.

### `Connection Refused` / `Network Error`
- **Cause**: Client cannot reach the server.
- **Fix**:
  1. Check if `redep listen` is running on the server.
  2. Verify the `SERVER_URL` is correct (e.g., `http://x.x.x.x:3000`).
  3. Check firewall rules (allow port 3000).

### `403 Forbidden` / `Authentication Failed`
- **Cause**: Mismatched secret keys.
- **Fix**: Ensure `SECRET_KEY` is identical on both Client and Server.

---

## Contribution

We welcome contributions!

1.  **Fork** the repository.
2.  **Clone** your fork: `git clone https://github.com/your-username/remote-deploy-cli.git`
3.  **Install dependencies**: `npm install`
4.  **Create a branch**: `git checkout -b feature/amazing-feature`
5.  **Commit changes**: `git commit -m 'Add amazing feature'`
6.  **Push**: `git push origin feature/amazing-feature`
7.  **Open a Pull Request**.

---

## License

ISC © 2026
