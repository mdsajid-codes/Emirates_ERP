// package com.example.multi_tanent.crm.dto;

// import com.example.multi_tanent.crm.entity.Address;
// import jakarta.validation.constraints.Email;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import lombok.Data;

// import java.util.Set;

// @Data
// public class CrmLeadRequest {

//     @NotBlank(message = "First name is required.")
//     private String firstName;

//     @NotBlank(message = "Last name is required.")
//     private String lastName;

//     @NotNull(message = "Company ID is required.")
//     private Long companyId;

//     private String industry;
//     private String designation;
//     private String phone;

//     @Email(message = "A valid email is required.")
//     private String email;

//     private String website;
//     private Set<String> products;
//     private String requirements;
//     private String leadSource;
//     private Address address;
//     private String notes;

//     private Long ownerId; // Employee ID
//     private Long currentStageId; // CrmLeadStage ID
//     private Long locationId; // Optional
// }
package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.CrmLeadStatus;
import com.example.multi_tanent.crm.entity.Address;
import com.example.multi_tanent.crm.enums.ForecastCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Data
public class CrmLeadRequest {

    @NotBlank 
    private String firstName;
    @NotBlank 
    private String lastName;

    @NotBlank
    private String leadNo;

    @NotNull  
    private Long companyId;

    private Long industryId;       // optional
    private String designation;
    private String phone;

    @Email    
    private String email;
    private String website;

    private Set<Long> productIds;  // selected products
    private String requirements;
    private Long leadSourceId;

    private Address address;
    private String notes;

    private Long ownerId;          // Employee
    private Long currentStageId;   // Lead stage
    private Long locationId;       // optional

    private ForecastCategory forecastCategory;
    private LocalDate expectedCloseDate;
    private BigDecimal amount;

    private CrmLeadStatus status;
}
