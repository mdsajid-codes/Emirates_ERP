# Supplier Tendering — Developer Reference

**Package root:** `com.example.multi_tanent.purchases`
**Base API URL:** `/api/purchases/tendering`

---

## Table of Contents
1. [Existing Files (Do NOT Modify Unless Noted)](#1-existing-files)
2. [New Enum — PurTenderingStatus](#2-new-enum)
3. [ServiceModule Update](#3-servicemodule-update)
4. [New Entities](#4-new-entities)
5. [Modify Existing Entity — PurPurchaseOrder](#5-modify-existing-entity)
6. [New DTOs (Request / Response)](#6-new-dtos)
7. [Liquibase Changelog](#7-liquibase-changelog)
8. [New Repositories](#8-new-repositories)
9. [New Services](#9-new-services)
10. [New Controllers & Endpoints](#10-new-controllers--endpoints)

---

## 1. Existing Files

These already exist and must **not** be removed. Only `PurPurchaseOrder.java` needs one new field (see Section 5).

| File | Location |
|---|---|
| `PurPurchaseOrder.java` | `purchases/entity/` |
| `PurPurchaseOrderItem.java` | `purchases/entity/` |
| `PurPurchaseOrderAttachment.java` | `purchases/entity/` |
| `PurGrn.java` / `PurGrnItem.java` | `purchases/entity/` |
| `PurPurchaseInvoice.java` | `purchases/entity/` |
| `PurPurchasePayment.java` | `purchases/entity/` |
| `PurDebitNote.java` | `purchases/entity/` |
| `DebitNoteStatus.java` | `purchases/enums/` |
| `PurPurchaseOrderController.java` | `purchases/controller/` |
| `PurPurchaseOrderService.java` | `purchases/service/` |
| `purchases-schema.xml` | `resources/db/changelog/purchases/` |

---

## 2. New Enum

**File:** `purchases/enums/PurTenderingStatus.java`

```java
package com.example.multi_tanent.purchases.enums;

public enum PurTenderingStatus {
    DRAFT,
    REQUESTS_FOR_QUOTATION,
    RFQ_RESPONSES,
    COMPARISON,
    COMPARISON_COMPLETED,
    COMPLETED,
    CANCELLED
}
```

---

## 3. ServiceModule Update

**File:** `master/entity/ServiceModule.java` — **ADD** this line after `PURCHASE`:

```java
// Supplier Tendering (sub-feature of PURCHASE — shares same entity package)
// No separate entry needed — PURCHASE already scans purchases.entity package.
// If you want a standalone toggle, add:
SUPPLIER_TENDERING(false, "com.example.multi_tanent.purchases.entity", PURCHASE),
```

> **Note:** If you don't need a separate toggle, skip this step — the new entities live in the same `purchases.entity` package and are auto-scanned by the existing `PURCHASE` module.

---

## 4. New Entities

All files go in: `purchases/entity/`

---

### 4.1 PurRfqQuestion.java
*(Master catalogue of standard RFQ questions — e.g., "Delivery Terms", "Payment Terms")*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_rfq_question")
public class PurRfqQuestion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", length = 50, unique = true)
    private String code;                         // e.g. "000000001"

    @Column(name = "description", length = 500, nullable = false)
    private String description;                  // e.g. "Delivery Terms"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurRfqQuestion)) return false;
        return id != null && id.equals(((PurRfqQuestion) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.2 PurSupplierTendering.java
*(The main tendering document — header)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.multi_tanent.purchases.enums.PurTenderingStatus;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_supplier_tendering")
public class PurSupplierTendering {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Auto-generated number, e.g. MEST25-00000001 */
    @Column(name = "tender_number", length = 100, unique = true)
    private String tenderNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private PurTenderingStatus status = PurTenderingStatus.DRAFT;

    /** "For Estimate" / "For Procurement" */
    @Column(name = "transaction_type", length = 100)
    private String transactionType;

    @Column(name = "initiated_by", length = 150)
    private String initiatedBy;

    @Column(name = "required_date")
    private LocalDate requiredDate;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_name", length = 255)
    private String projectName;

    /**
     * Polymorphic basis reference.
     * basisType = "SALES_ORDER" | "QUOTATION" | "REQUISITION"
     */
    @Column(name = "basis_type", length = 50)
    private String basisType;

    @Column(name = "basis_id")
    private Long basisId;

    @Column(name = "basis_display", length = 255)
    private String basisDisplay;          // human-readable label shown in UI

    @Column(name = "warehouse_recipient_id")
    private Long warehouseRecipientId;

    /** Currency code, e.g. "AED" */
    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "comment", length = 2000)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Items (copied from SO / Quotation / Requisition) */
    @OneToMany(mappedBy = "tendering", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNumber ASC")
    private List<PurSupplierTenderingItem> items = new ArrayList<>();

    /** Participating suppliers */
    @OneToMany(mappedBy = "tendering", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurSupplierTenderingSupplier> suppliers = new ArrayList<>();

    /** RFQ questions for this tender */
    @OneToMany(mappedBy = "tendering", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurSupplierTenderingQuestion> questions = new ArrayList<>();

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurSupplierTendering)) return false;
        return id != null && id.equals(((PurSupplierTendering) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.3 PurSupplierTenderingItem.java
*(Line items copied from source document)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProUnit;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_supplier_tendering_item")
public class PurSupplierTenderingItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ProRawMaterials item;

    @Column(name = "item_name", length = 255)
    private String itemName;                 // snapshot name

    @Column(name = "content", length = 500)
    private String content;                  // item description

    @Column(name = "quantity", precision = 19, scale = 6, nullable = false)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProUnit unit;

    /** Budget/reference price (optional) */
    @Column(name = "budget_price", precision = 19, scale = 4)
    private BigDecimal budgetPrice;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurSupplierTenderingItem)) return false;
        return id != null && id.equals(((PurSupplierTenderingItem) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.4 PurSupplierTenderingQuestion.java
*(Questions linked to a specific tender)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_supplier_tendering_question")
public class PurSupplierTenderingQuestion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_question_id")
    private PurRfqQuestion rfqQuestion;

    /** Custom question text if not from catalogue */
    @Column(name = "custom_question", length = 500)
    private String customQuestion;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurSupplierTenderingQuestion)) return false;
        return id != null && id.equals(((PurSupplierTenderingQuestion) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.5 PurSupplierTenderingSupplier.java
*(A supplier participating in this tender)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_supplier_tendering_supplier")
public class PurSupplierTenderingSupplier {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private BaseCustomer supplier;

    /** e.g. "Main Contract" */
    @Column(name = "contract_type", length = 100)
    private String contractType;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "rating", length = 50)
    private String rating;

    /** Terms & conditions text shown on the supplier's RFQ */
    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    /** FK to RFQ document created for this supplier */
    @Column(name = "rfq_id")
    private Long rfqId;

    /** FK to the RFQ Response submitted by this supplier */
    @Column(name = "rfq_response_id")
    private Long rfqResponseId;

    /** FK to the Purchase Order generated for this supplier */
    @Column(name = "purchase_order_id")
    private Long purchaseOrderId;

    /** Per-supplier item selection (bidding items) */
    @OneToMany(mappedBy = "tenderingSupplier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurSupplierTenderingSupplierItem> supplierItems = new ArrayList<>();

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurSupplierTenderingSupplier)) return false;
        return id != null && id.equals(((PurSupplierTenderingSupplier) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.6 PurSupplierTenderingSupplierItem.java
*(Which items a specific supplier will bid on — "Mark companies for bidding form")*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_supplier_tendering_supplier_item")
public class PurSupplierTenderingSupplierItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_supplier_id", nullable = false)
    private PurSupplierTenderingSupplier tenderingSupplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_item_id", nullable = false)
    private PurSupplierTenderingItem tenderingItem;

    /** true = this supplier will supply this item */
    @Column(name = "selected", nullable = false)
    private Boolean selected = Boolean.FALSE;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurSupplierTenderingSupplierItem)) return false;
        return id != null && id.equals(((PurSupplierTenderingSupplierItem) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.7 PurRequestForQuotation.java
*(RFQ document sent to ONE supplier)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_request_for_quotation")
public class PurRequestForQuotation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** e.g. MERFQ25-0000005 */
    @Column(name = "rfq_number", length = 100, unique = true)
    private String rfqNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private BaseCustomer supplier;

    @Column(name = "sent_date")
    private LocalDate sentDate;

    /** URL generated for supplier to fill online */
    @Column(name = "online_form_url", length = 1000)
    private String onlineFormUrl;

    /** DRAFT | SENT | RESPONDED */
    @Column(name = "status", length = 50)
    private String status = "DRAFT";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurRequestForQuotationItem> items = new ArrayList<>();

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurRequestForQuotation)) return false;
        return id != null && id.equals(((PurRequestForQuotation) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.8 PurRequestForQuotationItem.java
*(Line items inside an RFQ)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_request_for_quotation_item")
public class PurRequestForQuotationItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private PurRequestForQuotation rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_item_id")
    private PurSupplierTenderingItem tenderingItem;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "quantity", precision = 19, scale = 6)
    private BigDecimal quantity;

    /** Price quoted by supplier (filled after response) */
    @Column(name = "quoted_price", precision = 19, scale = 4)
    private BigDecimal quotedPrice;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurRequestForQuotationItem)) return false;
        return id != null && id.equals(((PurRequestForQuotationItem) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.9 PurRfqResponse.java
*(Supplier's response to an RFQ)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_rfq_response")
public class PurRfqResponse {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** e.g. ME0025-00000001 */
    @Column(name = "response_number", length = 100, unique = true)
    private String responseNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private PurRequestForQuotation rfq;

    @Column(name = "valid_till")
    private LocalDate validTill;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurRfqResponseItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurRfqResponseAnswer> answers = new ArrayList<>();

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurRfqResponse)) return false;
        return id != null && id.equals(((PurRfqResponse) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.10 PurRfqResponseItem.java
*(Prices per item in the response)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_rfq_response_item")
public class PurRfqResponseItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private PurRfqResponse response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_item_id")
    private PurSupplierTenderingItem tenderingItem;

    @Column(name = "price", precision = 19, scale = 4)
    private BigDecimal price;

    /** true = selected as winner in Comparison tab */
    @Column(name = "selected_for_order")
    private Boolean selectedForOrder = Boolean.FALSE;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurRfqResponseItem)) return false;
        return id != null && id.equals(((PurRfqResponseItem) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

### 4.11 PurRfqResponseAnswer.java
*(Supplier's answer to each RFQ question)*

```java
package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "pur_rfq_response_answer")
public class PurRfqResponseAnswer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private PurRfqResponse response;

    @Column(name = "question_text", length = 500)
    private String questionText;           // snapshot of question

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurRfqResponseAnswer)) return false;
        return id != null && id.equals(((PurRfqResponseAnswer) o).id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
```

---

## 5. Modify Existing Entity

**File:** `purchases/entity/PurPurchaseOrder.java`

Add **one field** after the `status` field (around line 109):

```java
/** FK to the Supplier Tendering that generated this PO (null if created manually) */
@Column(name = "tendering_id")
private Long tenderingId;
```

---

## 6. New DTOs

All files go in: `purchases/dto/`

---

### 6.1 Request DTOs

**PurTenderingRequest.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingRequest {
    private String transactionType;
    private String initiatedBy;
    private LocalDate requiredDate;
    private Long projectId;
    private String basisType;           // "SALES_ORDER" | "QUOTATION" | "REQUISITION"
    private Long basisId;
    private String basisDisplay;
    private Long warehouseRecipientId;
    private String currency;
    private String comment;
    private String createdBy;
    private List<PurTenderingItemRequest> items;
    private List<PurTenderingSupplierRequest> suppliers;
    private List<PurTenderingQuestionRequest> questions;
}
```

**PurTenderingItemRequest.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingItemRequest {
    private Integer lineNumber;
    private Long itemId;
    private String itemName;
    private String content;
    private BigDecimal quantity;
    private Long unitId;
    private BigDecimal budgetPrice;
    private String comment;
}
```

**PurTenderingSupplierRequest.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingSupplierRequest {
    private Long supplierId;
    private String contractType;
    private String contactPerson;
    private String email;
    private String rating;
    private String termsAndConditions;
    private List<Long> selectedItemIds;   // tendering_item IDs this supplier bids on
}
```

**PurTenderingQuestionRequest.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingQuestionRequest {
    private Long rfqQuestionId;          // from master catalogue
    private String customQuestion;       // OR free-text
}
```

**PurRfqResponseRequest.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurRfqResponseRequest {
    private LocalDate validTill;
    private List<PurRfqResponseItemRequest> items;
    private List<PurRfqResponseAnswerRequest> answers;
}
```

**PurRfqResponseItemRequest.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurRfqResponseItemRequest {
    private Long tenderingItemId;
    private BigDecimal price;
    private String comment;
}
```

**PurRfqResponseAnswerRequest.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurRfqResponseAnswerRequest {
    private String questionText;
    private String answer;
}
```

---

### 6.2 Response DTOs

**PurTenderingResponse.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingResponse {
    private Long id;
    private String tenderNumber;
    private String status;
    private String transactionType;
    private String initiatedBy;
    private LocalDate requiredDate;
    private Long projectId;
    private String projectName;
    private String basisType;
    private Long basisId;
    private String basisDisplay;
    private String currency;
    private String comment;
    private LocalDateTime createdAt;
    private List<PurTenderingItemResponse> items;
    private List<PurTenderingSupplierResponse> suppliers;
    private List<PurTenderingQuestionResponse> questions;
}
```

**PurTenderingItemResponse.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingItemResponse {
    private Long id;
    private Integer lineNumber;
    private Long itemId;
    private String itemName;
    private String content;
    private BigDecimal quantity;
    private Long unitId;
    private String unitName;
    private BigDecimal budgetPrice;
    private String comment;
}
```

**PurTenderingSupplierResponse.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingSupplierResponse {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private String contractType;
    private String contactPerson;
    private String email;
    private String rating;
    private String termsAndConditions;
    private Long rfqId;
    private String rfqNumber;
    private String rfqStatus;
    private String rfqSentDate;
    private String onlineFormUrl;
    private Long rfqResponseId;
    private String rfqResponseNumber;
    private Long purchaseOrderId;
    private String purchaseOrderNumber;
    private List<Long> selectedItemIds;
}
```

**PurTenderingQuestionResponse.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurTenderingQuestionResponse {
    private Long id;
    private Long rfqQuestionId;
    private String questionText;
    private String customQuestion;
}
```

**PurRfqQuestionResponse.java**
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurRfqQuestionResponse {
    private Long id;
    private String code;
    private String description;
}
```

**PurComparisonResponse.java** *(for the Comparison tab)*
```java
package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurComparisonResponse {
    private Long tenderingItemId;
    private String itemName;
    private String content;
    private BigDecimal quantity;
    private String uom;
    private BigDecimal budgetPrice;

    /**
     * Key = supplierId, Value = { price, selectedForOrder, rfqResponseItemId }
     */
    private Map<Long, SupplierPrice> supplierPrices;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SupplierPrice {
        private Long rfqResponseItemId;
        private BigDecimal price;
        private Boolean selectedForOrder;
    }
}
```

---

## 7. Liquibase Changelog

**Create new file:** `resources/db/changelog/purchases/supplier-tendering-schema.xml`

Then **include it** in `db/changelog/db.changelog-tenant.xml`:
```xml
<include file="db/changelog/purchases/supplier-tendering-schema.xml"/>
```

**Full changelog content:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <changeSet id="create-supplier-tendering-schema-1" author="dev" context="PURCHASE">

        <!-- pur_rfq_question (master catalogue) -->
        <createTable tableName="pur_rfq_question">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="code" type="VARCHAR(50)"><constraints unique="true"/></column>
            <column name="description" type="VARCHAR(500)"><constraints nullable="false"/></column>
            <column name="tenant_id" type="BIGINT"/>
        </createTable>

        <!-- pur_supplier_tendering (header) -->
        <createTable tableName="pur_supplier_tendering">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tender_number" type="VARCHAR(100)"><constraints unique="true"/></column>
            <column name="status" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="transaction_type" type="VARCHAR(100)"/>
            <column name="initiated_by" type="VARCHAR(150)"/>
            <column name="required_date" type="DATE"/>
            <column name="project_id" type="BIGINT"/>
            <column name="project_name" type="VARCHAR(255)"/>
            <column name="basis_type" type="VARCHAR(50)"/>
            <column name="basis_id" type="BIGINT"/>
            <column name="basis_display" type="VARCHAR(255)"/>
            <column name="warehouse_recipient_id" type="BIGINT"/>
            <column name="currency" type="VARCHAR(10)"/>
            <column name="comment" type="VARCHAR(2000)"/>
            <column name="tenant_id" type="BIGINT"/>
            <column name="created_by" type="VARCHAR(100)"/>
            <column name="created_at" type="DATETIME"/>
            <column name="updated_at" type="DATETIME"/>
        </createTable>

        <!-- pur_supplier_tendering_item -->
        <createTable tableName="pur_supplier_tendering_item">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tendering_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="line_number" type="INT"><constraints nullable="false"/></column>
            <column name="item_id" type="BIGINT"/>
            <column name="item_name" type="VARCHAR(255)"/>
            <column name="content" type="VARCHAR(500)"/>
            <column name="quantity" type="DECIMAL(19,6)"><constraints nullable="false"/></column>
            <column name="unit_id" type="BIGINT"/>
            <column name="budget_price" type="DECIMAL(19,4)"/>
            <column name="comment" type="VARCHAR(1000)"/>
        </createTable>
        <addUniqueConstraint tableName="pur_supplier_tendering_item"
            columnNames="tendering_id, line_number"
            constraintName="uk_pur_st_item_line"/>

        <!-- pur_supplier_tendering_question -->
        <createTable tableName="pur_supplier_tendering_question">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tendering_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="rfq_question_id" type="BIGINT"/>
            <column name="custom_question" type="VARCHAR(500)"/>
        </createTable>

        <!-- pur_supplier_tendering_supplier -->
        <createTable tableName="pur_supplier_tendering_supplier">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tendering_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="supplier_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="contract_type" type="VARCHAR(100)"/>
            <column name="contact_person" type="VARCHAR(150)"/>
            <column name="email" type="VARCHAR(255)"/>
            <column name="rating" type="VARCHAR(50)"/>
            <column name="terms_and_conditions" type="TEXT"/>
            <column name="rfq_id" type="BIGINT"/>
            <column name="rfq_response_id" type="BIGINT"/>
            <column name="purchase_order_id" type="BIGINT"/>
        </createTable>

        <!-- pur_supplier_tendering_supplier_item -->
        <createTable tableName="pur_supplier_tendering_supplier_item">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tendering_supplier_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="tendering_item_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="selected" type="BOOLEAN" defaultValueBoolean="false"/>
        </createTable>

        <!-- pur_request_for_quotation -->
        <createTable tableName="pur_request_for_quotation">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="rfq_number" type="VARCHAR(100)"><constraints unique="true"/></column>
            <column name="tendering_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="supplier_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="sent_date" type="DATE"/>
            <column name="online_form_url" type="VARCHAR(1000)"/>
            <column name="status" type="VARCHAR(50)" defaultValue="DRAFT"/>
            <column name="tenant_id" type="BIGINT"/>
            <column name="created_at" type="DATETIME"/>
        </createTable>

        <!-- pur_request_for_quotation_item -->
        <createTable tableName="pur_request_for_quotation_item">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="rfq_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="tendering_item_id" type="BIGINT"/>
            <column name="item_name" type="VARCHAR(255)"/>
            <column name="quantity" type="DECIMAL(19,6)"/>
            <column name="quoted_price" type="DECIMAL(19,4)"/>
            <column name="comment" type="VARCHAR(1000)"/>
        </createTable>

        <!-- pur_rfq_response -->
        <createTable tableName="pur_rfq_response">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="response_number" type="VARCHAR(100)"><constraints unique="true"/></column>
            <column name="rfq_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="valid_till" type="DATE"/>
            <column name="submitted_at" type="DATETIME"/>
        </createTable>

        <!-- pur_rfq_response_item -->
        <createTable tableName="pur_rfq_response_item">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="response_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="tendering_item_id" type="BIGINT"/>
            <column name="price" type="DECIMAL(19,4)"/>
            <column name="selected_for_order" type="BOOLEAN" defaultValueBoolean="false"/>
            <column name="comment" type="VARCHAR(1000)"/>
        </createTable>

        <!-- pur_rfq_response_answer -->
        <createTable tableName="pur_rfq_response_answer">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="response_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="question_text" type="VARCHAR(500)"/>
            <column name="answer" type="TEXT"/>
        </createTable>

    </changeSet>

    <!-- Alter existing pur_purchase_order — add tendering_id FK -->
    <changeSet id="alter-pur-purchase-order-add-tendering-id" author="dev" context="PURCHASE">
        <addColumn tableName="pur_purchase_order">
            <column name="tendering_id" type="BIGINT"/>
        </addColumn>
    </changeSet>

</databaseChangeLog>
```

---

## 8. New Repositories

All files go in: `purchases/repository/`

```java
// PurRfqQuestionRepository.java
public interface PurRfqQuestionRepository extends JpaRepository<PurRfqQuestion, Long> {
    List<PurRfqQuestion> findByTenantId(Long tenantId);
}

// PurSupplierTenderingRepository.java
public interface PurSupplierTenderingRepository extends JpaRepository<PurSupplierTendering, Long> {
    Page<PurSupplierTendering> findByTenantId(Long tenantId, Pageable pageable);
    List<PurSupplierTendering> findByTenantIdAndStatus(Long tenantId, PurTenderingStatus status);
}

// PurRequestForQuotationRepository.java
public interface PurRequestForQuotationRepository extends JpaRepository<PurRequestForQuotation, Long> {
    List<PurRequestForQuotation> findByTenderingId(Long tenderingId);
    Optional<PurRequestForQuotation> findByTenderingIdAndSupplierId(Long tenderingId, Long supplierId);
}

// PurRfqResponseRepository.java
public interface PurRfqResponseRepository extends JpaRepository<PurRfqResponse, Long> {
    Optional<PurRfqResponse> findByRfqId(Long rfqId);
    List<PurRfqResponse> findByRfqTenderingId(Long tenderingId);
}
```

---

## 10. New Controllers & Endpoints

---

### 10.1 PurRfqQuestionController

**Base URL:** `/api/purchases/rfq-questions`

| Method | URL | Body | Description |
|---|---|---|---|
| `GET` | `/api/purchases/rfq-questions` | — | List all RFQ questions (master catalogue) |
| `POST` | `/api/purchases/rfq-questions` | `PurRfqQuestionRequest` | Create new question in catalogue |
| `DELETE` | `/api/purchases/rfq-questions/{id}` | — | Remove question from catalogue |

---

### 10.2 PurSupplierTenderingController

**Base URL:** `/api/purchases/tendering`

| Method | URL | Body | Description |
|---|---|---|---|
| `POST` | `/api/purchases/tendering` | `PurTenderingRequest` | Create new tender (status = DRAFT) |
| `GET` | `/api/purchases/tendering` | `?page=0&size=10&status=DRAFT` | List tenders (paginated) |
| `GET` | `/api/purchases/tendering/{id}` | — | Get tender with all tabs data |
| `PUT` | `/api/purchases/tendering/{id}` | `PurTenderingRequest` | Update tender header + items/suppliers/questions |
| `DELETE` | `/api/purchases/tendering/{id}` | — | Delete draft tender |
| `PUT` | `/api/purchases/tendering/{id}/status` | `{ "status": "REQUESTS_FOR_QUOTATION" }` | Change tender status |
| `POST` | `/api/purchases/tendering/{id}/suppliers/{supplierId}/bidding-items` | `{ "itemIds": [1,2] }` | Mark items for a supplier (bidding form) |
| `POST` | `/api/purchases/tendering/{id}/suppliers/{supplierId}/create-rfq` | — | Create RFQ for a supplier |
| `POST` | `/api/purchases/tendering/{id}/suppliers/{supplierId}/send-rfq` | — | Send RFQ email + generate online form URL |
| `GET` | `/api/purchases/tendering/{id}/comparison` | — | Get comparison tab data (`List<PurComparisonResponse>`) |
| `PUT` | `/api/purchases/tendering/{id}/comparison/select-minimal` | — | Auto-select lowest price per item |
| `PUT` | `/api/purchases/tendering/{id}/comparison/clear-selection` | — | Clear all selected_for_order flags |
| `POST` | `/api/purchases/tendering/{id}/generate-purchase-orders` | — | Create `PurPurchaseOrder` for each "selected" supplier |

---

### 10.3 PurRfqResponseController

**Base URL:** `/api/purchases/rfq-response`

| Method | URL | Body | Description |
|---|---|---|---|
| `POST` | `/api/purchases/rfq-response/{rfqId}` | `PurRfqResponseRequest` | Enter/save supplier's response (prices + answers) |
| `GET` | `/api/purchases/rfq-response/{rfqId}` | — | Get existing response for an RFQ |
| `PUT` | `/api/purchases/rfq-response/{responseId}` | `PurRfqResponseRequest` | Update a response |

---

## Summary — Files to Create

| # | File | Type |
|---|---|---|
| 1 | `purchases/enums/PurTenderingStatus.java` | **NEW Enum** |
| 2 | `purchases/entity/PurRfqQuestion.java` | **NEW Entity** |
| 3 | `purchases/entity/PurSupplierTendering.java` | **NEW Entity** |
| 4 | `purchases/entity/PurSupplierTenderingItem.java` | **NEW Entity** |
| 5 | `purchases/entity/PurSupplierTenderingQuestion.java` | **NEW Entity** |
| 6 | `purchases/entity/PurSupplierTenderingSupplier.java` | **NEW Entity** |
| 7 | `purchases/entity/PurSupplierTenderingSupplierItem.java` | **NEW Entity** |
| 8 | `purchases/entity/PurRequestForQuotation.java` | **NEW Entity** |
| 9 | `purchases/entity/PurRequestForQuotationItem.java` | **NEW Entity** |
| 10 | `purchases/entity/PurRfqResponse.java` | **NEW Entity** |
| 11 | `purchases/entity/PurRfqResponseItem.java` | **NEW Entity** |
| 12 | `purchases/entity/PurRfqResponseAnswer.java` | **NEW Entity** |
| 13 | `purchases/entity/PurPurchaseOrder.java` | **MODIFY** — add `tenderingId` |
| 14 | `purchases/dto/Pur*Request / Response DTOs` | **NEW DTOs** (10 files) |
| 15 | `purchases/repository/Pur*Repository` | **NEW Repos** (4 files) |
| 16 | `purchases/service/PurSupplierTenderingService.java` | **NEW Service** |
| 17 | `purchases/service/PurRfqResponseService.java` | **NEW Service** |
| 18 | `purchases/service/PurRfqQuestionService.java` | **NEW Service** |
| 19 | `purchases/controller/PurSupplierTenderingController.java` | **NEW Controller** |
| 20 | `purchases/controller/PurRfqResponseController.java` | **NEW Controller** |
| 21 | `purchases/controller/PurRfqQuestionController.java` | **NEW Controller** |
| 22 | `resources/db/changelog/purchases/supplier-tendering-schema.xml` | **NEW Liquibase** |
