package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "plan_features",
       uniqueConstraints = @UniqueConstraint(columnNames = {"plan_id", "feature_key"}))
public class PlanFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(name = "feature_key", nullable = false)
    private String featureKey; // e.g. "max_stores", "max_users", "inventory_limit", "api_calls_month"

    // store numeric limits as long; for boolean features use 1 or 0
    private Long value;

    private String meta; // optional JSON/string for complex feature data
}