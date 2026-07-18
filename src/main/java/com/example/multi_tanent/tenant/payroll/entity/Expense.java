package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.payroll.enums.PaymentMethod;
import com.example.multi_tanent.tenant.payroll.enums.ExpenseStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
@Data
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, name = "expense_date")
    private LocalDate expenseDate;

    @Column(nullable = false, name = "category")
    private String category;

    @Column(nullable = false, precision = 15, scale = 2, name = "amount")
    private BigDecimal amount;

    @Column(length = 100, name = "bill_number")
    private String billNumber;

    @Column(length = 100, name = "merchant_name")
    private String merchantName;

    @Column(length = 1000, name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    private ExpenseStatus status;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseFile> attachments = new ArrayList<>();

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    // --- Payout Details ---
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "paid_out_date")
    private LocalDate paidOutDate;

    @Column(length = 500, name = "payment_details")
    private String paymentDetails; // e.g., Transaction ID, Cheque No.

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by_user_id")
    private Long processedByUserId;

    public void addAttachment(String filePath, String originalFilename) {
        ExpenseFile attachment = new ExpenseFile();
        attachment.setFilePath(filePath);
        attachment.setOriginalFilename(originalFilename);
        attachment.setExpense(this);
        this.attachments.add(attachment);
    }
}