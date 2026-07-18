package com.example.multi_tanent.tenant.leave.entity;

import jakarta.persistence.*;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnualEntitlementRules {

    /** a) After N years of service => M days (lump-sum entitlement) */
    @Column(name = "min_years_for_full_quota")
    private Integer minYearsForFullQuota;
    @Column(name = "full_quota_days")
    private Integer fullQuotaDays;

    /** b) After N months => K days per month (monthly cap) */
    @Column(name = "months_for_monthly_cap")
    private Integer monthsForMonthlyCap;
    @Column(name = "days_per_month_to_cap")
    private Integer daysPerMonthToCap;
}