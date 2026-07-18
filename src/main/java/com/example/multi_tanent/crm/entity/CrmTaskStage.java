package com.example.multi_tanent.crm.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;

@Entity
@Table(name = "crm_task_stages", uniqueConstraints = {
        @UniqueConstraint(name = "crm_task_stages_name", columnNames = { "tenant_id", "status_name" })

}

)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CrmTaskStage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne(optional = false,fetch = FetchType.LAZY)
    // @JoinColumn(name = "tenant_id", nullable = false , foreignKey =
    // @foreignKey(name = "fk_task_stage_tenant"))
    // private Tenant tenant;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_task_stage_tenant"))
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Optional relationship
    private Location location;

    @Column(name = "status_name", nullable = false, length = 150)
    private String statusName;

    @Column(name = "completed", nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    /** Used for ordering in the UI (↑/↓) */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

}