package com.example.multi_tanent.spersusers.enitity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String state;
    @Column(name = "postal_code")
    private String postalCode;

    private String country;

    @Column(name = "is_primary")
    private Boolean isPrimary;
}
