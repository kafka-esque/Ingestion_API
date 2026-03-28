package api_toolkit.backend.config;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.KafkaAdmin;

/**
 * Kafka Topic Configuration
 * 
 * Automatically creates Kafka topics on application startup.
 * Topics are created with appropriate partition count and replication factor.
 */
@Configuration
@EnableKafka
public class KafkaTopicConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${kafka.topic.partitions:3}")
    private int partitions;

    @Value("${kafka.topic.replication-factor:1}")
    private short replicationFactor;

    /**
     * Kafka Admin configuration
     */
    @Bean
    public KafkaAdmin kafkaAdmin() {
        return new KafkaAdmin(java.util.Map.of(
            AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers
        ));
    }

    /**
     * Create project events topic
     */
    @Bean
    public NewTopic projectEventsTopic() {
        return new NewTopic("project-events", partitions, replicationFactor)
            .configs(java.util.Map.of(
                "retention.ms", "604800000",  // 7 days
                "compression.type", "snappy"
            ));
    }

    /**
     * Create user events topic
     */
    @Bean
    public NewTopic userEventsTopic() {
        return new NewTopic("user-events", partitions, replicationFactor)
            .configs(java.util.Map.of(
                "retention.ms", "604800000",  // 7 days
                "compression.type", "snappy"
            ));
    }

    /**
     * Create analytics events topic
     */
    @Bean
    public NewTopic analyticsEventsTopic() {
        return new NewTopic("analytics-events", partitions, replicationFactor)
            .configs(java.util.Map.of(
                "retention.ms", "2592000000",  // 30 days for analytics
                "compression.type", "snappy"
            ));
    }

    /**
     * Create notification events topic
     */
    @Bean
    public NewTopic notificationEventsTopic() {
        return new NewTopic("notification-events", partitions, replicationFactor)
            .configs(java.util.Map.of(
                "retention.ms", "86400000",  // 1 day
                "compression.type", "snappy"
            ));
    }
}
