package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_parameters", uniqueConstraints = {
        @UniqueConstraint(name = "uk_parameter_tenant_name", columnNames = { "tenant_id", "name" })
})
public class ProParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Optional: to make this parameter location-specific
    private Location location;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    /** If true, this parameter affects stock quantity (e.g., length, weight) */
    @Column(name = "changes_quantity")
    private boolean changesQuantity;

    @OneToMany(mappedBy = "parameter", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProParameterValue> values = new ArrayList<>();

}
