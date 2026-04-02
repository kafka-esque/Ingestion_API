package api_toolkit.service;

import api_toolkit.dto.ContactDTO;
import api_toolkit.entity.*;
import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.mapper.ContactMapper;
import api_toolkit.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contact service for CRUD operations with role-based access control.
 * Beginner-friendly: Shows service layer patterns, authorization, and audit logging.
 */
@Service
@RequiredArgsConstructor
public class ContactService {
    
    private final ContactRepository repo;
    private final ContactMapper mapper;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;

    /** Get all contacts (admin/onboarding only) */
    public List<ContactDTO> getAll() {
        authorizationService.requireAdminOrOnboardingPermissions();
        return repo.findAll().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    /** Get contacts by user ID with permission validation */
    public List<ContactDTO> getContactsByUserId(Long userId) {
        UserEntity currentUser = authorizationService.getCurrentUser();
        validateUserAccess(currentUser, userId);
        return mapContactsToDTO(repo.findByUserId(userId));
    }

    /** Get current user's contacts */
    public List<ContactDTO> getMyContacts() {
        UserEntity currentUser = authorizationService.getCurrentUser();
        return mapContactsToDTO(repo.findByUserId(currentUser.getId()));
    }

    /** Get contact by ID with ownership validation */
    public ContactDTO getById(Long id) {
        ContactEntity entity = findContactById(id);
        validateContactAccess(entity);
        return mapper.toDTO(entity);
    }

    /** Create contact for current user */
    public ContactDTO create(ContactDTO dto) {
        UserEntity currentUser = authorizationService.getCurrentUser();
        ContactEntity entity = mapper.toEntity(dto);
        entity.setUser(currentUser);
        return mapper.toDTO(repo.save(entity));
    }

    /** Update contact with ownership validation */
    public ContactDTO update(Long id, ContactDTO dto) {
        ContactEntity entity = findContactById(id);
        validateContactAccess(entity);
        updateContactFields(entity, dto);
        return mapper.toDTO(repo.save(entity));
    }

    /** Delete contact with audit logging for admin actions */
    public void delete(Long id) {
        ContactEntity entity = findContactById(id);
        UserEntity currentUser = authorizationService.getCurrentUser();
        boolean isAdminOrOnboarding = authorizationService.hasAdminOrOnboardingPermissions();
        
        validateContactAccess(entity);
        
        // Audit admin/onboarding deletions of other users' contacts
        if (isAdminOrOnboarding && !isOwner(entity, currentUser)) {
            auditService.logContactDeletion(currentUser, entity.getUser(), entity.getId(), entity.getEmailId());
            auditService.notifyUserContactDeleted(entity.getUser(), entity.getEmailId(), currentUser);
        }
        
        repo.deleteById(id);
    }

    /** Create contact for specific user (admin/onboarding only) */
    public ContactDTO createContactForUser(Long userId, ContactDTO dto) {
        authorizationService.requireAdminOrOnboardingPermissions();
        UserEntity targetUser = authorizationService.getUserById(userId);
        
        ContactEntity entity = mapper.toEntity(dto);
        entity.setUser(targetUser);
        return mapper.toDTO(repo.save(entity));
    }

    // Helper methods - streamlined authorization and validation

    /** Find contact by ID or throw exception */
    private ContactEntity findContactById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
    }

    /** Validate user access to specific user's contacts */
    private void validateUserAccess(UserEntity currentUser, Long userId) {
        if (!authorizationService.hasAdminOrOnboardingPermissions() && !currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("Access denied. You can only access your own contacts.");
        }
    }

    /** Validate access to specific contact */
    private void validateContactAccess(ContactEntity entity) {
        UserEntity currentUser = authorizationService.getCurrentUser();
        if (!authorizationService.hasAdminOrOnboardingPermissions() && !isOwner(entity, currentUser)) {
            throw new AccessDeniedException("Access denied. You can only access your own contacts.");
        }
    }

    /** Check if user owns the contact */
    private boolean isOwner(ContactEntity entity, UserEntity user) {
        return entity.getUser().getId().equals(user.getId());
    }

    /** Update contact entity fields from DTO */
    private void updateContactFields(ContactEntity entity, ContactDTO dto) {
        entity.setEmailName(dto.getEmailName());
        entity.setEmailId(dto.getEmailId());
        entity.setContactType(dto.getContactType());
    }

    /** Convert contact entities to DTOs */
    private List<ContactDTO> mapContactsToDTO(List<ContactEntity> contacts) {
        return contacts.stream().map(mapper::toDTO).collect(Collectors.toList());
    }
}
