# Kafka Integration Implementation

This document describes the Kafka integration implemented in the API Toolkit Backend.

---

## 📋 Overview

Kafka integration provides event-driven architecture for the application with:
- **Event Publishing**: Services publish domain events to Kafka topics
- **Event Consumption**: Services listen and react to events
- **Asynchronous Processing**: Decouple services with message-based communication
- **Event Sourcing**: Maintain an audit trail of all domain events

---

## 🏗 Architecture Components

### 1. Configuration Classes

#### `KafkaProducerConfig.java`
- Configures Kafka producer factory
- Sets up serialization strategy (JSON)
- Configures batching, compression, and retry policies
- Provides `KafkaTemplate` bean for publishing events

#### `KafkaConsumerConfig.java`
- Configures Kafka consumer factory
- Sets up deserialization strategy
- Enables manual acknowledgment for reliability
- Configures error handling and concurrency

#### `KafkaTopicConfig.java`
- Auto-creates Kafka topics on application startup
- Configures retention policies for each topic
- Sets partition count and replication factor

### 2. Event Classes (Domain Models)

#### `BaseEvent.java`
Base class for all domain events with:
- Event ID (UUID)
- Event Type
- Timestamp
- Source service
- Aggregate ID
- Version

#### `ProjectEvent.java`
Events related to project operations:
- Project created
- Project updated
- Project deleted

#### `UserEvent.java`
Events related to user operations:
- User registered
- User updated
- User deleted

#### `AnalyticsEvent.java`
Events for metrics and analytics:
- Metric name and value
- Tags for categorization
- Custom data

#### `NotificationEvent.java`
Events for notifications:
- Recipient information
- Notification type (EMAIL, SMS, IN_APP)
- Subject and message
- Priority level

### 3. Producer Service

#### `KafkaEventProducer.java`
Service for publishing events:

```java
// Publish project event
ProjectEvent event = new ProjectEvent("PROJECT_CREATED", projectId, projectName, ownerId);
kafkaEventProducer.publishProjectEvent(event);

// Publish user event
UserEvent event = new UserEvent("USER_REGISTERED", userId, username, email);
kafkaEventProducer.publishUserEvent(event);

// Publish any event to custom topic
kafkaEventProducer.publishEvent(topic, key, event);
```

### 4. Consumer Service

#### `KafkaEventConsumer.java`
Service for consuming and processing events:

```java
// Automatically listens to project-events topic
@KafkaListener(topics = "project-events", groupId = "${spring.kafka.consumer.group-id}")
public void consumeProjectEvent(ProjectEvent event, Acknowledgment acknowledgment) {
    // Process event
    // Acknowledge after successful processing
    acknowledgment.acknowledge();
}
```

### 5. Demo Controller

#### `KafkaDemoController.java`
REST endpoints for testing Kafka integration:
- `POST /kafka-demo/project/create` - Publish project created event
- `POST /kafka-demo/project/update` - Publish project updated event
- `POST /kafka-demo/user/register` - Publish user registered event
- `POST /kafka-demo/analytics/metric` - Publish analytics event
- `POST /kafka-demo/notification/email` - Publish email notification
- `GET /kafka-demo/status` - Check Kafka integration status

---

## 📊 Kafka Topics

| Topic | Purpose | Retention | Partitions |
|-------|---------|-----------|-----------|
| `project-events` | Project lifecycle events | 7 days | 3 |
| `user-events` | User lifecycle events | 7 days | 3 |
| `analytics-events` | Metrics and analytics | 30 days | 3 |
| `notification-events` | Notification queue | 1 day | 3 |

---

## 🔧 Configuration

### application.properties
```properties
# Kafka Bootstrap Servers
spring.kafka.bootstrap-servers=localhost:9092

# Consumer Group
spring.kafka.consumer.group-id=api-toolkit-group

# Producer Settings
spring.kafka.producer.acks=all
spring.kafka.producer.retries=3
spring.kafka.producer.compression-type=snappy

# Consumer Settings
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.enable-auto-commit=false

# Topic Settings
kafka.topic.partitions=3
kafka.topic.replication-factor=1
```

### Environment Variables (.env)
```env
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_GROUP_ID=api-toolkit-group
```

---

## 🚀 Usage Examples

### 1. Publishing a Project Event

```java
@Autowired
private KafkaEventProducer kafkaEventProducer;

// Create and publish event
ProjectEvent event = new ProjectEvent(
    "PROJECT_CREATED", 
    projectId, 
    projectName, 
    ownerId
);
event.setDescription("New project");

kafkaEventProducer.publishProjectEvent(event);
```

### 2. Consuming Events

The `KafkaEventConsumer` service automatically listens to topics. Extend the handler methods for custom logic:

```java
private void handleProjectCreated(ProjectEvent event) {
    log.info("Project created: {}", event.getProjectName());
    // Send welcome email, update cache, trigger workflows, etc.
}
```

### 3. Testing via REST API

```bash
# Test project creation event
curl -X POST "http://localhost:8080/api/kafka-demo/project/create?projectId=proj-123&projectName=My%20Project"

# Test user registration event
curl -X POST "http://localhost:8080/api/kafka-demo/user/register?userId=user-123&username=john_doe&email=john@example.com"

# Test notification
curl -X POST "http://localhost:8080/api/kafka-demo/notification/email?recipientEmail=user@example.com&subject=Welcome"

# Check Kafka status
curl "http://localhost:8080/api/kafka-demo/status"
```

