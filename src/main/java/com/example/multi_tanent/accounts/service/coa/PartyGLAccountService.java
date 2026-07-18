package com.example.multi_tanent.accounts.service.coa;

import com.example.multi_tanent.accounts.dto.coa.PartyGLAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.PartyGLAccountResponse;
import com.example.multi_tanent.accounts.entity.enums.PartyType;

import java.util.List;

public interface PartyGLAccountService {
    PartyGLAccountResponse save(PartyGLAccountRequest request);
    PartyGLAccountResponse getByTypeAndId(PartyType partyType, Long partyId);
    List<PartyGLAccountResponse> getAll();
    void delete(Long id);
}
