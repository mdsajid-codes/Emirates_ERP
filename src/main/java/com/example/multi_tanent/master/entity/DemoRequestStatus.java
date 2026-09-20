package com.example.multi_tanent.master.entity;

public enum DemoRequestStatus {
    /** Newly submitted — awaiting admin review */
    PENDING,
    /** Admin has approved — demo access will be granted */
    APPROVED,
    /** Admin has rejected the request */
    REJECTED,
    /** Demo credentials have been sent to the client */
    DEMO_SENT
}
