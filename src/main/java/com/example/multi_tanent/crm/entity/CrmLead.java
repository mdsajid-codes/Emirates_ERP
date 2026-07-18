package com.example.multi_tanent.crm.entity;

import com.example.multi_tanent.spersusers.enitity.CrmProduct;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.CrmIndustry;
import jakarta.persistence.*;
import lombok.*;
import com.example.multi_tanent.crm.enums.CrmLeadStatus;
import com.example.multi_tanent.crm.enums.ForecastCategory;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "crm_leads", indexes = {
                @Index(name = "idx_lead_tenant_created", columnList = "tenant_id,created_at"),
                @Index(name = "idx_lead_tenant_company", columnList = "tenant_id,company_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmLead {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        /* ---------- Multi-tenant ---------- */
        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lead_tenant"))
        private Tenant tenant;

        /* ---------- Master references ---------- */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "location_id", foreignKey = @ForeignKey(name = "fk_lead_location"))
        private Location location;

        @Column(name = "lead_no", nullable = false, unique = true, length = 50)
        private String leadNo;

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lead_company"))
        private CrmCompany company;

        /**
         * Optional: your Industry master. If you prefer plain text, replace with
         * String.
         */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "industry_id", foreignKey = @ForeignKey(name = "fk_lead_industry"))
        private CrmIndustry industry;

        /* ---------- People ---------- */
        @Column(nullable = false, name = "first_name")
        private String firstName;

        @Column(nullable = false, name = "last_name")
        private String lastName;

        @Column(name = "designation")
        private String designation;

        @Column(name = "phone")
        private String phone;

        @Column(name = "email")
        private String email;

        @Column(name = "website")
        private String website;

        /** Many selected products/services for a lead */
        @ManyToMany
        @JoinTable(name = "crm_lead_products", joinColumns = @JoinColumn(name = "lead_id"), inverseJoinColumns = @JoinColumn(name = "product_id"))
        @Builder.Default
        private Set<CrmProduct> products = new LinkedHashSet<>();

        @Column(length = 4000, name = "requirements")
        private String requirements;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "lead_source_id", foreignKey = @ForeignKey(name = "fk_lead_source"))
        private LeadSource leadSource;

        @Embedded
        private Address address;

        @Column(length = 4000, name = "notes")
        private String notes;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "owner_id", foreignKey = @ForeignKey(name = "fk_lead_owner"))
        private Employee owner;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "current_stage_id", foreignKey = @ForeignKey(name = "fk_lead_stage"))
        private CrmLeadStage currentStage;

        /** Additional status for dashboard filtering (Duplicate, Transferred, etc.) */
        @Enumerated(EnumType.STRING)
        @Column(name = "status", length = 50)
        private CrmLeadStatus status;

        /* ---------- Activity Relationships ---------- */
        @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private List<CrmTask> tasks = new ArrayList<>();

        @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private List<CrmTodoItem> todos = new ArrayList<>();

        @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private List<CrmEvent> events = new ArrayList<>();

        /* ---------- Forecast/Amount ---------- */
        @Enumerated(EnumType.STRING)
        @Column(length = 30, name = "forecast_category")
        private ForecastCategory forecastCategory;

        @Column(name = "expected_close_date")
        private LocalDate expectedCloseDate;

        @Column(precision = 18, scale = 2, name = "amount")
        private BigDecimal amount;

        /* ---------- Audit ---------- */
        @CreationTimestamp
        @Column(updatable = false, nullable = false, name = "created_at")
        private OffsetDateTime createdAt;

        @UpdateTimestamp
        @Column(nullable = false, name = "updated_at")
        private OffsetDateTime updatedAt;
}
