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
@Table(name = "billing_invoices")
public class BillingInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @Column(name = "amount_cents")
    private Long amountCents;

    @Column(name = "paid")
    private boolean paid = false;

    @Column(name = "issued_at")
    private OffsetDateTime issuedAt;

    @Column(name = "due_at")
    private OffsetDateTime dueAt;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "provider_invoice_id")
    private String providerInvoiceId; // e.g., Stripe invoice id

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
        if (issuedAt == null)
            issuedAt = OffsetDateTime.now();
    }
}