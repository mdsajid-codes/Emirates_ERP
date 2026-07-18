package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_tool_parameter_values")
public class ToolParameterValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "parameter_id", foreignKey = @ForeignKey(name = "fk_toolparamvalue_param"))
    private ToolParameter parameter;

    /** free text value from the row's value cells */
    /** free text value from the row's value cells */
    @Column(name = "value", nullable = false, length = 200)
    private String value;

    /** ordering across multiple values in the same row */
    @Min(1)
    @Column(name = "position", nullable = false)
    private Integer position;

    @PrePersist
    protected void onCreate() {
    }
}
