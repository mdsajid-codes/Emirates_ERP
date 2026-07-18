package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nationalities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Nationality {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., Indian, Canadian

    @Column(name = "iso_code")
    private String isoCode; // e.g., IN, CA
}
