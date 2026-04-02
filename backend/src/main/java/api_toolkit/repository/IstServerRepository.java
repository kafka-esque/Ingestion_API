package api_toolkit.repository;

import api_toolkit.entity.IstServerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * IST Server Repository - Database operations for test servers
 * Provides CRUD operations for server management
 */
@Repository
public interface IstServerRepository extends JpaRepository<IstServerEntity, Long> {
}