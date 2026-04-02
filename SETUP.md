# API Toolkit Backend - Build and Deployment Guide

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Maven 3.6+
- Git

### Quick Build
```bash
# Clone the repo
git clone <your-repo-url>
cd APIToolkit-Backend

# Build with Maven Wrapper (no Maven installation needed)
./mvnw clean install

# Or with system Maven
mvn clean install
```

---

## 🐳 Docker Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services (MySQL, Kafka, Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Option 2: Build Docker Image Manually

```bash
# Build image
docker build -t api-toolkit-backend:1.0.0 .

# Run container
docker run -p 8080:8080 \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/apitoolkitdb \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  api-toolkit-backend:1.0.0
```

---

## 🔧 Development Setup

### Local Development

1. **Start MySQL**
```bash
docker run -d \
  --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=apitoolkitdb \
  -p 3306:3306 \
  mysql:8
```

2. **Start Kafka** (Optional, for testing Kafka features later)
```bash
docker-compose up -d kafka zookeeper
```

3. **Run the application**
```bash
./mvnw spring-boot:run
```

4. **Access the API**
- API Base URL: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`

---

## 📦 Build Profiles

```bash
# Development (default)
mvn clean install

# Production
mvn clean install -P production -DskipTests

# With Code Coverage
mvn clean install jacoco:report
```

---

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run specific test
./mvnw test -Dtest=UserServiceTest

# Generate test coverage report
./mvnw clean test jacoco:report
# Report location: target/site/jacoco/index.html
```

---

## 📋 Useful Maven Commands

```bash
# Clean build directory
mvn clean

# Package without running tests
mvn package -DskipTests

# Update dependencies
mvn dependency:update-snapshots

# Check for security vulnerabilities
mvn dependency-check:check

# Format code
mvn spotless:apply

# Generate project documentation
mvn site
```

---

## 🔐 Production Checklist

- [ ] Update `.env` with strong JWT secret
- [ ] Configure production database credentials
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerting
- [ ] Enable database backups
- [ ] Configure Kafka cluster (if using)
- [ ] Set up CI/CD pipeline
- [ ] Test disaster recovery

---

## 📊 Project Structure

```
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── api_toolkit/backend/
│   │   │       ├── BackendApplication.java
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── entity/
│   │   │       ├── dto/
│   │   │       └── mapper/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

### Maven Cache Issues
```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Rebuild
mvn clean install
```

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `.env`
- Verify database exists: `CREATE DATABASE apitoolkitdb;`

---

## 🔗 Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Maven Documentation](https://maven.apache.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Kafka Documentation](https://kafka.apache.org/)

