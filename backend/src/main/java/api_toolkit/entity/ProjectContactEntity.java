package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Project Contact Entity - Junction table linking projects to contacts
 * Represents many-to-many relationship between projects and contacts
 */
@Entity
@Table(name = "project_contact_entity")
@Getter
@Setter
public class ProjectContactEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Links to project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    // Links to contact
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private ContactEntity contact;
}
