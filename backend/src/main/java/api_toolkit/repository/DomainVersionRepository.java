package api_toolkit.repository;

import api_toolkit.entity.DomainVersionEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Domain Version Repository - Database operations for domain versions
 * Provides CRUD operations and custom queries for version management
 */
@Repository
public interface DomainVersionRepository extends JpaRepository<DomainVersionEntity, Long> {
    
    // Find all versions for a specific domain
    @Query("SELECT dv FROM DomainVersionEntity dv WHERE dv.domain.id = :domainId")
    List<DomainVersionEntity> findByDomainId(@Param("domainId") Long domainId);
    
    // Count versions for a specific domain
    @Query("SELECT COUNT(dv) FROM DomainVersionEntity dv WHERE dv.domain.id = :domainId")
    long countByDomainId(@Param("domainId") Long domainId);
} 