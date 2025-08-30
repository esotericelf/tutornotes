# TutorNotes Deployment Guide

This guide covers deploying TutorNotes using Docker and Netlify.

## 🐳 Docker Deployment

### Prerequisites
- Docker installed on your system
- Node.js 18+ (for local development)

### Local Docker Testing

1. **Build the Docker image:**
   ```bash
   docker build -t tutornotes:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:80 tutornotes:latest
   ```

3. **Access the application:**
   - Open http://localhost:3000 in your browser

### Using Docker Compose

1. **Production build:**
   ```bash
   docker-compose up -d
   ```

2. **Development with hot reload:**
   ```bash
   docker-compose --profile dev up -d
   ```

3. **Stop containers:**
   ```bash
   docker-compose down
   ```

### Automated Deployment Script

Run the deployment script to build and test:
```bash
./scripts/deploy.sh
```

## 🌐 Netlify Deployment

### Automatic Deployment (Recommended)

1. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Select your GitHub repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `18`

3. **Deploy:**
   - Netlify will automatically deploy on every push to main branch
   - Your site will be available at a Netlify subdomain

### Manual Deployment

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `build` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=build`

## 🔧 Configuration Files

### Docker Configuration
- `Dockerfile` - Production build with nginx
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Multi-service orchestration
- `nginx.conf` - Nginx server configuration
- `.dockerignore` - Files excluded from Docker build

### Netlify Configuration
- `netlify.toml` - Netlify deployment settings
- Includes redirects for React Router
- Security headers and caching rules

## 🚀 Environment Variables

### For Production
Create a `.env.production` file:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For Netlify
Set environment variables in Netlify dashboard:
- Go to Site settings > Environment variables
- Add your Supabase credentials

## 📊 Monitoring and Health Checks

### Docker Health Check
- Endpoint: `/health`
- Returns "healthy" if the application is running

### Netlify Functions (Future)
- Directory: `netlify/functions/`
- For serverless functions if needed

## 🔒 Security Features

### Docker Security
- Non-root user in container
- Security headers in nginx
- Minimal attack surface with Alpine Linux

### Netlify Security
- HTTPS by default
- Security headers configured
- Content Security Policy enabled

## 📈 Performance Optimization

### Docker
- Multi-stage build for smaller image size
- Nginx with gzip compression
- Static asset caching

### Netlify
- CDN distribution
- Automatic asset optimization
- Edge caching

## 🐛 Troubleshooting

### Docker Issues
1. **Container won't start:**
   ```bash
   docker logs <container_name>
   ```

2. **Port conflicts:**
   ```bash
   docker run -p 3001:80 tutornotes:latest
   ```

3. **Build failures:**
   ```bash
   docker build --no-cache -t tutornotes:latest .
   ```

### Netlify Issues
1. **Build failures:**
   - Check build logs in Netlify dashboard
   - Verify Node.js version compatibility

2. **Routing issues:**
   - Ensure `netlify.toml` redirects are configured
   - Check React Router setup

## 📝 Next Steps

1. **Set up CI/CD:**
   - GitHub Actions for automated testing
   - Automated deployment to staging/production

2. **Add monitoring:**
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics

3. **Domain setup:**
   - Custom domain configuration
   - SSL certificate management

## 🆘 Support

For deployment issues:
1. Check the logs in Docker/Netlify
2. Verify environment variables
3. Test locally first
4. Check network connectivity for external services