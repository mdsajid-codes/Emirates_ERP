package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.ExpenseItem;
import com.example.multi_tanent.purchases.enums.TaxIsDue;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.tenant.base.entity.Department;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pur_custom_declaration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurCustomDeclaration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "declaration_number", length = 100)
    private String declarationNumber;

    @Column(name = "is_third_party_clearance")
    private Boolean isThirdPartyClearance;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_is_due")
    private TaxIsDue taxIsDue;

    @Column(name = "service_charge", precision = 19, scale = 4)
    private BigDecimal serviceCharge = BigDecimal.ZERO;

    @Column(name = "is_apply_custom_penalty")
    private Boolean isApplyCustomPenalty;

    @Column(name = "custom_penalty_amount", precision = 19, scale = 4)
    private BigDecimal customPenaltyAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_account_id")
    private ChartOfAccount expenseAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_item_id")
    private ExpenseItem expenseItem;

    @Column(name = "business_activity", length = 100)
    private String businessActivity;

    @Column(name = "entity_name", length = 100)
    private String entityName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_person_id")
    private User responsiblePerson;

    @Column(name = "is_group_by_hs_code")
    private Boolean isGroupByHSCode;

    @Column(name = "is_include_service_charge")
    private Boolean isIncludeServiceCharge;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "cif_foreign_value_total", precision = 19, scale = 4)
    private BigDecimal cifForeignValueTotal = BigDecimal.ZERO;

    @Column(name = "cif_national_value_total", precision = 19, scale = 4)
    private BigDecimal cifNationalValueTotal = BigDecimal.ZERO;

    @Column(name = "vat_reverse_charge_total", precision = 19, scale = 4)
    private BigDecimal vatReverseChargeTotal = BigDecimal.ZERO;

    @Column(name = "total_due", precision = 19, scale = 4)
    private BigDecimal totalDue = BigDecimal.ZERO;

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "customDeclaration", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurCustomDeclarationLine> lines = new ArrayList<>();

    public void addLine(PurCustomDeclarationLine line) {
        lines.add(line);
        line.setCustomDeclaration(this);
    }

    public void removeLine(PurCustomDeclarationLine line) {
        lines.remove(line);
        line.setCustomDeclaration(null);
    }
}
