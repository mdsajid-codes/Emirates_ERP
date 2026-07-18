mkdir -p src/main/java/com/example/multi_tanent/accounts/entity

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccBank.java
package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "acc_banks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccBank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String swiftCode;
    private String country;

    @Column(nullable = false)
    private String tenantId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccBankAccount.java
package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "acc_bank_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccBankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private AccBank bank;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false)
    private String accountName;

    private Long currencyId;

    @Column(nullable = false)
    private Long glAccountId;

    @Builder.Default
    @Column(precision = 18, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    private LocalDate openingDate;

    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    private String tenantId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccPayment.java
package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.PaymentMethod;
import com.example.multi_tanent.accounts.entity.enums.PaymentStatus;
import com.example.multi_tanent.accounts.entity.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "acc_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentNumber;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    private Long partnerId;

    @Column(nullable = false)
    private String partnerType;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    private Long currencyId;
    private Long bankAccountId;
    private String reference;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.DRAFT;

    private Long journalEntryId;
    private Long pdcId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String createdBy;

    @Column(nullable = false)
    private String tenantId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccPaymentInvoiceAllocation.java
package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "acc_payment_invoice_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccPaymentInvoiceAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private AccPayment payment;

    @Column(nullable = false)
    private Long invoiceId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal allocatedAmount;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccPostDatedCheque.java
package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.PdcStatus;
import com.example.multi_tanent.accounts.entity.enums.PdcType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "acc_post_dated_cheques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccPostDatedCheque {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PdcType pdcType;

    @Column(nullable = false)
    private String chequeNumber;

    @Column(nullable = false)
    private LocalDate chequeDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    private Long currencyId;
    private String bankName;
    private Long bankAccountId;

    @Column(nullable = false)
    private Long partnerId;

    private String partnerType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PdcStatus status;

    private Long paymentId;
    private Long step1JournalEntryId;
    private Long step2JournalEntryId;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal bankCharges = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private String tenantId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime clearedAt;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccCashEquivalent.java
package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.CashEquivStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "acc_cash_equivalents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccCashEquivalent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Long bankAccountId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate investmentDate;

    @Column(nullable = false)
    private LocalDate maturityDate;

    @Column(precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private Long glAccountId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private CashEquivStatus status = CashEquivStatus.ACTIVE;

    private Long journalEntryId;
    private Long maturityJournalId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private String tenantId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccCashFlowItem.java
package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.CashFlowCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "acc_cash_flow_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccCashFlowItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CashFlowCategory category;

    @Builder.Default
    private Integer displayOrder = 0;

    private Boolean isInflow;

    private String tenantId;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccCashFlowTransaction.java
package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "acc_cash_flow_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccCashFlowTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cash_flow_item_id", nullable = false)
    private AccCashFlowItem cashFlowItem;

    private Long paymentId;
    private Long journalEntryId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false)
    private Boolean isInflow;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String tenantId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccMutualSettlement.java
package com.example.multi_tanent.accounts.entity;

import com.example.multi_tanent.accounts.entity.enums.SettlementStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "acc_mutual_settlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccMutualSettlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String settlementNumber;

    @Column(nullable = false)
    private LocalDate settlementDate;

    @Column(nullable = false)
    private Long partnerId;

    private String partnerName;
    private Long currencyId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal settlementAmount;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementStatus status = SettlementStatus.DRAFT;

    private Long journalEntryId;
    private Long reversalEntryId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String createdBy;

    @Column(nullable = false)
    private String tenantId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "settlement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccMutualSettlementApLine> apLines = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "settlement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccMutualSettlementArLine> arLines = new ArrayList<>();
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccMutualSettlementApLine.java
package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "acc_mutual_settlement_ap_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccMutualSettlementApLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_id", nullable = false)
    private AccMutualSettlement settlement;

    @Column(nullable = false)
    private Long invoiceId;

    private String invoiceNumber;
    private LocalDate invoiceDate;

    @Column(precision = 18, scale = 2)
    private BigDecimal invoiceTotal;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal allocatedAmount;
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/AccMutualSettlementArLine.java
package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "acc_mutual_settlement_ar_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccMutualSettlementArLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_id", nullable = false)
    private AccMutualSettlement settlement;

    @Column(nullable = false)
    private Long invoiceId;

    private String invoiceNumber;
    private LocalDate invoiceDate;

    @Column(precision = 18, scale = 2)
    private BigDecimal invoiceTotal;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal allocatedAmount;
}
JAVA

chmod +x create_entities.sh
./create_entities.sh
