package com.example.multi_tanent.crm.dto;

// src/main/java/com/example/crm/event/dto/CrmEventResponse.java


import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.example.multi_tanent.crm.enums.EventPriority;
import com.example.multi_tanent.crm.enums.EventStatus;
import com.example.multi_tanent.crm.enums.EventSubject;
import com.example.multi_tanent.crm.enums.MeetingType;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmEventResponse {
    private Long id;
    private Long tenantId;

    private EventSubject subject;
    private String description;

    private boolean sameStartEnd;
    private LocalDate date;
    private LocalTime fromTime;
    private LocalTime toTime;

    private Long primaryContactId;
    private String primaryContactName;

    private List<Long> employeeIds;
    private List<String> employeeNames;

    private List<Long> contactIds;
    private List<String> contactNames;

    private Long leadId;

    private EventStatus status;
    private EventPriority  priority;
    private MeetingType meetingType;
    private String meetingWith;
}
