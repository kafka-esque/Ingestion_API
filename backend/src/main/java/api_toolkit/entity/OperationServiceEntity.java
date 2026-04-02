package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.*;

/**
 * Operation Service Entity - Represents API operations/services in the system
 * Each service belongs to a domain and version, and can be used by multiple projects
 */
@Entity
@Getter
@Setter
public class OperationServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String operationName;

    // Service belongs to one domain
    @ManyToOne
    @JoinColumn(name = "domain_id", nullable = false)
    private DomainEntity domain;

    // Service belongs to one version
    @ManyToOne
    @JoinColumn(name = "version_id", nullable = false)
    private DomainVersionEntity version;

    // Service's project mappings (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProjectOperationEntity> mappings = new ArrayList<>();
}
