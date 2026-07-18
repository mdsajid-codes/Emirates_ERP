package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

import com.example.multi_tanent.spersusers.enitity.Tenant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tenant_subscriptions")
public class TenantSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(nullable = false)
    private String status = "active"; // active, trialing, past_due, canceled

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "current_period_start")
    private OffsetDateTime currentPeriodStart;

    @Column(name = "current_period_end")
    private OffsetDateTime currentPeriodEnd;

    @Column(name = "next_billing_at")
    private OffsetDateTime nextBillingAt;

    @Column(name = "quantity")
    private Long quantity = 1L; // seats / multiplicity

    @Column(name = "provider_subscription_id")
    private String providerSubscriptionId; // e.g., Stripe subscription id

    @Column(name = "cancel_at_period_end")
    private boolean cancelAtPeriodEnd = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
        if (startedAt == null)
            startedAt = OffsetDateTime.now();
    }
}