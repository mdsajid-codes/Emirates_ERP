package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsStateResponse {
    private Long id;
    private Long countryId;
    private String countryName;
    private String name;
    private String stateCode;
}
