package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.PodStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodResponse {
    private Long id;
    private Long deliveryOrderId;
    private String deliveryOrderNumber;
    private PodStatus status;
    private String signatureUrl;
    private String photoUrl;
    private String receivedByName;
    private String receivedByPhone;
    private Double gpsLatitude;
    private Double gpsLongitude;
    private OffsetDateTime deliveredAt;
    private String remarks;
    private String rejectionReason;
    private OffsetDateTime createdAt;
}
