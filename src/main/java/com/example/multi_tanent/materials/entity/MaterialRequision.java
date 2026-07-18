package com.example.multi_tanent.materials.entity;

import com.example.multi_tanent.production.entity.ManufacturingOrder;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "material_requisition")
public class MaterialRequision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "request_no", unique = true, nullable = false)
    private String requestNo;

    @Column(name = "request_date")
    private LocalDate requestDate;

    // Relation to Manufacturing Order (MO) - data source for most fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturing_order_id", nullable = false)
    private ManufacturingOrder manufacturingOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private com.example.multi_tanent.materials.enums.MaterialRequisitionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(name = "indent_status")
    private com.example.multi_tanent.materials.enums.IndentStatus indentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "reserve_status", length = 30)
    private com.example.multi_tanent.materials.enums.ReserveStatus reserveStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "material_status")
    @Builder.Default
    private com.example.multi_tanent.materials.enums.MaterialStatus materialStatus = com.example.multi_tanent.materials.enums.MaterialStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "requisition_for")
    private com.example.multi_tanent.materials.enums.RequisitionType requisitionFor;

    @Column(name = "extra_requisition")
    private Boolean extraRequisition;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
