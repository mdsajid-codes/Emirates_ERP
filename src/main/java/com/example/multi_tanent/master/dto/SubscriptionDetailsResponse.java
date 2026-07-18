package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.entity.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDetailsResponse {
    private Integer numberOfLocations;
    private Integer numberOfUsers;
    private Integer hrmsAccessCount;
    private Integer numberOfStore;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private SubscriptionStatus status;

    public static SubscriptionDetailsResponse fromEntity(MasterTenant tenant) {
        return new SubscriptionDetailsResponse(
                tenant.getNumberOfLocations(),
                tenant.getNumberOfUsers(),
                tenant.getHrmsAccessCount(),
                tenant.getNumberOfStore(),
                tenant.getSubscriptionStartDate(),
                tenant.getSubscriptionEndDate(),
                tenant.getStatus());
    }
}