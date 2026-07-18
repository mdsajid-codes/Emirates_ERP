package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.enitity.OtherPerson;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OtherPersonResponse {
    private Long id;
    private Long partyId;
    private String salutation;
    private String firstName;
    private String lastName;
    private String emailAddress;
    private String workPhone;
    private String mobile;
    private String skypeNameOrNumber;
    private String designation;
    private String department;

    public static OtherPersonResponse fromEntity(OtherPerson entity) {
        return OtherPersonResponse.builder()
                .id(entity.getId())
                .partyId(entity.getParty() != null ? entity.getParty().getId() : null)
                .salutation(entity.getSalutation())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .emailAddress(entity.getEmailAddress())
                .workPhone(entity.getWorkPhone())
                .mobile(entity.getMobile())
                .skypeNameOrNumber(entity.getSkypeNameOrNumber())
                .designation(entity.getDesignation())
                .department(entity.getDepartment())
                .build();
    }
}