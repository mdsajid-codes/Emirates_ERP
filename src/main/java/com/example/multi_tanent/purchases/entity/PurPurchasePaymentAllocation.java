package com.example.multi_tanent.purchases.entity;

import java.math.BigDecimal;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Allocates a portion of a Payment to a specific PurchaseInvoice (bill).
 * This entity models the "Unpaid Bill" area in your UI where user selects
 * invoices and enters amounts used.
 */
@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "purchase_payment_allocation", uniqueConstraints = @UniqueConstraint(columnNames = {
        "purchase_payment_id", "invoice_id" }))
public class PurPurchasePaymentAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** owning payment */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_payment_id", nullable = false)
    private PurPurchasePayment purchasePayment;

    /** the invoice/bill that receives this allocation */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private PurPurchaseInvoice purchaseInvoice;

    /** amount from payment used for this invoice */
    @Column(name = "allocated_amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal allocatedAmount = BigDecimal.ZERO;

    /** optional notes / allocation reference */
    @Column(name = "allocation_note", length = 500)
    private String allocationNote;

    // getters / setters omitted for brevity

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchasePaymentAllocation))
            return false;
        PurPurchasePaymentAllocation that = (PurPurchasePaymentAllocation) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
