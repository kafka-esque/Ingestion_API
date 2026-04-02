package api_toolkit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.mail.javamail.*;
import java.util.Properties;

/**
 * Mail Configuration - Handles email service setup
 * Configures SMTP settings for sending emails (password reset, notifications)
 */
@Configuration
public class MailConfig {

    @Value("${spring.mail.host}")
    private String mailHost;

    @Value("${spring.mail.port}")
    private int mailPort;

    @Value("${spring.mail.username}")
    private String mailUsername;

    @Value("${spring.mail.password}")
    private String mailPassword;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        // Basic SMTP configuration
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);

        // SMTP properties for secure email sending
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.debug", "true");               // Debug logging
        props.put("mail.smtp.ssl.trust", mailHost);
        props.put("mail.smtp.timeout", "30000");       // Connection timeouts
        props.put("mail.smtp.connectiontimeout", "30000");
        props.put("mail.smtp.writetimeout", "30000");

        return mailSender;
    }
}
