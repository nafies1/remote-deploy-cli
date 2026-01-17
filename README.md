# redep (Remote Deploy CLI)

A lightweight Node.js CLI tool for remote execution using a Client-Server architecture. Designed to simplify deployment workflows (e.g., triggering Docker Compose on a remote server).

## Features

- **Client-Server Architecture**: Centralized control where Client sends commands and Server executes them.
- **Secure Communication**: Uses Token-based authentication (Bearer Token) to ensure only authorized clients can execute commands.
- **Configurable**: Easy configuration management for both Client and Server via CLI or Environment Variables.
- **Docker Integration**: Built-in support for `deploy fe` which pulls and restarts containers using Docker Compose.
- **Docker Support**: Can be run as a Docker container itself on the server machine.
- **Logging**: Detailed logs for tracking execution status.

## Architecture

1.  **Client Machine**: The client that issues deployment commands (e.g., your laptop or CI runner).
2.  **Server Machine**: The server that hosts the application and executes the deployment commands (e.g., `docker compose up`).

Communication happens via HTTP/REST with a shared secret for authentication.

## Installation

You can install this package globally using npm:

```bash
# Clone the repository
git clone <repo-url>
cd remote-deploy-cli

# Install globally (for development/local use)
npm install -g .
```

## Usage

### 1. Configure the Server Machine

#### Option A: Running directly on Node.js

On the machine where you want to run your application (Server):

1.  **Set the Working Directory**: This is where your `docker-compose.yml` is located.
    ```bash
    redep config set working_dir /path/to/your/project
    ```

2.  **Set a Secret Key**: A secure password for authentication.
    ```bash
    redep config set secret_key super-secure-secret-123
    ```

3.  **Start the Listener**:
    ```bash
    redep listen
    # Optional: Specify port (default 3000)
    # redep listen --port 4000
    ```

#### Option B: Running with Docker (Recommended)

You can run the server itself inside a Docker container. We provide a `docker-compose.server.yml` as an example.

1.  **Prerequisites**: Ensure Docker and Docker Compose are installed on the server machine.
2.  **Run the Server**:

    ```bash
    # Edit docker-compose.server.yml to map your project directory
    # Then run:
    docker compose -f docker-compose.server.yml up -d --build
    ```

    **Configuration via `docker-compose.server.yml`**:
    -   `volumes`:
        -   `/var/run/docker.sock:/var/run/docker.sock`: Required to allow the server to manage sibling containers.
        -   `./your-project:/workspace`: Mount your project directory containing `docker-compose.yml` to `/workspace` inside the container.
    -   `environment`:
        -   `WORKING_DIR=/workspace`: Must match the container mount path.
        -   `SECRET_KEY=your-secret-key`: Set the shared secret.

### 2. Configure the Client Machine

On your local machine or CI/CD server (Client):

1.  **Set the Server URL**: The address of your server machine.
    ```bash
    redep config set server_url http://<server-ip>:3000
    ```
    Or use `SERVER_URL` env var.

2.  **Set the Secret Key**: Must match the key set on the Server.
    ```bash
    redep config set secret_key super-secure-secret-123
    ```
    Or use `SECRET_KEY` env var.

### 3. Execute Deployment

To deploy the Frontend (triggers `docker compose up -d` on the server):

```bash
redep deploy fe
```

## Security Best Practices

- **Secret Management**: Ensure your `secret_key` is strong and not committed to version control.
- **Network Security**: In production, it is recommended to run the Server behind a reverse proxy (like Nginx) with SSL/TLS (HTTPS) to encrypt the traffic, especially since the secret key is sent in the header.
- **Firewall**: Restrict access to the Server port (default 3000) to only allow IPs from known Client machines.

## Development

- `bin/index.js`: CLI entry point.
- `lib/server/`: Server and execution logic.
- `lib/client/`: Client and command logic.
- `lib/config.js`: Configuration management using `conf`.

## License

ISC
