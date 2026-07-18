package com.example.multi_tanent.spersusers.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SubscriptionRequest {
    private Integer numberOfLocations;
    private Integer numberOfUsers;
    private Integer hrmsAccessCount;
    private Integer numberOfStore;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
}