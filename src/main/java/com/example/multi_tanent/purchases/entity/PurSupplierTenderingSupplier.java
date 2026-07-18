package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pur_supplier_tendering_supplier")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingSupplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "supplier_name", length = 255)
    private String supplierName;

    @Column(name = "contract_type", length = 100)
    private String contractType;

    @Column(name = "contact_person", length = 255)
    private String contactPerson;

    @Column(name = "email", length = 255)
    private String email;

    @Builder.Default
    @OneToMany(mappedBy = "tenderingSupplier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurSupplierTenderingSupplierItem> supplierItems = new ArrayList<>();

    public void addSupplierItem(PurSupplierTenderingSupplierItem item) {
        item.setTenderingSupplier(this);
        this.supplierItems.add(item);
    }
}
