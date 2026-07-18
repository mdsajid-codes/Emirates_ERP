package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;
import java.util.List;

@Data
public class WeeklyOffPolicyRequest {
    private String code;
    private String name;
    private List<String> offDays;
    private Boolean rotate;
}