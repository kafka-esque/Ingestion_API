package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Project Operation Entity - Junction table linking projects to operations
 * Represents many-to-many relationship between projects and operation services
 */
@Entity
@Getter
@Setter
public class ProjectOperationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Links to project
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    // Links to operation service
    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private OperationServiceEntity service;
}
