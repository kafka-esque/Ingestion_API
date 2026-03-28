#!/bin/bash
# API Toolkit Backend - Quick Start Script

set -e

echo "🚀 API Toolkit Backend - Initialization Script"
echo "=============================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 21 or higher."
    exit 1
fi

if ! command -v mvn &> /dev/null && ! [ -f "mvnw" ]; then
    echo "❌ Maven is not installed and mvnw not found."
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | grep -oP '(?<=version ")[^"]*')
echo "✅ Java $JAVA_VERSION found"

echo ""
echo "🔧 Initializing project..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Building project..."

# Build with Maven wrapper if available, otherwise use system Maven
if [ -f "mvnw" ]; then
    ./mvnw clean install
else
    mvn clean install
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start MySQL: docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8"
echo "3. Create database: CREATE DATABASE apitoolkitdb;"
echo "4. Start application: ./mvnw spring-boot:run"
echo "5. Access API at: http://localhost:8080/api"
echo "6. Access Swagger UI at: http://localhost:8080/api/swagger-ui.html"
echo ""
echo "Or use Docker Compose for everything:"
echo "docker-compose up -d"
