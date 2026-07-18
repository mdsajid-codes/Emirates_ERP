package com.example.multi_tanent.fleet.enums;

public enum TripStatus {
    CREATED,        // Trip just entered
    IN_PROGRESS,    // Driver on the road
    DELIVERED,      // POD Uploaded
    COMPLETED,      // Trip delivered/Finished
    INVOICED,       // Invoice generated
    PAID,           // Customer paid
    CLOSED,         // Fully settled (vendor paid too)
    CANCELLED       // Trip aborted
}
