package com.example.multi_tanent.tenant.notification.dto;

import lombok.Data;

@Data
public class AnnouncementRequest {

    /** The announcement body text to send to all employees */
    private String message;

    /** Optional: restrict to a specific department ID. Null = all employees. */
    private Long departmentId;
}
