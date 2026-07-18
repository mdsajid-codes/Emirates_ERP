package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Tenant;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Purchase Payment header (purPurchasePayment)
 */
@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "purchase_payment")
public class PurPurchasePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Supplier to whom payment was made */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private BaseCustomer supplier;

    /** Amount entered by user (gross) */
    @NotNull
    @Column(name = "amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    /** Flag - pay full amount */
    @Column(name = "pay_full_amount")
    private Boolean payFullAmount = Boolean.FALSE;

    /** Tax deducted by supplier (TDS) */
    @Column(name = "tax_deducted")
    private Boolean taxDeducted = Boolean.FALSE;

    @Column(name = "tds_amount", precision = 19, scale = 4)
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    /** If country/regulation requires a TDS section code / type */
    @Column(name = "tds_section", length = 50)
    private String tdsSection;

    /** Payment Date */
    @NotNull
    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    /** Payment mode e.g. Cash, Bank Transfer, Cheque */
    @Column(name = "payment_mode", length = 100)
    private String paymentMode;

    /**
     * Paid-through account (the bank/cash account used).
     * Use relation to ProAccount/ProBank entity if you have one; otherwise store as
     * string or id.
     * Here stored as a string label for simplicity, but replace with @ManyToOne to
     * ProAccount if desired.
     */
    @Column(name = "paid_through", length = 200)
    private String paidThrough;

    @Column(name = "reference", length = 200)
    private String reference;

    @Column(name = "cheque_number", length = 100)
    private String chequeNumber;

    /** Tenant relation */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    /** Computed / stored breakdowns */
    @Column(name = "amount_paid", precision = 19, scale = 4)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "amount_used_for_payments", precision = 19, scale = 4)
    private BigDecimal amountUsedForPayments = BigDecimal.ZERO;

    @Column(name = "amount_refunded", precision = 19, scale = 4)
    private BigDecimal amountRefunded = BigDecimal.ZERO;

    @Column(name = "amount_in_excess", precision = 19, scale = 4)
    private BigDecimal amountInExcess = BigDecimal.ZERO;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * allocations to invoices (each allocation ties some payment amount to an
     * invoice)
     */
    @OneToMany(mappedBy = "purchasePayment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurPurchasePaymentAllocation> allocations = new ArrayList<>();

    /** attachments for this payment */
    @OneToMany(mappedBy = "purchasePayment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurPurchasePaymentAttachment> attachments = new ArrayList<>();

    // convenience helpers
    public void addAllocation(PurPurchasePaymentAllocation alloc) {
        alloc.setPurchasePayment(this);
        this.allocations.add(alloc);
    }

    public void removeAllocation(PurPurchasePaymentAllocation alloc) {
        this.allocations.remove(alloc);
        alloc.setPurchasePayment(null);
    }

    public void addAttachment(PurPurchasePaymentAttachment att) {
        att.setPurchasePayment(this);
        this.attachments.add(att);
    }

    public void removeAttachment(PurPurchasePaymentAttachment att) {
        this.attachments.remove(att);
        att.setPurchasePayment(null);
    }

    // getters & setters omitted for brevity (generate in IDE or use Lombok)
    // equals/hashCode by id:
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchasePayment))
            return false;
        PurPurchasePayment that = (PurPurchasePayment) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
