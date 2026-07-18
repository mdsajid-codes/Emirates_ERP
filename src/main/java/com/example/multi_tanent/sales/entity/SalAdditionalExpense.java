package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.sales.entity.SalesOrder;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sal_additional_expense")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "number", unique = true)
    private String number;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private BaseCustomer company;

    @Column(name = "contract")
    private String contract;

    @Column(name = "transaction_type")
    private String transactionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id")
    private SalesOrder salesOrder;

    @Column(name = "currency")
    private String currency;

    @Column(name = "exchange_rate", precision = 19, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "status")
    private String status;

    @Column(name = "total_amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "additionalExpense", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalAdditionalExpenseLine> expenseLines = new ArrayList<>();

    @OneToMany(mappedBy = "additionalExpense", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalAdditionalExpenseInventory> inventoryItems = new ArrayList<>();

    public void addExpenseLine(SalAdditionalExpenseLine line) {
        expenseLines.add(line);
        line.setAdditionalExpense(this);
    }

    public void addInventoryItem(SalAdditionalExpenseInventory item) {
        inventoryItems.add(item);
        item.setAdditionalExpense(this);
    }
}