---

## 🐳 Running with Docker

### Start Kafka Stack
```bash
docker-compose up -d
```

### View Kafka Logs
```bash
docker-compose logs -f kafka
```

### Create Topic Manually (if needed)
```bash
docker exec -it apitoolkit-kafka kafka-topics --create \
  --topic project-events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1
```

### Monitor Topics
```bash
docker exec -it apitoolkit-kafka kafka-topics --list \
  --bootstrap-server localhost:9092
```

---

## 📈 Event Flow Diagram

```
┌─────────────┐
│   Service   │
│   (Event    │
│   Source)   │
└──────┬──────┘
       │
       │ Publishes
       │
┌──────▼──────────────────┐
│ KafkaEventProducer      │
│ - publishProjectEvent() │
│ - publishUserEvent()    │
│ - publishGenericEvent() │
└──────┬──────────────────┘
       │
       │ Sends to Topic
       │
┌──────▼──────────────────┐
│   Kafka Topic           │
│ (project-events)        │
│ (user-events)           │
│ (analytics-events)      │
│ (notification-events)   │
└──────┬──────────────────┘
       │
       │ Consumed by
       │
┌──────▼──────────────────┐
│ KafkaEventConsumer      │
│ - consumeProjectEvent() │
│ - consumeUserEvent()    │
│ - consumeAnalytics()    │
│ - consumeNotification() │
└──────┬──────────────────┘
       │
       │ Processes
       │
┌──────▼──────────────────┐
│   Business Logic        │
│ (Send emails, update    │
│  cache, trigger flows)  │
└─────────────────────────┘
```

---

## ⚙️ Key Features

### ✅ Reliability
- Manual acknowledgment for message processing
- Retry policy with exponential backoff
- Error handling with Dead Letter Queue support

### ✅ Performance
- Batching for efficient message publishing
- Compression (Snappy) to reduce bandwidth
- Configurable partitions for parallelism

### ✅ Monitoring
- Comprehensive logging for all events
- Event tracing with IDs and timestamps
- Graceful error handling and reporting

### ✅ Scalability
- Horizontal scaling with consumer groups
- Partitioning for parallel processing
- Retention policies for data management

---

## 🔐 Security Considerations

1. **Authentication**: Set up Kafka SASL/SSL in production
2. **Authorization**: Implement ACLs for topic access
3. **Encryption**: Enable TLS for Kafka broker communication
4. **Sensitive Data**: Don't log sensitive information in events
5. **Validation**: Validate event data before processing

### Example SASL Configuration
```properties
spring.kafka.security.protocol=SASL_SSL
spring.kafka.sasl.mechanism=PLAIN
spring.kafka.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \
  username="username" password="password";
```

---

## 🧪 Testing

### Unit Tests
Test event serialization/deserialization:
```java
@Test
public void testProjectEventSerialization() {
    ProjectEvent event = new ProjectEvent("PROJECT_CREATED", "p1", "Project 1", "u1");
    // Assert event properties
}
```

### Integration Tests
Test with embedded Kafka:
```java
@SpringBootTest
@EmbeddedKafka(partitions = 1, brokerProperties = {
    "listeners=PLAINTEXT://localhost:9092",
    "port=9092"
})
public class KafkaIntegrationTest {
    // Test producer and consumer
}
```

---

## 📚 Advanced Topics

### Event Sourcing
Store all events and rebuild state from event log:
- Enables time-travel debugging
- Complete audit trail
- Temporal queries possible

### CQRS Pattern
Separate read and write models using events:
- Optimized queries on read model
- Denormalized data for performance
- Eventual consistency

### Saga Pattern
Orchestrate distributed transactions with events:
- Compensating transactions for failure handling
- Long-running process coordination
- Service orchestration

---

## 🔗 Related Documentation

- [Spring Kafka Documentation](https://spring.io/projects/spring-kafka)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

---

## 🆘 Troubleshooting

### Kafka Broker Not Reachable
```
Error: Unable to connect to bootstrap servers
```
**Solution**: Ensure Kafka is running and `KAFKA_BOOTSTRAP_SERVERS` is correctly configured

### Message Deserialization Error
```
Error: Failed to deserialize message
```
**Solution**: Verify event class is in `JsonDeserializer.TRUSTED_PACKAGES`

### Consumer Lag
```
Consumer falling behind producers
```
**Solution**: Increase consumer concurrency or optimize handler logic

### Topics Not Created
```
Topics missing in broker
```
**Solution**: Verify `KafkaTopicConfig` beans are loaded, check broker logs

---

## 📝 Next Steps

1. **Extend Event Handlers**: Add business logic to consumer handlers
2. **Add Dead Letter Queue**: Handle failed message processing
3. **Implement Monitoring**: Add metrics with Prometheus/Grafana
4. **Configure Security**: Set up SASL/SSL for production
5. **Add Integration Tests**: Test producer/consumer behavior
6. **Implement CQRS**: Separate read/write models using events

---

**Status**: ✅ Kafka Integration Complete and Ready for Use

Last Updated: March 28, 2026
