package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.EmailDirection;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorEmailActivityResponse {
    private Long id;
    private String subject;
    private String body;
    private EmailDirection direction;
    private String fromAddress;
    private String toAddresses;
    private String ccAddresses;
    private OffsetDateTime sentAt;
    private Long linkedById;
    private String linkedByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
