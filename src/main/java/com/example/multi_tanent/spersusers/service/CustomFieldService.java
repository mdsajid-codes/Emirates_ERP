package com.example.multi_tanent.spersusers.service;

import com.example.multi_tanent.spersusers.dto.CustomFieldRequest;
import com.example.multi_tanent.spersusers.dto.CustomFieldResponse;
import com.example.multi_tanent.spersusers.enitity.*;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.CustomFieldRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CustomFieldService {

    private final CustomFieldRepository repository;
    private final PartyRepository partyRepository;

    public CustomFieldResponse create(CustomFieldRequest request) {
        CustomField entity = new CustomField();
        mapRequestToEntity(request, entity, null);
        return CustomFieldResponse.fromEntity(repository.save(entity));
    }

    public CustomFieldResponse update(Long id, CustomFieldRequest request) {
        CustomField entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CustomField not found with id: " + id));
        
        // The party shouldn't change on update.
        mapRequestToEntity(request, entity, null);
        return CustomFieldResponse.fromEntity(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public CustomFieldResponse getById(Long id) {
        return repository.findById(id)
                .map(CustomFieldResponse::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("CustomField not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<CustomFieldResponse> getByPartyId(Long partyId) {
        return repository.findByPartyId(partyId).stream()
                .map(CustomFieldResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("CustomField not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private void mapRequestToEntity(CustomFieldRequest request, CustomField entity, BaseCustomer party) {
        if (party != null) {
            entity.setParty(party);
        } else if (request.getPartyId() != null) {
            entity.setParty(partyRepository.findById(request.getPartyId())
                    .orElseThrow(() -> new EntityNotFoundException("Party not found: " + request.getPartyId())));
        }

        entity.setFieldName(request.getFieldName());
        entity.setFieldValue(request.getFieldValue());
    }
}