package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.production.entity.ProRawMaterials;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pur_custom_declaration_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurCustomDeclarationLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_declaration_id", nullable = false)
    private PurCustomDeclaration customDeclaration;

    @Column(name = "line_number")
    private Integer lineNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_invoice_id")
    private PurPurchaseInvoice purchaseInvoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ProRawMaterials item;

    @Column(name = "hs_code", length = 50)
    private String hsCode;

    @Column(name = "origin", length = 100)
    private String origin;

    @Column(name = "cif_foreign_value", precision = 19, scale = 4)
    private BigDecimal cifForeignValue = BigDecimal.ZERO;

    @Column(name = "exchange_rate", precision = 19, scale = 6)
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "cif_national_value", precision = 19, scale = 4)
    private BigDecimal cifNationalValue = BigDecimal.ZERO;

    @Column(name = "duty_rate", precision = 7, scale = 4)
    private BigDecimal dutyRate = BigDecimal.ZERO;

    @Column(name = "duty_amount", precision = 19, scale = 4)
    private BigDecimal dutyAmount = BigDecimal.ZERO;

    @Column(name = "service_charge_allocation", precision = 19, scale = 4)
    private BigDecimal serviceChargeAllocation = BigDecimal.ZERO;

    @Column(name = "vat_rate", precision = 7, scale = 4)
    private BigDecimal vatRate = BigDecimal.ZERO;

    @Column(name = "vat_amount", precision = 19, scale = 4)
    private BigDecimal vatAmount = BigDecimal.ZERO;
}
