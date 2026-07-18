package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ComplaintResponse {
    private Long id;
    private String complaintCode;
    private LocalDateTime reportedDate;
    private ReportedByType reportedByType;
    private Long reportedById;
    private ComplaintType type;
    private ComplaintCategory category;
    private Long tripId;
    private String tripNo;
    private Long vehicleId;
    private String vehiclePlateNumber;
    private Long driverId;
    private String driverName;
    private String description;
    private RiskLevel riskLevel;
    private ComplaintStatus status;
    private Long assignedToId;
    private String assignedToName;
    private String resolutionNotes;
    private String attachmentPath;
}
