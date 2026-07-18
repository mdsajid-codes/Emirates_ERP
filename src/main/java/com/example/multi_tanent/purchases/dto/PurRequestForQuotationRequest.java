package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRequestForQuotationRequest {
    
    // We typically might not need fields if we auto-gen everything, 
    // but we can leave it flexible in case we pass specific items or details
    private List<PurRequestForQuotationItemRequest> items;
}
