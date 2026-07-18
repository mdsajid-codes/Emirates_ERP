package com.example.multi_tanent.materials.entity;

import com.example.multi_tanent.materials.enums.IndentStatus;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.tenant.base.entity.Department;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "material_indent")
public class MaterialIndent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "indent_no", unique = true, nullable = false)
    private String indentNo;

    @Column(name = "indent_date")
    private LocalDate indentDate;

    // The parent requisition
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "material_requisition_id", nullable = true)
    private MaterialRequision materialRequisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private IndentStatus status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
    private com.example.multi_tanent.materials.enums.IndentApprovalStatus approvalStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "create_po_status")
    private com.example.multi_tanent.materials.enums.CreatePoStatus createPoStatus;

    @Column(name = "approved_date")
    private OffsetDateTime approvedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private Employee approvedBy;

    @OneToMany(mappedBy = "materialIndent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaterialIndentDetail> details;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
