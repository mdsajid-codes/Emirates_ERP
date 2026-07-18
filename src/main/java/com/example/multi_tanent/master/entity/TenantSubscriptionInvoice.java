package com.example.multi_tanent.master.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_subscription_invoice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TenantSubscriptionInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_tenant_id", nullable = false)
    private MasterTenant masterTenant;

    @Column(nullable = false, unique = true, name = "invoice_number")
    private String invoiceNumber;

    @Column(nullable = false, name = "generated_date")
    private LocalDateTime generatedDate;

    @Column(nullable = false, name = "subscription_start_date")
    private LocalDate subscriptionStartDate;

    @Column(nullable = false, name = "subscription_end_date")
    private LocalDate subscriptionEndDate;

    @Column(nullable = false, name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "basic_amount")
    private BigDecimal basicAmount;

    @Column(name = "tax")
    private BigDecimal tax;

    @Column(name = "discount")
    private BigDecimal discount;

    @Column(name = "other_charges")
    private BigDecimal otherCharges;

    @Column(name = "advance_amount")
    private BigDecimal advanceAmount;

    @Column(name = "pending_amount")
    private BigDecimal pendingAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @Column(name = "currency")
    private String currency; // AED, USD, etc.
}
