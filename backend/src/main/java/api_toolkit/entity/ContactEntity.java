package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.*;

/**
 * Contact Entity - Represents user contacts in the system
 * Each user can have multiple contacts with unique email combinations
 */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "email_id"}))
@Getter
@Setter
public class ContactEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String emailName;

    @Column(name = "email_id", nullable = false)
    private String emailId;

    @Column(nullable = false)
    private String contactType;

    // Contact belongs to one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // Contact's projects (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProjectContactEntity> projects = new ArrayList<>();
}
