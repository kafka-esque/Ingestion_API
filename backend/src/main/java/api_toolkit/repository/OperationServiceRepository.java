package api_toolkit.repository;

import api_toolkit.entity.OperationServiceEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

/**
 * Operation Service Repository - Database operations for operation services
 * Provides CRUD operations and custom queries for service management
 */
@Repository
public interface OperationServiceRepository extends JpaRepository<OperationServiceEntity, Long> {
    
    // Find services by domain
    List<OperationServiceEntity> findByDomainId(Long domainId);
    
    // Find services by version
    List<OperationServiceEntity> findByVersionId(Long versionId);
    
    // Find services by domain and version
    List<OperationServiceEntity> findByDomainIdAndVersionId(Long domainId, Long versionId);
    
    // Check if service exists by name and domain
    boolean existsByOperationNameAndDomainId(String operationName, Long domainId);
    
    // Check existence excluding specific ID (for updates)
    @Query("SELECT COUNT(os) > 0 FROM OperationServiceEntity os WHERE os.operationName = :operationName AND os.domain.id = :domainId AND os.id != :excludeId")
    boolean existsByOperationNameAndDomainIdAndIdNot(@Param("operationName") String operationName, 
                                                     @Param("domainId") Long domainId, 
                                                     @Param("excludeId") Long excludeId);
    
    // Find service by name and domain
    Optional<OperationServiceEntity> findByOperationNameAndDomainId(String operationName, Long domainId);
} 