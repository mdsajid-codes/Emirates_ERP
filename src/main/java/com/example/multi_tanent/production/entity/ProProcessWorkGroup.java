package com.example.multi_tanent.production.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pro_process_workgroups", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"process_id", "workgroup_id"}),
    @UniqueConstraint(columnNames = {"process_id", "sequence_index"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProProcessWorkGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", foreignKey = @ForeignKey(name = "fk_pwg_process"))
    private ProProcess process;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "workgroup_id", foreignKey = @ForeignKey(name = "fk_pwg_workgroup"))
    private ProWorkGroup workGroup;

    /** Position of this workgroup within the process flow (1,2,3,...) */
    @Column(name = "sequence_index", nullable = false)
    private Integer sequenceIndex;
}