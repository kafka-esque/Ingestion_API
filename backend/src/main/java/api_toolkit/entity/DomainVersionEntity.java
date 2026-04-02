package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.*;

/**
 * Domain Version Entity - Represents different versions of API domains
 * Each version belongs to one domain and can have multiple services
 */
@Entity
@Getter
@Setter
public class DomainVersionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String version;

    // Version belongs to one domain (eagerly loaded)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "domain_id", nullable = false)
    private DomainEntity domain;

    // Version's services (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "version", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OperationServiceEntity> services = new ArrayList<>();
}
