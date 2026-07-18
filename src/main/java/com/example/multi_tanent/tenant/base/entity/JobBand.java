package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.*;

@Entity
@Table(name = "job_bands")
@Getter
@Setter
@ToString(exclude = "designation")
@EqualsAndHashCode(exclude = "designation")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobBand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designation_id", unique = true)
    @JsonBackReference("designation-jobband")
    private Designation designation;

    @Column(nullable = false, unique = true)
    private String name; // e.g., Band 1, Band 2

    private Integer level; // numeric level for ordering

    @Column(name = "min_salary")
    private Long minSalary; // store in smallest unit (e.g., paise) or use BigDecimal
    @Column(name = "max_salary")
    private Long maxSalary;

    private String notes;
}
