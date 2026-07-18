package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_tools")
public class ProTools {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    /** “Tool Manufacturing Date” */
    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "workgroup_id", foreignKey = @ForeignKey(name = "fk_tool_workgroup"))
    private ProWorkGroup workGroup;

    /** From the screen’s “Workstation Number / Name”; nullable */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workstation_id", foreignKey = @ForeignKey(name = "fk_tool_workstation"))
    private ProWorkStation workstation;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_tool_category"))
    private ProToolCategory category;

    /** Optional: The location where this tool is primarily based */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", foreignKey = @ForeignKey(name = "fk_tool_location"))
    private Location location;

    @OneToMany(mappedBy = "tool", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ProToolStation> stations = new ArrayList<>();

    @OneToMany(mappedBy = "tool", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ToolParameter> parameters = new ArrayList<>();

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
