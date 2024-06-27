# README for librechat Dev

## Setup

## Local Dev Container

```docker-compose up --build```

```docker compose up```
```docker compose down```

```docker buildx create --name multiarch --use```

``` docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/justlyai/legallibrechat-dev:latest \
  -f Dockerfile.multi --target api-build \
  --push .
```

``` docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/YOUR_GITHUB_USERNAME/legallibrechat-dev-api:latest \
  -f Dockerfile.multi --target api-build \
  --push . ```

``` docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/justlyai/legallibrechat-dev-client:latest \
  -f Dockerfile.multi --target client-build \
  --push . ```

``` docker compose up --pull always ```

``` docker compose up --build ```

**1. Local Docker Build**

Install [Docker](https://www.docker.com/products/docker-desktop/)


```docker build -t librechat-dev:latest .```

**2. Docker Compose Override**


```docker-compose -f docker-compose.yml -f docker-compose.override.dev.yml up -d```

# Setting up GitHub Container Registry for Three-Branch librechat

## Branch Structure
1. `main`: Syncs with original LibreChat
2. `legal-features`: Public branch with legal-specific features
3. `legal-features-dev`: Local development branch, not pushed to GitHub

## Setup and Workflow

1. **Fork and Clone the LibreChat Repository**
   ```bash
   git clone https://github.com/justlyai/legallibrechat.git
   cd librechat
   ```

2. **Create Branches**
   ```bash
   git checkout -b legal-features
   git checkout -b legal-features-dev
   ```

3. **GitHub Container Registry Setup**
   - Create a Personal Access Token (PAT) with `repo`, `write:packages`, `delete:packages` scopes
   - Authenticate: 
     ```bash
     echo YOUR_PAT | docker login ghcr.io -u justlyai --password-stdin
     ```

4. **Building and Pushing Images**
   For `main` branch:
   ```bash
   git checkout main
   docker build -t ghcr.io/justlyai/legallibrechat:latest .
   docker build -t ghcr.io/justlyai/legallibrechat-api:latest .
   docker build -t ghcr.io/justlyai/legallibrechat-rag-api:latest .
   
   docker push ghcr.io/justlyai/legallibrechat:latest
   docker push ghcr.io/justlyai/legallibrechat-api:latest
   docker push ghcr.io/justlyai/legallibrechat-rag-api:latest
   ```
   
   For `legal-features` branch:
   ```bash
   git checkout legal-features
   docker build -t ghcr.io/justlyai/legallibrechat:latest .
   docker build -t ghcr.io/justlyai/legallibrechat-api:latest .
   docker build -t ghcr.io/justlyai/legallibrechat-rag-api:latest .
   
   docker push ghcr.io/justlyai/legallibrechat:latest
   docker push ghcr.io/justlyai/legallibrechat-api:latest
   docker push ghcr.io/justlyai/legallibrechat-rag-api:latest
   ```
   
   For `legal-features-dev` branch (local use only):
   ```bash
   git checkout legal-features-dev
   
   docker buildx build --platform linux/amd64 -t legallibrechat-dev . --load # docker build -t librechat-dev:latest .
   
   docker buildx build --platform linux/amd64 -t legallibrechat-api-dev . --load # docker build -t librechat-api-dev:latest .
   docker buildx build --platform linux/amd64 -t legallibrechat-rag-api-dev . --load # docker build -t docker build -t librechat-rag-api:latest .
   ```

   ```docker run -p 8080:8080 legallibrechat-dev```

5. **Update docker-compose.override.yaml**
   Create separate override files for each branch if needed. For `legal-features-dev`:
   ```yaml
   services:
     api:
       image: librechat-dev:latest
     # ... other services
   ```

6. **Syncing and Merging**
   ```bash
   # Sync main with original LibreChat
   git checkout main
   git pull upstream main
   git push origin main

   # Update legal-features
   git checkout legal-features
   git merge main
   git push origin legal-features

   # Update legal-features-dev (locally)
   git checkout legal-features-dev
   git merge legal-features
   ```

7. **Local Development Workflow**
   - Make changes in `legal-features-dev`
   - Test locally using `librechat-dev:latest` image
   - When ready, merge changes into `legal-features`
   # Merge changes from `legal-features-dev` into `legal-features`
   
   - Build and push `legal-features` image to GitHub Container Registry

8. **GitIgnore for Local Dev**
   Add to .gitignore:
   ```
   # Ignore local dev docker-compose override
   docker-compose.override.dev.yaml
   ```

9. **Separate docker-compose files**
   - `docker-compose.yaml`: Base configuration
   - `docker-compose.override.yaml`: For `legal-features` branch
   - `docker-compose.override.dev.yaml`: For local `legal-features-dev` (not tracked by git)