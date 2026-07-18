package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.purchases.enums.DebitNoteStatus;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pur_debit_notes")
@EntityListeners(AuditingEntityListener.class)
public class PurDebitNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private BaseCustomer supplier;

    @Column(name = "debit_note_number")
    private String debitNoteNumber;

    @Column(name = "bill_number")
    private String billNumber;

    @Column(name = "debit_note_date")
    private LocalDate debitNoteDate;

    @Column(name = "debit_note_due_date")
    private LocalDate debitNoteDueDate;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "tax_percentage")
    private BigDecimal taxPercentage;

    @Lob
    @Column(name = "terms_and_conditions")
    private String termsAndConditions;

    @Lob
    @Column(name = "notes")
    private String notes;

    @Column(name = "template")
    private String template;

    @Column(name = "email_to")
    private String emailTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private DebitNoteStatus status;

    @Column(name = "balance_due")
    private BigDecimal balanceDue;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pur_debit_note_attachments", joinColumns = @JoinColumn(name = "debit_note_id"))
    @Column(name = "attachment_url")
    private List<String> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "debitNote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurDebitNoteItem> items = new ArrayList<>();

    @Column(name = "other_references")
    private String otherReferences;

    @Column(name = "bill_of_lading")
    private String billOfLading;

    @Column(name = "motor_vehicle_no")
    private String motorVehicleNo;

    @Column(name = "bill_ledger")
    private String billLedger;

    @Column(name = "created_by")
    @CreatedBy
    private String createdBy;

    @Column(name = "updated_by")
    @LastModifiedBy
    private String updatedBy;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public void addItem(PurDebitNoteItem item) {
        items.add(item);
        item.setDebitNote(this);
    }

    public void removeItem(PurDebitNoteItem item) {
        items.remove(item);
        item.setDebitNote(null);
    }
}
