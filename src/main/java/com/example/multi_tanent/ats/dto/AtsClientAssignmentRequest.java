package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsClientAssignmentRequest {

    @Builder.Default
    private List<Long> assignedToUserIds = new ArrayList<>();

    private Long salesManagerId;

    private Long accountManagerId;

    private Long recruitmentManagerId;

    private Long secondarySalesManagerId;

    private Long secondaryRecruitmentManagerId;

    private Integer defaultTatDays;

    @Builder.Default
    private List<Long> tatNotificationRecipientIds = new ArrayList<>();

    private String defaultTaxTerm;

    private String defaultWorkAuthorization;

    private String defaultPayRateTaxTerm;

    private String defaultBillRateTaxTerm;

    private Boolean postJobInCareerPortal;

    private Boolean makeReferencesMandatory;

    private Integer maxSubmissions;

    private Integer numberOfPositions;
}
