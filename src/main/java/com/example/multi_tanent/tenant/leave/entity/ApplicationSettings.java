package com.example.multi_tanent.tenant.leave.entity;

import com.example.multi_tanent.tenant.leave.enums.WorkingDayRequirementMode;
import jakarta.persistence.*;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationSettings {

    /** Half-day allowed? */
    @Column(name = "allow_half_day")
    private Boolean allowHalfDay;

    /** Can employees self-apply (else HR/Manager applies)? */
    @Column(name = "self_apply_allowed")
    private Boolean selfApplyAllowed;

    /** Require non-empty comment? */
    @Column(name = "require_comment")
    private Boolean requireComment;

    /** Require attachment if leave exceeds N calendar days (null = none) */
    @Column(name = "attachment_if_exceeds_days")
    private Integer attachmentIfExceedsDays;

    /* ---------- Submission timing rules from UI ---------- */

    /**
     * Prior-notice triggers when requested duration >= thresholdCalendarDays
     * (nullable)
     */
    @Column(name = "prior_notice_threshold_calendar_days")
    private Integer priorNoticeThresholdCalendarDays;

    /** Calendar days of notice required (nullable) */
    @Column(name = "prior_notice_calendar_days")
    private Integer priorNoticeCalendarDays;

    /** Working-day requirement mode & value (nullable) */
    @Enumerated(EnumType.STRING)
    @Column(length = 32, name = "working_day_requirement_mode")
    private WorkingDayRequirementMode workingDayRequirementMode; // NONE / AT_LEAST_N_WORKING_DAYS

    @Column(name = "working_day_requirement_min_days")
    private Integer workingDayRequirementMinDays;

    /**
     * Earliest a request may be submitted before start date (no sooner than N days)
     */
    @Column(name = "earliest_apply_window_days")
    private Integer earliestApplyWindowDays;

    /** Back-dated application allowance & max days back (nullable) */
    @Column(name = "allow_backdated_application")
    private Boolean allowBackdatedApplication;
    @Column(name = "backdated_max_days")
    private Integer backdatedMaxDays;
}