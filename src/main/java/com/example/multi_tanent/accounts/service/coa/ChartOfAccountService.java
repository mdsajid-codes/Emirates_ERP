package com.example.multi_tanent.accounts.service.coa;

import com.example.multi_tanent.accounts.dto.coa.ChartOfAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.ChartOfAccountResponse;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.enums.DimensionType;

import java.util.List;
import java.util.Map;

public interface ChartOfAccountService {
    ChartOfAccountResponse createAccount(ChartOfAccountRequest request, String createdBy);
    ChartOfAccountResponse updateAccount(Long id, ChartOfAccountRequest request, String updatedBy);
    ChartOfAccountResponse getById(Long id);
    ChartOfAccountResponse getByCode(String code);
    List<ChartOfAccountResponse> getAll();
    List<Map<String, Object>> getTree();
    List<ChartOfAccountResponse> getBySection(AccountSection section);
    List<ChartOfAccountResponse> getByParentGroup(String parentGroup);
    ChartOfAccountResponse activate(Long id, String updatedBy);
    ChartOfAccountResponse deactivate(Long id, String updatedBy);
    void delete(Long id);
    List<String> getSectionDropdown();
    List<String> getParentGroupDropdown();
    List<ChartOfAccountResponse> getAccountsForDimension(DimensionType dimensionType);
}
