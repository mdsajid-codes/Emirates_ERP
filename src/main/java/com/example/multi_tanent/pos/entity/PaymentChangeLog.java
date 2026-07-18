package com.example.multi_tanent.pos.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.enitity.Store;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payment_change_logs")
public class PaymentChangeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne
    @JoinColumn(name = "store_id")
    private Store store;

    @Column(nullable = false, name = "sale_id")
    private Long saleId;

    @Column(nullable = false, name = "payment_id")
    private Long paymentId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "card_assigned_user")
    private String cardAssignedUser; // Optional, if relevant for card payments

    @Column(name = "from_method")
    private String fromMethod; // "From Account"

    @Column(name = "to_method")
    private String toMethod; // "To Account"

    @Column(name = "change_reason")
    private String changeReason;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
    }
}
