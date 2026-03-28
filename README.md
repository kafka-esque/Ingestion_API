# 🚀 API Toolkit - Backend Microservice

Standalone backend service for the API Toolkit project management system. Built with Spring Boot 3, Java 21, and ready for Kafka integration.

---

## ✨ Features

- 🔐 JWT-based Authentication & Authorization
- 🛠️ RESTful API for Project Management
- 📊 Analytics & Reporting
- 🔄 Role-based Access Control (RBAC)
- 📧 Email Notifications
- 🚀 Kafka-ready Architecture
- 📚 OpenAPI/Swagger Documentation

---

## 🏗 Tech Stack

- **Framework**: Spring Boot 3.5.3
- **Java Version**: 21
- **Database**: MySQL 8+
- **Authentication**: JWT
- **Message Queue**: Kafka (Ready for integration)
- **Build Tool**: Maven
- **Documentation**: Springdoc OpenAPI (Swagger UI)

---

## 📋 Prerequisites

- Java 21 or higher
- Maven 3.6 or higher
- MySQL 8+ (or Docker)
- Kafka 3.5+ (Optional, for messaging features)
- Git

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd APIToolkit-Backend
```

### 2. Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DB_URL=jdbc:mysql://localhost:3306/apitoolkitdb
DB_USERNAME=root
DB_PASSWORD=yourpassword
JWT_SECRET_KEY=your-secret-key
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### 3. Database Setup

```sql
CREATE DATABASE apitoolkitdb;
```

Hibernate will automatically create tables on first run.

### 4. Build the Project

```bash
mvn clean install
```

### 5. Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR file:

```bash
java -jar target/backend-1.0.0.jar
```

The application will start on `http://localhost:8080/api`

---

## 📚 API Documentation

Once the application is running, access the Swagger UI:

```
http://localhost:8080/api/swagger-ui.html
```

---

## 🗂 Project Structure

```
src/
├── main/
│   ├── java/api_toolkit/backend/
│   │   ├── BackendApplication.java
│   │   ├── config/              # Configuration classes
│   │   ├── controller/          # REST Controllers
│   │   ├── service/             # Business Logic
│   │   ├── repository/          # Data Access
│   │   ├── entity/              # JPA Entities
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── mapper/              # MapStruct Mappers
│   │   ├── security/            # Security Components
│   │   └── exception/           # Custom Exceptions
│   └── resources/
│       └── application.properties
└── test/
    ├── java/                    # Test Classes
    └── resources/               # Test Configuration
```

---

## 🔧 Configuration Guide

### Database Configuration

Located in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/apitoolkitdb
spring.datasource.username=root
spring.datasource.password=password
```

### JWT Configuration

```properties
app.jwt.secret=your-secret-key
app.jwt.expiration=86400000  # 24 hours in milliseconds
```

### Kafka Configuration (When Ready)

```properties
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
```

### CORS Configuration

Update `frontend.url` in `application.properties`:

```properties
frontend.url=http://localhost:5173
```

---

## 🐳 Docker Setup (Optional)

### MySQL with Docker

```bash
docker run -d \
  --name mysql-apitoolkit \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=apitoolkitdb \
  -p 3306:3306 \
  mysql:8
```

### Kafka with Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

Run:

```bash
docker-compose up -d
```

---

## 🧪 Testing

### Run All Tests

```bash
mvn test
```

### Run Specific Test Class

```bash
mvn test -Dtest=YourTestClass
```

### Run Tests with Coverage

```bash
mvn clean test jacoco:report
```

---

## 📦 Building for Production

### Create Production JAR

```bash
mvn clean package -DskipTests -P production
```

### Build Docker Image

```bash
docker build -t api-toolkit-backend:1.0.0 .
```

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files. Always use environment variables in production.
2. **JWT Secret**: Use a strong, long secret key in production.
3. **HTTPS**: Enable HTTPS in production.
4. **CORS**: Whitelist only trusted frontend domains.
5. **Database**: Use strong passwords and enable SSL.
6. **Dependencies**: Regularly update dependencies for security patches.

---

## 📝 API Endpoints (Coming Soon)

- `POST /api/auth/signup` - User Registration
- `POST /api/auth/login` - User Login
- `POST /api/auth/refresh-token` - Refresh JWT Token
- `GET /api/projects` - List Projects
- `POST /api/projects` - Create Project
- `GET /api/projects/{id}` - Get Project Details
- `PUT /api/projects/{id}` - Update Project
- `DELETE /api/projects/{id}` - Delete Project

---

## 🔗 Related Projects

- **Frontend**: [APIToolkit-Frontend](https://github.com/your-org/api-toolkit-frontend)
- **Full Application**: [APIToolkit-Project](https://github.com/your-org/api-toolkit-project)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

For support, email support@apitoolkit.com or create an issue on GitHub.

---

## 🔄 Future Enhancements

- ✅ Kafka Integration for Event Streaming
- ✅ Microservices Architecture
- ✅ GraphQL Support
- ✅ Advanced Caching with Redis
- ✅ Elasticsearch Integration
- ✅ Kubernetes Deployment
- ✅ CI/CD Pipeline Setup

---

## 📊 Project Status

**Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: March 2026

