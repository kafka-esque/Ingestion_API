package api_toolkit.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.openapi.models.OpenAPI;
import org.springdoc.openapi.models.info.Info;
import org.springdoc.openapi.models.info.Contact;
import org.springdoc.openapi.models.info.License;

/**
 * OpenAPI (Swagger) Configuration
 * 
 * Configures API documentation accessible at /swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("API Toolkit Backend")
                .version("1.0.0")
                .description("RESTful API for API Toolkit Project Management System")
                .contact(new Contact()
                    .name("API Toolkit Team")
                    .email("support@apitoolkit.com")
                    .url("https://www.apitoolkit.com"))
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT")));
    }
}
