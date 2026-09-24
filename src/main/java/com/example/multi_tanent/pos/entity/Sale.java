package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne
    @JoinColumn(name = "store_id")
    private Store store;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private BaseCustomer customer;

    @Column(nullable = false, unique = true, name = "order_id")
    private String orderId;

    @Column(nullable = false, unique = true, name = "invoice_no")
    private String invoiceNo;

    @Column(name = "invoice_date")
    private OffsetDateTime invoiceDate;

    @Column(name = "subtotal_cents")
    private Long subtotalCents;

    @Column(name = "tax_cents")
    private Long taxCents;

    @Column(name = "discount_cents")
    private Long discountCents = 0L;

    @Column(name = "discount_type")
    private String discountType; // e.g., "Seasonal", "Coupon", "Test"

    @Column(columnDefinition = "TEXT", name = "discount_reason")
    private String discountReason;

    @Column(columnDefinition = "TEXT", name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancelled_time")
    private OffsetDateTime cancelledTime;

    @Column(name = "delivery_charge")
    private Long deliveryCharge;

    @Column(name = "total_cents")
    private Long totalCents;

    @Column(nullable = false, name = "status")
    private String status = "completed"; // pending, completed, refunded

    @Column(nullable = false, name = "payment_status")
    private String paymentStatus = "unpaid"; // unpaid, paid, partial

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private com.example.multi_tanent.pos.enums.OrderType orderType;

    @Column(name = "adults_count")
    private Integer adultsCount;

    @Column(name = "kids_count")
    private Integer kidsCount;

    @Column(name = "sales_source")
    private String salesSource; // e.g., "POS", "Online"

    @Column(name = "sales_source_reference")
    private String salesSourceReference; // e.g. referral name, ad ID

    @Column(name = "car_number")
    private String carNumber;

    @Column(name = "car_color")
    private String carColor;

    @Column(name = "delivered_time")
    private OffsetDateTime deliveredTime;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "dispatched_time")
    private OffsetDateTime dispatchedTime;

    @Column(name = "expected_delivery_time")
    private OffsetDateTime expectedDeliveryTime;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    @Column(name = "cogs_journal_entry_id")
    private Long cogsJournalEntryId;

    @Column(name = "shift_id")
    private Long shiftId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "payment_clearing_status")
    private String paymentClearingStatus = "PENDING"; // PENDING, SETTLED

    @Column(name = "settlement_id")
    private Long settlementId;

    @Column(name = "is_return")
    private Boolean isReturn = false;

    @Column(name = "original_sale_id")
    private Long originalSaleId;

    @Column(name = "currency_code")
    private String currencyCode = "AED";

    @Column(name = "fx_rate")
    private java.math.BigDecimal fxRate = java.math.BigDecimal.ONE;

    @Column(name = "loyalty_points_redeemed")
    private Integer loyaltyPointsRedeemed = 0;

    @Column(name = "loyalty_discount_cents")
    private Long loyaltyDiscountCents = 0L;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "relatedSale")
    private List<StockMovement> stockMovements = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
        if (invoiceDate == null)
            invoiceDate = OffsetDateTime.now();
    }
}