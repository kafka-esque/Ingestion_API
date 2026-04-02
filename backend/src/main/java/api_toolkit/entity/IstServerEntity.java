package api_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.*;

/**
 * IST Server Entity - Represents test servers in the system
 * Each server can host multiple projects
 */
@Entity
@Getter
@Setter
public class IstServerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Server's projects (hidden from JSON to avoid circular reference)
    @OneToMany(mappedBy = "istServer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProjectEntity> projects = new ArrayList<>();
}
