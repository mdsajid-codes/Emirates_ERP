package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.entity.AtsApplicantAddress;
import com.example.multi_tanent.ats.enums.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.List;

@Data
public class AtsApplicantRequest {

    private String salutation;

    @NotBlank(message = "First name is required.")
    private String firstName;

    private String middleName;

    @NotBlank(message = "Last name is required.")
    private String lastName;

    private String nickName;

    @NotBlank(message = "Email is required.")
    @Email(message = "A valid email is required.")
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
    private String referredBy;

    private ApplicantStatus applicantStatus;
    private String applicantGroup;
    
    private Long ownerId; // Employee ID

    @NotBlank(message = "Job title is required.")
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

    private Gender gender;
    private String raceEthnicity;
    private VeteranStatus veteranStatus;
    private Disability disability;

    private Long userId;

    private List<AtsApplicantDocumentRequest> documents;
    private List<AtsApplicantEducationRequest> educations;
    private List<AtsApplicantCertificationRequest> certifications;
    private List<AtsApplicantLanguageRequest> languages;
    private List<AtsApplicantWorkExperienceRequest> workExperiences;
}
