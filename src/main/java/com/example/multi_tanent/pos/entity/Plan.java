package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "plans")
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "enterprise_monthly", "starter"

    @Column(nullable = false)
    private String name;

    @Lob
    private String description;

    @Column(nullable = false, name = "price_cents")
    private Long priceCents; // price per interval in smallest currency unit

    @Column(length = 3, name = "currency")
    private String currency = "AED";

    @Column(name = "billing_interval", nullable = false)
    private String billingInterval = "MONTH"; // MONTH or YEAR

    @Column(name = "trial_days")
    private Integer trialDays = 0;

    @Column(name = "active")
    private boolean active = true;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanFeature> features = new ArrayList<>();

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
    }
}