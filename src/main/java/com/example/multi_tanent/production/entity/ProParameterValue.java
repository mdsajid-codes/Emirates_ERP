package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_parameter_values", uniqueConstraints = {
        @UniqueConstraint(name = "uk_paramvalue_param_code", columnNames = { "parameter_id", "code" })
})
public class ProParameterValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "parameter_id", foreignKey = @ForeignKey(name = "fk_paramvalue_param"))
    private ProParameter parameter;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "value", nullable = false, length = 200)
    private String value;
}