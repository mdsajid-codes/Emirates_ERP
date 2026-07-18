package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsClientAssignmentResponse {
    private Long id;
    private Long clientId;

    @Builder.Default
    private List<EmployeeRef> assignedToUsers = new ArrayList<>();

    private Long salesManagerId;
    private String salesManagerName;

    private Long accountManagerId;
    private String accountManagerName;

    private Long recruitmentManagerId;
    private String recruitmentManagerName;

    private Long secondarySalesManagerId;
    private String secondarySalesManagerName;

    private Long secondaryRecruitmentManagerId;
    private String secondaryRecruitmentManagerName;

    private Integer defaultTatDays;

    @Builder.Default
    private List<EmployeeRef> tatNotificationRecipients = new ArrayList<>();

    private String defaultTaxTerm;
    private String defaultWorkAuthorization;
    private String defaultPayRateTaxTerm;
    private String defaultBillRateTaxTerm;
    private Boolean postJobInCareerPortal;
    private Boolean makeReferencesMandatory;
    private Integer maxSubmissions;
    private Integer numberOfPositions;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeRef {
        private Long id;
        private String name;
    }
}
