package com.example.multi_tanent.tenant.leave.entity;

import com.example.multi_tanent.tenant.leave.enums.EligibilityAnchor;
import jakarta.persistence.*;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestrictionSettings {

    /* New joiner eligibility */
    @Enumerated(EnumType.STRING)
    @Column(length = 32, name = "eligibility_anchor")
    private EligibilityAnchor eligibilityAnchor; // AFTER_PROBATION / AFTER_JOINING
    @Column(name = "eligibility_after_days")
    private Integer eligibilityAfterDays;

    /* Consecutive days cap */
    @Column(name = "limit_consecutive_days")
    private Boolean limitConsecutiveDays;
    @Column(name = "max_consecutive_days")
    private Integer maxConsecutiveDays;

    /* Monthly usage cap */
    @Column(name = "limit_monthly_usage")
    private Boolean limitMonthlyUsage;
    @Column(name = "max_monthly_days")
    private Integer maxMonthlyDays;

    /* Allowed during notice period? */
    @Column(name = "allowed_in_notice_period")
    private Boolean allowedInNoticePeriod;

    /* Request throttling */
    @Column(name = "min_gap_between_requests_days")
    private Integer minGapBetweenRequestsDays; // null = none
    @Column(name = "max_requests_per_year")
    private Integer maxRequestsPerYear; // null = unlimited
    @Column(name = "max_requests_per_month")
    private Integer maxRequestsPerMonth; // null = unlimited
}