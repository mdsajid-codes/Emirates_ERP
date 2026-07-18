package com.example.multi_tanent.accounts.dto.coa;

import com.example.multi_tanent.accounts.entity.enums.AccountBalanceType;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.enums.DimensionType;
import lombok.Data;

import java.util.List;

@Data
public class ChartOfAccountRequest {
    private String accountCode;
    private String description;
    private AccountBalanceType accountType;
    private AccountSection section;
    private String parentGroup;
    private Long parentId;
    private Boolean isOffBalance;
    private Boolean isQuantitative;
    private String currency;
    private String details;
    private List<DimensionRequest> dimensions;

    @Data
    public static class DimensionRequest {
        private DimensionType dimensionType;
        private Boolean trackAmount;
        private Boolean trackQuantitative;
        private Boolean turnoversOnly;
    }
}
