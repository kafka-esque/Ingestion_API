package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.*;

/**
 * Domain Entity - Represents API domains in the system
 * Each domain can have multiple versions and services
 */
@Entity
@Getter
@Setter
public class DomainEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Domain's versions (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "domain", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<DomainVersionEntity> versions = new ArrayList<>();

    // Domain's services (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "domain", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OperationServiceEntity> services = new ArrayList<>();
}
