package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.production.entity.ProTax;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "sal_additional_expense_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "additional_expense_id", nullable = false)
    private SalAdditionalExpense additionalExpense;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "unit_id")
    private Long unitId;

    @Column(name = "amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_id")
    private ProTax tax;

    @Column(name = "tax_amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;
}
