package api_toolkit.repository;

import api_toolkit.entity.ContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Contact Repository - Database operations for contacts
 * Provides CRUD operations and custom queries for contact management
 */
@Repository
public interface ContactRepository extends JpaRepository<ContactEntity, Long> {
    
    // Find contacts by email ID
    List<ContactEntity> findByEmailId(String emailId);
    
    // Find all contacts for a specific user
    List<ContactEntity> findByUserId(Long userId);
    
    // Find contact by user and email combination (for uniqueness check)
    List<ContactEntity> findByUserIdAndEmailId(Long userId, String emailId);
}