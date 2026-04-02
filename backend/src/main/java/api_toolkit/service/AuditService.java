package api_toolkit.service;

import api_toolkit.entity.UserEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Audit and notification service for tracking admin actions.
 * Beginner-friendly: Shows logging patterns and notification placeholders in Spring Boot.
 */
@Service
@Slf4j
public class AuditService {

    /** Log admin deletion of user's contact */
    public void logContactDeletion(UserEntity admin, UserEntity contactOwner, Long contactId, String contactEmail) {
        logAdminAction("deleted contact", admin, contactOwner, contactEmail, contactId);
    }

    /** Log admin deletion of user's project */
    public void logProjectDeletion(UserEntity admin, UserEntity projectOwner, Long projectId, String projectIdentifier) {
        logAdminAction("deleted project", admin, projectOwner, projectIdentifier, projectId);
    }

    /** Notify user about contact deletion by admin */
    public void notifyUserContactDeleted(UserEntity contactOwner, String contactEmail, UserEntity deletedBy) {
        notifyUser(contactOwner, "contact", contactEmail, deletedBy);
    }

    /** Notify user about project deletion by admin */
    public void notifyUserProjectDeleted(UserEntity projectOwner, String projectIdentifier, UserEntity deletedBy) {
        notifyUser(projectOwner, "project", projectIdentifier, deletedBy);
    }

    // Helper methods - DRY principle

    /** Generic admin action logging */
    private void logAdminAction(String action, UserEntity admin, UserEntity owner, String resourceName, Long resourceId) {
        log.info("AUDIT: Admin {} ({}) {} '{}' (ID: {}) belonging to user {} ({})", 
                admin.getEmail(), admin.getId(), action, resourceName, resourceId,
                owner.getEmail(), owner.getId());
    }

    /** Generic user notification (placeholder for real notification system) */
    private void notifyUser(UserEntity owner, String resourceType, String resourceName, UserEntity deletedBy) {
        log.info("NOTIFICATION: User {} ({}) - Your {} '{}' was deleted by {} {} ({})", 
                owner.getEmail(), owner.getId(), resourceType, resourceName,
                deletedBy.getRole(), deletedBy.getEmail(), deletedBy.getId());
        
        // TODO: Replace with actual notification system (email, push, in-app notifications)
    }
}
