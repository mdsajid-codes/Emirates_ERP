package com.example.multi_tanent.tenant.leave.entity;

import com.example.multi_tanent.tenant.leave.enums.ApproverSelectionMode;
import jakarta.persistence.*;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalFlow {

    /** Does this leave type require approval? */
    @Column(name = "approval_required")
    private Boolean approvalRequired;

    /**
     * Optional summary (if using dynamic chain below, this can be informational)
     */
    @Column(name = "levels")
    private Integer levels;

    /** Primary selection mode hint */
    @Enumerated(EnumType.STRING)
    @Column(length = 32, name = "selection_mode")
    private ApproverSelectionMode selectionMode; // ROLE_BASED / NAMED_EMPLOYEES
}