package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.purchases.enums.PurTenderingStatus;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pur_supplier_tendering")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTendering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tender_number", unique = true, length = 100)
    private String tenderNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private PurTenderingStatus status;

    @Column(name = "transaction_type", length = 100)
    private String transactionType;

    @Column(name = "initiated_by", length = 100)
    private String initiatedBy;

    @Column(name = "required_date")
    private LocalDate requiredDate;

    @Column(name = "project", length = 200)
    private String project;

    @Column(name = "entity_name", length = 200)
    private String entity;

    @Column(name = "tendering_currency", length = 10)
    private String tenderingCurrency;

    // Polymorphic Basis (Sales Order, Quotation, Requisition)
    @Column(name = "basis_type", length = 50)
    private String basisType;

    @Column(name = "basis_id")
    private Long basisId;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "tendering", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNumber ASC")
    private List<PurSupplierTenderingItem> items = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "tendering", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurSupplierTenderingSupplier> suppliers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "tendering", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurSupplierTenderingQuestion> questions = new ArrayList<>();

    public void addItem(PurSupplierTenderingItem item) {
        item.setTendering(this);
        this.items.add(item);
    }

    public void addSupplier(PurSupplierTenderingSupplier supplier) {
        supplier.setTendering(this);
        this.suppliers.add(supplier);
    }
    
    public void addQuestion(PurSupplierTenderingQuestion question) {
        question.setTendering(this);
        this.questions.add(question);
    }
}
