package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.production.entity.ProUnit;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "sal_additional_expense_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "additional_expense_id", nullable = false)
    private SalAdditionalExpense additionalExpense;

    @Column(name = "document_type")
    private String documentType;

    @Column(name = "document_id")
    private String documentId;

    @Column(name = "product_id")
    private Long productId; // Polymorphic ID for ProRawMaterials / ProFinishedGood

    @Column(name = "batch")
    private String batch;

    @Column(name = "quantity", precision = 19, scale = 6)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProUnit unit;

    @Column(name = "price", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "factor", precision = 19, scale = 6)
    @Builder.Default
    private BigDecimal factor = BigDecimal.ONE;

    @Column(name = "expense_amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal expenseAmount = BigDecimal.ZERO;
}
