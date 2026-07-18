package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ComplaintRequest {
    private LocalDateTime reportedDate;
    private ReportedByType reportedByType;
    private Long reportedById;
    private ComplaintType type;
    private ComplaintCategory category;
    private Long tripId;
    private Long vehicleId;
    private Long driverId;
    private String description;
    private RiskLevel riskLevel;
    private ComplaintStatus status;
    private Long assignedToId;
    private String resolutionNotes;
}
