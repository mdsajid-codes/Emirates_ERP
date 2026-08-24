package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "trip_customers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "company_name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnore
    private Tenant tenant;

    @Column(name = "customer_code", unique = true)
    private String customerCode;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "trn_number")         // UAE Tax Registration Number
    private String trnNumber;

    @Column(name = "trade_license_number")
    private String tradeLicenseNumber;

    @Column(name = "contact_person_name")
    private String contactPersonName;

    @Column(name = "designation")
    private String designation;

    @Column(name = "status")
    private String status;

    @Column(name = "emirate")
    private String emirate;

    @Column(nullable = false)
    private String address;

    @Column(name = "credit_limit", precision = 12, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "payment_terms_days")
    private Integer paymentTermsDays;

    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "contract_document_path")
    private String contractDocumentPath;

    @Column(name = "customer_type")      // COMPANY or INDIVIDUAL
    private String customerType;

    @Builder.Default
    @Column(name = "active")
    private Boolean active = Boolean.TRUE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
