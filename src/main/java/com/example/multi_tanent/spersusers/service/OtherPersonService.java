package com.example.multi_tanent.spersusers.service;

import com.example.multi_tanent.spersusers.dto.OtherPersonRequest;
import com.example.multi_tanent.spersusers.dto.OtherPersonResponse;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.OtherPerson;
import com.example.multi_tanent.spersusers.repository.OtherPersonRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.example.multi_tanent.spersusers.repository.PartyRepository;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class OtherPersonService {

    private final OtherPersonRepository repository;
    private final PartyRepository partyRepository;

    public OtherPersonResponse create(OtherPersonRequest request) {
        OtherPerson entity = new OtherPerson();
        mapRequestToEntity(request, entity, null);

        return OtherPersonResponse.fromEntity(repository.save(entity));
    }

    public OtherPersonResponse update(Long id, OtherPersonRequest request) {
        OtherPerson entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("OtherPerson not found with id: " + id));

        mapRequestToEntity(request, entity, null);
        return OtherPersonResponse.fromEntity(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public OtherPersonResponse getById(Long id) {
        return repository.findById(id)
                .map(OtherPersonResponse::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("OtherPerson not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<OtherPersonResponse> getByPartyId(Long partyId) {
        return repository.findByPartyId(partyId).stream()
                .map(OtherPersonResponse::fromEntity)
                .collect(Collectors.toList());
    }
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("OtherPerson not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private void mapRequestToEntity(OtherPersonRequest request, OtherPerson entity, BaseCustomer party) {
        if (party != null) {
            entity.setParty(party);
        } else if (request.getPartyId() != null) {
            entity.setParty(partyRepository.findById(request.getPartyId())
                    .orElseThrow(() -> new EntityNotFoundException("Party not found: " + request.getPartyId())));
        }

        entity.setSalutation(request.getSalutation());
        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setEmailAddress(request.getEmailAddress());
        entity.setWorkPhone(request.getWorkPhone());
        entity.setMobile(request.getMobile());
        entity.setSkypeNameOrNumber(request.getSkypeNameOrNumber());
        entity.setDesignation(request.getDesignation());
        entity.setDepartment(request.getDepartment());
    }
}