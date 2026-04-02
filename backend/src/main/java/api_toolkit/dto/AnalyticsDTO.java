package api_toolkit.dto;

import lombok.*;
import java.util.List;

/**
 * Analytics DTO - Contains all analytics and statistics data structures
 * Used for dashboard and reporting features
 */
@Data
public class AnalyticsDTO {
    
    // Domain usage statistics
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DomainUsage {
        private Long domainId;
        private String domainName;
        private String domainDescription;
        private Long usageCount;
        private Long projectCount;
        private String lastUsed;
    }
    
    // Version usage statistics
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VersionUsage {
        private Long versionId;
        private String versionNumber;
        private String versionDescription;
        private Long domainId;
        private String domainName;
        private Long usageCount;
        private Long projectCount;
        private String lastUsed;
    }
    
    // Service usage statistics
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ServiceUsage {
        private Long serviceId;
        private String serviceName;
        private String serviceDescription;
        private Long domainId;
        private String domainName;
        private Long versionId;
        private String versionNumber;
        private Long usageCount;
        private Long projectCount;
        private String lastUsed;
    }
    
    // Individual user analytics
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserAnalytics {
        private Long userId;
        private String userName;
        private String userEmail;
        private String userRole;
        private Long totalProjects;
        private Long totalContacts;
        private List<DomainUsage> topDomains;
        private List<VersionUsage> topVersions;
        private List<ServiceUsage> topServices;
        private String lastActivity;
    }
    
    // System-wide analytics
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SystemAnalytics {
        private Long totalUsers;
        private Long totalProjects;
        private Long totalContacts;
        private Long totalDomains;
        private Long totalVersions;
        private Long totalServices;
        private List<DomainUsage> mostUsedDomains;
        private List<VersionUsage> mostUsedVersions;
        private List<ServiceUsage> mostUsedServices;
        private List<UserAnalytics> topUsers;
    }
    
    // Project statistics
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectStats {
        private Long totalProjects;
        private Long activeProjects;
        private Long projectsThisMonth;
        private Long projectsThisWeek;
        private String avgProjectsPerUser;
    }
    
    // Contact statistics
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContactStats {
        private Long totalContacts;
        private Long contactsThisMonth;
        private Long contactsThisWeek;
        private String avgContactsPerUser;
    }
}
