package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.*;
import java.time.LocalDateTime;

/**
 * Project Entity - Represents projects in the API toolkit system
 * Each project belongs to a user and can have multiple operations and contacts
 */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "project_identifier"}))
@Getter
@Setter
public class ProjectEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_identifier", nullable = false)
    private String projectIdentifier;

    @Column(nullable = false)
    private String projectName;

    @Column(nullable = false)
    private String applicationName;

    @Column(nullable = false)
    private String partnerPrismId;

    @Column(nullable = false)
    private String targetPlatform;

    private String targetPlatformOther;

    @Column(nullable = false)
    private String clientType;

    @Column(nullable = false)
    private String csiClientLoginName;

    @Column(nullable = false)
    private Boolean directInternetAccess;

    @Column(length = 1000)
    private String projectDescription;
    
    // Audit fields for tracking changes
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_modified_by_user_id")
    private Long lastModifiedByUserId;
    
    @Column(name = "last_modified_by_username")
    private String lastModifiedByUsername;
    
    @Column(name = "last_modified_by_role")
    private String lastModifiedByRole;
    
    // Project belongs to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
    
    // Project can be assigned to one IST server
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ist_server_id")
    private IstServerEntity istServer;

    // Project's operations (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProjectOperationEntity> operations = new ArrayList<>();

    // Project's contacts (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProjectContactEntity> contacts = new ArrayList<>();
}
