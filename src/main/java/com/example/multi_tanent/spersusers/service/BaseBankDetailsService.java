package com.example.multi_tanent.spersusers.service;

import com.example.multi_tanent.spersusers.dto.BaseBankDetailsRequest;
import com.example.multi_tanent.spersusers.dto.BaseBankDetailsResponse;
import com.example.multi_tanent.spersusers.enitity.*;
import com.example.multi_tanent.spersusers.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class BaseBankDetailsService {

    private final BaseBankDetailsRepository repository;
    private final PartyRepository partyRepository;

    public BaseBankDetailsResponse create(BaseBankDetailsRequest request) {
        BaseBankDetails entity = new BaseBankDetails();
        mapRequestToEntity(request, entity, null);
        return BaseBankDetailsResponse.fromEntity(repository.save(entity));
    }

    public BaseBankDetailsResponse update(Long id, BaseBankDetailsRequest request) {
        BaseBankDetails entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bank Detail not found with id: " + id));
        
        // The party shouldn't change on update, so we pass null for the party.
        // The mapping logic will only update the bank detail fields.
        mapRequestToEntity(request, entity, null);
        return BaseBankDetailsResponse.fromEntity(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public BaseBankDetailsResponse getById(Long id) {
        return repository.findById(id)
                .map(BaseBankDetailsResponse::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Bank Detail not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<BaseBankDetailsResponse> getByPartyId(Long partyId) {
        return repository.findByPartyId(partyId).stream()
                .map(BaseBankDetailsResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Bank Detail not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private void mapRequestToEntity(BaseBankDetailsRequest request, BaseBankDetails entity, BaseCustomer party) {
        if (party != null) {
            entity.setParty(party);
        } else if (request.getPartyId() != null) {
            entity.setParty(partyRepository.findById(request.getPartyId())
                    .orElseThrow(() -> new EntityNotFoundException("Party not found: " + request.getPartyId())));
        }
        entity.setBankName(request.getBankName());
        entity.setAccountNumber(request.getAccountNumber());
        entity.setIfsCode(request.getIfsCode());
        entity.setIbanCode(request.getIbanCode());
        entity.setCorporateId(request.getCorporateId());
        entity.setLocationBranch(request.getLocationBranch());
        entity.setBranchAddress(request.getBranchAddress());
        entity.setBeneficiaryMailId(request.getBeneficiaryMailId());
    }
}