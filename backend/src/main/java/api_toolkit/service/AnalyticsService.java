package api_toolkit.service;

import api_toolkit.dto.AnalyticsDTO;
import api_toolkit.entity.*;
import api_toolkit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Service - generates usage statistics and insights for users, projects, and system.
 * Beginner-friendly: Shows analytics pattern in Spring Boot with proper error handling.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ContactRepository contactRepository;
    private final DomainRepository domainRepository;
    private final DomainVersionRepository domainVersionRepository;
    private final OperationServiceRepository operationServiceRepository;
    private final AuthorizationService authorizationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Get analytics for specific user - projects, contacts, and usage patterns.
     */
    public AnalyticsDTO.UserAnalytics getUserAnalytics(Long userId) {
        log.debug("Getting analytics for user ID: {}", userId);
        
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ProjectEntity> userProjects = projectRepository.findByUserId(userId);
        List<ContactEntity> userContacts = contactRepository.findByUserId(userId);
        String lastActivity = getLastActivity(userProjects);

        return new AnalyticsDTO.UserAnalytics(
                user.getId(), user.getName(), user.getEmail(), user.getRole(),
                (long) userProjects.size(), (long) userContacts.size(),
                getDomainUsage(userProjects), getVersionUsage(userProjects), 
                getServiceUsage(userProjects), lastActivity
        );
    }

    /**
     * Get current user's analytics.
     */
    public AnalyticsDTO.UserAnalytics getCurrentUserAnalytics() {
        return getUserAnalytics(authorizationService.getCurrentUser().getId());
    }

    /**
     * Get system-wide analytics (admin only) - counts and usage statistics.
     */
    public AnalyticsDTO.SystemAnalytics getSystemAnalytics() {
        try {
            log.debug("Getting system-wide analytics");
            authorizationService.requireAdminOrOnboardingPermissions();

            List<ProjectEntity> allProjects = projectRepository.findAll();

            return new AnalyticsDTO.SystemAnalytics(
                    userRepository.count(), projectRepository.count(), contactRepository.count(),
                    domainRepository.count(), domainVersionRepository.count(), operationServiceRepository.count(),
                    getDomainUsage(allProjects), getVersionUsage(allProjects), 
                    getServiceUsage(allProjects), getTopUsers()
            );
        } catch (Exception e) {
            log.error("Error getting system analytics", e);
            return new AnalyticsDTO.SystemAnalytics(0L, 0L, 0L, 0L, 0L, 0L,
                    new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
        }
    }

    /**
     * Get project statistics - counts and trends for current user or admin.
     */
    public AnalyticsDTO.ProjectStats getProjectStats() {
        try {
            UserEntity currentUser = authorizationService.getCurrentUser();
            boolean isAdmin = authorizationService.hasAdminOrOnboardingPermissions();

            List<ProjectEntity> projects = isAdmin ? 
                    projectRepository.findAll() : 
                    projectRepository.findByUserId(currentUser.getId());

            LocalDateTime now = LocalDateTime.now();
            long projectsThisWeek = countProjectsSince(projects, now.minusWeeks(1));
            long projectsThisMonth = countProjectsSince(projects, now.minusMonths(1));

            String avgProjectsPerUser = isAdmin ? 
                    String.format("%.1f", (double) projects.size() / Math.max(1, userRepository.count())) :
                    String.valueOf(projects.size());

            return new AnalyticsDTO.ProjectStats(
                    (long) projects.size(), (long) projects.size(), 
                    projectsThisMonth, projectsThisWeek, avgProjectsPerUser
            );
        } catch (Exception e) {
            log.warn("Error getting project stats, using fallback data");
            return getFallbackProjectStats();
        }
    }

    /**
     * Get contact statistics
     */
    public AnalyticsDTO.ContactStats getContactStats() {
        try {
            UserEntity currentUser = authorizationService.getCurrentUser();
            boolean isAdmin = authorizationService.hasAdminOrOnboardingPermissions();

            List<ContactEntity> contacts = isAdmin ? 
                    contactRepository.findAll().stream()
                            .filter(this::isValidContact)
                            .collect(Collectors.toList()) :
                    contactRepository.findByUserId(currentUser.getId());

            log.debug("Found {} contacts for user {}", contacts.size(), 
                    isAdmin ? "admin" : currentUser.getId());

            String avgContactsPerUser = isAdmin ? 
                    String.format("%.1f", (double) contacts.size() / Math.max(1, userRepository.count())) :
                    String.valueOf(contacts.size());

            return new AnalyticsDTO.ContactStats(
                    (long) contacts.size(),
                    (long) contacts.size(), // contactsThisMonth
                    (long) contacts.size(), // contactsThisWeek
                    avgContactsPerUser
            );
        } catch (Exception e) {
            log.error("Error getting contact statistics", e);
            return new AnalyticsDTO.ContactStats(0L, 0L, 0L, "0");
        }
    }

    /**
     * Clean up database integrity issues
     */
    @Transactional
    public String cleanupDataIntegrity() {
        log.info("Starting database integrity cleanup");
        
        try {
            List<ContactEntity> orphanedContacts = contactRepository.findAll().stream()
                    .filter(contact -> !isValidContact(contact))
                    .collect(Collectors.toList());
            
            if (!orphanedContacts.isEmpty()) {
                contactRepository.deleteAll(orphanedContacts);
                log.info("Deleted {} orphaned contacts", orphanedContacts.size());
                return String.format("Database cleanup completed successfully. Total records cleaned: %d", 
                        orphanedContacts.size());
            }
            
            return "Database cleanup completed. No issues found.";
        } catch (Exception e) {
            log.error("Error during database cleanup", e);
            return "Error during database cleanup: " + e.getMessage();
        }
    }

    // Helper methods - streamlined and DRY

    /**
     * Extract last activity date from projects
     */
    private String getLastActivity(List<ProjectEntity> projects) {
        return projects.stream()
                .map(ProjectEntity::getUpdatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .map(dt -> dt.format(DATE_FORMATTER))
                .orElse("No activity");
    }

    /**
     * Check if contact has valid user reference
     */
    private boolean isValidContact(ContactEntity contact) {
        try {
            if (contact.getUser() == null) return false;
            Long userId = contact.getUser().getId();
            return userId != null && userId > 0 && userRepository.existsById(userId);
        } catch (Exception e) {
            log.debug("Error validating contact {}: {}", contact.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * Count projects created since specified date
     */
    private long countProjectsSince(List<ProjectEntity> projects, LocalDateTime since) {
        return projects.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(since))
                .count();
    }

    /**
     * Fallback project stats when error occurs
     */
    private AnalyticsDTO.ProjectStats getFallbackProjectStats() {
        List<ProjectEntity> allProjects = projectRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        return new AnalyticsDTO.ProjectStats(
                (long) allProjects.size(),
                (long) allProjects.size(),
                countProjectsSince(allProjects, now.minusMonths(1)),
                countProjectsSince(allProjects, now.minusWeeks(1)),
                String.format("%.1f", (double) allProjects.size() / Math.max(1, userRepository.count()))
        );
    }

    /**
     * Generic method to extract domain usage from projects
     */
    private List<AnalyticsDTO.DomainUsage> getDomainUsage(List<ProjectEntity> projects) {
        Map<Long, AnalyticsDTO.DomainUsage> usageMap = new HashMap<>();
        
        projects.forEach(project -> 
            project.getOperations().forEach(operation -> {
                try {
                    OperationServiceEntity service = operation.getService();
                    if (service != null && service.getDomain() != null) {
                        updateDomainUsage(usageMap, service.getDomain(), project);
                    }
                } catch (Exception e) {
                    log.warn("Error processing domain usage: {}", e.getMessage());
                }
            })
        );
        
        return usageMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getUsageCount(), a.getUsageCount()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Generic method to extract version usage from projects
     */
    private List<AnalyticsDTO.VersionUsage> getVersionUsage(List<ProjectEntity> projects) {
        Map<Long, AnalyticsDTO.VersionUsage> usageMap = new HashMap<>();
        
        projects.forEach(project -> 
            project.getOperations().forEach(operation -> {
                try {
                    OperationServiceEntity service = operation.getService();
                    if (service != null && service.getVersion() != null) {
                        updateVersionUsage(usageMap, service.getVersion(), service.getDomain(), project);
                    }
                } catch (Exception e) {
                    log.warn("Error processing version usage: {}", e.getMessage());
                }
            })
        );
        
        return usageMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getUsageCount(), a.getUsageCount()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Generic method to extract service usage from projects
     */
    private List<AnalyticsDTO.ServiceUsage> getServiceUsage(List<ProjectEntity> projects) {
        Map<Long, AnalyticsDTO.ServiceUsage> usageMap = new HashMap<>();
        
        projects.forEach(project -> 
            project.getOperations().forEach(operation -> {
                try {
                    OperationServiceEntity service = operation.getService();
                    if (service != null) {
                        updateServiceUsage(usageMap, service, project);
                    }
                } catch (Exception e) {
                    log.warn("Error processing service usage: {}", e.getMessage());
                }
            })
        );
        
        return usageMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getUsageCount(), a.getUsageCount()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Update domain usage map with new entry or increment existing
     */
    private void updateDomainUsage(Map<Long, AnalyticsDTO.DomainUsage> usageMap, 
                                   DomainEntity domain, ProjectEntity project) {
        Long domainId = domain.getId();
        AnalyticsDTO.DomainUsage usage = usageMap.get(domainId);
        
        if (usage == null) {
            usage = new AnalyticsDTO.DomainUsage(
                    domainId, domain.getName(), null, 1L, 1L,
                    project.getUpdatedAt() != null ? 
                            project.getUpdatedAt().format(DATE_FORMATTER) : "Unknown"
            );
            usageMap.put(domainId, usage);
        } else {
            usage.setUsageCount(usage.getUsageCount() + 1);
            updateLastUsed(usage, project);
        }
    }

    /**
     * Update version usage map with new entry or increment existing
     */
    private void updateVersionUsage(Map<Long, AnalyticsDTO.VersionUsage> usageMap,
                                    DomainVersionEntity version, DomainEntity domain, ProjectEntity project) {
        Long versionId = version.getId();
        AnalyticsDTO.VersionUsage usage = usageMap.get(versionId);
        
        if (usage == null) {
            usage = new AnalyticsDTO.VersionUsage(
                    versionId, version.getVersion(), null,
                    domain != null ? domain.getId() : null, 
                    domain != null ? domain.getName() : "Unknown",
                    1L, 1L,
                    project.getUpdatedAt() != null ? 
                            project.getUpdatedAt().format(DATE_FORMATTER) : "Unknown"
            );
            usageMap.put(versionId, usage);
        } else {
            usage.setUsageCount(usage.getUsageCount() + 1);
            updateLastUsed(usage, project);
        }
    }

    /**
     * Update service usage map with new entry or increment existing
     */
    private void updateServiceUsage(Map<Long, AnalyticsDTO.ServiceUsage> usageMap,
                                    OperationServiceEntity service, ProjectEntity project) {
        Long serviceId = service.getId();
        AnalyticsDTO.ServiceUsage usage = usageMap.get(serviceId);
        DomainEntity domain = service.getDomain();
        DomainVersionEntity version = service.getVersion();
        
        if (usage == null) {
            usage = new AnalyticsDTO.ServiceUsage(
                    serviceId, service.getOperationName(), null,
                    domain != null ? domain.getId() : null, 
                    domain != null ? domain.getName() : "Unknown",
                    version != null ? version.getId() : null, 
                    version != null ? version.getVersion() : "Unknown",
                    1L, 1L,
                    project.getUpdatedAt() != null ? 
                            project.getUpdatedAt().format(DATE_FORMATTER) : "Unknown"
            );
            usageMap.put(serviceId, usage);
        } else {
            usage.setUsageCount(usage.getUsageCount() + 1);
            updateLastUsed(usage, project);
        }
    }

    /**
     * Update last used date for domain usage
     */
    private void updateLastUsed(AnalyticsDTO.DomainUsage usage, ProjectEntity project) {
        if (project.getUpdatedAt() != null) {
            String projectDate = project.getUpdatedAt().format(DATE_FORMATTER);
            if (usage.getLastUsed().compareTo(projectDate) < 0) {
                usage.setLastUsed(projectDate);
            }
        }
    }

    /**
     * Update last used date for version usage
     */
    private void updateLastUsed(AnalyticsDTO.VersionUsage usage, ProjectEntity project) {
        if (project.getUpdatedAt() != null) {
            String projectDate = project.getUpdatedAt().format(DATE_FORMATTER);
            if (usage.getLastUsed().compareTo(projectDate) < 0) {
                usage.setLastUsed(projectDate);
            }
        }
    }

    /**
     * Update last used date for service usage
     */
    private void updateLastUsed(AnalyticsDTO.ServiceUsage usage, ProjectEntity project) {
        if (project.getUpdatedAt() != null) {
            String projectDate = project.getUpdatedAt().format(DATE_FORMATTER);
            if (usage.getLastUsed().compareTo(projectDate) < 0) {
                usage.setLastUsed(projectDate);
            }
        }
    }

    /**
     * Get top users by project count
     */
    private List<AnalyticsDTO.UserAnalytics> getTopUsers() {
        try {
            return userRepository.findAll().stream()
                    .map(this::buildUserAnalytics)
                    .sorted((a, b) -> Long.compare(b.getTotalProjects(), a.getTotalProjects()))
                    .limit(10)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting top users", e);
            return new ArrayList<>();
        }
    }

    /**
     * Build user analytics with error handling
     */
    private AnalyticsDTO.UserAnalytics buildUserAnalytics(UserEntity user) {
        try {
            List<ProjectEntity> userProjects = projectRepository.findByUserId(user.getId());
            List<ContactEntity> userContacts = contactRepository.findByUserId(user.getId());
            
            return new AnalyticsDTO.UserAnalytics(
                    user.getId(), user.getName(), user.getEmail(), user.getRole(),
                    (long) userProjects.size(), (long) userContacts.size(),
                    new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), // Empty for top-level view
                    getLastActivity(userProjects)
            );
        } catch (Exception e) {
            log.warn("Error getting analytics for user {}: {}", user.getId(), e.getMessage());
            return new AnalyticsDTO.UserAnalytics(
                    user.getId(), user.getName(), user.getEmail(), user.getRole(),
                    0L, 0L, new ArrayList<>(), new ArrayList<>(), new ArrayList<>(),
                    "Error fetching activity"
            );
        }
    }
}
