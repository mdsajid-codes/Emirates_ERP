package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "acc_banks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "swift_code", length = 20)
    private String swiftCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;
}
