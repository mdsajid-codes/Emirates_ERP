package com.example.multi_tanent.tenant.employee.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employment_policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmploymentPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "probation_days")
    private Integer probationDays; // e.g., 90

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays; // e.g., 30

    @Column(name = "auto_confirm_after_probation")
    private Boolean autoConfirmAfterProbation;

    @Column(name = "confirmation_criteria")
    private String confirmationCriteria; // text or JSON describing criteria
}
