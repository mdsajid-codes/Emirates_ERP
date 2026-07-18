package com.example.multi_tanent.sales.dto;

import lombok.Data;

@Data
public class PodRequest {
    private String status;           // "DELIVERED", "PARTIAL", "REJECTED"
    private String receivedByName;
    private String receivedByPhone;
    private Double gpsLatitude;
    private Double gpsLongitude;
    private String remarks;
    private String rejectionReason;
}
