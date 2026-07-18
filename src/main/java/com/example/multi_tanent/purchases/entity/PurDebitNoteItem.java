package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProSubCategory;
import com.example.multi_tanent.production.entity.ProTax;
import com.example.multi_tanent.production.entity.ProUnit;
import com.example.multi_tanent.spersusers.enitity.Location;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pur_debit_note_items")
public class PurDebitNoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debit_note_id", nullable = false)
    private PurDebitNote debitNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ProRawMaterials item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "quantity")
    private Double quantity;

    @Column(name = "rate")
    private BigDecimal rate;

    @Column(name = "discount")
    private BigDecimal discount;

    @Column(name = "amount")
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_id")
    private ProTax tax;

    @Column(name = "tax_value")
    private BigDecimal taxValue;

    @Column(name = "tax_amount")
    private BigDecimal taxAmount;
}
