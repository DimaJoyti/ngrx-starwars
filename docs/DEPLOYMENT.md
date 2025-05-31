# 🚀 Deployment Guide

## Overview

This guide covers deploying the Star Wars Character Explorer to various platforms, from development to production environments.

## Prerequisites

- Node.js 18+
- Go 1.21+
- Git
- Docker (optional)

## Environment Setup

### Environment Variables

Create environment files for different stages:

#### `.env.development`
```env
# API Configuration
API_URL=http://localhost:8080/api
API_TIMEOUT=10000

# Application Settings
PRODUCTION=false
DEBUG=true

# Database
DB_PATH=./starwars.db
```

#### `.env.production`
```env
# API Configuration
API_URL=https://your-api-domain.com/api
API_TIMEOUT=5000

# Application Settings
PRODUCTION=true
DEBUG=false

# Database
DB_PATH=/data/starwars.db
```

## Frontend Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# The build artifacts will be in the dist/ directory
```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel deploy
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add API_URL
   # Enter your API URL when prompted
   ```

### Netlify Deployment

1. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist/ngrx-starwars"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Git**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist/ngrx-starwars`

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "dist/ngrx-starwars",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### AWS S3 + CloudFront

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ngrx-starwars s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure error pages for SPA routing

## Backend Deployment

### Local Development

```bash
# Start the Go server
go run main.go

# Or build and run
go build -o starwars-api main.go
./starwars-api
```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   # Dockerfile
   FROM golang:1.21-alpine AS builder
   
   WORKDIR /app
   COPY go.mod go.sum ./
   RUN go mod download
   
   COPY . .
   RUN go build -o starwars-api main.go
   
   FROM alpine:latest
   RUN apk --no-cache add ca-certificates
   WORKDIR /root/
   
   COPY --from=builder /app/starwars-api .
   COPY --from=builder /app/starwars.db .
   
   EXPOSE 8080
   CMD ["./starwars-api"]
   ```

2. **Build and Run**
   ```bash
   # Build image
   docker build -t starwars-api .
   
   # Run container
   docker run -p 8080:8080 starwars-api
   ```

### Heroku Deployment

1. **Create Procfile**
   ```
   web: ./starwars-api
   ```

2. **Deploy**
   ```bash
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create your-app-name
   
   # Set buildpack
   heroku buildpacks:set heroku/go
   
   # Deploy
   git push heroku main
   ```

### DigitalOcean App Platform

1. **Create app.yaml**
   ```yaml
   name: starwars-api
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/ngrx-starwars
       branch: main
     run_command: ./starwars-api
     environment_slug: go
     instance_count: 1
     instance_size_slug: basic-xxs
     http_port: 8080
   ```

2. **Deploy via CLI**
   ```bash
   doctl apps create --spec app.yaml
   ```

### Google Cloud Run

1. **Create cloudbuild.yaml**
   ```yaml
   steps:
   - name: 'gcr.io/cloud-builders/docker'
     args: ['build', '-t', 'gcr.io/$PROJECT_ID/starwars-api', '.']
   - name: 'gcr.io/cloud-builders/docker'
     args: ['push', 'gcr.io/$PROJECT_ID/starwars-api']
   - name: 'gcr.io/cloud-builders/gcloud'
     args: ['run', 'deploy', 'starwars-api', '--image', 'gcr.io/$PROJECT_ID/starwars-api', '--region', 'us-central1', '--platform', 'managed']
   ```

2. **Deploy**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

## Full Stack Deployment

### Docker Compose

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     api:
       build: .
       ports:
         - "8080:8080"
       environment:
         - DB_PATH=/data/starwars.db
       volumes:
         - ./data:/data
   
     frontend:
       image: nginx:alpine
       ports:
         - "80:80"
       volumes:
         - ./dist/ngrx-starwars:/usr/share/nginx/html
         - ./nginx.conf:/etc/nginx/nginx.conf
       depends_on:
         - api
   ```

2. **Deploy**
   ```bash
   # Build frontend
   npm run build
   
   # Start services
   docker-compose up -d
   ```

### Kubernetes Deployment

1. **Create k8s manifests**
   ```yaml
   # api-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: starwars-api
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: starwars-api
     template:
       metadata:
         labels:
           app: starwars-api
       spec:
         containers:
         - name: api
           image: your-registry/starwars-api:latest
           ports:
           - containerPort: 8080
   
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: starwars-api-service
   spec:
     selector:
       app: starwars-api
     ports:
     - port: 80
       targetPort: 8080
     type: LoadBalancer
   ```

2. **Deploy**
   ```bash
   kubectl apply -f k8s/
   ```

## CI/CD Pipeline

### GitHub Actions

1. **Create .github/workflows/deploy.yml**
   ```yaml
   name: Deploy
   
   on:
     push:
       branches: [main]
   
   jobs:
     deploy-frontend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist/ngrx-starwars
   
     deploy-backend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-go@v3
           with:
             go-version: '1.21'
         - run: go build -o starwars-api main.go
         - name: Deploy to server
           run: |
             # Add your deployment script here
   ```

## Monitoring and Health Checks

### Health Check Endpoints

```go
// Add to your Go API
router.GET("/health", func(c *gin.Context) {
    c.JSON(200, gin.H{
        "status": "ok",
        "timestamp": time.Now(),
        "version": "1.0.0",
    })
})
```

### Monitoring Setup

1. **Application Monitoring**
   ```bash
   # Install monitoring tools
   npm install @sentry/angular
   ```

2. **Infrastructure Monitoring**
   - Use Prometheus + Grafana
   - Set up alerts for downtime
   - Monitor resource usage

## SSL/TLS Configuration

### Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        root /var/www/starwars;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Performance Optimization

### Frontend Optimizations

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Set Cache Headers**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

### Backend Optimizations

1. **Database Connection Pooling**
   ```go
   db.SetMaxOpenConns(25)
   db.SetMaxIdleConns(25)
   db.SetConnMaxLifetime(5 * time.Minute)
   ```

2. **Response Compression**
   ```go
   router.Use(gzip.Gzip(gzip.DefaultCompression))
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check API CORS configuration
   - Verify frontend API URL

2. **Build Failures**
   - Check Node.js version compatibility
   - Clear node_modules and reinstall

3. **Database Issues**
   - Verify database file permissions
   - Check SQLite version compatibility

### Debugging Tools

```bash
# Check application logs
docker logs container-name

# Monitor resource usage
docker stats

# Test API endpoints
curl -X GET http://localhost:8080/health
```

## Rollback Strategy

### Quick Rollback

```bash
# Rollback to previous version
git revert HEAD
git push origin main

# Or rollback specific deployment
kubectl rollout undo deployment/starwars-api
```

### Blue-Green Deployment

1. Deploy to green environment
2. Test thoroughly
3. Switch traffic to green
4. Keep blue as backup

This deployment guide ensures your Star Wars Character Explorer runs smoothly in production! 🚀
