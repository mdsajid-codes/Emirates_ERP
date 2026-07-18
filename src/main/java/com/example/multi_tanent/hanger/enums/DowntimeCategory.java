package com.example.multi_tanent.hanger.enums;

public enum DowntimeCategory {
    MECHANICAL, // Broken parts, wear
    TOOLING, // Mold/die change or failure
    NO_MATERIAL, // Waiting for raw material
    POWER_OUTAGE, // Electrical failure
    PLANNED_MAINTENANCE, // Scheduled servicing
    CHANGEOVER, // Product/tool changeover
    OTHER // Catch-all
}
