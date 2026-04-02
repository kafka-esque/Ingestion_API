package api_toolkit.repository;

import api_toolkit.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * User Repository - Database operations for users
 * Provides CRUD operations and custom queries for user management
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    
    // Find user by email address (for login and uniqueness checks)
    Optional<UserEntity> findByEmail(String email);
}
