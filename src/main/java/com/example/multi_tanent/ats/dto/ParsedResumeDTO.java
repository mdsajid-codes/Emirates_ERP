package com.example.multi_tanent.ats.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParsedResumeDTO {
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String linkedinUrl;
    private String jobTitle;
    private Integer experienceYears;
    private String primarySkills;
    private String nationality;
    private ParsedAddressDTO address;
    private List<ParsedEducationDTO> educations;
    private List<ParsedWorkExperienceDTO> workExperiences;
    private List<ParsedCertificationDTO> certifications;
    private List<ParsedLanguageDTO> languages;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ParsedAddressDTO {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ParsedEducationDTO {
        private String schoolName;
        private String degree;    // Raw degree name from resume text to map dynamically
        private String majorStudy;
        private Integer yearCompleted;
        private Double gpa;
        private String country;
        private String state;
        private String city;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ParsedWorkExperienceDTO {
        private String employerName;
        private String jobTitle;
        private String startDate;
        private String endDate;
        private Boolean isCurrent;
        private String location;
        private String description;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ParsedCertificationDTO {
        private String certificationName;
        private String completedDate;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ParsedLanguageDTO {
        private String languageName;
        private Boolean canRead;
        private Boolean canSpeak;
        private Boolean canWrite;
    }
}
