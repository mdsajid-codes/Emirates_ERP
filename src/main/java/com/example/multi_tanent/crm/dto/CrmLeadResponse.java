// package com.example.multi_tanent.crm.dto;

// import com.example.multi_tanent.crm.entity.Address;
// import lombok.Builder;
// import lombok.Data;

// import java.time.OffsetDateTime;
// import java.util.Set;

// @Data
// @Builder
// public class CrmLeadResponse {
//     private Long id;
//     private String firstName;
//     private String lastName;

//     private Long companyId;
//     private String companyName;

//     private String industry;
//     private String designation;
//     private String phone;
//     private String email;
//     private String website;
//     private Set<String> products;
//     private String requirements;
//     private String leadSource;
//     private Address address;
//     private String notes;

//     private Long ownerId;
//     private String ownerName;

//     private Long currentStageId;
//     private String currentStageName;

//     private Long locationId;
//     private String locationName;

//     private OffsetDateTime createdAt;
//     private OffsetDateTime updatedAt;
// }
package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.CrmLeadStatus;
import com.example.multi_tanent.crm.enums.ForecastCategory;
import com.example.multi_tanent.crm.entity.Address;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class CrmLeadResponse {

    private Long id;

    private String firstName;
    private String lastName;
    private String leadNo;

    private Long companyId;
    private String companyName;

    private Long industryId;
    private String industryName;

    private String designation;
    private String phone;
    private String email;
    private String website;

    /** Mini product projection for the UI list chips */
    @Builder @Getter @AllArgsConstructor @NoArgsConstructor
    public static class ProductMini {
        private Long id;
        private String name;
    }
    private Set<ProductMini> products;

    private String requirements;
    private Long leadSourceId;
    private String leadSourceName;

    private Address address;
    private String notes;

    private Long ownerId;
    private String ownerName;

    private Long currentStageId;
    private String currentStageName;

    private Long locationId;
    private String locationName;

    private ForecastCategory forecastCategory;
    private LocalDate expectedCloseDate;
    private BigDecimal amount;

    private CrmLeadStatus status;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
