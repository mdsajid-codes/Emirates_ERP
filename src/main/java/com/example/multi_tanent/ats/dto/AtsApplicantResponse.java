package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.entity.AtsApplicantAddress;
import com.example.multi_tanent.ats.enums.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AtsApplicantResponse {

    private Long id;
    private String salutation;
    private String firstName;
    private String middleName;
    private String lastName;
    private String nickName;
    private String fullName; // computed

    private String email;
    private String alternateEmail;
    private String homePhone;
    private String mobileNumber;
    private String workPhone;
    private String otherPhone;
    private String skypeId;
    private String linkedinUrl;
    private String facebookUrl;
    private String twitterUrl;
    private String videoReference;

    private WorkAuthorization workAuthorization;
    private LocalDate workAuthExpiry;
    private Boolean hasClearance;

    private AtsApplicantAddress address;

    private ApplicantSource source;
    private Integer experienceYears;
    private Integer experienceMonths;
    private String experienceDisplay; // computed e.g. "3 Years 2 Months"
    private String referredBy;

    private ApplicantStatus applicantStatus;
    private String applicantGroup;

    private Long ownerId;
    private String ownerName; // Employee owner name

    private String jobTitle;

    private BigDecimal expectedPayAmount;
    private String expectedPayCurrency;
    private String expectedPayPeriod;

    private String additionalComments;
    private Boolean willingToRelocate;

    private String primarySkills;
    private String technology;

    private TaxTerms taxTerms;
    private NoticePeriod noticePeriod;
    private BigDecimal gpa;
    private String aadharNumber;
    private String nationality;
    private String referenceId;
    private String photoUrl;
    private Boolean isBlacklisted;

    private Gender gender;
    private String raceEthnicity;
    private VeteranStatus veteranStatus;
    private Disability disability;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    private Long userId;
    private String userName;

    private Long createdById;
    private String createdByName;

    private List<AtsApplicantDocumentResponse> documents;
    private List<AtsApplicantEducationResponse> educations;
    private List<AtsApplicantCertificationResponse> certifications;
    private List<AtsApplicantLanguageResponse> languages;
    private List<AtsApplicantWorkExperienceResponse> workExperiences;
}
