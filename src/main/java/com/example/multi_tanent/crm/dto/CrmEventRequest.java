package com.example.multi_tanent.crm.dto;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.example.multi_tanent.crm.enums.EventPriority;
import com.example.multi_tanent.crm.enums.EventStatus;
import com.example.multi_tanent.crm.enums.EventSubject;
import com.example.multi_tanent.crm.enums.MeetingType;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmEventRequest {

    @NotNull private EventSubject subject;
    private String description;

    @NotNull private Boolean sameStartEnd;

    @NotNull private LocalDate date;
    @NotNull private LocalTime fromTime;
    private LocalTime toTime;

    private Long primaryContactId;

    // multi-selects
    private List<Long> employeeIds;
    private List<Long> contactIds;

    @NotNull private EventStatus status;
    @NotNull private EventPriority priority;

    private Long leadId;             // optional

    private MeetingType meetingType; // optional
    private String meetingWith;      // optional
}
