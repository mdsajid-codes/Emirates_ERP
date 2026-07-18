package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_tool_parameters")
public class ToolParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tool_id", foreignKey = @ForeignKey(name = "fk_toolparam_tool"))
    private ProTools tool;

    /** Parameter name (e.g., "Length", "Material") */
    /** Parameter name (e.g., "Length", "Material") */
    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @OneToMany(mappedBy = "parameter", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ToolParameterValue> values = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
    }
}
