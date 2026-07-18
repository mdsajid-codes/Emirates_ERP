package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.fleet.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trip_invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;            // e.g. NKT-000490

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private TripCustomer customer;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "sub_total_amount", precision = 12, scale = 2)
    private BigDecimal subTotalAmount;       // Sum of all trip amounts

    @Column(name = "total_token_amount", precision = 12, scale = 2)
    private BigDecimal totalTokenAmount;     // Sum of all token amounts (0% VAT)

    @Column(name = "total_other_charges", precision = 12, scale = 2)
    private BigDecimal totalOtherCharges;    // Sum of all other charges

    @Column(name = "total_vat_amount", precision = 12, scale = 2)
    private BigDecimal totalVatAmount;       // Sum of all VAT amounts

    @Column(name = "grand_total", precision = 12, scale = 2)
    private BigDecimal grandTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "payment_received_date")
    private LocalDate paymentReceivedDate;

    @Column(name = "payment_method")        // CASH, CHEQUE, BANK_TRANSFER
    private String paymentMethod;

    @Column(name = "cheque_number")
    private String chequeNumber;

    @Column(name = "other_reference")
    private String otherReference;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Trips on this invoice (reverse side)
    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY)
    private List<Trip> trips = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
