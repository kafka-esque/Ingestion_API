package api_toolkit.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main Spring Boot Application for API Toolkit.
 * Entry point to start the backend server.
 */
@SpringBootApplication(scanBasePackages = "api_toolkit")
@EnableJpaRepositories(basePackages = "api_toolkit.repository")
@EntityScan(basePackages = "api_toolkit.entity")
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("\n====== API Toolkit Server Started! ======");
        System.out.println("====== URL: http://localhost:8080 ======");
        System.out.println("====== API: http://localhost:8080/api/projects\n ======");
    }
}
