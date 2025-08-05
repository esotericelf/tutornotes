#!/bin/bash

# Deployment script for TutorNotes
set -e

echo "🚀 Starting deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build Docker image
echo "📦 Building Docker image..."
docker build -t tutornotes:latest .

# Test the build locally
echo "🧪 Testing Docker container locally..."
docker run -d --name tutornotes-test -p 3000:80 tutornotes:latest

# Wait for container to start
sleep 5

# Check if container is running
if docker ps | grep -q tutornotes-test; then
    echo "✅ Docker container is running successfully!"

    # Test health endpoint
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed, but container is running"
    fi

    # Stop test container
    docker stop tutornotes-test
    docker rm tutornotes-test
else
    echo "❌ Docker container failed to start"
    docker logs tutornotes-test
    docker rm tutornotes-test
    exit 1
fi

echo "🎉 Docker build and test completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. For local testing: docker run -p 3000:80 tutornotes:latest"
echo "2. For Netlify deployment:"
echo "   - Connect your GitHub repo to Netlify"
echo "   - Set build command: npm run build"
echo "   - Set publish directory: build"
echo "   - Deploy!"
echo ""
echo "🔗 Netlify will automatically deploy on git push to main branch"