# Installation

This guide covers detailed installation instructions for the Typesense Search Plugin.

## Prerequisites

### System Requirements

- **Node.js**: 22.19.0+ or 20.9.0+
- **Payload CMS**: 3.37.0+
- **Typesense**: 0.25.2+
- **Package Manager**: pnpm (recommended), npm, or yarn

### Typesense Setup

The plugin requires a running Typesense instance. Here are several ways to set it up:

## Option 1: Docker Compose (Recommended)

This is the easiest way to get started with Typesense.

### 1. Create docker-compose.yml

```yaml
version: '3.8'
services:
  typesense:
    image: typesense/typesense:0.25.2
    ports:
      - '8108:8108'
    volumes:
      - ./typesense-data:/data
    command: '--data-dir /data --api-key=xyz --enable-cors'
    environment:
      - TYPESENSE_DATA_DIR=/data
    restart: unless-stopped
```

### 2. Start Typesense

```bash
# Start Typesense
docker-compose up -d

# Check if it's running
curl http://localhost:8108/health
```

### 3. Stop Typesense

```bash
# Stop Typesense
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Option 2: Manual Docker Setup

If you prefer to run Typesense manually:

```bash
# Create data directory
mkdir -p typesense-data

# Run Typesense container
docker run -d \
  --name typesense \
  -p 8108:8108 \
  -v $(pwd)/typesense-data:/data \
  typesense/typesense:0.25.2 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors

# Check health
curl http://localhost:8108/health

# Stop and remove
docker stop typesense
docker rm typesense
```

## Option 3: Local Installation

For development, you can install Typesense locally:

### macOS (using Homebrew)

```bash
# Install Typesense
brew install typesense/tap/typesense-server

# Start Typesense
typesense-server --data-dir ./typesense-data --api-key=xyz --enable-cors
```

### Linux

```bash
# Download Typesense
wget https://dl.typesense.org/releases/0.25.2/typesense-server-0.25.2-amd64.deb

# Install
sudo dpkg -i typesense-server-0.25.2-amd64.deb

# Start Typesense
typesense-server --data-dir ./typesense-data --api-key=xyz --enable-cors
```

## Install the Plugin

### Using pnpm (Recommended)

```bash
pnpm add typesense-search-plugin
```

### Using npm

```bash
npm install typesense-search-plugin
```

### Using yarn

```bash
yarn add typesense-search-plugin
```

## Verify Installation

After installation, verify everything is working:

```typescript
// test-connection.ts
import { TypesenseClient } from 'typesense'

const client = new TypesenseClient({
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
  apiKey: 'xyz',
})

async function testConnection() {
  try {
    const health = await client.health.retrieve()
    console.log('✅ Typesense is healthy:', health)
  } catch (error) {
    console.error('❌ Typesense connection failed:', error)
  }
}

testConnection()
```

## Environment Variables

For production, use environment variables:

```bash
# .env
TYPESENSE_API_KEY=your-production-api-key
TYPESENSE_NODES=[{"host":"your-typesense-host","port":"443","protocol":"https"}]
```

## Next Steps

Once installation is complete:

1. [Configure your collections](/guide/configuration)
2. [Set up the plugin in Payload](/guide/quick-start)
3. [Add search components to your UI](/components/headless-search-input)

## Troubleshooting

### Common Issues

**Typesense won't start:**

- Check if port 8108 is available
- Ensure Docker is running
- Verify the data directory has proper permissions

**Connection refused:**

- Verify Typesense is running: `curl http://localhost:8108/health`
- Check firewall settings
- Ensure the correct host and port

**API key errors:**

- Verify the API key matches what you used to start Typesense
- Check for typos in the configuration

For more help, see the [Troubleshooting guide](/guide/troubleshooting).
