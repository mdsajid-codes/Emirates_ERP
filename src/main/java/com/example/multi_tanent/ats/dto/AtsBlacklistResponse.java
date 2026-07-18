package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsBlacklistResponse {
    private Long id;
    private String name;
    private String status;
    private String reason;
    private String mobileNumber;
    private String emailAddress;
    private String ownership;
    private String blacklistedBy;
    private OffsetDateTime blacklistedDate;
}
