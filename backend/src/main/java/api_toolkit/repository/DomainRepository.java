package api_toolkit.repository;

import api_toolkit.entity.DomainEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Domain Repository - Database operations for API domains
 * Provides CRUD operations for domain management
 */
@Repository
public interface DomainRepository extends JpaRepository<DomainEntity, Long> {
}